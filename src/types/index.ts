// 보호자 (고객)
export interface Customer {
  id: string;
  name: string;
  phone: string;
  memo?: string;
  noShowCount: number;
  createdAt: string;
  updatedAt: string;
}

// 반려견
export interface Pet {
  id: string;
  customerId: string;
  name: string;
  breed: string; // 견종
  weight?: number; // kg
  age?: number;
  gender: "male" | "female";
  neutered: boolean; // 중성화 여부
  specialNotes?: string; // 특이사항 (공격성, 알러지 등)
  createdAt: string;
  updatedAt: string;
}

// 미용 서비스 종류
export interface Service {
  id: string;
  name: string; // 전체미용, 목욕, 위생미용, 부분미용 등
  duration: number; // 소요시간 (분)
  price: number;
  description?: string;
  isActive: boolean;
}

// 예약
export interface Reservation {
  id: string;
  customerId: string;
  petId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: "confirmed" | "completed" | "cancelled" | "noshow";
  price: number;
  memo?: string;
  consentFormId?: string;
  createdAt: string;
  updatedAt: string;
  // 조인 데이터
  customer?: Customer;
  pet?: Pet;
  service?: Service;
}

// 미용 동의서
export interface ConsentForm {
  id: string;
  reservationId: string;
  customerId: string;
  petId: string;
  healthIssues?: string; // 건강 문제
  allergies?: string; // 알러지
  aggressionLevel: "none" | "mild" | "moderate" | "severe";
  specialRequests?: string;
  signature: string; // base64 서명 이미지
  agreedAt: string;
  createdAt: string;
}

// 미용 기록
export interface GroomingRecord {
  id: string;
  reservationId: string;
  petId: string;
  beforePhotos: string[]; // 미용 전 사진 URL
  afterPhotos: string[]; // 미용 후 사진 URL
  notes?: string; // 미용사 메모
  nextRecommendedDate?: string; // 다음 미용 추천일
  createdAt: string;
}

// 매출
export interface SalesRecord {
  id: string;
  reservationId: string;
  amount: number;
  paymentMethod: "cash" | "card" | "transfer" | "other";
  paidAt: string;
  memo?: string;
}
