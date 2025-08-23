#!/bin/bash

# 만료된 URL 확인 및 알림 전송 크론 작업
# 이 스크립트는 cron에 의해 정기적으로 실행되어야 합니다

# 환경 변수 로드
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# API 키 확인
if [ -z "$CRON_API_KEY" ]; then
    echo "오류: CRON_API_KEY가 설정되지 않았습니다."
    exit 1
fi

# 애플리케이션 URL 확인
if [ -z "$NEXT_PUBLIC_BASE_URL" ]; then
    echo "오류: NEXT_PUBLIC_BASE_URL가 설정되지 않았습니다."
    exit 1
fi

# 크론 작업 실행
echo "$(date): 만료된 URL 확인 작업 시작..."

# API 호출
response=$(curl -s -w "%{http_code}" \
    -H "X-API-Key: $CRON_API_KEY" \
    -H "Content-Type: application/json" \
    "$NEXT_PUBLIC_BASE_URL/api/cron/expired-urls")

# HTTP 상태 코드 추출
http_code="${response: -3}"
response_body="${response%???}"

# 결과 확인
if [ "$http_code" -eq 200 ]; then
    echo "$(date): 만료된 URL 확인 작업 완료"
    echo "응답: $response_body"
else
    echo "$(date): 오류 발생 - HTTP $http_code"
    echo "응답: $response_body"
    exit 1
fi

echo "$(date): 크론 작업 완료"
