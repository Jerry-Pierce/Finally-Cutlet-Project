import fs from 'fs'
import path from 'path'
import { format } from 'date-fns'

// 로그 레벨 정의
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

// 로그 레벨 이름
const LOG_LEVEL_NAMES = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL'
}

// 로그 레벨 색상 (콘솔용)
const LOG_LEVEL_COLORS = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m',  // Green
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
  [LogLevel.FATAL]: '\x1b[35m', // Magenta
  RESET: '\x1b[0m'
}

// 로그 엔트리 인터페이스
export interface LogEntry {
  timestamp: string
  level: LogLevel
  levelName: string
  message: string
  context?: string
  userId?: string
  requestId?: string
  metadata?: Record<string, any>
  error?: Error
  stack?: string
}

// 로거 설정 인터페이스
export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  logDir: string
  maxFileSize: number // MB
  maxFiles: number
  enableRequestLogging: boolean
  enablePerformanceLogging: boolean
}

// 기본 설정
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  logDir: 'logs',
  maxFileSize: 10, // 10MB
  maxFiles: 5,
  enableRequestLogging: true,
  enablePerformanceLogging: true
}

export class Logger {
  private static instance: Logger
  private config: LoggerConfig
  private logStream: fs.WriteStream | null = null
  private currentLogFile: string = ''

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initializeLogDirectory()
    this.rotateLogFile()
  }

  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config)
    }
    return Logger.instance
  }

  // 로그 디렉토리 초기화
  private initializeLogDirectory(): void {
    if (this.config.enableFile) {
      try {
        if (!fs.existsSync(this.config.logDir)) {
          fs.mkdirSync(this.config.logDir, { recursive: true })
        }
      } catch (error) {
        console.error('로그 디렉토리 생성 실패:', error)
      }
    }
  }

  // 로그 파일 회전
  private rotateLogFile(): void {
    if (!this.config.enableFile) return

    try {
      const now = new Date()
      const dateStr = format(now, 'yyyy-MM-dd')
      const newLogFile = path.join(this.config.logDir, `app-${dateStr}.log`)

      if (newLogFile !== this.currentLogFile) {
        if (this.logStream) {
          this.logStream.end()
        }

        this.currentLogFile = newLogFile
        this.logStream = fs.createWriteStream(newLogFile, { flags: 'a' })

        // 로그 파일 크기 확인 및 회전
        this.checkAndRotateLogFile()
      }
    } catch (error) {
      console.error('로그 파일 회전 실패:', error)
    }
  }

  // 로그 파일 크기 확인 및 회전
  private checkAndRotateLogFile(): void {
    try {
      if (fs.existsSync(this.currentLogFile)) {
        const stats = fs.statSync(this.currentLogFile)
        const fileSizeMB = stats.size / (1024 * 1024)

        if (fileSizeMB > this.config.maxFileSize) {
          this.archiveLogFile()
        }
      }
    } catch (error) {
      console.error('로그 파일 크기 확인 실패:', error)
    }
  }

  // 로그 파일 아카이브
  private archiveLogFile(): void {
    try {
      const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss')
      const archiveName = this.currentLogFile.replace('.log', `-${timestamp}.log`)
      fs.renameSync(this.currentLogFile, archiveName)

      // 오래된 로그 파일 정리
      this.cleanOldLogFiles()
    } catch (error) {
      console.error('로그 파일 아카이브 실패:', error)
    }
  }

  // 오래된 로그 파일 정리
  private cleanOldLogFiles(): void {
    try {
      const files = fs.readdirSync(this.config.logDir)
      const logFiles = files
        .filter(file => file.startsWith('app-') && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.config.logDir, file),
          time: fs.statSync(path.join(this.config.logDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time)

      // 최대 파일 수를 초과하는 오래된 파일 삭제
      if (logFiles.length > this.config.maxFiles) {
        const filesToDelete = logFiles.slice(this.config.maxFiles)
        filesToDelete.forEach(file => {
          try {
            fs.unlinkSync(file.path)
          } catch (error) {
            console.error(`로그 파일 삭제 실패: ${file.name}`, error)
          }
        })
      }
    } catch (error) {
      console.error('오래된 로그 파일 정리 실패:', error)
    }
  }

  // 로그 엔트리 생성
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const now = new Date()
    const timestamp = format(now, 'yyyy-MM-dd HH:mm:ss.SSS')

    return {
      timestamp,
      level,
      levelName: LOG_LEVEL_NAMES[level],
      message,
      context,
      metadata,
      error,
      stack: error?.stack
    }
  }

  // 로그 출력
  private outputLog(entry: LogEntry): void {
    const logLine = this.formatLogLine(entry)

    // 콘솔 출력
    if (this.config.enableConsole) {
      this.outputToConsole(entry, logLine)
    }

    // 파일 출력
    if (this.config.enableFile) {
      this.outputToFile(logLine)
    }
  }

  // 콘솔 출력
  private outputToConsole(entry: LogEntry, logLine: string): void {
    const color = LOG_LEVEL_COLORS[entry.level]
    const reset = LOG_LEVEL_COLORS.RESET
    
    console.log(`${color}${logLine}${reset}`)
  }

  // 파일 출력
  private outputToFile(logLine: string): void {
    try {
      this.rotateLogFile() // 날짜 변경 시 파일 회전
      
      if (this.logStream) {
        this.logStream.write(logLine + '\n')
      }
    } catch (error) {
      console.error('로그 파일 출력 실패:', error)
    }
  }

  // 로그 라인 포맷
  private formatLogLine(entry: LogEntry): string {
    let line = `[${entry.timestamp}] ${entry.levelName}`

    if (entry.context) {
      line += ` [${entry.context}]`
    }

    if (entry.userId) {
      line += ` [User:${entry.userId}]`
    }

    if (entry.requestId) {
      line += ` [Req:${entry.requestId}]`
    }

    line += `: ${entry.message}`

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      line += ` | ${JSON.stringify(entry.metadata)}`
    }

    return line
  }

  // 로그 레벨 확인
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level
  }

  // 공개 로깅 메서드들
  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context, metadata)
      this.outputLog(entry)
    }
  }

  info(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message, context, metadata)
      this.outputLog(entry)
    }
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message, context, metadata)
      this.outputLog(entry)
    }
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, context, metadata, error)
      this.outputLog(entry)
    }
  }

  fatal(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      const entry = this.createLogEntry(LogLevel.FATAL, message, context, metadata, error)
      this.outputLog(entry)
    }
  }

  // 요청 로깅
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    userId?: string,
    requestId?: string
  ): void {
    if (!this.config.enableRequestLogging) return

    const metadata = {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`
    }

    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO
    const message = `${method} ${url} - ${statusCode} (${responseTime}ms)`

    if (level === LogLevel.WARN) {
      this.warn(message, 'HTTP', metadata)
    } else {
      this.info(message, 'HTTP', metadata)
    }
  }

  // 성능 로깅
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    if (!this.config.enablePerformanceLogging) return

    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO
    const message = `${operation} - ${duration}ms`

    if (level === LogLevel.WARN) {
      this.warn(message, 'PERFORMANCE', metadata)
    } else {
      this.info(message, 'PERFORMANCE', metadata)
    }
  }

  // 데이터베이스 쿼리 로깅
  logQuery(sql: string, duration: number, params?: any[]): void {
    if (!this.config.enablePerformanceLogging) return

    const metadata = {
      sql: sql.length > 100 ? sql.substring(0, 100) + '...' : sql,
      params: params ? params.length : 0,
      duration: `${duration}ms`
    }

    const level = duration > 500 ? LogLevel.WARN : LogLevel.DEBUG
    const message = `DB Query - ${duration}ms`

    if (level === LogLevel.WARN) {
      this.warn(message, 'DATABASE', metadata)
    } else {
      this.debug(message, 'DATABASE', metadata)
    }
  }

  // 설정 업데이트
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.info('로거 설정이 업데이트되었습니다.', 'LOGGER', newConfig)
  }

  // 로그 파일 경로 가져오기
  getCurrentLogFile(): string {
    return this.currentLogFile
  }

  // 로그 디렉토리 내용 가져오기
  getLogFiles(): string[] {
    try {
      if (!fs.existsSync(this.config.logDir)) {
        return []
      }

      return fs.readdirSync(this.config.logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => path.join(this.config.logDir, file))
    } catch (error) {
      this.error('로그 파일 목록 조회 실패', error as Error, 'LOGGER')
      return []
    }
  }

  // 로그 파일 내용 읽기
  readLogFile(filePath: string, lines: number = 100): string[] {
    try {
      if (!fs.existsSync(filePath)) {
        return []
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      const linesArray = content.split('\n').filter(line => line.trim())
      
      return linesArray.slice(-lines)
    } catch (error) {
      this.error('로그 파일 읽기 실패', error as Error, 'LOGGER')
      return []
    }
  }

  // 로거 정리
  cleanup(): void {
    try {
      if (this.logStream) {
        this.logStream.end()
        this.logStream = null
      }
    } catch (error) {
      console.error('로거 정리 실패:', error)
    }
  }
}

// 기본 로거 인스턴스
export const logger = Logger.getInstance()

// 편의 함수들
export const log = {
  debug: (message: string, context?: string, metadata?: Record<string, any>) => 
    logger.debug(message, context, metadata),
  info: (message: string, context?: string, metadata?: Record<string, any>) => 
    logger.info(message, context, metadata),
  warn: (message: string, context?: string, metadata?: Record<string, any>) => 
    logger.warn(message, context, metadata),
  error: (message: string, error?: Error, context?: string, metadata?: Record<string, any>) => 
    logger.error(message, error, context, metadata),
  fatal: (message: string, error?: Error, context?: string, metadata?: Record<string, any>) => 
    logger.fatal(message, error, context, metadata)
}

// 성능 측정 데코레이터
export function logPerformance(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const start = Date.now()
      try {
        const result = await method.apply(this, args)
        const duration = Date.now() - start
        logger.logPerformance(operation, duration)
        return result
      } catch (error) {
        const duration = Date.now() - start
        logger.logPerformance(operation, duration, { error: error.message })
        throw error
      }
    }
  }
}
