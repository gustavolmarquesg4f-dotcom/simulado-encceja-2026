(async()=>{
  try{
    const files=Array.from({length:13},(_,i)=>`bundle/bundle-${String(i).padStart(2,'0')}.js?v=7`);
    const parts=await Promise.all(files.map(async file=>{
      const response=await fetch(file,{cache:'no-store'});
      if(!response.ok) throw new Error(`Não consegui carregar ${file}.`);
      return response.text();
    }));
    const script=document.createElement('script');
    script.textContent=parts.join('');
    document.body.appendChild(script);
  }catch(error){
    console.error(error);
    const line=document.getElementById('accessError');
    if(line) line.textContent='A atualização da Grace não carregou. Atualize com Ctrl + F5.';
  }
})();
