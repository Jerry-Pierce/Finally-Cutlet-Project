"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  username?: string
  isPremium: boolean
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, username?: string) => Promise<boolean>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        // 쿠키에서 auth-token 확인
        const cookies = document.cookie.split(';')
        const authToken = cookies.find(cookie => cookie.trim().startsWith('auth-token='))
        
        if (!authToken) {
          // 인증 토큰이 없으면 API 호출하지 않음
          setIsLoading(false)
          return
        }

        // 백엔드 API에서 사용자 프로필 확인
        const response = await fetch('/api/user/profile', {
          credentials: 'include' // 쿠키 포함
        })

        if (response.ok) {
          const result = await response.json()
          setUser(result.data)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        setUser(result.data.user)
        return true
      } else {
        const error = await response.json()
        console.error('Login failed:', error.error)
        return false
      }
    } catch (error) {
      console.error("Login failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, username?: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        setUser(result.data)
        return true
      } else {
        const error = await response.json()
        console.error('Signup failed:', error.error)
        return false
      }
    } catch (error) {
      console.error("Signup failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful password reset
      return true
    } catch (error) {
      console.error("Password reset failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    resetPassword,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
