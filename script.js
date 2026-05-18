// concept-question-card V1 — 상태 관리, 질문 생성·분류 통합 보드, 탐구 목록 (3단계 구조)

const STORAGE_KEY = 'cqc_v1';

// ── 상태 ──────────────────────────────────────────────
let state = {
  unitMeta: { ...UNIT_META_DEFAULT },
  questions: [],
  seeds: []
};

// 현재 인라인으로 펼쳐진 미분류 카드 id
let expandedCardId = null;

// 질문 시작어 비계에서 펼쳐진 개념 id
let scaffoldConceptId = null;

// ── LocalStorage ───────────────────────────────────────
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      unitMeta: state.unitMeta,
      questions: state.questions,
      seeds: state.seeds
    }));
    flashAutosave();
  } catch (e) { /* 저장 실패 무시 */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.unitMeta) state.unitMeta = { ...UNIT_META_DEFAULT, ...saved.unitMeta };
    if (Array.isArray(saved.questions)) state.questions = saved.questions;
    if (Array.isArray(saved.seeds)) state.seeds = saved.seeds;
  } catch (e) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function flashAutosave() {
  const badge = document.getElementById('autosaveBadge');
  if (!badge) return;
  badge.textContent = '✅ 저장됨';
  clearTimeout(badge._timer);
  badge._timer = setTimeout(() => { badge.textContent = '💾 자동저장'; }, 1500);
}

// ── 질문 카드 CRUD ─────────────────────────────────────
function generateId() {
  return 'q_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function addQuestion(text, author) {
  const q = {
    id: generateId(),
    text: text.trim(),
    author: author.trim() || '',
    conceptIds: [],
    starred: false,
    createdAt: new Date().toISOString()
  };
  state.questions.push(q);
  saveState();
  return q;
}

function deleteQuestion(id) {
  state.questions = state.questions.filter(q => q.id !== id);
  saveState();
}

// 다중 분류 추가 (최대 3개)
function addConceptToQuestion(id, conceptId) {
  const q = state.questions.find(q => q.id === id);
  if (!q || !conceptId) return false;
  if (q.conceptIds.includes(conceptId)) return false;
  if (q.conceptIds.length >= 3) return false;
  q.conceptIds.push(conceptId);
  saveState();
  return true;
}

// 특정 개념 분류 제거
function removeConceptFromQuestion(id, conceptId) {
  const q = state.questions.find(q => q.id === id);
  if (!q) return;
  q.conceptIds = q.conceptIds.filter(c => c !== conceptId);
  saveState();
}

// 별표(탐구 목록 선택) 토글
function toggleStar(id) {
  const q = state.questions.find(q => q.id === id);
  if (q) { q.starred = !q.starred; saveState(); }
}

// ── 1단계: 단어 시드 CRUD ─────────────────────────────
function generateSeedId() {
  return 'seed_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function addSeed(text) {
  const seed = {
    id: generateSeedId(),
    text: text.trim(),
    source: 'student',
    converted: false,
    createdAt: new Date().toISOString()
  };
  state.seeds.push(seed);
  saveState();
  return seed;
}

function deleteSeed(id) {
  state.seeds = state.seeds.filter(s => s.id !== id);
  saveState();
}

function markSeedConverted(id) {
  const seed = state.seeds.find(s => s.id === id);
  if (seed) { seed.converted = true; saveState(); }
}

