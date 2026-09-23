/* =====================================================================
   tests/e2e.cjs — joga a campanha INTEIRA de Geografia pela interface.
   Uso:  node src/modules/geografia/tests/e2e.cjs [otimo|erros|rapido] [--shots pasta]
   Perfis: otimo (acerta de primeira), erros (erra 2x antes de acertar →
   exercita pista, redução de alternativas e versão guiada), rapido
   (modo Estudo rápido). Verifica: 45/45 questões, 16 fases, final,
   troféu, economia, relatório e que o save de Ciências NÃO muda.
   ===================================================================== */
const path = require('path');
const fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const ROOT = path.join(__dirname, '..', '..', '..', '..');
const URL = 'file://' + path.join(ROOT, 'src', 'modules', 'geografia', 'jogar.html');
const profile = process.argv[2] || 'otimo';
const shotsI = process.argv.indexOf('--shots'); const SHOTS = shotsI > 0 ? process.argv[shotsI + 1] : null;
const CIE_KEY = 'econexus_guardioes_save_v1';
const CIE_FAKE = JSON.stringify({ v: 1, name: 'Gabriel', map: 'r3', q: { 'L1-Q1': { done: true } }, crystals: ['r1', 'r2'], medals: [], storyDone: false, coins: 321, marker: 'ciencias-intocado' });

