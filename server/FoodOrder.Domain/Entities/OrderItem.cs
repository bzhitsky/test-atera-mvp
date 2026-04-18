namespace FoodOrder.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }

    /// <summary>Snapshot of product name at order time</summary>
    public string ProductName { get; set; } = string.Empty;

    /// <summary>Snapshot of image at order time</summary>
    public string? ImageUrl { get; set; }

    public string? SizeLabel { get; set; }
    public int Quantity { get; set; }

    /// <summary>Unit price at order time (including size delta and addons)</summary>
    public decimal UnitPrice { get; set; }

    /// <summary>JSON array of addon names at order time, e.g. ["Двойной сыр","Бекон"]</summary>
    public string? AddonsJson { get; set; }

    /// <summary>JSON array of removed ingredient names, e.g. ["Лук","Огурец"]</summary>
    public string? RemovedIngredientsJson { get; set; }

    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
