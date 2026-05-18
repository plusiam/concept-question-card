// IB PYP 7개 핵심 개념 데이터 및 주제 메타 기본값

const KEY_CONCEPTS = [
  {
    id: 'form',
    name: '형태',
    nameEn: 'Form',
    keyQuestion: '어떤 모습일까?',
    icon: '🔷',
    starts: [
      '~의 특징은 무엇일까?',
      '~은 어떻게 생겼을까?',
      '~을 그림으로 그린다면?'
    ],
    palette: { bg: '#FFF7E6', accent: '#F59E0B', text: '#92400E' }
  },
  {
    id: 'function',
    name: '기능',
    nameEn: 'Function',
    keyQuestion: '어떻게 작동할까?',
    icon: '⚙️',
    starts: [
      '~은 어떤 일을 할까?',
      '~이 없으면 어떻게 될까?',
      '~은 어떻게 움직일까?'
    ],
    palette: { bg: '#EEF2FF', accent: '#6366F1', text: '#3730A3' }
  },
  {
    id: 'causation',
    name: '원인',
    nameEn: 'Causation',
    keyQuestion: '왜 이렇게 되었을까?',
    icon: '⚡',
    starts: [
      '왜 ~은 ~할까?',
      '무엇 때문에 ~이 일어났을까?',
      '~의 진짜 이유는 무엇일까?'
    ],
    palette: { bg: '#FEE2E2', accent: '#EF4444', text: '#991B1B' }
  },
  {
    id: 'change',
    name: '변화',
    nameEn: 'Change',
    keyQuestion: '어떻게 변하고 있을까?',
    icon: '🌊',
    starts: [
      '예전엔 어땠고 지금은 어떨까?',
      '앞으로 ~은 어떻게 될까?',
      '~은 무엇을 통해 변할까?'
    ],
    palette: { bg: '#DCFCE7', accent: '#22C55E', text: '#166534' }
  },
  {
    id: 'connection',
    name: '연결',
    nameEn: 'Connection',
    keyQuestion: '무엇과 이어져 있을까?',
    icon: '🔗',
    starts: [
      '~과 ~은 어떻게 연결될까?',
      '~이 ~에 어떤 영향을 줄까?',
      '~과 비슷한 것은?'
    ],
    palette: { bg: '#CFFAFE', accent: '#06B6D4', text: '#155E75' }
  },
  {
    id: 'perspective',
    name: '관점',
    nameEn: 'Perspective',
    keyQuestion: '누구의 시선일까?',
    icon: '👁️',
    starts: [
      '~의 입장에서 보면?',
      '다르게 본다면 어떨까?',
      '~은 누구의 의견일까?'
    ],
    palette: { bg: '#F3E8FF', accent: '#A855F7', text: '#6B21A8' }
  },
  {
    id: 'responsibility',
    name: '책임',
    nameEn: 'Responsibility',
    keyQuestion: '우리는 무엇을 해야 할까?',
    icon: '🤝',
    starts: [
      '우리가 할 수 있는 일은?',
      '~한다면 어떻게 될까?',
      '~을 위해 무엇이 필요할까?'
    ],
    palette: { bg: '#FCE7F3', accent: '#EC4899', text: '#9D174D' }
  }
];

const UNIT_META_DEFAULT = {
  unitTitle: '',
  centralIdea: '',
  groupName: '',
  enabledConcepts: null,
  seedWords: [],
  grade: '5-6'
};
