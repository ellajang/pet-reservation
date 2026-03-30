-- 고객 차단 기능 추가
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- 예약 상태에 'pending'(대기) 추가
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check
  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'noshow'));

-- 기존 'confirmed' 예약은 그대로 유지 (신규 예약만 pending으로 들어옴)
