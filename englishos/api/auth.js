import crypto from 'node:crypto';
import { createSession, sessionCookie } from '../lib/session.js';

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const expected = process.env.APP_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!expected || !secret) return res.status(503).json({ error: 'Autenticação do servidor ainda não configurada.' });
  const password = typeof req.body === 'string' ? JSON.parse(req.body || '{}').password : req.body?.password;
  if (!password || !safeEqual(password, expected)) return res.status(401).json({ error: 'Senha incorreta.' });
  const token = createSession(secret);
  res.setHeader('Set-Cookie', sessionCookie(token));
  return res.status(200).json({ ok: true });
}
