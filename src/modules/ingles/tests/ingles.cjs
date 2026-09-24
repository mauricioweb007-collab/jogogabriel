/* =====================================================================
   tests/ingles.cjs — TESTES DO MÓDULO DE INGLÊS (Expresso dos Sonhos).
   1) Conteúdo (sem navegador): 11 páginas, todas as seções do livro no
      jogo, cada gabarito aceito pelo corretor, erros típicos recusados
      (palavras essenciais), respostas pessoais coerentes aceitas.
   2) Campanha no navegador (perfil “otimo” ou “erros”): lançador →
      3 atos → Passagem de Volta, com minijogos jogados de verdade;
      salvar/continuar no ponto exato; pontos no perfil uma única vez.
   3) Área dos Pais: extras do manifesto abrem no SANDBOX sem erros, o
      painel de Inglês mostra a matriz e o save real não muda.
   4) Replay do Fliperama: resultado vai para a caixa, sem pontos.
   Uso: node src/modules/ingles/tests/ingles.cjs [otimo|erros]
   ===================================================================== */
const path = require('path');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const ROOT = path.join(__dirname, '..', '..', '..', '..');
const url = (f) => 'file://' + path.join(ROOT, f);
const MODE = process.argv[2] || 'otimo';
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };

/* ================================================================ 1) conteúdo */
function content() {
  console.log('1) Conteúdo e corretor');
  global.window = {};
  require('../content/banco.js'); require('../content/atos.js');
  const C = require('../systems/checker.js'); const D = window.ING.data;
  const pages = new Set(D.questions.map((q) => q.page));
  ok(pages.size === 11, '11 páginas do PDF com questões (' + [...pages].join(',') + ')');
  const secs = new Set(D.questions.map((q) => q.page + '-' + q.sec));
  const inAct = new Set(); D.acts.forEach((a) => a.steps.forEach((s) => { if (s.type === 'block') inAct.add(s.page + '-' + s.sec); }));
  ok([...secs].every((s) => inAct.has(s)), 'todas as ' + secs.size + ' seções do livro estão na campanha');
  ok(D.core.length >= 50 && D.core.length <= 70, 'campanha curta: ' + D.core.length + ' questões (extras opcionais: ' + (D.questions.length - D.core.length) + ')');
  const allIds = new Set(); D.acts.forEach((a) => a.steps.forEach((s) => { if (s.type === 'block') s.all.forEach((id) => allIds.add(id)); }));
  ok(D.questions.every((q) => allIds.has(q.id)), 'toda questão tem fase (campanha ou extra do mesmo ato)');
  ok(new Set(D.questions.map((q) => q.id)).size === D.questions.length, 'IDs únicos (' + D.questions.length + ')');
  const games = D.acts.flatMap((a) => a.steps.filter((s) => s.type === 'game'));
  ok(games.length === 3, 'só 3 minijogos na campanha');
  let bad = [];
  D.questions.forEach((q) => { const v = q.input === 'fill' ? q.blanks.map((b) => b[0]) : q.input === 'order' ? q.order : C.model(q); if (!C.check(q, v).ok) bad.push(q.id); });
  ok(!bad.length, 'todo gabarito é aceito' + (bad.length ? ': ' + bad.join(',') : ''));
  bad = [];
  D.questions.forEach((q) => { if (q.personal || q.target) return; const v = q.input === 'fill' ? q.blanks.map(() => 'xyz') : q.input === 'order' ? q.items : 'xyz'; if (C.check(q, v).ok) bad.push(q.id); });
  ok(!bad.length, 'resposta errada é recusada em todas' + (bad.length ? ': ' + bad.join(',') : ''));
  const Q = (id) => D.byId(id);
  const t = (id, v, exp, msg) => { const r = C.check(Q(id), v); ok(r.ok === exp && (!msg || new RegExp(msg).test(r.msg || '')), id + ' “' + v + '” → ' + (r.ok ? 'aceita' : 'recusa: ' + (r.msg || '').replace(/\*\*/g, ''))); };
  t('ING-P7-IN-1', 'She would like to go to the water park?', false, 'começo');
  t('ING-P7-IN-2', 'Would John like be a pilot?', false, 'Falta a palavra \\*\\*to\\*\\*');
  t('ING-P7-IN-6', '  would   they like to go by plane  ', true);
  t('ING-P10-NG-3', 'John and Linda would not help mom.', true);
  t('ING-P10-NG-3', 'John and Linda would help mom.', false, 'wouldn');
  t('ING-P1-LT-1', 'No, I wouldn’t.', true);
  t('ING-P1-LT-1', 'yes', false, 'só');
  t('ING-P1-LT-8', 'Yes, I do.', true);
  t('ING-P5-LT-2', 'I would like to be a veterinarian.', true);
  t('ING-P5-LT-2', 'I would like be a pilot', false, 'to');
  t('ING-P1-LT-3', 'I would like to go to the water park.', true);
  t('ING-P1-MT-6', 'laundromatt', true);
  t('ING-P1-MT-3', 'kart', false);
  t('ING-P2-WS-1', 'I would like to go to the space museum.', true);
  t('ING-P2-WS-1', 'space museum', false, 'frase');
  t('ING-P6-CP-2', ['would you'], false, 'like');
  t('ING-P11-CW-2', ['TV', 'baseball player'], true);
  ok(C.hint(Q('ING-P1-GI-6'), 1).includes('1 palavra'), 'dica 1 mostra quantidade de palavras e 1ª letra');
  ok(/embaralhadas/.test(C.hint(Q('ING-P1-GI-6'), 2)), 'dica 2 embaralha as letras');
  ok(/estrutura/.test(C.hint(Q('ING-P7-IN-1'), 2)), 'dica 2 de frase mostra a estrutura com lacunas');
  ok(C.options(Q('ING-P1-GI-6'))[0].includes('under'), 'alternativas incluem a resposta certa');
  delete global.window;
}

