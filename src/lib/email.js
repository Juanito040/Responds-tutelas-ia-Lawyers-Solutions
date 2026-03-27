// Servicio de email con Nodemailer + Gmail SMTP
// App Password configurada en EMAIL_PASS (no usar contraseña normal de Gmail)

import nodemailer from "nodemailer";

function getTransport() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) throw new Error("EMAIL_USER o EMAIL_PASS no configurados");

  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST ?? "smtp.gmail.com",
    port:   Number(process.env.EMAIL_PORT ?? 465),
    secure: true, // SSL en puerto 465
    auth: { user, pass },
  });
}

const FROM = process.env.EMAIL_FROM ?? `TutelaIA <${process.env.EMAIL_USER}>`;

// ─── Plantillas HTML ──────────────────────────────────────────────────────────

function templateAlertaVencimiento(casos) {
  const filas = casos.map(c => {
    const color  = c.diasRestantes === 0 ? "#C0392B" : c.diasRestantes <= 3 ? "#E67E22" : "#2980B9";
    const estado = c.diasRestantes === 0 ? "¡VENCIDA HOY!" : `Vence en ${c.diasRestantes} día${c.diasRestantes === 1 ? "" : "s"} hábil${c.diasRestantes === 1 ? "" : "es"}`;
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;">
          <strong>${c.accionante}</strong><br/>
          <span style="color:#666;font-size:13px;">vs. ${c.accionado}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;color:${color};font-weight:bold;white-space:nowrap;">
          ${estado}
        </td>
      </tr>`;
  }).join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#2C3E50;padding:24px 32px;">
            <h1 style="margin:0;color:#fff;font-size:20px;">⚖️ TutelaIA — Alerta de vencimiento</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 16px;color:#444;">
              Tienes <strong>${casos.length} tutela${casos.length > 1 ? "s" : ""}</strong> con plazo próximo a vencer.
              Recuerda que el Decreto 2591 de 1991 establece <strong>10 días hábiles</strong> para contestar.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
              <thead>
                <tr style="background:#f8f8f8;">
                  <th style="padding:10px 12px;text-align:left;font-size:13px;color:#666;font-weight:600;">Caso</th>
                  <th style="padding:10px 12px;text-align:left;font-size:13px;color:#666;font-weight:600;">Estado</th>
                </tr>
              </thead>
              <tbody>${filas}</tbody>
            </table>
            <div style="margin-top:24px;text-align:center;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard"
                style="background:#C0392B;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
                Ver mis tutelas →
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f8f8f8;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#999;">
              TutelaIA · Herramienta de asistencia jurídica · Este es un mensaje automático.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function templateContestacionGenerada(caso, contestacionId) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#2C3E50;padding:24px 32px;">
            <h1 style="margin:0;color:#fff;font-size:20px;">✅ Contestación generada</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 12px;color:#444;">
              La IA ha generado un borrador de contestación para el caso:
            </p>
            <div style="background:#f8f8f8;border-left:4px solid #2C3E50;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:20px;">
              <p style="margin:0;font-weight:bold;color:#2C3E50;">${caso.accionante}</p>
              <p style="margin:4px 0 0;color:#666;font-size:13px;">vs. ${caso.accionado}</p>
              ${caso.radicado ? `<p style="margin:4px 0 0;color:#999;font-size:12px;">Radicado: ${caso.radicado}</p>` : ""}
            </div>
            <p style="margin:0 0 20px;color:#666;font-size:14px;">
              Recuerda revisar y ajustar el borrador antes de radicarlo.
              La IA puede cometer errores — tú tienes la última palabra.
            </p>
            <div style="text-align:center;">
              <a href="${process.env.NEXTAUTH_URL}/contestacion/${contestacionId}"
                style="background:#2C3E50;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
                Revisar y editar contestación →
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f8f8f8;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#999;">
              TutelaIA · Borrador generado con IA. Revisar antes de radicar.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Funciones públicas ───────────────────────────────────────────────────────

export async function enviarAlertaVencimiento({ email, nombre, casos }) {
  const transport = getTransport();
  const urgentes  = casos.filter(c => c.diasRestantes <= 3).length;
  const subject   = urgentes > 0
    ? `⚠️ ${urgentes} tutela${urgentes > 1 ? "s" : ""} vence${urgentes === 1 ? "" : "n"} pronto — TutelaIA`
    : `📋 Recordatorio: tienes tutelas por contestar — TutelaIA`;

  return transport.sendMail({
    from:    FROM,
    to:      email,
    subject,
    html:    templateAlertaVencimiento(casos),
  });
}

export async function enviarContestacionGenerada({ email, caso, contestacionId }) {
  const transport = getTransport();
  return transport.sendMail({
    from:    FROM,
    to:      email,
    subject: `✅ Contestación lista: ${caso.accionante} vs. ${caso.accionado} — TutelaIA`,
    html:    templateContestacionGenerada(caso, contestacionId),
  });
}
