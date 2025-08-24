import { NextRequest, NextResponse } from 'next/server'
import { testEmailConnection } from '@/lib/email'

export async function GET() {
  try {
    const isConnected = await testEmailConnection()
    
    if (isConnected) {
      return NextResponse.json(
        { 
          success: true, 
          message: '이메일 서버 연결 성공!',
          config: {
            server: process.env.MAIL_SERVER,
            port: process.env.MAIL_PORT,
            username: process.env.MAIL_USERNAME,
            tls: process.env.MAIL_USE_TLS
          }
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: '이메일 서버 연결 실패',
          config: {
            server: process.env.MAIL_SERVER,
            port: process.env.MAIL_PORT,
            username: process.env.MAIL_USERNAME,
            tls: process.env.MAIL_USE_TLS
          }
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('이메일 테스트 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '이메일 테스트 중 오류 발생',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
