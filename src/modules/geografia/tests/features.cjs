/* =====================================================================
   tests/features.cjs — verificações pontuais do módulo de Geografia:
   banco de 45 questões, ritmo (primeiro conteúdo < 30 s), teclado,
   pausa durante perguntas, acessibilidade, remapeamento, voz, loja e
   persistência, painel do responsável e exportação, Revisão da prova,
   retomada de checkpoint, perguntas pessoais sem dados guardados,
   módulo vazio de exemplo e isolamento de saves.
   Uso: node src/modules/geografia/tests/features.cjs
   ===================================================================== */
const path = require('path');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const ROOT = path.join(__dirname, '..', '..', '..', '..');
const URL = 'file://' + path.join(ROOT, 'src/modules/geografia/jogar.html');
let fails = 0; const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const adv = async (p, n) => { for (let i = 0; i < (n || 6); i++) { const b = await p.$('.dlg .btn.pri'); if (!b) break; await b.evaluate((x) => x.click()); await p.waitForTimeout(120); } };

(async () => {
  const br = await pw.chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1366, height: 768 }, acceptDownloads: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => { window.__spoken = []; window.speechSynthesis && (window.speechSynthesis.speak = (u) => window.__spoken.push(u.text)); });
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();

  console.log('[1] Banco de questões e campanha');
  const bank = await p.evaluate(() => {
    const Q = GEO.data.questions, ids = Q.map((q) => q.id);
    const want = [].concat(Array.from({ length: 15 }, (_, i) => 'GEO-C1-Q' + String(i + 1).padStart(2, '0')), Array.from({ length: 17 }, (_, i) => 'GEO-C2-Q' + String(i + 1).padStart(2, '0')), Array.from({ length: 13 }, (_, i) => 'GEO-C3-Q' + String(i + 1).padStart(2, '0')));
    const hosted = GEO.data.stages.flatMap((s) => s.questions);
    const fields = ['id', 'chapter', 'stage', 'concept', 'prompt', 'type', 'spec', 'answer', 'ok', 'why', 'recap', 'hint1', 'hint2', 'guided', 'review', 'where', 'effect'];
    const missing = Q.filter((q) => fields.some((f) => q[f] == null) || (!q.personal && !q.confirm)).map((q) => q.id);
    const preLong = Q.filter((q) => (q.pre || []).length > 3).map((q) => q.id);
    const words = []; Q.forEach((q) => (q.pre || []).forEach((b) => { const n = GG.util.words(typeof b === 'string' ? b : b.t); if (n > 30) words.push(q.id + ':' + n); }));
    return { n: Q.length, same: JSON.stringify(ids.slice().sort()) === JSON.stringify(want.slice().sort()), dup: ids.length !== new Set(ids).size, hostedAll: want.every((id) => hosted.filter((h) => h === id).length === 1), stageMatch: Q.every((q) => GEO.data.stageById[q.stage].questions.includes(q.id)), missing, preLong, words, stages: GEO.data.stages.length, engines: Array.from(new Set(GEO.data.stages.map((s) => s.engine))) };
  });
  ok(bank.n === 45 && bank.same && !bank.dup, 'exatamente as 45 IDs obrigatórias (15+17+13), sem repetição');
  ok(bank.hostedAll && bank.stageMatch, 'cada questão aparece em exatamente uma fase da campanha');
  ok(!bank.missing.length, 'todas têm o modelo pedagógico completo' + (bank.missing.length ? ' — faltam: ' + bank.missing.join(',') : ''));
  ok(!bank.preLong.length && !bank.words.length, 'explicações em até 3 blocos curtos' + (bank.words.length ? ' — longos: ' + bank.words.join(',') : ''));
  ok(bank.stages === 16 && ['platform', 'topdown', 'shmup', 'race', 'boss', 'maze', 'rhythm', 'kitchen', 'city', 'tower'].every((e) => bank.engines.includes(e)), '16 fases com 10 estilos de jogo');

  console.log('[2] Início rápido e primeira fase');
  const t0 = Date.now();
  await p.click('text=Começar ▶'); await p.waitForTimeout(200); await adv(p, 3);
  await p.click('text=Aventura completa'); await p.waitForTimeout(400); await adv(p, 3);
  let reached = false;
  for (let i = 0; i < 60 && !reached; i++) { await p.keyboard.down('ArrowRight'); await p.waitForTimeout(200); await p.keyboard.up('ArrowRight'); await adv(p, 2); reached = !!(await p.$('.modal.quiz')); }
  const secs = (Date.now() - t0) / 1000;
  ok(reached && secs < 30, 'primeira questão aberta em ' + secs.toFixed(1) + ' s (limite 30 s) andando com o teclado');
  const paused = await p.evaluate(() => GG.engine.isPaused());
  const t1 = await p.evaluate(() => GEO.stage.cur.time); await p.waitForTimeout(800); const t2 = await p.evaluate(() => GEO.stage.cur.time);
  ok(paused && t1 === t2, 'pergunta aberta pausa a ação e o cronômetro');
  await p.click('.m-actions >> text=🔊 Ouvir'); await p.waitForTimeout(100);
  ok((await p.evaluate(() => window.__spoken.length)) > 0, 'botão Ouvir lê o texto em voz alta (pt-BR)');
  ok(!!(await p.$('text=Entendi ▶')), 'explicação curta antes da questão (Entendi ▶)');

  console.log('[3] Fluxo de erro em 3 níveis');
  const flow = await p.evaluate(async () => {
    GG.ui.closeAll();
    const q = GEO.data.questions.find((x) => x.id === 'GEO-C1-Q07');
    const pr = GG.quiz.run(q, { pre: false });
    const out = [];
    const verify = () => Array.from(document.querySelectorAll('.m-actions button')).find((b) => /Verificar/.test(b.textContent)).click();
    await new Promise((r) => setTimeout(r, 50)); GG.quiz._cur.r.solveWrong(); verify(); await new Promise((r) => setTimeout(r, 50));
    out.push(document.querySelector('.q-fb').className + '|' + document.querySelector('.q-fb').textContent.slice(0, 60));
    GG.quiz._cur.r.solveWrong(); verify(); await new Promise((r) => setTimeout(r, 50));
    out.push(document.querySelector('.q-fb').className + '|' + document.querySelectorAll('.q-opt[disabled]').length);
    GG.quiz._cur.r.solveWrong(); verify(); await new Promise((r) => setTimeout(r, 50));
    out.push(GG.quiz._cur.stage + '|' + GG.quiz._cur.type + '|' + document.querySelectorAll('.q-slot.pre').length + '/' + document.querySelectorAll('.q-slot').length);
    GG.quiz._cur.r.solve(); verify(); await new Promise((r) => setTimeout(r, 50));
    const next = Array.from(document.querySelectorAll('.m-actions button')).find((b) => /Aplicar de novo/.test(b.textContent));
    out.push(!!next); next.click(); await new Promise((r) => setTimeout(r, 50));
    out.push(GG.quiz._cur.stage); GG.quiz._cur.r.solve(); verify(); await new Promise((r) => setTimeout(r, 50));
    Array.from(document.querySelectorAll('.m-actions button')).find((b) => /Voltar/.test(b.textContent)).click();
    const res = await pr; out.push(res.tier + '|' + res.guided + '|' + res.confirmOk);
    return out;
  });
  ok(/bad/.test(flow[0]) && flow[0].length > 10, '1º erro: explicação específica + nova tentativa');
  ok(/hint/.test(flow[1]) && Number(flow[1].split('|')[1]) >= 2, '2º erro: pista 2 + alternativas reduzidas');
  ok(/^guided\|fill\|/.test(flow[2]) && flow[2].split('|')[2].split('/')[0] !== flow[2].split('|')[2].split('/')[1], '3º erro: versão guiada, o jogador completa a última etapa');
  ok(flow[3] === true && flow[4] === 'confirm', 'após erro: nova aplicação curta (pergunta semelhante)');
  ok(flow[5] === '3|true|true', 'resultado registrado como corrigido com ajuda (nível 3)');

  console.log('[4] Respostas abertas aceitam variações coerentes');
  const open = await p.evaluate(() => {
    const test = (id, txt) => { const q = GEO.data.questions.find((x) => x.id === id); const r = GG.quiz.renderers.open(q.spec, { changed() {} }); r.el.querySelector('textarea').value = txt; return !!(r.check() || {}).ok; };
    return [test('GEO-C1-Q05', 'Não, porque cada povo tem sua língua e seus costumes.'), test('GEO-C1-Q05', 'nao pois existem muitos povos diferentes'), test('GEO-C1-Q05', 'Sim, são todos iguais.'), test('GEO-C3-Q09', 'É quando a família não tem dinheiro para pagar a luz'), test('GEO-C1-Q08', 'Tatu, jacaré e pipoca!'), test('GEO-C2-Q07', 'é entender o que a outra pessoa sente')];
  });
  ok(open[0] && open[1] && !open[2] && open[3] && open[4] && open[5], 'aceita variações (com/sem acento e pontuação) e recusa ideia errada: ' + JSON.stringify(open));
  const pers = await p.evaluate(() => { const q = GEO.data.questions.find((x) => x.id === 'GEO-C1-Q06'); return { unk: !!q.spec.allowUnknown, text: q.spec.text }; });
  ok(pers.unk && pers.text === false, 'pergunta de origem familiar tem “Não sei ainda” e não pede texto livre');
  const saved = await p.evaluate(() => JSON.stringify(GEO.save.S).includes('Portugueses') === false);
  ok(saved, 'respostas pessoais não são gravadas no save');

  console.log('[5] Acessibilidade, voz e controles');
  await p.evaluate(() => { GG.ui.closeAll(); GEO.app.settings(); });
  await p.click('text=Muito grande'); await p.click('.set-row:has-text("Alto contraste") >> text="Ligado"'); await p.click('.set-row:has-text("Reduzir") >> text=Sim');
  const a11y = await p.evaluate(() => ({ fs: getComputedStyle(document.documentElement).getPropertyValue('--fs').trim(), hc: document.body.classList.contains('hc'), rm: GG.engine.reduced, saved: GEO.save.S.settings }));
  ok(a11y.fs === '1.3' && a11y.hc && a11y.rm && a11y.saved.contrast && a11y.saved.textSize === 1.3, 'texto ajustável, alto contraste e reduzir movimento aplicam e salvam ' + JSON.stringify([a11y.fs, a11y.hc, a11y.rm, a11y.saved.contrast, a11y.saved.textSize]));
  const rb = await p.$$('text=Trocar tecla'); await rb[4].click(); await p.keyboard.press('KeyL');
  const bind = await p.evaluate(() => GG.input.getBindings().jump);
  ok(bind[0] === 'KeyL', 'remapear tecla (Pular → L)');
  await p.click('text=Restaurar teclas'); await p.click('.m-actions >> text=Pronto');
  const vol = await p.evaluate(() => { GEO.save.S.settings.music = 0.2; GG.ui.applyA11y(GEO.save.S.settings); return GG.audio.vol.music; });
  ok(vol === 0.2, 'volume de música separado de efeitos e voz');

  console.log('[6] Loja, itens e persistência');
  await p.evaluate(() => { GEO.save.S.coins = 500; GEO.save.persist(); GEO.app.showAtlas(); GEO.app.shop(); });
  await p.click('.shop-item:has-text("Chapéu do Cartógrafo") >> text=🪙 80'); await p.waitForTimeout(100);
  await p.reload(); await p.waitForTimeout(1200);
  const inv = await p.evaluate(() => ({ inv: GEO.save.S.inv, coins: GEO.save.S.coins, hint: GEO.eco.has('hint') }));
  ok(inv.inv.includes('chapeu') && inv.coins === 420 && inv.hint, 'compra persiste após recarregar (moedas descontadas, efeito ativo)');
  await p.evaluate(() => GG.ui.closeAll());

  console.log('[7] Painel do responsável e exportação');
  await p.evaluate(() => { GEO.app.parent(); }); await p.waitForTimeout(200);
  const gq = await p.textContent('.modal p'); const nums = gq.match(/(\d+) × (\d+)/);
  await p.fill('input[type=number]', String(Number(nums[1]) * Number(nums[2]))); await p.click('button:has-text("Entrar")');
  await p.waitForSelector('text=Cobertura das 45 questões');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('text=⬇️ Exportar .txt')]);
  ok(/relatorio-geografia-.*\.txt/.test(dl.suggestedFilename()), 'exporta relatório .txt (' + dl.suggestedFilename() + ')');
  const [dj] = await Promise.all([p.waitForEvent('download'), p.click('text=⬇️ Exportar .json')]);
  ok(/\.json$/.test(dj.suggestedFilename()), 'exporta relatório .json');
  await p.click('.m-actions >> text=Fechar');

  console.log('[8] Revisão da prova e retomada de checkpoint');
  await p.evaluate(() => { GEO.save.S.q['GEO-C1-Q01'].seen = true; GEO.save.S.q['GEO-C1-Q01'].wrongOnce = true; GEO.review.run({ size: 2 }); });
  await p.waitForTimeout(300); await adv(p, 2);
  const rv = await p.evaluate(() => GG.quiz._cur && GG.quiz._cur.q.title);
  ok(/Revisão/.test(rv || ''), 'Revisão da prova abre variações das questões, priorizando erros');
  await p.evaluate(() => { GG.ui.closeAll(); GG.engine.stop(); GEO.save.S.stages.c1s1 = { done: false, plays: 0, playsDay: {}, best: null, cp: { data: { cp: 2 }, answered: ['GEO-C1-Q01', 'GEO-C1-Q02'], learnPts: 200, fragments: 2, actionPts: 20, time: 60 } }; GEO.stage.run('c1s1'); });
  await p.waitForSelector('text=Checkpoint encontrado'); await p.click('text=Continuar ▶'); await p.waitForTimeout(400); await adv(p, 3);
  const resume = await p.evaluate(() => ({ x: GG.engine.scene.dbg.player.x, pts: GEO.stage.cur.learnPts }));
  ok(resume.x > 60 * 18 && resume.pts === 200, 'retoma no checkpoint com o progresso da fase');
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  ok(!!(await p.$('text=⏸ Pausa')), 'menu de pausa (Esc) com saída para o Atlas');
  await p.click('text=🗺️ Sair para o Atlas'); await p.waitForTimeout(300);

  console.log('[9] Lançador, módulo vazio e isolamento');
  await p.goto('file://' + path.join(ROOT, 'inicio.html')); await p.waitForTimeout(900);
  const ln = await p.evaluate(() => ({ ids: GG.registry.list.map((m) => m.id + ':' + m.enabled), txt: document.getElementById('lnCards').innerText }));
  ok(ln.ids.includes('ciencias_v1:true') && ln.ids.includes('geografia_2026_09:true') && ln.ids.includes('exemplo_vazio:false'), 'registro com Ciências, Geografia e módulo vazio de exemplo');
  ok(/Revisar/.test(ln.txt) && /Novas missões chegarão/.test(ln.txt), 'cartões com Continuar/Revisar e espaço “Novas missões chegarão”');
  const keys = await p.evaluate(() => Object.keys(localStorage));
  ok(keys.every((k) => ['ecoNexus.geografia.v1', 'ecoNexus.launcher.v1'].includes(k)), 'Geografia só grava as próprias chaves: ' + keys.join(', '));
  const frozen = await p.evaluate(() => { try { GG.store.write('econexus_guardioes_save_v1', {}); return false; } catch (e) { return true; } });
  ok(frozen, 'o armazenamento novo recusa gravar a chave de Ciências');

  ok(!errs.length, 'sem erros no console' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await br.close();
  console.log(fails ? '\nResultado: ' + fails + ' falha(s)' : '\nResultado: todos os testes passaram');
  process.exit(fails ? 1 : 0);
})();
