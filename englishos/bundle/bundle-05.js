        if (old) saved = { ...defaultState, day: old.day || 1, xp: old.xp || 0, streak: old.streak || 0, words: old.words || 0, completed: old.completed || old.done || [] };
      } catch {}
    }
    const merged = { ...defaultState, ...(saved || {}) };
    merged.skills = { ...defaultState.skills, ...(saved?.skills || {}) };
    merged.diagnostic = { ...defaultState.diagnostic, ...(saved?.diagnostic || {}) };
    merged.dailySteps = { ...defaultState.dailySteps, ...(saved?.dailySteps || {}) };
    merged.activity = saved?.activity || {};
    merged.assessments = saved?.assessments || {};
    merged.errors = saved?.errors || {};
    merged.reviewWords = saved?.reviewWords || {};
    merged.practiceSessions = saved?.practiceSessions || [];
    merged.pronunciationScores = saved?.pronunciationScores || [];
    merged.conversationHistory = saved?.conversationHistory || {};
    return merged;
  }
  function saveState(render = true) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (render) renderAll();
  }
  function recordActivity(minutes = 5) {
    const key = localDateKey();
    state.activity[key] = (state.activity[key] || 0) + minutes;
    state.studyMinutes += minutes;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (state.lastStudy !== key) {
      state.streak = state.lastStudy === localDateKey(yesterday) ? state.streak + 1 : 1;
      state.lastStudy = key;
    }
  }
  function addXp(points, message, minutes = 2) {
    state.xp += points; recordActivity(minutes); saveState(); if (message) toast(`${message} +${points} XP`);
  }
  function addError(key, example, correction = '') {
    const id = normalize(key).slice(0, 80) || 'general';
    const previous = state.errors[id] || { label: key, count: 0, example: '', correction: '', last: '' };
    state.errors[id] = { ...previous, label: key, count: previous.count + 1, example: example || previous.example, correction: correction || previous.correction, last: localDateKey() };
  }
  function addReviewWord(word) {
    if (!word) return;
    const key = normalize(word);
    state.reviewWords[key] = { word, count: (state.reviewWords[key]?.count || 0) + 1, last: localDateKey() };
  }
  function levelFromScore(score) { return score >= 85 ? 'B2' : score >= 70 ? 'B1' : score >= 50 ? 'A2' : 'A1'; }
  function appLevel() { return state.diagnostic.done ? state.diagnostic.level : 'Inicial'; }
  function xpLevel() { return Math.max(1, Math.floor(state.xp / 500) + 1); }

  async function sha256(value) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  async function unlock() {
    const password = $('accessPassword').value;
    if (!password) return setLoginError('Digite a senha.');
    $('loginButton').disabled = true; $('loginButton').textContent = 'Entrando...';
    try {
      if (await sha256(password) !== ACCESS_HASH) return setLoginError('Senha incorreta.');
      const result = await GraceAI.authenticate(password);
      if (!result.ok) return setLoginError(result.error || 'Senha incorreta.');
      sessionStorage.setItem('englishos-access', 'granted');
      $('accessLock').classList.add('off');
      updateAiStatus();
      if (result.warning) toast(result.warning);
    } catch { setLoginError('Não foi possível validar a senha.'); }
    finally { $('loginButton').disabled = false; $('loginButton').textContent = 'Entrar com a Grace'; }
  }
  function setLoginError(message) { $('accessError').textContent = message; $('accessPassword').value = ''; $('accessPassword').focus(); }
  function togglePassword() { const input = $('accessPassword'); input.type = input.type === 'password' ? 'text' : 'password'; input.focus(); }
  async function updateAiStatus() {
    const status = await GraceAI.check();
    ['aiDot', 'loginAiDot'].forEach(id => { $(id)?.classList.toggle('online', status.online); $(id)?.classList.toggle('offline', !status.online); });
    if ($('aiStatus')) $('aiStatus').textContent = status.online ? 'Grace AI conectada' : 'Grace em modo local';
    if ($('aiStatusDetail')) $('aiStatusDetail').textContent = status.online ? 'Conversação e correção generativas ativas.' : status.detail;
    if ($('loginAiStatus')) $('loginAiStatus').textContent = status.online ? 'Grace AI conectada e pronta.' : 'Modo local disponível. A IA online requer o servidor seguro.';
    return status;
  }

  function go(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === viewId));
    document.querySelectorAll('.nav-button').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
    const titles = {
      dashboard: ['JORNADA DE 180 DIAS', 'Olá, Gustavo 👋', 'A Grace preparou uma rotina objetiva para você aprender e usar inglês.'], diagnostic: ['PONTO DE PARTIDA', 'Diagnóstico inicial', 'Descubra sua base antes de avançar.'], teacher: ['AULA GUIADA', 'Grace ensina', 'Entenda, veja, tente e corrija.'], lesson: ['PRÁTICA DO DIA', 'Aula completa', 'Vocabulário, escuta, escrita e aplicação.'], pronunciation: ['FALA E CLAREZA', 'Pronúncia', 'Repita, compare e melhore.'], conversation: ['PRÁTICA LIVRE', 'Conversação com Grace', 'Fale sem medo e receba correção.'], games: ['REFORÇO ATIVO', 'Jogos', 'Memorize usando desafios curtos.'], assessment: ['EVIDÊNCIA DE EVOLUÇÃO', 'Avaliações mensais', 'Meça compreensão, escrita e fala.'], practice: ['MUNDO REAL', 'Prática humana e gravação', 'Prepare-se para pessoas, interrupções e pressão.'], reports: ['ACOMPANHAMENTO', 'Relatórios', 'Veja habilidades, erros e próximos passos.'], roadmap: ['PLANO DE SEIS MESES', 'Jornada de 180 dias', 'Conteúdo progressivo do A1 ao B2 funcional.'], settings: ['PREFERÊNCIAS', 'Ajustes', 'Adapte visão, voz, ritmo e dados.']
    };
    const [label, title, subtitle] = titles[viewId] || titles.dashboard;
    $('todayLabel').textContent = label; $('pageTitle').textContent = title; $('pageSubtitle').textContent = subtitle;
    if (viewId === 'conversation' && !$('conversationChat').children.length) resetConversation();
    if (viewId === 'reports') renderReports();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderAll() {
    ensureDailyState(); applySettings(); renderDashboard(); renderTeacher(); renderLesson(); renderPronunciation(); renderGames(); renderAssessments(); renderPractice(); renderRoadmap(); renderReports(); renderSettings();
  }
  function applySettings() {
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.style.setProperty('--font-scale', state.fontScale);
    document.querySelectorAll('.theme-card').forEach(button => button.classList.toggle('active', button.dataset.themeChoice === state.theme));
  }
  function renderDashboard() {
    const lesson = getLesson(), phase = getPhase();
    $('metricDay').textContent = `${state.day}/180`; $('metricPhase').textContent = phase.name;
    $('metricStreak').textContent = `${state.streak} 🔥`; $('metricWords').textContent = state.words; $('metricXp').textContent = `${state.xp} XP`; $('metricLevel').textContent = `Nível ${xpLevel()}`; $('profileLevel').textContent = `${appLevel()} • Nível ${xpLevel()}`;
    $('heroPhase').textContent = `FASE ${lesson.phaseIndex + 1} • ${lesson.phase.toUpperCase()}`;
    if (!state.diagnostic.done) {
