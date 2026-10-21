(function installCGUPrep(){
"use strict";
const STYLE=`
.cgu-lead{padding:17px 20px;background:linear-gradient(115deg,#123e48,#133043);border:1px solid #407367;border-radius:15px;margin-bottom:15px}
.cgu-lead h2{font-size:23px;margin:5px 0 8px}
.cgu-lead p{color:#c6dce5;margin:6px 0}
.cgu-navtabs{display:flex;gap:9px;flex-wrap:wrap;margin:13px 0}
.cgu-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;background:#1b4052;border:1px solid #467082;border-radius:10px;color:#ecf8fc;padding:11px 14px;cursor:pointer;font:700 14px system-ui;text-decoration:none}
.cgu-btn:hover{background:#28596b}
.cgu-btn.prime{background:#61e4b6;color:#063227;border-color:#61e4b6}
.cgu-btn.alt{background:#102938}
.cgu-btn:disabled{opacity:.4;cursor:not-allowed}
.cgu-filters{display:flex;gap:11px;align-items:end;flex-wrap:wrap;padding:15px;background:#102c3c;border:1px solid #385767;border-radius:13px;margin:14px 0}
.cgu-filters label{display:grid;gap:5px;min-width:145px;flex:1;color:#bad1dc;font-size:12px}
.cgu-filters select,.cgu-filters input{background:#071c2c;border:1px solid #456476;color:#f3fafc;border-radius:9px;padding:10px;font:14px system-ui;min-width:0;max-width:100%;width:100%}
.cgu-count{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;margin:10px 0 15px;font-size:13px;color:#b9d4dc}
.cgu-list{display:grid;gap:12px}
.cgu-item{background:#0d2839;border:1px solid #2c5363;border-radius:15px;padding:17px;break-inside:avoid}
.cgu-item.learned{border-color:#3b8269}
.cgu-qtop{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
.cgu-tag{display:inline-flex;align-items:center;gap:5px;background:#193b4c;border:1px solid #355866;border-radius:7px;color:#c5dbe6;font-size:11px;padding:5px 8px}
.cgu-tag.p3{background:#173f39;color:#9befce}
.cgu-tag.correct{color:#8df1be;background:#143f35;border-color:#3b896c;font-size:13px;font-weight:800}
.cgu-tag.incorrect{color:#ffb6b8;background:#452c39;border-color:#9b5360;font-size:13px;font-weight:800}
.cgu-question{font-size:17px;line-height:1.55;font-weight:650;margin:12px 0}
.cgu-a{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:12px 0 8px}
.cgu-explain{font-size:13px;color:#b8d0db;line-height:1.5}
.cgu-itemfoot{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;padding-top:11px;border-top:1px solid #2d4653}
.cgu-muted{color:#a5bfcb;font-size:12px}
.cgu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}
.cgu-metric{background:#0e2737;border:1px solid #2e5161;border-radius:12px;padding:14px}
.cgu-metric b{font-size:25px;display:block}
.cgu-metric span{font-size:12px;color:#abc9d5}
.cgu-questionpane{margin:15px 0;padding:22px;background:#0b2738;border:1px solid #426678;border-radius:15px}
.cgu-questionpane h3{font-size:21px;line-height:1.55;margin:17px 0}
.cgu-choice{display:flex;gap:9px;flex-wrap:wrap;margin:15px 0}
.cgu-choice button{min-width:120px;flex:1;border:1px solid #4b7182;background:#193b4e;color:white;border-radius:11px;padding:14px;font-size:15px;font-weight:750;cursor:pointer}
.cgu-choice button.selected{background:#28876c;border-color:#85edc8}
.cgu-choice button:disabled{cursor:not-allowed}
.cgu-statusgrid{display:grid;grid-template-columns:repeat(17,minmax(0,1fr));gap:4px;margin:12px 0}
.cgu-statusgrid button{min-width:0;font-size:11px;padding:8px 0;border:1px solid #3b5c6c;border-radius:6px;background:#15374a;color:#d7eaf1;cursor:pointer}
.cgu-statusgrid button.done{background:#26715c}
.cgu-statusgrid button.now{outline:2px solid #f2c783}
.cgu-examheader{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.cgu-clock{font-size:23px;font-weight:850;font-variant-numeric:tabular-nums;color:#7ff0c6}
.cgu-over{color:#ffb1af!important}
.cgu-score{border-left:4px solid #60deb3;background:#143c3a;border-radius:10px;padding:15px;margin:15px 0}
.cgu-review{border:1px solid #365968;border-radius:10px;padding:13px;margin:10px 0}
.cgu-review.bad{border-color:#85535c}
.cgu-review.good{border-color:#3f8068}
.cgu-writing{width:100%;min-height:245px;background:#061d2c;border:1px solid #416474;border-radius:10px;color:#e8f6fa;padding:14px;resize:vertical;font:15px/1.55 system-ui}
.cgu-rule{color:#c5dce3;margin-top:10px;font-size:13px}
.cgu-panel{background:#102b3c;border:1px solid #2a5060;border-radius:14px;padding:18px;margin:14px 0}
@media(max-width:830px){.cgu-grid{grid-template-columns:repeat(2,1fr)}.cgu-statusgrid{grid-template-columns:repeat(10,minmax(0,1fr))}.cgu-questionpane{padding:15px}.cgu-questionpane h3{font-size:19px}}
@media(max-width:480px){.cgu-grid{grid-template-columns:1fr 1fr}.cgu-statusgrid{grid-template-columns:repeat(7,minmax(0,1fr))}.cgu-filters label{flex:1 1 130px}.cgu-question{font-size:16px}.cgu-metric{padding:11px}.cgu-metric b{font-size:21px}}
@media print {.side,.top,.cgu-filters,.cgu-itemfoot,.cgu-navtabs,.cgu-btn,.cgu-count button,footer{display:none!important}.shell{display:block!important}.main{padding:0!important;width:100%!important;max-width:none!important}body{background:#fff!important;color:#111!important}.cgu-item,.cgu-lead{background:#fff!important;color:#111!important;box-shadow:none!important;border:1px solid #aaa!important}.cgu-question,.cgu-explain,.cgu-lead p,.cgu-muted{color:#111!important}.cgu-tag{color:#111!important;background:#fff!important;border-color:#999!important} }
`;
const style=document.createElement("style");style.textContent=STYLE;document.head.appendChild(style);
const STORE_KEY="CGU_LISTA_SIMULADOS_20261021_V1";
const el=()=>document.getElementById("view");
const enc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rand=xs=>{const a=[...xs];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const parts={P1:"Conhecimentos básicos",P2:"Conhecimentos complementares",P3:"Infraestrutura de TI"};
const cuts={P1:8,P2:12,P3:54,total:78};
const weight=p=>p==="P3"?2:1;
const duration=5*60*60*1000;
const discDuration=3.5*60*60*1000;
let currentPage="lista",data=null,bank=[],map=new Map(),liveTimer=null,printing=false;
let filters={part:"ALL",answer:"ALL",progress:"ALL",source:"ALL",search:"",perPage:25,page:1};
let reviewMode="wrong";
let state;try{state=JSON.parse(localStorage.getItem(STORE_KEY)||"{}")}catch{state={}};
state={memorized:{},sim:null,essay:null,...state};
const save=()=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(state))}catch(e){console.warn("Não foi possível salvar",e)}};
function initialize(d){
 if(data===d&&bank.length)return;
 data=d;
 const a=(d?.new||[]).map(q=>({id:"NOVO-"+q.id,p:q.p,topic:q.topic||"Sem assunto",text:q.text,answer:q.answer,rule:q.rule||q.explanation||"",source:"Mapeada ao edital — autoral",section:q.section||null,page:q.page||null,level:1}));
 const old=(window.CGU_DATA?.questions||[]).map(q=>({id:"BASE-"+q.id,p:q.p,topic:q.topic||"Sem assunto",text:q.text,answer:q.answer,rule:q.explanation||"",source:"Banco anterior — autoral",section:null,page:null,level:2}));
 const seen=new Set(); bank=[];
 for(const q of [...a,...old]){const t=String(q.text||"").toLocaleLowerCase("pt-BR").replace(/\s+/g," ").trim();if(!t||seen.has(t)||!["C","E"].includes(q.answer)||!["P1","P2","P3"].includes(q.p))continue;seen.add(t);bank.push(q);}
 map=new Map(bank.map(q=>[q.id,q]));
}
const countGroup=p=>bank.filter(q=>q.p===p).length;
const tag=(p)=>`<span class="cgu-tag ${p==="P3"?"p3":""}">${p} · ${enc(parts[p])}</span>`;
const btn=(label,act,cls="")=>`<button type="button" class="cgu-btn ${cls}" data-cgu-act="${act}">${label}</button>`;
function renderList(d){initialize(d);currentPage="lista";clearInterval(liveTimer);el().innerHTML=`
<div class="cgu-lead"><div class="cgu-tag">ETAPA 1 DE 2 · DECORAR</div><h2>Lista: pergunta → CERTO ou ERRADO</h2>
<p>Leia a afirmação e memorize o julgamento correto e a regra de uma frase. A resposta está sempre à vista, do jeito que você pediu.</p>
<div class="cgu-navtabs">${btn("1. Estudar perguntas e respostas","none","prime")}${btn("2. Fazer simulado CGU","open-sim")}</div></div>
<div class="cgu-grid"><div class="cgu-metric"><b>${bank.length}</b><span>Afirmações autorais na lista</span></div><div class="cgu-metric"><b id="cguLearnTotal">${Object.keys(state.memorized).filter(id=>state.memorized[id]).length}</b><span>Marcadas como decoradas</span></div><div class="cgu-metric"><b>170</b><span>Itens na prova simulada completa</span></div></div>
<div class="cgu-panel"><b>Como estudar:</b> pergunte mentalmente “é certo ou errado?”, confira o gabarito que está logo abaixo e marque como decorada. Quando terminar a lista, vá para os simulados.</div>
<div class="cgu-filters">
<label>Prova<select data-cgu-filter="part"><option value="ALL">Todas (P1 + P2 + P3)</option><option value="P1">P1 — Básicos</option><option value="P2">P2 — Complementares</option><option value="P3">P3 — Infraestrutura</option></select></label>
<label>Resposta<select data-cgu-filter="answer"><option value="ALL">Certo e errado</option><option value="C">Somente CERTO</option><option value="E">Somente ERRADO</option></select></label>
<label>Aprendizagem<select data-cgu-filter="progress"><option value="ALL">Todas</option><option value="pending">Ainda não decorei</option><option value="learned">Já decorei</option></select></label>
<label>Banco<select data-cgu-filter="source"><option value="ALL">Tudo identificado como autoral</option><option value="mapped">Mapeadas ao edital</option><option value="older">Banco anterior</option></select></label>
<label style="min-width:170px;flex:2">Buscar palavra<select style="display:none" aria-hidden="true"></select><input type="search" data-cgu-filter="search" placeholder="DNS, LGPD, nuvem, integridade..."></label>
</div><div id="cguListResult"></div>
<div class="cgu-panel"><b>Fonte:</b> estes cartões são exercícios autorais. As questões indicadas como “banco anterior” ainda precisam de validação individual; nenhuma delas é anunciada como questão oficial Cebraspe. <a href="https://www.cebraspe.org.br/concursos/CGU_26_AFFC" target="_blank" rel="noopener">Ver edital da CGU ↗</a></div>`;
for(const n of el().querySelectorAll("[data-cgu-filter]")){if(n.tagName==="SELECT"&&n.options.length)n.value=filters[n.dataset.cguFilter]||"ALL";else if(n.tagName==="INPUT")n.value=filters.search}
refreshList();
}
function selectedList(){return bank.filter(q=>{
 const f=filters;
 if(f.part!=="ALL"&&q.p!==f.part)return false;
 if(f.answer!=="ALL"&&q.answer!==f.answer)return false;
 if(f.progress==="pending"&&state.memorized[q.id])return false;
 if(f.progress==="learned"&&!state.memorized[q.id])return false;
 if(f.source==="mapped"&&q.level!==1)return false;
 if(f.source==="older"&&q.level!==2)return false;
 if(f.search&&!(q.text+" "+q.topic+" "+q.rule).toLocaleLowerCase("pt-BR").includes(f.search.toLocaleLowerCase("pt-BR")))return false;
 return true;
})}
function refreshList(){
 const target=document.getElementById("cguListResult");if(!target)return;
 const selected=selectedList(),pages=Math.max(1,Math.ceil(selected.length/filters.perPage));
 filters.page=Math.max(1,Math.min(filters.page,pages));
 const offset=(filters.page-1)*filters.perPage;
 const visible=printing?selected:selected.slice(offset,offset+filters.perPage);
 target.innerHTML=`<div class="cgu-count"><span><b>${selected.length}</b> perguntas encontradas · ${selected.filter(q=>state.memorized[q.id]).length} decoradas · página ${filters.page}/${pages}</span>
 <div class="cgu-navtabs">${btn("Imprimir lista filtrada","print")}${btn("Ir aos simulados","open-sim","prime")}</div></div>
 <div class="cgu-list">${visible.map((q,i)=>`<article class="cgu-item ${state.memorized[q.id]?"learned":""}" data-cgu-id="${enc(q.id)}">
 <div class="cgu-qtop">${tag(q.p)}<span class="cgu-tag">#${offset+i+1}</span><span class="cgu-tag">${enc(q.source)}</span></div>
 <div class="cgu-question">${enc(q.text)}</div>
 <div class="cgu-a"><strong>RESPOSTA:</strong> <span class="cgu-tag ${q.answer==="C"?"correct":"incorrect"}">${q.answer==="C"?"CERTO":"ERRADO"}</span></div>
 <p class="cgu-explain"><b>Por quê?</b> ${enc(q.rule)}</p>
 <div class="cgu-itemfoot"><span class="cgu-muted">${enc(q.topic)}${q.section?" · Edital "+enc(q.section):""}</span>
 <button type="button" class="cgu-btn ${state.memorized[q.id]?"prime":"alt"}" data-cgu-learn="${enc(q.id)}">${state.memorized[q.id]?"✓ Decorada — desfazer":"Marcar como decorada"}</button></div></article>`).join("")||'<div class="cgu-panel">Nenhuma pergunta atende aos filtros selecionados.</div>'}</div>
 <div class="cgu-count"><div class="cgu-navtabs">${btn("← Anteriores","prev-page")}${btn("Próximas →","next-page","prime")}</div><span>Página ${filters.page} de ${pages}</span></div>`;
 const total=document.getElementById("cguLearnTotal");if(total)total.textContent=bank.filter(q=>state.memorized[q.id]).length;
}
function shufflePart(p,n){return rand(bank.filter(q=>q.p===p)).slice(0,n).map(q=>q.id)}
function newSim(){
 const lengths=["P1","P2","P3"].map(countGroup);
 if(lengths[0]<40||lengths[1]<40||lengths[2]<90){alert(`Ainda não há questões distintas suficientes: P1 ${lengths[0]}/40, P2 ${lengths[1]}/40, P3 ${lengths[2]}/90.`);return}
 if(state.sim&&!state.sim.submitted&&!confirm("Já há um simulado em andamento. Reiniciar perderá suas marcações?"))return;
 const ids=[...shufflePart("P1",40),...shufflePart("P2",40),...shufflePart("P3",90)];
 state.sim={ids,answers:{},at:0,startedAt:Date.now(),submitted:false,finishedAt:null};
 state.essay=null; save(); renderSim(data);
}
const dt=ms=>{const s=Math.max(0,Math.floor(ms/1000));return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,"0")).join(":")};
function remainingMs(){return !state.sim?duration:duration-(Date.now()-state.sim.startedAt)}
function getParts(){const sim=state.sim,result={P1:0,P2:0,P3:0,total:0,correct:0,incorrect:0,blanks:0};if(!sim)return result;
 for(const id of sim.ids){const q=map.get(id);if(!q)continue;let a=sim.answers[id]||"B";let pts=a==="B"?0:a===q.answer?weight(q.p):-weight(q.p);result[q.p]+=pts;result.total+=pts;if(a==="B")result.blanks++;else if(a===q.answer)result.correct++;else result.incorrect++}
 return result;}
