-- 서비스에 견종 크기 카테고리 추가
ALTER TABLE services ADD COLUMN IF NOT EXISTS size_category TEXT DEFAULT 'small'
  CHECK (size_category IN ('small', 'medium', 'large', 'special'));
