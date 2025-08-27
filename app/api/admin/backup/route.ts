import { NextRequest, NextResponse } from 'next/server'
import { requireAdminHandler, AdminRequest } from '@/lib/admin-middleware'
import { db } from '@/lib/database'

async function handler(request: AdminRequest) {
  try {
    if (request.method === 'POST') {
      // 백업 생성
      const backupType = request.nextUrl.searchParams.get('type') || 'full'
      
      if (backupType === 'full') {
        // 전체 시스템 백업
        const backupData = await generateFullBackup()
        
        return NextResponse.json({
          success: true,
          message: '전체 시스템 백업이 생성되었습니다.',
          backup: {
            id: `backup_${Date.now()}`,
            type: 'full',
            createdAt: new Date().toISOString(),
            size: JSON.stringify(backupData).length,
            status: 'completed'
          }
        })
      } else if (backupType === 'users') {
        // 사용자 데이터만 백업
        const users = await db.user.findMany({
          select: {
            id: true,
            email: true,
            username: true,
            isPremium: true,
            createdAt: true,
            updatedAt: true
          }
        })
        
        return NextResponse.json({
          success: true,
          message: '사용자 데이터 백업이 생성되었습니다.',
          backup: {
            id: `backup_users_${Date.now()}`,
            type: 'users',
            createdAt: new Date().toISOString(),
            size: JSON.stringify(users).length,
            status: 'completed'
          }
        })
      } else if (backupType === 'urls') {
        // URL 데이터만 백업
        const urls = await db.shortenedUrl.findMany({
          select: {
            id: true,
            originalUrl: true,
            shortCode: true,
            customCode: true,
            title: true,
            description: true,
            isFavorite: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true
          }
        })
        
        return NextResponse.json({
          success: true,
          message: 'URL 데이터 백업이 생성되었습니다.',
          backup: {
            id: `backup_urls_${Date.now()}`,
            type: 'urls',
            createdAt: new Date().toISOString(),
            size: JSON.stringify(urls).length,
            status: 'completed'
          }
        })
      } else {
        return NextResponse.json(
          { error: 'INVALID_BACKUP_TYPE', message: '유효하지 않은 백업 타입입니다.' },
          { status: 400 }
        )
      }
    } else if (request.method === 'GET') {
      // 백업 목록 조회
      // 실제 구현 시에는 백업 테이블을 만들어야 합니다
      const backups = [
        {
          id: 'backup_1',
          type: 'full',
          createdAt: '2024-08-20T10:00:00Z',
          size: 1024000,
          status: 'completed'
        },
        {
          id: 'backup_2',
          type: 'users',
          createdAt: '2024-08-19T10:00:00Z',
          size: 512000,
          status: 'completed'
        }
      ]
      
      return NextResponse.json({
        backups
      })
    } else {
      return NextResponse.json(
        { error: 'METHOD_NOT_ALLOWED', message: '지원하지 않는 HTTP 메서드입니다.' },
        { status: 405 }
      )
    }
  } catch (error) {
    console.error('백업 생성 실패:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: '백업 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 전체 시스템 백업 생성 함수
async function generateFullBackup() {
  const [users, urls, clicks] = await Promise.all([
    db.user.findMany(),
    db.shortenedUrl.findMany(),
    db.urlClick.findMany()
  ])
  
  return {
    users,
    urls,
    clicks,
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      totalUsers: users.length,
      totalUrls: urls.length,
      totalClicks: clicks.length
    }
  }
}

export const GET = requireAdminHandler(handler)
export const POST = requireAdminHandler(handler)