// ── 1단계: 단어 모으기 렌더링 ─────────────────────────
function renderPhase0() {
  const panel = document.getElementById('panel0');
  if (!panel) return;
  const seedCount = state.seeds.length;
  const convertedCount = state.seeds.filter(s => s.converted).length;

  panel.innerHTML = `
    <div class="phase0-layout">
      <div class="seed-input-area">
        <div class="input-label">🌱 단어 모으기</div>
        <div class="seed-input-row">
          <input
            id="seedInput"
            class="seed-text-input"
            type="text"
            placeholder="주제를 보며 떠오르는 단어를 적어요 (예: 미끄럼틀, 안전)"
            maxlength="30"
          >
          <button class="btn btn-primary btn-add" id="btnAddSeed" disabled>+ 추가</button>
        </div>
        <div class="seed-hint">단어 카드를 클릭하면 '질문과 분류'로 이동해 질문을 바로 만들 수 있어요.</div>
      </div>
      <div class="seed-stats">
        <span class="count-badge">${seedCount}</span>개의 단어
        ${convertedCount > 0
          ? `<span class="seed-converted-count">· ${convertedCount}개 질문으로 변환됨</span>`
          : ''}
      </div>
      <div class="seed-pool" id="seedPool">
        ${seedCount === 0
          ? '<div class="seed-empty">아직 단어가 없어요. 위에서 첫 번째 단어를 추가해 보세요!</div>'
          : state.seeds.map(s => renderSeedCard(s)).join('')}
      </div>
    </div>
  `;

  bindPhase0Events();
}

function renderSeedCard(seed) {
  return `
    <div class="seed-card${seed.converted ? ' converted' : ''}" data-id="${seed.id}"
      title="${seed.converted ? '이미 질문으로 만들었어요 (다시 사용 가능)' : '클릭해서 질문 만들기'}">
      <span class="seed-text">${escapeHtml(seed.text)}</span>
      <button class="btn-seed-delete" data-id="${seed.id}" title="삭제">✕</button>
    </div>
  `;
}

function bindPhase0Events() {
  const input = document.getElementById('seedInput');
  const btn = document.getElementById('btnAddSeed');
  if (!input || !btn) return;

  input.addEventListener('input', () => {
    btn.disabled = input.value.trim().length === 0;
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !btn.disabled) addSeedAndRender();
  });

  btn.addEventListener('click', addSeedAndRender);

  document.getElementById('seedPool')?.addEventListener('click', e => {
    const del = e.target.closest('.btn-seed-delete');
    if (del) {
      deleteSeed(del.dataset.id);
      renderPhase0();
      updatePhaseBadges();
      return;
    }
    const card = e.target.closest('.seed-card');
    if (card) {
      const seed = state.seeds.find(s => s.id === card.dataset.id);
      if (!seed) return;
      markSeedConverted(seed.id);
      switchPhase(1);
      setTimeout(() => {
        const qi = document.getElementById('questionInput');
        if (qi) {
          qi.value = seed.text;
          qi.focus();
          qi.setSelectionRange(qi.value.length, qi.value.length);
          const addBtn = document.getElementById('btnAddQuestion');
          if (addBtn) addBtn.disabled = false;
        }
      }, 50);
    }
  });
}

