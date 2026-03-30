-- Supabase Realtime 활성화 (예약 테이블)
-- 새 예약이 들어오면 실시간 알림을 받기 위해 필요

ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
