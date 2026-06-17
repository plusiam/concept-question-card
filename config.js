// concept-question-card 런타임 설정 — 토글 하나로 V1/V1.5 전환

const CONFIG = {
  // 'local': 혼자 작업(LocalStorage) | 'realtime': 모둠 실시간(Supabase)
  BACKEND_MODE: 'local',

  // 실시간 모드용 Supabase 연결 (qar-board 프로젝트 — concept_cards 스키마)
  // publishable 키는 공개되어도 안전: 학생은 테이블 직접 접근 없이 접속코드로 RPC만 호출
  SUPABASE_URL: 'https://lsugarnnehkjduwbxgyw.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_r2PJNj8fNxq1S8twvmIX1Q_CUCRLnOY',

  // 활성화할 핵심 개념 ID 배열 — null이면 7개 전체 표시
  // 예: ['change', 'connection', 'responsibility']
  ENABLED_CONCEPTS: null
};
