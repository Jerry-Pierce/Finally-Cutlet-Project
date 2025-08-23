import { GET } from '@/app/api/public/stats/route'

// Prisma 클라이언트를 모킹
jest.mock('@/lib/database', () => ({
  db: {
    user: {
      count: jest.fn().mockResolvedValue(100),
    },
    shortenedUrl: {
      count: jest.fn().mockResolvedValue(500),
    },
    urlClick: {
      count: jest.fn().mockResolvedValue(1000),
    },
    tag: {
      findMany: jest.fn().mockResolvedValue([
        { name: 'tech', count: 50 },
        { name: 'news', count: 30 },
      ]),
    },
  },
}))

// Redis를 모킹
jest.mock('@/lib/redis', () => ({
  cache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
  },
}))

describe('Public Stats API', () => {
  it('returns 200 status with statistics data', async () => {
    const response = await GET()
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('success')
    expect(data.success).toBe(true)
    expect(data).toHaveProperty('data')
  })

  it('includes all required statistics fields', async () => {
    const response = await GET()
    
    const data = await response.json()
    const stats = data.data
    
    expect(stats).toHaveProperty('users')
    expect(stats).toHaveProperty('urls')
    expect(stats).toHaveProperty('clicks')
    expect(stats).toHaveProperty('trends')
    expect(stats).toHaveProperty('system')
  })

  it('returns correct data structure for users', async () => {
    const response = await GET()
    
    const data = await response.json()
    const users = data.data.users
    
    expect(users).toHaveProperty('total')
    expect(users).toHaveProperty('premium')
    expect(users).toHaveProperty('premiumPercentage')
    expect(typeof users.total).toBe('number')
    expect(typeof users.premium).toBe('number')
  })

  it('returns correct data structure for urls', async () => {
    const response = await GET()
    
    const data = await response.json()
    const urls = data.data.urls
    
    expect(urls).toHaveProperty('total')
    expect(urls).toHaveProperty('active')
    expect(urls).toHaveProperty('today')
    expect(urls).toHaveProperty('thisWeek')
    expect(urls).toHaveProperty('growthRate')
  })
})
