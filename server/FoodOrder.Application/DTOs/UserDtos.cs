namespace FoodOrder.Application.DTOs;

public record UserDto(int Id, string Phone, string? Name, string? Email);

public record UpdateProfileRequest(string? Name, string? Email);
