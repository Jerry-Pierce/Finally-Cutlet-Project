import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function middleware(request: NextRequest) {
  try {
    // 현재 경로 확인
    const { pathname } = request.nextUrl
    
    // 정적 파일이나 API 라우트는 건너뛰기
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/static') ||
      pathname.includes('.')
    ) {
      return NextResponse.next()
    }

    // 쿠키에서 세션 정보 가져오기
    const authToken = request.cookies.get('auth-token')?.value
    const refreshToken = request.cookies.get('refresh-token')?.value

    // 응답 객체 생성
    const response = NextResponse.next()

    // 인증 토큰이 있는 경우
    if (authToken) {
      try {
        // Supabase 세션 확인
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (session && !error) {
          // 세션이 유효한 경우, 쿠키 갱신
          const expiresAt = new Date(session.expires_at! * 1000)
          
          // 인증 토큰 쿠키 설정
          response.cookies.set('auth-token', session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: expiresAt,
            path: '/'
          })

          // 사용자 정보 쿠키 설정
          if (session.user) {
            response.cookies.set('user-info', JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              created_at: session.user.created_at
            }), {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              expires: expiresAt,
              path: '/'
            })
          }

          console.log('✅ 세션 유지됨:', session.user?.email)
        } else {
          // 세션이 만료된 경우, 리프레시 토큰으로 갱신 시도
          if (refreshToken) {
            const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession({
              refresh_token: refreshToken
            })

            if (newSession && !refreshError) {
              // 새로운 세션으로 쿠키 갱신
              const newExpiresAt = new Date(newSession.expires_at! * 1000)
              
              response.cookies.set('auth-token', newSession.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                expires: newExpiresAt,
                path: '/'
              })

              if (newSession.user) {
                response.cookies.set('user-info', JSON.stringify({
                  id: newSession.user.id,
                  email: newSession.user.email,
                  created_at: newSession.user.created_at
                }), {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                  expires: newExpiresAt,
                  path: '/'
                })
              }

              console.log('✅ 세션 갱신됨:', newSession.user?.email)
            } else {
              // 리프레시 실패 시 쿠키 삭제
              response.cookies.delete('auth-token')
              response.cookies.delete('refresh-token')
              response.cookies.delete('user-info')
              console.log('❌ 세션 갱신 실패, 쿠키 삭제됨')
            }
          } else {
            // 리프레시 토큰이 없는 경우 쿠키 삭제
            response.cookies.delete('auth-token')
            response.cookies.delete('user-info')
            console.log('❌ 리프레시 토큰 없음, 쿠키 삭제됨')
          }
        }
      } catch (error) {
        console.error('세션 확인 중 오류:', error)
        // 오류 발생 시 쿠키 삭제
        response.cookies.delete('auth-token')
        response.cookies.delete('refresh-token')
        response.cookies.delete('user-info')
      }
    }

    return response

  } catch (error) {
    console.error('Middleware 오류:', error)
    return NextResponse.next()
  }
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
