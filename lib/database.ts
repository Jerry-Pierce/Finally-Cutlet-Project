import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// 데이터베이스 연결 테스트
export async function testConnection() {
  try {
    await db.$connect()
    console.log('✅ 데이터베이스 연결 성공')
    return true
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error)
    return false
  }
}

// 데이터베이스 연결 해제
export async function disconnect() {
  try {
    await db.$disconnect()
    console.log('✅ 데이터베이스 연결 해제')
  } catch (error) {
    console.error('❌ 데이터베이스 연결 해제 실패:', error)
  }
}

// 애플리케이션 종료 시 연결 해제
process.on('beforeExit', async () => {
  await disconnect()
})
