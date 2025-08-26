import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/language-context'

export function useAuthStatus() {
  const router = useRouter()
  const { logout } = useAuth()
  const { toast } = useToast()
  const { t } = useLanguage()

  // 토큰 유효성 검증
  const validateToken = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.status === 401) {
        // 토큰이 무효화되었거나 만료됨
        console.log('토큰이 무효화되었습니다. 자동 로그아웃 처리 중...')
        
        toast({
          title: t("sessionExpired"),
          description: t("sessionExpiredDesc"),
          variant: "destructive"
        })

        // 로그아웃 처리
        await logout()
        router.push('/auth/login')
        return false
      }

      return true
    } catch (error) {
      console.error('토큰 검증 실패:', error)
      return false
    }
  }, [logout, router, toast, t])

  // 주기적으로 토큰 유효성 검증
  useEffect(() => {
    const interval = setInterval(validateToken, 5 * 60 * 1000) // 5분마다 검증

    return () => clearInterval(interval)
  }, [validateToken])

  // 페이지 포커스 시 토큰 검증
  useEffect(() => {
    const handleFocus = () => {
      validateToken()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [validateToken])

  return { validateToken }
}