/* ================================================================ 2) campanha no navegador */
const session = () => { sessionStorage.setItem('ecoNexus.pais.sessao', JSON.stringify({ start: Date.now(), last: Date.now() })); sessionStorage.setItem('ecoNexus.teste.ativo', '1'); };
async function answer(p, wrongFirst) {
  const id = await p.getAttribute('.qcard', 'data-q');
  const q = await p.evaluate((id) => { const q = ING.data.byId(id); return { input: q.input, n: q.input === 'fill' ? q.blanks.length : 1, model: q.input === 'fill' ? q.blanks.map((b) => b[0]) : ING.check.model(q), order: q.order }; }, id);
  if (q.input === 'order') {
    if (wrongFirst) { await p.click('.q-go'); await p.waitForTimeout(80); }
    await p.evaluate((order) => { for (let k = 0; k < 80; k++) { const lis = [...document.querySelectorAll('.q-order li')]; const txt = lis.map((l) => l.querySelector('.on').textContent); const i = txt.findIndex((x, j) => x !== order[j]); if (i < 0) return; const j = txt.indexOf(order[i]); lis[j].querySelectorAll('button')[1].click(); } }, q.order);
  } else {
    if (wrongFirst) {
      const ins = await p.$$('.q-in'); for (const i of ins) await i.fill('xyz'); await p.click('.q-go'); await p.waitForTimeout(60);
    }
    const ins = await p.$$('.q-in:not([disabled])');
    const vals = Array.isArray(q.model) ? q.model : [q.model];
    for (let k = 0; k < ins.length; k++) await ins[k].fill(String(vals[k] == null ? vals[0] : vals[k]));
  }
  await p.click('.q-go'); await p.waitForTimeout(60);
  const done = await p.$('.q-fb.good');
  if (!done) return { id, ok: false };
  await p.click('.q-go'); await p.waitForTimeout(60);
  return { id, ok: true };
}
async function solveAssoc(p) {
  const n = await p.$$eval('.as-c', (e) => e.length);
  const known = {}; // palavra → [índices vistos]
  const label = async (i) => (await p.getAttribute('.as-c[data-i="' + i + '"]', 'aria-label')) || '';
  const done = async (i) => p.$eval('.as-c[data-i="' + i + '"]', (e) => e.classList.contains('ok'));
  for (let i = 0; i < n; i++) {
    if (await done(i)) continue;
    await p.click('.as-c[data-i="' + i + '"]'); const la = await label(i); const w = la.split(': ')[1]; const kind = la.split(':')[0];
    const partner = (known[w] || []).find((x) => x.kind !== kind);
    if (partner) { await p.click('.as-c[data-i="' + partner.i + '"]'); await p.waitForTimeout(40); continue; }
    (known[w] = known[w] || []).push({ i, kind });
    let j = i + 1; while (j < n && ((await done(j)) || Object.values(known).some((l) => l.some((x) => x.i === j)))) j++;
    if (j >= n) continue;
    await p.click('.as-c[data-i="' + j + '"]'); const lb = await label(j); const w2 = lb.split(': ')[1]; const k2 = lb.split(':')[0];
    if (w2 === w && k2 !== kind) { await p.waitForTimeout(40); continue; }
    (known[w2] = known[w2] || []).push({ i: j, kind: k2 });
    await p.waitForTimeout(950);
    const pr = (known[w2] || []).find((x) => x.kind !== k2);
    if (pr) { await p.click('.as-c[data-i="' + j + '"]'); await p.click('.as-c[data-i="' + pr.i + '"]'); await p.waitForTimeout(40); }
  }
  await p.waitForTimeout(700);
}
async function writeGame(p) {
  const src = await p.getAttribute('.mg-write .ill', 'src');
  const w = await p.evaluate((src) => { const n = src.split('/').pop().replace('.png', ''); for (const g of Object.values(ING.data.games)) { const f = (g.set || []).find((x) => x[1] === n); if (f) return f[0]; } return ''; }, src);
  await p.fill('.mg-write .q-in', w); await p.click('.mg-write .q-go'); await p.waitForTimeout(1000);
}
async function solveCaca(p) {
  const place = await p.evaluate(() => ING.mg._caca.place);
  for (const w of Object.keys(place)) { const c = place[w]; await p.click('.ws-c[data-x="' + c.x0 + '"][data-y="' + c.y0 + '"]'); await p.click('.ws-c[data-x="' + (c.x0 + c.dx * (w.length - 1)) + '"][data-y="' + (c.y0 + c.dy * (w.length - 1)) + '"]'); await p.waitForTimeout(60); }
  await p.waitForTimeout(900);
}
/** Joga até a condição stop() ou um limite de passos. Retorna questões respondidas. */
async function drive(p, stop, opts) {
  opts = opts || {}; const seen = new Set(); let n = 0;
  for (let k = 0; k < 900; k++) {
    if (await stop()) return n;
    if (await p.$('.dlg')) { await p.click('.dlg .btn.pri'); await p.waitForTimeout(40); continue; }
    if (await p.$('.q-scr .qcard')) {
      const id = await p.getAttribute('.qcard', 'data-q');
      if (opts.limitQ && n >= opts.limitQ) return n;
      const r = await answer(p, opts.wrong && !seen.has(id) && n % 4 === 0); seen.add(id); if (r.ok) n++; else { console.log('    falhou', id); return n; }
      continue;
    }
    if (await p.$('.les-scr')) { while (await p.$('text=Continuar a história')) await p.click('text=Continuar a história'); await p.click('text=Entendi'); continue; }
    if (await p.$('.mg-intro')) { await p.click('.mg-intro .btn.go'); await p.waitForTimeout(80); continue; }
    if (await p.$('.mg-assoc')) { await solveAssoc(p); continue; }
    if (await p.$('.mg-write')) { await writeGame(p); continue; }
    if (await p.$('.mg-caca')) { await solveCaca(p); continue; }
    if (await p.$('.mg-end')) { await p.click('.mg-end .btn.pri'); await p.waitForTimeout(60); continue; }
    if (await p.$('.tk-scr')) { await p.click('.tk-scr .btn.pri'); await p.waitForTimeout(60); continue; }
    if (await p.$('.modal-wrap .btn.pri')) { await p.click('.modal-wrap .btn.pri'); continue; }
    await p.waitForTimeout(100);
  }
  return n;
}

