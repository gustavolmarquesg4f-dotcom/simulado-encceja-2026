(() => {
  'use strict';

  const COURSE_KEY = 'englishos-grace-v7';
  const PREF_KEY = 'englishos-translation-preference';
  const $ = id => document.getElementById(id);

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[char]));
  }

  function readCourseState() {
    try { return JSON.parse(localStorage.getItem(COURSE_KEY) || '{}'); }
    catch { return {}; }
  }

  function currentDay() {
    const day = Number(readCourseState().day || 1);
    return Math.max(1, Math.min(180, day));
  }

  function preference() {
    return localStorage.getItem(PREF_KEY) || 'auto';
  }

  function effectiveMode() {
    const selected = preference();
    if (selected !== 'auto') return selected;
    const day = currentDay();
    if (day <= 30) return 'full';
    if (day <= 60) return 'guided';
    return 'off';
  }

  function modeLabel(mode = effectiveMode()) {
    return ({
      full: 'Tradução completa',
      guided: 'Tradução sob demanda',
      off: 'Imersão em inglês'
    })[mode] || 'Automático';
  }

  function phaseDescription() {
    const day = currentDay();
    const mode = effectiveMode();
    if (preference() !== 'auto') return `${modeLabel(mode)} escolhida manualmente.`;
    if (day <= 30) return `Dia ${day}: traduções e modelos em português ficam mais visíveis.`;
    if (day <= 60) return `Dia ${day}: a tradução aparece quando você pedir. Faltam ${61 - day} dia(s) para a imersão padrão.`;
    return `Dia ${day}: imersão padrão ativa. O tradutor continua disponível quando necessário.`;
  }

  function injectStyles() {
    if ($('translationModeStyles')) return;
    const style = document.createElement('style');
    style.id = 'translationModeStyles';
    style.textContent = `
      .translation-nav{border:0;background:transparent;color:var(--muted);display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;text-align:left;width:100%;font:inherit;cursor:pointer}
      .translation-nav span{width:24px;text-align:center}.translation-nav:hover,.translation-nav.active{background:var(--brand-soft);color:var(--text)}
      .translation-banner{display:flex;align-items:center;justify-content:space-between;gap:15px;margin:0 0 16px;padding:15px 17px;border:1px solid color-mix(in srgb,var(--brand) 35%,var(--line));border-radius:18px;background:linear-gradient(135deg,color-mix(in srgb,var(--brand-soft) 72%,var(--panel)),var(--panel));box-shadow:var(--shadow)}
      .translation-banner b{display:block;margin-bottom:4px}.translation-banner small{color:var(--muted);line-height:1.45}.translation-banner button{white-space:nowrap}
      .translator-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.translator-output{min-height:240px;white-space:pre-wrap}.translator-output .translated-main{font-size:1.08rem;line-height:1.65;color:var(--text)}
      .translator-output .translated-note{margin-top:14px;padding:12px;border-radius:12px;background:var(--panel-2);color:var(--muted);line-height:1.55}
      .translator-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}.translation-quick{border:1px solid var(--line);background:var(--panel-2);color:var(--text);border-radius:999px;padding:7px 11px;cursor:pointer}
      .translation-inline-tools{display:flex;gap:7px;align-items:center;margin:8px 0 14px}.translation-inline-button{border:1px solid var(--line);background:var(--panel-2);color:var(--text);border-radius:10px;padding:7px 10px;font-weight:800;cursor:pointer;font-size:.82rem}
      .translation-inline-result{display:none;margin:8px 0 14px;padding:12px 14px;border-left:4px solid var(--brand-2);border-radius:10px;background:var(--panel-2);line-height:1.55;color:var(--text)}.translation-inline-result.show{display:block}
      .message-translate{display:block;margin-top:7px;border:0;background:transparent;color:var(--brand-2);font-weight:850;cursor:pointer;padding:3px 0}.message-translation{display:block;margin-top:7px;padding:9px 11px;border-radius:10px;background:color-mix(in srgb,var(--brand-soft) 75%,var(--panel));color:var(--text);line-height:1.5}
      .translation-setting-status{margin-top:10px;padding:11px;border-radius:11px;background:var(--panel-2);color:var(--muted);line-height:1.5}
      .translation-fab{position:fixed;right:22px;bottom:22px;z-index:900;border:0;border-radius:999px;padding:13px 17px;background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#fff;font-weight:900;box-shadow:0 14px 35px rgba(31,87,132,.28);cursor:pointer}
      @media(max-width:800px){.translator-grid{grid-template-columns:1fr}.translation-banner{align-items:flex-start;flex-direction:column}.translation-fab{right:14px;bottom:14px}.translation-banner button{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function createTranslatorView() {
    if ($('translator')) return;
    const main = document.querySelector('.main-content');
    if (!main) return;
    const section = document.createElement('section');
    section.id = 'translator';
    section.className = 'view';
    section.innerHTML = `
      <div class="section-heading"><div><div class="eyebrow">APOIO BILÍNGUE</div><h2>Tradutor com explicação da Grace</h2><p>Traduza português e inglês sem perder o sentido profissional, técnico ou bíblico.</p></div><span class="status-pill" id="translationPhaseBadge"></span></div>
      <div class="translator-grid">
        <article class="card">
          <label class="field-label" for="translationSource">Texto para traduzir</label>
          <textarea id="translationSource" placeholder="Cole uma frase, e-mail, mensagem, expressão ou trecho da aula..."></textarea>
          <label class="field-label" for="translationTarget">Destino</label>
          <select id="translationTarget"><option value="auto">Detectar automaticamente</option><option value="pt-BR">Traduzir para português</option><option value="en-US">Traduzir para inglês</option></select>
          <div class="translator-actions"><button class="primary" id="runTranslation">Traduzir com a Grace</button><button class="secondary" id="clearTranslation">Limpar</button></div>
          <div class="translator-actions">
            <button class="translation-quick" data-translation-example="I am responsible for coordinating the project team and managing delivery risks.">Exemplo profissional</button>
            <button class="translation-quick" data-translation-example="Preciso atualizar o cliente sobre o prazo, os riscos e os próximos passos.">Português → inglês</button>
            <button class="translation-quick" data-translation-example="The Lord is my strength and my shield; my heart trusts in Him.">Exemplo bíblico</button>
          </div>
        </article>
        <article class="card translator-output" id="translationOutput"><div class="eyebrow">RESULTADO</div><p>Digite um texto e a Grace mostrará a tradução natural, uma versão mais simples e as escolhas mais importantes.</p></article>
      </div>
      <div class="section-heading"><div><div class="eyebrow">COMO FUNCIONA</div><h2>Ajuda que diminui conforme você evolui</h2></div></div>
      <div class="three-column">
        <article class="card"><div class="eyebrow">DIAS 1–30</div><h3>Base bilíngue</h3><p>Tradução automática nas conversas, modelos em português e explicações claras.</p></article>
        <article class="card"><div class="eyebrow">DIAS 31–60</div><h3>Apoio sob demanda</h3><p>Você tenta compreender primeiro e abre a tradução quando realmente precisar.</p></article>
        <article class="card"><div class="eyebrow">DIA 61+</div><h3>Imersão assistida</h3><p>O inglês vira padrão, mas o tradutor permanece disponível para textos difíceis.</p></article>
      </div>`;
    const settings = $('settings');
    main.insertBefore(section, settings || null);
  }

  function createNavButton() {
    if ($('translationNav')) return;
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const button = document.createElement('button');
    button.id = 'translationNav';
    button.className = 'translation-nav';
    button.type = 'button';
    button.innerHTML = '<span>🌐</span><b>Tradutor</b>';
    const settingsButton = nav.querySelector('[data-view="settings"]');
    nav.insertBefore(button, settingsButton || null);
    button.addEventListener('click', openTranslator);
  }

  function openTranslator() {
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === 'translator'));
    document.querySelectorAll('.nav-button').forEach(button => button.classList.remove('active'));
    $('translationNav')?.classList.add('active');
    if ($('todayLabel')) $('todayLabel').textContent = 'APOIO BILÍNGUE';
    if ($('pageTitle')) $('pageTitle').textContent = 'Tradutor da Grace';
    if ($('pageSubtitle')) $('pageSubtitle').textContent = 'Entenda o inglês sem depender para sempre do português.';
    updateLabels();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function createSettingsCard() {
    if ($('translationSettingsCard')) return;
    const grid = document.querySelector('#settings .settings-grid');
    if (!grid) return;
    const card = document.createElement('article');
    card.className = 'card';
    card.id = 'translationSettingsCard';
    card.innerHTML = `
      <h3>Tradução e apoio em português</h3>
      <label class="field-label" for="translationPreference">Nível de ajuda</label>
      <select id="translationPreference">
        <option value="auto">Automático — diminui até o dia 60</option>
        <option value="full">Completo — tradução mais visível</option>
        <option value="guided">Guiado — traduz quando eu pedir</option>
        <option value="off">Imersão — inglês como padrão</option>
      </select>
      <div class="translation-setting-status" id="translationSettingStatus"></div>
      <button class="secondary full" id="openTranslatorFromSettings" type="button">Abrir tradutor</button>`;
    grid.appendChild(card);
    $('translationPreference').value = preference();
    $('translationPreference').addEventListener('change', event => {
      localStorage.setItem(PREF_KEY, event.target.value);
      applyConversationHelp();
      updateLabels();
    });
    $('openTranslatorFromSettings').addEventListener('click', openTranslator);
  }

  function createDashboardBanner() {
    if ($('translationBanner')) return;
    const dashboard = $('dashboard');
    const metrics = dashboard?.querySelector('.metrics-grid');
    if (!dashboard || !metrics) return;
    const banner = document.createElement('div');
    banner.id = 'translationBanner';
    banner.className = 'translation-banner';
    banner.innerHTML = `<div><b id="translationBannerTitle"></b><small id="translationBannerText"></small></div><button class="secondary" id="translationBannerButton" type="button">Abrir tradutor</button>`;
    metrics.insertAdjacentElement('afterend', banner);
    $('translationBannerButton').addEventListener('click', openTranslator);
  }

  function createFab() {
    if ($('translationFab')) return;
    const button = document.createElement('button');
    button.id = 'translationFab';
    button.type = 'button';
    button.className = 'translation-fab';
    button.textContent = '🌐 Traduzir';
    button.title = 'Abrir tradutor da Grace';
    button.addEventListener('click', () => {
      const selected = String(window.getSelection?.() || '').trim();
      openTranslator();
      if (selected) $('translationSource').value = selected;
      $('translationSource')?.focus();
    });
    document.body.appendChild(button);
  }

  function applyConversationHelp() {
    const select = $('conversationHelp');
    if (!select) return;
    const mode = effectiveMode();
    select.value = mode === 'full' ? 'high' : mode === 'guided' ? 'medium' : 'low';
    select.dataset.translationManaged = preference() === 'auto' ? 'true' : 'manual';
  }

  function updateLabels() {
    const mode = effectiveMode();
    const title = `${modeLabel(mode)} ativa`;
    if ($('translationBannerTitle')) $('translationBannerTitle').textContent = title;
    if ($('translationBannerText')) $('translationBannerText').textContent = phaseDescription();
    if ($('translationPhaseBadge')) $('translationPhaseBadge').textContent = `Dia ${currentDay()} • ${modeLabel(mode)}`;
    if ($('translationSettingStatus')) $('translationSettingStatus').textContent = phaseDescription();
    if ($('translationPreference')) $('translationPreference').value = preference();
  }

  function saveReviewWords(words = []) {
    if (!Array.isArray(words) || !words.length) return;
    const state = readCourseState();
    state.reviewWords = state.reviewWords || {};
    const date = new Date().toISOString().slice(0, 10);
    words.slice(0, 5).forEach(word => {
      const key = String(word).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      if (!key) return;
      state.reviewWords[key] = { word, count: (state.reviewWords[key]?.count || 0) + 1, last: date };
    });
    localStorage.setItem(COURSE_KEY, JSON.stringify(state));
  }

  async function translate(text, target = 'auto', context = 'tradutor geral') {
    const clean = String(text || '').trim();
    if (!clean) throw new Error('Digite ou selecione um texto para traduzir.');
    if (!window.GraceAI?.ask) throw new Error('A Grace ainda está carregando.');
    const result = await window.GraceAI.ask('translation', {
      text: clean.slice(0, 8000),
      target,
      context,
      day: currentDay(),
      translation_mode: effectiveMode()
    });
    if (!result) throw new Error('A tradução online não respondeu. Confira se a Grace está conectada.');
    saveReviewWords(result.review_words || []);
    return result;
  }

  function renderTranslationResult(container, result) {
    const translation = result.translation || result.reply || result.improved_answer || 'Tradução não retornada.';
    const simple = result.reply && result.reply !== translation ? result.reply : '';
    const explanation = result.explanation || result.feedback || '';
    const words = Array.isArray(result.review_words) ? result.review_words : [];
    container.innerHTML = `
      <div class="eyebrow">TRADUÇÃO NATURAL</div>
      <div class="translated-main">${escapeHtml(translation)}</div>
      ${simple ? `<div class="translated-note"><b>Versão mais simples:</b><br>${escapeHtml(simple)}</div>` : ''}
      ${explanation ? `<div class="translated-note"><b>Entenda a escolha:</b><br>${escapeHtml(explanation)}</div>` : ''}
      ${words.length ? `<div class="translated-note"><b>Expressões para revisar:</b><br>${words.map(escapeHtml).join(' • ')}</div>` : ''}`;
  }

  function bindTranslator() {
    const button = $('runTranslation');
    if (!button || button.dataset.bound) return;
    button.dataset.bound = 'true';
    button.addEventListener('click', async () => {
      const output = $('translationOutput');
      button.disabled = true;
      button.textContent = 'Grace traduzindo...';
      output.innerHTML = '<div class="eyebrow">PROCESSANDO</div><p>A Grace está preservando sentido, tom e contexto.</p>';
      try {
        const result = await translate($('translationSource').value, $('translationTarget').value, 'central de tradução do EnglishOS');
        renderTranslationResult(output, result);
      } catch (error) {
        output.innerHTML = `<div class="eyebrow">NÃO FOI POSSÍVEL</div><p>${escapeHtml(error.message)}</p>`;
      } finally {
        button.disabled = false;
        button.textContent = 'Traduzir com a Grace';
      }
    });
    $('clearTranslation')?.addEventListener('click', () => {
      $('translationSource').value = '';
      $('translationOutput').innerHTML = '<div class="eyebrow">RESULTADO</div><p>Digite um texto para traduzir.</p>';
      $('translationSource').focus();
    });
    document.querySelectorAll('[data-translation-example]').forEach(example => {
      example.addEventListener('click', () => {
        $('translationSource').value = example.dataset.translationExample;
        $('translationSource').focus();
      });
    });
  }

  function extractReadableText(element) {
    const clone = element.cloneNode(true);
    clone.querySelectorAll('button,.translation-inline-tools,.translation-inline-result,.translation,.correction').forEach(node => node.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function ensureInlineTranslator(targetId, contextLabel) {
    const target = $(targetId);
    if (!target || document.querySelector(`[data-translation-toolbar="${targetId}"]`)) return;
    const tools = document.createElement('div');
    tools.className = 'translation-inline-tools';
    tools.dataset.translationToolbar = targetId;
    tools.innerHTML = `<button class="translation-inline-button" type="button">🌐 Traduzir / explicar</button><div class="translation-inline-result"></div>`;
    target.insertAdjacentElement('afterend', tools);
    const button = tools.querySelector('button');
    const resultBox = tools.querySelector('.translation-inline-result');
    button.addEventListener('click', async () => {
      const text = extractReadableText(target);
      if (!text) return;
      button.disabled = true;
      button.textContent = 'Traduzindo...';
      resultBox.classList.add('show');
      resultBox.textContent = 'A Grace está preparando a explicação em português...';
      try {
        const result = await translate(text, 'pt-BR', contextLabel);
        resultBox.innerHTML = `<b>${escapeHtml(result.translation || result.reply || '')}</b>${result.explanation ? `<br><small>${escapeHtml(result.explanation)}</small>` : ''}`;
      } catch (error) {
        resultBox.textContent = error.message;
      } finally {
        button.disabled = false;
        button.textContent = '🌐 Traduzir / explicar';
      }
    });
  }

  function decorateConversationMessages() {
    const chat = $('conversationChat');
    if (!chat) return;
    chat.querySelectorAll('.message.grace:not([data-translation-ready])').forEach(message => {
      message.dataset.translationReady = 'true';
      if (message.querySelector('.translation')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'message-translate';
      button.textContent = '🌐 Ver tradução';
      button.addEventListener('click', async () => {
        const existing = message.querySelector('.message-translation');
        if (existing) { existing.remove(); button.textContent = '🌐 Ver tradução'; return; }
        const text = extractReadableText(message).replace('🌐 Ver tradução', '').trim();
        button.disabled = true;
        button.textContent = 'Traduzindo...';
        try {
          const result = await translate(text, 'pt-BR', 'mensagem da conversa com a Grace');
          const box = document.createElement('span');
          box.className = 'message-translation';
          box.textContent = result.translation || result.reply || '';
          message.appendChild(box);
          button.textContent = 'Ocultar tradução';
        } catch (error) {
          button.textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
      message.appendChild(button);
    });
  }

  function bindAppNavigationReset() {
    document.addEventListener('click', event => {
      if (event.target.closest('.nav-button')) $('translationNav')?.classList.remove('active');
    });
  }

  function enhanceLearningSurfaces() {
    ensureInlineTranslator('teacherContent', 'explicação da professora');
    ensureInlineTranslator('grammarExample', 'exemplo de gramática');
    ensureInlineTranslator('transcript', 'transcrição da aula');
    ensureInlineTranslator('pronunciationTarget', 'frase de pronúncia');
    ensureInlineTranslator('assessmentPrompt', 'enunciado da avaliação');
    ensureInlineTranslator('weeklyRecordingPrompt', 'missão de gravação semanal');
    decorateConversationMessages();
  }

  async function install() {
    injectStyles();
    createTranslatorView();
    createNavButton();
    createSettingsCard();
    createDashboardBanner();
    createFab();
    bindTranslator();
    bindAppNavigationReset();
    applyConversationHelp();
    updateLabels();
    enhanceLearningSurfaces();

    const observer = new MutationObserver(() => {
      createTranslatorView();
      createNavButton();
      createSettingsCard();
      createDashboardBanner();
      bindTranslator();
      enhanceLearningSurfaces();
      updateLabels();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(() => {
      applyConversationHelp();
      updateLabels();
      enhanceLearningSurfaces();
    }, 5000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
