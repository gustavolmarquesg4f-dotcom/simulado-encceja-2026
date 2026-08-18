import { verifySession } from '../lib/session.js';

function messageFor(status) {
  if (status === 401) return { code: 'GROQ_KEY_INVALID', message: 'A chave da Groq está inválida ou foi revogada.' };
  if (status === 403) return { code: 'GROQ_MODEL_FORBIDDEN', message: 'O projeto da Groq não tem permissão para usar o modelo configurado.' };
  if (status === 429) return { code: 'GROQ_RATE_LIMIT', message: 'O limite de uso da Groq foi atingido.' };
  if (status === 404) return { code: 'GROQ_MODEL_NOT_FOUND', message: 'O modelo configurado não foi encontrado.' };
  if (status >= 500) return { code: 'GROQ_UNAVAILABLE', message: 'A Groq está temporariamente indisponível.' };
  return { code: `GROQ_${status}`, message: 'A Groq recusou o teste de conexão.' };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Método não permitido.' });
  if (!verifySession(req, process.env.SESSION_SECRET)) return res.status(401).json({ ok: false, code: 'SESSION_EXPIRED', error: 'Sessão expirada. Entre novamente.' });
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ ok: false, code: 'GROQ_NOT_CONFIGURED', error: 'GROQ_API_KEY não está disponível neste deployment.' });

  const preferred = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const candidates = [...new Set([preferred, 'openai/gpt-oss-20b'])];
  const started = Date.now();

  for (const model of candidates) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Return only this JSON object: {"ok":true}' }],
          response_format: { type: 'json_object' },
          reasoning_effort: 'low',
          max_tokens: 30,
          temperature: 0.1
        })
      });
      const body = await response.text();
      if (response.ok) return res.status(200).json({ ok: true, provider: 'groq', model, latencyMs: Date.now() - started });
      const detail = messageFor(response.status);
      if ((response.status === 403 || response.status === 404 || response.status === 400) && model !== candidates[candidates.length - 1]) continue;
      return res.status(502).json({ ok: false, code: detail.code, error: detail.message, model, upstreamStatus: response.status });
    } catch {
      return res.status(502).json({ ok: false, code: 'GROQ_NETWORK_ERROR', error: 'O servidor não conseguiu alcançar a API da Groq.' });
    }
  }

  return res.status(502).json({ ok: false, code: 'GROQ_PROBE_FAILED', error: 'Não foi possível validar a conexão da Grace.' });
}
