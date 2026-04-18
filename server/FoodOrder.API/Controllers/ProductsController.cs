using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrder.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(IProductService productService) : ControllerBase
{
    /// <summary>
    /// Получить список товаров с опциональной фильтрацией по категории и полнотекстовым поиском.
    /// </summary>
    /// <param name="categoryId">ID категории для фильтрации (необязательно).</param>
    /// <param name="search">Строка поиска по названию товара (необязательно, ILike).</param>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int? categoryId,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        var products = await productService.GetProductsAsync(categoryId, search, ct);
        return Ok(products);
    }

    /// <summary>Получить детали конкретного товара: размеры, добавки, ингредиенты и рекомендации.</summary>
    /// <param name="id">ID товара.</param>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProduct(int id, CancellationToken ct)
    {
        var product = await productService.GetProductByIdAsync(id, ct);
        return product is null ? NotFound() : Ok(product);
    }

    /// <summary>Получить список популярных товаров (используется на главной / в блоках рекомендаций).</summary>
    /// <param name="count">Количество товаров (по умолчанию 6).</param>
    [HttpGet("popular")]
    [ProducesResponseType(typeof(IReadOnlyList<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPopular([FromQuery] int count = 6, CancellationToken ct = default)
    {
        var products = await productService.GetPopularAsync(count, ct);
        return Ok(products);
    }
}
