import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { withRateLimit, rateLimiters } from '@/lib/rate-limiter'
import { db } from '@/lib/database'

// 로그인 요청 스키마
const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('Login API called')
    
    // Rate Limiting 적용 (인증 시도 제한)
    const rateLimitResult = await withRateLimit(request, rateLimiters.auth)
    
    if (!rateLimitResult.success) {
      console.log('Rate limit exceeded for login attempt')
      return NextResponse.json(
        { 
          error: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: rateLimitResult.retryAfter,
          limit: rateLimitResult.limit,
          reset: rateLimitResult.reset
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '900',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString()
          }
        }
      )
    }

    const body = await request.json()
    console.log('Login request body:', { email: body.email, password: '[HIDDEN]' })
    
    const validatedData = loginSchema.parse(body)
    
    const { email, password } = validatedData

    console.log('Looking for user with email:', email)

    // 사용자 찾기
    const user = await db.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('User not found for email:', email)
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    console.log('User found, checking password')

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    console.log('Password valid, generating JWT token')

    // JWT 토큰 생성
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        isPremium: user.isPremium 
      },
      jwtSecret,
      { expiresIn: '7d' }
    )

    // 비밀번호 해시는 제외하고 응답
    const { passwordHash: _, ...userWithoutPassword } = user

    console.log('Login successful for user:', email)

    // 쿠키에 토큰 설정
    const response = NextResponse.json({
      success: true,
      message: '로그인이 완료되었습니다.',
      data: {
        user: userWithoutPassword,
        token
      }
    })

    // HTTP-only 쿠키로 토큰 설정
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/'
    })

    console.log('Auth token cookie set successfully')

    return response

  } catch (error) {
    console.error('로그인 오류:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
