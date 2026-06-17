// 모둠 실시간 질문 만들기 — qar-board RPC 래퍼 (think_gears 컨벤션: SECURITY DEFINER RPC + 폴링)
// 학생은 로그인 없이 접속코드로 RPC만 호출. 교사는 학급 개설 시에만 로그인.

const CQC_RT = (() => {
  let client = null;

  function isConfigured() {
    return CONFIG.BACKEND_MODE === 'realtime'
      && !!CONFIG.SUPABASE_URL
      && !!CONFIG.SUPABASE_ANON_KEY
      && typeof supabase !== 'undefined';
  }

  function getClient() {
    if (!client) {
      client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
    }
    return client;
  }

  // ── 교사 인증 (학급 개설 시에만) ──
  async function getTeacher() {
    if (!isConfigured()) return null;
    const { data } = await getClient().auth.getSession();
    return data?.session?.user || null;
  }

  // Google 로그인 — 현재 페이지로 돌아오게 리다이렉트
  async function teacherLoginGoogle() {
    const { error } = await getClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href.split('#')[0] }
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true }; // 페이지가 구글로 이동했다가 돌아옴
  }

  async function teacherLogout() {
    await getClient().auth.signOut();
  }

  // 승인 상태 조회 (approved / pending)
  async function teacherStatus() {
    const { data, error } = await getClient().rpc('cqc_teacher_status');
    if (error) return { loggedIn: false };
    return data;
  }

  // ── 관리자 (admin/superadmin) ──
  async function listTeachers() {
    const { data, error } = await getClient().rpc('cqc_list_teachers');
    if (error) return { ok: false, error: error.message };
    return { ok: true, teachers: data || [] };
  }

  async function setTeacherStatus(userId, status) {
    const { error } = await getClient().rpc('cqc_set_teacher_status', {
      p_user_id: userId, p_status: status
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  // ── 교사: 내가 만든 학급 목록 ──
  async function myClasses() {
    const { data, error } = await getClient().rpc('cqc_my_classes');
    if (error) return { ok: false, error: error.message };
    return { ok: true, classes: data || [] };
  }

  // ── 교사: 학급(모둠 묶음) 개설 ──
  async function createClass(count, topic) {
    const { data, error } = await getClient().rpc('cqc_create_class', {
      p_count: count, p_topic: topic || ''
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, classCode: data.class_code, count: data.count };
  }

  // ── 학생: 학급코드 → 모둠 목록 ──
  async function classGroups(classCode) {
    const { data, error } = await getClient().rpc('cqc_class', { p_code: classCode });
    if (error) return { ok: false, error: error.message };
    return { ok: true, groups: data || [] };
  }

  // ── 보드 조회 (폴링) ──
  async function board(accessCode) {
    const { data, error } = await getClient().rpc('cqc_board', { p_code: accessCode });
    if (error) return { ok: false, error: error.message, code: error.code };
    return { ok: true, session: data.session, cards: data.cards || [] };
  }

  // ── 질문 CRUD (접속코드 + 자리번호) ──
  async function addQuestion(accessCode, seat, text) {
    const { data, error } = await getClient().rpc('cqc_add_question', {
      p_code: accessCode, p_author_seat: seat, p_text: text
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data };
  }

  async function editQuestion(accessCode, id, seat, text) {
    const { error } = await getClient().rpc('cqc_edit_question', {
      p_code: accessCode, p_id: id, p_author_seat: seat, p_text: text
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  async function deleteQuestion(accessCode, id, seat) {
    const { error } = await getClient().rpc('cqc_delete_question', {
      p_code: accessCode, p_id: id, p_author_seat: seat
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  return {
    isConfigured,
    getTeacher, teacherLoginGoogle, teacherLogout, teacherStatus,
    listTeachers, setTeacherStatus,
    myClasses, createClass, classGroups, board,
    addQuestion, editQuestion, deleteQuestion
  };
})();
