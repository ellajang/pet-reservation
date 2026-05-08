// 도메인 엔티티 — DB/API 응답 모양(snake_case)에 맞춤.
// 페이지에서 join 데이터가 필요하면 `Type & { joins... }`로 확장해서 사용.

export interface Customer {
  id: string;
  name: string;
  phone: string;
  memo: string | null;
  no_show_count: number;
  is_blocked: boolean;
  block_reason: string | null;
  created_at: string;
}

export interface Pet {
  id: string;
  customer_id: string;
  name: string;
  breed: string;
  weight: number | null;
  gender: string;
  neutered: boolean;
  special_notes: string | null;
  size_category: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string | null;
  size_category: string;
}

export interface Reservation {
  id: string;
  customer_id: string;
  pet_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  memo: string | null;
}
