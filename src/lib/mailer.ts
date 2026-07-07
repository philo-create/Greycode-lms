import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  htmlText: string;
}

export async function sendLmsEmail({ to, subject, htmlText }: SendEmailParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const host = process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com';
  const port = parseInt(process.env.ZOHO_SMTP_PORT || '465', 10);
  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASSWORD;
  const fromName = process.env.ZOHO_SMTP_FROM_NAME || 'Greycode Academy';

  if (!user || !pass) {
    console.warn('SMTP credentials are not configured. Skipping email delivery.');
    return { success: false, error: 'Zoho SMTP credentials are not configured.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to,
      subject,
      html: htmlText,
    });

    console.log(`LMS Email successfully sent to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('LMS Email transmission failed:', error);
    return { success: false, error: error.message || 'Transmission failed.' };
  }
}
