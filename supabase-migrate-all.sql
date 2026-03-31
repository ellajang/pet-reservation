-- =============================================
-- 한번에 실행할 마이그레이션 (3~6번)
-- =============================================

-- 3. 동시 예약 방지 트리거
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

DROP TRIGGER IF EXISTS check_reservation_overlap_trigger ON reservations;
CREATE TRIGGER check_reservation_overlap_trigger
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION check_reservation_overlap();

-- 4. Supabase Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;

-- 5. 고객 차단 + 예약 승인 대기 상태
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS block_reason TEXT;

ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check
  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'noshow'));

-- 6. 서비스 견종 크기 카테고리
ALTER TABLE services ADD COLUMN IF NOT EXISTS size_category TEXT DEFAULT 'small'
  CHECK (size_category IN ('small', 'medium', 'large', 'special'));
