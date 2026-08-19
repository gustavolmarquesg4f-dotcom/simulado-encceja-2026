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

function promptForSupport(level) {
  if (level === 'full') return 'Mostre uma resposta-modelo curta e completa em suggested_answer e sua tradução em suggested_translation.';
  if (level === 'starter') return 'Em suggested_answer, mostre apenas o começo natural da resposta e use "..." para o aluno completar. Em suggested_translation, explique em português a intenção.';
  if (level === 'cue') return 'Deixe suggested_answer vazio. Em hint, dê uma instrução curta em português e 2 ou 3 palavras-chave em inglês.';
  if (level === 'keywords') return 'Deixe suggested_answer e suggested_translation vazios. Em hint, forneça somente 2 ou 3 palavras-chave em inglês.';
  return 'Deixe suggested_answer, suggested_translation e hint vazios. O aluno deve responder sem apoio visível.';
}

function fallback(body) {
  const isProfessionCue = /what you do|profession|job|work|função|profissão/i.test(String(body.cue || ''));
  const target = isProfessionCue ? 'I am an IT project manager and Agile Coach.' : String(body.target || 'My name is Gustavo.');
  const translation = isProfessionCue ? 'Eu sou gerente de projetos de TI e Agile Coach.' : String(body.translation || 'Meu nome é Gustavo.');
  const cue = String(body.cue || 'Introduce yourself.');
  return {
    tutor: body.answer ? 'Good. Let us continue. Can you tell me one more thing about yourself?' : "Hi, I'm Grace. Nice to meet you. What would you like to tell me about yourself?",
    tutor_translation: body.answer ? 'Ótimo. Vamos continuar. Você pode me contar mais uma coisa sobre você?' : 'Oi, eu sou a Grace. Prazer em conhecer você. O que você gostaria de me contar sobre você?',
    suggested_answer: supportFor(body.day) === 'full' ? target : '',
    suggested_translation: supportFor(body.day) === 'full' ? translation : '',
    hint: supportFor(body.day) === 'full' ? cue : '',
    feedback: '',
    correction: '',
    accepted: true,
    support: supportFor(body.day)
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
  const support = supportFor(day);
  const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  const system = `Você é Grace, tutora particular de inglês de Gustavo. Conduza um DIÁLOGO GUIADO, não um exercício de repetição.

PERFIL PROFISSIONAL CANÔNICO DE GUSTAVO — não altere, não simplifique e não invente outro cargo:
- Profissão principal em inglês: ${GUSTAVO_PROFILE.professionEn}.
- Em português: ${GUSTAVO_PROFILE.professionPt}.
- Atuação atual: ${GUSTAVO_PROFILE.currentScope}.
- Experiência: ${GUSTAVO_PROFILE.experience}.
- Quando a pergunta for "What do you do?", "What is your job?" ou equivalente, a resposta-modelo preferida é: "I am an IT project manager and Agile Coach."
- Não chame Gustavo apenas de "technology leader", "software engineer", "developer", "architect", "product manager" ou qualquer outra profissão que não esteja neste perfil.

Regras obrigatórias:
- Grace fala uma frase natural e faz UMA pergunta curta.
- O aluno responde como Gustavo. Nunca peça para ele repetir exatamente o que Grace acabou de dizer.
- tutor e suggested_answer devem representar papéis diferentes e NÃO podem ser a mesma frase.
- Use apenas o conteúdo, gramática e dificuldade do módulo atual recebido.
- Não avance para assuntos futuros.
- Aceite respostas equivalentes à sugestão. Não exija correspondência palavra por palavra.
- Corrija no máximo UM erro importante por turno, em português, somente se atrapalhar naturalidade ou entendimento.
- Depois da resposta do aluno, reconheça brevemente o conteúdo e continue a conversa com a próxima pergunta.
- O diálogo precisa parecer humano e progressivo, com respostas de Grace entre 1 e 2 frases curtas.
- Use o perfil profissional canônico somente quando o assunto do módulo permitir.
- ${promptForSupport(support)}

Retorne SOMENTE JSON válido com estes campos:
{
  "tutor":"fala da Grace em inglês terminando, quando adequado, com uma pergunta",
  "tutor_translation":"tradução natural da fala da Grace em português",
  "suggested_answer":"apoio visível conforme o nível",
  "suggested_translation":"tradução/explicação da sugestão conforme o nível",
  "hint":"dica conforme o nível",
  "feedback":"feedback curtíssimo em português sobre a resposta anterior",
  "correction":"uma correção curta ou string vazia",
  "accepted":true,
  "support":"${support}"
}`;

  const user = {
    day,
    module: body.module || 'Módulo atual',
    level: body.level || 'A1',
    goal: body.goal || '',
    grammar: body.grammar || '',
    target: body.target || '',
    target_translation: body.translation || '',
    cue: body.cue || '',
    answer: String(body.answer || '').slice(0, 1200),
    turn: Number(body.turn || 0),
    history,
    canonical_profile: GUSTAVO_PROFILE
  };

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify(user) }
        ],
        response_format: { type: 'json_object' },
        reasoning_effort: 'low',
        temperature: 0.35,
        max_tokens: 650
      })
    });
    const raw = await response.text();
    if (!response.ok) {
      console.error('Grace dialogue', response.status, raw.slice(0, 300));
      return res.status(200).json(fallback(body));
    }
    const data = JSON.parse(raw);
    const parsed = parseJson(data.choices?.[0]?.message?.content || '');
    return res.status(200).json({ ...fallback(body), ...parsed, support });
  } catch (error) {
    console.error('Grace dialogue error', error?.name || 'unknown');
    return res.status(200).json(fallback(body));
  }
}
