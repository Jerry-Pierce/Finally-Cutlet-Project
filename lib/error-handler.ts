import { NextRequest, NextResponse } from 'next/server'
import { logger, log } from './logger'

// 에러 타입 정의
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  INTERNAL = 'INTERNAL',
  NETWORK = 'NETWORK'
}

// 에러 심각도 레벨
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// 커스텀 에러 클래스
export class AppError extends Error {
  public type: ErrorType
  public severity: ErrorSeverity
  public statusCode: number
  public isOperational: boolean
  public metadata?: Record<string, any>

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isOperational: boolean = true,
    metadata?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.metadata = metadata

    // 스택 트레이스 유지
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

// 에러 응답 인터페이스
export interface ErrorResponse {
  error: {
    message: string
    type: string
    code: string
    timestamp: string
    requestId?: string
  }
  details?: any
  help?: string
}

// 에러 타입별 상태 코드 매핑
const ERROR_STATUS_CODES: Record<ErrorType, number> = {
  [ErrorType.VALIDATION]: 400,
  [ErrorType.AUTHENTICATION]: 401,
  [ErrorType.AUTHORIZATION]: 403,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.RATE_LIMIT]: 429,
  [ErrorType.DATABASE]: 500,
  [ErrorType.EXTERNAL_API]: 502,
  [ErrorType.INTERNAL]: 500,
  [ErrorType.NETWORK]: 503
}

// 에러 타입별 사용자 친화적 메시지
const USER_FRIENDLY_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.VALIDATION]: '입력 데이터가 올바르지 않습니다.',
  [ErrorType.AUTHENTICATION]: '로그인이 필요합니다.',
  [ErrorType.AUTHORIZATION]: '접근 권한이 없습니다.',
  [ErrorType.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ErrorType.RATE_LIMIT]: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  [ErrorType.DATABASE]: '데이터베이스 오류가 발생했습니다.',
  [ErrorType.EXTERNAL_API]: '외부 서비스 연결에 실패했습니다.',
  [ErrorType.INTERNAL]: '서버 오류가 발생했습니다.',
  [ErrorType.NETWORK]: '네트워크 연결에 문제가 있습니다.'
}

// 에러 심각도별 로그 레벨
const SEVERITY_LOG_LEVELS: Record<ErrorSeverity, 'warn' | 'error' | 'fatal'> = {
  [ErrorSeverity.LOW]: 'warn',
  [ErrorSeverity.MEDIUM]: 'error',
  [ErrorSeverity.HIGH]: 'error',
  [ErrorSeverity.CRITICAL]: 'fatal'
}

// 에러 핸들러 클래스
export class ErrorHandler {
  private static instance: ErrorHandler

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // 에러 처리 및 로깅
  handleError(error: Error | AppError, context?: string, metadata?: Record<string, any>): void {
    if (error instanceof AppError) {
      this.handleAppError(error, context, metadata)
    } else {
      this.handleGenericError(error, context, metadata)
    }
  }

