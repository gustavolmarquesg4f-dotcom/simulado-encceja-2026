(()=>{'use strict';
const profile={
  name:'Gustavo',
  professionEn:'IT Project Manager and Agile Coach',
  professionPt:'Gerente de Projetos de TI e Agile Coach',
  shortIntroEn:'I am an IT project manager and Agile Coach.',
  shortIntroPt:'Eu sou gerente de projetos de TI e Agile Coach.',
  areaEn:'I lead technology projects and agile teams.',
  areaPt:'Eu lidero projetos de tecnologia e equipes ágeis.',
  experienceEn:'I have over seventeen years of experience in technology and project leadership.',
  experiencePt:'Eu tenho mais de dezessete anos de experiência em tecnologia e liderança de projetos.',
  experienceYears:'over 17 years',
  responsibilities:['technology project leadership','agile coaching','squad leadership','client and governance coordination']
};
window.EnglishOSProfile=profile;
function apply(){const g=window.EnglishOSGuided;if(!g?.modules?.length)return false;const first=g.modules[0];if(first?.phrases?.[1])first.phrases[1]=[profile.shortIntroEn,profile.shortIntroPt,'Say what you do.','Use “I am” + sua função profissional completa.'];if(first?.phrases?.[2])first.phrases[2]=[profile.areaEn,profile.areaPt,'Say what you lead.','Uma frase curta sobre sua atuação.'];if(first?.phrases?.[3])first.phrases[3]=[profile.experienceEn,profile.experiencePt,'Say how much experience you have.','Use “I have” para experiência.'];const career=g.modules.find(m=>m.title==='Entrevista — apresentação');if(career?.phrases?.[0])career.phrases[0]=['I have worked in technology and project leadership for over seventeen years.','Eu trabalho com tecnologia e liderança de projetos há mais de dezessete anos.','Summarize your experience.','Use “have worked” para trajetória.'];return true}
let tries=0;const t=setInterval(()=>{if(apply()||++tries>30)clearInterval(t)},120);apply();
})();