---
created: 2026-05-18
tags: [project, 개발계획, IB-PYP, concept-question-card, plusiam, 5-6학년]
project: concept-question-card
status: 🟢 M1 진입 대기
family: [[question-card]], [[qar-question-card]]
related: [[IB-PYP-Key-Concepts]], [[CBC-개념기반탐구학습]]
---

# 🛠️ concept-question-card — 5-6학년용 V1 개발 계획서

> **콘셉트** : 자료를 만나 질문을 만들고, 그 질문이 어디에 속하는지 찾으며, 우리 반의 탐구 길을 그리는 도구
> **이론 토대** : IB PYP Key Concepts (7) + QFT (Rothstein & Santana, 2011) + Visible Thinking Routines (Question Sorts / Question Starts)
> **패밀리** : `question-card`(Rosenblatt) → `qar-question-card`(Raphael) → **`concept-question-card`(IB Key Concepts)** ⭐
> **배포** : GitHub Pages `plusiam/concept-question-card`

---

## 1. 결정 사항 요약

### ✅ 확정 (Round 1~3)

| # | 결정 | 값 |
|---|---|---|
| 1 | 시작판 | **5-6학년 단일판** (추후 3-4 / 1-2 분기) |
| 2 | 도구명 | **`concept-question-card`** |
| 3 | 분류 대상 | **학생이 만든 질문** (자료 단어 X) |
| 4 | 분류 컬럼 | **IB PYP Key Concepts 7개** |
| 5 | 단어 시드 풀 | **ON 기본** (단어 수집 → 질문 변환 흐름 포함) |
| 6 | 다중 분류 | **허용** (질문 1개당 최대 2~3개 컬럼) — 개념 협상 유도 |

### 🟡 잠정 가정 (다음 라운드 확정 대상)

| # | 항목 | 잠정 가정 | 근거 |
|---|---|---|---|
| A1 | 7개 노출 방식 | **기본 7개 + 교사 사전 세팅 시 3~5개 선별** (하이브리드) | 단원 초점화 + IB 정체성 |
| A3 | 영문 병기 | **ON** (Form/형태) | IB 정체성, 검색 강화 |
| B2 | Phase 이동 | **자유 이동** (단계 잠금 없음) | 5-6학년 자율성 |
| C1 | 교사 사전 세팅 | 단원명·중심 아이디어·시드 단어(선택)·핵심 개념 선별(선택) | qar-question-card 패턴 |
| D1 | V1.5 토글 | **V1 코드에 미리 심기** | qar-question-card 패턴, 후속 비용 최소 |
| E1 | 범용성 | **IB 탐구단원 톤 + 일반 교과 사용 가능** | 보급 확장성 |

---

## 2. 한 줄 콘셉트

> **자료를 만나 질문을 만들고, 그 질문이 어디에 속하는지 찾으며, 우리 반의 탐구 길을 그리는 도구**

---

## 3. 기술 스택 (qar-question-card 패턴 재사용)

| 구분 | 선택 | 비고 |
|---|---|---|
| 마크업·로직 | HTML / CSS / Vanilla JS | 기존 plusiam 패턴 |
| 드래그앤드롭 | **SortableJS** (CDN) | 다중 분류 — 카드 복제 모드 |
| 상태 저장 | LocalStorage (`cqc_v1`) | 학생 기기 영속 |
| 폰트 | Jua + Noto Sans KR | 패밀리 일관성 |
| 빌드 도구 | 없음 | 단순성 우선 |
| 배포 | GitHub Pages | plusiam 패턴 |

---

## 4. 파일 구조

```
concept-question-card/
├── index.html              # 메인 화면 (Phase 0~3 통합)
├── style.css               # 7컬럼 보드 + 인쇄 레이아웃
├── script.js               # 상태 관리 + 드래그앤드롭 + Export
├── data.js                 # KEY_CONCEPTS + QUESTION_STARTS
├── config.js               # V1/V1.5 토글, 단어풀 토글, 학년 모드
├── assets/
│   └── icons.svg           # 7개 핵심 개념 아이콘
├── docs/
│   ├── README.md           # 프로젝트 소개
│   ├── teacher-guide.md    # 교사용 사용법 + IB 수업 시나리오
│   └── ib-key-concepts.md  # 7개 핵심 개념 한국어 해설
└── .gitignore
```

