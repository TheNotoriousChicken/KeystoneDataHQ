// ---------------------------------------------------------------------------
// Email Utility — Keystone Data HQ
// Uses Resend to send transactional emails
// ---------------------------------------------------------------------------

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || 'Keystone Data HQ <tejas@keystonedatahq.com>';
const FRONTEND = process.env.FRONTEND_URL || 'https://keystonedatahq.com';
const LOGO_URL = process.env.LOGO_URL || 'https://media.discordapp.net/attachments/777793193769041920/1478430364895805694/hrthrthrthrthrt_1.jpg?ex=69a85f12&is=69a70d92&hm=3214efaa6b021e57dd01cfdfdca57c59bd0436da00b70e08752f5e890105498f&=&format=webp&width=960&height=960';

// ---------------------------------------------------------------------------
// Shared HTML wrapper
// ---------------------------------------------------------------------------
function wrapHtml(content) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:0;background-color:#0c0f1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0c0f1a;padding:40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#141827;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
                                <table cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="vertical-align:middle;padding-right:12px;">
                                            <img src="${LOGO_URL}" alt="Keystone Data HQ" width="44" height="44" style="border-radius:10px;display:block;" />
                                        </td>
                                        <td style="vertical-align:middle;">
                                            <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                                                Keystone Data HQ
                                            </span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:32px 40px;">
                                ${content}
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);">
                                <p style="margin:0;font-size:12px;color:#6b7280;">
                                    &copy; ${new Date().getFullYear()} Keystone Data HQ. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
}

// ---------------------------------------------------------------------------
// Button helper
// ---------------------------------------------------------------------------
function button(text, url) {
    return `
    <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
        <tr>
            <td style="background:linear-gradient(135deg,#06b6d4,#0891b2);border-radius:12px;padding:14px 32px;">
                <a href="${url}" style="color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;display:inline-block;">
                    ${text} →
                </a>
            </td>
        </tr>
    </table>`;
}

// ---------------------------------------------------------------------------
// 1. Password Reset Email
// ---------------------------------------------------------------------------
async function sendPasswordResetEmail(to, resetToken) {
    const resetUrl = `${FRONTEND}/reset-password?token=${resetToken}`;
    const html = wrapHtml(`
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Reset Your Password</h2>
        <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.6;">
            We received a request to reset your password. Click the button below to create a new one. This link expires in <strong style="color:#ffffff;">1 hour</strong>.
        </p>
        ${button('Reset Password', resetUrl)}
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
            If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
        </p>
    `);

    const { error } = await resend.emails.send({
        from: FROM,
        to,
        subject: 'Reset your Keystone Data HQ password',
        html,
    });

    if (error) {
        console.error('❌ Failed to send password reset email:', error);
        throw error;
    }
    console.log(`📧 Password reset email sent to ${to}`);
}

// ---------------------------------------------------------------------------
// 2. Team Invite Email
// ---------------------------------------------------------------------------
async function sendTeamInviteEmail(to, inviteToken, companyName, invitedByName) {
    const joinUrl = `${FRONTEND}/register?invite=${inviteToken}`;
    const html = wrapHtml(`
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">You've Been Invited!</h2>
        <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.6;">
            <strong style="color:#ffffff;">${invitedByName}</strong> has invited you to join 
            <strong style="color:#06b6d4;">${companyName}</strong> on Keystone Data HQ.
        </p>
        ${button('Accept Invitation', joinUrl)}
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
            If you weren't expecting this invitation, you can safely ignore this email.
        </p>
    `);

    const { error } = await resend.emails.send({
        from: FROM,
        to,
        subject: `You've been invited to join ${companyName} on Keystone Data HQ`,
        html,
    });

    if (error) {
        console.error('❌ Failed to send invite email:', error);
        throw error;
    }
    console.log(`📧 Team invite email sent to ${to}`);
}

