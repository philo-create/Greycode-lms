import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { testRecipient, customUser, customPass, customHost, customPort } = await req.json();

    const host = customHost || process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com';
    const port = parseInt(customPort || process.env.ZOHO_SMTP_PORT || '465', 10);
    const user = customUser || process.env.ZOHO_SMTP_USER;
    const pass = customPass || process.env.ZOHO_SMTP_PASSWORD;
    const fromName = process.env.ZOHO_SMTP_FROM_NAME || 'Greycode Academy';

    if (!user || !pass) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zoho SMTP credentials are not configured. Please set ZOHO_SMTP_USER and ZOHO_SMTP_PASSWORD in your environment variables, or enter them directly below to run the test.' 
        },
        { status: 200 }
      );
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports like 587
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false // Helps prevent SSL issues on some environments
      }
    });

    const info = await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to: testRecipient || user,
      subject: `📧 Welcome to ${fromName} - Custom Zoho Setup Test`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px;">🦁</span>
            <h2 style="color: #4f46e5; margin: 10px 0 0 0;">${fromName}</h2>
            <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Foundation Phase Coding & Robotics Hub</p>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">🎉 Custom SMTP Setup Successful!</h3>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">
              This email confirms that your custom **Zoho Mail SMTP** integration is configured correctly for your <b>${fromName}</b> LMS application.
            </p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">
              You can now send branded notifications, updates, and invitations directly through your Zoho Mail server without any generic Supabase mentions.
            </p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
            <p>This is an automated test email sent from your LMS Administration Panel.</p>
            <p>&copy; ${new Date().getFullYear()} ${fromName}. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('SMTP test email failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send test email through Zoho SMTP server.' 
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  const isConfigured = !!(process.env.ZOHO_SMTP_USER && process.env.ZOHO_SMTP_PASSWORD);
  return NextResponse.json({
    configured: isConfigured,
    user: process.env.ZOHO_SMTP_USER ? `${process.env.ZOHO_SMTP_USER.slice(0, 3)}...` : null
  });
}