function finishSim(automatic=false){const s=state.sim;if(!s||s.submitted)return;if(!automatic&&!confirm("Entregar o simulado e revelar as respostas? Você não poderá mudar suas marcações."))return;s.submitted=true;s.finishedAt=Date.now();s.automatic=automatic;save();renderSim(data)}
function renderSim(d){
 initialize(d);currentPage="simulado";clearInterval(liveTimer);
 const s=state.sim;
 if(!s){el().innerHTML=`
 <div class="cgu-lead"><span class="cgu-tag">ETAPA 2 DE 2 · SIMULADOS</span><h2>Simulado completo no formato da CGU</h2>
 <p><b>170 itens de CERTO/ERRADO</b>, organizados em P1 (40), P2 (40) e P3 (90), sem revelar respostas antes da entrega.</p>
 <div class="cgu-navtabs">${btn("← Voltar à lista para decorar","open-list")}${btn("Começar prova de 5 horas","start-sim","prime")}</div></div>
 <div class="cgu-grid"><div class="cgu-metric"><b>40</b><span>P1 · peso 1 · mínimo 8</span></div><div class="cgu-metric"><b>40</b><span>P2 · peso 1 · mínimo 12</span></div><div class="cgu-metric"><b>90</b><span>P3 · peso 2 · mínimo 54</span></div></div>
 <div class="cgu-panel"><h3>Objetiva — 5 horas</h3><p>Marque CERTO, ERRADO ou EM BRANCO. Acerto: +1 (P1/P2) ou +2 (P3); erro: −1 (P1/P2) ou −2 (P3); branco: zero. Máximo: 260 pontos.</p>
 <p><b>Critérios mínimos:</b> P1 ≥ 8, P2 ≥ 12, P3 ≥ 54 e total ≥ 78. Esses são requisitos de eliminação, não a pontuação para ser classificado entre as vagas.</p></div>
 <div class="cgu-panel"><h3>Discursiva — 3h30</h3><p>Depois da objetiva, pratique 1 questão de conhecimentos complementares (até 30 linhas, 30 pontos) e 1 situação-problema de Infraestrutura (até 60 linhas, 70 pontos). A redação não recebe nota automática fictícia.</p></div>
 <div class="cgu-panel"><b>Nota de transparência:</b> o formato segue o edital, mas as questões são <b>autorais</b> e parte foi retirada de banco anterior ainda em revisão. Não é uma prova oficial inédita do Cebraspe, nem medição confiável de sua classificação.</div>`;return;}
 if(!s.submitted&&remainingMs()<=0){finishSim(true);return}
 if(s.submitted){renderScore();return}
 const n=Math.max(0,Math.min(s.at,s.ids.length-1)),id=s.ids[n],q=map.get(id);
 if(!q){el().textContent="Questão indisponível. Retorne à lista e refaça o simulado.";return;}
 const current=s.answers[id]||"";
 const answered=s.ids.filter(x=>["C","E","B"].includes(s.answers[x])).length;
 el().innerHTML=`<div class="cgu-lead"><div class="cgu-examheader"><div><span class="cgu-tag">PROVA OBJETIVA CGU · TREINO AUTORAL</span><h2>Simulado: 170 itens</h2><p>Não há gabarito durante a prova.</p></div><div><div class="cgu-clock" id="cguTimer">${dt(remainingMs())}</div><div class="cgu-muted">Tempo restante das 5h</div></div></div></div>
 <div class="cgu-count"><b>${answered} de 170 itens marcados</b><span>Item ${n+1}/170 · ${tag(q.p)}</span></div>
 <div class="cgu-questionpane"><div class="cgu-qtop">${tag(q.p)}<span class="cgu-tag">${enc(q.topic)}</span><span class="cgu-tag">Peso ${weight(q.p)}</span></div>
 <h3>${enc(q.text)}</h3>
 <div class="cgu-choice">${[["C","CERTO"],["E","ERRADO"],["B","EM BRANCO"]].map(([v,t])=>`<button type="button" data-cgu-answer="${v}" class="${current===v?"selected":""}">${t}</button>`).join("")}</div>
 <div class="cgu-muted">Sua resposta: <b>${current==="C"?"CERTO":current==="E"?"ERRADO":current==="B"?"EM BRANCO":"não marcada"}</b></div></div>
 <div class="cgu-navtabs">${btn("← Anterior","exam-prev")}${btn("Próximo →","exam-next","prime")}${btn("Ir ao início da P1","jump-p1")}${btn("P2","jump-p2")}${btn("P3","jump-p3")}</div>
 <div class="cgu-panel"><b>Folha de respostas</b><p class="cgu-muted">Verde = respondido; contorno = item atual. Os números seguem P1 (1–40), P2 (41–80), P3 (81–170).</p>
 <div class="cgu-statusgrid">${s.ids.map((key,i)=>`<button type="button" data-cgu-goto="${i}" class="${s.answers[key]?"done":""} ${i===n?"now":""}" title="Ir ao item ${i+1}">${i+1}</button>`).join("")}</div></div>
 <div class="cgu-panel"><b>Ao terminar:</b> confira itens deixados sem marcação (também valem zero). <div class="cgu-navtabs">${btn("Entregar e corrigir a objetiva","finish-sim")}${btn("Voltar à lista (cronômetro não pausa)","open-list")}</div></div>`;
 liveTimer=setInterval(()=>{const timer=document.getElementById("cguTimer");if(!state.sim?.submitted){if(remainingMs()<=0){clearInterval(liveTimer);finishSim(true);return}if(timer)timer.textContent=dt(remainingMs())}},1000);
}
function renderScore(){
 const sc=getParts(),s=state.sim,valid=sc.P1>=cuts.P1&&sc.P2>=cuts.P2&&sc.P3>=cuts.P3&&sc.total>=cuts.total;
 el().innerHTML=`<div class="cgu-lead"><span class="cgu-tag">RESULTADO DA OBJETIVA · SIMULADO AUTORAL</span><h2>Nota líquida: ${sc.total} / 260 pontos</h2>
 <p>${s.automatic?"Tempo esgotado: a prova foi encerrada automaticamente.":"Prova encerrada e corrigida."} ${valid?"Os mínimos objetivos foram atingidos.":"Um ou mais mínimos objetivos não foram atingidos."} Isso não prevê classificação.</p></div>
 <div class="cgu-grid">${[["P1",sc.P1,40,8],["P2",sc.P2,40,12],["P3",sc.P3,180,54]].map(([p,v,max,cut])=>`<div class="cgu-metric"><b>${v}/${max}</b><span>${p} · mínimo ${cut} · ${v>=cut?"atingiu":"abaixo"}</span></div>`).join("")}</div>
 <div class="cgu-score"><b>Nota total ${sc.total} / 260 · mínimo eliminatório 78</b>
 <p>Acertos: ${sc.correct} · erros: ${sc.incorrect} · brancos ou sem resposta: ${sc.blanks}. ${valid?"Todos os quatro mínimos foram atingidos.":"Verifique os blocos abaixo do mínimo."}</p><p><b>Atenção:</b> o corte de classificação real depende da concorrência; e a discursiva ainda precisa ser avaliada.</p></div>
 <div class="cgu-navtabs">${btn("Corrigir item a item","show-review","prime")}${btn("Fazer P4 — Discursiva","start-p4")}${btn("← Lista de perguntas","open-list")}${btn("Gerar novo simulado","start-sim")}</div>
 <div id="cguReview"></div>`;
 if(s.showReview)renderReview();
}
function renderReview(){
 const s=state.sim;const out=document.getElementById("cguReview");if(!out)return;
 const ids=s.ids.filter(id=>{
 const q=map.get(id),a=s.answers[id]||"B";
 return reviewMode==="all"||reviewMode==="wrong"&&a!=="B"&&a!==q.answer||reviewMode==="blank"&&a==="B";
 });
 out.innerHTML=`<div class="cgu-panel"><h3>Gabarito explicado · ${ids.length} itens</h3><div class="cgu-navtabs">${btn("Mostrar só erros","review-wrong",reviewMode==="wrong"?"prime":"")}${btn("Mostrar brancos","review-blank",reviewMode==="blank"?"prime":"")}${btn("Todos os 170","review-all",reviewMode==="all"?"prime":"")}</div>
 ${ids.map(id=>{const q=map.get(id),n=s.ids.indexOf(id)+1,a=s.answers[id]||"B",ok=a===q.answer;
 return `<div class="cgu-review ${ok?"good":"bad"}"><span class="cgu-tag">Questão ${n} · ${q.p}</span><p><b>${enc(q.text)}</b></p><p>Gabarito: <b>${q.answer==="C"?"CERTO":"ERRADO"}</b> · Sua resposta: <b>${a==="C"?"CERTO":a==="E"?"ERRADO":"BRANCO"}</b> · <b>${a==="B"?0:ok?weight(q.p):-weight(q.p)} pt</b></p>
 <p class="cgu-rule">${enc(q.rule)}</p><span class="cgu-muted">${enc(q.source)}</span></div>`}).join("")||'<p>Não há itens neste filtro.</p>'}</div>`;
}
function startP4(){if(!state.sim?.submitted){alert("Finalize a objetiva antes de iniciar a discursiva.");return}if(!state.essay){state.essay={startedAt:Date.now(),P2:"",P3:"",done:false};save()}renderP4()}
function renderP4(){
 const v=state.essay;if(!v){renderSim(data);return}
 const q2=data.disc.find(q=>q.kind==="P2"),q3=data.disc.find(q=>q.kind==="P3");
 let left=discDuration-(Date.now()-v.startedAt);
 if(left<=0&&!v.done){v.done=true;save()}
 el().innerHTML=`<div class="cgu-lead"><span class="cgu-tag">PROVA P4 · DISCURSIVA</span><div class="cgu-examheader"><div><h2>Questão + situação-problema</h2><p>Treino escrito no formato do edital, sem nota automática.</p></div><div><div class="cgu-clock" id="cguEssayClock">${v.done?"ENCERRADA":dt(left)}</div><div class="cgu-muted">Duração: 3h30</div></div></div></div>
 ${[["P2",q2,30,30],["P3",q3,60,70]].map(([p,q,lines,points])=>`<div class="cgu-panel"><span class="cgu-tag">${p} · ${points} pontos · até ${lines} linhas</span>
 <h3>${enc(q.title)}</h3><p>${enc(q.prompt)}</p><textarea class="cgu-writing" data-cgu-write="${p}" ${v.done?"disabled":""} placeholder="Escreva aqui a sua resposta.">${enc(v[p]||"")}</textarea>
 <div class="cgu-muted">Limite oficial em linhas manuscritas: ${lines}. O campo digital não consegue equivaler exatamente às linhas da folha de respostas.</div>
 ${v.done?`<details style="margin-top:13px"><summary>Ver critérios de autoavaliação</summary><div class="cgu-rule">${(q.check||[]).map(x=>"<p>✓ "+enc(x)+"</p>").join("")}</div></details>`:""}</div>`).join("")}
 <div class="cgu-navtabs">${v.done?btn("Ver resultado da objetiva","back-score","prime"):btn("Entregar discursiva","finish-p4","prime")}${btn("Voltar ao resultado da objetiva","back-score")}</div><div class="cgu-panel">A discursiva vale até 100 pontos; o mínimo de aprovação é 50. O sistema não atribui pontuação à escrita sem correção humana.</div>`;
 if(!v.done){liveTimer=setInterval(()=>{const x=discDuration-(Date.now()-state.essay.startedAt);const t=document.getElementById("cguEssayClock");if(x<=0){clearInterval(liveTimer);state.essay.done=true;save();renderP4()}else if(t)t.textContent=dt(x)},1000)}
}
function act(n){
 if(n==="open-list"){renderList(data);return}
 if(n==="open-sim"){renderSim(data);return}
 if(n==="start-sim"){newSim();return}
 if(n==="prev-page"){filters.page=Math.max(1,filters.page-1);refreshList();return}
 if(n==="next-page"){filters.page++;refreshList();return}
 if(n==="print"){printing=true;refreshList();setTimeout(()=>{window.print();setTimeout(()=>{printing=false;refreshList()},500)},80);return}
 if(n==="exam-next"){state.sim.at=Math.min(169,state.sim.at+1);save();renderSim(data);return}
 if(n==="exam-prev"){state.sim.at=Math.max(0,state.sim.at-1);save();renderSim(data);return}
 if(n.startsWith("jump-")){state.sim.at={P1:0,P2:40,P3:80}[n.slice(5).toUpperCase()]||0;save();renderSim(data);return}
 if(n==="finish-sim"){finishSim(false);return}
 if(n==="show-review"){state.sim.showReview=true;save();renderScore();return}
 if(n.startsWith("review-")){reviewMode=n.slice(7);renderReview();return}
 if(n==="start-p4"){clearInterval(liveTimer);startP4();return}
 if(n==="back-score"){clearInterval(liveTimer);renderScore();return}
 if(n==="finish-p4"){if(confirm("Entregar a redação e visualizar o checklist?")){state.essay.done=true;save();clearInterval(liveTimer);renderP4()}return}
}
document.addEventListener("click",e=>{
 const a=e.target.closest("[data-cgu-act]");if(a){act(a.dataset.cguAct);return}
 const l=e.target.closest("[data-cgu-learn]");if(l){const id=l.dataset.cguLearn;state.memorized[id]=!state.memorized[id];save();const card=l.closest(".cgu-item");card.classList.toggle("learned",!!state.memorized[id]);l.textContent=state.memorized[id]?"✓ Decorada — desfazer":"Marcar como decorada";l.classList.toggle("prime",!!state.memorized[id]);const total=document.getElementById("cguLearnTotal");if(total)total.textContent=bank.filter(q=>state.memorized[q.id]).length;return}
 const c=e.target.closest("[data-cgu-answer]");if(c&&state.sim&&!state.sim.submitted){const qid=state.sim.ids[state.sim.at];state.sim.answers[qid]=c.dataset.cguAnswer;save();renderSim(data);return}
 const g=e.target.closest("[data-cgu-goto]");if(g&&state.sim&&!state.sim.submitted){state.sim.at=Number(g.dataset.cguGoto);save();renderSim(data);return}
});
function controlChange(e){const input=e.target.closest("[data-cgu-filter]");if(!input)return;const key=input.dataset.cguFilter;filters[key]=input.value;if(key!=="search")filters.page=1;refreshList()}
document.addEventListener("change",controlChange);
document.addEventListener("input",e=>{
 if(e.target?.matches("[data-cgu-filter='search']")){filters.search=e.target.value;filters.page=1;refreshList()}
 if(e.target?.matches("[data-cgu-write]")&&state.essay&&!state.essay.done){state.essay[e.target.dataset.cguWrite]=e.target.value;save()}
});
window.CGU_PREP={lista:renderList,simulado:renderSim,bankStats:()=>Object.fromEntries(["P1","P2","P3"].map(p=>[p,countGroup(p)]))};
})();