// ---------------------------------------------------------------------------
// 3. Email Verification (sent on registration)
// ---------------------------------------------------------------------------
async function sendVerificationEmail(to, firstName, verifyToken) {
    const verifyUrl = `${FRONTEND}/verify-email?token=${verifyToken}`;
    const html = wrapHtml(`
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Verify your email, ${firstName}</h2>
        <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.6;">
            Thanks for signing up! Please confirm your email address by clicking the button below.
        </p>
        ${button('Verify Email', verifyUrl)}
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
            If you didn't create an account, you can safely ignore this email.
        </p>
    `);

    const { error } = await resend.emails.send({
        from: FROM,
        to,
        subject: 'Verify your email — Keystone Data HQ',
        html,
    });

    if (error) {
        console.error('❌ Failed to send verification email:', error);
        throw error;
    }
    console.log(`📧 Verification email sent to ${to}`);
}

// ---------------------------------------------------------------------------
// 4. Welcome Email (sent after email verification)
// ---------------------------------------------------------------------------
async function sendWelcomeEmail(to, firstName) {
    const dashboardUrl = `${FRONTEND}/dashboard`;
    const html = wrapHtml(`
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Welcome aboard, ${firstName}! 🎉</h2>
        <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.6;">
            Your email has been verified and your account is ready.
        </p>
        ${button('Go to Dashboard', dashboardUrl)}
        <p style="margin-top:20px;font-size:13px;color:#6b7280;line-height:1.5;">
            Need help? Reply to this email and we'll get back to you.
        </p>
    `);

    const { error } = await resend.emails.send({
        from: FROM,
        to,
        subject: 'Welcome to Keystone Data HQ!',
        html,
    });

    if (error) {
        console.error('❌ Failed to send welcome email:', error);
        throw error;
    }
    console.log(`📧 Welcome email sent to ${to}`);
}

// ---------------------------------------------------------------------------
// 5. Two-Factor Authentication (OTP)
// ---------------------------------------------------------------------------
async function sendTwoFactorEmail(to, code) {
    const html = wrapHtml(`
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Your Login Code</h2>
        <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.6;">
            Here is your one-time verification code to sign into Keystone Data HQ. 
            This code will expire in 10 minutes.
        </p>
        <div style="background-color:#06b6d410; border:1px solid #06b6d430; padding:16px; border-radius:8px; text-align:center; margin-bottom:20px;">
            <span style="font-size:28px; font-weight:800; color:#06b6d4; letter-spacing:4px;">${code}</span>
        </div>
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
            If you did not attempt to sign in, please secure your account and reset your password immediately.
        </p>
    `);

    const { error } = await resend.emails.send({
        from: FROM,
        to,
        subject: `Your login code: ${code}`,
        html,
    });

    if (error) {
        console.error('❌ Failed to send 2FA email:', error);
        throw error;
    }
    console.log(`🔒 2FA code sent to ${to}`);
}

