-- =============================================
-- RLS (Row Level Security) 설정
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- === 모든 테이블 RLS 활성화 ===
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE grooming_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- === 관리자 정책 (로그인한 사용자 = 전체 권한) ===

-- 관리자: 모든 테이블 전체 접근
CREATE POLICY "관리자 전체 접근" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 전체 접근" ON pets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 전체 접근" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 전체 접근" ON reservations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 전체 접근" ON consent_forms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 전체 접근" ON grooming_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 전체 접근" ON sales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 전체 접근" ON shop_settings FOR ALL USING (auth.role() = 'authenticated');

-- === 고객(비로그인) 정책 ===

-- 서비스 목록: 누구나 읽기 가능 (예약 페이지에서 필요)
CREATE POLICY "서비스 공개 읽기" ON services FOR SELECT USING (true);

-- 매장 설정: 누구나 읽기 가능 (매장명 표시에 필요)
CREATE POLICY "설정 공개 읽기" ON shop_settings FOR SELECT USING (true);

-- 예약: 누구나 등록 가능 (고객 예약)
CREATE POLICY "예약 공개 등록" ON reservations FOR INSERT WITH CHECK (true);

-- 예약: 누구나 읽기 가능 (시간 충돌 체크에 필요)
CREATE POLICY "예약 공개 읽기" ON reservations FOR SELECT USING (true);

-- 고객: 누구나 등록 가능 (신규 고객 자동 등록)
CREATE POLICY "고객 공개 등록" ON customers FOR INSERT WITH CHECK (true);

-- 고객: 누구나 읽기 가능 (기존 고객 확인에 필요)
CREATE POLICY "고객 공개 읽기" ON customers FOR SELECT USING (true);

-- 반려견: 누구나 등록 가능
CREATE POLICY "반려견 공개 등록" ON pets FOR INSERT WITH CHECK (true);

-- 반려견: 누구나 읽기 가능
CREATE POLICY "반려견 공개 읽기" ON pets FOR SELECT USING (true);

-- 동의서: 누구나 등록 가능
CREATE POLICY "동의서 공개 등록" ON consent_forms FOR INSERT WITH CHECK (true);
