-- 반려견에 크기 카테고리 추가
ALTER TABLE pets ADD COLUMN IF NOT EXISTS size_category TEXT DEFAULT 'small'
  CHECK (size_category IN ('small', 'medium', 'large', 'special'));
