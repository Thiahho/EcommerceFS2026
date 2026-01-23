using System.Text;
using EcommerceFS2026.Api.Models.Admin;
using EcommerceFS2026.Domain.Enums;
using EcommerceFS2026.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommerceFS2026.Api.Controllers.Admin;

[ApiController]
[Authorize]
[Route("api/admin/orders")]
public class OrdersAdminController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public OrdersAdminController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Empleado")]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search, CancellationToken cancellationToken)
    {
        var query = _dbContext.Orders
            .AsNoTracking()
            .Include(order => order.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(order => order.Status == parsedStatus);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(order =>
                order.CustomerName.ToLower().Contains(term) ||
                order.CustomerEmail.ToLower().Contains(term) ||
                order.CustomerDni.ToLower().Contains(term) ||
                order.Id.ToString().Contains(term));
        }

        var orders = await query
            .OrderByDescending(order => order.CreatedAt)
            .Select(order => new AdminOrderListDto
            {
                Id = order.Id,
                CustomerName = order.CustomerName,
                CustomerEmail = order.CustomerEmail,
                Status = order.Status.ToString(),
                Currency = order.Currency,
                TotalAmount = order.TotalAmount,
                PaymentStatus = order.PaymentStatus,
                CreatedAt = order.CreatedAt,
                ItemsCount = order.Items.Count
            })
            .ToListAsync(cancellationToken);

        return Ok(orders);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Empleado")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var order = await _dbContext.Orders
            .AsNoTracking()
            .Include(item => item.Items)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (order is null)
        {
            return NotFound();
        }

        var detail = new AdminOrderDetailDto
        {
            Id = order.Id,
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            CustomerPhone = order.CustomerPhone,
            CustomerDni = order.CustomerDni,
            ShippingAddress = order.ShippingAddress,
            ShippingCity = order.ShippingCity,
            ShippingPostalCode = order.ShippingPostalCode,
            Status = order.Status.ToString(),
            Currency = order.Currency,
            TotalAmount = order.TotalAmount,
            PaymentProvider = order.PaymentProvider,
            PaymentStatus = order.PaymentStatus,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            Items = order.Items.Select(item => new AdminOrderItemDto
            {
                Id = item.Id,
                ProductVariantId = item.ProductVariantId,
                ProductName = item.ProductName,
                UnitPrice = item.UnitPrice,
                Quantity = item.Quantity
            }).ToList()
        };

        return Ok(detail);
    }

    [HttpGet("{id:int}/pdf")]
    [Authorize(Roles = "Admin,Empleado")]
    public async Task<IActionResult> DownloadPdf(int id, CancellationToken cancellationToken)
    {
        var order = await _dbContext.Orders
            .AsNoTracking()
            .Include(item => item.Items)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (order is null)
        {
            return NotFound();
        }

        var detail = new AdminOrderDetailDto
        {
            Id = order.Id,
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            CustomerPhone = order.CustomerPhone,
            CustomerDni = order.CustomerDni,
            ShippingAddress = order.ShippingAddress,
            ShippingCity = order.ShippingCity,
            ShippingPostalCode = order.ShippingPostalCode,
            Status = order.Status.ToString(),
            Currency = order.Currency,
            TotalAmount = order.TotalAmount,
            PaymentProvider = order.PaymentProvider,
            PaymentStatus = order.PaymentStatus,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            Items = order.Items.Select(item => new AdminOrderItemDto
            {
                Id = item.Id,
                ProductVariantId = item.ProductVariantId,
                ProductName = item.ProductName,
                UnitPrice = item.UnitPrice,
                Quantity = item.Quantity
            }).ToList()
        };

        var fileBytes = BuildOrderPdf(detail);
        return File(fileBytes, "application/pdf", $"orden-{order.Id}.pdf");
    }

    private static byte[] BuildOrderPdf(AdminOrderDetailDto order)
    {
        var lines = new List<string>
        {
            $"Orden #{order.Id}",
            $"Estado: {order.Status}",
            $"Fecha: {order.CreatedAt:yyyy-MM-dd HH:mm}",
            $"Cliente: {order.CustomerName}",
            $"Email: {order.CustomerEmail}",
            $"Teléfono: {order.CustomerPhone}",
            $"DNI: {order.CustomerDni}",
            $"Envío: {order.ShippingAddress}, {order.ShippingCity} ({order.ShippingPostalCode})",
            $"Pago: {order.PaymentProvider ?? "N/D"} - {order.PaymentStatus ?? "N/D"}",
            $"Total: {order.Currency} {order.TotalAmount:N2}",
            "Items:"
        };

        lines.AddRange(order.Items.Select(item =>
            $"{item.ProductName} x{item.Quantity} - {order.Currency} {item.UnitPrice:N2}"));

        var contentBuilder = new StringBuilder();
        contentBuilder.AppendLine("BT");
        contentBuilder.AppendLine("/F1 12 Tf");
        contentBuilder.AppendLine("50 750 Td");
        foreach (var line in lines)
        {
            var sanitized = line
                .Replace("\\", "\\\\")
                .Replace("(", "\\(")
                .Replace(")", "\\)");
            contentBuilder.AppendLine($"({sanitized}) Tj");
            contentBuilder.AppendLine("0 -18 Td");
        }
        contentBuilder.AppendLine("ET");

        var content = contentBuilder.ToString();
        var contentBytes = Encoding.Latin1.GetBytes(content);

        using var memoryStream = new MemoryStream();
        WriteString(memoryStream, "%PDF-1.4\n");

        var offsets = new List<long>();
        void WriteObject(int id, string body)
        {
            offsets.Add(memoryStream.Position);
            WriteString(memoryStream, $"{id} 0 obj\n{body}\nendobj\n");
        }

        WriteObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
        WriteObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
        WriteObject(3,
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>");
        offsets.Add(memoryStream.Position);
        WriteString(memoryStream, "4 0 obj\n<< /Length ");
        WriteString(memoryStream, contentBytes.Length.ToString());
        WriteString(memoryStream, " >>\nstream\n");
        memoryStream.Write(contentBytes, 0, contentBytes.Length);
        WriteString(memoryStream, "\nendstream\nendobj\n");
        WriteObject(5, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

        var xrefPosition = memoryStream.Position;
        WriteString(memoryStream, "xref\n0 6\n0000000000 65535 f \n");
        WriteString(memoryStream, $"{offsets[0]:0000000000} 00000 n \n");
        WriteString(memoryStream, $"{offsets[1]:0000000000} 00000 n \n");
        WriteString(memoryStream, $"{offsets[2]:0000000000} 00000 n \n");
        WriteString(memoryStream, $"{offsets[3]:0000000000} 00000 n \n");
        WriteString(memoryStream, $"{offsets[4]:0000000000} 00000 n \n");

        WriteString(memoryStream, "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n");
        WriteString(memoryStream, xrefPosition.ToString());
        WriteString(memoryStream, "\n%%EOF");

        return memoryStream.ToArray();
    }

    private static void WriteString(Stream stream, string content)
    {
        var bytes = Encoding.Latin1.GetBytes(content);
        stream.Write(bytes, 0, bytes.Length);
    }
}
