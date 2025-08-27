import { SupportedLanguage } from './language-detector';

// 추가 언어 이메일 템플릿 (중국어, 프랑스어, 독일어)
export const additionalEmailTemplates = {
  // 중국어
  zh: {
    welcome: (username: string) => ({
      subject: `🎉 欢迎来到Cutlet，${username}！`,
      html: `
        <!DOCTYPE html>
        <html lang="zh">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>欢迎来到Cutlet</title>
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
              <div class="welcome-text">欢迎！</div>
              <div class="subtitle">欢迎使用我们的URL缩短服务</div>
            </div>
            
            <p>您好，<strong>${username}</strong>！</p>
            <p>感谢您加入Cutlet。现在您可以将长URL转换为短而难忘的链接。</p>
            
            <div class="features">
              <div class="feature-item">
                <div class="feature-icon">🔗</div>
                <span>无限URL缩短</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📊</div>
                <span>详细点击分析</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📱</div>
                <span>QR码生成</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🏷️</div>
                <span>标签管理</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://cutlet.com" class="cta-button">立即开始</a>
            </div>
            
            <div class="footer">
              <p>如果您有任何问题，请随时联系我们。</p>
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    
    passwordReset: (username: string, resetLink: string) => ({
      subject: '🔐 Cutlet密码重置',
      html: `
        <!DOCTYPE html>
        <html lang="zh">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>密码重置</title>
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
              <h2>密码重置</h2>
            </div>
            
            <p>您好，<strong>${username}</strong>！</p>
            <p>您请求重置密码。点击下面的按钮设置新密码。</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="reset-button">重置密码</a>
            </div>
            
            <p><strong>重要提示：</strong></p>
            <ul>
              <li>此链接将在1小时后过期</li>
              <li>如果您没有请求密码重置，请忽略此邮件</li>
              <li>为了安全起见，请不要与任何人分享此链接</li>
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
      subject: '✅ Cutlet邮箱验证',
      html: `
        <!DOCTYPE html>
        <html lang="zh">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>邮箱验证</title>
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
              <h2>邮箱验证</h2>
            </div>
            
            <p>您好，<strong>${username}</strong>！</p>
            <p>请在下面输入验证码以验证您的Cutlet账户：</p>
            
            <div class="verification-code">${verificationCode}</div>
            
            <p>此验证码将在10分钟后过期。</p>
            
            <div class="footer">
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  },

  // 프랑스어
  fr: {
    welcome: (username: string) => ({
      subject: `🎉 Bienvenue sur Cutlet, ${username} !`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue sur Cutlet</title>
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
              <div class="welcome-text">Bienvenue !</div>
              <div class="subtitle">Bienvenue dans notre service de raccourcissement d'URL</div>
            </div>
            
            <p>Bonjour, <strong>${username}</strong> !</p>
            <p>Merci de rejoindre Cutlet. Vous pouvez maintenant transformer de longues URLs en liens courts et mémorables.</p>
            
            <div class="features">
              <div class="feature-item">
                <div class="feature-icon">🔗</div>
                <span>Raccourcissement d'URL illimité</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📊</div>
                <span>Analyses détaillées des clics</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📱</div>
                <span>Génération de codes QR</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🏷️</div>
                <span>Gestion des tags</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://cutlet.com" class="cta-button">Commencer maintenant</a>
            </div>
            
            <div class="footer">
              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    
    passwordReset: (username: string, resetLink: string) => ({
      subject: '🔐 Réinitialisation du mot de passe Cutlet',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation du mot de passe</title>
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
              <h2>Réinitialisation du mot de passe</h2>
            </div>
            
            <p>Bonjour, <strong>${username}</strong> !</p>
            <p>Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="reset-button">Réinitialiser le mot de passe</a>
            </div>
            
            <p><strong>Important :</strong></p>
            <ul>
              <li>Ce lien expire dans 1 heure</li>
              <li>Si vous n'avez pas demandé de réinitialisation, ignorez cet e-mail</li>
              <li>Pour la sécurité, ne partagez pas ce lien avec qui que ce soit</li>
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
      subject: '✅ Vérification de l\'e-mail Cutlet',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vérification de l'e-mail</title>
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
              <h2>Vérification de l'e-mail</h2>
            </div>
            
            <p>Bonjour, <strong>${username}</strong> !</p>
            <p>Veuillez entrer le code de vérification ci-dessous pour vérifier votre compte Cutlet :</p>
            
            <div class="verification-code">${verificationCode}</div>
            
            <p>Ce code de vérification expire dans 10 minutes.</p>
            
            <div class="footer">
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  },

  // 독일어
  de: {
    welcome: (username: string) => ({
      subject: `🎉 Willkommen bei Cutlet, ${username}!`,
      html: `
        <!DOCTYPE html>
        <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Willkommen bei Cutlet</title>
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
              <div class="welcome-text">Willkommen!</div>
              <div class="subtitle">Willkommen bei unserem URL-Verkürzungsdienst</div>
            </div>
            
            <p>Hallo, <strong>${username}</strong>!</p>
            <p>Vielen Dank, dass Sie Cutlet beigetreten sind. Sie können jetzt lange URLs in kurze, einprägsame Links umwandeln.</p>
            
            <div class="features">
              <div class="feature-item">
                <div class="feature-icon">🔗</div>
                <span>Unbegrenzte URL-Verkürzung</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📊</div>
                <span>Detaillierte Klick-Analysen</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📱</div>
                <span>QR-Code-Generierung</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🏷️</div>
                <span>Tag-Verwaltung</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://cutlet.com" class="cta-button">Jetzt starten</a>
            </div>
            
            <div class="footer">
              <p>Falls Sie Fragen haben, zögern Sie nicht, uns zu kontaktieren.</p>
              <p>© 2025 Cutlet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    
    passwordReset: (username: string, resetLink: string) => ({
      subject: '🔐 Cutlet Passwort zurücksetzen',
      html: `
        <!DOCTYPE html>
        <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Passwort zurücksetzen</title>
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
              <h2>Passwort zurücksetzen</h2>
            </div>
            
            <p>Hallo, <strong>${username}</strong>!</p>
            <p>Sie haben eine Passwort-Zurücksetzung angefordert. Klicken Sie auf den Button unten, um ein neues Passwort zu setzen.</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="reset-button">Passwort zurücksetzen</a>
            </div>
            
            <p><strong>Wichtig:</strong></p>
            <ul>
              <li>Dieser Link läuft in 1 Stunde ab</li>
              <li>Wenn Sie keine Passwort-Zurücksetzung angefordert haben, ignorieren Sie diese E-Mail</li>
              <li>Aus Sicherheitsgründen teilen Sie diesen Link nicht mit anderen</li>
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
      subject: '✅ Cutlet E-Mail-Verifizierung',
      html: `
        <!DOCTYPE html>
        <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>E-Mail-Verifizierung</title>
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
              <h2>E-Mail-Verifizierung</h2>
            </div>
            
            <p>Hallo, <strong>${username}</strong>!</p>
            <p>Bitte geben Sie den Verifizierungscode unten ein, um Ihr Cutlet-Konto zu verifizieren:</p>
            
            <div class="verification-code">${verificationCode}</div>
            
            <p>Dieser Verifizierungscode läuft in 10 Minuten ab.</p>
            
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
