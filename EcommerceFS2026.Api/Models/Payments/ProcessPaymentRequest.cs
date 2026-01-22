namespace EcommerceFS2026.Api.Models.Payments;

public record ProcessPaymentRequest(
    int OrderId,
    string Token,
    string PaymentMethodId,
    int Installments,
    decimal TransactionAmount,
    string Email,
    string Description);
