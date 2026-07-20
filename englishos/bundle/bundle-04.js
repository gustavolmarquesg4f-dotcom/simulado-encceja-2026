    meeting: { role: 'Facilitadora de reunião', opening: 'Good morning, Gustavo. Can you give me a short project update?', translation: 'Bom dia, Gustavo. Você pode dar uma atualização curta do projeto?' },
    interview: { role: 'Recrutadora internacional', opening: 'Welcome, Gustavo. Could you tell me about yourself?', translation: 'Bem-vindo, Gustavo. Você pode falar sobre você?' },
    client: { role: 'Cliente internacional', opening: 'I am concerned about the delivery date. Could you explain the situation?', translation: 'Estou preocupado com a data de entrega. Você pode explicar a situação?' },
    technology: { role: 'Arquiteta de soluções', opening: 'Please explain the architecture and its main business benefit.', translation: 'Explique a arquitetura e o principal benefício de negócio.' },
    biblical: { role: 'Parceira de estudo bíblico', opening: 'What Bible passage has encouraged you recently?', translation: 'Qual passagem bíblica encorajou você recentemente?' }
  };

  window.GraceCourse = { phases, lessons, diagnosticQuestions, assessmentTemplates, sentenceChallenges, listeningChallenges, conversationScenarios };
})();


/* ===== AI CLIENT ===== */
(() => {
  const base = (window.GRACE_API_BASE || localStorage.getItem('grace-api-base') || '').replace(/\/$/, '');
  const endpoint = path => `${base}${path}`;
  let online = false;
  let configured = false;
  let lastError = '';

  async function request(path, options = {}, timeoutMs = 25000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(endpoint(path), {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
        signal: controller.signal
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data.error || `Erro ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  async function check() {
    try {
      const data = await request('/api/health', { method: 'GET', headers: {} }, 6000);
      online = Boolean(data.ok && data.aiConfigured);
      configured = Boolean(data.aiConfigured);
      lastError = online ? '' : 'Servidor disponível, mas a chave da OpenAI ainda não foi configurada.';
      return { online, configured, detail: data.model ? `Modelo: ${data.model}` : lastError };
    } catch (error) {
      online = false;
      configured = false;
      lastError = error.name === 'AbortError' ? 'Tempo de conexão esgotado.' : 'Modo local ativo. O servidor da Grace não está disponível neste endereço.';
      return { online, configured, detail: lastError };
    }
  }

  async function authenticate(password) {
    try {
      const data = await request('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ password })
      }, 10000);
      await check();
      return { ok: Boolean(data.ok), server: true };
    } catch (error) {
      if (error.status === 401) return { ok: false, server: true, error: 'Senha incorreta no servidor.' };
      return { ok: true, server: false, warning: 'Acesso local liberado; IA online ainda não ativada.' };
    }
  }

  async function ask(mode, payload) {
    if (!online) {
      const status = await check();
      if (!status.online) return null;
    }
    try {
      const data = await request('/api/grace', {
        method: 'POST',
        body: JSON.stringify({ mode, ...payload })
      }, 45000);
      return data;
    } catch (error) {
      if (error.status === 401) {
        online = false;
        lastError = 'Sua sessão segura expirou. Entre novamente para usar a Grace AI.';
      } else {
        lastError = error.message || 'A Grace AI não respondeu.';
      }
      return null;
    }
  }

  function getStatus() { return { online, configured, lastError, base }; }

  window.GraceAI = { check, authenticate, ask, getStatus };
})();


/* ===== APP ===== */
(() => {
  'use strict';
  const { phases, lessons, diagnosticQuestions, assessmentTemplates, sentenceChallenges, listeningChallenges, conversationScenarios } = window.GraceCourse;
  const ACCESS_HASH = '2717058ddfad458136c89f1880d2255d16a6a8962f1c26cfa0f9eb3c739142e8';
  const STORAGE_KEY = 'englishos-grace-v7';
  const $ = id => document.getElementById(id);
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const shuffle = items => [...items].sort(() => Math.random() - .5);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const normalize = text => String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();

  const defaultState = {
    version: 7, day: 1, xp: 0, streak: 0, words: 0, completed: [],
    skills: { listening: 0, speaking: 0, vocabulary: 0, writing: 0 },
    activity: {}, lastStudy: null, studyMinutes: 0, conversations: 0,
    diagnostic: { done: false, score: 0, level: 'Inicial', answers: [], writing: '', speaking: '' },
    assessments: {}, errors: {}, reviewWords: {}, practiceSessions: [], pronunciationScores: [],
    gameScore: 0, gameScoreDate: null, conversationHistory: {}, aiReport: '',
    theme: 'comfort', fontScale: 1.05, voiceRate: .82, dailyMinutes: 45, teacherStyle: 'firm',
    dailySteps: { date: null, teacher: false, lesson: false, pronunciation: false, game: false, conversation: false, review: false }
  };

  let state = loadState();
  let teacherStep = 0, teacherQuestionPassed = false, teacherOwnPassed = false;
  let diagnosticIndex = 0, diagnosticAnswers = [], diagnosticTranscript = '';
  let lastReply = '', activeRecognition = null, pronunciationIndex = 0;
  let selectedEnglish = null, matchRound = [], sentenceRound = null, sentenceSelected = [], listeningRound = null;
  let speedTimerId = null, speedSeconds = 20, speedPrompt = '';
  let assessmentMilestone = null, mediaRecorder = null, mediaChunks = [], currentRecordingUrl = '';
  let currentMissionPassed = false;

  function localDateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function currentWeekStart() {
    const d = new Date(); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); d.setHours(0, 0, 0, 0); return d;
  }
  function getLesson(day = state.day) { return lessons[clamp(day, 1, 180) - 1] || lessons[0]; }
  function getPhase(day = state.day) { return phases[Math.min(5, Math.floor((day - 1) / 30))]; }
  function ensureDailyState() {
    const today = localDateKey();
    if (state.dailySteps.date !== today) state.dailySteps = { date: today, teacher: false, lesson: false, pronunciation: false, game: false, conversation: false, review: false };
    if (state.gameScoreDate !== today) { state.gameScoreDate = today; state.gameScore = 0; }
  }
  function loadState() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch {}
    if (!saved) {
      try {
        const old = JSON.parse(localStorage.getItem('englishos-grace-v6') || localStorage.getItem('englishos') || 'null');
