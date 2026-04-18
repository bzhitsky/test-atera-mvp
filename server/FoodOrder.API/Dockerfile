FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY FoodOrder.Domain/FoodOrder.Domain.csproj FoodOrder.Domain/
COPY FoodOrder.Application/FoodOrder.Application.csproj FoodOrder.Application/
COPY FoodOrder.Infrastructure/FoodOrder.Infrastructure.csproj FoodOrder.Infrastructure/
COPY FoodOrder.API/FoodOrder.API.csproj FoodOrder.API/

RUN dotnet restore FoodOrder.API/FoodOrder.API.csproj

COPY . .

RUN dotnet publish FoodOrder.API/FoodOrder.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "FoodOrder.API.dll"]
