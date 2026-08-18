import { verifySession } from '../lib/session.js';

const ALLOWED_VOICES = new Set(['autumn','diana','hannah','austin','daniel','troy']);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  if (!verifySession(req, process.env.SESSION_SECRET)) return res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: 'Groq não configurada.' });

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const input = String(body.text || '').trim().slice(0, 200);
  const voice = ALLOWED_VOICES.has(body.voice) ? body.voice : 'hannah';
  if (!input) return res.status(400).json({ error: 'Texto vazio.' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'canopylabs/orpheus-v1-english',
        input,
        voice,
        response_format: 'wav'
      })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('Grace TTS', response.status, detail.slice(0, 300));
      return res.status(502).json({ error: 'A voz natural da Grace não respondeu.' });
    }
    const audio = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', String(audio.length));
    return res.status(200).send(audio);
  } catch (error) {
    console.error('Grace TTS network', error?.name || 'unknown');
    return res.status(502).json({ error: 'Falha de conexão com a voz da Grace.' });
  }
}
