# EnglishOS Pro — Grace AI

Plataforma de inglês profissional de 180 dias criada para Gustavo.

## O que existe nesta versão

- Diagnóstico inicial com gramática, escrita e fala.
- 180 aulas distintas em seis fases.
- Professora guiada em quatro etapas.
- Correção de escrita com Grace AI e modo local de reserva.
- Conversação livre em seis cenários.
- Pronúncia por reconhecimento de voz e comparação textual.
- Quatro jogos de reforço.
- Avaliações nos dias 30, 60, 90, 120, 150 e 180.
- Registro de conversas humanas e gravação semanal.
- Relatórios, memória de erros, palavras para revisão e backup.
- Tema claro confortável, alto contraste e tema escuro.

## GitHub Pages

O site estático continua funcionando no GitHub Pages. Nesse endereço, a Grace utiliza o modo local porque o GitHub Pages não executa as funções de servidor.

## Ativar a Grace AI com segurança na Vercel

1. Importe este repositório na Vercel.
2. Defina `englishos` como Root Directory.
3. Cadastre as variáveis de ambiente `OPENAI_API_KEY`, `OPENAI_MODEL`, `APP_PASSWORD` e `SESSION_SECRET`.
4. Faça o deploy.

A chave da OpenAI nunca deve ser colocada em HTML, JavaScript público, GitHub Pages ou mensagem de chat.

## Desenvolvimento local

```bash
npm install
vercel dev
```

Crie `.env.local` com base em `.env.example`.
