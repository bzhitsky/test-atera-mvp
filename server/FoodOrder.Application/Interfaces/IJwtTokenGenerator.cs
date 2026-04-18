namespace FoodOrder.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(int userId, string phone);
}
