// concept-question-card V1 — 상태 관리, CRUD, 드래그앤드롭, LocalStorage (M4: Phase 0 시드 풀 + Phase 3 탐구 라인)

const STORAGE_KEY = 'cqc_v1';

// ── 상태 ──────────────────────────────────────────────
let state = {
  unitMeta: { ...UNIT_META_DEFAULT },
  questions: [],
  seeds: []
};

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

function updateQuestionText(id, newText) {
  const q = state.questions.find(q => q.id === id);
  if (q) { q.text = newText.trim(); saveState(); }
}

function setQuestionConcept(id, conceptId) {
  const q = state.questions.find(q => q.id === id);
  if (!q) return;
  q.conceptIds = conceptId ? [conceptId] : [];
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

// 별표(탐구 라인 선택) 토글
function toggleStar(id) {
  const q = state.questions.find(q => q.id === id);
  if (q) { q.starred = !q.starred; saveState(); }
}

// ── Phase 0: 단어 시드 풀 CRUD ────────────────────────
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

// ── Phase 0: 단어 시드 풀 렌더링 ─────────────────────
function renderPhase0() {
  const panel = document.getElementById('panel0');
  if (!panel) return;
  const seedCount = state.seeds.length;
  const convertedCount = state.seeds.filter(s => s.converted).length;

  panel.innerHTML = `
    <div class="phase0-layout">
      <div class="seed-input-area">
        <div class="input-label">🌱 단어 시드 추가</div>
        <div class="seed-input-row">
          <input
            id="seedInput"
            class="seed-text-input"
            type="text"
            placeholder="자료에서 눈에 띈 단어나 개념을 적어요"
            maxlength="30"
          >
          <button class="btn btn-primary btn-add" id="btnAddSeed" disabled>+ 추가</button>
        </div>
        <div class="seed-hint">단어 카드를 클릭하면 Phase 1로 이동해서 질문을 바로 만들 수 있어요.</div>
      </div>
      <div class="seed-stats">
        <span class="count-badge">${seedCount}</span>개의 단어 시드
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
    if (card && !e.target.closest('.btn-seed-delete')) {
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

// ── Phase 1: 질문 만들기 렌더링 ────────────────────────
function renderPhase1() {
  const panel = document.getElementById('panel1');
  const unclassified = state.questions.filter(q => q.conceptIds.length === 0);
  const classified = state.questions.filter(q => q.conceptIds.length > 0);

  panel.innerHTML = `
    <div class="phase1-layout">
      <div class="phase1-main">
        <div class="input-area">
          <div class="input-label">✏️ 새 질문 만들기</div>
          <textarea
            id="questionInput"
            class="question-input"
            placeholder="이 단원에서 무엇이 궁금한가요? 질문을 써 보세요."
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
            <button class="btn btn-primary btn-add" id="btnAddQuestion" disabled>
              + 추가
            </button>
          </div>
        </div>

        <div class="question-list-section">
          <div class="list-header">
            <span>📋 내 질문 <span class="count-badge">${state.questions.length}</span></span>
            ${unclassified.length > 0
              ? `<span class="hint-text">💡 Phase 2에서 개념 컬럼으로 분류해 보세요.</span>`
              : state.questions.length > 0
                ? `<span class="hint-text success">✅ 모든 질문이 분류되었어요!</span>`
                : ''}
          </div>
          <div class="question-list" id="phase1QuestionList">
            ${state.questions.length === 0
              ? '<div class="list-empty">아직 만든 질문이 없어요. 위에서 첫 질문을 써 보세요!</div>'
              : state.questions.map(q => renderQuestionListItem(q)).join('')}
          </div>
        </div>
      </div>

      <aside class="phase1-sidebar">
        <div class="sidebar-title">💡 질문 시작어 비계</div>
        <div class="sidebar-note">개념을 클릭하면 시작어가 펼쳐져요. 시작어를 클릭하면 입력란에 자동으로 들어가요.</div>
        <div class="sidebar-accordion" id="startsAccordion">
          ${getActiveConcepts().map(c => `
            <div class="accordion-item" data-concept="${c.id}">
              <button class="accordion-header" data-concept="${c.id}"
                style="background:${c.palette.bg};color:${c.palette.text};border-color:${c.palette.accent}">
                <span>${c.icon} ${c.name}</span>
                <span class="accordion-arrow">▸</span>
              </button>
              <div class="accordion-body" data-concept="${c.id}">
                ${c.starts.map(s => `
                  <button class="start-chip" data-text="${escapeHtml(s)}">${escapeHtml(s)}</button>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </aside>
    </div>
  `;

  bindPhase1Events();
}

function renderQuestionListItem(q) {
  const concept = q.conceptIds[0]
    ? KEY_CONCEPTS.find(c => c.id === q.conceptIds[0])
    : null;
  return `
    <div class="q-list-item" data-id="${q.id}">
      <div class="q-list-text" contenteditable="true" data-id="${q.id}">${escapeHtml(q.text)}</div>
      <div class="q-list-meta">
        ${q.author ? `<span class="q-author-tag">${escapeHtml(q.author)}</span>` : ''}
        ${concept
          ? `<span class="q-concept-tag" style="background:${concept.palette.bg};color:${concept.palette.text}">${concept.icon} ${concept.name}</span>`
          : '<span class="q-concept-tag unclassified">미분류</span>'}
        <button class="btn-icon btn-delete-q" data-id="${q.id}" title="삭제">✕</button>
      </div>
    </div>
  `;
}

function bindPhase1Events() {
  const input = document.getElementById('questionInput');
  const btn = document.getElementById('btnAddQuestion');
  if (!input || !btn) return;

  input.addEventListener('input', () => {
    btn.disabled = input.value.trim().length === 0;
  });

  input.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!btn.disabled) addAndRenderQuestion();
    }
  });

  btn.addEventListener('click', addAndRenderQuestion);

  // 삭제 버튼 (이벤트 위임)
  document.getElementById('phase1QuestionList')?.addEventListener('click', e => {
    const del = e.target.closest('.btn-delete-q');
    if (del) {
      deleteQuestion(del.dataset.id);
      renderPhase1();
      renderConceptBoard();
    }
  });

  // 인라인 편집 (blur 시 저장)
  document.getElementById('phase1QuestionList')?.addEventListener('blur', e => {
    const el = e.target.closest('[contenteditable]');
    if (el?.dataset.id) {
      updateQuestionText(el.dataset.id, el.textContent);
    }
  }, true);

  // 아코디언 토글
  document.getElementById('startsAccordion')?.addEventListener('click', e => {
    const header = e.target.closest('.accordion-header');
    const chip = e.target.closest('.start-chip');

    if (header) {
      const conceptId = header.dataset.concept;
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      // 다른 항목 닫기
      document.querySelectorAll('.accordion-item.open').forEach(el => el.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    }

    if (chip) {
      const input = document.getElementById('questionInput');
      if (!input) return;
      const text = chip.dataset.text;
      // 입력란에 시작어 삽입 (기존 내용 뒤에 붙이거나 비어있으면 대체)
      const cur = input.value.trim();
      input.value = cur ? cur + ' ' + text : text;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      document.getElementById('btnAddQuestion').disabled = input.value.trim().length === 0;
    }
  });
}

function addAndRenderQuestion() {
  const input = document.getElementById('questionInput');
  const authorInput = document.getElementById('authorInput');
  const text = input.value.trim();
  if (!text) return;
  addQuestion(text, authorInput?.value || '');
  input.value = '';
  document.getElementById('btnAddQuestion').disabled = true;
  renderPhase1();
  renderConceptBoard();
  updatePhaseBadges();
}

// ── Phase 2: 개념 분류 보드 렌더링 ────────────────────
function getActiveConcepts() {
  const enabled = CONFIG.ENABLED_CONCEPTS || state.unitMeta.enabledConcepts;
  if (!enabled) return KEY_CONCEPTS;
  return KEY_CONCEPTS.filter(c => enabled.includes(c.id));
}

function renderConceptBoard() {
  const board = document.getElementById('conceptBoard');
  if (!board) return;
  const concepts = getActiveConcepts();

  board.innerHTML = concepts.map(c => {
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
            ? `<div class="col-empty-hint">질문 카드를<br>여기에 놓아요</div>`
            : cards.map(q => renderQuestionCard(q, c)).join('')}
        </div>
      </div>
    `;
  }).join('');

  // 미분류 카드 영역
  const unclassified = state.questions.filter(q => q.conceptIds.length === 0);
  const existing = document.getElementById('unclassifiedArea');
  if (existing) existing.remove();

  const unArea = document.createElement('div');
  unArea.id = 'unclassifiedArea';
  unArea.className = 'unclassified-area';
  unArea.innerHTML = `
    <div class="unclassified-header">
      📋 분류 전 질문 <span class="count-badge">${unclassified.length}</span>
      <span class="unclassified-hint">카드를 위 컬럼으로 드래그해 분류하세요.</span>
    </div>
    <div class="unclassified-list sortable-list" id="cards-unclassified" data-concept="">
      ${unclassified.length === 0
        ? '<div class="list-empty small">모든 질문이 분류되었어요! 🎉</div>'
        : unclassified.map(q => renderQuestionCard(q, null)).join('')}
    </div>
  `;
  board.after(unArea);

  initSortable();
  updateMetaPanel(concepts);
}

function renderQuestionCard(q, concept) {
  const border = concept ? concept.palette.accent : '#D1D5DB';
  const textColor = concept ? concept.palette.text : '#6B7280';

  // 이 카드가 속한 다른 개념들의 색점
  const otherConcepts = q.conceptIds
    .filter(id => id !== (concept ? concept.id : ''))
    .map(id => KEY_CONCEPTS.find(c => c.id === id))
    .filter(Boolean);

  const dotHtml = otherConcepts.map(c =>
    `<span class="concept-dot" style="background:${c.palette.accent}" title="${c.name} ${c.nameEn}"></span>`
  ).join('');

  // + 버튼: 현재 미분류거나 3개 미만일 때만 표시
  const canAddMore = concept && q.conceptIds.length < 3;
  const addBtnHtml = canAddMore
    ? `<button class="btn-icon btn-add-concept" data-id="${q.id}" title="다른 개념에도 분류하기">＋</button>`
    : '';

  // 이 컬럼에서만 제거하는 × (다중 분류된 카드일 때)
  const removeBtnHtml = concept && q.conceptIds.length > 1
    ? `<button class="btn-icon btn-remove-concept" data-id="${q.id}" data-concept="${concept.id}" title="이 개념에서 제거">✕</button>`
    : `<button class="btn-icon btn-delete-card" data-id="${q.id}" title="질문 삭제">✕</button>`;

  return `
    <div class="q-card" data-id="${q.id}" style="border-color:${border}">
      ${otherConcepts.length > 0 ? `<div class="concept-dots">${dotHtml}</div>` : ''}
      <div class="q-card-text">${escapeHtml(q.text)}</div>
      <div class="q-card-footer">
        ${q.author ? `<span class="q-author-tag" style="color:${textColor}">${escapeHtml(q.author)}</span>` : '<span></span>'}
        <div class="q-card-actions">
          ${addBtnHtml}
          ${removeBtnHtml}
        </div>
      </div>
    </div>
  `;
}

// ── SortableJS 초기화 ──────────────────────────────────
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
          // 미분류 영역으로 이동 → 전체 분류 해제
          q.conceptIds = [];
        } else if (q.conceptIds.includes(toConceptId)) {
          // 이미 속한 컬럼 — 원래 위치로 렌더 (중복 방지)
        } else if (fromConceptId && q.conceptIds.includes(fromConceptId)) {
          // 기존 컬럼에서 다른 컬럼으로 이동 → 기존 제거 후 새 개념 추가
          q.conceptIds = q.conceptIds.filter(c => c !== fromConceptId);
          if (q.conceptIds.length < 3) q.conceptIds.push(toConceptId);
        } else {
          // 미분류 → 컬럼으로 첫 분류
          if (q.conceptIds.length < 3) q.conceptIds.push(toConceptId);
        }

        saveState();
        renderConceptBoard();
        renderPhase1();
        updatePhaseBadges();
      }
    });
  });

  // 카드 버튼 이벤트 위임 (보드 + 미분류 영역 공통)
  function handleCardClick(e) {
    // 질문 삭제
    const delCard = e.target.closest('.btn-delete-card');
    if (delCard) {
      deleteQuestion(delCard.dataset.id);
      renderConceptBoard(); renderPhase1(); updatePhaseBadges();
      return;
    }
    // 이 개념에서만 제거
    const removeConc = e.target.closest('.btn-remove-concept');
    if (removeConc) {
      removeConceptFromQuestion(removeConc.dataset.id, removeConc.dataset.concept);
      renderConceptBoard(); renderPhase1(); updatePhaseBadges();
      return;
    }
    // 다른 개념에 추가 (팝오버)
    const addConc = e.target.closest('.btn-add-concept');
    if (addConc) {
      openConceptPicker(addConc.dataset.id, addConc);
    }
  }

  document.getElementById('conceptBoard')?.addEventListener('click', handleCardClick);
  document.getElementById('unclassifiedArea')?.addEventListener('click', handleCardClick);
}

