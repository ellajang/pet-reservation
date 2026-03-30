-- 동시 예약 방지를 위한 시간 충돌 체크 함수
-- 같은 날짜에 시간이 겹치는 예약이 있으면 차단

CREATE OR REPLACE FUNCTION check_reservation_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- 취소된 예약은 무시
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  -- 같은 날짜에 시간이 겹치는 활성 예약이 있는지 확인
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
