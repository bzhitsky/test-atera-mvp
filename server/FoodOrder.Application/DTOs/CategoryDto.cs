namespace FoodOrder.Application.DTOs;

public record CategoryDto(int Id, string Name, string? ImageUrl, int SortOrder);
