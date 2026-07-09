import nodemailer from 'nodemailer'

export function getMailConfig() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASS environment variables are not set')
  }

  return { host, port, user, pass }
}

export function createMailTransporter() {
  const { host, port, user, pass } = getMailConfig()

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: true,
    auth: { user, pass },
  })
}

export function getTrustedAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL
  if (url) return url.replace(/\/$/, '')
  throw new Error('NEXT_PUBLIC_APP_URL (or APP_URL) environment variable is not set')
}

export async function sendResetEmail(to: string, resetPath: string, username: string) {
  const { user: from } = getMailConfig()
  const transporter = createMailTransporter()
  const baseUrl = getTrustedAppUrl()
  const resetUrl = `${baseUrl}${resetPath}`

  await transporter.sendMail({
    from: `"Nhất Tâm Hoa" <${from}>`,
    to,
    subject: 'Đặt lại mật khẩu admin - Nhất Tâm Hoa',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #333;">
        <h2 style="color: #B8860B;">Đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${username}</strong>,</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản admin Nhất Tâm Hoa. Nhấn vào liên kết bên dưới để tiếp tục:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #B8860B; color: #fff; text-decoration: none; border-radius: 4px;">
            Đặt lại mật khẩu
          </a>
        </p>
        <p>Liên kết sẽ hết hạn sau 30 phút.</p>
        <p style="font-size: 12px; color: #666;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
      </div>
    `,
    text: `Xin chào ${username},\n\nBạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào liên kết sau để tiếp tục:\n${resetUrl}\n\nLiên kết sẽ hết hạn sau 30 phút.\n\nNếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.`,
  })
}
