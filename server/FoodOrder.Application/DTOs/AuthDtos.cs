namespace FoodOrder.Application.DTOs;

public record SendOtpRequest(string Phone);

public record VerifyOtpRequest(string Phone, string Code);

public record AuthResponse(string Token, UserDto User, bool IsNewUser);
