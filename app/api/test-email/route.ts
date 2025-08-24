import { NextRequest, NextResponse } from 'next/server'
import { testEmailService, sendWelcomeEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { action, email, username } = await request.json()
    
    if (action === 'test') {
      // 이메일 서비스 연결 테스트
      const result = await testEmailService()
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: '이메일 서비스 테스트 성공',
          messageId: result.messageId
        })
      } else {
        return NextResponse.json({
          success: false,
          error: '이메일 서비스 테스트 실패',
          details: result.error
        }, { status: 500 })
      }
    }
    
    if (action === 'welcome' && email && username) {
      // 환영 이메일 테스트 전송
      const result = await sendWelcomeEmail(email, username)
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: '환영 이메일 전송 성공',
          messageId: result.messageId
        })
      } else {
        return NextResponse.json({
          success: false,
          error: '환영 이메일 전송 실패',
          details: result.error
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: '잘못된 요청입니다. action, email, username을 확인해주세요.'
    }, { status: 400 })
    
  } catch (error) {
    console.error('이메일 테스트 API 오류:', error)
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
