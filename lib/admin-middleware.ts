import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from './auth-middleware'

export interface AdminRequest extends NextRequest {
  user: {
    id: string
    email: string
    isPremium: boolean
    isAdmin: boolean
  }
}

export async function requireAdmin(request: NextRequest): Promise<AdminRequest> {
  try {
    // 먼저 일반 인증 확인
    const authRequest = await authenticateUser(request)
    
    // 관리자 권한 확인 - cutlet.service@gmail.com 계정만 접근 가능
    if (authRequest.user.email !== 'cutlet.service@gmail.com') {
      return NextResponse.json(
        { error: 'ADMIN_ACCESS_REQUIRED', message: '관리자 권한이 필요합니다.' },
        { status: 403 }
      ) as any
    }

    return authRequest as AdminRequest
  } catch (error) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: '인증이 필요합니다.' },
      { status: 401 }
    ) as any
  }
}

export function requireAdminHandler(handler: (request: AdminRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const adminRequest = await requireAdmin(request)
      if (adminRequest instanceof NextResponse) {
        return adminRequest
      }
      return await handler(adminRequest)
    } catch (error) {
      return NextResponse.json(
        { error: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  }
}
