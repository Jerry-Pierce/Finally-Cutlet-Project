export const emailTemplates = {
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
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .welcome-text {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
          }
          .features {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
          }
          .feature-icon {
            width: 20px;
            height: 20px;
            background-color: #2563eb;
            border-radius: 50%;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .social-links {
            margin-top: 15px;
          }
          .social-links a {
            color: #2563eb;
            text-decoration: none;
            margin: 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍖 Cutlet</div>
            <div class="welcome-text">환영합니다, ${username}님!</div>
            <div class="subtitle">URL 단축 서비스의 새로운 멤버가 되신 것을 축하드립니다</div>
          </div>
          
          <p>안녕하세요! Cutlet에 가입해 주셔서 정말 감사합니다. 🎉</p>
          
          <p>이제 다음과 같은 기능들을 자유롭게 사용하실 수 있습니다:</p>
          
          <div class="features">
            <div class="feature-item">
              <div class="feature-icon">🔗</div>
              <span>무제한 URL 단축</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <span>상세한 클릭 통계</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🏷️</div>
              <span>태그로 URL 관리</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📱</div>
              <span>QR 코드 생성</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⭐</div>
              <span>즐겨찾기 기능</span>
            </div>
          </div>
          
          <p>바로 시작해보세요!</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shortener" class="cta-button">
            🚀 첫 번째 URL 단축하기
          </a>
          
          <p><strong>궁금한 점이 있으시면 언제든 문의해 주세요!</strong></p>
          
          <div class="footer">
            <p>© 2024 Cutlet. All rights reserved.</p>
            <div class="social-links">
              <a href="#">홈페이지</a> | 
              <a href="#">도움말</a> | 
              <a href="#">문의하기</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  passwordReset: (username: string, resetLink: string) => ({
    subject: `🔐 ${username}님의 비밀번호 재설정 요청`,
    html: `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>비밀번호 재설정</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .warning {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            color: #dc2626;
          }
          .reset-button {
            display: inline-block;
            background-color: #dc2626;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🍖 Cutlet</div>
            <div class="title">비밀번호 재설정</div>
          </div>
          
          <p>안녕하세요, ${username}님!</p>
          
          <p>Cutlet 계정의 비밀번호 재설정을 요청하셨습니다.</p>
          
          <div class="warning">
            <strong>⚠️ 주의사항:</strong><br>
            이 링크는 1시간 후에 만료됩니다.<br>
            본인이 요청하지 않았다면 이 이메일을 무시하세요.
          </div>
          
          <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>
          
          <a href="${resetLink}" class="reset-button">
            🔐 새 비밀번호 설정하기
          </a>
          
          <p>버튼이 작동하지 않는 경우, 아래 링크를 브라우저에 복사하여 붙여넣으세요:</p>
          <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetLink}</p>
          
          <div class="footer">
            <p>© 2024 Cutlet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}
