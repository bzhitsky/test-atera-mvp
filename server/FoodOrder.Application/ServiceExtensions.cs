using Microsoft.Extensions.DependencyInjection;
using FoodOrder.Application.Interfaces;
using FoodOrder.Application.Services;

namespace FoodOrder.Application;

public static class ServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAddressService, AddressService>();

        return services;
    }
}
