export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { sendLmsEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const { userId, password, emailConfirmed } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Identify service role key to bypass RLS and perform admin actions
    const supabaseServiceKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_ADMIN_KEY ||
      ''
    ).replace(/['"]/g, '').trim();

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase URL or Anon Key is not configured' }, { status: 500 });
    }

    // 1. Authenticate the caller using their JWT from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session token' }, { status: 401 });
    }

    // 2. Fetch the caller's profile to verify admin role
    const { data: callerProfile, error: profileError } = await userClient
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single();

    if (profileError || !callerProfile) {
      console.error('Failed to fetch caller profile:', profileError);
      return NextResponse.json({ error: 'Forbidden: Could not verify admin status' }, { status: 403 });
    }

    const callerRole = (callerProfile.role || '').toLowerCase();
    const isSuperAdmin = ['super_admin', 'superadmin', 'admin'].includes(callerRole);
    const isSchoolAdmin = callerRole === 'school_admin';

    if (!isSuperAdmin && !isSchoolAdmin) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to update users' }, { status: 403 });
    }

    // 3. If school admin, verify target user belongs to the same school
    if (isSchoolAdmin) {
      const { data: targetProfile, error: targetError } = await userClient
        .from('profiles')
        .select('school_id')
        .eq('id', userId)
        .single();

      if (targetError || !targetProfile) {
        console.warn('Target user profile check error:', targetError);
        return NextResponse.json({ error: 'Target user profile not found or access denied' }, { status: 404 });
      }

      if (targetProfile.school_id !== callerProfile.school_id) {
        return NextResponse.json({ error: 'Forbidden: You can only update users belonging to your school' }, { status: 403 });
      }
    }

    // 4. Update Auth user and Profile table using service role client or standard client
    if (supabaseServiceKey) {
      console.log(`Using Service Role Key to update user: ${userId}`);
      const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      });

      // Prepare updates for auth.users
      const authUpdates: any = {};
      if (password) {
        authUpdates.password = password;
      }
      if (emailConfirmed !== undefined) {
        authUpdates.email_confirm = !!emailConfirmed;
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(userId, authUpdates);
        if (authUpdateError) {
          console.error('Failed to update auth user via admin client:', authUpdateError);
          return NextResponse.json({ error: `Auth update failed: ${authUpdateError.message}` }, { status: 500 });
        }

        // If the password was updated successfully, send a notification email
        if (password) {
          try {
            const { data: { user: targetAuthUser } } = await adminClient.auth.admin.getUser(userId);
            if (targetAuthUser && targetAuthUser.email) {
              const { data: targetProfile } = await adminClient
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', userId)
                .single();

              const hostHeader = req.headers.get('host') || '';
              const protocol = hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1') ? 'http' : 'https';
              const origin = `${protocol}://${hostHeader}`;
              const fromName = process.env.ZOHO_SMTP_FROM_NAME || 'Greycode Academy';

              const firstName = targetProfile?.first_name || 'there';
              const lastName = targetProfile?.last_name || '';

              const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 32px;">🦁</span>
                    <h2 style="color: #4f46e5; margin: 10px 0 0 0;">${fromName}</h2>
                    <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Foundation Phase Coding & Robotics Hub</p>
                  </div>
                  
                  <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
                    <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">🔑 Your Account Password Has Been Updated</h3>
                    <p style="color: #334155; font-size: 15px; line-height: 1.5;">
                      Hello ${firstName} ${lastName},
                    </p>
                    <p style="color: #334155; font-size: 15px; line-height: 1.5;">
                      An administrator has successfully set/updated the password for your **${fromName}** account.
                    </p>
                    <p style="color: #334155; font-size: 15px; line-height: 1.5;">
                      You can now log in using the credentials below:
                    </p>
                    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin: 16px 0;">
                      <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Email Address:</strong> ${targetAuthUser.email}</p>
                      <p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>New Password:</strong> <code style="font-family: monospace; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 15px;">${password}</code></p>
                    </div>
                    <div style="text-align: center; margin-top: 24px; margin-bottom: 12px;">
                      <a href="${origin}/" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 8px; font-size: 15px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">Log In to Your Account</a>
                    </div>
                  </div>

                  <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
                    <p>If you did not request this update, please notify your administrator immediately.</p>
                    <p>&copy; ${new Date().getFullYear()} ${fromName}. All rights reserved.</p>
                  </div>
                </div>
              `;

              await sendLmsEmail({
                to: targetAuthUser.email,
                subject: `🔑 Account Security Update: Your ${fromName} Password has been configured`,
                htmlText: emailHtml
              });
            }
          } catch (mailErr) {
            console.warn('Failed to dispatch password notification email:', mailErr);
          }
        }
      }

      // Note: We don't update email_confirmed in profiles since it's derived from auth.users
      const profileUpdates: any = {};

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileUpdateError } = await adminClient
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (profileUpdateError) {
          console.warn('Profile updates failed via admin client:', profileUpdateError);
          return NextResponse.json({ error: `Profile update failed: ${profileUpdateError.message}` }, { status: 500 });
        }
      }
    } else {
      console.warn('No Service Role Key found. Direct updates via client session.');
      // Attempt to update profiles directly (omitting email_confirmed since it's derived)
      
      if (password) {
        return NextResponse.json({ 
          error: 'Setting other user passwords requires a Supabase Service Role Key which is not configured in the environment.' 
        }, { status: 501 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API User update handler failed:', err);
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 500 });
  }
}
