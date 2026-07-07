import { NextRequest, NextResponse } from 'next/server';
import { sendLmsEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, role } = await req.json();

    if (!email || !firstName) {
      return NextResponse.json({ error: 'Email and first name are required' }, { status: 400 });
    }

    const hostHeader = req.headers.get('host') || '';
    const protocol = hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1') ? 'http' : 'https';
    const origin = `${protocol}://${hostHeader}`;
    const fromName = process.env.ZOHO_SMTP_FROM_NAME || 'Greycode Academy';

    const roleLabels: Record<string, string> = {
      'learner': 'Learner / Student',
      'teacher': 'Teacher',
      'school_admin': 'School Admin',
      'facilitator': 'Facilitator',
      'parent': 'Parent',
      'super_admin': 'Super Admin',
    };

    const roleName = roleLabels[role?.toLowerCase()] || role || 'User';

    const htmlText = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px;">🦁</span>
          <h2 style="color: #4f46e5; margin: 10px 0 0 0;">${fromName}</h2>
          <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Foundation Phase Coding & Robotics Hub</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">🎉 Welcome to ${fromName}!</h3>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">
            Hello ${firstName} ${lastName || ''},
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">
            An administrator has registered you as a <strong>${roleName}</strong> in the <strong>${fromName} LMS</strong>.
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">
            Please use the following credentials to sign in and set up your workspace:
          </p>
          
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin: 16px 0;">
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Email Address:</strong> ${email}</p>
            ${password ? `<p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Temporary Password:</strong> <code style="font-family: monospace; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 15px;">${password}</code></p>` : ''}
            <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Assigned Role:</strong> ${roleName}</p>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            💡 <em>Note: If you are asked to confirm your email address upon first sign-in, you can use the verification link sent by Supabase, or simply sign in. Your school administrator will be able to verify your account automatically.</em>
          </p>

          <div style="text-align: center; margin-top: 24px; margin-bottom: 12px;">
            <a href="${origin}/" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 8px; font-size: 15px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">Log In to Your Account</a>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
          <p>This is an automated invitation. Please do not reply directly to this email.</p>
          <p>&copy; ${new Date().getFullYear()} ${fromName}. All rights reserved.</p>
        </div>
      </div>
    `;

    const result = await sendLmsEmail({
      to: email,
      subject: `📧 Invitation: Welcome to ${fromName} - Your LMS Account Credentials`,
      htmlText,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Welcome email API failed:', err);
    return NextResponse.json({ error: err.message || 'Failed to dispatch welcome notification' }, { status: 500 });
  }
}
