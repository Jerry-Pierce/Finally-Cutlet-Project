import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'
import bcrypt from 'bcryptjs'

async function handler(request: AuthenticatedRequest) {
  try {
    const userId = request.user!.userId

    if (request.method === 'GET') {
      // 기존 프로필 조회 로직
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          isPremium: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!user) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
      }

      // URL 및 즐겨찾기 개수 조회
      const [urlCount, favoriteCount] = await Promise.all([
        db.shortenedUrl.count({ where: { userId } }),
        db.favorite.count({ where: { userId } })
      ])

      const profile = {
        ...user,
        stats: {
          totalUrls: urlCount,
          totalFavorites: favoriteCount
        }
      }

      return NextResponse.json({ success: true, data: profile })
    }

    if (request.method === 'PATCH') {
      const body = await request.json()
      const { username, currentPassword, newPassword, email } = body

      const updateData: any = {}

      // 사용자명 업데이트
      if (username && username.trim()) {
        // 중복 확인
        const existingUser = await db.user.findFirst({
          where: { username: username.trim(), NOT: { id: userId } }
        })
        if (existingUser) {
          return NextResponse.json({ error: '이미 사용 중인 사용자명입니다.' }, { status: 400 })
        }
        updateData.username = username.trim()
      }

      // 이메일 업데이트
      if (email && email.trim()) {
        // 중복 확인
        const existingUser = await db.user.findFirst({
          where: { email: email.trim(), NOT: { id: userId } }
        })
        if (existingUser) {
          return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 400 })
        }
        updateData.email = email.trim()
      }

      // 비밀번호 변경
      if (currentPassword && newPassword) {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { passwordHash: true }
        })

        if (!user) {
          return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
        }

        // 현재 비밀번호 확인
        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!isValidPassword) {
          return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 })
        }

        // 새 비밀번호 해시화
        const saltRounds = 12
        updateData.passwordHash = await bcrypt.hash(newPassword, saltRounds)
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: '업데이트할 데이터가 없습니다.' }, { status: 400 })
      }

      // 사용자 정보 업데이트
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          username: true,
          isPremium: true,
          updatedAt: true
        }
      })

      return NextResponse.json({
        success: true,
        message: '프로필이 성공적으로 업데이트되었습니다.',
        data: updatedUser
      })
    }

    return NextResponse.json({ error: '지원하지 않는 HTTP 메서드입니다.' }, { status: 405 })
  } catch (error) {
    console.error('프로필 처리 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export const GET = requireAuth(handler)
export const PATCH = requireAuth(handler)
