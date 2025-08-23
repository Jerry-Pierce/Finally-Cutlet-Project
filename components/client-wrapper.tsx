"use client"

import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/contexts/language-context"
import { AuthProvider } from "@/contexts/auth-context"

interface ClientWrapperProps {
  children: React.ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Navigation />
        <main>{children}</main>
        <Toaster />
      </AuthProvider>
    </LanguageProvider>
  )
}
