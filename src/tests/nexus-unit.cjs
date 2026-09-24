/* =====================================================================
   Testes de unidade (sem navegador) dos serviços da franquia:
   perfil, ponte de pontuação (idempotência, conversão, resto, sandbox),
   migração única, livro-razão/auditoria, compras, cápsula e fragmentos,
   catálogo (21 Nexóticos, raridades, poderes, JSON aprovado, pacote
   futuro fictício, conflito de IDs), SHA-256 e senha dos pais.
   Uso: PARENT_ACCESS_PASSWORD=... node src/tests/nexus-unit.cjs
   ===================================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..', '..');
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) { pass++; } else { fail++; console.log('  ✗ ' + msg); } };
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), msg + ' (esperado ' + JSON.stringify(b) + ', veio ' + JSON.stringify(a) + ')');

function mkStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), key: (i) => Array.from(m.keys())[i] || null, get length() { return m.size; }, _m: m, clear: () => m.clear() };
}
function env() {
  const window = { addEventListener() {}, __ggErrHooked: true };
  const ctx = { window, console, location: { pathname: '/x/y.html' }, localStorage: mkStorage(), sessionStorage: mkStorage(), TextEncoder, Date, Math, JSON, setInterval() {}, document: {} };
  window.localStorage = ctx.localStorage; window.sessionStorage = ctx.sessionStorage;
  vm.createContext(ctx);
  ctx.window = ctx; // window === global
  Object.assign(ctx, window);
  const load = (f) => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  ['src/core/util.js', 'src/core/storage.js', 'src/franchise/config.js', 'src/franchise/sha256.js', 'src/franchise/store.js', 'src/franchise/parent-auth.js', 'src/franchise/profile.js', 'src/franchise/catalog.js', 'src/franchise/modules.js', 'src/franchise/bridge.js', 'src/modules/registry.js', 'src/modules/modulos.js',
    'src/modules/ciencias-legacy-adapter/manifest.js', 'src/modules/geografia/manifest.js', 'src/modules/matematica/manifest.js',
    'src/modules/ciencias-legacy-adapter/nexoticos.js', 'src/modules/geografia/nexoticos.js', 'src/modules/matematica/nexoticos.js',
    'src/nexus/data/itens.js', 'src/nexus/economy.js'].forEach((f) => { if (fs.existsSync(path.join(ROOT, f))) load(f); });
  return { ctx, GG: ctx.GG, load };
}
// saves de exemplo
function cienciasSave(nDone, tier) {
  const q = {}; for (let i = 1; i <= 43; i++) q['Q' + i] = { done: i <= nDone, tier: i <= nDone ? tier : 0 };
  return { v: 1, name: 'Gabriel', updated: 1700000000000, q, crystals: ['r1'], arena: { done: false }, storyDone: false, mg: { trilha_segura: { plays: 1 } } };
}
function geoSave() {
  const q = {}; for (let i = 1; i <= 45; i++) q['G' + i] = { done: i <= 3, tier: 2 };
  return { v: 1, name: 'João', updated: 1700000000000, q, stages: { c1s1: { done: true }, c1s5: { done: true } }, chaptersDone: [], finalDone: false, unlockedBonus: [] };
}

console.log('— SHA-256 e senha');
{
  const { GG } = env();
  ['', 'abc', 'João é ÓTIMO 🚀', 'x'.repeat(200)].forEach((s) => eq(GG.sha256(s), crypto.createHash('sha256').update(Buffer.from(s, 'utf8')).digest('hex'), 'sha256 igual ao Node para "' + s.slice(0, 12) + '"'));
  const pw = process.env.PARENT_ACCESS_PASSWORD;
  if (pw) {
    ok(GG.parentAuth.login(pw).ok, 'senha correta entra');
    ok(GG.parentAuth.active(), 'sessão ativa após login');
    GG.parentAuth.logout();
    ok(!GG.parentAuth.active(), 'logout encerra sessão');
  } else console.log('  (defina PARENT_ACCESS_PASSWORD para testar a senha correta)');
  ok(!GG.parentAuth.login('errada').ok, 'senha incorreta não entra');
  for (let i = 0; i < 6; i++) GG.parentAuth.login('errada' + i);
  ok(GG.parentAuth.lockedFor() > 0, 'várias falhas geram espera curta');
  const src = fs.readFileSync(path.join(ROOT, 'src/franchise/parent-auth.js'), 'utf8');
  ok(!pw || !src.includes(pw), 'senha não aparece em texto puro no código');
}

console.log('— Nome e perfil único');
{
  const { GG, ctx } = env();
  eq(GG.profile.normalizeName('  joão   da  silva '), 'JOÃO DA SILVA', 'normaliza espaços e mantém acentos');
  eq(GG.profile.normalizeName('João'), 'JOÃO', 'NFC (acento combinado vira Ã)');
  const p1 = GG.profile.load();
  GG.profile.setName('gabriel');
  GG.profile.setName('Gabi');
  const p2 = GG.profile.load();
  eq(p2.profileId, p1.profileId, 'trocar o nome mantém o mesmo perfil');
  eq(p2.displayNameUppercase, 'GABI', 'nome exibido em maiúsculas');
  const keys = []; for (let i = 0; i < ctx.localStorage.length; i++) keys.push(ctx.localStorage.key(i));
  eq(keys.filter((k) => /^ecoNexus\.franchise\.v1$/.test(k)).length, 1, 'existe um único perfil infantil');
}

console.log('— Ponte: idempotência, conversão, resto, migração única');
{
  const { GG, ctx } = env();
  ctx.localStorage.setItem('econexus_guardioes_save_v1', JSON.stringify(cienciasSave(3, 1)));
  const before = ctx.localStorage.getItem('econexus_guardioes_save_v1');
  const r1 = GG.bridge.sync();
  // 3 questões × (40+30+30) + 1 cristal (200) = 500
  eq(r1.points, 500, 'importação inicial soma os pontos do save de Ciências');
  eq(r1.coins, 50, '10 pontos = 1 moeda');
  eq(r1.migrated.length, 1, 'marca de migração criada');
  const r2 = GG.bridge.sync();
  eq(r2.points, 0, 'segunda sincronização (recarregar) não soma de novo');
  eq(r2.migrated.length, 0, 'importação não se repete');
  eq(ctx.localStorage.getItem('econexus_guardioes_save_v1'), before, 'save original de Ciências não é alterado');
  let p = GG.profile.load();
  const ev = GG.bridge.makeEvent(p, 'geografia', { sourceType: 'question', sourceId: 'X1', scoreEarned: 37 });
  ok(GG.bridge.apply(p, ev).applied, 'evento novo aplicado');
  ok(!GG.bridge.apply(p, ev).applied, 'mesmo eventId não soma duas vezes');
  eq(p.careerPoints, 537, 'pontuação acumulada');
  eq(p.conversionRemainder, 7, 'resto da conversão preservado');
  eq(p.nexusCoins, 53, 'moedas com resto acumulado');
  const ev2 = GG.bridge.makeEvent(p, 'geografia', { sourceType: 'question', sourceId: 'X2', scoreEarned: 5 });
  GG.bridge.apply(p, ev2);
  eq([p.nexusCoins, p.conversionRemainder], [54, 2], 'resto 7 + 5 = 1 moeda e resto 2');
  eq(GG.bridge.audit(p), [], 'livro-razão confere com os totais');
  ok(GG.bridge.spend(p, 20, 'compra-1').ok, 'compra com saldo');
  eq(p.careerPoints, 542, 'comprar NÃO reduz a Pontuação de Carreira');
  ok(GG.bridge.spend(p, 20, 'compra-1').repeated, 'mesma compra (txnId) não cobra de novo');
  eq(p.nexusCoins, 34, 'saldo após 1 compra');
  ok(!GG.bridge.spend(p, 999, 'compra-2').ok, 'sem saldo negativo');
  ok(p.nexusCoins >= 0, 'saldo nunca negativo');
  eq(GG.bridge.audit(p), [], 'auditoria após compras');
  const bad = Object.assign({}, ev, { eventId: 'geografia:question:T', testMode: true });
  ok(!GG.bridge.apply(p, bad).applied, 'evento testMode recusado no perfil real');
  const bad2 = Object.assign({}, ev, { eventId: 'geografia:question:Z', scoreEarned: 1.5 });
  ok(!GG.bridge.apply(p, bad2).applied, 'pontuação não inteira é recusada');
  const bad3 = Object.assign({}, ev, { eventId: 'geografia:question:W', moduleId: 'hacker' });
  ok(!GG.bridge.apply(p, bad3).applied, 'módulo não registrado é recusado');
  // fila (outbox) sem duplicar
  const ev4 = GG.bridge.makeEvent(GG.profile.load(), 'geografia', { sourceType: 'mission', sourceId: 'fila-1', scoreEarned: 10 });
  GG.bridge.submit(ev4); GG.bridge.submit(ev4);
  eq(GG.bridge.sync().points, 10, 'fila processada uma vez');
  GG.bridge.submit(ev4);
  eq(GG.bridge.sync().points, 0, 'evento reenviado pela fila não duplica');
  // melhoria de desempenho soma só o que faltava
  ctx.localStorage.setItem('econexus_guardioes_save_v1', JSON.stringify(cienciasSave(4, 1)));
  eq(GG.bridge.sync().points, 100, 'questão nova soma só uma vez');
  // Geografia
  ctx.localStorage.setItem('ecoNexus.geografia.v1', JSON.stringify(geoSave()));
  const rg = GG.bridge.sync();
  eq(rg.points, 3 * 70 + 200 + 500, 'Geografia: 3 questões (sem guia) + fase + chefe');
  ok(rg.minigames.includes('geografia_c1s1') && rg.minigames.includes('geografia_c1s5'), 'fases concluídas liberam o minigame no Fliperama');
  ok(!GG.profile.load().unlockedMinigames.geografia_c1s2, 'fase não concluída não aparece');
  ok(GG.profile.load().unlockedMinigames.ciencias_trilha_segura, 'minijogo jogado em Ciências aparece');
  eq(GG.bridge.audit(GG.profile.load()), [], 'auditoria final');
}

console.log('— Sandbox dos pais');
{
  const { GG, ctx } = env();
  ctx.localStorage.setItem('econexus_guardioes_save_v1', JSON.stringify(cienciasSave(2, 1)));
  GG.bridge.sync();
  const snapshot = ctx.localStorage.getItem('ecoNexus.franchise.v1');
  const pw = process.env.PARENT_ACCESS_PASSWORD;
  if (pw) {
    GG.parentAuth.login(pw); GG.testMode.start();
    ok(GG.testMode.active(), 'modo de teste ativo');
    const sp = GG.profile.load();
    ok(sp.testMode && sp.isolated && sp.allContentUnlocked, 'perfil sandbox isolado e com tudo liberado');
    ok(sp.profileId !== JSON.parse(snapshot).profileId, 'sandbox tem outro profileId');
    GG.bridge.credit(sp, 500, 'sim-1'); GG.profile.save(sp);
    const e = GG.bridge.makeEvent(sp, 'ciencias', { sourceType: 'question', sourceId: 'SIM', scoreEarned: 100 });
    ok(e.testMode === true, 'evento do sandbox leva testMode:true');
    ok(GG.bridge.apply(sp, e).applied, 'sandbox aceita evento de teste');
    GG.profile.save(sp);
    GG.testMode.stop();
    eq(ctx.localStorage.getItem('ecoNexus.franchise.v1'), snapshot, 'perfil real idêntico após usar o sandbox');
    const realP = GG.profile.load();
    ok(!GG.bridge.credit(realP, 10, 'x').ok, 'crédito manual recusado no perfil real');
    GG.parentAuth.login(pw); GG.testMode.start();
    ok(GG.testMode.resetSandbox() > 0, 'reiniciar só o sandbox');
    GG.testMode.stop();
    eq(ctx.localStorage.getItem('ecoNexus.franchise.v1'), snapshot, 'reiniciar sandbox não mexe no real');
  } else console.log('  (defina PARENT_ACCESS_PASSWORD para testar o sandbox)');
  // sem sessão, o modo de teste não liga
  GG.parentAuth.logout();
  ctx.sessionStorage.setItem('ecoNexus.teste.ativo', '1');
  ok(!GG.testMode.active(), 'modo de teste exige sessão dos pais');
}

console.log('— Catálogo');
{
  const { GG, ctx, load } = env();
  const L = GG.catalog.list;
  eq(L.length, 21, 'exatamente 21 Nexóticos');
  eq(L.filter((c) => c.world === 'ciencias').length, 10, '10 de Ciências');
  eq(L.filter((c) => c.world === 'geografia').length, 10, '10 de Geografia');
  eq(L.filter((c) => c.world === 'matematica').map((c) => c.id), ['matematica_gato_grafico'], 'Matemática: só o Gato Gráfico');
  ['ciencias', 'geografia'].forEach((w) => GG.FR.rarities.forEach((r) => eq(L.filter((c) => c.world === w && c.rarity === r.id).length, 2, w + ' tem 2 ' + r.label)));
  eq(GG.catalog.get('matematica_gato_grafico').rarity, 'comum', 'Gato Gráfico é Comum');
  eq(new Set(L.map((c) => c.power.id)).size, 21, 'cada um tem poder exclusivo');
  eq(GG.catalog.errors, [], 'nenhum erro de validação');
  const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/nexus/catalogo/catalogo_nexoticos.json'), 'utf8'));
  J.characters.forEach((j) => {
    const c = GG.catalog.get(j.id);
    ok(!!c, 'JSON aprovado: ' + j.id + ' existe');
    if (!c) return;
    ok(c.name === j.name && c.world === j.moduleId && c.rarity === j.rarity && c.power.id === j.power.id && c.power.scope === j.power.scope && c.power.description === j.power.description && c.alt === j.alt, j.id + ' igual ao JSON aprovado');
    ok(path.basename(j.asset) === c.asset, j.id + ' usa o arquivo do pacote');
    ok(fs.existsSync(path.join(ROOT, c.assetUrl)), j.id + ' asset existe');
  });
  const REQ = ['id', 'name', 'world', 'rarity', 'visual', 'personality', 'idle', 'celebrate', 'sound', 'unlock', 'power', 'asset', 'alt'];
  L.forEach((c) => REQ.forEach((k) => ok(c[k] != null && c[k] !== '', c.id + ' tem ' + k)));
  L.forEach((c) => ok(!/resposta|gabarito/i.test(c.power.description) || /nunca|sem ajudar/i.test(c.power.description), c.power.id + ' não revela respostas'));
  // pacote futuro fictício
  const n = GG.catalog.registerPack({ packId: 'historia-v1', version: '1.0.0', world: 'historia', base: 'src/modules/historia/nexoticos/', characters: [
    { id: 'historia_tatu_tempo', name: 'Tatu do Tempo', world: 'historia', rarity: 'raro', visual: 'v', personality: 'p', idle: 'bob', celebrate: 'jump', sound: { wave: 'sine', notes: [440], dur: 0.1 }, unlock: [{ type: 'shop', price: 100 }], power: { id: 'relogio', name: 'Relógio', type: 'slow_obstacles', params: { percent: 10, seconds: 1 }, description: 'd' }, asset: 'x.png', alt: 'a' },
    { id: 'ciencias_microbio_miojo', name: 'Clone', world: 'historia', rarity: 'comum', visual: 'v', personality: 'p', idle: 'bob', celebrate: 'jump', sound: {}, unlock: [], power: { id: 'x', name: 'x', type: 'shield', params: { hits: 1 }, description: 'd' }, asset: 'y.png', alt: 'a' }
  ] });
  eq(n, 1, 'pacote futuro registrado sem alterar o núcleo');
  eq(GG.catalog.list.length, 22, 'catálogo cresce (append-only)');
  eq(GG.catalog.get('ciencias_microbio_miojo').name, 'Micróbio Miojo', 'conflito de ID não substitui o original');
  ok(GG.catalog.errors.length >= 1, 'conflito de ID registrado como erro');
  ok(GG.catalog.fallback(GG.catalog.get('historia_tatu_tempo')).startsWith('data:image/svg'), 'reserva visual para asset ausente');
  // save antigo sem campos novos continua válido
  ctx.localStorage.setItem('ecoNexus.franchise.v1', JSON.stringify({ schemaVersion: 1, profileId: 'antigo', careerPoints: 10, nexusCoins: 1, conversionRemainder: 0 }));
  const p = GG.profile.load();
  ok(p.profileId === 'antigo' && p.collectibles && p.arcade && p.careerPoints === 10, 'perfil antigo recebe campos novos sem perder dados');
}

console.log('— Economia do Nexus (loja, cápsula, fragmentos)');
{
  const { GG, ctx } = env();
  if (!GG.nexusEco) { console.log('  (economia do Nexus ainda não existe)'); }
  else {
    ctx.localStorage.setItem('econexus_guardioes_save_v1', JSON.stringify(cienciasSave(43, 1)));
    GG.bridge.sync();
    let p = GG.profile.load();
    const coins0 = p.nexusCoins, career0 = p.careerPoints;
    const item = GG.NEXUS_ITEMS.find((i) => i.price > 0 && i.price <= coins0);
    const r = GG.nexusEco.buyItem(item.id, 'txn-a');
    ok(r.ok, 'compra de item');
    const r2 = GG.nexusEco.buyItem(item.id, 'txn-a');
    p = GG.profile.load();
    eq(p.nexusCoins, coins0 - item.price, 'recarregar/repetir não cobra duas vezes');
    ok(!!p.inventory[item.id], 'item comprado persiste');
    eq(p.careerPoints, career0, 'carreira intacta após compra');
    const buyable = GG.catalog.list.find((c) => !p.collectibles[c.id] && c.unlock.some((u) => u.type === 'shop'));
    if (buyable) {
      const before = GG.profile.load().nexusCoins;
      const rc = GG.nexusEco.buyChar(buyable.id, 'txn-c');
      ok(rc.ok || /Faltam/.test(rc.why || ''), 'compra de personagem avaliada');
    }
    // duplicata na cápsula vira fragmentos
    const fr0 = GG.profile.load().fragments;
    const res = [];
    for (let i = 0; i < 12; i++) { const c = GG.nexusEco.capsule('cap-' + i); if (c.ok) res.push(c); }
    ok(res.length > 0, 'cápsula funciona com moedas');
    ok(res.some((x) => x.duplicate || x.fragmentsOnly) ? GG.profile.load().fragments > fr0 : true, 'duplicata vira fragmentos');
    const rep = GG.nexusEco.capsule('cap-0');
    ok(rep.repeated, 'mesma cápsula (txnId) não repete ao recarregar');
    eq(GG.bridge.audit(GG.profile.load()), [], 'auditoria com loja e cápsula');
    ok(GG.profile.load().nexusCoins >= 0, 'saldo nunca negativo');
  }
}

console.log('\n' + pass + ' ok, ' + fail + ' falhas');
process.exit(fail ? 1 : 0);