> **점진적 확장 원칙**
> M1: 단일 `index.html` 시작 → M2: 파일 분리 → M3 이후 컴포넌트화

---

## 5. 데이터 모델

### 5.1 핵심 개념 카드 (`data.js`)

```javascript
// IB PYP 7개 Key Concepts — 질문 형태로 정의
// 한국어는 한기쌤 책 챕터와 일관성 유지
const KEY_CONCEPTS = [
  {
    id: 'form',
    name: '형태', nameEn: 'Form',
    keyQuestion: '어떤 모습일까?',
    icon: 'shape',
    starts: [
      '~의 특징은 무엇일까?',
      '~은 어떻게 생겼을까?',
      '~을 그림으로 그린다면?'
    ],
    palette: { bg: '#FFF7E6', accent: '#F59E0B', text: '#92400E' }
  },
  {
    id: 'function',
    name: '기능', nameEn: 'Function',
    keyQuestion: '어떻게 작동할까?',
    icon: 'gear',
    starts: [
      '~은 어떤 일을 할까?',
      '~이 없으면 어떻게 될까?',
      '~은 어떻게 움직일까?'
    ],
    palette: { bg: '#EEF2FF', accent: '#6366F1', text: '#3730A3' }
  },
  {
    id: 'causation',
    name: '원인', nameEn: 'Causation',
    keyQuestion: '왜 이렇게 되었을까?',
    icon: 'spark',
    starts: [
      '왜 ~은 ~할까?',
      '무엇 때문에 ~이 일어났을까?',
      '~의 진짜 이유는 무엇일까?'
    ],
    palette: { bg: '#FEE2E2', accent: '#EF4444', text: '#991B1B' }
  },
  {
    id: 'change',
    name: '변화', nameEn: 'Change',
    keyQuestion: '어떻게 변하고 있을까?',
    icon: 'wave',
    starts: [
      '예전엔 어땠고 지금은 어떨까?',
      '앞으로 ~은 어떻게 될까?',
      '~은 무엇을 통해 변할까?'
    ],
    palette: { bg: '#DCFCE7', accent: '#22C55E', text: '#166534' }
  },
  {
    id: 'connection',
    name: '연결', nameEn: 'Connection',
    keyQuestion: '무엇과 이어져 있을까?',
    icon: 'link',
    starts: [
      '~과 ~은 어떻게 연결될까?',
      '~이 ~에 어떤 영향을 줄까?',
      '~과 비슷한 것은?'
    ],
    palette: { bg: '#CFFAFE', accent: '#06B6D4', text: '#155E75' }
  },
  {
    id: 'perspective',
    name: '관점', nameEn: 'Perspective',
    keyQuestion: '누구의 시선일까?',
    icon: 'eye',
    starts: [
      '~의 입장에서 보면?',
      '다르게 본다면 어떨까?',
      '~은 누구의 의견일까?'
    ],
    palette: { bg: '#F3E8FF', accent: '#A855F7', text: '#6B21A8' }
  },
  {
    id: 'responsibility',
    name: '책임', nameEn: 'Responsibility',
    keyQuestion: '우리는 무엇을 해야 할까?',
    icon: 'hand',
    starts: [
      '우리가 할 수 있는 일은?',
      '~한다면 어떻게 될까?',
      '~을 위해 무엇이 필요할까?'
    ],
    palette: { bg: '#FCE7F3', accent: '#EC4899', text: '#9D174D' }
  }
];
```

### 5.2 카드 스키마

