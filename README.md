# 스마트 진료 예약 시스템

AI 기반 진료 예약 관리 앱. 환자 문의 인식 → 일정 확인 → 자동 예약 제안 흐름으로 동작합니다.

## 기술 스택

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — 의료 테마 UI
- **OpenRouter API** (`openrouter/auto` 모델) — 증상 분석 및 대화
- **localStorage** — 예약 데이터 및 API 키 저장

## 주요 기능

| 단계 | 설명 |
|------|------|
| 환자 문의 인식 | LLM이 증상/불편사항을 분석하고 적절한 진료과 추천 |
| 일정 확인 | 추천 진료과의 예약 가능 시간 표시 (14일치 모의 데이터) |
| 자동 예약 제안 | 클릭 한 번으로 예약 확정, 사이드바에 예약 목록 관리 |

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후 우상단 ⚙️ 아이콘에서 **OpenRouter API 키** 입력.

## API 키 발급

1. [openrouter.ai](https://openrouter.ai) 회원가입
2. Settings → API Keys → Create Key
3. 앱 설정 모달에 붙여넣기

## Vercel 배포

```bash
npx vercel --prod
```

환경변수 설정 불필요 (API 키는 사용자 브라우저에 저장).

## 지원 진료과

내과 / 정형외과 / 피부과 / 이비인후과 / 소화기내과 / 신경과 / 산부인과 / 소아과
