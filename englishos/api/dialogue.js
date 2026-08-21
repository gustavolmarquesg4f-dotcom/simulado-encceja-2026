import { verifySession } from '../lib/session.js';

const GUSTAVO_PROFILE = {
  professionEn: 'IT Project Manager and Agile Coach',
  professionPt: 'Gerente de Projetos de TI e Agile Coach',
  currentScope: 'technology project leadership, agile coaching, squad leadership, client and governance coordination',
  experience: 'over 17 years in technology and project leadership'
};

function supportFor(day) {
  const d = Number(day || 1);
  if (d <= 30) return 'full';
  if (d <= 60) return 'starter';
  if (d <= 90) return 'cue';
  if (d <= 120) return 'keywords';
  return 'minimal';
}

function supportInstruction(level) {
  if (level === 'full') return 'Mostre uma resposta-modelo curta e completa em suggested_answer e uma tradução curta em suggested_translation.';
  if (level === 'starter') return 'Mostre apenas o começo da resposta em suggested_answer, terminando com "...". suggested_translation explica a intenção em português.';
  if (level === 'cue') return 'Deixe suggested_answer vazio. Em hint, dê uma instrução curta em português e até 3 palavras-chave em inglês.';
  if (level === 'keywords') return 'Deixe suggested_answer e suggested_translation vazios. Em hint, dê apenas 2 ou 3 palavras-chave em inglês.';
  return 'Deixe suggested_answer, suggested_translation e hint vazios.';
}

function fallbackTurn(body) {
  const turn = Math.max(0, Number(body.turn || 0));
  const support = supportFor(body.day);
  const turns = [
    ["Hi, I'm Grace. What's your name?", 'Oi, eu sou a Grace. Qual é o seu nome?', 'Hi, I’m Gustavo.', 'Oi, eu sou o Gustavo.'],
    ['Nice to meet you, Gustavo. Where do you live?', 'Prazer em conhecer você, Gustavo. Onde você mora?', 'I live in Brasília.', 'Eu moro em Brasília.'],
    ['What do you do?', 'Com o que você trabalha?', 'I am an IT project manager and Agile Coach.', 'Eu sou gerente de projetos de TI e Agile Coach.'],
    ['Do you work with technology projects?', 'Você trabalha com projetos de tecnologia?', 'Yes. I work with technology projects.', 'Sim. Eu trabalho com projetos de tecnologia.'],
    ['Do you lead teams?', 'Você lidera equipes?', 'Yes. I lead project and agile teams.', 'Sim. Eu lidero equipes de projeto e ágeis.'],
    ['How long have you worked in technology?', 'Há quanto tempo você trabalha com tecnologia?', 'I have over seventeen years of experience.', 'Eu tenho mais de dezessete anos de experiência.'],
    ['What do you usually do at work?', 'O que você costuma fazer no trabalho?', 'I lead meetings and support teams.', 'Eu conduzo reuniões e apoio equipes.'],
    ['Good. What is one thing you want to improve in English?', 'Certo. Qual é uma coisa que você quer melhorar no inglês?', 'I want to speak more confidently.', 'Eu quero falar com mais confiança.'],
    ['Great work today. You kept the conversation going.', 'Bom trabalho hoje. Você conseguiu manter a conversa.', '', '']
  ];
  const [tutor, tutor_translation, answer, answerPt] = turns[Math.min(turn, turns.length - 1)];
  return {
    tutor,
    tutor_translation,
    suggested_answer: support === 'full' ? answer : support === 'starter' && answer ? `${answer.split(' ').slice(0, 3).join(' ')}...` : '',
    suggested_translation: support === 'full' ? answerPt : support === 'starter' ? answerPt : '',
    hint: support === 'cue' ? String(body.cue || 'Responda com uma frase curta.') : support === 'keywords' ? String(body.target || '').split(' ').slice(0, 3).join(' · ') : '',
    understood: true,
    accepted: true,
    feedback: body.answer ? 'Entendi sua resposta. Vamos continuar.' : '',
    correction: '',
    better_answer: '',
    why: '',
    repeat_needed: false,
    focus: String(body.goal || ''),
    session_complete: turn >= 8,
    summary: turn >= 8 ? 'Você concluiu uma conversa curta em inglês.' : '',
    support
  };
}

