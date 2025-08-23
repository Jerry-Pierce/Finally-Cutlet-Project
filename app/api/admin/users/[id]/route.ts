import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'

async function handler(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const user = request.user!
    
    // 관리자 권한 확인
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { id } = params

    if (request.method === 'PATCH') {
      // 사용자 정보 업데이트
      const body = await request.json()
      const { isPremium, isActive, isAdmin } = body

      // 자신의 관리자 권한을 해제하려는 경우 방지
      if (id === user.userId && isAdmin === false) {
        return NextResponse.json(
          { error: '자신의 관리자 권한을 해제할 수 없습니다.' },
          { status: 400 }
        )
      }

      // 업데이트할 필드만 포함
      const updateData: any = {}
      if (typeof isPremium === 'boolean') updateData.isPremium = isPremium
      if (typeof isActive === 'boolean') updateData.isActive = isActive
      if (typeof isAdmin === 'boolean') updateData.isAdmin = isAdmin

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: '업데이트할 데이터가 없습니다.' },
          { status: 400 }
        )
      }

      // 사용자 존재 확인
      const existingUser = await db.user.findUnique({
        where: { id },
        select: { id: true, isAdmin: true }
      })

      if (!existingUser) {
        return NextResponse.json(
          { error: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 관리자 권한 변경 시 추가 검증
      if (typeof isAdmin === 'boolean' && isAdmin !== existingUser.isAdmin) {
        // 시스템에 최소 1명의 관리자는 있어야 함
        if (isAdmin === false) {
          const adminCount = await db.user.count({ where: { isAdmin: true } })
          if (adminCount <= 1) {
            return NextResponse.json(
              { error: '시스템에 최소 1명의 관리자가 필요합니다.' },
              { status: 400 }
            )
          }
        }
      }

      // 사용자 정보 업데이트
      const updatedUser = await db.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          username: true,
          isPremium: true,
          isActive: true,
          isAdmin: true,
          updatedAt: true
        }
      })

      return NextResponse.json({
        success: true,
        message: '사용자 정보가 성공적으로 업데이트되었습니다.',
        data: updatedUser
      })

    } else if (request.method === 'DELETE') {
      // 사용자 삭제 (주의: 실제 운영에서는 soft delete 권장)
      const existingUser = await db.user.findUnique({
        where: { id },
        select: { id: true, isAdmin: true }
      })

      if (!existingUser) {
        return NextResponse.json(
          { error: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 관리자 사용자 삭제 방지
      if (existingUser.isAdmin) {
        return NextResponse.json(
          { error: '관리자 사용자는 삭제할 수 없습니다.' },
          { status: 400 }
        )
      }

      // 자신 삭제 방지
      if (id === user.userId) {
        return NextResponse.json(
          { error: '자신을 삭제할 수 없습니다.' },
          { status: 400 }
        )
      }

      // 사용자 삭제 (Cascade로 관련 데이터도 함께 삭제)
      await db.user.delete({
        where: { id }
      })

      return NextResponse.json({
        success: true,
        message: '사용자가 성공적으로 삭제되었습니다.'
      })

    } else if (request.method === 'GET') {
      // 사용자 상세 정보 조회
      const userDetail = await db.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          isPremium: true,
          isActive: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              shortenedUrls: true,
              favorites: true
            }
          }
        }
      })

      if (!userDetail) {
        return NextResponse.json(
          { error: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 사용자별 상세 통계
      const totalClicks = await db.urlClick.count({
        where: {
          shortenedUrl: {
            userId: id
          }
        }
      })

      // 최근 활동
      const lastUrlCreated = await db.shortenedUrl.findFirst({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, title: true, shortCode: true }
      })

      const lastClick = await db.urlClick.findFirst({
        where: {
          shortenedUrl: { userId: id }
        },
        orderBy: { clickedAt: 'desc' },
        select: { clickedAt: true, country: true, city: true }
      })

      // 인기 URL (클릭 수 기준)
      const popularUrls = await db.shortenedUrl.findMany({
        where: { userId: id },
        take: 5,
        orderBy: {
          clicks: {
            _count: 'desc'
          }
        },
        include: {
          _count: {
            select: { clicks: true }
          }
        }
      })

      const userStats = {
        ...userDetail,
        totalClicks,
        lastUrlCreated,
        lastClick,
        popularUrls
      }

      return NextResponse.json({
        success: true,
        data: userStats
      })

    } else {
      return NextResponse.json(
        { error: '지원하지 않는 HTTP 메서드입니다.' },
        { status: 405 }
      )
    }

  } catch (error) {
    console.error('사용자 관리 오류:', error)
    
    return NextResponse.json(
      { error: '사용자 관리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(handler)
export const PATCH = requireAuth(handler)
export const DELETE = requireAuth(handler)
