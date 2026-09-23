/* =====================================================================
   tests/layouts.cjs — capturas de tela de todas as fases e telas
   principais em 1366x768, 1920x1080 e 390x844, verificando que não há
   rolagem horizontal nem erros no console.
   Uso: node src/modules/geografia/tests/layouts.cjs <pasta-de-saida>
   ===================================================================== */
const path = require('path'), fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const ROOT = path.join(__dirname, '..', '..', '..', '..');
const OUT = process.argv[2] || path.join(__dirname, 'capturas');
fs.mkdirSync(OUT, { recursive: true });
const VPS = [{ n: '1366', width: 1366, height: 768 }, { n: '1920', width: 1920, height: 1080 }, { n: '390', width: 390, height: 844, mobile: true }];
let fails = 0;

async function clearDialogs(p) { for (let i = 0; i < 12; i++) { const b = await p.$('.dlg .btn.pri'); if (!b) break; await b.evaluate((x) => x.click()); await p.waitForTimeout(120); } }

(async () => {
  const br = await pw.chromium.launch();
  for (const vp of VPS) {
    const ctx = await br.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.mobile, isMobile: !!vp.mobile });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    const overflow = async (name) => { const o = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1); if (o) { fails++; console.log('  ✗ rolagem horizontal em ' + name + ' @' + vp.n); } };
    await p.goto('file://' + path.join(ROOT, 'inicio.html')); await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(OUT, vp.n + '-00-lancador.png') }); await overflow('lançador');
    await p.goto('file://' + path.join(ROOT, 'src/modules/geografia/jogar.html'));
    await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('text=Começar ▶');
    await p.click('text=Começar ▶'); await p.waitForTimeout(300); await clearDialogs(p);
    await p.click('text=Aventura completa'); await p.waitForTimeout(500);
    const stages = await p.evaluate(() => GEO.data.stages.map((s) => s.id));
    const list = vp.n === '1366' ? stages : ['c1s1', 'c1s4', 'c2s1'];
    for (const id of list) {
      await p.evaluate((sid) => { GG.ui.closeAll(); GEO.stage.cur && GG.engine.stop(); GEO.data.stages.forEach((s) => { if (s.id < sid) GEO.save.S.stages[s.id] = GEO.save.S.stages[s.id] || { done: true, plays: 1, playsDay: {}, best: { score: 1, medal: 'ouro' } }; }); GEO.stage.run(sid, 'aventura'); }, id);
      await p.waitForTimeout(400); await clearDialogs(p); await p.waitForTimeout(300);
      for (let i = 0; i < 4; i++) { const cp = await p.$('text=Continuar ▶'); if (cp && await p.$('.m-title')) { await cp.evaluate((x) => x.click()); await p.waitForTimeout(200); } await clearDialogs(p); }
      await p.keyboard.down('ArrowRight'); await p.waitForTimeout(700); await p.keyboard.up('ArrowRight');
      await p.waitForTimeout(300);
      await p.screenshot({ path: path.join(OUT, vp.n + '-' + id + '.png') }); await overflow(id);
    }
    // uma questão aberta, na tela
    await p.evaluate(() => { GG.ui.closeAll(); GG.engine.stop(); GEO.app.showAtlas(); });
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(OUT, vp.n + '-atlas.png') }); await overflow('atlas');
    await p.evaluate(() => { GG.quiz.run(GEO.data.questions.find((q) => q.id === 'GEO-C2-Q15'), { pre: false, visual: GEO.visuals.render, subject: 'Geografia' }); });
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(OUT, vp.n + '-quiz-classificar.png') }); await overflow('questão');
    await p.evaluate(() => { GG.ui.closeAll(); GG.quiz.run(GEO.data.questions.find((q) => q.id === 'GEO-C3-Q01'), { pre: false, visual: GEO.visuals.render }); });
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(OUT, vp.n + '-quiz-tabela.png') }); await overflow('questão tabela');
    await p.evaluate(() => { GG.ui.closeAll(); GEO.app.parent = GEO.app.parent; });
    console.log('  ' + vp.n + ': ' + (errs.length ? 'ERROS ' + errs.join(' | ') : 'sem erros no console'));
    if (errs.length) fails++;
    await ctx.close();
  }
  await br.close();
  console.log(fails ? 'RESULTADO: FALHOU' : 'RESULTADO: OK');
  process.exit(fails ? 1 : 0);
})();
