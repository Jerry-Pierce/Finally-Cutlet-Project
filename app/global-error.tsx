'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러 로깅
    console.error('Global Error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                예상치 못한 오류가 발생했습니다
              </h1>
              <p className="text-muted-foreground mb-4">
                시스템에서 심각한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="text-left bg-muted p-4 rounded-lg mb-4">
                  <summary className="cursor-pointer font-medium mb-2">
                    개발자 정보 (클릭하여 확장)
                  </summary>
                  <div className="text-sm font-mono text-muted-foreground">
                    <p><strong>Error:</strong> {error.message}</p>
                    {error.digest && (
                      <p><strong>Digest:</strong> {error.digest}</p>
                    )}
                    <p><strong>Stack:</strong></p>
                    <pre className="whitespace-pre-wrap text-xs">
                      {error.stack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                다시 시도
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                홈으로 이동
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
