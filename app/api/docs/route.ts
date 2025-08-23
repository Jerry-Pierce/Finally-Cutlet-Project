import { NextResponse } from 'next/server'

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Cutlet URL Shortener API',
      description: 'URL 단축 서비스를 위한 RESTful API',
      version: '1.0.0',
      contact: {
        name: 'Cutlet Team',
        email: 'support@cutlet.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        description: '개발 서버'
      }
    ],
    paths: {
      '/api/shorten': {
        post: {
          summary: 'URL 단축',
          description: '긴 URL을 짧은 코드로 변환합니다.',
          tags: ['URL'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['originalUrl'],
                  properties: {
                    originalUrl: {
                      type: 'string',
                      format: 'uri',
                      description: '단축할 원본 URL'
                    },
                    customCode: {
                      type: 'string',
                      description: '사용자 정의 단축 코드 (선택사항)'
                    },
                    title: {
                      type: 'string',
                      description: 'URL 제목 (선택사항)'
                    },
                    description: {
                      type: 'string',
                      description: 'URL 설명 (선택사항)'
                    },
                    expiresAt: {
                      type: 'string',
                      format: 'date-time',
                      description: '만료 날짜 (선택사항)'
                    },
                    tags: {
                      type: 'array',
                      items: { type: 'string' },
                      description: '태그 목록 (선택사항)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'URL 단축 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          shortCode: { type: 'string' },
                          customCode: { type: 'string' },
                          shortUrl: { type: 'string' },
                          originalUrl: { type: 'string' },
                          title: { type: 'string' },
                          description: { type: 'string' },
                          expiresAt: { type: 'string' },
                          createdAt: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': { description: '잘못된 요청' },
            '429': { description: '요청 한도 초과' }
          }
        }
      },
      '/api/redirect/{code}': {
        get: {
          summary: 'URL 리다이렉트',
          description: '단축 코드를 원본 URL로 리다이렉트합니다.',
          tags: ['URL'],
          parameters: [
            {
              name: 'code',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: '단축 코드 또는 커스텀 코드'
            }
          ],
          responses: {
            '302': { description: '리다이렉트' },
            '404': { description: 'URL을 찾을 수 없음' },
            '410': { description: 'URL 만료됨' }
          }
        }
      },
      '/api/auth/register': {
        post: {
          summary: '사용자 등록',
          description: '새로운 사용자 계정을 생성합니다.',
          tags: ['인증'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      description: '사용자 이메일'
                    },
                    password: {
                      type: 'string',
                      minLength: 8,
                      description: '사용자 비밀번호'
                    },
                    username: {
                      type: 'string',
                      description: '사용자명 (선택사항)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': { description: '사용자 생성 성공' },
            '400': { description: '잘못된 요청' },
            '409': { description: '이미 존재하는 사용자' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: '사용자 로그인',
          description: '사용자 인증 및 JWT 토큰 발급',
          tags: ['인증'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email'
                    },
                    password: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: '로그인 성공' },
            '401': { description: '인증 실패' },
            '429': { description: '요청 한도 초과' }
          }
        }
      },
      '/api/urls': {
        get: {
          summary: '사용자 URL 목록',
          description: '인증된 사용자의 단축 URL 목록을 조회합니다.',
          tags: ['URL'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              description: '페이지 번호'
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
              description: '페이지당 항목 수'
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: '검색어'
            },
            {
              name: 'tag',
              in: 'query',
              schema: { type: 'string' },
              description: '태그 필터'
            }
          ],
          responses: {
            '200': { description: 'URL 목록 조회 성공' },
            '401': { description: '인증 필요' }
          }
        }
      },
      '/api/analytics': {
        get: {
          summary: 'URL 분석',
          description: '사용자의 URL 클릭 통계 및 분석 데이터',
          tags: ['분석'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'period',
              in: 'query',
              schema: { type: 'string', enum: ['day', 'week', 'month', 'year'] },
              description: '분석 기간'
            }
          ],
          responses: {
            '200': { description: '분석 데이터 조회 성공' },
            '401': { description: '인증 필요' }
          }
        }
      },
      '/api/subscription': {
        get: {
          summary: '구독 상태 조회',
          description: '현재 사용자의 구독 플랜 및 사용량 정보',
          tags: ['구독'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: '구독 정보 조회 성공' },
            '401': { description: '인증 필요' }
          }
        },
        post: {
          summary: '구독 플랜 변경',
          description: '사용자의 구독 플랜을 변경합니다.',
          tags: ['구독'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['plan'],
                  properties: {
                    plan: {
                      type: 'string',
                      enum: ['free', 'premium'],
                      description: '구독할 플랜'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: '플랜 변경 성공' },
            '400': { description: '잘못된 요청' },
            '401': { description: '인증 필요' }
          }
        }
      },
      '/api/tags': {
        get: {
          summary: '태그 목록',
          description: '사용자의 모든 태그를 조회합니다.',
          tags: ['태그'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: '태그 목록 조회 성공' },
            '401': { description: '인증 필요' }
          }
        },
        post: {
          summary: '태그 생성',
          description: '새로운 태그를 생성합니다.',
          tags: ['태그'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: {
                      type: 'string',
                      minLength: 1,
                      maxLength: 50,
                      description: '태그명'
                    },
                    color: {
                      type: 'string',
                      pattern: '^#[0-9A-F]{6}$',
                      description: '태그 색상 (HEX)'
                    },
                    description: {
                      type: 'string',
                      maxLength: 200,
                      description: '태그 설명'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': { description: '태그 생성 성공' },
            '400': { description: '잘못된 요청' },
            '401': { description: '인증 필요' }
          }
        }
      },
      '/api/admin/monitoring': {
        get: {
          summary: '시스템 모니터링',
          description: '시스템 전반의 상태 및 성능 정보',
          tags: ['관리자'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: '모니터링 데이터 조회 성공' },
            '401': { description: '인증 필요' },
            '403': { description: '권한 없음' }
          }
        }
      },
      '/api/admin/performance': {
        get: {
          summary: '성능 모니터링',
          description: '실시간 성능 메트릭 및 시스템 리소스 정보',
          tags: ['관리자'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: '성능 데이터 조회 성공' },
            '401': { description: '인증 필요' },
            '403': { description: '권한 없음' }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                type: { type: 'string' },
                code: { type: 'string' },
                timestamp: { type: 'string' },
                requestId: { type: 'string' }
              }
            },
            details: { type: 'object' },
            help: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            isPremium: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        },
        ShortenedUrl: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            shortCode: { type: 'string' },
            customCode: { type: 'string' },
            originalUrl: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            isActive: { type: 'boolean' },
            expiresAt: { type: 'string' },
            clickCount: { type: 'integer' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            color: { type: 'string' },
            description: { type: 'string' },
            createdAt: { type: 'string' }
          }
        }
      }
    },
    tags: [
      {
        name: 'URL',
        description: 'URL 단축 및 관리 관련 API'
      },
      {
        name: '인증',
        description: '사용자 인증 및 계정 관리 API'
      },
      {
        name: '분석',
        description: '통계 및 분석 데이터 API'
      },
      {
        name: '구독',
        description: '구독 플랜 및 결제 관련 API'
      },
      {
        name: '태그',
        description: '태그 관리 API'
      },
      {
        name: '관리자',
        description: '시스템 관리 및 모니터링 API'
      }
    ]
  }

  return NextResponse.json(openApiSpec)
}