(async () => {
  content();
  const t0 = Date.now();
  const br = await pw.chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1366, height: 768 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  console.log('2) Campanha (' + MODE + ')');
  await p.goto(url('inicio.html')); await p.waitForTimeout(500);
  if (await p.$('#login:not(.hide)')) { await p.fill('#lgName', 'Gabriel'); await p.click('.lg-go'); await p.waitForTimeout(500); }
  const others = await p.evaluate(() => ['ecoNexus.geografia.v1'].map((k) => localStorage.getItem(k)));
  ok(await p.$('text=Gabriel e o Expresso dos Sonhos') != null, 'lançador mostra o cartão de Inglês');
  await p.click('.ln-card:has-text("Expresso") .btn.go'); await p.waitForTimeout(900);
  ok(/ingles\/jogar\.html/.test(p.url()), 'o cartão abre o módulo de Inglês separado');
  // ato 1 até a metade → recarrega → continua do mesmo ponto
  await drive(p, async () => !!(await p.$('.map-scr')) && !(await p.$('.dlg')), {});
  await p.click('.st-card >> nth=0'); await p.waitForTimeout(200);
  let n1 = await drive(p, async () => false, { limitQ: 5, wrong: MODE === 'erros' });
  const before = await p.evaluate(() => ({ id: document.querySelector('.qcard') && document.querySelector('.qcard').dataset.q, s: JSON.parse(localStorage.getItem('ecoNexus.ingles.v1')).acts.a1 }));
  await p.reload(); await p.waitForTimeout(800);
  await p.click('.st-card >> nth=0'); await p.waitForTimeout(300);
  const after = await p.evaluate(() => document.querySelector('.qcard') && document.querySelector('.qcard').dataset.q);
  ok(after === before.id, 'continua exatamente na mesma questão depois de recarregar (' + before.id + ', passo ' + before.s.step + ')');
  for (const i of [0, 1, 2]) {
    if (i) { await p.click('.st-card >> nth=' + i); await p.waitForTimeout(200); }
    n1 += await drive(p, async () => !!(await p.$('.map-scr')) && !(await p.$('.dlg')), { wrong: MODE === 'erros' });
    const sv = await p.evaluate((i) => { const S = JSON.parse(localStorage.getItem('ecoNexus.ingles.v1')); return { done: S.acts['a' + (i + 1)].done, t: S.tickets.length }; }, i);
    ok(sv.done && sv.t === i + 1, 'ato ' + (i + 1) + ' concluído e bilhete ' + (i + 1) + '/3 salvo');
  }
  await p.click('.st-card.fin'); await p.waitForTimeout(200);
  n1 += await drive(p, async () => !!(await p.$('.end-scr')), { wrong: MODE === 'erros' });
  const S = await p.evaluate(() => JSON.parse(localStorage.getItem('ecoNexus.ingles.v1')));
  const coreDone = await p.evaluate(() => ING.data.core.filter((id) => JSON.parse(localStorage.getItem('ecoNexus.ingles.v1')).q[id].done).length);
  ok(coreDone === 61, 'todas as 61 questões da campanha concluídas (' + coreDone + ')');
  ok(S.finalDone && S.tickets.length === 3, 'Passagem de Volta concluída com os 3 bilhetes');
  ok(Object.keys(S.mg).length === 3, 'os 3 minijogos foram jogados');
  const tiers = Object.values(S.q).filter((x) => x.done).map((x) => x.tier);
  ok(MODE === 'otimo' ? tiers.every((t) => t === 1) : tiers.some((t) => t === 2), MODE === 'otimo' ? 'tudo de primeira no perfil ótimo' : 'erros viram nível 2 (dica/2ª tentativa)');
  ok(Object.values(S.q).some((x) => x.typed.length), 'o save guarda o que a criança digitou');
  // pontos no perfil (uma única vez)
  await p.goto(url('inicio.html')); await p.waitForTimeout(800);
  const pts = await p.evaluate(() => { const P = JSON.parse(localStorage.getItem('ecoNexus.franchise.v1')); const L = P.scoreLedger.filter((e) => e.moduleId === 'ingles'); return { n: L.length, sum: L.reduce((a, e) => a + e.points, 0), ids: new Set(L.map((e) => e.eventId)).size }; });
  ok(pts.n > 0 && pts.ids === pts.n, 'pontos de Inglês no perfil global: ' + pts.sum + ' em ' + pts.n + ' eventos, sem duplicar');
  await p.reload(); await p.waitForTimeout(800);
  const pts2 = await p.evaluate(() => JSON.parse(localStorage.getItem('ecoNexus.franchise.v1')).scoreLedger.filter((e) => e.moduleId === 'ingles').length);
  ok(pts2 === pts.n, 'recarregar não soma pontos de novo');
  const card = await p.textContent('.ln-card:has-text("Expresso")');
  ok(/100% concluído/.test(card) && /3 de 3 bilhetes/.test(card), 'lançador mostra 100% e 3 bilhetes');
  const others2 = await p.evaluate(() => ['ecoNexus.geografia.v1'].map((k) => localStorage.getItem(k)));
  ok(JSON.stringify(others) === JSON.stringify(others2), 'save de Geografia não mudou');
  ok(Date.now() - t0 > 0, 'questões respondidas pelo robô: ' + n1);

  /* ================================================================ 3) Área dos Pais */
  console.log('3) Área dos Pais');
  const real = await p.evaluate(() => localStorage.getItem('ecoNexus.ingles.v1'));
  await p.evaluate(session);
  await p.goto(url('src/pais/pais.html#teste')); await p.waitForTimeout(1200);
  const opts = await p.$$eval('select[aria-label^="Minijogos e telas de Inglês"] option', (o) => o.map((x) => x.textContent));
  const man = await p.evaluate(() => window.ING_MANIFEST.franchise.testExtras.flatMap((g) => g.items).length);
  ok(opts.length === man && man >= 20, 'o modo de teste lista os ' + man + ' itens de Inglês (telas, explicações, minijogos, atos, painel)');
  const games = await p.evaluate(() => Object.keys(window.ING_MANIFEST.franchise.testExtras.find((g) => g.group === 'Minijogos').items.reduce((a, i) => { a[i.p.minijogo] = 1; return a; }, {})));
  ok(games.length === 3, 'os 3 minijogos estão no modo de teste');
  const links = await p.evaluate(() => window.ING_MANIFEST.franchise.testExtras.flatMap((g) => g.items).map((i) => window.ING_MANIFEST.franchise.testEntry(i.p)));
  for (const l of links) {
    const e0 = errs.length; await p.goto(url(l)); await p.waitForTimeout(700);
    const good = /painel/.test(l) ? await p.$('text=Matriz de cobertura') : await p.$('#ggTestBanner');
    ok(good && errs.length === e0, 'abre no sandbox: ' + l.replace('src/modules/ingles/', ''));
  }
  await p.goto(url('src/modules/ingles/painel.html')); await p.waitForTimeout(800);
  const rows = await p.$$eval('table.dt tbody tr', (r) => r.length);
  ok(rows === 174, 'painel: matriz com as 174 questões do PDF');
  await p.selectOption('select[aria-label="Tipo"]', 'negative'); await p.waitForTimeout(200);
  ok((await p.$$eval('table.dt tbody tr', (r) => r.length)) === 5, 'filtro por tipo (negativas: 5)');
  await p.click('table.dt tbody tr >> nth=0 >> text=Testar'); await p.click('text=Parcialmente certa'); await p.waitForTimeout(100);
  ok(/NÃO ACEITA/.test(await p.textContent('.tr-out')), 'testar resposta parcial no corretor: recusada com mensagem');
  await p.click('text=Resposta certa'); ok(/ACEITA/.test(await p.textContent('.tr-out')) && !/NÃO/.test(await p.textContent('.tr-out')), 'testar resposta certa: aceita');
  await p.goto(url('src/pais/pais.html#questoes')); await p.waitForTimeout(900);
  await p.click('text=Inglês — Expresso dos Sonhos'); await p.waitForTimeout(500);
  ok((await p.$$eval('table.dt tbody tr', (r) => r.length)) === 174, 'Matérias e questões: as 174 de Inglês aparecem');
  await p.click('table.dt tbody tr:has-text("ING-P1-MT-2")'); await p.waitForTimeout(300);
  ok(!!(await p.$('text=O que a criança digitou')), 'ficha da questão mostra o que a criança digitou');
  await p.goto(url('src/modules/ingles/jogar.html?teste=1&questao=ING-P7-IN-1')); await p.waitForTimeout(800);
  await p.fill('.q-in', 'She would like to go to the water park?'); await p.click('.q-go'); await p.waitForTimeout(80);
  ok(/começo/.test(await p.textContent('.q-fb')), 'sandbox: erro de ordem explica que Would vai para o começo');
  for (let k = 0; k < 3; k++) await p.click('text=💡 Dica'); await p.waitForTimeout(80);
  ok(!!(await p.$('.q-cards')), 'sandbox: dica 1 → dica 2 → cartões da Oficina de frases');
  const real2 = await p.evaluate(() => localStorage.getItem('ecoNexus.ingles.v1'));
  ok(real === real2, 'o save REAL de Inglês ficou idêntico depois de todo o modo de teste');

  /* ================================================================ 4) replay */
  console.log('4) Replay do Fliperama');
  await p.evaluate(() => { sessionStorage.clear(); });
  const prof = await p.evaluate(() => localStorage.getItem('ecoNexus.franchise.v1'));
  await p.goto(url('src/modules/ingles/jogar.html?replay=caca&token=teste-abc')); await p.waitForTimeout(800);
  await p.click('.mg-intro .btn.go'); await solveCaca(p); await p.click('text=Ver resultado'); await p.waitForTimeout(200);
  const box = await p.evaluate(() => JSON.parse(localStorage.getItem('ecoNexus.nexus.inbox.v1') || '[]'));
  ok(box.some((x) => x.gameId === 'ingles_caca' && x.token === 'teste-abc'), 'replay grava o resultado na caixa do Nexus');
  ok(prof === await p.evaluate(() => localStorage.getItem('ecoNexus.franchise.v1')), 'replay não mexe no perfil (sem pontos de estudo)');
  ok(real === await p.evaluate(() => localStorage.getItem('ecoNexus.ingles.v1')), 'replay não mexe no save real de Inglês');

  ok(errs.length === 0, 'sem erros no console' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await br.close();
  console.log(fails ? '\n✗ ' + fails + ' falha(s)' : '\n✓ tudo certo (' + Math.round((Date.now() - t0) / 1000) + ' s)');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
