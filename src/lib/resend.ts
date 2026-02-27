import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = "RJ Music <orders@rjmusic.shop>";

interface OrderItem {
  product_name: string;
  quantity: number;
  product_price: number;
  subtotal: number;
}

interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
}

export function buildOrderConfirmationHtml(data: OrderConfirmationData): string {
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;">${item.product_name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:center;">x${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:right;">${formatPrice(item.subtotal)}</td>
      </tr>`
    )
    .join("");

  const paymentLabel: Record<string, string> = {
    cod: "Cash on Delivery",
    gcash: "GCash",
    card: "Credit/Debit Card",
    paymaya: "PayMaya",
  };

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;color:#e5e5e5;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#136DEC;font-size:28px;margin:0;letter-spacing:-1px;">RJ MUSIC</h1>
      <p style="color:#888;margin:4px 0 0;">Musical Accessories & Studio Gear</p>
    </div>

    <!-- Success Banner -->
    <div style="background:#136DEC15;border:1px solid #136DEC40;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;margin-bottom:8px;">✅</div>
      <h2 style="margin:0 0 8px;font-size:22px;">Order Confirmed!</h2>
      <p style="margin:0;color:#aaa;">Thank you, ${data.customerName}. Your order has been placed.</p>
      <p style="margin:8px 0 0;font-size:18px;font-weight:bold;color:#136DEC;">Order #${data.orderNumber}</p>
    </div>

    <!-- Items -->
    <div style="background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:16px;">
      <h3 style="margin:0 0 16px;font-size:14px;color:#888;text-transform:uppercase;letter-spacing:1px;">Order Items</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:0 0 8px;border-bottom:1px solid #2a2a2a;color:#888;font-weight:normal;">Product</th>
            <th style="text-align:center;padding:0 0 8px;border-bottom:1px solid #2a2a2a;color:#888;font-weight:normal;">Qty</th>
            <th style="text-align:right;padding:0 0 8px;border-bottom:1px solid #2a2a2a;color:#888;font-weight:normal;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="margin-top:12px;text-align:right;font-size:14px;color:#aaa;">
        <div>Subtotal: ${formatPrice(data.subtotal)}</div>
        <div>Shipping: ${data.shippingFee === 0 ? '<span style="color:#22c55e;">Free</span>' : formatPrice(data.shippingFee)}</div>
        <div style="font-size:18px;font-weight:bold;color:#e5e5e5;margin-top:8px;">Total: ${formatPrice(data.total)}</div>
      </div>
    </div>

    <!-- Delivery & Payment -->
    <div style="display:flex;gap:16px;margin-bottom:16px;">
      <div style="flex:1;background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:20px;">
        <h3 style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Delivery Address</h3>
        <p style="margin:0;font-size:14px;line-height:1.6;">${data.shippingAddress}</p>
      </div>
      <div style="flex:1;background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:20px;">
        <h3 style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Payment</h3>
        <p style="margin:0;font-size:14px;">${paymentLabel[data.paymentMethod] ?? data.paymentMethod}</p>
      </div>
    </div>

    <!-- Note -->
    <div style="background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:14px;color:#aaa;">
        We will reach out to confirm your order and delivery schedule.<br>
        You can also track your order at <a href="https://rjmusic.shop/profile/purchases" style="color:#136DEC;">rjmusic.shop</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#555;font-size:12px;">
      <p style="margin:0;">© 2025 RJ Music · Balingasag, Misamis Oriental</p>
      <p style="margin:4px 0 0;">
        <a href="https://www.facebook.com/profile.php?id=61584616634834" style="color:#136DEC;text-decoration:none;">Facebook</a>
        &nbsp;·&nbsp;
        <a href="https://rjmusic.shop" style="color:#136DEC;text-decoration:none;">rjmusic.shop</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