// ── 개념 추가 팝오버 ──────────────────────────────────
function openConceptPicker(questionId, anchorEl) {
  // 기존 팝오버 제거
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

  // 위치: 앵커 기준
  document.body.appendChild(pop);
  const rect = anchorEl.getBoundingClientRect();
  pop.style.top = (rect.bottom + window.scrollY + 4) + 'px';
  pop.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 180) + 'px';

  pop.addEventListener('click', e => {
    const item = e.target.closest('.picker-item');
    if (item) {
      addConceptToQuestion(item.dataset.qid, item.dataset.concept);
      pop.remove();
      renderConceptBoard(); renderPhase1(); updatePhaseBadges();
    }
  });

  // 외부 클릭 시 닫기
  setTimeout(() => {
    document.addEventListener('click', function close(ev) {
      if (!pop.contains(ev.target)) { pop.remove(); document.removeEventListener('click', close); }
    });
  }, 0);
}

function updateEmptyHints() {
  document.querySelectorAll('.sortable-list').forEach(list => {
    const hasCards = list.querySelectorAll('.q-card').length > 0;
    let hint = list.querySelector('.col-empty-hint');
    const conceptId = list.dataset.concept;

    if (conceptId) {
      if (hasCards && hint) hint.remove();
      if (!hasCards && !hint) {
        hint = document.createElement('div');
        hint.className = 'col-empty-hint';
        hint.textContent = '질문 카드를 여기에 놓아요';
        list.appendChild(hint);
      }
    }
  });
}

