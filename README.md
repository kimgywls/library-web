# 📚 도서관 관리 시스템 - Frontend

도서 대출·예약·반납 기능을 갖춘 도서관 관리 웹 애플리케이션입니다.  
일반 회원과 관리자 권한을 분리하여, 관리자는 회원·대출·예약 전반을 통합 관리할 수 있습니다.  
Next.js 15 App Router 기반으로 구성되었으며, Docker로 단일 명령어 실행을 지원합니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| 통신 | axios (JWT 인터셉터) |
| 인증 | JWT (localStorage) |
| Infra | Docker, Docker Compose |

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 로그인 / 회원가입 | JWT 기반 인증, 로그인 상태 유지 |
| 도서 목록 / 상세 | 제목·저자 키워드 검색, 페이지네이션, 대출 가능 여부 표시 |
| 도서 대출 / 반납 | 도서 상세 페이지에서 즉시 대출 신청, 내 대출 목록에서 반납 |
| 예약 신청 / 취소 | 대출 중인 도서 예약, 내 예약 목록에서 취소 |
| 관리자 대시보드 | 전체 대출·예약·연체 현황 요약 |
| 관리자 - 회원 관리 | 전체 회원 목록 및 대출 건수 조회 |
| 관리자 - 대출 관리 | 상태별(대출 중·반납·연체) 필터링 및 목록 조회 |
| 관리자 - 예약 관리 | 전체 예약 목록 조회 |
| 도서 등록 / 수정 | 관리자 전용 도서 등록·수정·삭제 |

---

## 페이지 구조

| URL | 설명 | 권한 |
|-----|------|------|
| `/` | 메인 (도서 목록으로 리다이렉트) | 로그인 필요 |
| `/auth/login` | 로그인 | 누구나 |
| `/auth/register` | 회원가입 | 누구나 |
| `/books` | 도서 목록 / 검색 | 로그인 필요 |
| `/books/[id]` | 도서 상세 / 대출·예약 신청 | 로그인 필요 |
| `/books/new` | 도서 등록 | 관리자 |
| `/books/edit/[id]` | 도서 수정 | 관리자 |
| `/loans` | 내 대출 목록 / 반납 | 일반 회원 |
| `/reservations` | 내 예약 목록 / 취소 | 일반 회원 |
| `/admin` | 관리자 대시보드 | 관리자 |
| `/admin/members` | 회원 관리 | 관리자 |
| `/admin/loans` | 대출 관리 | 관리자 |
| `/admin/reservations` | 예약 관리 | 관리자 |

---

## 주요 구현 포인트

**1. axios 인터셉터로 JWT 자동 처리**  
모든 API 요청에 `Authorization: Bearer <token>` 헤더를 자동 삽입합니다.  
401 응답 수신 시 토큰을 제거하고 로그인 페이지로 자동 리다이렉트합니다.

```ts
// src/lib/api.ts
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

**2. 권한별 UI 분리**  
`localStorage`에 저장된 `role` 값을 기반으로 관리자/일반 회원 UI를 분리합니다.  
관리자만 도서 등록·수정·삭제 버튼 및 `/admin` 경로에 접근할 수 있습니다.

**3. 상태별 뱃지 색상 처리**  
도서 대출 상태(`AVAILABLE` / `LOANED` / `RESERVED`)와 대출 상태(`ACTIVE` / `RETURNED` / `OVERDUE`)를  
색상 뱃지로 시각화하여 관리자가 현황을 한눈에 파악할 수 있도록 구성했습니다.

**4. 비로그인 접근 차단**  
도서 목록 등 로그인이 필요한 페이지 진입 시, 토큰 유무를 확인하여 `/auth/login`으로 리다이렉트합니다.

---

## 실행 방법

### 로컬 개발

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# 개발 서버 실행
npm run dev
```

> 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### Docker

```bash
# 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d --build
```

> `NEXT_PUBLIC_API_URL` 환경 변수는 `docker-compose.yml`의 `args`로 주입됩니다.  
> 기본값: `http://localhost:8080/api`

---

## 백엔드 연동

이 프로젝트는 Spring Boot 기반 REST API 서버와 연동됩니다.

- **백엔드 레포지토리**: [kimgywls/library-api](https://github.com/kimgywls/library-api)
- **기본 API 주소**: `http://localhost:8080/api`
- **인증 방식**: JWT Bearer Token
