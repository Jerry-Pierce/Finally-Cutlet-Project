import { SupportedLanguage } from './language-detector';

// 다국어 이메일 템플릿
export const multilingualEmailTemplates = {
  // 한국어
  ko: {
    welcome: (username: string) => ({
      subject: `🎉 Cutlet에 오신 것을 환영합니다, ${username}님!`,
      html: `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cutlet 환영</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .container { background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .welcome-text { font-size: 24px; color: #1f2937; margin-bottom: 20px; }
            .subtitle { font-size: 16px; color: #6b7280; margin-bottom: 30px; }
            .features { background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .feature-item { display: flex; align-items: center; margin-bottom: 15px; }
            .feature-icon { width: 20px; height: 20px; background-color: #2563eb; border-radius: 50%; margin-right: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; }
            .cta-button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; text-align: center; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Cutlet</div>
              <div class="welcome-text">환영합니다!</div>
              <div class="subtitle">URL 단축 서비스에 오신 것을 환영합니다</div>
            </div>
            
            <p>안녕하세요, <strong>${username}</strong>님!</p>
            <p>Cutlet에 가입해주셔서 감사합니다. 이제 긴 URL을 짧고 기억하기 쉬운 링크로 변환할 수 있습니다.</p>
            
            <div class="features">
              <div class="feature-item">
                <div class="feature-icon">🔗</div>
                <span>무제한 URL 단축</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📊</div>
                <span>상세한 클릭 분석</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📱</div>
                <span>QR 코드 생성</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🏷️</div>
                <span>태그 관리</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://cutlet.com" class="cta-button">지금 시작하기</a>
            </div>
            
            <div class="footer">
              <p>질문이 있으시면 언제든지 연락해주세요.</p>
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    
    passwordReset: (username: string, resetLink: string) => ({
      subject: '🔐 Cutlet 비밀번호 재설정',
      html: `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>비밀번호 재설정</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .container { background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .reset-button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Cutlet</div>
              <h2>비밀번호 재설정</h2>
            </div>
            
            <p>안녕하세요, <strong>${username}</strong>님!</p>
            <p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정하세요.</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="reset-button">비밀번호 재설정</a>
            </div>
            
            <p><strong>주의사항:</strong></p>
            <ul>
              <li>이 링크는 1시간 후에 만료됩니다</li>
              <li>비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요</li>
              <li>보안을 위해 링크를 다른 사람과 공유하지 마세요</li>
            </ul>
            
            <div class="footer">
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    
    verification: (username: string, verificationCode: string) => ({
      subject: '✅ Cutlet 이메일 인증',
      html: `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>이메일 인증</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .container { background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .verification-code { background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Cutlet</div>
              <h2>이메일 인증</h2>
            </div>
            
            <p>안녕하세요, <strong>${username}</strong>님!</p>
            <p>Cutlet 계정 인증을 위해 아래의 인증 코드를 입력해주세요:</p>
            
            <div class="verification-code">${verificationCode}</div>
            
            <p>이 인증 코드는 10분 후에 만료됩니다.</p>
            
            <div class="footer">
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  },

  // 영어
  en: {
    welcome: (username: string) => ({
      subject: `🎉 Welcome to Cutlet, ${username}!`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Cutlet</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .container { background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .welcome-text { font-size: 24px; color: #1f2937; margin-bottom: 20px; }
            .subtitle { font-size: 16px; color: #6b7280; margin-bottom: 30px; }
            .features { background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .feature-item { display: flex; align-items: center; margin-bottom: 15px; }
            .feature-icon { width: 20px; height: 20px; background-color: #2563eb; border-radius: 50%; margin-right: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; }
            .cta-button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; text-align: center; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Cutlet</div>
              <div class="welcome-text">Welcome!</div>
              <div class="subtitle">Welcome to our URL shortening service</div>
            </div>
            
            <p>Hello, <strong>${username}</strong>!</p>
            <p>Thank you for joining Cutlet. You can now transform long URLs into short, memorable links.</p>
            
            <div class="features">
              <div class="feature-item">
                <div class="feature-icon">🔗</div>
                <span>Unlimited URL shortening</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📊</div>
                <span>Detailed click analytics</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📱</div>
                <span>QR code generation</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🏷️</div>
                <span>Tag management</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://cutlet.com" class="cta-button">Get Started Now</a>
            </div>
            
            <div class="footer">
              <p>If you have any questions, please don't hesitate to contact us.</p>
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    
    passwordReset: (username: string, resetLink: string) => ({
      subject: '🔐 Cutlet Password Reset',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .container { background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .reset-button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Cutlet</div>
              <h2>Password Reset</h2>
            </div>
            
            <p>Hello, <strong>${username}</strong>!</p>
            <p>You requested a password reset. Click the button below to set a new password.</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="reset-button">Reset Password</a>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This link expires in 1 hour</li>
              <li>If you didn't request a password reset, please ignore this email</li>
              <li>For security, don't share this link with anyone</li>
            </ul>
            
            <div class="footer">
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    
    verification: (username: string, verificationCode: string) => ({
      subject: '✅ Cutlet Email Verification',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .container { background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .verification-code { background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Cutlet</div>
              <h2>Email Verification</h2>
            </div>
            
            <p>Hello, <strong>${username}</strong>!</p>
            <p>Please enter the verification code below to verify your Cutlet account:</p>
            
            <div class="verification-code">${verificationCode}</div>
            
            <p>This verification code expires in 10 minutes.</p>
            
            <div class="footer">
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  },

  // 일본어
  ja: {
    welcome: (username: string) => ({
      subject: `🎉 Cutletへようこそ、${username}さん！`,
      html: `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cutletへようこそ</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .container { background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .welcome-text { font-size: 24px; color: #1f2937; margin-bottom: 20px; }
            .subtitle { font-size: 16px; color: #6b7280; margin-bottom: 30px; }
            .features { background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .feature-item { display: flex; align-items: center; margin-bottom: 15px; }
            .feature-icon { width: 20px; height: 20px; background-color: #2563eb; border-radius: 50%; margin-right: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; }
            .cta-button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; text-align: center; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Cutlet</div>
              <div class="welcome-text">ようこそ！</div>
              <div class="subtitle">URL短縮サービスへようこそ</div>
            </div>
            
            <p>こんにちは、<strong>${username}</strong>さん！</p>
            <p>Cutletにご登録いただき、ありがとうございます。長いURLを短く、覚えやすいリンクに変換できるようになりました。</p>
            
            <div class="features">
              <div class="feature-item">
                <div class="feature-icon">🔗</div>
                <span>無制限URL短縮</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📊</div>
                <span>詳細なクリック分析</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📱</div>
                <span>QRコード生成</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🏷️</div>
                <span>タグ管理</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://cutlet.com" class="cta-button">今すぐ始める</a>
            </div>
            
            <div class="footer">
              <p>ご質問がございましたら、お気軽にお問い合わせください。</p>
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    
    passwordReset: (username: string, resetLink: string) => ({
      subject: '🔐 Cutletパスワードリセット',
      html: `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>パスワードリセット</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .container { background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .reset-button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Cutlet</div>
              <h2>パスワードリセット</h2>
            </div>
            
            <p>こんにちは、<strong>${username}</strong>さん！</p>
            <p>パスワードリセットをリクエストされました。下のボタンをクリックして新しいパスワードを設定してください。</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="reset-button">パスワードリセット</a>
            </div>
            
            <p><strong>注意事項:</strong></p>
            <ul>
              <li>このリンクは1時間後に期限切れになります</li>
              <li>パスワードリセットをリクエストしていない場合は、このメールを無視してください</li>
              <li>セキュリティのため、リンクを他の人と共有しないでください</li>
            </ul>
            
            <div class="footer">
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    
    verification: (username: string, verificationCode: string) => ({
      subject: '✅ Cutletメール認証',
      html: `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>メール認証</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .container { background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .verification-code { background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Cutlet</div>
              <h2>メール認証</h2>
            </div>
            
            <p>こんにちは、<strong>${username}</strong>さん！</p>
            <p>Cutletアカウント認証のため、下の認証コードを入力してください：</p>
            
            <div class="verification-code">${verificationCode}</div>
            
            <p>この認証コードは10分後に期限切れになります。</p>
            
            <div class="footer">
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  }
};

// 기본 언어 (한국어)
export const getEmailTemplate = (language: SupportedLanguage, templateType: 'welcome' | 'passwordReset' | 'verification', ...args: any[]) => {
  const templates = multilingualEmailTemplates[language] || multilingualEmailTemplates.ko;
  return templates[templateType](...args);
};