```javascript
// Phase 0 — 단어 시드 카드
const SEED_CARD = {
  id: 'seed_001',
  text: '쓰레기',
  source: 'student',      // 'student' | 'teacher'
  converted: false,        // 질문으로 변환 완료 여부
  createdAt: '2026-05-18T10:23:00'
};

// Phase 1 — 질문 카드 (이 도구의 주인공)
const QUESTION_CARD = {
  id: 'q_001',
  text: '쓰레기는 어떻게 줄일 수 있을까?',
  fromSeedId: 'seed_001',  // 시드 단어에서 변환된 경우(없으면 null)
  conceptIds: ['change', 'responsibility'],  // 다중 분류, 최대 3
  rationale: '쓰레기 줄이기는 우리가 할 일이고 점점 변할 수도 있으니까',
  votes: 3,
  author: '모둠2',
  starred: true,           // Phase 3 명시적 합의 선정 여부
  createdAt: '2026-05-18T10:31:00'
};

// Phase 3 — 탐구 라인 (Lines of Inquiry)
const INQUIRY_LINE = {
  id: 'line_001',
  conceptId: 'change',
  title: '우리 마을의 변화',
  bundledQuestionIds: ['q_001', 'q_005', 'q_012']
};
```

### 5.3 단원 메타 (교사 사전 세팅)

```javascript
const UNIT_META = {
  unitTitle: '우리가 만드는 지속가능한 마을',
  centralIdea: '우리의 선택은 환경에 변화를 만든다',
  enabledConcepts: ['change', 'connection', 'responsibility'],  // null이면 7개 전체
  seedWords: ['쓰레기', '재활용', '에너지', '교통'],  // 교사 사전 단어
  grade: '5-6'
};
```

---

## 6. 3-Phase 인터랙션 설계

### Phase 0 (선택) — 🌱 단어 시드 풀
- 토글 ON 시: 자료 읽으며 단어 빠르게 입력 (포스트잇 카드)
- 단어 카드 클릭 → "이 단어로 어떤 게 궁금해?" → Phase 1 입력란으로 자동 이동
- 변환된 단어는 흐릿하게 (재사용 가능)
- 토글 OFF 시: Phase 1로 곧장 진입

### Phase 1 — ✏️ 질문 생성
- 입력란: "이 단원에서 ___이/가 궁금해요"
- 우측 사이드바: 7개 핵심 개념 **질문 시작어 비계** (Question Starts)
- 시작어 클릭 → 입력란에 자동 삽입
- "비슷한 질문 통합 제안" (간단 텍스트 유사도)

### Phase 2 — 🗂️ 개념 분류
- **7컬럼 보드** (모바일: 가로 스크롤 또는 2-3컬럼 슬라이드)
- 질문 카드 드래그 → 컬럼 배치
- **다중 분류**: 카드 상단 `+` 버튼으로 다른 컬럼에도 동시 배치 (최대 3)
- 다중 분류된 카드는 작은 색점으로 어디에 함께 속하는지 표시
- **메타 패널**: "비어 있는 개념: ◯◯, ◯◯ — 더 궁금한 게 있을까?"

### Phase 3 — 🎯 탐구 라인 합의
- 컬럼별 질문 모아 보기 → 모둠 투표 (별표)
- 우리 반 핵심 질문 1~2개씩 선정
- 선정된 질문 묶어 **Lines of Inquiry 보드**로 이동
- 이게 단원 전체의 명시적 탐구 길

---

## 7. UI 와이어프레임 (텍스트)