  // AppError 처리
  private handleAppError(error: AppError, context?: string, metadata?: Record<string, any>): void {
    const logLevel = SEVERITY_LOG_LEVELS[error.severity]
    const logContext = context || 'ERROR_HANDLER'
    
    const logMetadata = {
      ...metadata,
      errorType: error.type,
      severity: error.severity,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      stack: error.stack
    }

    // 로그 출력
    if (logLevel === 'fatal') {
      logger.fatal(error.message, error, logContext, logMetadata)
    } else if (logLevel === 'error') {
      logger.error(error.message, error, logContext, logMetadata)
    } else {
      logger.warn(error.message, logContext, logMetadata)
    }

    // 심각한 에러는 추가 알림 (예: Slack, 이메일 등)
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.sendCriticalErrorAlert(error, logMetadata)
    }
  }

  // 일반 에러 처리
  private handleGenericError(error: Error, context?: string, metadata?: Record<string, any>): void {
    const logContext = context || 'ERROR_HANDLER'
    
    const logMetadata = {
      ...metadata,
      errorName: error.name,
      stack: error.stack
    }

    logger.error(error.message, error, logContext, logMetadata)
  }

  // 심각한 에러 알림 전송
  private sendCriticalErrorAlert(error: AppError, metadata: Record<string, any>): void {
    // TODO: Slack, 이메일, SMS 등으로 알림 전송
    logger.warn('심각한 에러 알림 전송 필요', 'ALERT', {
      error: error.message,
      type: error.type,
      severity: error.severity,
      metadata
    })
  }

  // 에러 응답 생성
  createErrorResponse(
    error: Error | AppError,
    requestId?: string,
    includeDetails: boolean = false
  ): ErrorResponse {
    let errorType: ErrorType
    let statusCode: number
    let message: string
    let details: any = undefined

    if (error instanceof AppError) {
      errorType = error.type
      statusCode = error.statusCode
      message = error.message
      if (includeDetails && error.metadata) {
        details = error.metadata
      }
    } else {
      errorType = ErrorType.INTERNAL
      statusCode = 500
      message = USER_FRIENDLY_MESSAGES[ErrorType.INTERNAL]
      if (includeDetails) {
        details = {
          name: error.name,
          message: error.message
        }
      }
    }

    const response: ErrorResponse = {
      error: {
        message: USER_FRIENDLY_MESSAGES[errorType],
        type: errorType,
        code: `${statusCode}`,
        timestamp: new Date().toISOString(),
        requestId
      }
    }

    if (details) {
      response.details = details
    }

    // 개발 환경에서만 도움말 제공
    if (process.env.NODE_ENV === 'development') {
      response.help = this.getHelpMessage(errorType)
    }

    return response
  }

  // 도움말 메시지 생성
  private getHelpMessage(errorType: ErrorType): string {
    const helpMessages: Record<ErrorType, string> = {
      [ErrorType.VALIDATION]: '입력 데이터의 형식과 필수 필드를 확인해주세요.',
      [ErrorType.AUTHENTICATION]: '로그인 토큰이 유효한지 확인해주세요.',
      [ErrorType.AUTHORIZATION]: '해당 리소스에 대한 접근 권한이 있는지 확인해주세요.',
      [ErrorType.NOT_FOUND]: '요청한 URL과 리소스 ID를 확인해주세요.',
      [ErrorType.RATE_LIMIT]: 'API 사용량 제한을 확인하고 적절한 간격으로 요청해주세요.',
      [ErrorType.DATABASE]: '데이터베이스 연결과 쿼리를 확인해주세요.',
      [ErrorType.EXTERNAL_API]: '외부 서비스의 상태를 확인해주세요.',
      [ErrorType.INTERNAL]: '서버 로그를 확인하고 시스템 상태를 점검해주세요.',
      [ErrorType.NETWORK]: '네트워크 연결과 방화벽 설정을 확인해주세요.'
    }

    return helpMessages[errorType] || '알 수 없는 오류가 발생했습니다.'
  }

  // 에러 복구 시도
  async attemptRecovery(error: AppError, context?: string): Promise<boolean> {
    try {
      switch (error.type) {
        case ErrorType.DATABASE:
          return await this.attemptDatabaseRecovery(error, context)
        case ErrorType.NETWORK:
          return await this.attemptNetworkRecovery(error, context)
        case ErrorType.EXTERNAL_API:
          return await this.attemptExternalApiRecovery(error, context)
        default:
          return false
      }
    } catch (recoveryError) {
      logger.error('에러 복구 시도 실패', recoveryError as Error, context || 'RECOVERY')
      return false
    }
  }

  // 데이터베이스 복구 시도
  private async attemptDatabaseRecovery(error: AppError, context?: string): Promise<boolean> {
    logger.info('데이터베이스 복구 시도 중...', context || 'RECOVERY')
    
    // TODO: 데이터베이스 연결 재시도, 연결 풀 재설정 등
    // 현재는 기본적으로 실패로 처리
    return false
  }

  // 네트워크 복구 시도
  private async attemptNetworkRecovery(error: AppError, context?: string): Promise<boolean> {
    logger.info('네트워크 복구 시도 중...', context || 'RECOVERY')
    
    // TODO: 네트워크 연결 재시도, 프록시 설정 변경 등
    // 현재는 기본적으로 실패로 처리
    return false
  }

  // 외부 API 복구 시도
  private async attemptExternalApiRecovery(error: AppError, context?: string): Promise<boolean> {
    logger.info('외부 API 복구 시도 중...', context || 'RECOVERY')
    
    // TODO: 외부 API 재시도, 대체 서비스 사용 등
    // 현재는 기본적으로 실패로 처리
    return false
  }
}

// 기본 에러 핸들러 인스턴스
export const errorHandler = ErrorHandler.getInstance()

// 편의 함수들
export const handleError = (error: Error | AppError, context?: string, metadata?: Record<string, any>) =>
  errorHandler.handleError(error, context, metadata)

export const createErrorResponse = (error: Error | AppError, requestId?: string, includeDetails?: boolean) =>
  errorHandler.createErrorResponse(error, requestId, includeDetails)

// 에러 생성 헬퍼 함수들
export const createValidationError = (message: string, metadata?: Record<string, any>) =>
  new AppError(message, ErrorType.VALIDATION, 400, ErrorSeverity.LOW, true, metadata)

export const createAuthError = (message: string, metadata?: Record<string, any>) =>
  new AppError(message, ErrorType.AUTHENTICATION, 401, ErrorSeverity.MEDIUM, true, metadata)

export const createNotFoundError = (message: string, metadata?: Record<string, any>) =>
  new AppError(message, ErrorType.NOT_FOUND, 404, ErrorSeverity.LOW, true, metadata)

export const createRateLimitError = (message: string, metadata?: Record<string, any>) =>
  new AppError(message, ErrorType.RATE_LIMIT, 429, ErrorSeverity.MEDIUM, true, metadata)

export const createDatabaseError = (message: string, metadata?: Record<string, any>) =>
  new AppError(message, ErrorType.DATABASE, 500, ErrorSeverity.HIGH, false, metadata)

export const createInternalError = (message: string, metadata?: Record<string, any>) =>
  new AppError(message, ErrorType.INTERNAL, 500, ErrorSeverity.HIGH, false, metadata)

// Next.js API 라우트용 에러 핸들러 미들웨어
export function withErrorHandler(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      return await handler(request, ...args)
    } catch (error) {
      // 에러 로깅
      handleError(error as Error, 'API_ROUTE', {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries())
      })

      // 에러 응답 생성
      const errorResponse = createErrorResponse(error as Error, request.headers.get('x-request-id'))
      const statusCode = error instanceof AppError ? error.statusCode : 500

      return NextResponse.json(errorResponse, { status: statusCode })
    }
  }
}

// 에러 응답 헬퍼
export function createErrorResponseWithStatus(
  error: Error | AppError,
  statusCode: number,
  requestId?: string
): NextResponse {
  const errorResponse = createErrorResponse(error, requestId)
  return NextResponse.json(errorResponse, { status: statusCode })
}
