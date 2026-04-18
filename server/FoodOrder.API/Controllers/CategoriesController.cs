using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrder.API.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    /// <summary>Получить список всех категорий меню, отсортированных по полю SortOrder.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var categories = await categoryService.GetCategoriesAsync(ct);
        return Ok(categories);
    }
}
