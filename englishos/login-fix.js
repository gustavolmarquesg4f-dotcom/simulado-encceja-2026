(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  let submitting = false;

  function setError(message) {
    const error = $('accessError');
    if (error) error.textContent = message || '';
  }

  function setButton(loading) {
    const button = $('loginButton');
    if (!button) return;
    button.disabled = loading;
    button.textContent = loading ? 'Validando acesso...' : 'Entrar com a Grace';
  }

  async function refreshGraceStatus() {
    try {
      const status = await window.GraceAI?.check?.();
      const label = $('loginAiStatus');
      if (label && status?.online) label.textContent = 'Grace AI conectada e pronta.';
    } catch {}
  }

  async function submitLogin(event) {
    event?.preventDefault?.();
    event?.stopImmediatePropagation?.();
    if (submitting) return;

    const input = $('accessPassword');
    const password = input?.value || '';
    if (!password) {
      setError('Digite a senha de acesso.');
      input?.focus();
      return;
    }

    submitting = true;
    setError('');
    setButton(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) throw new Error('Senha incorreta. Confira letras maiúsculas, minúsculas e símbolos.');
        if (response.status === 503) throw new Error(data.error || 'A autenticação ainda não está configurada na Vercel.');
        throw new Error(data.error || `Não foi possível entrar. Erro ${response.status}.`);
      }

      sessionStorage.setItem('englishos-access', 'granted');
      $('accessLock')?.classList.add('off');
      if (input) input.value = '';
      await refreshGraceStatus();
    } catch (error) {
      setError(error?.message || 'Não foi possível validar a senha. Atualize a página e tente novamente.');
      input?.focus();
      input?.select?.();
    } finally {
      submitting = false;
      setButton(false);
    }
  }

  document.addEventListener('click', event => {
    if (event.target.closest?.('#loginButton')) submitLogin(event);
  }, true);

  document.addEventListener('keydown', event => {
    if (event.target?.id === 'accessPassword' && event.key === 'Enter') submitLogin(event);
  }, true);

  function prepareInput() {
    const input = $('accessPassword');
    if (!input) return;
    input.disabled = false;
    input.readOnly = false;
    input.style.pointerEvents = 'auto';
    input.setAttribute('autocomplete', 'current-password');
    setTimeout(() => input.focus(), 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepareInput);
  else prepareInput();
})();