function parseJson(text) {
  try { return JSON.parse(text); } catch {}
  const match = String(text || '').match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Resposta inválida.');
  return JSON.parse(match[0]);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  if (!verifySession(req, process.env.SESSION_SECRET)) return res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: 'Groq não configurada.' });

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const day = Math.max(1, Math.min(180, Number(body.day || 1)));
  const turn = Math.max(0, Number(body.turn || 0));
  const support = supportFor(day);
  const history = Array.isArray(body.history) ? body.history.slice(-14) : [];
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  const system = `Você é Grace, professora particular de inglês falado de Gustavo. A meta é inglês funcional em 6 meses. Sua prioridade é FAZER GUSTAVO SUSTENTAR UMA CONVERSA, não dar aula expositiva, não criar um quiz e não pedir repetição mecânica.

PERFIL PROFISSIONAL CANÔNICO — use somente quando a pergunta realmente envolver trabalho:
- ${GUSTAVO_PROFILE.professionEn} (${GUSTAVO_PROFILE.professionPt}).
- Atuação: ${GUSTAVO_PROFILE.currentScope}.
- Experiência: ${GUSTAVO_PROFILE.experience}.
- Nunca invente outro cargo ou simplifique o cargo para outra profissão.

COMPORTAMENTO PEDAGÓGICO OBRIGATÓRIO:
1. Grace fala 1 ou 2 frases curtas e faz UMA pergunta concreta.
2. O aluno responde como Gustavo. Nunca peça para ele repetir a fala da Grace.
3. Julgue o que ele REALMENTE respondeu, não se bate palavra por palavra com a sugestão.
4. Primeiro avalie significado: foi possível entender o que ele quis dizer?
5. Depois avalie apenas o erro gramatical/naturalidade MAIS importante daquele turno.
6. Se a resposta estiver compreensível, continue o diálogo mesmo com pequenos erros.
7. Use repeat_needed=true SOMENTE quando a resposta não for compreensível ou um erro impedir o sentido. Nesse caso, dê uma versão melhor e peça uma nova tentativa da RESPOSTA DELE, nunca da fala da Grace.
8. correction deve conter o trecho que precisa mudar; better_answer deve mostrar uma versão natural completa. why explica em português em UMA frase curta.
9. Não elogie automaticamente. feedback deve ser factual: "Entendi", "Ficou claro", "Quase; faltou..." etc.
10. A próxima pergunta deve reagir ao conteúdo que Gustavo falou. Não siga um roteiro cego.
11. Nos primeiros 30 dias, inglês A1: perguntas concretas, normalmente 4–10 palavras, uma ideia de cada vez. Evite perguntas vagas como "Tell me about yourself" sem apoio.
12. Dias 1–30: priorize cotidiano e apresentação; trabalho entra aos poucos. Não transforme toda conversa em entrevista profissional.
13. Cada sessão guiada deve durar cerca de 8–10 turnos. A partir do turno 8, quando fizer sentido, encerre naturalmente e marque session_complete=true.
14. Se Gustavo responder em português ou misturar idiomas, entenda a intenção, mostre como dizer em inglês e continue sem constrangimento.
15. Use apenas a dificuldade e objetivo do módulo atual. Não antecipe conteúdo avançado.
16. ${supportInstruction(support)}

RETORNE SOMENTE JSON válido:
{
  "tutor":"próxima fala natural da Grace em inglês",
  "tutor_translation":"tradução curta em português",
  "suggested_answer":"apoio visível conforme a fase",
  "suggested_translation":"tradução/intenção do apoio",
  "hint":"dica conforme a fase",
  "understood":true,
  "accepted":true,
  "feedback":"avaliação factual e curta em português",
  "correction":"trecho corrigido ou string vazia",
  "better_answer":"versão natural completa ou string vazia",
  "why":"explicação curtíssima em português ou string vazia",
  "repeat_needed":false,
  "focus":"micro-habilidade trabalhada neste turno",
  "session_complete":false,
  "summary":"resumo apenas quando a sessão terminar",
  "support":"${support}"
}`;

  const user = {
    day,
    turn,
    module: body.module || 'Módulo atual',
    level: body.level || 'A1',
    goal: body.goal || '',
    grammar: body.grammar || '',
    target: body.target || '',
    target_translation: body.translation || '',
    cue: body.cue || '',
    answer: String(body.answer || '').slice(0, 1200),
    history,
    canonical_profile: GUSTAVO_PROFILE
  };

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify(user) }
        ],
        response_format: { type: 'json_object' },
        reasoning_effort: 'low',
        temperature: 0.28,
        max_tokens: 850
      })
    });
    const raw = await response.text();
    if (!response.ok) {
      console.error('Grace dialogue', response.status, raw.slice(0, 300));
      return res.status(200).json(fallbackTurn(body));
    }
    const data = JSON.parse(raw);
    const parsed = parseJson(data.choices?.[0]?.message?.content || '');
    return res.status(200).json({ ...fallbackTurn(body), ...parsed, support });
  } catch (error) {
    console.error('Grace dialogue error', error?.name || 'unknown');
    return res.status(200).json(fallbackTurn(body));
  }
}
