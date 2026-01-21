using EcommerceFS2026.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceFS2026.Domain.Entities;

[Table("promotions")]
public class Promotion : Entity
{
    [Column("id")]
    public Guid Id { get; set; }
    [Column("name")]
    public string Name { get; set; } = string.Empty;
    [Column("description")]
    public string Description { get; set; } = string.Empty;
    [Column("type")]
    public PromotionType Type { get; set; } = PromotionType.Percentage;
    [Column("value")]
    public decimal Value { get; set; }

    [Column("code")]
    public string? Code { get; set; }
    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
    [Column("ends_at")]
    public DateTimeOffset EndsAt { get; set; }

    [Column("active")]
    public bool Active { get; set; } = true;

    [Column("combinable")]
    public bool Combinable { get; set; }

    public ICollection<PromotionProduct> PromotionProducts { get; set; } = new List<PromotionProduct>();
}