function addSeedAndRender() {
  const input = document.getElementById('seedInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  addSeed(text);
  input.value = '';
  const btn = document.getElementById('btnAddSeed');
  if (btn) btn.disabled = true;
  renderPhase0();
  updatePhaseBadges();
}

// ── 활성 개념 목록 ─────────────────────────────────────
function getActiveConcepts() {
  const enabled = CONFIG.ENABLED_CONCEPTS || state.unitMeta.enabledConcepts;
  if (!enabled) return KEY_CONCEPTS;
  return KEY_CONCEPTS.filter(c => enabled.includes(c.id));
}

// ── 2단계: 질문과 분류 통합 보드 ──────────────────────
function renderPhase1() {
  const panel = document.getElementById('panel1');
  if (!panel) return;

  panel.innerHTML = `
    <div class="board-page">
      <div class="input-area">
        <div class="input-label">✏️ 새 질문 만들기</div>
        <textarea
          id="questionInput"
          class="question-input"
          placeholder="이 주제에서 무엇이 궁금한가요? 질문을 써 보세요."
          rows="3"
          maxlength="120"
        ></textarea>
        <div class="input-row">
          <input
            id="authorInput"
            class="author-input"
            type="text"
            placeholder="모둠 이름 (선택)"
            maxlength="20"
          >
          <button class="btn btn-primary btn-add" id="btnAddQuestion" disabled>+ 추가</button>
        </div>
      </div>

      <div class="scaffold-bar" id="scaffoldBar"></div>

      <div id="classifyArea"></div>
    </div>
  `;

  bindInputEvents();
  bindScaffold();
  bindClassifyEvents();
  renderScaffold();
  renderClassifyArea();
}

// ── 질문 시작어 비계 (가로 띠) ────────────────────────
function renderScaffold() {
  const bar = document.getElementById('scaffoldBar');
  if (!bar) return;
  const concepts = getActiveConcepts();
  const selected = concepts.find(c => c.id === scaffoldConceptId);

  bar.innerHTML = `
    <div class="scaffold-head">
      <span class="scaffold-title">💡 질문 시작어 비계</span>
      <span class="scaffold-note">개념을 누르면 시작어가 나와요. 시작어를 누르면 입력란에 들어가요.</span>
    </div>
    <div class="scaffold-chips">
      ${concepts.map(c => `
        <button class="scaffold-chip${c.id === scaffoldConceptId ? ' on' : ''}" data-concept="${c.id}"
          style="background:${c.palette.bg};color:${c.palette.text};border-color:${c.palette.accent}">
          ${c.icon} ${c.name}
        </button>
      `).join('')}
    </div>
    ${selected ? `
      <div class="scaffold-starts">
        ${selected.starts.map(s => `
          <button class="start-chip" data-text="${escapeHtml(s)}">${escapeHtml(s)}</button>
        `).join('')}
      </div>
    ` : ''}
  `;
}

function bindScaffold() {
  document.getElementById('scaffoldBar')?.addEventListener('click', e => {
    const chip = e.target.closest('.scaffold-chip');
    if (chip) {
      scaffoldConceptId = (scaffoldConceptId === chip.dataset.concept) ? null : chip.dataset.concept;
      renderScaffold();
      return;
    }
    const start = e.target.closest('.start-chip');
    if (start) {
      const input = document.getElementById('questionInput');
      if (!input) return;
      const cur = input.value.trim();
      input.value = cur ? cur + ' ' + start.dataset.text : start.dataset.text;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      const btn = document.getElementById('btnAddQuestion');
      if (btn) btn.disabled = input.value.trim().length === 0;
    }
  });
}

// 미분류 영역 + 7개 개념 컬럼 + 메타 패널만 다시 그림 (입력란은 유지)
function renderClassifyArea() {
  const host = document.getElementById('classifyArea');
  if (!host) return;
  const concepts = getActiveConcepts();
  const unclassified = state.questions.filter(q => q.conceptIds.length === 0);

  const boardHtml = concepts.map(c => {
    const cards = state.questions.filter(q => q.conceptIds.includes(c.id));
    return `
      <div class="concept-col" data-concept="${c.id}">
        <div class="col-header" style="color:${c.palette.text}">
          <div class="col-icon">${c.icon}</div>
          <div class="col-name">${c.name}</div>
          <div class="col-name-en">${c.nameEn}</div>
          <div class="col-key-question">${c.keyQuestion}</div>
        </div>
        <div class="col-cards sortable-list" id="cards-${c.id}" data-concept="${c.id}">
          ${cards.length === 0
            ? `<div class="col-empty-hint">분류된 질문이<br>여기 모여요</div>`
            : cards.map(q => renderQuestionCard(q, c)).join('')}
        </div>
      </div>
    `;
  }).join('');

  host.innerHTML = `
    <div class="unclassified-area">
      <div class="unclassified-header">
        📋 아직 분류하지 않은 질문 <span class="count-badge">${unclassified.length}</span>
        <span class="unclassified-hint">질문을 클릭하면 개념 버튼이 펼쳐져요.</span>
      </div>
      <div class="unclassified-list sortable-list" id="cards-unclassified" data-concept="">
        ${unclassified.length === 0
          ? '<div class="list-empty small">위에서 질문을 만들면 여기에 나타나요.</div>'
          : unclassified.map(q => renderQuestionCard(q, null)).join('')}
      </div>
    </div>
    <div class="concept-board" id="conceptBoard">${boardHtml}</div>
    <div class="meta-panel" id="metaPanel" style="display:none">
      <span class="meta-icon">💬</span>
      <span id="metaPanelText"></span>
    </div>
  `;

  initSortable();
  updateMetaPanel(concepts);
}

function renderQuestionCard(q, concept) {
  // 미분류 카드 — 클릭하면 개념 버튼이 인라인으로 펼쳐짐
  if (!concept) {
    const expanded = q.id === expandedCardId;
    const concepts = getActiveConcepts();
    return `
      <div class="q-card unclassified-card${expanded ? ' expanded' : ''}" data-id="${q.id}">
        <div class="q-card-text">${escapeHtml(q.text)}</div>
        <div class="q-card-footer">
          ${q.author ? `<span class="q-author-tag">${escapeHtml(q.author)}</span>` : '<span></span>'}
          <button class="btn-icon btn-delete-card" data-id="${q.id}" title="질문 삭제">✕</button>
        </div>
        ${expanded
          ? `<div class="inline-picker">
               <div class="inline-picker-hint">어떤 개념의 질문일까요?</div>
               <div class="inline-picker-grid">
                 ${concepts.map(c => `
                   <button class="concept-pick-btn" data-id="${q.id}" data-concept="${c.id}"
                     style="background:${c.palette.bg};color:${c.palette.text};border-color:${c.palette.accent}">
                     ${c.icon} ${c.name}
                   </button>
                 `).join('')}
               </div>
             </div>`
          : `<div class="card-tap-hint">👆 눌러서 개념 고르기</div>`}
      </div>
    `;
  }

  // 분류된 카드
  const otherConcepts = q.conceptIds
    .filter(id => id !== concept.id)
    .map(id => KEY_CONCEPTS.find(c => c.id === id))
    .filter(Boolean);

  const dotHtml = otherConcepts.map(c =>
    `<span class="concept-dot" style="background:${c.palette.accent}" title="${c.name} ${c.nameEn}"></span>`
  ).join('');

  const canAddMore = q.conceptIds.length < 3;
  const addBtnHtml = canAddMore
    ? `<button class="btn-icon btn-add-concept" data-id="${q.id}" title="다른 개념에도 분류하기">＋</button>`
    : '';

  const removeBtnHtml = q.conceptIds.length > 1
    ? `<button class="btn-icon btn-remove-concept" data-id="${q.id}" data-concept="${concept.id}" title="이 개념에서 빼기">✕</button>`
    : `<button class="btn-icon btn-delete-card" data-id="${q.id}" title="질문 삭제">✕</button>`;

  return `
    <div class="q-card" data-id="${q.id}" style="border-color:${concept.palette.accent}">
      ${otherConcepts.length > 0 ? `<div class="concept-dots">${dotHtml}</div>` : ''}
      <div class="q-card-text">${escapeHtml(q.text)}</div>
      <div class="q-card-footer">
        ${q.author ? `<span class="q-author-tag" style="color:${concept.palette.text}">${escapeHtml(q.author)}</span>` : '<span></span>'}
        <div class="q-card-actions">
          ${addBtnHtml}
          ${removeBtnHtml}
        </div>
      </div>
    </div>
  `;
}

// ── 질문 입력 이벤트 ──────────────────────────────────
function bindInputEvents() {
  const input = document.getElementById('questionInput');
  const btn = document.getElementById('btnAddQuestion');
  if (!input || !btn) return;

  input.addEventListener('input', () => {
    btn.disabled = input.value.trim().length === 0;
  });

  input.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !btn.disabled) {
      addAndRenderQuestion();
    }
  });

  btn.addEventListener('click', addAndRenderQuestion);
}

