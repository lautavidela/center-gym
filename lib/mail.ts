import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER ?? "";
const smtpPass = (process.env.SMTP_PASS ?? "").replace(/\s/g, "");

const smtpConfigured = !!process.env.SMTP_HOST && !!smtpUser && !!smtpPass;

const from = process.env.SMTP_FROM ?? smtpUser ?? "MTGym <no-reply>";

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: (process.env.SMTP_PORT ?? "587") === "465",
      auth: { user: smtpUser, pass: smtpPass },
    })
  : null;

export async function sendCodeEmail(opts: { to: string; gymName: string; code: string }) {
  const subject = `${opts.gymName}: tu código de verificación`;
  const text = `Tu código de verificación para ${opts.gymName} es: ${opts.code}.

Si no lo pediste, ignorá este mensaje.`;

  if (!transporter) {
    console.log(`[dev] código de verificación para ${opts.to}: ${opts.code}`);
    return { ok: true, dev: true };
  }

  try {
    await transporter.sendMail({ from, to: opts.to, subject, text });
    return { ok: true, dev: false };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al enviar el email.",
    };
  }
}