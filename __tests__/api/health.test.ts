import { GET } from '@/app/api/health/route'

// Prisma 클라이언트를 모킹 (즉시 응답)
jest.mock('@/lib/database', () => ({
  db: {
    user: {
      count: jest.fn().mockResolvedValue(100),
    },
  },
}))

// Redis를 모킹 (즉시 응답)
jest.mock('@/lib/redis', () => ({
  cache: {
    ping: jest.fn().mockResolvedValue(true),
  },
}))

// Logger를 모킹
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

// OS 모듈 모킹 (건강한 시스템 상태로 설정)
jest.mock('os', () => ({
  totalmem: jest.fn().mockReturnValue(8 * 1024 * 1024 * 1024), // 8GB
  freemem: jest.fn().mockReturnValue(4 * 1024 * 1024 * 1024), // 4GB 여유 (50% 사용률)
  cpus: jest.fn().mockReturnValue([
    { times: { user: 100, nice: 0, sys: 50, idle: 850, irq: 0 } }, // 15% 사용률
    { times: { user: 100, nice: 0, sys: 50, idle: 850, irq: 0 } }
  ]),
  loadavg: jest.fn().mockReturnValue([0.5, 0.3, 0.2]), // 낮은 로드 평균
  platform: jest.fn().mockReturnValue('darwin'),
  arch: jest.fn().mockReturnValue('x64'),
  hostname: jest.fn().mockReturnValue('test-host')
}))

describe('Health API', () => {
  it('returns 200 status with health information', async () => {
    const response = await GET()
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('timestamp')
    expect(data.status).toBe('healthy')
  })

  it('includes required health check fields', async () => {
    const response = await GET()
    
    const data = await response.json()
    
    expect(data).toHaveProperty('uptime')
    expect(data).toHaveProperty('environment')
    expect(data).toHaveProperty('version')
  })
})
