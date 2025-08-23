# 멀티스테이지 빌드를 위한 Dockerfile
FROM node:18-alpine AS base

# 기본 설정
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 의존성 설치 단계
FROM base AS deps
RUN apk add --no-cache libc6-compat

# pnpm 설치
RUN npm install -g pnpm

# package.json 및 lock 파일 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치
RUN pnpm install --frozen-lockfile --prod=false

# 빌드 단계
FROM base AS builder
RUN npm install -g pnpm

# 소스 코드 복사
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# 환경 변수 설정
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Prisma 클라이언트 생성
RUN npx prisma generate

# 애플리케이션 빌드
RUN pnpm build

# 프로덕션 단계
FROM base AS runner

# 시스템 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 필요한 시스템 패키지 설치
RUN apk add --no-cache \
    dumb-init \
    curl

# 애플리케이션 파일 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma 스키마 및 마이그레이션 파일 복사
COPY --from=builder /app/prisma ./prisma

# 권한 설정
RUN chown -R nextjs:nodejs /app
USER nextjs

# 포트 노출
EXPOSE 3000

# 환경 변수 설정
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# 애플리케이션 실행
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
