import { redis } from './redis'

export interface TokenInfo {
  userId: string
  issuedAt: number
  expiresAt: number
}

export class TokenBlacklistService {
  private static readonly BLACKLIST_PREFIX = 'blacklisted_token:'
  private static readonly USER_TOKENS_PREFIX = 'user_tokens:'

  /**
   * 토큰을 블랙리스트에 추가
   */
  static async blacklistToken(token: string, userId: string, expiresAt: number): Promise<void> {
    try {
      const tokenInfo: TokenInfo = {
        userId,
        issuedAt: Date.now(),
        expiresAt
      }

      // 토큰을 블랙리스트에 추가
      await redis.setex(
        `${this.BLACKLIST_PREFIX}${token}`,
        Math.ceil((expiresAt - Date.now()) / 1000), // 만료 시간까지 남은 초
        JSON.stringify(tokenInfo)
      )

      // 사용자의 모든 토큰을 무효화
      await this.invalidateAllUserTokens(userId)

      console.log(`토큰이 블랙리스트에 추가되었습니다: ${userId}`)
    } catch (error) {
      console.error('토큰 블랙리스트 추가 실패:', error)
      throw error
    }
  }

  /**
   * 토큰이 블랙리스트에 있는지 확인
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const exists = await redis.exists(`${this.BLACKLIST_PREFIX}${token}`)
      return exists === 1
    } catch (error) {
      console.error('토큰 블랙리스트 확인 실패:', error)
      // Redis 오류 시 기본적으로 블랙리스트되지 않은 것으로 처리
      return false
    }
  }

  /**
   * 사용자의 모든 토큰을 무효화 (비밀번호 변경 시)
   */
  static async invalidateAllUserTokens(userId: string): Promise<void> {
    try {
      const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`
      
      // 사용자의 모든 토큰을 블랙리스트에 추가
      const userTokens = await redis.smembers(userTokensKey)
      
      for (const token of userTokens) {
        await redis.setex(
          `${this.BLACKLIST_PREFIX}${token}`,
          24 * 60 * 60, // 24시간
          JSON.stringify({
            userId,
            issuedAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000)
          })
        )
      }

      // 사용자 토큰 목록 초기화
      await redis.del(userTokensKey)
      
      console.log(`사용자 ${userId}의 모든 토큰이 무효화되었습니다`)
    } catch (error) {
      console.error('사용자 토큰 무효화 실패:', error)
      throw error
    }
  }

  /**
   * 사용자의 활성 토큰을 등록
   */
  static async registerUserToken(userId: string, token: string): Promise<void> {
    try {
      const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`
      await redis.sadd(userTokensKey, token)
      
      // 토큰 목록의 만료 시간 설정 (24시간)
      await redis.expire(userTokensKey, 24 * 60 * 60)
      
      console.log(`사용자 ${userId}의 토큰이 등록되었습니다`)
    } catch (error) {
      console.error('사용자 토큰 등록 실패:', error)
      // Redis 오류 시 토큰 등록을 건너뛰고 계속 진행
      console.log('Redis 오류로 인해 토큰 등록을 건너뜁니다')
    }
  }

  /**
   * 특정 토큰을 사용자 토큰 목록에서 제거
   */
  static async removeUserToken(userId: string, token: string): Promise<void> {
    try {
      const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`
      await redis.srem(userTokensKey, token)
      
      console.log(`사용자 ${userId}의 토큰이 제거되었습니다`)
    } catch (error) {
      console.error('사용자 토큰 제거 실패:', error)
      throw error
    }
  }

  /**
   * 사용자의 활성 토큰 수 조회
   */
  static async getUserActiveTokenCount(userId: string): Promise<number> {
    try {
      const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`
      return await redis.scard(userTokensKey)
    } catch (error) {
      console.error('사용자 활성 토큰 수 조회 실패:', error)
      return 0
    }
  }
}
