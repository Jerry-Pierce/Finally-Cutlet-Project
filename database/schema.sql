-- URL 단축기 데이터베이스 스키마
-- PostgreSQL을 기준으로 작성되었습니다.

-- 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- URL 단축 테이블
CREATE TABLE shortened_urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    short_code VARCHAR(100) UNIQUE NOT NULL,
    custom_code VARCHAR(100) UNIQUE,
    title VARCHAR(255),
    description TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_premium_favorite BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 태그 테이블
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- URL-태그 연결 테이블
CREATE TABLE url_tags (
    url_id UUID REFERENCES shortened_urls(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (url_id, tag_id)
);

-- 클릭 추적 테이블
CREATE TABLE url_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url_id UUID REFERENCES shortened_urls(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_shortened_urls_short_code ON shortened_urls(short_code);
CREATE INDEX idx_shortened_urls_user_id ON shortened_urls(user_id);
CREATE INDEX idx_shortened_urls_expires_at ON shortened_urls(expires_at);
CREATE INDEX idx_url_clicks_url_id ON url_clicks(url_id);
CREATE INDEX idx_url_clicks_clicked_at ON url_clicks(clicked_at);

-- 만료된 URL을 자동으로 정리하는 함수
CREATE OR REPLACE FUNCTION cleanup_expired_urls()
RETURNS void AS $$
BEGIN
    DELETE FROM shortened_urls 
    WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- 자동 정리 스케줄 (매일 자정에 실행)
SELECT cron.schedule('cleanup-expired-urls', '0 0 * * *', 'SELECT cleanup_expired_urls();');
