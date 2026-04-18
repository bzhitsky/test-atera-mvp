# Food Order Platform

Платформа онлайн-заказа еды. Desktop — SPA с модальными окнами. Mobile — отдельные страницы.

## Стек

| Часть | Технология |
|-------|------------|
| Frontend | Angular 19, Angular CDK/Material, SignalR client |
| Backend | ASP.NET Core 9, Entity Framework Core 9, SignalR |
| БД | PostgreSQL 16 |
| Инфра | Docker Compose |

## Быстрый старт

### Локальная разработка

**Backend:**
```bash
# Требует .NET 9 SDK
cd server
dotnet run --project FoodOrder.API
```

**Frontend:**
```bash
cd client
npm install
npm start   # http://localhost:4200, прокси на :5000
```

### Docker Compose (всё сразу)

```bash
docker compose up --build
```

- Frontend: http://localhost:4200  
- API: http://localhost:5000  
- Swagger: http://localhost:5000/swagger  
- PostgreSQL: localhost:5432

## Структура проекта

```
├── client/                   # Angular 19 SPA
│   ├── src/app/
│   │   ├── core/             # Services, Guards, Interceptors, Models
│   │   ├── shared/           # Переиспользуемые компоненты и пайпы
│   │   ├── features/         # Feature-модули (menu, product, cart, ...)
│   │   └── layout/           # DesktopShell / MobileShell
│   ├── proxy.conf.json       # Dev-прокси на API
│   └── nginx.conf            # Nginx для prod-контейнера
│
├── server/                   # ASP.NET Core 9
│   ├── FoodOrder.API/        # Контроллеры, SignalR Hub, Program.cs
│   ├── FoodOrder.Application/# Сервисы, DTO, Interfaces
│   ├── FoodOrder.Domain/     # Сущности (чистый домен)
│   └── FoodOrder.Infrastructure/ # EF Core, репозитории
│
└── docker-compose.yml
```

## Переменные окружения (API)

| Переменная | Описание |
|------------|----------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string |
| `Jwt__Key` | Секрет для подписи JWT (мин. 32 символа) |
| `Jwt__Issuer` | Издатель токена |
| `Jwt__Audience` | Аудитория токена |
| `AllowedOrigins__0` | CORS origin для фронта |
| `Otp__MockEnabled` | `true` — мок OTP (dev режим) |
| `Otp__MockCode` | Код для мок-аутентификации (по умолчанию `1234`) |
