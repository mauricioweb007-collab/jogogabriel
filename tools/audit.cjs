/* =====================================================================
   tools/audit.js — AUDITORIA LÓGICA do projeto (roda com Node.js):
     1) matriz de cobertura: as 43 IDs existem, estão completas e cada
        uma aparece numa lição da campanha ligada a uma entidade de mapa;
     2) mapas: linhas do mesmo tamanho e todas as entidades interativas
        alcançáveis a partir da entrada (com portões abertos);
     3) requisitos por mapa (NPCs, interações, missões, minijogo, segredo,
        saída);
     4) economia: simulação dos perfis mínimo, médio e ótimo.
   Uso:  node econexus/tools/audit.cjs   (a extensão .cjs evita conflito com o package.json da raiz)
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { console, Math, JSON, Date, Set, Map, Array, Object, String, Number, performance: { now: () => 0 } };
ctx.window = ctx;
vm.createContext(ctx);
['js/core/util.js', 'js/data/glossary.js', 'js/data/items.js', 'js/data/questions.js', 'js/data/characters.js', 'js/data/lessons.js', 'js/data/mapkit.js', 'js/data/maps.js']
  .forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
const EN = ctx.EN;
const D = EN.data;
let problems = 0;
const fail = (msg) => { problems++; console.log('  ✗ ' + msg); };
const okm = (msg) => console.log('  ✓ ' + msg);
const SOLID = new Set(['t', 'y', 'q', 'k', 'b', 'o', '~', 'w', '#', 'h', 'f', 's', 'p', 'l', 'g', 'c', 'a', 'v', ' ']);
const GATES = new Set(['portao', 'ponte', 'barreira_andares', 'portao_raro']);

/* ---------------------------------------------------------------- 1 */
console.log('\n[1] Matriz de cobertura das questões do livro');
const lessonOfQ = {};
Object.values(D.lessons).forEach((l) => l.steps.forEach((s) => { if (s.q) lessonOfQ[s.q] = l.id; }));
const fields = ['id', 'region', 'map', 'where', 'entity', 'concept', 'prompt', 'main', 'answer', 'why', 'err', 'recap', 'hint1', 'hint2', 'review', 'scene', 'prep'];
D.REQUIRED_IDS.forEach((id) => {
  const q = D.questionById[id];
  if (!q) return fail(id + ' não existe');
  const miss = fields.filter((f) => !q[f]);
  if (miss.length) fail(id + ' sem campos: ' + miss.join(', '));
  const lid = lessonOfQ[id];
  if (!lid) return fail(id + ' não aparece em nenhuma lição da campanha');
  const les = D.lessons[lid];
  const reg = D.regionById[les.region];
  if (!reg.lessons.includes(lid)) fail(id + ': lição ' + lid + ' fora da missão principal');
  const ent = D.entityIndex[les.entity];
  if (!ent) fail(id + ': entidade ' + les.entity + ' não existe em nenhum mapa');
  else if (!(ent.def.lessons || []).includes(lid)) fail(id + ': entidade ' + les.entity + ' não aponta para a lição ' + lid);
  if (q.main.type === 'mc' || q.main.type === 'multi') { if (!q.main.options.some((o) => o.ok)) fail(id + ' sem alternativa correta'); }
});
const extra = D.questions.filter((q) => !D.REQUIRED_IDS.includes(q.id));
if (extra.length) fail('questões fora da lista: ' + extra.map((q) => q.id));
if (!problems) okm('43/43 questões completas, cada uma numa lição da campanha e ligada a uma entidade de mapa');