// ── 메타인지 패널 ─────────────────────────────────────
function updateMetaPanel(concepts) {
  const panel = document.getElementById('metaPanel');
  const text = document.getElementById('metaPanelText');
  if (!panel || !text) return;

  const emptyConcepts = concepts.filter(c =>
    state.questions.filter(q => q.conceptIds.includes(c.id)).length === 0
  );

  if (emptyConcepts.length === 0) {
    text.textContent = '모든 개념 컬럼에 질문이 있어요. 탐구 영역이 고루 펼쳐졌네요!';
  } else if (emptyConcepts.length === concepts.length) {
    text.textContent = '질문 카드를 분류하면 여기에 내용이 채워져요.';
  } else {
    const names = emptyConcepts.map(c => c.name).join('·');
    text.textContent = `비어 있는 개념: ${names} — 이쪽으로도 더 궁금한 게 있을까요?`;
  }
  panel.style.display = 'flex';
}

// ── Phase 3: 탐구 라인 렌더링 ────────────────────────
function renderPhase3() {
  const panel = document.getElementById('panel3');
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
                title="${q.starred ? '별표 해제' : '탐구 라인으로 선택'}">
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
          <div class="phase3-title">🎯 탐구 라인 선택</div>
          <div class="phase3-desc">함께 탐구할 질문에 별표(★)를 눌러요. 개념별로 대표 질문을 고르면 탐구 길이 만들어져요.</div>
        </div>
        <div class="phase3-groups" id="phase3Groups">
          ${conceptSections || '<div class="list-empty">Phase 2에서 질문을 개념 컬럼에 분류한 뒤 여기서 탐구 라인을 골라요.</div>'}
        </div>
      </div>
      <div class="phase3-sidebar">
        <div class="loi-header">
          <span>📌 탐구 라인 (Lines of Inquiry)</span>
          ${starredCount > 0 ? `<span class="count-badge">${starredCount}</span>` : ''}
        </div>
        <div class="loi-board">
          ${loiItems || '<div class="loi-empty">⭐ 왼쪽에서 질문에 별표를 눌러<br>탐구 라인을 선택해 보세요.</div>'}
        </div>
      </div>
    </div>
  `;

  document.getElementById('phase3Groups')?.addEventListener('click', e => {
    const starBtn = e.target.closest('.star-btn');
    if (starBtn) {
      toggleStar(starBtn.dataset.id);
      renderPhase3();
      updatePhaseBadges();
    }
  });
}

// ── Phase 탭 배지 업데이트 ─────────────────────────────
function updatePhaseBadges() {
  const total = state.questions.length;
  const classified = state.questions.filter(q => q.conceptIds.length > 0).length;
  const starred = state.questions.filter(q => q.starred).length;
  const seedCount = state.seeds.length;
  document.getElementById('badge0').textContent = seedCount > 0 ? `${seedCount}개` : 'Phase 0';
  document.getElementById('badge1').textContent = total > 0 ? `${total}개` : 'Phase 1';
  document.getElementById('badge2').textContent = classified > 0 ? `${classified}/${total}` : 'Phase 2';
  document.getElementById('badge3').textContent = starred > 0 ? `${starred}개 선택` : 'Phase 3';
}

// ── Phase 탭 전환 ─────────────────────────────────────
function switchPhase(phaseNum) {
  document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.classList.toggle('active', parseInt(tab.dataset.phase) === phaseNum);
  });
  document.querySelectorAll('.phase-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel${phaseNum}`);
  });
  if (phaseNum === 0) renderPhase0();
  if (phaseNum === 1) renderPhase1();
  if (phaseNum === 2) renderConceptBoard();
  if (phaseNum === 3) renderPhase3();
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

// ── 개념 컬럼 설정 모달 ───────────────────────────────
function openModal() {
  document.getElementById('modalOverlay').classList.remove('hidden');
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
  const checked = [...document.querySelectorAll('.concept-check-item input:checked')]
    .map(cb => cb.dataset.conceptId);
  state.unitMeta.enabledConcepts = checked.length > 0 ? checked : null;
  renderConceptBoard();
  saveState();
  closeModal();
}

// ── 핵심 개념 체크박스 렌더링 ─────────────────────────
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
  renderConceptBoard();
  updatePhaseBadges();
  // 주제가 비어있으면 헤더 주제란에 포커스
  if (!state.unitMeta.unitTitle) {
    setTimeout(() => document.getElementById('headerTopic')?.focus(), 100);
  }
}

init();
