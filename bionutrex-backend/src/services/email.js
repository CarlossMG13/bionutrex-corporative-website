import { Resend } from "resend";

import logger from "../utils/logger.js";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

logger.info(`[email] Resend client ${resend ? "initialized" : "not initialized (RESEND_API_KEY missing)"}`);

// En desarrollo usa onboarding@resend.dev (no requiere dominio verificado).
// En producción cambia a tu dominio verificado: "Bionutrex <noreply@tudominio.com>"
const FROM =
  process.env.NODE_ENV === "production"
    ? `Bionutrex <noreply@${process.env.RESEND_FROM_DOMAIN}>`
    : "Bionutrex <onboarding@resend.dev>";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function safe(fn, label) {
  try {
    const result = await fn();
    // Resend client returns `{ data, error }` instead of throwing on API errors
    if (result && result.error) {
      logger.warn(`[email] ${label} returned error: ${result.error?.message || JSON.stringify(result.error)}`);
      logger.debug(result.error);
    } else {
      logger.info(`[email] ${label} success`, { id: result?.data?.id });
    }
    return result;
  } catch (err) {
    logger.error(`[email] ${label} failed (non-blocking): ${err.message}`);
    logger.debug(err.stack);
  }
}

// ─── Templates ──────────────────────────────────────────────────────────────

function welcomeHtml(name) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Bienvenido a Bionutrex</title></head>
<body style="margin:0;padding:0;background:#EEEEEE;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EEEEEE;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">
        <!-- Header -->
        <tr>
          <td style="background:#0d40a5;padding:32px 40px;text-align:center;">
            <span style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-1px;font-style:italic;text-transform:uppercase;">
              ⚡ Bionutrex
            </span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#111;">
              Bienvenido${name ? `, ${name}` : ""}
            </h1>
            <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
              Tu cuenta en <strong>Bionutrex</strong> ha sido verificada exitosamente.
              Ahora puedes comprar, guardar favoritos y consultar tus pedidos.
            </p>
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/catalogo"
               style="display:inline-block;background:#0d40a5;color:#fff;font-weight:900;
                      font-size:13px;letter-spacing:1px;text-transform:uppercase;
                      padding:14px 32px;border-radius:10px;text-decoration:none;">
              Explorar productos
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f5;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#aaa;">
              © ${new Date().getFullYear()} Bionutrex · Alto rendimiento deportivo
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function orderConfirmationHtml(order) {
  const itemRows = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">
          ${item.product?.name || "Producto"} <span style="color:#999;">×${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#0d40a5;font-weight:900;text-align:right;">
          $${(Number(item.price) * item.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const orderId = order.paymentIntentId?.slice(-8).toUpperCase() ?? String(order.id);

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Confirmación de pedido</title></head>
<body style="margin:0;padding:0;background:#EEEEEE;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EEEEEE;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">
        <!-- Header -->
        <tr>
          <td style="background:#0d40a5;padding:32px 40px;text-align:center;">
            <span style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-1px;font-style:italic;text-transform:uppercase;">
              ⚡ Bionutrex
            </span>
            <p style="margin:8px 0 0;color:#00e5ff;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
              Pedido Confirmado
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 6px;font-size:14px;color:#888;">Hola, <strong style="color:#111;">${order.fullName}</strong></p>
            <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.6;">
              Recibimos tu pedido y está siendo procesado. Aquí está tu resumen:
            </p>

            <!-- Order ID -->
            <div style="background:#f8f9ff;border-radius:10px;padding:16px 20px;margin-bottom:24px;text-align:center;">
              <p style="margin:0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Número de pedido</p>
              <p style="margin:4px 0 0;font-size:24px;font-weight:900;color:#0d40a5;letter-spacing:2px;">#${orderId}</p>
            </div>

            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0">
              ${itemRows}
              <tr>
                <td style="padding:14px 0 0;font-size:15px;font-weight:900;color:#111;">Total pagado</td>
                <td style="padding:14px 0 0;font-size:18px;font-weight:900;color:#0d40a5;text-align:right;">
                  $${Number(order.total).toFixed(2)} MXN
                </td>
              </tr>
            </table>

            <!-- Shipping -->
            <div style="margin-top:28px;background:#f0f6ff;border-radius:10px;padding:16px 20px;">
              <p style="margin:0 0 6px;font-size:10px;color:#0d40a5;text-transform:uppercase;letter-spacing:2px;font-weight:900;">Envío a</p>
              <p style="margin:0;font-size:14px;color:#333;font-weight:700;">${order.fullName}</p>
              <p style="margin:2px 0 0;font-size:13px;color:#666;">${order.address}${order.city ? ", " + order.city : ""}${order.state ? ", " + order.state : ""}</p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f5;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#aaa;">
              © ${new Date().getFullYear()} Bionutrex · Si tienes dudas responde este correo
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email, name) {
  if (!resend) {
    logger.warn("[email] sendWelcomeEmail skipped: RESEND client not initialized");
    return;
  }

  const to = (email || "").toString().trim();
  if (!to) {
    logger.warn("[email] sendWelcomeEmail skipped: missing recipient email");
    return;
  }

  logger.info(`[email] sendWelcomeEmail sending to ${to}`);
  return safe(
    () =>
      resend.emails.send({
        from: FROM,
        to,
        subject: "Bienvenido a Bionutrex ⚡",
        html: welcomeHtml(name),
      }),
    "sendWelcomeEmail"
  );
}

export async function sendOrderConfirmationEmail(order) {
  if (!resend) {
    logger.warn("[email] sendOrderConfirmationEmail skipped: RESEND client not initialized");
    return;
  }

  const recipientEmail = (order?.email || "").toString().trim();
  if (!recipientEmail) {
    logger.warn(`[email] sendOrderConfirmationEmail skipped: no recipient email for order ${order?.id}`);
    return;
  }

  logger.info(`[email] sendOrderConfirmationEmail sending to ${recipientEmail} for order ${order?.id}`);
  return safe(
    () =>
      resend.emails.send({
        from: FROM,
        to: recipientEmail,
        subject: `Pedido confirmado #${(order.paymentIntentId?.slice(-8) ?? order.id).toString().toUpperCase()} — Bionutrex`,
        html: orderConfirmationHtml(order),
      }),
    "sendOrderConfirmationEmail"
  );
}
