export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const model = process.env.OPENAI_MODEL || 'gpt-5-mini';
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    ok: true,
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    authConfigured: Boolean(process.env.APP_PASSWORD && process.env.SESSION_SECRET),
    model
  });
}
