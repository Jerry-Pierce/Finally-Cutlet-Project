#!/bin/bash

# Cutlet URL 단축기 데이터베이스 설정 스크립트
# PostgreSQL 데이터베이스 설정 및 초기화

echo "🚀 Cutlet URL 단축기 데이터베이스 설정을 시작합니다..."

# 환경 변수 파일 확인
if [ ! -f .env.local ]; then
    echo "❌ .env.local 파일이 없습니다. env.example을 복사하여 설정해주세요."
    exit 1
fi

# PostgreSQL 연결 확인
echo "📡 PostgreSQL 연결을 확인합니다..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL 클라이언트가 설치되지 않았습니다."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# 환경 변수 로드
source .env.local

# 데이터베이스 연결 테스트
echo "🔍 데이터베이스 연결을 테스트합니다..."
if ! psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
    echo "❌ 데이터베이스 연결에 실패했습니다."
    echo "   DATABASE_URL을 확인하고 PostgreSQL 서버가 실행 중인지 확인해주세요."
    exit 1
fi

echo "✅ 데이터베이스 연결 성공!"

# Prisma 클라이언트 생성
echo "🔧 Prisma 클라이언트를 생성합니다..."
if ! pnpm prisma generate; then
    echo "❌ Prisma 클라이언트 생성에 실패했습니다."
    exit 1
fi

# 데이터베이스 마이그레이션
echo "📊 데이터베이스 스키마를 적용합니다..."
if ! pnpm prisma db push; then
    echo "❌ 데이터베이스 마이그레이션에 실패했습니다."
    exit 1
fi

# 초기 데이터 삽입 (선택사항)
echo "🌱 초기 데이터를 삽입합니다..."
pnpm prisma db seed

echo "🎉 데이터베이스 설정이 완료되었습니다!"
echo ""
echo "다음 단계:"
echo "1. pnpm dev로 개발 서버를 실행하세요"
echo "2. http://localhost:3000에서 애플리케이션을 확인하세요"
echo "3. pnpm prisma studio로 데이터베이스를 관리하세요"
