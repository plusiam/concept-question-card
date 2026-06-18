// 모둠 실시간 질문 만들기 — qar-board RPC 래퍼 (think_gears 컨벤션: SECURITY DEFINER RPC + 폴링)
// 학생은 로그인 없이 접속코드로 RPC만 호출. 교사는 학급 개설 시에만 로그인.

const CQC_RT = (() => {
  let client = null;

  // 연결 정보·라이브러리가 있는지만 확인 (모드 on/off 판단은 script의 rtModeOn이 담당)
  function isConfigured() {
    return !!CONFIG.SUPABASE_URL
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

  // 승인 상태 조회 — qar-question-card와 공용(my_teacher_status). null=비로그인.
  async function teacherStatus() {
    const { data, error } = await getClient().rpc('my_teacher_status');
    if (error || !data) return { loggedIn: false };
    return { loggedIn: true, status: data.status, role: data.role,
             email: data.email, display_name: data.display_name, school: data.school };
  }

  // ── 관리자 (admin/superadmin) — qar 공용 RPC 재사용 ──
  async function listTeachers() {
    const { data, error } = await getClient().rpc('admin_list_teachers');
    if (error) return { ok: false, error: error.message };
    return { ok: true, teachers: data || [] };
  }

  async function setTeacherStatus(userId, status) {
    const { error } = await getClient().rpc('set_teacher_status', {
      p_user_id: userId, p_status: status
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  // 역할 변경 (teacher <-> admin) — superadmin
  async function setTeacherRole(userId, role) {
    const { error } = await getClient().rpc('set_teacher_role', {
      p_user_id: userId, p_role: role
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  // 전체 학급 목록 — admin/superadmin
  async function adminListClasses() {
    const { data, error } = await getClient().rpc('cqc_admin_list_classes');
    if (error) return { ok: false, error: error.message };
    return { ok: true, classes: data || [] };
  }

  // 학급 삭제 — superadmin
  async function adminDeleteClass(classCode) {
    const { error } = await getClient().rpc('cqc_admin_delete_class', { p_class_code: classCode });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  // ── 교사: 영구 학반 + 오늘 수업 (Phase 3) ──
  async function classCreate(label) {
    const { data, error } = await getClient().rpc('cqc_create_class', { p_class_label: label });
    if (error) return { ok: false, error: error.message };
    return { ok: true, classCode: data.class_code };
  }
  async function classList() {
    const { data, error } = await getClient().rpc('cqc_list_classes');
    if (error) return { ok: false, error: error.message };
    return { ok: true, classes: data || [] };
  }
  async function classRename(classCode, newLabel) {
    const { error } = await getClient().rpc('cqc_rename_class', { p_class_code: classCode, p_new_label: newLabel });
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  async function classDelete(classCode) {
    const { error } = await getClient().rpc('cqc_delete_class', { p_class_code: classCode });
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  async function sessionOpen(classCode, title, count, topic) {
    const { data, error } = await getClient().rpc('cqc_open_session', {
      p_class_code: classCode, p_session_title: title, p_count: count, p_topic: topic
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, sessionCode: data.session_code, count: data.count };
  }
  async function sessionList(classCode) {
    const { data, error } = await getClient().rpc('cqc_list_class_sessions', { p_class_code: classCode });
    if (error) return { ok: false, error: error.message };
    return { ok: true, sessions: data || [] };
  }
  async function sessionRename(sessionCode, title, topic) {
    const { error } = await getClient().rpc('cqc_rename_session', { p_session_code: sessionCode, p_title: title, p_topic: topic });
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  async function sessionDelete(sessionCode) {
    const { error } = await getClient().rpc('cqc_delete_session', { p_session_code: sessionCode });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  // ── 교사: 수업 결과물(모둠별 질문) — JSON 내보내기용 (session_code 기준) ──
  async function classResults(sessionCode) {
    const { data, error } = await getClient().rpc('cqc_class_results', { p_class_code: sessionCode });
    if (error) return { ok: false, error: error.message };
    return { ok: true, result: data };
  }

  // ── 학생 로비: 학반 코드(C-XXXX) → 학반 확인 + 오늘 수업 목록 ──
  async function getClass(classCode) {
    const { data, error } = await getClient().rpc('cqc_get_class', { p_class_code: classCode });
    if (error || !data || !data.ok) return { ok: false };
    return { ok: true, classLabel: data.class_label };
  }
  async function publicSessions(classCode) {
    const { data, error } = await getClient().rpc('cqc_public_sessions', { p_class_code: classCode });
    if (error) return { ok: false, error: error.message };
    return { ok: true, sessions: data || [] };
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
    listTeachers, setTeacherStatus, setTeacherRole, adminListClasses, adminDeleteClass,
    classCreate, classList, classRename, classDelete,
    sessionOpen, sessionList, sessionRename, sessionDelete,
    getClass, publicSessions, classResults,
    classGroups, board,
    addQuestion, editQuestion, deleteQuestion
  };
})();