/* ---------------------------------------------------------------- 2 */
console.log('\n[2] Mapas: tamanho das linhas e alcance das entidades');
function buildMap(id) {
  const def = D.maps[id];
  const rows = def.rows || def.build();
  return rows;
}
const reachReport = {};
Object.keys(D.maps).forEach((mid) => {
  const def = D.maps[mid];
  const rows = buildMap(mid);
  const W = rows[0].length, H = rows.length;
  if (rows.some((r) => r.length !== W)) fail(mid + ': linhas com tamanhos diferentes');
  const ents = def.extra || [];
  const blocked = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return true;
    if (SOLID.has(rows[y][x])) return true;
    return ents.some((e) => e.x === x && e.y === y && e.kind !== 'pickup' && e.solid !== false && !GATES.has(e.id) && !(e.ox));
  };
  const seen = new Set();
  const q = [];
  const seed = (x, y) => { const k = x + ',' + y; if (!seen.has(k) && !blocked(x, y)) { seen.add(k); q.push([x, y]); } };
  seed(def.spawn.x, def.spawn.y);
  if (!seen.size) fail(mid + ': entrada (spawn) em tile bloqueado');
  let changed = true;
  while (changed) {
    changed = false;
    while (q.length) {
      const [x, y] = q.shift();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => seed(x + dx, y + dy));
    }
    // portais internos (mesmo mapa) levam a outras áreas
    ents.forEach((e) => {
      if (e.portal && e.portal.map === mid) {
        const adj = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((e.x + dx) + ',' + (e.y + dy)));
        const k = e.portal.x + ',' + e.portal.y;
        if (adj && !seen.has(k)) { seed(e.portal.x, e.portal.y); changed = true; }
      }
    });
  }
  const unreach = [];
  ents.forEach((e) => {
    if (e.interact === false) return;
    const reach = e.kind === 'pickup' ? seen.has(e.x + ',' + e.y) : [[1, 0], [-1, 0], [0, 1], [0, -1], [0, 0]].some(([dx, dy]) => seen.has((e.x + dx) + ',' + (e.y + dy)));
    if (!reach) unreach.push(e.id + '@' + e.x + ',' + e.y);
    if (e.kind !== 'pickup' && e.x >= 0 && rows[e.y] && SOLID.has(rows[e.y][e.x]) && e.interact !== false && e.sprite !== 'door' && !['ponto_mergulho'].includes(e.id)) fail(mid + ': entidade ' + e.id + ' sobre tile sólido ' + rows[e.y][e.x]);
    if (e.portal && e.portal.map) {
      const trows = buildMap(e.portal.map);
      const t = trows[e.portal.y] && trows[e.portal.y][e.portal.x];
      if (!t || SOLID.has(t)) fail(mid + ': portal ' + e.id + ' leva a tile sólido em ' + e.portal.map + ' (' + e.portal.x + ',' + e.portal.y + ') = "' + t + '"');
    }
  });
  if (unreach.length) fail(mid + ': inalcançáveis: ' + unreach.join(' '));
  reachReport[mid] = { W, H, reach: seen.size };
});
if (!problems) okm('todos os mapas consistentes e entidades alcançáveis');

/* ---------------------------------------------------------------- 3 */
console.log('\n[3] Requisitos de cada mapa de região');
['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'arena'].forEach((mid) => {
  const ents = D.maps[mid].extra;
  const npcs = ents.filter((e) => e.kind === 'npc').length;
  const inter = ents.filter((e) => e.info || e.talk || e.visitOnly).length;
  const mg = ents.filter((e) => e.minigame).length;
  const secret = ents.filter((e) => e.chest).length;
  const exits = ents.filter((e) => e.portal && e.portal.map === 'vila').length;
  const sides = Object.values(D.sides).filter((s) => s.region === (mid === 'arena' ? 'arena' : mid)).length;
  const line = mid + ': NPCs=' + npcs + ' interações=' + inter + ' minijogo=' + mg + ' segredo=' + secret + ' saída=' + exits + ' secundárias=' + sides + ' patches=' + (D.maps[mid].patches || []).length;
  if (npcs < 3 || inter < 6 || mg < 1 || secret < 1 || exits < 1 || sides < 2) fail(line); else okm(line);
});

module.exports = { EN, problems: () => problems };
if (require.main === module) {
  const sim = path.join(__dirname, 'economy-sim.cjs');
  if (fs.existsSync(sim)) require(sim).run(EN);
  console.log('\nResultado: ' + (problems ? problems + ' problema(s)' : 'nenhum problema encontrado'));
  process.exitCode = problems ? 1 : 0;
}