```
┌──────────────────────────────────────────────────────────┐
│  📚 단원: 우리가 만드는 지속가능한 마을                  │
│  🎯 중심 아이디어: 우리의 선택은 환경에 변화를 만든다    │
│                                            [💾 자동저장]│
├──────────────────────────────────────────────────────────┤
│  [🌱Phase0]──[✏️Phase1]──[🗂️Phase2]──[🎯Phase3]  [⚙️] │
└──────────────────────────────────────────────────────────┘

[Phase 1 화면]
┌────────────────────────────┬─────────────────────────────┐
│  ✏️ 질문 만들기              │  💡 질문 시작어             │
│  ┌──────────────────────┐   │                             │
│  │ 이 단원에서 ___이/가 │   │  🟧 Form 어떤 모습일까?    │
│  │ 궁금해요             │   │   · ~의 특징은 무엇일까?  │
│  └──────────────────────┘   │   · ~을 그림으로 그린다면? │
│  [+ 질문 추가]               │  🟢 Change 어떻게 변하고…  │
│                            │   · 예전엔 어땠고 지금은? │
│  ▼ 내 질문 (4)              │   · 앞으로 ~은 어떻게 될까?│
│  • 쓰레기는 어떻게…    📌  │  ⋮                         │
│  • 왜 사람들은…             │                             │
│                            │  [📁 단어 시드 풀로]       │
└────────────────────────────┴─────────────────────────────┘

[Phase 2 화면 — 7컬럼 보드]
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ 🟧형│ 🟦기│ 🟥원│ 🟢변│ 🟦연│ 🟪관│ 🟪책│
│ 태  │ 능  │ 인  │ 화  │ 결  │ 점  │ 임  │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│ ──  │ ──  │ Q03 │ Q01●│ ──  │ ──  │ Q01●│
│     │     │ Q05 │ Q04 │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┘
   ● 동일 색점 = 다중 분류 (같은 질문이 두 컬럼에)

💬 메타 패널: 비어 있는 개념 4개 (형태·기능·연결·관점)
              → 이쪽으로 더 궁금한 게 있는지 모둠과 이야기해 볼까요?
```

---

## 8. 인쇄 레이아웃

### A4 — 학생 워크시트 (Phase 1·2용)
- 상단: 단원명 · 중심 아이디어
- 좌측: 내 질문 영역 (5~7줄, 손글씨 가능)
- 우측: 7개 개념 라벨 + 매칭 표시란 (질문 번호 적기)
- 하단: 질문 시작어 비계 박스

### A3 — 모둠 협력 매트릭스 (Phase 2·3용)
- 7컬럼 × 4행 (질문 카드 4개씩 수용)
- 인쇄 후 손글씨/포스트잇으로 카드 작성 가능
- 모둠 한 장씩 → 칠판 모음 = 학급 매트릭스

---

## 9. V1 / V1.5 전략 (qar-question-card와 동일 토글 패턴)

| 구분 | V1 기본형 | V1.5 확장형 |
|---|---|---|
| 저장 | LocalStorage 단독 | + Apps Script + Google Sheets |
| 협업 | 개인/모둠 1단말 | **수업코드 + 모둠 닉네임** (로그인 없음) |
| 교사용 | 인쇄·옵시디언 export | **7×N 매트릭스 대시보드** + 질문 분포 막대 |
| 진입 비용 | 즉시 가능 | IB 모둠 협력 수업에 최적 |

**전환 방식**: `config.js`의 `BACKEND_MODE = 'local' | 'sheets'` 토글 하나로 전환. 학교 IT 정책에 따라 현장 전환 가능.

---

## 10. M1~M5 마일스톤

| M | 산출물 | 핵심 기능 |
|---|---|---|
| **M1** | `index.html` + `data.js` + `style.css` 골격 | 7개 개념 카드 데이터, 정적 보드 표시, 단원 메타 입력 |
| **M2** | Phase 1·2 동작 | 질문 카드 CRUD, 드래그앤드롭, LocalStorage 저장/복원 |
| **M3** | 다중 분류 + Question Starts 비계 | 카드 복제 모드(최대 3), 시작어 클릭 → 입력 자동 삽입 |
| **M4** | Phase 0·3 | 단어 시드 풀 토글, 투표·별표, Lines of Inquiry 보드 |
| **M5** | 인쇄 + Export + 메타인지 패널 | A4·A3 인쇄 CSS, 옵시디언 markdown export, 빈 컬럼 알림 |

V1.5는 V1 안정화 후 M6~M8.

---

## 11. 옵시디언 연동 (Export 형식)

Export 버튼 → 다음 markdown 자동 생성 (다운로드):

