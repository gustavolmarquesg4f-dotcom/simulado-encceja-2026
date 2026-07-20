(() => {
  'use strict';

  let provider = 'local';
  let model = '';
  let ready = false;
  let busyCount = 0;

  const $ = id => document.getElementById(id);
  const providerName = value => value === 'groq' ? 'Groq' : value === 'openai' ? 'OpenAI' : 'Local';
  const modelName = value => String(value || '').replace('openai/', '').replace(/-/g, ' ');

  function apiBase() {
    try {
      return String(window.GraceAI?.getStatus?.().base || '').replace(/\/$/, '');
    } catch {
      return '';
    }
  }

  async function readHealth() {
    try {
      const response = await fetch(`${apiBase()}/api/health`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) return null;
      const data = await response.json();
      provider = data.provider || (data.aiConfigured ? 'online' : 'local');
      model = data.model || '';
      ready = Boolean(data.aiConfigured && data.authConfigured);
      return data;
    } catch {
      provider = 'local';
      model = '';
      ready = false;
      return null;
    }
  }

  function injectStyles() {
    if ($('groqEnhancerStyles')) return;
    const style = document.createElement('style');
    style.id = 'groqEnhancerStyles';
    style.textContent = `
      .grace-provider-chip{display:flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:9px 12px;font-weight:900;color:var(--text);box-shadow:0 6px 18px rgba(32,82,115,.08)}
      .grace-provider-chip .provider-light{width:9px;height:9px;border-radius:50%;background:#94a3b8;box-shadow:0 0 0 4px rgba(148,163,184,.15)}
      .grace-provider-chip.online .provider-light{background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.15)}
      .grace-provider-chip.busy .provider-light{background:#f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,.16);animation:gracePulse 1s infinite alternate}
      .grace-provider-chip small{display:block;font-weight:700;color:var(--muted);font-size:.72rem}
      .grace-provider-chip b{display:block;font-size:.82rem}
      .grace-ai-note{margin-top:12px;padding:12px 14px;border-radius:14px;border:1px solid color-mix(in srgb,var(--primary) 34%,var(--line));background:color-mix(in srgb,var(--primary) 7%,var(--panel));font-size:.88rem;color:var(--muted);line-height:1.5}
      .grace-ai-note b{color:var(--text)}
      @keyframes gracePulse{from{transform:scale(.88)}to{transform:scale(1.15)}}
      @media(max-width:980px){.grace-provider-chip{display:none}}
    `;
    document.head.appendChild(style);
  }

  function ensureProviderChip() {
    const topActions = document.querySelector('.top-actions');
    if (!topActions || $('graceProviderChip')) return;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.id = 'graceProviderChip';
    chip.className = 'grace-provider-chip';
    chip.innerHTML = '<span class="provider-light"></span><span><b>Grace AI</b><small>verificando...</small></span>';
    chip.title = 'Abrir conversação com a Grace';
    chip.addEventListener('click', () => document.querySelector('[data-view="conversation"]')?.click());
    topActions.insertBefore(chip, topActions.querySelector('.profile-chip'));
  }

  function ensureConversationNote() {
    const side = document.querySelector('.conversation-side');
    if (!side || $('groqConversationNote')) return;
    const note = document.createElement('div');
    note.id = 'groqConversationNote';
    note.className = 'grace-ai-note';
    note.innerHTML = '<b>Grace inteligente ativa.</b><br>Ela usa sua resposta, o cenário, seu nível e seus erros anteriores para continuar a conversa.';
    side.appendChild(note);
  }

  function decorate() {
    injectStyles();
    ensureProviderChip();
    ensureConversationNote();

    const online = ready && provider !== 'local';
    const label = online ? `Grace AI • ${providerName(provider)}` : 'Grace em modo local';
    const detail = online
      ? `${modelName(model)} conectado. Conversação, correção e avaliações adaptativas ativas.`
      : 'O curso continua funcionando; a IA online está indisponível.';

    const aiStatus = $('aiStatus');
    const aiStatusDetail = $('aiStatusDetail');
    const loginAiStatus = $('loginAiStatus');
    const conversationStatus = $('conversationStatus');
    const chip = $('graceProviderChip');

    if (aiStatus) aiStatus.textContent = label;
    if (aiStatusDetail) aiStatusDetail.textContent = detail;
    if (loginAiStatus) loginAiStatus.textContent = online ? `${label} pronta para ensinar.` : detail;

    ['aiDot', 'loginAiDot'].forEach(id => {
      const dot = $(id);
      if (!dot) return;
      dot.classList.toggle('online', online);
      dot.classList.toggle('offline', !online);
    });

    if (conversationStatus && busyCount === 0 && !/pensando|ouvindo/i.test(conversationStatus.textContent)) {
      conversationStatus.textContent = online ? `Grace AI • ${providerName(provider)}` : 'Modo local';
    }

    if (chip) {
      chip.classList.toggle('online', online);
      chip.classList.toggle('busy', busyCount > 0);
      chip.querySelector('b').textContent = busyCount > 0 ? 'Grace pensando...' : label;
      chip.querySelector('small').textContent = online ? modelName(model) : 'modo de reserva';
    }

    const brandSmall = document.querySelector('.brand small');
    if (brandSmall) brandSmall.textContent = online ? `Grace AI • ${providerName(provider)}` : 'Grace AI';
  }

  async function install() {
    let attempts = 0;
    while (!window.GraceAI && attempts < 120) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (!window.GraceAI) return;

    const originalCheck = window.GraceAI.check.bind(window.GraceAI);
    const originalAsk = window.GraceAI.ask.bind(window.GraceAI);
    const originalAuthenticate = window.GraceAI.authenticate.bind(window.GraceAI);

    window.GraceAI.check = async (...args) => {
      const baseStatus = await originalCheck(...args);
      const health = await readHealth();
      const online = Boolean(baseStatus.online && health?.aiConfigured);
      ready = Boolean(online && health?.authConfigured);
      decorate();
      return {
        ...baseStatus,
        online,
        configured: Boolean(health?.aiConfigured),
        provider,
        model,
        detail: online
          ? `${providerName(provider)} • ${modelName(model)}`
          : 'Servidor acessível, mas a inteligência online não está completamente configurada.'
      };
    };

    window.GraceAI.authenticate = async (...args) => {
      const result = await originalAuthenticate(...args);
      await readHealth();
      decorate();
      return result;
    };

    window.GraceAI.ask = async (mode, payload) => {
      busyCount++;
      decorate();
      window.dispatchEvent(new CustomEvent('grace-ai-start', { detail: { mode } }));
      try {
        const result = await originalAsk(mode, payload);
        if (result?._meta) {
          provider = result._meta.provider || provider;
          model = result._meta.model || model;
          ready = true;
        }
        window.dispatchEvent(new CustomEvent('grace-ai-finish', { detail: { mode, success: Boolean(result) } }));
        return result;
      } finally {
        busyCount = Math.max(0, busyCount - 1);
        decorate();
      }
    };

    await readHealth();
    decorate();

    const observer = new MutationObserver(() => decorate());
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(async () => {
      await readHealth();
      decorate();
    }, 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
