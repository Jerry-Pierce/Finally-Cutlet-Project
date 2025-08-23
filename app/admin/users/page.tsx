"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">사용자 관리</h1>
          <p className="text-muted-foreground">
            시스템 사용자들을 관리할 수 있습니다.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              사용자 관리 기능이 준비 중입니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