```markdown
---
created: 2026-05-18
tags: [IB, concept-question-card, 5-6학년, 단원시작, 탐구질문]
unit: "우리가 만드는 지속가능한 마을"
central-idea: "우리의 선택은 환경에 변화를 만든다"
key-concepts: [change, responsibility, connection]
grade: 5-6
related: [[중심아이디어-환경과변화]], [[concept-question-card-프로젝트노트]]
---

# 우리 반의 탐구 질문 — 우리가 만드는 지속가능한 마을

## 🌊 변화 (Change)
- ⭐ 쓰레기는 어떻게 줄일 수 있을까? *(모둠2)*
- 우리 마을은 예전과 어떻게 다를까? *(모둠1)*

## 🤝 책임 (Responsibility)
- ⭐ 쓰레기는 어떻게 줄일 수 있을까? *(모둠2, 다중 분류 ↔ 변화)*
- 우리가 마을을 위해 할 수 있는 일은? *(모둠3)*

## 🔗 연결 (Connection)
- 마을과 환경은 어떻게 연결되어 있을까? *(모둠4)*

---

## 📌 명시적 탐구 라인 (Lines of Inquiry)
1. **변화**: 우리 마을과 환경은 어떻게 변하고 있는가?
2. **책임**: 우리는 마을의 변화를 위해 무엇을 할 수 있는가?
3. **연결**: 마을과 환경은 어떻게 서로 영향을 주고받는가?

## 💭 메타 성찰
- 비어 있던 개념: 형태·기능·원인·관점
- → 다음 차시: 관점(Perspective)을 보강하기 위해 "다른 마을 사람의 입장에서 보면?" 질문 추가하기
```

**PARA 권장 저장 경로**: `1-Projects/{단원명}/탐구질문보드.md`

---

## 12. 잠재 리스크 & 대응

| 리스크 | 대응 |
|---|---|
| 5-6학년이 7컬럼을 한 화면에 못 봄 | 모바일 가로 모드 + 2-3컬럼 슬라이드 전환 |
| "왜요?", "뭐예요?" 단순 질문 폭주 | Question Starts 비계 + 비슷한 질문 통합 |
| 다중 분류 남발 | 카드당 최대 3개 컬럼 하드 제한 |
| 모둠 합의 안 됨 | Phase 3 투표 + 교사 별표 추가/제거 권한 |
| 단어 시드 풀이 질문 생성 방해 | 토글 OFF로 빠른 진입 가능 |
| 학생 데이터 (V1.5) | 로그인 없는 닉네임 + 수업코드 만료 정책 |
| 분류 모호성 다툼 | **기능이자 학습의 황금 지점** — 다중 분류 허용으로 협상 유도 |

---

## 13. 책 챕터·연구 연결 가능성

- **IB PYP 후보교 교사 워크숍 자료**: 이 도구로 핵심 개념 7개의 실천 사례 시연 가능
- **한기쌤 책 챕터**: 『보이지 않는 사고를 보이게 하는 30가지 방법』 中 — Question Sorts + IB Key Concepts 융합 사례
- **수벤저스/수품책 협력**: 단원 시작 단계 도구로 학교급·교과별 적용 사례 수집

---

## 14. 즉시 결정 필요 (다음 라운드 — 🟡 6개)

| # | 항목 | 잠정 가정 | 확정 필요 |
|---|---|---|---|
| A1 | 7개 노출 방식 | 하이브리드 (기본 7개 + 교사 선별) | ⚪ |
| A3 | 영문 병기 | ON | ⚪ |
| B2 | Phase 이동 | 자유 이동 | ⚪ |
| C1 | 교사 사전 세팅 | 단원명·중심아이디어·시드단어·핵심개념 선별 | ⚪ |
| D1 | V1.5 토글 위치 | V1 코드에 미리 심기 | ⚪ |
| E1 | 범용성 | IB 톤 + 일반 교과 사용 가능 | ⚪ |

확정 후 → **M1 코딩 진입**
