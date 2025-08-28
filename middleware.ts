import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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

    // 응답 객체 생성
    const response = NextResponse.next()

    // Supabase 클라이언트 생성 (createServerClient 사용)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // 현재 세션 가져오기
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('세션 가져오기 오류:', sessionError)
      return response
    }

    if (session) {
      // 세션이 있는 경우, 세션 갱신 시도
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.error('세션 갱신 오류:', refreshError)
        // 세션 갱신 실패 시 쿠키 정리
        response.cookies.set('sb-access-token', '', { maxAge: 0 })
        response.cookies.set('sb-refresh-token', '', { maxAge: 0 })
        return response
      }

      if (refreshedSession) {
        // 세션 갱신 성공 시 쿠키 업데이트
        const expiresAt = new Date(refreshedSession.expires_at! * 1000)
        
        // 사용자 정보 쿠키 설정
        response.cookies.set('user-info', JSON.stringify({
          id: refreshedSession.user.id,
          email: refreshedSession.user.email,
          created_at: refreshedSession.user.created_at,
          last_sign_in_at: refreshedSession.user.last_sign_in_at
        }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: expiresAt,
          path: '/'
        })

        console.log('✅ 세션 유지됨:', refreshedSession.user?.email)
      } else {
        // 세션이 만료된 경우 쿠키 정리
        response.cookies.set('sb-access-token', '', { maxAge: 0 })
        response.cookies.set('sb-refresh-token', '', { maxAge: 0 })
        response.cookies.set('user-info', '', { maxAge: 0 })
        console.log('❌ 세션 만료됨, 쿠키 정리됨')
      }
    } else {
      // 세션이 없는 경우 쿠키 정리
      response.cookies.set('sb-access-token', '', { maxAge: 0 })
      response.cookies.set('sb-refresh-token', '', { maxAge: 0 })
      response.cookies.set('user-info', '', { maxAge: 0 })
      console.log('ℹ️ 세션 없음, 쿠키 정리됨')
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
