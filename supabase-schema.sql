-- =============================================
-- 애견미용샵 예약관리 시스템 - 전체 DB 스키마
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- === 확장 ===
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- === 테이블 ===

-- 고객 (보호자)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  memo TEXT,
  no_show_count INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 반려견
CREATE TABLE pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  weight DECIMAL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  neutered BOOLEAN DEFAULT false,
  special_notes TEXT,
  size_category TEXT DEFAULT 'small' CHECK (size_category IN ('small', 'medium', 'large', 'special')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 서비스
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  size_category TEXT DEFAULT 'small' CHECK (size_category IN ('small', 'medium', 'large', 'special'))
);

-- 예약
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'noshow')),
  price INTEGER NOT NULL,
  memo TEXT,
  consent_form_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 미용 동의서
CREATE TABLE consent_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  pet_id UUID REFERENCES pets(id),
  health_issues TEXT,
  allergies TEXT,
  aggression_level TEXT DEFAULT 'none' CHECK (aggression_level IN ('none', 'mild', 'moderate', 'severe')),
  special_requests TEXT,
  signature TEXT,
  agreed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 미용 기록
CREATE TABLE grooming_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id),
  before_photos TEXT[],
  after_photos TEXT[],
  notes TEXT,
  next_recommended_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 매출
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'card' CHECK (payment_method IN ('cash', 'card', 'transfer', 'other')),
  paid_at TIMESTAMPTZ DEFAULT now(),
  memo TEXT
);

-- 매장 설정
CREATE TABLE shop_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_name TEXT DEFAULT '펫살롱',
  business_hours_start TIME DEFAULT '09:00',
  business_hours_end TIME DEFAULT '18:00',
  closed_days INTEGER[] DEFAULT '{0}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- === 기본 데이터 ===

INSERT INTO shop_settings (shop_name) VALUES ('펫살롱');

-- === 인덱스 ===

CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_customer ON reservations(customer_id);
CREATE INDEX idx_pets_customer ON pets(customer_id);
CREATE INDEX idx_sales_paid_at ON sales(paid_at);

-- === 함수 & 트리거 ===

-- updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER pets_updated_at BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER shop_settings_updated_at BEFORE UPDATE ON shop_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 동시 예약 방지 (시간 충돌 체크)
CREATE OR REPLACE FUNCTION check_reservation_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM reservations
    WHERE date = NEW.date
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
      AND status NOT IN ('cancelled')
      AND start_time < NEW.end_time
      AND end_time > NEW.start_time
  ) THEN
    RAISE EXCEPTION '해당 시간대에 이미 예약이 있습니다';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_reservation_overlap_trigger
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION check_reservation_overlap();

-- === Realtime ===

ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
