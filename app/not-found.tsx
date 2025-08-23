import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.578M15 6.3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-muted-foreground mb-4">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              홈으로 이동
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              대시보드로
            </Link>
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>도움이 필요하시면 <Link href="/contact" className="text-primary hover:underline">고객 지원</Link>에 문의해주세요.</p>
        </div>
      </div>
    </div>
  )
}
