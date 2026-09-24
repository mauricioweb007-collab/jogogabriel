/* =====================================================================
   src/tools/gen-minigames-md.cjs — gera docs/MINIGAMES-CODIGO.md com o
   CÓDIGO COMPLETO de todos os minijogos (Parque, Arcade dos Mundos,
   Ritmo Livre e Roleta), para reaproveitar em outras matérias.
   Pedido do usuário (24/09/2026). Rode de novo SEMPRE que mudar um
   minijogo:   node src/tools/gen-minigames-md.cjs
   ===================================================================== */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), SC = 'src/modules/geografia/scenes/';
const FILES = [
  ['parque.js', 'Runtime do Parque/Arcade (registro, entrada por moedas/perguntas, bilhetes, HUD, fim de jogo, recordes) + 4 jogos do Parque: Memória, Voo da Arara, Cesta da Feira, Quebra-cabeça do Brasil'],
  ['arcade1.js', 'Mundo 1: Jangada Radical (DKC/Sonic/dinossauro do Chrome), Colunas do Mosaico (Columns/Puyo), Quebra-Mosaico (Arkanoid)'],
  ['arcade2.js', 'Mundo 2: Feira Ninja (Fruit Ninja), Quermesse Tiro ao Alvo (Duck Hunt), Pega-Névoa no Arraial (acerte a toupeira)'],
  ['arcade3.js', 'Mundo 3: Estrada Brasil (Road Fighter), Invasores da Poluição (Galaga), Empilha-Prédios (Tower Bloxx)'],
  ['arcade4.js', 'Extras: Travessia do Rio (Frogger, Mundo 1) e Pinball da Floresta (Sonic Spinball, Mundo 3)'],
  ['roleta.js', 'Roleta da Sorte (prêmio do 100% de acerto; sorteia qualquer minijogo para 1 partida bônus)'],
  ['ritmolivre.js', 'Ritmo Livre: batalha de ritmo contra o GeoBot (a fase 2-3 usa a mesma mecânica em rhythm.js)']
];
let md = '# Código dos minijogos (para reaproveitar)\n\n';
md += '> Arquivo GERADO por `node src/tools/gen-minigames-md.cjs` em ' + new Date().toISOString().slice(0, 10) + '. Não edite à mão: edite os arquivos em `' + SC + '` e rode o gerador de novo.\n';
md += '> O guia de reaproveitamento (contrato, dependências e como adaptar a outra matéria) está em `jogodogabriel.md`, seção 8.8.\n\n';
md += '## Índice\n\n' + FILES.map(([f, d]) => '- [`' + f + '`](#' + f.replace('.', '') + ') — ' + d).join('\n') + '\n\n';
FILES.forEach(([f, d]) => {
  const src = fs.readFileSync(path.join(ROOT, SC, f), 'utf8');
  md += '## ' + f + '\n\n' + d + '. Caminho: `' + SC + f + '` (' + src.split('\n').length + ' linhas).\n\n```js\n' + src.replace(/\s+$/, '') + '\n```\n\n';
});
const out = path.join(ROOT, 'docs', 'MINIGAMES-CODIGO.md');
fs.writeFileSync(out, md);
console.log('Gerado: docs/MINIGAMES-CODIGO.md (' + Math.round(md.length / 1024) + ' KB, ' + FILES.length + ' arquivos)');
