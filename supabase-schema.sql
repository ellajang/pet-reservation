-- 애견미용샵 예약관리 시스템 DB 스키마

-- 고객 (보호자)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  memo TEXT,
  no_show_count INTEGER DEFAULT 0,
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 서비스
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- 분 단위
  price INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 기본 서비스 데이터
INSERT INTO services (name, duration, price, description) VALUES
  ('전체미용', 120, 50000, '목욕 + 전체 커트'),
  ('목욕', 60, 30000, '샴푸 + 드라이'),
  ('위생미용', 40, 20000, '발바닥, 항문, 배 미용'),
  ('부분미용', 60, 35000, '얼굴 또는 특정 부위 커트'),
  ('스파', 90, 60000, '목욕 + 피부 관리 + 마사지');

-- 예약
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'noshow')),
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
  signature TEXT, -- base64
  agreed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 미용 기록
CREATE TABLE grooming_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id),
  before_photos TEXT[], -- URL 배열
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

-- 인덱스
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_customer ON reservations(customer_id);
CREATE INDEX idx_pets_customer ON pets(customer_id);
CREATE INDEX idx_sales_paid_at ON sales(paid_at);

-- updated_at 자동 업데이트 트리거
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
