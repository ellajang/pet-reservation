# PetSalon - 애견미용샵 예약관리 시스템

애견미용사를 위한 예약/고객/매출 관리 웹 어플리케이션

## 스크린샷

### 로그인
Supabase Authentication 기반 관리자 로그인. 18시간 세션 유지 + 자동 토큰 갱신.

![로그인](/public/main.png)

### 대시보드
승인 대기 예약 실시간 알림, 오늘의 예약 현황, 매출/고객 요약 통계를 한눈에 확인.

![대시보드](/public/dashboard.png)

### 예약 관리
캘린더 기반 일별/주별/월별 뷰 전환. 예약 승인/거절/완료/노쇼 상태 관리. 동시 예약 충돌 방지.

![예약 관리](/public/reservation.png)

### 고객 관리
보호자 + 반려견 정보 CRM. 고객 상세 모달에서 정보 수정 + 예약 이력 조회. 고객 분석 대시보드.

![고객 관리](/public/managing.png)

### 매출 통계
월별 매출 조회, 서비스별 분석, 완료 건수 및 건당 평균 매출 확인.

![매출 통계](/public/statics.png)

### 설정
서비스 관리 (견종 크기별), 매장 정보, 영업시간/휴무일 설정, 고객 예약 링크 복사.

![설정](/public/setting.png)

## 주요 기능

### 관리자 (대시보드)
- **예약 관리** - 캘린더 기반 일별/주별/월별 뷰, 예약 승인/거절/완료/노쇼 처리
- **고객 CRM** - 보호자 + 반려견 정보 관리, 고객 차단, 상세 이력 조회
- **고객 분석** - 재방문율, 견종 분포, 서비스별 매출, 단골 TOP 5
- **매출 통계** - 월별 매출 조회, 서비스별 분석
- **설정** - 매장 정보, 영업시간, 서비스 관리 (견종 크기별)
- **실시간 알림** - 새 예약 시 소리 + 브라우저 푸시 + 알림 벨

### 고객용 (링크 공유)
- **예약 페이지** - 카톡으로 링크 공유 → 서비스/날짜/시간 선택 → 예약 요청
- **동의서 페이지** - 미용 동의서 모바일 작성 + 서명

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| 상태관리 | TanStack Query, useReducer |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| 인증 | Supabase Authentication |
| 실시간 | Supabase Realtime |
| 배포 | Vercel |

## 아키텍처

### Co-location 패턴

페이지 전용 컴포넌트는 해당 라우트에 배치하고, 공통 요소만 `components/`에 분리합니다.

| 폴더 | 역할 | 예시 |
|------|------|------|
| `app/(admin)/` | 관리자 페이지 + 전용 컴포넌트 | 예약 캘린더 뷰, 고객 모달 |
| `app/(public)/` | 고객용 페이지 | 예약 폼, 동의서 |
| `app/api/` | 백엔드 API 라우트 | CRUD, 인증, 실시간 |
| `components/` | 공통 컴포넌트 | Sidebar, NotificationBell |
| `hooks/` | TanStack Query 커스텀 훅 | useReservations, useCustomers |
| `shared/` | 유틸, 상수, 타입, 인증 | API 헬퍼, Supabase 클라이언트 |

### 상태관리 전략

| 상태 유형 | 도구 | 사용처 |
|-----------|------|--------|
| 서버 데이터 (API) | TanStack Query | 모든 데이터 fetch/캐싱/갱신 |
| 복잡한 UI 상태 | useReducer | 예약 관리 (뷰 모드, 날짜, 모달), 고객 예약 페이지 (멀티스텝 폼) |
| 단순 폼/UI | useState | 설정, 로그인, 동의서 |

### 데이터 흐름

```
[고객 예약 페이지]                    [관리자 대시보드]
  예약 요청 (POST)                     
    → API Route                       Supabase Realtime
      → Supabase DB INSERT    →→→     → 실시간 알림 (소리 + 푸시)
                                      → 승인 대기 목록에 표시
                                      → 승인/거절 클릭
                                        → useMutation
                                        → invalidateQueries
                                        → 화면 자동 갱신
```

### 인증 흐름

```
로그인 → Supabase Auth (이메일/비밀번호)
  → access token + refresh token 발급
  → httpOnly 쿠키 저장 (18시간)
  → 매 요청마다 auth/check에서 토큰 검증
  → access token 만료 시 refresh token으로 자동 갱신
```

### 보안 구조

```
[브라우저]
  NEXT_PUBLIC_SUPABASE_ANON_KEY (공개)
    ↓
  Supabase RLS가 차단
    → 비로그인: 예약 등록 + 서비스 조회만 허용
    → 로그인(관리자): 전체 접근
    → 매출/미용기록: 비로그인 접근 불가
```

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경변수

`.env.local` 파일 생성:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. DB 설정

Supabase SQL Editor에서 실행:
- `supabase-schema.sql` - 테이블 생성
- `supabase-rls.sql` - 보안 설정 (RLS)

### 4. 실행

```bash
npm run dev
```

## 보안

- Supabase Authentication (이메일/비밀번호)
- RLS (Row Level Security) 적용
- httpOnly 쿠키 기반 세션 관리
- 토큰 자동 갱신 (18시간 세션 유지)
