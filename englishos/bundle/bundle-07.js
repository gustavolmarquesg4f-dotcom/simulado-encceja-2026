    if (teacherStep === 2) content.innerHTML = `<div class="eyebrow">3 • MOSTRE QUE ENTENDEU</div><h3>${escapeHtml(lesson.teacherQuestion)}</h3><div class="teacher-choice-list">${lesson.teacherOptions.map((o, i) => `<button class="teacher-choice" data-teacher-choice="${i}">${escapeHtml(o)}</button>`).join('')}</div><div id="teacherChoiceFeedback" class="game-feedback">Escolha uma opção.</div>`;
    if (teacherStep === 3) content.innerHTML = `<div class="eyebrow">4 • CONSTRUA</div><h3>Agora é sua vez</h3><p>${escapeHtml(lesson.mission)}</p><textarea id="teacherOwnAnswer" placeholder="Construa sua resposta em inglês..."></textarea><div class="button-row"><button class="secondary" id="teacherOwnMic">🎙️ Falar</button><button class="primary" id="teacherOwnCheck">Grace, verificar</button></div><div id="teacherOwnFeedback" class="game-feedback">Eu só libero a conclusão depois de uma tentativa completa.</div>`;
    const topError = Object.values(state.errors).sort((a, b) => b.count - a.count)[0]; $('teacherMemoryTitle').textContent = topError ? topError.label : 'Aprendendo seu padrão'; $('teacherMemoryText').textContent = topError ? `Você já encontrou este ponto ${topError.count} vez(es). A Grace vai reforçá-lo.` : 'Quando você errar, a Grace registrará o ponto e criará revisões futuras.';
  }
  function selectTeacherChoice(index, button) { document.querySelectorAll('.teacher-choice').forEach(b => b.classList.remove('selected')); button.classList.add('selected'); const lesson = getLesson(); teacherQuestionPassed = index === lesson.teacherAnswer; $('teacherChoiceFeedback').textContent = teacherQuestionPassed ? 'Correto. Você identificou a estrutura completa.' : `Ainda não. ${lesson.hint}`; if (!teacherQuestionPassed) addError(lesson.grammar, lesson.teacherOptions[index], lesson.model); }
  async function teacherHint() {
    const lesson = getLesson();
    if (teacherStep === 3) {
      const answer = $('teacherOwnAnswer')?.value || '';
      const ai = await GraceAI.ask('teacher', { lesson, answer, request: 'hint', memory: memorySummary(), profile: studentProfile() });
      $('teacherOwnFeedback').textContent = ai?.hint || lesson.hint;
    } else toast(lesson.hint);
  }
  async function checkTeacherOwn() {
    const answer = $('teacherOwnAnswer').value.trim(), lesson = getLesson(); if (answer.split(/\s+/).length < 8) { $('teacherOwnFeedback').textContent = 'Sua resposta está curta. Tente pelo menos 8 palavras.'; return; }
    $('teacherOwnFeedback').textContent = 'Grace está verificando...';
    const ai = await GraceAI.ask('writing', { answer, lesson, memory: memorySummary(), profile: studentProfile(), teacherStyle: state.teacherStyle });
    if (ai) { teacherOwnPassed = Number(ai.score || 0) >= 65; applyAiMemory(ai); $('teacherOwnFeedback').innerHTML = `<b>${teacherOwnPassed ? 'Boa construção.' : 'Vamos tentar novamente.'}</b><br>${escapeHtml(ai.feedback || ai.explanation || '')}${ai.improved_answer ? `<br><br><b>Modelo melhor:</b> ${escapeHtml(ai.improved_answer)}` : ''}`; }
    else { const words = answer.split(/\s+/).length, hasRequired = lesson.required.some(k => normalize(answer).includes(normalize(k))); teacherOwnPassed = words >= 8 && hasRequired; $('teacherOwnFeedback').textContent = teacherOwnPassed ? 'Boa tentativa. A estrutura principal apareceu.' : `Inclua uma ideia da aula. Pista: ${lesson.required.join(' / ')}.`; }
    if (!teacherOwnPassed) addError(lesson.grammar, answer, lesson.model); saveState(false);
  }
  function teacherNext() {
    if (teacherStep === 2 && !teacherQuestionPassed) return toast('Escolha a resposta correta antes de continuar.');
    if (teacherStep === 3) { if (!teacherOwnPassed) return toast('A Grace precisa verificar uma resposta completa primeiro.'); state.dailySteps.teacher = true; addXp(25, 'Etapa de ensino concluída', 8); teacherStep = 0; teacherQuestionPassed = false; teacherOwnPassed = false; go('lesson'); return; }
    teacherStep++; renderTeacher();
  }

  function renderLesson() {
    const lesson = getLesson(); $('lessonDay').textContent = state.day; $('lessonTitle').textContent = lesson.title; $('lessonSubtitle').textContent = `${lesson.variant} • ${lesson.objective}`; $('lessonLevel').textContent = lesson.level; $('grammarName').textContent = lesson.grammar; $('grammarExplanation').textContent = lesson.objective; $('grammarExample').textContent = lesson.example; $('transcript').textContent = lesson.model; $('missionTitle').textContent = lesson.missionTitle; $('missionInstructions').textContent = lesson.mission;
    $('vocabularyGrid').innerHTML = lesson.vocabulary.map(([en, pt, ex]) => `<div class="vocab-card"><button data-speak="${escapeHtml(en)}">🔊</button><b>${escapeHtml(en)}</b><small>${escapeHtml(pt)}</small><small>${escapeHtml(ex)}</small></div>`).join(''); renderMissionChecklist($('missionAnswer').value);
  }
  function renderMissionChecklist(text) {
    const lesson = getLesson(), n = normalize(text), words = n ? n.split(' ').length : 0;
    const items = [{ ok: words >= 20, text: 'Pelo menos 20 palavras' }, ...lesson.required.map(k => ({ ok: n.includes(normalize(k)), text: `Usar “${k}” ou ideia equivalente` }))];
    $('missionChecklist').innerHTML = items.map(i => `<div class="check-item ${i.ok ? 'ok' : ''}">${i.ok ? '✓' : '○'} ${escapeHtml(i.text)}</div>`).join('');
  }
  async function evaluateMission() {
    const answer = $('missionAnswer').value.trim(), lesson = getLesson(); if (answer.split(/\s+/).length < 12) return toast('Desenvolva mais sua resposta antes da correção.');
    $('missionFeedback').innerHTML = '<div class="grace-mini">G</div><p>Analisando sua resposta...</p>';
    const ai = await GraceAI.ask('writing', { answer, lesson, memory: memorySummary(), profile: studentProfile(), teacherStyle: state.teacherStyle });
    let score, feedback, improved;
    if (ai) { score = Number(ai.score || 0); feedback = ai.feedback || ai.explanation; improved = ai.improved_answer; applyAiMemory(ai); }
    else { const n = normalize(answer), requirements = lesson.required.filter(k => n.includes(normalize(k))).length; score = Math.min(90, 45 + requirements * 20 + Math.min(25, answer.split(/\s+/).length)); feedback = score >= 70 ? 'Boa resposta. Você usou a estrutura principal e apresentou uma ideia completa.' : `Sua resposta precisa incluir melhor: ${lesson.required.join(' e ')}.`; improved = lesson.model; }
    currentMissionPassed = score >= 70; state.skills.writing = clamp(state.skills.writing + (currentMissionPassed ? 2 : .5), 0, 100); if (!currentMissionPassed) addError(lesson.grammar, answer, improved); saveState(false);
    $('missionFeedback').innerHTML = `<div class="grace-mini">G</div><p><b>${score}% — ${currentMissionPassed ? 'Aprovado' : 'Nova tentativa necessária'}</b><br>${escapeHtml(feedback || '')}${improved ? `<br><br><b>Versão melhor:</b> ${escapeHtml(improved)}` : ''}</p>`;
  }
  function completeLesson() {
    if (!currentMissionPassed && state.teacherStyle !== 'patient') return toast('Peça a correção da Grace e alcance pelo menos 70%.');
    if (!state.completed.includes(state.day)) { state.completed.push(state.day); state.words += getLesson().vocabulary.length; state.xp += 60; state.skills.vocabulary = clamp(state.skills.vocabulary + 2, 0, 100); state.dailySteps.lesson = true; recordActivity(15); if (state.day < 180) state.day++; saveState(); toast('Aula concluída. +60 XP'); }
    currentMissionPassed = false; $('missionAnswer').value = ''; go('pronunciation');
  }

