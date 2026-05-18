// concept-question-card 런타임 설정 — 토글 하나로 V1/V1.5 전환

const CONFIG = {
  // V1: 'local' | V1.5: 'sheets'
  BACKEND_MODE: 'local',

  // Phase 0 단어 시드 풀 표시 여부
  SEED_MODE: true,

  // 학년 모드 ('5-6' | '3-4' | '1-2')
  GRADE: '5-6',

  // 활성화할 핵심 개념 ID 배열 — null이면 7개 전체 표시
  // 예: ['change', 'connection', 'responsibility']
  ENABLED_CONCEPTS: null
};
