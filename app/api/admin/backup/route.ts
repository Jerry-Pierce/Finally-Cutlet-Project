import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user!
    
    // 관리자 권한 확인
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'full' // full, users, urls, analytics
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = join(process.cwd(), 'backups')
    
    // 백업 디렉토리 생성
    try {
      await mkdir(backupDir, { recursive: true })
    } catch (error) {
      console.error('백업 디렉토리 생성 오류:', error)
    }

    let backupData: any = {}
    let filename = ''

    switch (type) {
      case 'full':
        // 전체 데이터 백업
        backupData = await createFullBackup()
        filename = `full-backup-${timestamp}.json`
        break
        
      case 'users':
        // 사용자 데이터만 백업
        backupData = await createUsersBackup()
        filename = `users-backup-${timestamp}.json`
        break
        
      case 'urls':
        // URL 데이터만 백업
        backupData = await createUrlsBackup()
        filename = `urls-backup-${timestamp}.json`
        break
        
      case 'analytics':
        // 분석 데이터만 백업
        backupData = await createAnalyticsBackup()
        filename = `analytics-backup-${timestamp}.json`
        break
        
      default:
        return NextResponse.json(
          { error: '잘못된 백업 타입입니다.' },
          { status: 400 }
        )
    }

    // 백업 파일 저장
    const backupPath = join(backupDir, filename)
    await writeFile(backupPath, JSON.stringify(backupData, null, 2), 'utf-8')

    // PostgreSQL 덤프 생성 (선택적)
    if (type === 'full' && process.env.DATABASE_URL) {
      try {
        const dumpFilename = `db-dump-${timestamp}.sql`
        const dumpPath = join(backupDir, dumpFilename)
        
        // pg_dump 명령어 실행
        const { stdout, stderr } = await execAsync(
          `pg_dump "${process.env.DATABASE_URL}" > "${dumpPath}"`
        )
        
        if (stderr) {
          console.warn('pg_dump 경고:', stderr)
        }
        
        backupData.databaseDump = dumpFilename
      } catch (error) {
        console.error('PostgreSQL 덤프 생성 오류:', error)
        // 덤프 실패는 전체 백업에 영향을 주지 않음
      }
    }

    // 백업 메타데이터 생성
    const backupMetadata = {
      timestamp: new Date().toISOString(),
      type,
      filename,
      size: JSON.stringify(backupData).length,
      recordCount: getRecordCount(backupData),
      createdBy: user.userId
    }

    // 메타데이터 파일 저장
    const metadataPath = join(backupDir, `metadata-${timestamp}.json`)
    await writeFile(metadataPath, JSON.stringify(backupMetadata, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      message: '백업이 성공적으로 생성되었습니다.',
      data: {
        filename,
        metadata: backupMetadata,
        backupPath: backupPath.replace(process.cwd(), ''),
        downloadUrl: `/api/admin/backup/download/${filename}`
      }
    })

  } catch (error) {
    console.error('백업 생성 오류:', error)
    
    return NextResponse.json(
      { error: '백업 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 전체 데이터 백업
async function createFullBackup() {
  const [
    users,
    shortenedUrls,
    tags,
    urlTags,
    urlClicks,
    favorites,
    notifications
  ] = await Promise.all([
    db.user.findMany(),
    db.shortenedUrl.findMany(),
    db.tag.findMany(),
    db.urlTag.findMany(),
    db.urlClick.findMany(),
    db.favorite.findMany(),
    db.notification.findMany()
  ])

  return {
    users,
    shortenedUrls,
    tags,
    urlTags,
    urlClicks,
    favorites,
    notifications,
    backupInfo: {
      totalUsers: users.length,
      totalUrls: shortenedUrls.length,
      totalClicks: urlClicks.length,
      totalTags: tags.length
    }
  }
}

// 사용자 데이터 백업
async function createUsersBackup() {
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      isPremium: true,
      createdAt: true,
      updatedAt: true
      // 비밀번호 해시는 제외
    }
  })

  return {
    users,
    backupInfo: {
      totalUsers: users.length,
      premiumUsers: users.filter(u => u.isPremium).length
    }
  }
}

// URL 데이터 백업
async function createUrlsBackup() {
  const [shortenedUrls, tags, urlTags] = await Promise.all([
    db.shortenedUrl.findMany(),
    db.tag.findMany(),
    db.urlTag.findMany()
  ])

  return {
    shortenedUrls,
    tags,
    urlTags,
    backupInfo: {
      totalUrls: shortenedUrls.length,
      totalTags: tags.length,
      activeUrls: shortenedUrls.filter(u => !u.expiresAt || u.expiresAt > new Date()).length
    }
  }
}

// 분석 데이터 백업
async function createAnalyticsBackup() {
  const [urlClicks, favorites, notifications] = await Promise.all([
    db.urlClick.findMany(),
    db.favorite.findMany(),
    db.notification.findMany()
  ])

  return {
    urlClicks,
    favorites,
    notifications,
    backupInfo: {
      totalClicks: urlClicks.length,
      totalFavorites: favorites.length,
      totalNotifications: notifications.length
    }
  }
}

// 레코드 수 계산
function getRecordCount(data: any): Record<string, number> {
  const counts: Record<string, number> = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      counts[key] = value.length
    }
  }
  
  return counts
}

export const POST = requireAuth(handler)
