using MercadoPago.Client;
using MercadoPago.Client.PaymentMethod;
using MercadoPago.Config;
using MercadoPago.Resource;
using MercadoPago.Resource.PaymentMethod;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceFS2026.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public PaymentsController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("methods")]
    public async Task<IActionResult> GetPaymentMethods()
    {
        var accessToken = _configuration["MercadoPago:AccessToken"];
        if (string.IsNullOrWhiteSpace(accessToken))
            return BadRequest("Falta configurar MercadoPago:AccessToken.");

        MercadoPagoConfig.AccessToken = accessToken;

        var requestOptions = new RequestOptions
        {
            AccessToken = accessToken
        };

        var client = new PaymentMethodClient();
        ResourcesList<PaymentMethod> paymentMethods = await client.ListAsync(requestOptions);

        return Ok(paymentMethods);
    }
}
