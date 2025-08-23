# 크론 작업 설정 가이드

이 문서는 URL 단축기 애플리케이션의 크론 작업을 설정하는 방법을 설명합니다.

## 개요

크론 작업은 다음과 같은 자동화된 작업을 수행합니다:

- **만료된 URL 확인**: 24시간 이내에 만료되는 URL을 찾아 사용자에게 알림
- **실시간 알림**: WebSocket을 통한 즉시 알림 전송

## 1. 환경 변수 설정

`.env.local` 파일에 다음 변수를 추가하세요:

```bash
# 크론 작업 API 키 (보안을 위해 강력한 키 사용)
CRON_API_KEY="your-secure-cron-api-key-here"

# 애플리케이션 기본 URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## 2. 크론 작업 스크립트 권한 설정

```bash
chmod +x scripts/cron-expired-urls.sh
```

## 3. 크론 작업 등록

### Linux/macOS

```bash
# 크론 편집기 열기
crontab -e

# 다음 라인 추가 (매시간 실행)
0 * * * * /path/to/your/project/scripts/cron-expired-urls.sh >> /path/to/your/project/logs/cron.log 2>&1

# 또는 매일 자정에 실행
0 0 * * * /path/to/your/project/scripts/cron-expired-urls.sh >> /path/to/your/project/logs/cron.log 2>&1
```

### Windows (작업 스케줄러)

1. **작업 스케줄러** 열기
2. **기본 작업 만들기** 클릭
3. **트리거** 설정 (매시간 또는 매일)
4. **동작** 설정: `scripts/cron-expired-urls.bat` 실행
5. **완료** 클릭

## 4. 로그 디렉토리 생성

```bash
mkdir -p logs
```

## 5. 테스트

크론 작업이 제대로 작동하는지 테스트:

```bash
# 스크립트 직접 실행
./scripts/cron-expired-urls.sh

# 로그 확인
tail -f logs/cron.log
```

## 6. 모니터링

### 로그 확인

```bash
# 실시간 로그 모니터링
tail -f logs/cron.log

# 특정 날짜 로그 확인
grep "$(date +%Y-%m-%d)" logs/cron.log
```

### 상태 확인

```bash
# 크론 작업 목록 확인
crontab -l

# 크론 서비스 상태 확인 (Linux)
sudo systemctl status cron
```

## 7. 문제 해결

### 일반적인 문제들

1. **권한 오류**
   ```bash
   chmod +x scripts/cron-expired-urls.sh
   ```

2. **환경 변수 문제**
   ```bash
   # 스크립트에서 환경 변수 확인
   echo $CRON_API_KEY
   echo $NEXT_PUBLIC_BASE_URL
   ```

3. **API 키 오류**
   - `.env.local`에서 `CRON_API_KEY` 확인
   - API 응답에서 401 오류 확인

4. **네트워크 문제**
   - 애플리케이션이 실행 중인지 확인
   - 방화벽 설정 확인

### 디버깅

```bash
# 상세한 로그로 실행
bash -x scripts/cron-expired-urls.sh

# 환경 변수 확인
env | grep -E "(CRON_API_KEY|NEXT_PUBLIC_BASE_URL)"
```

## 8. 보안 고려사항

1. **API 키 보안**
   - 강력한 API 키 사용
   - 정기적인 키 교체
   - 키를 버전 관리 시스템에 포함하지 않음

2. **네트워크 보안**
   - 크론 작업은 내부 네트워크에서만 실행
   - 외부 접근 제한

3. **로그 보안**
   - 민감한 정보가 로그에 포함되지 않도록 주의
   - 로그 파일 권한 설정

## 9. 성능 최적화

1. **실행 시간 조정**
   - 트래픽이 적은 시간대에 실행
   - 필요에 따라 실행 빈도 조정

2. **배치 처리**
   - 대량의 URL을 한 번에 처리
   - 데이터베이스 쿼리 최적화

## 10. 백업 및 복구

1. **크론 설정 백업**
   ```bash
   crontab -l > crontab.backup
   ```

2. **스크립트 백업**
   ```bash
   cp scripts/cron-expired-urls.sh scripts/cron-expired-urls.sh.backup
   ```

3. **복구**
   ```bash
   crontab crontab.backup
   ```

## 지원

문제가 발생하면 다음을 확인하세요:

1. 로그 파일 (`logs/cron.log`)
2. 애플리케이션 로그
3. 시스템 크론 로그 (`/var/log/cron` 또는 `journalctl -u cron`)