// ---------------------------------------------------------------------------
// 6. Weekly Administrator Digest
// ---------------------------------------------------------------------------
async function sendWeeklyDigestEmail(to, firstName, metrics) {
    const dashboardUrl = `${FRONTEND}/dashboard`;

    // Format currency internally for safety
    const fmt = (val) => '$' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Calculate simple growth percentages
    const revGrowth = metrics.prevRevenue ? ((metrics.revenue - metrics.prevRevenue) / metrics.prevRevenue * 100).toFixed(1) : 0;
    const spendGrowth = metrics.prevSpend ? ((metrics.spend - metrics.prevSpend) / metrics.prevSpend * 100).toFixed(1) : 0;

    const html = wrapHtml(`
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Your Weekly Performance Update</h2>
        <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.6;">
            Hi ${firstName}, here's a quick look at how your business performed over the <strong style="color:#ffffff;">last 7 days</strong> compared to the previous week.
        </p>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <!-- Revenue -->
            <tr>
                <td style="padding:16px; background-color:#1c2132; border-radius:8px; border-left:4px solid #10b981; margin-bottom:12px; display:block;">
                    <p style="margin:0 0 4px; font-size:13px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Total Revenue</p>
                    <p style="margin:0; font-size:24px; font-weight:700; color:#10b981;">
                        ${fmt(metrics.revenue)} 
                        <span style="font-size:14px; color:${revGrowth >= 0 ? '#10b981' : '#ef4444'}; font-weight:500; margin-left:8px;">
                            ${revGrowth >= 0 ? '+' : ''}${revGrowth}%
                        </span>
                    </p>
                </td>
            </tr>
            <!-- Ad Spend -->
            <tr>
                <td style="padding:16px; background-color:#1c2132; border-radius:8px; border-left:4px solid #fbbf24; margin-bottom:12px; display:block;">
                    <p style="margin:0 0 4px; font-size:13px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Total Ad Spend</p>
                    <p style="margin:0; font-size:24px; font-weight:700; color:#fbbf24;">
                        ${fmt(metrics.spend)}
                        <span style="font-size:14px; color:${spendGrowth <= 0 ? '#10b981' : '#ef4444'}; font-weight:500; margin-left:8px;">
                            ${spendGrowth > 0 ? '+' : ''}${spendGrowth}%
                        </span>
                    </p>
                </td>
            </tr>
            <!-- ROAS -->
            <tr>
                <td style="padding:16px; background-color:#1c2132; border-radius:8px; border-left:4px solid #0ea5e9; display:block;">
                    <p style="margin:0 0 4px; font-size:13px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">Blended ROAS</p>
                    <p style="margin:0; font-size:24px; font-weight:700; color:#0ea5e9;">
                        ${metrics.roas.toFixed(2)}x
                    </p>
                </td>
            </tr>
        </table>

        ${button('View Full Report', dashboardUrl)}
        
        <p style="margin-top:20px;font-size:13px;color:#6b7280;line-height:1.5;">
            You are receiving this summary because you are an Administrator on Keystone Data HQ.
        </p>
    `);

    const { error } = await resend.emails.send({
        from: FROM,
        to,
        subject: `Weekly Summary: ${fmt(metrics.revenue)} in Revenue — Keystone Data HQ`,
        html,
    });

    if (error) {
        console.error('❌ Failed to send weekly digest email:', error);
        throw error;
    }
    console.log(`📊 Weekly digest sent to ${to}`);
}

// ---------------------------------------------------------------------------
// sendAnomalyAlertEmail
// ---------------------------------------------------------------------------
const sendAnomalyAlertEmail = async (email, firstName, companyName, roasDrop, spendSpike) => {
    let message = `<p style="color:#94a3b8;font-size:16px;line-height:24px;">Hi ${firstName},</p>`;
    message += `<p style="color:#94a3b8;font-size:16px;line-height:24px;">We detected an anomaly in your advertising performance for <strong>${companyName}</strong>.</p><ul>`;

    if (roasDrop) {
        message += `<li style="color:#94a3b8;font-size:16px;line-height:24px;"><strong style="color:#ef4444;">ROAS Drop:</strong> Yesterday's true ROAS was <strong>${roasDrop}% lower</strong> than your 7-day average.</li>`;
    }
    if (spendSpike) {
        message += `<li style="color:#94a3b8;font-size:16px;line-height:24px;"><strong style="color:#f59e0b;">Spend Spike:</strong> Yesterday's Ad Spend was <strong>${spendSpike}% higher</strong> than your 7-day average.</li>`;
    }

    message += `</ul><p style="color:#94a3b8;font-size:16px;line-height:24px;">Please click below to review your campaigns.</p>`;
    message += `<a href="${FRONTEND}/dashboard/reports" style="display:inline-block;padding:12px 24px;background-color:#06B6D4;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;margin-top:16px;">Review Performance Log</a>`;

    const content = wrapHtml(`
        <h2 style="color:#ffffff;margin-top:0;font-size:24px;font-weight:600;">Urgent: Performance Anomaly Detected</h2>
        ${message}
    `);

    try {
        await resend.emails.send({
            from: FROM,
            to: email,
            subject: `Action Required: Anomaly Detected for ${companyName}`,
            html: content,
        });
        console.log(`[Email] Anomaly alert sent to ${email}`);
    } catch (err) {
        console.error(`[Email Error] Failed to send anomaly alert to ${email}:`, err);
    }
};


module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendTeamInviteEmail,
    sendWeeklyDigestEmail,
    sendTwoFactorEmail,
    sendAnomalyAlertEmail
};
