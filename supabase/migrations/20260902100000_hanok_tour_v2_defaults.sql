-- 상품이 half/full 2종에서 A/B/C/D 4종으로 바뀌고, 단체(10~15명) 상품이 되었다.
-- API 가 항상 값을 명시해서 넣기 때문에 기본값은 실제로 쓰이지 않지만,
-- 대시보드에서 수동으로 행을 넣을 때 엉뚱한 값이 들어가지 않도록 맞춰둔다.
ALTER TABLE public.hanok_tour_bookings ALTER COLUMN course SET DEFAULT 'A';
ALTER TABLE public.hanok_tour_bookings ALTER COLUMN party_size SET DEFAULT 10;