function addAndRenderQuestion() {
  const input = document.getElementById('questionInput');
  const authorInput = document.getElementById('authorInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  addQuestion(text, authorInput?.value || '');
  input.value = '';
  const btn = document.getElementById('btnAddQuestion');
  if (btn) btn.disabled = true;
  renderClassifyArea();
  updatePhaseBadges();
  input.focus();
}

// ── 카드 클릭 이벤트 (미분류 펼침 + 분류 카드 버튼) ──
function bindClassifyEvents() {
  const host = document.getElementById('classifyArea');
  if (!host) return;

  host.addEventListener('click', e => {
    // 인라인 개념 선택 버튼
    const pickBtn = e.target.closest('.concept-pick-btn');
    if (pickBtn) {
      addConceptToQuestion(pickBtn.dataset.id, pickBtn.dataset.concept);
      expandedCardId = null;
      renderClassifyArea();
      updatePhaseBadges();
      return;
    }
    // 질문 삭제
    const delCard = e.target.closest('.btn-delete-card');
    if (delCard) {
      deleteQuestion(delCard.dataset.id);
      if (expandedCardId === delCard.dataset.id) expandedCardId = null;
      renderClassifyArea();
      updatePhaseBadges();
      return;
    }
    // 이 개념에서 빼기
    const removeConc = e.target.closest('.btn-remove-concept');
    if (removeConc) {
      removeConceptFromQuestion(removeConc.dataset.id, removeConc.dataset.concept);
      renderClassifyArea();
      updatePhaseBadges();
      return;
    }
    // 다른 개념에 추가 (분류된 카드 — 팝오버)
    const addConc = e.target.closest('.btn-add-concept');
    if (addConc) {
      openConceptPicker(addConc.dataset.id, addConc);
      return;
    }
    // 미분류 카드 본문 클릭 → 개념 버튼 펼치기 토글
    const unCard = e.target.closest('.unclassified-card');
    if (unCard) {
      const id = unCard.dataset.id;
      expandedCardId = (expandedCardId === id) ? null : id;
      renderClassifyArea();
      return;
    }
  });
}

// ── SortableJS 초기화 (데스크톱 드래그 보조 경로) ────
function initSortable() {
  if (typeof Sortable === 'undefined') return;

  document.querySelectorAll('.sortable-list').forEach(el => {
    if (el._sortable) el._sortable.destroy();
    el._sortable = Sortable.create(el, {
      group: 'questions',
      animation: 150,
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      onEnd(evt) {
        const cardId = evt.item.dataset.id;
        const fromConceptId = evt.from.dataset.concept || '';
        const toConceptId = evt.to.dataset.concept || '';

        if (toConceptId === fromConceptId) return; // 같은 컬럼 내 정렬 — 무시

        const q = state.questions.find(q => q.id === cardId);
        if (!q) return;

        if (!toConceptId) {
          q.conceptIds = [];
        } else if (q.conceptIds.includes(toConceptId)) {
          // 이미 속한 컬럼 — 변경 없음
        } else if (fromConceptId && q.conceptIds.includes(fromConceptId)) {
          q.conceptIds = q.conceptIds.filter(c => c !== fromConceptId);
          if (q.conceptIds.length < 3) q.conceptIds.push(toConceptId);
        } else {
          if (q.conceptIds.length < 3) q.conceptIds.push(toConceptId);
        }

        expandedCardId = null;
        saveState();
        renderClassifyArea();
        updatePhaseBadges();
      }
    });
  });
}

// ── 개념 추가 팝오버 (분류된 카드의 ＋ 버튼) ─────────
function openConceptPicker(questionId, anchorEl) {
  document.getElementById('conceptPickerPop')?.remove();

  const q = state.questions.find(q => q.id === questionId);
  if (!q) return;

  const available = getActiveConcepts().filter(c => !q.conceptIds.includes(c.id));
  if (available.length === 0) return;

  const pop = document.createElement('div');
  pop.id = 'conceptPickerPop';
  pop.className = 'concept-picker-pop';
  pop.innerHTML = `
    <div class="picker-title">개념 추가 (최대 3개)</div>
    ${available.map(c => `
      <button class="picker-item" data-concept="${c.id}" data-qid="${questionId}"
        style="background:${c.palette.bg};color:${c.palette.text};border-color:${c.palette.accent}">
        ${c.icon} ${c.name} <span style="opacity:0.6;font-size:11px">${c.nameEn}</span>
      </button>
    `).join('')}
  `;

  document.body.appendChild(pop);
  const rect = anchorEl.getBoundingClientRect();
  pop.style.top = (rect.bottom + window.scrollY + 4) + 'px';
  pop.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 180) + 'px';

  pop.addEventListener('click', e => {
    const item = e.target.closest('.picker-item');
    if (item) {
      addConceptToQuestion(item.dataset.qid, item.dataset.concept);
      pop.remove();
      renderClassifyArea();
      updatePhaseBadges();
    }
  });

  setTimeout(() => {
    document.addEventListener('click', function close(ev) {
      if (!pop.contains(ev.target)) { pop.remove(); document.removeEventListener('click', close); }
    });
  }, 0);
}

