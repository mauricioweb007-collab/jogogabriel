/* Gera a tabela das 45 questões de Geografia (fase, mecânica, ponto de aparição) a partir dos dados do jogo.
   Uso: node src/tests/gen-tabela-geografia.cjs > saida.md */
const fs = require('fs'), path = require('path'), vm = require('vm');
const G = path.join(__dirname, '..', 'modules', 'geografia');
const ctx = { window: {}, console };
ctx.window.GEO = { data: {} }; ctx.GEO = ctx.window.GEO; ctx.GG = {};
vm.createContext(ctx);
['content/capitulos.js', 'questions/c1.js', 'questions/c2.js', 'questions/c3.js'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(G, f), 'utf8'), ctx, { filename: f }));
const D = ctx.GEO.data;
const TYPE = { mc: 'Múltipla escolha', multi: 'Várias respostas', open: 'Resposta aberta (palavras-chave) ou blocos de ideias', classify: 'Classificar em grupos', order: 'Ordenar etapas', syllables: 'Montar sílabas + origem', mappick: 'Tocar no mapa', builder: 'Montar planta', personal: 'Pessoal/rubrica (sem dados sensíveis)', steps: 'Várias etapas (tabela/mapa + escolha)' };
const out = ['| # | ID | Título | Fase (estilo) | Interação | Onde aparece |', '|---|---|---|---|---|---|'];
let n = 0;
D.stages.forEach((st) => st.questions.forEach((id) => {
  const q = D.questions.find((x) => x.id === id);
  out.push('| ' + (++n) + ' | ' + id + ' | ' + q.title + ' | ' + st.ch + '-' + st.n + ' ' + st.title + ' (' + st.style + ') | ' + (TYPE[q.type] || q.type) + ' | ' + q.where + ' |');
}));
console.log(out.join('\n'));
console.error(n + ' questões');
