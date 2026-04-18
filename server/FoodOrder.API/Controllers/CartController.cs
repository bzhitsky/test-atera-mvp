using System.Security.Claims;
using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrder.API.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController(ICartService cartService) : ControllerBase
{
    private int CurrentUserId => int.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("User identity not found in token"));

    /// <summary>Получить корзину текущего пользователя (серверная копия).</summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCart(CancellationToken ct)
    {
        var cart = await cartService.GetCartAsync(CurrentUserId, ct);
        return Ok(cart);
    }

    /// <summary>Сохранить (заменить) корзину текущего пользователя на сервере.</summary>
    [HttpPut]
    [Authorize]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> SaveCart([FromBody] SaveCartRequest request, CancellationToken ct)
    {
        var cart = await cartService.SaveCartAsync(CurrentUserId, request.Items, ct);
        return Ok(cart);
    }

    /// <summary>
    /// Валидация корзины: проверить актуальность цен и доступность товаров.
    /// Доступен без авторизации (для гостевой корзины).
    /// </summary>
    [HttpPost("validate")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CartValidateResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ValidateCart([FromBody] CartValidateRequest request, CancellationToken ct)
    {
        var result = await cartService.ValidateCartAsync(request.Items, ct);
        return Ok(result);
    }
}
