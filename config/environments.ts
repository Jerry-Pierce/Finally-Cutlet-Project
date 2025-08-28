// 환경별 설정 관리
export type Environment = 'development' | 'staging' | 'production'

// 환경 설정 인터페이스
export interface EnvironmentConfig {
  // 기본 설정
  name: Environment
  debug: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  
  // 서버 설정
  port: number
  host: string
  baseUrl: string
  
  // 데이터베이스 설정
  database: {
    url: string
    poolSize: number
    ssl: boolean
    logging: boolean
  }
  
  // Redis 설정
  redis: {
    url: string
    ttl: number
  }
  
  // 인증 설정
  auth: {
    jwtSecret: string
    jwtExpiresIn: string
    refreshTokenExpiresIn: string
    bcryptRounds: number
  }
  
  // 보안 설정
  security: {
    cors: {
      origin: string[]
      credentials: boolean
    }
    rateLimit: {
      windowMs: number
      maxRequests: number
    }
    helmet: boolean
  }
  
  // 외부 API 설정
  external: {
    geoip: {
      apiKey?: string
      baseUrl: string
    }
    safeBrowsing: {
      apiKey?: string
      baseUrl: string
    }
  }
  
  // 모니터링 설정
  monitoring: {
    enableMetrics: boolean
    enableLogging: boolean
    enableTracing: boolean
    samplingRate: number
  }
  
  // 백업 설정
  backup: {
    enable: boolean
    schedule: string
    retention: number
    storage: 'local' | 's3' | 'gcs'
  }
}

// 환경별 설정값
const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    name: 'development',
    debug: true,
    logLevel: 'debug',
    
    port: 3000,
    host: 'localhost',
    baseUrl: 'http://localhost:3000',
    
    database: {
      url: process.env.DATABASE_URL || 'postgresql://cutlet_user:cutlet_password@localhost:5432/cutlet_db',
      poolSize: 5,
      ssl: false,
      logging: true
    },
    
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      ttl: 1800 // 30분
    },
    
    auth: {
      jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      jwtExpiresIn: '7d',
      refreshTokenExpiresIn: '30d',
      bcryptRounds: 10
    },
    
    security: {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15분
        maxRequests: 100
      },
      helmet: false
    },
    
    external: {
      geoip: {
        apiKey: process.env.GEOIP_API_KEY,
        baseUrl: 'https://ipapi.co'
      },
      safeBrowsing: {
        apiKey: process.env.SAFE_BROWSING_API_KEY,
        baseUrl: 'https://safebrowsing.googleapis.com'
      }
    },
    
    monitoring: {
      enableMetrics: true,
      enableLogging: true,
      enableTracing: false,
      samplingRate: 1.0
    },
    
    backup: {
      enable: false,
      schedule: '0 2 * * *', // 매일 새벽 2시
      retention: 7,
      storage: 'local'
    }
  },
  
  staging: {
    name: 'staging',
    debug: false,
    logLevel: 'info',
    
    port: parseInt(process.env.PORT || '3000'),
    host: '0.0.0.0',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://staging.cutlet.com',
    
    database: {
      url: process.env.DATABASE_URL || '',
      poolSize: 10,
      ssl: true,
      logging: false
    },
    
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      ttl: 1800 // 30분
    },
    
    auth: {
      jwtSecret: process.env.JWT_SECRET || '',
      jwtExpiresIn: '7d',
      refreshTokenExpiresIn: '30d',
      bcryptRounds: 12
    },
    
    security: {
      cors: {
        origin: [
          'https://staging.cutlet.com',
          'https://staging-admin.cutlet.com'
        ],
        credentials: true
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 200
      },
      helmet: true
    },
    
    external: {
      geoip: {
        apiKey: process.env.GEOIP_API_KEY,
        baseUrl: 'https://ipapi.co'
      },
      safeBrowsing: {
        apiKey: process.env.SAFE_BROWSING_API_KEY,
        baseUrl: 'https://safebrowsing.googleapis.com'
      }
    },
    
    monitoring: {
      enableMetrics: true,
      enableLogging: true,
      enableTracing: true,
      samplingRate: 0.1
    },
    
    backup: {
      enable: true,
      schedule: '0 2 * * *',
      retention: 30,
      storage: 's3'
    }
  },
  
  production: {
    name: 'production',
    debug: false,
    logLevel: 'warn',
    
    port: parseInt(process.env.PORT || '3000'),
    host: '0.0.0.0',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://cutlet.com',
    
    database: {
      url: process.env.DATABASE_URL || '',
      poolSize: 20,
      ssl: true,
      logging: false
    },
    
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      ttl: 3600 // 1시간
    },
    
    auth: {
      jwtSecret: process.env.JWT_SECRET || '',
      jwtExpiresIn: '1d',
      refreshTokenExpiresIn: '7d',
      bcryptRounds: 12
    },
    
    security: {
      cors: {
        origin: [
          'https://cutlet.com',
          'https://admin.cutlet.com'
        ],
        credentials: true
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 500
      },
      helmet: true
    },
    
    external: {
      geoip: {
        apiKey: process.env.GEOIP_API_KEY,
        baseUrl: 'https://ipapi.co'
      },
      safeBrowsing: {
        apiKey: process.env.SAFE_BROWSING_API_KEY,
        baseUrl: 'https://safebrowsing.googleapis.com'
      }
    },
    
    monitoring: {
      enableMetrics: true,
      enableLogging: true,
      enableTracing: true,
      samplingRate: 0.01
    },
    
    backup: {
      enable: true,
      schedule: '0 1 * * *', // 매일 새벽 1시
      retention: 90,
      storage: 's3'
    }
  }
}

// 현재 환경 감지
export function getCurrentEnvironment(): Environment {
  const env = process.env.NODE_ENV || 'development'
  
  if (env === 'production') return 'production'
  if (env === 'staging') return 'staging'
  return 'development'
}

// 환경별 설정 가져오기
export function getConfig(): EnvironmentConfig {
  const env = getCurrentEnvironment()
  return configs[env]
}

// 특정 환경의 설정 가져오기
export function getConfigForEnvironment(environment: Environment): EnvironmentConfig {
  return configs[environment]
}

// 환경별 설정 검증
export function validateConfig(config: EnvironmentConfig): string[] {
  const errors: string[] = []
  
  if (!config.database.url) {
    errors.push('DATABASE_URL이 설정되지 않았습니다.')
  }
  
  if (!config.auth.jwtSecret) {
    errors.push('JWT_SECRET이 설정되지 않았습니다.')
  }
  
  if (config.name === 'production' && config.debug) {
    errors.push('프로덕션 환경에서 debug가 활성화되어 있습니다.')
  }
  
  if (config.name === 'production' && !config.security.helmet) {
    errors.push('프로덕션 환경에서 helmet이 비활성화되어 있습니다.')
  }
  
  return errors
}

// 환경별 설정 출력 (개발용)
export function printConfig(): void {
  const config = getConfig()
  const errors = validateConfig(config)
  
  console.log('🔧 환경 설정:')
  console.log(`   환경: ${config.name}`)
  console.log(`   포트: ${config.port}`)
  console.log(`   베이스 URL: ${config.baseUrl}`)
  console.log(`   디버그: ${config.debug}`)
  console.log(`