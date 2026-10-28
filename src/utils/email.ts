import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email_user,
    pass: config.email_pass,
  },
});

export const sendPasswordResetEmail = async (
  to: string,
  resetUrl: string,
): Promise<void> => {
  await transporter.sendMail({
    from: `"LumaStyle" <${config.email_user}>`,
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="font-weight:300;margin-bottom:8px;">Reset Your Password</h2>
        <p style="color:#666;margin-bottom:24px;">
          Click the button below to reset your password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;">
          Reset Password
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px;">
          If you didn't request this, ignore this email — your password won't change.
        </p>
      </div>
    `,
  });
};
