namespace FoodOrder.Application.DTOs;

public record AddressDto(
    int Id,
    string? Label,
    string Street,
    string? Apartment,
    string? Entrance,
    string? Floor,
    string? Intercom,
    string? Comment,
    double? Latitude,
    double? Longitude
);

public record UpsertAddressRequest(
    string? Label,
    string Street,
    string? Apartment,
    string? Entrance,
    string? Floor,
    string? Intercom,
    string? Comment,
    double? Latitude,
    double? Longitude
);