const AUTOPLAYER = function (profile) {
  const AP = (window.__AP = { profile, done: false, tries: {}, log: [], stages: [], errors: 0, ticks: 0 });
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const key = (code, ms) => { window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code })); setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code, key: code })), ms || 200); };
  const btnByText = (root, re) => $$('button', root).find((b) => re.test(b.textContent) && !b.disabled);
  function handleQuiz(top) {
    const cur = GG.quiz._cur;
    if ($('.q-pre', top)) { const b = $('.m-actions .btn.pri', top); if (b) b.click(); return; }
    const hasVerify = $$('button', top).some((b) => /Verificar/.test(b.textContent));
    if (cur && hasVerify) {
      if (AP._wait && Date.now() < AP._wait) return;
      AP._wait = Date.now() + 250;
      const k = cur.q.id + '|' + cur.stage + '|' + (cur.r.part ? cur.r.part() : '') + '|' + (cur.r.step ? cur.r.step() : '');
      AP.tries[k] = (AP.tries[k] || 0) + 1;
      const wantWrong = AP.profile === 'erros' && cur.stage === 'main' && !cur.q.personal && AP.tries[k] <= 2 && !/CHECAGEM/.test(cur.q.id);
      try { if (wantWrong) { if (!cur.r.solveWrong()) cur.r.solve(); } else cur.r.solve(); } catch (e) { AP.log.push('solve err ' + cur.q.id + ' ' + e.message); cur.r.solve(); }
      setTimeout(() => { const v = btnByText(top, /Verificar/); if (v) v.click(); }, 30);
      return;
    }
    const b = $('.m-actions .btn.pri', top) || $$('.m-actions .btn', top).pop(); if (b) b.click();
  }
  function handleModal(top) {
    const title = ($('.m-title', top) || {}).textContent || '';
    if (top.querySelector('.modal.quiz')) return handleQuiz(top);
    if (/Como você quer jogar/.test(title)) { const want = AP.profile === 'rapido' ? /Estudo rápido/ : /Aventura completa/; const b = $$('.pace-opt', top).find((x) => want.test(x.textContent)); if (b) b.click(); return; }
    if (/Conserte a rede/.test(title)) { const sc = GG.engine.scene; if (sc && sc.dbg && sc.dbg.solvePuzzle) sc.dbg.solvePuzzle(); const c = btnByText(top, /Continuar/); if (c) c.click(); return; }
    if (/concluída!/.test(title)) { AP.stages.push(title); const nx = btnByText(top, /^Próxima/); (nx || btnByText(top, /Voltar ao Atlas/)).click(); return; }
    if (/Atlas Vivo está completo/.test(title)) { AP.final = true; btnByText(top, /Voltar ao Atlas/).click(); return; }
    if (/Checkpoint encontrado/.test(title)) { btnByText(top, /Continuar/).click(); return; }
    const b = $('.m-actions .btn.pri', top) || $('.m-actions .btn.go', top) || $$('.m-actions .btn', top).pop(); if (b) b.click();
  }
  function advance() {
    if (document.body.classList.contains('in-atlas') || !GG.engine.scene) {
      const nx = GEO.campaign.nextStage();
      if (!nx) { if (GEO.save.S.finalDone) AP.done = true; return; }
      GEO.stage.run(nx.id); return;
    }
    const sc = GG.engine.scene, st = GEO.stage.cur; if (!sc || !sc.dbg || !st) return;
    if (sc.dbg.busy && sc.dbg.busy()) return;
    const eng = st.def.engine;
    if (eng === 'platform') { sc.dbg.next(); key('ArrowRight', 350); }
    else if (eng === 'tower') { sc.dbg.next(); key('ArrowRight', 400); }
    else if (eng === 'topdown') sc.dbg.next();
    else if (eng === 'shmup') sc.dbg.skipTo(sc.dbg.d() + 220);
    else if (eng === 'race') sc.dbg.skip(sc.dbg.p.x + 260);
    else if (eng === 'boss') { const s = sc.dbg.step(); if (!s) return; if (s.k === 'survive') sc.dbg.skipSurvive(); else if (s.k === 'plates') { const f = sc.dbg.plates.find((pl) => pl.alive && !pl.s.v); if (f) sc.dbg.hit(f); } else if (s.k === 'final') sc.dbg.killBoss(); }
    else if (eng === 'maze') { if (st.def.bonus) sc.dbg.finishBonus(); else sc.dbg.deliverAll(); }
    else if (eng === 'rhythm') { if (sc.dbg.playing()) sc.dbg.autoplay(); }
    else if (eng === 'kitchen') sc.dbg.complete();
    else if (eng === 'city') sc.dbg.deliverNext();
  }
  AP.tick = function () {
    AP.ticks++;
    try {
      const dlg = $('.dlg .btn.pri'); if (dlg) { dlg.click(); return; }
      const wraps = $$('.modal-wrap'); if (wraps.length) { handleModal(wraps[wraps.length - 1]); return; }
      advance();
    } catch (e) { AP.errors++; AP.log.push('tick ' + e.message); }
  };
  AP.timer = setInterval(AP.tick, 70);
};

