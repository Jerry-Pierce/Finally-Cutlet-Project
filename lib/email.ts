import nodemailer from 'nodemailer'

// 이메일 전송기 설정
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.MAIL_SERVER || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false, // TLS 사용
  auth: {
    user: process.env.MAIL_USERNAME || 'cutlet.service@gmail.com',
    pass: process.env.MAIL_PASSWORD || '',
  },
})

// 이메일 템플릿 인터페이스
interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// 기본 이메일 스타일
const baseEmailStyle = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cutlet</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f8fafc;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 30px;
        text-align: center;
        color: white;
      }
      .logo {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .tagline {
        font-size: 16px;
        opacity: 0.9;
      }
      .content {
        padding: 40px 30px;
      }
      .title {
        font-size: 24px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 20px;
        text-align: center;
      }
      .message {
        font-size: 16px;
        color: #4b5563;
        margin-bottom: 30px;
        line-height: 1.7;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        text-align: center;
        margin: 20px 0;
        transition: all 0.3s ease;
      }
      .button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      }
      .footer {
        background-color: #f8fafc;
        padding: 30px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      }
      .footer-text {
        color: #6b7280;
        font-size: 14px;
        margin-bottom: 10px;
      }
      .footer-link {
        color: #667eea;
        text-decoration: none;
      }
      .warning {
        background-color: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        color: #92400e;
        font-size: 14px;
      }
      .expiry {
        background-color: #f3f4f6;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        text-align: center;
        color: #6b7280;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">🔗 Cutlet</div>
        <div class="tagline">Smart URL Shortening Service</div>
      </div>
      <div class="content">
        {{CONTENT}}
      </div>
      <div class="footer">
        <div class="footer-text">이 이메일은 Cutlet 서비스에서 발송되었습니다.</div>
        <div class="footer-text">문의사항이 있으시면 <a href="mailto:cutlet.service@gmail.com" class="footer-link">cutlet.service@gmail.com</a>으로 연락해주세요.</div>
        <div class="footer-text">© 2024 Cutlet. All rights reserved.</div>
      </div>
    </div>
  </body>
  </html>
`

// 비밀번호 재설정 이메일 템플릿
export const createPasswordResetEmail = (resetToken: string, username: string): EmailTemplate => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
  
  const content = `
    <div class="title">비밀번호 재설정</div>
    <div class="message">
      안녕하세요, <strong>${username}</strong>님!<br><br>
      Cutlet 계정의 비밀번호 재설정을 요청하셨습니다.<br>
      아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
    </div>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">비밀번호 재설정</a>
    </div>
    <div class="warning">
      <strong>⚠️ 주의사항:</strong><br>
      • 이 링크는 1시간 후에 만료됩니다<br>
      • 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요<br>
      • 보안을 위해 링크를 다른 사람과 공유하지 마세요
    </div>
    <div class="expiry">
      링크가 작동하지 않는 경우, 아래 URL을 브라우저에 직접 입력하세요:<br>
      <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
    </div>
  `

  return {
    subject: '[Cutlet] 비밀번호 재설정',
    html: baseEmailStyle.replace('{{CONTENT}}', content),
    text: `
      Cutlet - 비밀번호 재설정

      안녕하세요, ${username}님!
      Cutlet 계정의 비밀번호 재설정을 요청하셨습니다.

      아래 링크를 클릭하여 새로운 비밀번호를 설정해주세요:
      ${resetUrl}

      주의사항:
      - 이 링크는 1시간 후에 만료됩니다
      - 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요
      - 보안을 위해 링크를 다른 사람과 공유하지 마세요

      링크가 작동하지 않는 경우, 위 URL을 브라우저에 직접 입력하세요.

      문의사항: cutlet.service@gmail.com
    `
  }
}

// 회원가입 인증 이메일 템플릿
export const createVerificationEmail = (verificationToken: string, username: string): EmailTemplate => {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${verificationToken}`
  
  const content = `
    <div class="title">이메일 인증</div>
    <div class="message">
      안녕하세요, <strong>${username}</strong>님!<br><br>
      Cutlet에 가입해주셔서 감사합니다! 🎉<br>
      계정을 활성화하려면 아래 버튼을 클릭하여 이메일을 인증해주세요.
    </div>
    <div style="text-align: center;">
      <a href="${verifyUrl}" class="button">이메일 인증하기</a>
    </div>
    <div class="warning">
      <strong>⚠️ 주의사항:</strong><br>
      • 이 링크는 24시간 후에 만료됩니다<br>
      • 이메일 인증을 완료해야 모든 기능을 이용할 수 있습니다<br>
      • 보안을 위해 링크를 다른 사람과 공유하지 마세요
    </div>
    <div class="expiry">
      링크가 작동하지 않는 경우, 아래 URL을 브라우저에 직접 입력하세요:<br>
      <a href="${verifyUrl}" style="color: #667eea; word-break: break-all;">${verifyUrl}</a>
    </div>
  `

  return {
    subject: '[Cutlet] 이메일 인증',
    html: baseEmailStyle.replace('{{CONTENT}}', content),
    text: `
      Cutlet - 이메일 인증

      안녕하세요, ${username}님!
      Cutlet에 가입해주셔서 감사합니다! 🎉

      계정을 활성화하려면 아래 링크를 클릭하여 이메일을 인증해주세요:
      ${verifyUrl}

      주의사항:
      - 이 링크는 24시간 후에 만료됩니다
      - 이메일 인증을 완료해야 모든 기능을 이용할 수 있습니다
      - 보안을 위해 링크를 다른 사람과 공유하지 마세요

      링크가 작동하지 않는 경우, 위 URL을 브라우저에 직접 입력하세요.

      문의사항: cutlet.service@gmail.com
    `
  }
}

// 이메일 전송 함수
export const sendEmail = async (to: string, template: EmailTemplate): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"Cutlet Team" <${process.env.MAIL_USERNAME || 'cutlet.service@gmail.com'}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('이메일 전송 성공:', result.messageId)
    return true
  } catch (error) {
    console.error('이메일 전송 실패:', error)
    return false
  }
}

// 이메일 전송 테스트
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify()
    console.log('이메일 서버 연결 성공')
    return true
  } catch (error) {
    console.error('이메일 서버 연결 실패:', error)
    return false
  }
}
