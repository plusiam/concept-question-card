// IB PYP 7개 핵심 개념 데이터 및 주제 메타 기본값

const KEY_CONCEPTS = [
  {
    id: 'form',
    name: '형태',
    nameEn: 'Form',
    keyQuestion: '어떤 모습일까?',
    icon: '🔷',
    starts: [
      '이것의 가장 눈에 띄는 특징은 무엇일까?',
      '한 번도 본 적 없는 친구에게 이것을 어떻게 설명할까?',
      '이것은 어떤 부분들로 이루어져 있을까?',
      '이것과 비슷해 보이지만 다른 것은 무엇일까?'
    ],
    domains: ['겉모습', '이루는 부분', '나누는 기준'],
    palette: { bg: '#FFF7E6', accent: '#F59E0B', text: '#92400E' }
  },
  {
    id: 'function',
    name: '기능',
    nameEn: 'Function',
    keyQuestion: '어떻게 작동할까?',
    icon: '⚙️',
    starts: [
      '이것은 무슨 일을 할까?',
      '이것은 어떤 역할을 맡고 있을까?',
      '이것이 없다면 어떤 일을 못 하게 될까?',
      '이것은 어떻게 움직이거나 작동할까?'
    ],
    domains: ['하는 일', '맡은 역할', '움직이는 방식'],
    palette: { bg: '#EEF2FF', accent: '#6366F1', text: '#3730A3' }
  },
  {
    id: 'causation',
    name: '인과관계',
    nameEn: 'Causation',
    keyQuestion: '왜 이렇게 되었을까?',
    icon: '⚡',
    starts: [
      '무엇 때문에 이런 일이 일어났을까?',
      '원인을 거슬러 올라가면 어디까지 갈 수 있을까?',
      '이것이 만들어 낸 결과는 무엇일까?',
      '진짜 원인과 겉으로 보이는 원인은 어떻게 다를까?'
    ],
    domains: ['일어난 까닭', '숨은 배경', '생겨난 결과'],
    palette: { bg: '#FEE2E2', accent: '#EF4444', text: '#991B1B' }
  },
  {
    id: 'change',
    name: '변화',
    nameEn: 'Change',
    keyQuestion: '어떻게 변하고 있을까?',
    icon: '🌊',
    starts: [
      '시간이 지나면서 이것은 어떻게 달라졌을까?',
      '이 변화는 빠를까, 느릴까? 무엇이 속도를 정할까?',
      '무엇이 이 변화를 이끌고 있을까?',
      '앞으로 이것은 어떻게 달라질까?'
    ],
    domains: ['시간에 따른 변화', '자라남', '달라진 모습'],
    palette: { bg: '#DCFCE7', accent: '#22C55E', text: '#166534' }
  },
  {
    id: 'connection',
    name: '연결',
    nameEn: 'Connection',
    keyQuestion: '무엇과 이어져 있을까?',
    icon: '🔗',
    starts: [
      '이것은 무엇과 서로 영향을 주고받을까?',
      '이것이 사라진다면 무엇이 함께 흔들릴까?',
      '이것은 어떤 더 큰 무리의 한 부분일까?',
      '전혀 달라 보이는 것들이 사실은 어떻게 이어져 있을까?'
    ],
    domains: ['이어진 관계', '주고받는 영향', '서로 기댐'],
    palette: { bg: '#CFFAFE', accent: '#06B6D4', text: '#155E75' }
  },
  {
    id: 'perspective',
    name: '관점',
    nameEn: 'Perspective',
    keyQuestion: '어떤 관점들이 있을까?',
    icon: '👁️',
    starts: [
      '사람마다 이것을 어떻게 다르게 볼까?',
      '왜 사람마다 생각이 다를까?',
      '내 생각은 어디에서 왔을까?',
      '잘 들리지 않는 목소리는 누구의 것일까?'
    ],
    domains: ['사람마다 다른 입장', '여러 해석', '치우친 생각'],
    palette: { bg: '#F3E8FF', accent: '#A855F7', text: '#6B21A8' }
  },
  {
    id: 'responsibility',
    name: '책임',
    nameEn: 'Responsibility',
    keyQuestion: '우리는 무엇을 해야 할까?',
    icon: '🤝',
    starts: [
      '우리는 무엇을 해야 하고, 무엇을 할 수 있을까?',
      '누구에게 책임이 있고, 어떻게 나눌 수 있을까?',
      '어떤 행동이 더 나은 변화를 만들까?',
      '지금 내가 시작할 수 있는 작은 행동은 무엇일까?'
    ],
    domains: ['옳은 행동', '내가 실천할 일', '함께 참여하기'],
    palette: { bg: '#FCE7F3', accent: '#EC4899', text: '#9D174D' }
  }
];

const UNIT_META_DEFAULT = {
  unitTitle: '',
  centralIdea: '',
  groupName: '',
  enabledConcepts: null
};
