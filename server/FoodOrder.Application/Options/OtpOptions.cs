namespace FoodOrder.Application.Options;

public class OtpOptions
{
    public int ExpiryMinutes { get; set; } = 5;
    public bool MockEnabled { get; set; } = false;
    public string MockCode { get; set; } = "1234";
}