// ── 메타인지 패널 ─────────────────────────────────────
function updateMetaPanel(concepts) {
  const panel = document.getElementById('metaPanel');
  const text = document.getElementById('metaPanelText');
  if (!panel || !text) return;

  const emptyConcepts = concepts.filter(c =>
    state.questions.filter(q => q.conceptIds.includes(c.id)).length === 0
  );

  if (state.questions.length === 0) {
    panel.style.display = 'none';
    return;
  }

  if (emptyConcepts.length === 0) {
    text.textContent = '모든 개념에 질문이 있어요. 탐구 영역이 고루 펼쳐졌네요!';
  } else if (emptyConcepts.length === concepts.length) {
    text.textContent = '질문을 분류하면 여기에 안내가 채워져요.';
  } else {
    const names = emptyConcepts.map(c => c.name).join('·');
    text.textContent = `비어 있는 개념: ${names} — 이쪽으로도 더 궁금한 게 있을까요?`;
  }
  panel.style.display = 'flex';
}

// ── 3단계: 탐구 목록 렌더링 ──────────────────────────
function renderInquiry() {
  const panel = document.getElementById('panel2');
  if (!panel) return;
  const concepts = getActiveConcepts();
  const starredCount = state.questions.filter(q => q.starred).length;

  const conceptSections = concepts.map(c => {
    const questions = state.questions.filter(q => q.conceptIds.includes(c.id));
    if (questions.length === 0) return '';
    return `
      <div class="phase3-concept-group" style="border-color:${c.palette.accent}">
        <div class="phase3-group-header" style="background:${c.palette.bg};color:${c.palette.text}">
          <span>${c.icon} ${c.name} <span style="font-weight:400;font-size:11px;opacity:0.75">${c.nameEn}</span></span>
          <span class="phase3-group-count">${questions.length}개</span>
        </div>
        <div class="phase3-question-list">
          ${questions.map(q => `
            <div class="phase3-q-item${q.starred ? ' starred' : ''}" data-id="${q.id}">
              <button class="star-btn${q.starred ? ' on' : ''}" data-id="${q.id}"
                title="${q.starred ? '별표 해제' : '탐구 목록으로 선택'}">
                ${q.starred ? '★' : '☆'}
              </button>
              <span class="phase3-q-text">${escapeHtml(q.text)}</span>
              ${q.author ? `<span class="q-author-tag">${escapeHtml(q.author)}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).filter(Boolean).join('');

  const loiItems = concepts.map(c => {
    const starred = state.questions.filter(q => q.starred && q.conceptIds.includes(c.id));
    if (starred.length === 0) return '';
    return `
      <div class="loi-card" style="border-color:${c.palette.accent};background:${c.palette.bg}">
        <div class="loi-concept-label" style="color:${c.palette.text}">${c.icon} ${c.name}</div>
        ${starred.map(q => `<div class="loi-question">${escapeHtml(q.text)}</div>`).join('')}
      </div>
    `;
  }).filter(Boolean).join('');

  panel.innerHTML = `
    <div class="phase3-layout">
      <div class="phase3-main">
        <div class="phase3-header">
          <div class="phase3-title">🎯 탐구 목록 선택</div>
          <div class="phase3-desc">함께 탐구할 질문에 별표(★)를 눌러요. 개념별로 대표 질문을 고르면 탐구 길이 만들어져요.</div>
        </div>
        <div class="phase3-groups" id="phase3Groups">
          ${conceptSections || '<div class="list-empty">질문을 개념으로 분류한 뒤 여기서 탐구 목록을 골라요.</div>'}
        </div>
      </div>
      <div class="phase3-sidebar">
        <div class="loi-header">
          <span>📌 탐구 목록 (Lines of Inquiry)</span>
          ${starredCount > 0 ? `<span class="count-badge">${starredCount}</span>` : ''}
        </div>
        <div class="loi-board">
          ${loiItems || '<div class="loi-empty">⭐ 왼쪽에서 질문에 별표를 눌러<br>탐구 목록을 선택해 보세요.</div>'}
        </div>
      </div>
    </div>
  `;

  document.getElementById('phase3Groups')?.addEventListener('click', e => {
    const starBtn = e.target.closest('.star-btn');
    if (starBtn) {
      toggleStar(starBtn.dataset.id);
      renderInquiry();
      updatePhaseBadges();
    }
  });
}

// ── 단계 탭 배지 업데이트 ─────────────────────────────
function setBadge(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.style.display = text ? '' : 'none';
}

function updatePhaseBadges() {
  const total = state.questions.length;
  const classified = state.questions.filter(q => q.conceptIds.length > 0).length;
  const starred = state.questions.filter(q => q.starred).length;
  const seedCount = state.seeds.length;
  setBadge('badge0', seedCount > 0 ? `${seedCount}개` : '');
  setBadge('badge1', total > 0 ? `${classified}/${total}` : '');
  setBadge('badge2', starred > 0 ? `${starred}개` : '');
}

// ── 단계 탭 전환 ─────────────────────────────────────
function switchPhase(phaseNum) {
  document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.classList.toggle('active', parseInt(tab.dataset.phase) === phaseNum);
  });
  document.querySelectorAll('.phase-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel${phaseNum}`);
  });
  if (phaseNum === 0) renderPhase0();
  if (phaseNum === 1) renderPhase1();
  if (phaseNum === 2) renderInquiry();
}

