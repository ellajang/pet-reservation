-- 매장 설정 테이블
CREATE TABLE shop_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_name TEXT DEFAULT '펫살롱',
  business_hours_start TIME DEFAULT '09:00',
  business_hours_end TIME DEFAULT '18:00',
  closed_days INTEGER[] DEFAULT '{0}', -- 0=일, 1=월, ...6=토
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 기본 설정 1개 삽입
INSERT INTO shop_settings (shop_name) VALUES ('펫살롱');

CREATE TRIGGER shop_settings_updated_at BEFORE UPDATE ON shop_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