(async () => {
  const browser = await pw.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto(URL);
  await page.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); }, [CIE_KEY, CIE_FAKE]);
  await page.reload();
  await page.waitForSelector('text=Começar ▶');
  const t0 = Date.now();
  await page.evaluate(`(${AUTOPLAYER.toString()})(${JSON.stringify(profile)})`);
  let last = '', shotN = 0;
  while (true) {
    await page.waitForTimeout(1000);
    const st = await page.evaluate(() => ({ done: __AP.done, stages: __AP.stages.length, cur: GEO.stage.cur ? GEO.stage.cur.def.id : 'atlas', cov: GEO.save.S ? GEO.campaign.coverage().done : 0, err: __AP.errors }));
    const line = st.cur + ' • fases concluídas ' + st.stages + ' • questões ' + st.cov + '/45';
    if (line !== last) { console.log('  ' + line); last = line; if (SHOTS) { await page.screenshot({ path: path.join(SHOTS, profile + '-' + String(++shotN).padStart(2, '0') + '-' + st.cur + '.png') }); } }
    if (st.done) break;
    if (Date.now() - t0 > 30 * 60 * 1000) { console.log('TEMPO ESGOTADO'); break; }
  }
  await page.evaluate(() => clearInterval(__AP.timer));
  const res = await page.evaluate((CK) => {
    const S = GEO.save.S, D = GEO.data;
    const rep = GEO.app.report();
    return {
      coverage: GEO.campaign.coverage(), stagesDone: D.stages.filter((s) => S.stages[s.id] && S.stages[s.id].done).length, totalStages: D.stages.length,
      finalDone: S.finalDone, trophies: S.trophies, coins: S.coins, earned: S.earned, xp: S.xp, level: GEO.eco.level(), medals: rep.medalhas,
      firstTry: rep.acertosDePrimeira, helped: rep.corrigidasComAjuda.length, attempts: rep.tentativas, geobot: rep.geobot, inv: S.inv,
      tiers: D.questions.reduce((a, q) => { const t = S.q[q.id].tier; a[t] = (a[t] || 0) + 1; return a; }, {}),
      doneIn: D.questions.reduce((a, q) => { const t = S.q[q.id].doneIn; a[t] = (a[t] || 0) + 1; return a; }, {}),
      cie: localStorage.getItem(CK), geoKey: !!localStorage.getItem('ecoNexus.geografia.v1'), txt: GEO.app.reportTxt(rep).length,
      apLog: __AP.log.slice(0, 10), hard: D.questions.filter((q) => S.q[q.id].tier !== 1).map((q) => q.id + ' nível ' + S.q[q.id].tier + ' tentativas ' + S.q[q.id].attempts), apErr: __AP.errors, frames: S.flags.frames, bonus: S.unlockedBonus
    };
  }, CIE_KEY);
  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  console.log('\nPERFIL ' + profile + ' (' + mins + ' min de teste automatizado)');
  console.log('  Questões concluídas: ' + res.coverage.done + '/' + res.coverage.total + (res.coverage.missing.length ? ' faltando ' + res.coverage.missing.join(',') : ''));
  console.log('  Fases concluídas: ' + res.stagesDone + '/' + res.totalStages + ' • final: ' + res.finalDone + ' • troféus: ' + res.trophies.join(','));
  console.log('  Níveis de acerto (tier→qtd): ' + JSON.stringify(res.tiers) + ' • modo: ' + JSON.stringify(res.doneIn));
  if (res.hard.length) console.log('  Não-nível-1: ' + res.hard.join('; '));
  console.log('  Acertos de 1ª: ' + res.firstTry + ' • com ajuda: ' + res.helped + ' • tentativas: ' + res.attempts);
  console.log('  EcoMoedas: ' + res.coins + ' (ganhas ' + res.earned + ') • XP ' + res.xp + ' (nível ' + res.level.lvl + ' ' + res.level.title + ')');
  console.log('  Medalhas: ' + JSON.stringify(res.medals) + ' • molduras: ' + JSON.stringify(res.frames) + ' • bônus: ' + JSON.stringify(res.bonus));
  console.log('  GeoBot: ' + JSON.stringify(res.geobot) + ' • inventário: ' + res.inv.join(','));
  console.log('  Relatório .txt: ' + res.txt + ' caracteres');
  const cieOk = res.cie === CIE_FAKE;
  console.log('  Save de Ciências intocado: ' + (cieOk ? 'SIM' : 'NÃO!'));
  if (res.apLog.length) console.log('  Log do jogador automático: ' + res.apLog.join(' | '));
  console.log('  Erros no console: ' + (errs.length ? errs.join('\n    ') : 'nenhum'));
  const ok = res.coverage.done === 45 && res.stagesDone === 16 && res.finalDone && cieOk && !errs.length && !res.apErr;
  console.log(ok ? 'RESULTADO: OK' : 'RESULTADO: FALHOU');
  fs.writeFileSync(path.join(__dirname, 'resultado-' + profile + '.json'), JSON.stringify(Object.assign({ ok, profile, minutos: mins, errs }, res), null, 2));
  await browser.close();
  process.exit(ok ? 0 : 1);
})();
