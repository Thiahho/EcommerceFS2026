using DrCell.Domain.Enums;

namespace DrCell.Domain.Entities;

public class Promotion : Entity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PromotionType Type { get; set; } = PromotionType.Percentage;
    public decimal Value { get; set; }
    public string? Code { get; set; }
    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset EndsAt { get; set; }
    public bool Active { get; set; } = true;
    public bool Combinable { get; set; }

    public ICollection<PromotionProduct> PromotionProducts { get; set; } = new List<PromotionProduct>();
}
