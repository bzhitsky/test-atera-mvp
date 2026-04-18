using System.Security.Claims;
using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;
using FoodOrder.API.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace FoodOrder.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController(
    IOrderService orderService,
    IHubContext<OrderStatusHub> hubContext) : ControllerBase
{
    private int CurrentUserId => int.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("User identity not found in token"));

    /// <summary>Получить список заказов текущего пользователя.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<OrderDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders(CancellationToken ct)
    {
        var orders = await orderService.GetUserOrdersAsync(CurrentUserId, ct);
        return Ok(orders);
    }

    /// <summary>Получить конкретный заказ по ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrder(int id, CancellationToken ct)
    {
        var order = await orderService.GetOrderAsync(id, CurrentUserId, ct);
        return order is null ? NotFound() : Ok(order);
    }

    /// <summary>Создать новый заказ (оформление из корзины).</summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken ct)
    {
        try
        {
            var order = await orderService.CreateOrderAsync(request, CurrentUserId, ct);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Обновить статус заказа (для оператора/администратора).</summary>
    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(
        int id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
    {
        try
        {
            var order = await orderService.UpdateStatusAsync(id, request.Status, request.Note, ct);
            await hubContext.Clients
                .Group($"order-{id}")
                .SendAsync("OrderStatusUpdated", order, ct);
            return Ok(order);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>Оставить отзыв на доставленный заказ.</summary>
    [HttpPost("{id:int}/review")]
    [ProducesResponseType(typeof(OrderReviewDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateReview(
        int id, [FromBody] CreateReviewRequest request, CancellationToken ct)
    {
        try
        {
            var review = await orderService.CreateReviewAsync(id, CurrentUserId, request, ct);
            return StatusCode(StatusCodes.Status201Created, review);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
