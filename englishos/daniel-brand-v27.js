(()=>{'use strict';
const NAME='Daniel';
const PT={
  'Grace AI':'Daniel AI',
  'GRACE AI':'DANIEL AI',
  'Grace Live':'Daniel Live',
  'GRACE LIVE':'DANIEL LIVE',
  'Grace ensina':'Daniel ensina',
  'Grace conectada':'Daniel conectado',
  'Verificando a Grace':'Verificando o Daniel',
  'com a Grace':'com o Daniel',
  'Com a Grace':'Com o Daniel',
  'da Grace':'do Daniel',
  'Da Grace':'Do Daniel',
  'pela Grace':'pelo Daniel',
  'A Grace':'O Daniel',
  'a Grace':'o Daniel',
  'Grace':'Daniel',
  'Professora':'Professor',
  'professora':'professor',
  'Firme e encorajadora':'Firme e encorajador'
};
const replace=s=>{let out=String(s??'');for(const [a,b] of Object.entries(PT))out=out.split(a).join(b);return out};
function deep(v){if(typeof v==='string')return replace(v);if(Array.isArray(v))return v.map(deep);if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=deep(x);return o}return v}
function relabel(root=document.body){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(p.tagName))return NodeFilter.FILTER_REJECT;return /Grace|GRACE|Professora|encorajadora/.test(n.nodeValue||'')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});const nodes=[];while(w.nextNode())nodes.push(w.currentNode);for(const n of nodes)n.nodeValue=replace(n.nodeValue);document.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el=>{for(const a of ['placeholder','title','aria-label']){const v=el.getAttribute(a);if(v)el.setAttribute(a,replace(v))}});document.title=replace(document.title)}
function voice(){const s=document.getElementById('live2Voice');if(!s)return;if(![...s.options].some(o=>o.value==='daniel')){const o=document.createElement('option');o.value='daniel';o.textContent='Daniel';s.appendChild(o)}if(s.value!=='daniel'){s.value='daniel';s.dispatchEvent(new Event('change',{bubbles:true}))}}
const nativeFetch=window.fetch.bind(window);
window.fetch=async function(input,init={}){const url=typeof input==='string'?input:(input?.url||'');let next=init;
  if(/\/api\/tts(?:\?|$)/.test(url)&&typeof init.body==='string'){
    try{const b=JSON.parse(init.body);b.voice='daniel';if(b.text)b.text=replace(b.text);next={...init,body:JSON.stringify(b)}}catch{}
  }
  const r=await nativeFetch(input,next);
  if(/\/api\/(?:dialogue|grace)(?:\?|$)/.test(url)){
    try{const d=await r.clone().json(),body=JSON.stringify(deep(d)),h=new Headers(r.headers);h.delete('content-length');h.delete('content-encoding');h.set('content-type','application/json; charset=utf-8');return new Response(body,{status:r.status,statusText:r.statusText,headers:h})}catch{}
  }
  return r;
};
function init(){relabel();voice();const mo=new MutationObserver(m=>{let need=false;for(const x of m)if(x.type==='childList'||x.type==='characterData'){need=true;break}if(need){relabel();voice()}});mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true});setInterval(()=>{relabel();voice()},1500);window.EnglishOSTutor={name:NAME,voice:'daniel'}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
