export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const hasGroq = Boolean(process.env['GROQ_API_KEY']);
  const hasOpenAI = Boolean(process.env['OPENAI_API_KEY']);
  const provider = hasGroq ? 'groq' : hasOpenAI ? 'openai' : 'local';
  const model = hasGroq ? (process.env['GROQ_MODEL'] || 'openai/gpt-oss-120b') : (process.env['OPENAI_MODEL'] || 'gpt-5-mini');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    ok: true,
    aiConfigured: hasGroq || hasOpenAI,
    authConfigured: Boolean(process.env['APP_PASSWORD'] && process.env['SESSION_SECRET']),
    provider,
    model
  });
}
