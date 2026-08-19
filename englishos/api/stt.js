import { verifySession } from '../lib/session.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  if (!verifySession(req, process.env.SESSION_SECRET)) return res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: 'Groq não configurada.' });

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const audioBase64 = String(body.audioBase64 || '');
  const mimeType = String(body.mimeType || 'audio/webm').split(';')[0];
  if (!audioBase64) return res.status(400).json({ error: 'Áudio não recebido.' });
  if (audioBase64.length > 5_500_000) return res.status(413).json({ error: 'Áudio muito longo. Grave uma resposta menor.' });

  try {
    const buffer = Buffer.from(audioBase64, 'base64');
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: mimeType }), mimeType.includes('wav') ? 'speech.wav' : 'speech.webm');
    form.append('model', 'whisper-large-v3-turbo');
    form.append('language', 'en');
    form.append('response_format', 'verbose_json');
    form.append('timestamp_granularities[]', 'word');
    form.append('temperature', '0');
    form.append('prompt', 'Professional English practice. Project management, Agile, AWS, technology, clients, interviews and Bible study vocabulary.');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: form
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Grace STT', response.status, JSON.stringify(data).slice(0, 300));
      return res.status(502).json({ error: 'A Grace não conseguiu entender o áudio.' });
    }
    const words = Array.isArray(data.words) ? data.words.slice(0, 120).map(w => ({ word: String(w.word || '').trim(), start: Number(w.start || 0), end: Number(w.end || 0) })) : [];
    return res.status(200).json({ ok: true, text: String(data.text || '').trim(), words, duration: Number(data.duration || 0), model: 'whisper-large-v3-turbo' });
  } catch (error) {
    console.error('Grace STT network', error?.name || 'unknown');
    return res.status(502).json({ error: 'Falha de conexão ao transcrever sua fala.' });
  }
}
