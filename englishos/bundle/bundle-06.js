      $('heroTitle').textContent = 'Comece pelo diagnóstico.'; $('heroDescription').textContent = 'A Grace vai medir sua base e ajustar o ponto de partida.'; $('primaryDashboardAction').textContent = 'Fazer diagnóstico'; $('primaryDashboardAction').dataset.go = 'diagnostic';
    } else {
      $('heroTitle').textContent = lesson.title; $('heroDescription').textContent = lesson.objective; $('primaryDashboardAction').textContent = 'Começar com a Grace'; $('primaryDashboardAction').dataset.go = 'teacher';
    }
    const progress = Math.round(state.completed.length / 180 * 100); $('progressPercent').textContent = `${progress}%`; $('progressBar').style.width = `${progress}%`;
    ['listening', 'speaking', 'vocabulary', 'writing'].forEach(skill => { const name = skill[0].toUpperCase() + skill.slice(1); const value = Math.round(state.skills[skill]); $(`skill${name}`).style.width = `${value}%`; $(`skill${name}Text`).textContent = `${value}%`; });
    const steps = [
      ['teacher', '👩‍🏫', 'Entender', 'Grace explica'], ['lesson', '📘', 'Praticar', 'Aula e escrita'], ['pronunciation', '🎙️', 'Falar', 'Pronúncia'], ['game', '🎮', 'Memorizar', 'Jogo curto'], ['conversation', '💬', 'Conversar', 'Grace AI'], ['review', '🧠', 'Revisar', 'Erros do dia']
    ];
    $('dailyPath').innerHTML = steps.map(([key, icon, title, sub]) => `<button class="path-step ${state.dailySteps[key] ? 'done' : ''}" data-go="${key === 'game' ? 'games' : key === 'review' ? 'reports' : key}"><span>${icon}</span><b>${title}</b><small>${state.dailySteps[key] ? 'Concluído' : sub}</small></button>`).join('');
    const done = steps.filter(([key]) => state.dailySteps[key]).length; $('dailyStatus').textContent = `${done} de 6 etapas`;
    const errors = Object.values(state.errors).sort((a, b) => b.count - a.count); $('errorCount').textContent = `${errors.length} pontos`; $('errorSummary').textContent = errors[0] ? `Principal reforço: ${errors[0].label}` : 'A Grace começará a registrar seus padrões de erro.';
    const weekStart = currentWeekStart(); const sessions = state.practiceSessions.filter(s => new Date(`${s.date}T12:00:00`) >= weekStart); const mins = sessions.reduce((sum, s) => sum + Number(s.minutes || 0), 0); $('weeklyMinutes').textContent = `${mins} minutos`; $('weeklyPracticeText').textContent = `${sessions.length}/2 conversas registradas nesta semana.`;
    const next = [30, 60, 90, 120, 150, 180].find(d => !state.assessments[d]); $('nextAssessment').textContent = next ? `Dia ${next}` : 'Ciclo concluído';
    $('graceDailyMessage').textContent = state.diagnostic.done ? `“Hoje vamos praticar ${lesson.shortTitle.toLowerCase()}. Eu vou cobrar uma resposta sua.”` : '“Faça o diagnóstico para eu ajustar o caminho ao seu nível.”';
  }

  function startDiagnostic() { diagnosticIndex = 0; diagnosticAnswers = []; diagnosticTranscript = ''; $('diagnosticIntro').classList.add('hidden'); $('diagnosticResult').classList.add('hidden'); $('diagnosticQuiz').classList.remove('hidden'); renderDiagnosticQuestion(); }
  function renderDiagnosticQuestion() {
    const item = diagnosticQuestions[diagnosticIndex]; $('diagnosticCounter').textContent = `PERGUNTA ${diagnosticIndex + 1} DE ${diagnosticQuestions.length}`; $('diagnosticQuestion').textContent = item.q; $('diagnosticProgress').style.width = `${diagnosticIndex / diagnosticQuestions.length * 100}%`;
    $('diagnosticOptions').innerHTML = item.options.map((option, index) => `<button class="option-button" data-diagnostic-option="${index}">${escapeHtml(option)}</button>`).join('');
  }
  function answerDiagnostic(index, button) {
    const item = diagnosticQuestions[diagnosticIndex], correct = index === item.answer; diagnosticAnswers.push({ correct, level: item.level }); button.classList.add(correct ? 'correct' : 'wrong'); document.querySelectorAll('[data-diagnostic-option]').forEach(b => b.disabled = true);
    if (!correct) document.querySelector(`[data-diagnostic-option="${item.answer}"]`)?.classList.add('correct');
    setTimeout(() => { diagnosticIndex++; if (diagnosticIndex < diagnosticQuestions.length) renderDiagnosticQuestion(); else { $('diagnosticQuiz').classList.add('hidden'); $('diagnosticWriting').classList.remove('hidden'); } }, 650);
  }
  function submitDiagnosticWriting() { const text = $('diagnosticWritingAnswer').value.trim(); if (text.split(/\s+/).length < 20) return toast('Escreva um pouco mais: pelo menos 20 palavras.'); state.diagnostic.writing = text; $('diagnosticWriting').classList.add('hidden'); $('diagnosticSpeaking').classList.remove('hidden'); }
  async function finishDiagnostic() {
    const objective = diagnosticAnswers.filter(x => x.correct).length / diagnosticQuestions.length * 70;
    const writingWords = state.diagnostic.writing.split(/\s+/).length; const speakingWords = diagnosticTranscript.split(/\s+/).length;
    let score = Math.round(objective + clamp(writingWords / 50 * 15, 0, 15) + clamp(speakingWords / 35 * 15, 0, 15));
    const ai = await GraceAI.ask('diagnostic', { answers: diagnosticAnswers, writing: state.diagnostic.writing, speaking: diagnosticTranscript, profile: studentProfile() });
    if (ai?.score != null) score = Math.round((score + Number(ai.score)) / 2);
    const level = ai?.level || levelFromScore(score);
    state.diagnostic = { done: true, score, level, answers: diagnosticAnswers, writing: state.diagnostic.writing, speaking: diagnosticTranscript, feedback: ai?.feedback || '' };
    state.skills.writing = clamp(score * .7, 0, 100); state.skills.speaking = clamp(score * .55, 0, 100); state.skills.vocabulary = clamp(score * .7, 0, 100); state.skills.listening = clamp(score * .55, 0, 100); state.xp += 100; recordActivity(15); saveState();
    $('diagnosticSpeaking').classList.add('hidden'); $('diagnosticResult').classList.remove('hidden'); $('diagnosticResult').innerHTML = `<div class="eyebrow">RESULTADO</div><h2>${level} • ${score}%</h2><p>${escapeHtml(ai?.feedback || 'Você já possui uma base para começar. A Grace ajustará explicações, vocabulário e velocidade.')}</p><button class="primary" data-go="teacher">Começar o plano</button>`; $('diagnosticStatus').textContent = `${level} • ${score}%`;
  }

  function renderTeacher() {
    const lesson = getLesson(); $('teacherTopic').textContent = lesson.shortTitle; $('teacherObjective').textContent = `Objetivo: ${lesson.objective}`; $('teacherStepBadge').textContent = `Etapa ${teacherStep + 1} de 4`; $('teacherProgressBar').style.width = `${(teacherStep + 1) * 25}%`; $('teacherBack').disabled = teacherStep === 0; $('teacherNext').textContent = teacherStep === 3 ? 'Concluir ensino' : 'Continuar';
    const content = $('teacherContent');
    if (teacherStep === 0) content.innerHTML = `<div class="eyebrow">1 • ENTENDA</div><h3>${escapeHtml(lesson.grammar)}</h3><p>${escapeHtml(lesson.objective)} Em vez de decorar uma frase isolada, observe a estrutura e troque apenas as informações necessárias.</p><div class="example-box">${escapeHtml(lesson.example)}</div>`;
    if (teacherStep === 1) content.innerHTML = `<div class="eyebrow">2 • VEJA E OUÇA</div><h3>Modelo profissional</h3><div class="example-box">${escapeHtml(lesson.model)}</div><div class="button-row"><button class="primary" data-speak="${escapeHtml(lesson.model)}">🔊 Ouvir Grace</button><button class="secondary" data-speak-slow="${escapeHtml(lesson.model)}">Ouvir devagar</button></div><p>Agora identifique onde aparecem o sujeito, o verbo e a informação principal.</p>`;
