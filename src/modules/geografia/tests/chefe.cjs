/* =====================================================================
   tests/chefe.cjs — correções de 24/09/2026 (pedido do usuário):
   • tela do chefe: a instrução e as placas A/B/C ficam SEMPRE visíveis
     num painel pequeno no canto (mirada 🎯, destruídas riscadas,
     minimizar) e somem quando as placas acabam;
   • fases de chefe NÃO dão giro na Roleta (o prêmio é o bilhete do
     Arcade, escolhido pela criança); as outras fases continuam dando;
   Uso: node src/modules/geografia/tests/chefe.cjs
   ===================================================================== */
const path = require('path');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const ROOT = path.join(__dirname, '..', '..', '..', '..');
const url = (f) => 'file://' + path.join(ROOT, f);
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };

(async () => {
  const br = await pw.chromium.launch();
  const p = await (await br.newContext({ viewport: { width: 1366, height: 768 } })).newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(url('inicio.html'));
  await p.evaluate(() => { sessionStorage.setItem('ecoNexus.pais.sessao', JSON.stringify({ start: Date.now(), last: Date.now() })); sessionStorage.setItem('ecoNexus.teste.ativo', '1'); });
  await p.goto(url('src/modules/geografia/jogar.html?teste=1&fase=c1s5')); await p.waitForTimeout(2500);
  for (let k = 0; k < 40; k++) {
    if (await p.$('.readcard')) { await p.click('.readcard .btn.pri'); await p.waitForTimeout(400); break; }
    const d = await p.$('.dlg .btn.pri'); if (d) { await d.click(); await p.waitForTimeout(150); continue; }
    const m = await p.$('.modal .m-actions .btn.pri'); if (m) { await m.click(); await p.waitForTimeout(150); continue; }
    await p.evaluate(() => { const sc = GG.engine.scene; if (sc && sc.dbg && sc.dbg.skipSurvive) sc.dbg.skipSurvive(); }); await p.waitForTimeout(300);
  }
  await p.waitForTimeout(500);
  const n = await p.$$eval('.boss-sheet li', (l) => l.length);
  ok(n === 3, 'painel do chefe mostra as 3 placas depois que o cartão fecha (' + n + ')');
  const txt = await p.textContent('.boss-sheet');
  const plates = await p.evaluate(() => GG.engine.scene.dbg.plates.map((pl) => pl.s.t));
  ok(/Destrua só as FALSAS/.test(txt) && plates.every((t) => txt.includes(t)), 'painel tem a instrução e o texto de cada placa');
  const vis = await p.evaluate(() => { const r = document.querySelector('.boss-sheet').getBoundingClientRect(), c = document.getElementById('game').getBoundingClientRect(); return r.width > 150 && r.left >= c.left && r.top >= c.top && r.right < c.left + c.width * 0.45; });
  ok(vis, 'painel pequeno, no canto esquerdo da tela do jogo');
  await p.evaluate(() => { const sc = GG.engine.scene; const f = sc.dbg.plates.find((pl) => pl.alive && !pl.s.v); sc.dbg.hit(f); });
  await p.waitForTimeout(300);
  ok((await p.$$eval('.boss-sheet li.gone', (l) => l.length)) === 1, 'placa falsa destruída aparece riscada no painel');
  await p.click('.boss-sheet .bs-min'); await p.waitForTimeout(200);
  ok((await p.$$eval('.boss-sheet li', (l) => l.length)) === 0 && !!(await p.$('.boss-sheet .bs-head')), 'botão minimiza o painel (fica só o título)');
  await p.click('.boss-sheet .bs-min'); await p.waitForTimeout(200);
  await p.evaluate(() => { const sc = GG.engine.scene; sc.dbg.plates.filter((pl) => pl.alive && !pl.s.v).forEach((pl) => sc.dbg.hit(pl)); });
  await p.waitForTimeout(400);
  ok(!(await p.$('.boss-sheet')), 'painel some quando as placas falsas acabam');
  const spin = await p.evaluate(() => { const f = GEO.save.S.flags; f.spinDays = {}; const b = GEO.parque.awardPerfect('c1s5'); const n2 = GEO.parque.awardPerfect('c1s1'); return { b, n2 }; });
  ok(spin.b === false, 'fase de chefe não dá giro na Roleta');
  ok(spin.n2 === true, 'fase comum com 100% continua dando giro');
  ok(!errs.length, 'sem erros no console' + (errs.length ? ': ' + errs[0] : ''));
  await br.close();
  console.log(fails ? '\n✗ ' + fails + ' falha(s)' : '\n✓ tudo certo');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
