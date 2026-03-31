-- 관리자 계정 테이블
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- pgcrypto 확장 사용
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 기본 관리자 계정 (비밀번호: admin1234 → 나중에 설정에서 변경하세요)
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', crypt('admin1234', gen_salt('bf')));

-- 비밀번호 검증 함수
CREATE OR REPLACE FUNCTION verify_admin_password(input_username TEXT, input_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE username = input_username
      AND password_hash = crypt(input_password, password_hash)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
