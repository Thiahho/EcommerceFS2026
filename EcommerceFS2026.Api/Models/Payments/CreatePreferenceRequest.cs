namespace EcommerceFS2026.Api.Models.Payments;

public record CreatePreferenceRequest(
    List<PreferenceItemDto> Items,
    PreferenceBackUrlsDto BackUrls);

public record PreferenceItemDto(
    string Title,
    int Quantity,
    string CurrencyId,
    string? PictureUrl,
    decimal UnitPrice);

public record PreferenceBackUrlsDto(
    string Success,
    string Failure,
    string Pending);
