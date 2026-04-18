using System.Security.Claims;
using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrder.API.Controllers;

[ApiController]
[Route("api/addresses")]
[Authorize]
public class AddressesController(IAddressService addressService) : ControllerBase
{
    private int CurrentUserId => int.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("User identity not found in token"));

    /// <summary>Получить сохранённые адреса текущего пользователя.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AddressDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAddresses(CancellationToken ct)
    {
        var addresses = await addressService.GetAddressesAsync(CurrentUserId, ct);
        return Ok(addresses);
    }

    /// <summary>Добавить новый адрес.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(AddressDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateAddress([FromBody] UpsertAddressRequest request, CancellationToken ct)
    {
        var address = await addressService.CreateAddressAsync(CurrentUserId, request, ct);
        return StatusCode(StatusCodes.Status201Created, address);
    }

    /// <summary>Обновить адрес.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(AddressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAddress(int id, [FromBody] UpsertAddressRequest request, CancellationToken ct)
    {
        try
        {
            var address = await addressService.UpdateAddressAsync(id, CurrentUserId, request, ct);
            return Ok(address);
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    /// <summary>Удалить адрес.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAddress(int id, CancellationToken ct)
    {
        try
        {
            await addressService.DeleteAddressAsync(id, CurrentUserId, ct);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }
}
