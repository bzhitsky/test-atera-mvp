using FoodOrder.Application.DTOs;
using FoodOrder.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrder.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, IUserService userService) : ControllerBase
{
    /// <summary>Отправить OTP на указанный номер телефона.</summary>
    [HttpPost("send-otp")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request, CancellationToken ct)
    {
        if (!IsValidPhone(request.Phone))
            return BadRequest(new { message = "Invalid phone number format" });

        await authService.SendOtpAsync(request.Phone, ct);
        return Ok(new { message = "OTP sent successfully" });
    }

    /// <summary>Проверить OTP и получить JWT токен вместе с профилем пользователя.</summary>
    [HttpPost("verify-otp")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request, CancellationToken ct)
    {
        try
        {
            var (token, userId, isNewUser) = await authService.VerifyOtpAsync(request.Phone, request.Code, ct);
            var user = await userService.GetProfileAsync(userId, ct)
                ?? throw new InvalidOperationException("User not found after verification");
            return Ok(new AuthResponse(token, user, isNewUser));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    private static bool IsValidPhone(string phone) =>
        !string.IsNullOrWhiteSpace(phone) && phone.Length is >= 10 and <= 20;
}
