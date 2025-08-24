import nodemailer from 'nodemailer'
import { emailTemplates } from './email-templates'

// 이메일 전송기 생성
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USERNAME || 'cutlet.service@gmail.com',
      pass: process.env.MAIL_PASSWORD || 'txreyqepcvdozmrb'
    }
  })
}

// 환영 이메일 전송
export const sendWelcomeEmail = async (email: string, username: string) => {
  try {
    const transporter = createTransporter()
    const template = emailTemplates.welcome(username)
    
    const mailOptions = {
      from: `"Cutlet Team" <${process.env.MAIL_USERNAME || 'cutlet.service@gmail.com'}>`,
      to: email,
      subject: template.subject,
      html: template.html
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('환영 이메일 전송 성공:', email)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('환영 이메일 전송 실패:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 비밀번호 재설정 이메일 전송
export const sendPasswordResetEmail = async (email: string, username: string, resetLink: string) => {
  try {
    const transporter = createTransporter()
    const template = emailTemplates.passwordReset(username, resetLink)
    
    const mailOptions = {
      from: `"Cutlet Team" <${process.env.MAIL_USERNAME || 'cutlet.service@gmail.com'}>`,
      to: email,
      subject: template.subject,
      html: template.html
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('비밀번호 재설정 이메일 전송 성공:', email)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('비밀번호 재설정 이메일 전송 실패:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 이메일 전송 테스트
export const testEmailService = async () => {
  try {
    const transporter = createTransporter()
    
    // 연결 테스트
    await transporter.verify()
    console.log('이메일 서비스 연결 성공')
    
    // 테스트 이메일 전송
    const testMailOptions = {
      from: `"Cutlet Team" <${process.env.MAIL_USERNAME || 'cutlet.service@gmail.com'}>`,
      to: process.env.MAIL_USERNAME || 'cutlet.service@gmail.com',
      subject: '🧪 Cutlet 이메일 서비스 테스트',
      html: `
        <h2>이메일 서비스 테스트</h2>
        <p>Cutlet 이메일 서비스가 정상적으로 작동하고 있습니다.</p>
        <p>전송 시간: ${new Date().toLocaleString('ko-KR')}</p>
      `
    }
    
    const result = await transporter.sendMail(testMailOptions)
    console.log('테스트 이메일 전송 성공:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('이메일 서비스 테스트 실패:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