// ── 헤더 인라인 편집 ──────────────────────────────────
function bindHeaderEdit() {
  const topicEl = document.getElementById('headerTopic');
  const contextEl = document.getElementById('headerContext');

  function bindField(el, stateKey) {
    if (!el) return;
    el.addEventListener('blur', () => {
      state.unitMeta[stateKey] = el.textContent.trim();
      saveState();
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
    });
  }

  bindField(topicEl, 'unitTitle');
  bindField(contextEl, 'centralIdea');
}

function updateHeader() {
  const topicEl = document.getElementById('headerTopic');
  const contextEl = document.getElementById('headerContext');
  if (topicEl) topicEl.textContent = state.unitMeta.unitTitle || '';
  if (contextEl) contextEl.textContent = state.unitMeta.centralIdea || '';
}

// ── 설정 모달 ─────────────────────────────────────────
function openModal() {
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('inputGroupName').value = state.unitMeta.groupName || '';
  document.querySelectorAll('.concept-check-item input').forEach(cb => {
    cb.checked = state.unitMeta.enabledConcepts
      ? state.unitMeta.enabledConcepts.includes(cb.dataset.conceptId)
      : false;
  });
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function saveModal() {
  state.unitMeta.groupName = document.getElementById('inputGroupName').value.trim();
  const checked = [...document.querySelectorAll('.concept-check-item input:checked')]
    .map(cb => cb.dataset.conceptId);
  state.unitMeta.enabledConcepts = checked.length > 0 ? checked : null;
  saveState();
  closeModal();
  const tab = document.querySelector('.phase-tab.active');
  switchPhase(tab ? parseInt(tab.dataset.phase) : 1);
}

// ── JSON 내보내기 / 불러오기 ──────────────────────────
function exportJSON() {
  const data = {
    app: 'concept-question-card',
    version: 1,
    exportedAt: new Date().toISOString(),
    unitMeta: state.unitMeta,
    questions: state.questions,
    seeds: state.seeds
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const namePart = [state.unitMeta.unitTitle, state.unitMeta.groupName]
    .map(s => (s || '').trim())
    .filter(Boolean)
    .join('_')
    .replace(/[\/\\:*?"<>|]/g, '-') || '개념질문카드';
  const a = document.createElement('a');
  a.href = url;
  a.download = `${namePart}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── 현재 단계 인쇄 / PDF ──────────────────────────────
function doPrint() {
  const tab = document.querySelector('.phase-tab.active');
  const phase = tab ? parseInt(tab.dataset.phase) : 1;
  const stepNames = ['1단계 단어 모으기', '2단계 질문과 분류', '3단계 탐구 목록'];

  const ph = document.getElementById('printHeader');
  if (ph) {
    const topic = state.unitMeta.unitTitle || '주제 미정';
    const grp = state.unitMeta.groupName ? `${state.unitMeta.groupName} · ` : '';
    const dateStr = new Date().toLocaleDateString('ko-KR');
    ph.innerHTML = `
      <div class="print-title">🔍 ${escapeHtml(topic)}
        <span class="print-step">${stepNames[phase] || ''}</span></div>
      <div class="print-sub">${escapeHtml(grp)}${dateStr}</div>
    `;
  }

  // 2단계 보드는 컬럼이 7개라 가로, 나머지는 세로
  let orient = document.getElementById('printOrient');
  if (!orient) {
    orient = document.createElement('style');
    orient.id = 'printOrient';
    document.head.appendChild(orient);
  }
  orient.textContent = `@page { size: A4 ${phase === 1 ? 'landscape' : 'portrait'}; margin: 12mm; }`;

  window.print();
}

function importJSON(file) {
  if (state.questions.length > 0 || state.seeds.length > 0) {
    if (!confirm('지금 화면의 질문과 단어가 불러온 파일 내용으로 모두 바뀝니다. 계속할까요?')) return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try {
      data = JSON.parse(reader.result);
    } catch (e) {
      alert('파일을 읽을 수 없어요. 올바른 JSON 파일인지 확인해 주세요.');
      return;
    }
    if (!data || data.app !== 'concept-question-card') {
      alert('이 도구에서 내보낸 질문 카드 파일이 아니에요.');
      return;
    }
    state.unitMeta = { ...UNIT_META_DEFAULT, ...(data.unitMeta || {}) };
    state.questions = Array.isArray(data.questions) ? data.questions : [];
    state.seeds = Array.isArray(data.seeds) ? data.seeds : [];
    expandedCardId = null;
    scaffoldConceptId = null;
    saveState();
    updateHeader();
    switchPhase(1);
    updatePhaseBadges();
  };
  reader.readAsText(file);
}

// ── 개념 체크박스 렌더링 ──────────────────────────────
function renderConceptCheckGrid() {
  const grid = document.getElementById('conceptCheckGrid');
  if (!grid) return;
  grid.innerHTML = KEY_CONCEPTS.map(c => `
    <label class="concept-check-item">
      <input type="checkbox" data-concept-id="${c.id}">
      ${c.icon} ${c.name}
    </label>
  `).join('');
}

// ── 유틸 ──────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── 이벤트 바인딩 ─────────────────────────────────────
function bindEvents() {
  document.getElementById('phaseNav').addEventListener('click', e => {
    const tab = e.target.closest('.phase-tab');
    if (tab) switchPhase(parseInt(tab.dataset.phase));
  });

  document.getElementById('btnSettings').addEventListener('click', openModal);
  document.getElementById('btnPrint').addEventListener('click', doPrint);
  document.getElementById('btnExport').addEventListener('click', exportJSON);
  document.getElementById('btnImport').addEventListener('click', () => {
    document.getElementById('fileImport').click();
  });
  document.getElementById('fileImport').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) importJSON(file);
    e.target.value = '';
  });
  document.getElementById('btnModalCancel').addEventListener('click', closeModal);
  document.getElementById('btnModalSave').addEventListener('click', saveModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
}

// ── 초기화 ────────────────────────────────────────────
function init() {
  loadState();
  renderConceptCheckGrid();
  bindEvents();
  bindHeaderEdit();
  updateHeader();
  switchPhase(1);
  updatePhaseBadges();
  if (!state.unitMeta.unitTitle) {
    setTimeout(() => document.getElementById('headerTopic')?.focus(), 100);
  }
}

init();
