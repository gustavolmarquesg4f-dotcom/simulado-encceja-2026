      T('Persuasão com evidências','Defender uma proposta sem exagero.','The evidence suggests...','The evidence suggests that automation will reduce errors and improve traceability.',[['persuade','persuadir'],['evidence','evidência'],['suggest','indicar'],['benefit','benefício'],['risk','risco'],['traceability','rastreabilidade']],'Você precisa obter apoio para uma iniciativa.'),
      T('Estratégia e roadmap','Conectar visão, fases e resultados.','Our long-term goal is...','Our long-term goal is a secure platform delivered through measurable phases.',[['strategy','estratégia'],['vision','visão'],['roadmap','roteiro'],['phase','fase'],['goal','objetivo'],['measure','medir']],'Você apresenta uma visão de 12 meses.'),
      T('Facilitação de decisões','Dar voz, resumir e fechar encaminhamento.','What I am hearing is...','What I am hearing is that we agree on the goal but differ on the implementation.',[['facilitate','facilitar'],['summarize','resumir'],['consensus','consenso'],['differ','divergir'],['proposal','proposta'],['commit','comprometer']],'Uma reunião está longa e sem decisão.'),
      T('Inglês bíblico e teológico','Explicar uma passagem e sua aplicação.','This passage teaches us that...','This passage teaches us that leadership begins with service and responsibility.',[['passage','passagem'],['faith','fé'],['grace','graça'],['service','serviço'],['wisdom','sabedoria'],['purpose','propósito']],'Você conversa sobre uma lição bíblica em inglês.'),
      T('Projeto final de fluência','Apresentar quem você é, o que faz e uma solução.','Integrated professional communication','Today I will introduce my background, explain a project challenge, and present my recommendation.',[['background','trajetória'],['challenge','desafio'],['solution','solução'],['result','resultado'],['recommendation','recomendação'],['confidence','confiança']],'Sua apresentação final de seis meses.')
    ]
  ];

  const variants = [
    {
      label: 'Fundamentos',
      suffix: '— construa a base',
      mission: t => `Escreva 3 frases simples sobre “${t.title.toLowerCase()}”. Use pelo menos duas palavras da aula.`,
      speaking: t => `Fale por 30 segundos sobre: ${t.scenario}`
    },
    {
      label: 'Prática',
      suffix: '— aplique no trabalho',
      mission: t => `Responda ao cenário: ${t.scenario} Produza de 4 a 6 frases claras.`,
      speaking: t => `Faça uma resposta profissional de 45 segundos para o cenário: ${t.scenario}`
    },
    {
      label: 'Desafio',
      suffix: '— comunique com confiança',
      mission: t => `Crie uma resposta completa para “${t.scenario}”. Inclua contexto, ação e próximo passo.`,
      speaking: t => `Grave uma resposta de 60 a 90 segundos, sem ler, sobre: ${t.title}.`
    }
  ];

  const lessons = [];
  topicGroups.forEach((topics, phaseIndex) => {
    variants.forEach((variant, variantIndex) => {
      topics.forEach((topic, topicIndex) => {
        const day = phaseIndex * 30 + variantIndex * 10 + topicIndex + 1;
        lessons.push({
          day,
          phase: phases[phaseIndex].name,
          phaseIndex,
          level: phases[phaseIndex].level,
          variant: variant.label,
          title: `${topic.title} ${variant.suffix}`,
          shortTitle: topic.title,
          objective: topic.objective,
          explanation: topic.grammar,
          grammar: topic.grammar,
          example: topic.model,
          model: topic.model,
          vocabulary: topic.vocab.map(([en, pt], i) => [en, pt, `${topic.model.split(/[.!?]/)[0] || topic.model}.`]),
          scenario: topic.scenario,
          missionTitle: variantIndex === 0 ? 'Construa sua resposta' : variantIndex === 1 ? 'Resolva o cenário' : 'Desafio profissional',
          mission: variant.mission(topic),
          speakingMission: variant.speaking(topic),
          required: [topic.vocab[0][0].toLowerCase(), topic.vocab[1][0].toLowerCase()],
          teacherQuestion: `Qual resposta usa melhor a estrutura “${topic.grammar}”?`,
          teacherOptions: [topic.model, topic.model.replace(/\b(I|We|The)\b/, ''), topic.model.replace(/\b(is|are|am|will|can)\b/i, '')],
          teacherAnswer: 0,
          hint: `Procure uma frase completa e observe esta estrutura: ${topic.grammar}.`
        });
      });
    });
  });
  lessons.sort((a, b) => a.day - b.day);

  const diagnosticQuestions = [
    { q: 'Choose the correct sentence.', options: ['I am project manager.', 'I am a project manager.', 'I are a project manager.'], answer: 1, level: 'A1' },
    { q: 'What does “deadline” mean?', options: ['Equipe', 'Prazo', 'Reunião'], answer: 1, level: 'A1' },
    { q: 'Choose the polite request.', options: ['Send it now.', 'Could you send it, please?', 'You sending?'], answer: 1, level: 'A2' },
    { q: 'Complete: The project ___ on track.', options: ['is', 'are', 'be'], answer: 0, level: 'A2' },
    { q: 'Which sentence gives a reason?', options: ['I recommend this because it is safer.', 'This option safer.', 'Recommend option.'], answer: 0, level: 'A2' },
    { q: 'Choose the correct past sentence.', options: ['I review it yesterday.', 'I reviewed it yesterday.', 'I will reviewed it.'], answer: 1, level: 'A2' },
    { q: 'Which sentence communicates a trade-off?', options: ['Option A is faster, but option B is safer.', 'Option A fast option B.', 'Both option.'], answer: 0, level: 'B1' },
    { q: 'Complete: If we reduce scope, we ___ deliver earlier.', options: ['can', 'did', 'are'], answer: 0, level: 'B1' },
    { q: 'Which is the best executive recommendation?', options: ['Maybe we do.', 'Our recommendation is to proceed with phase one.', 'I think something.'], answer: 1, level: 'B1' },
    { q: 'What does “least privilege” relate to?', options: ['Security access', 'Meeting agenda', 'Salary'], answer: 0, level: 'B2' },
    { q: 'Choose the diplomatic response.', options: ['You are wrong.', 'I understand your concern. Let me clarify the situation.', 'Not our problem.'], answer: 1, level: 'B2' },
    { q: 'Which sentence best summarizes a crisis update?', options: ['Problem happened.', 'We identified the issue, contained the impact, and are monitoring recovery.', 'Everything maybe fine.'], answer: 1, level: 'B2' }
  ];

  const assessmentTemplates = [
    { type: 'status', prompt: 'Give a 60-second project status with progress, risk, and next step.' },
    { type: 'meeting', prompt: 'Open a project meeting and request an update politely.' },
    { type: 'interview', prompt: 'Answer “Tell me about yourself” in 5 to 7 sentences.' },
    { type: 'client', prompt: 'Respond to a client concerned about a delivery delay.' },
    { type: 'technical', prompt: 'Explain a cloud solution in simple executive English.' },
    { type: 'executive', prompt: 'Present context, recommendation, and required decision.' }
  ];

  const sentenceChallenges = lessons.slice(0, 60).map(l => ({
    pt: l.objective,
    answer: l.model.split(/[.!?]/)[0] + '.',
    words: (l.model.split(/[.!?]/)[0] + '.').match(/[^\s]+/g) || []
  }));

  const listeningChallenges = lessons.filter((_, i) => i % 3 === 0).map(l => ({
    text: l.model,
    correct: l.objective,
    options: [l.objective, 'Falar apenas sobre férias e lazer.', 'Explicar uma receita de cozinha.']
  }));

  const conversationScenarios = {
    daily: { role: 'Amiga e professora', opening: 'Hi Gustavo! How are you feeling today?', translation: 'Oi, Gustavo! Como você está se sentindo hoje?' },
