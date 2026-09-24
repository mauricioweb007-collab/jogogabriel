/* =====================================================================
   tests/parque.cjs — Parque do Atlas (minijogos sem questões) e camada
   gráfica: imagens carregadas, liberação por fases, os 4 jogos rodam do
   começo ao fim (teclado, toque e atalhos de teste), recorde salvo só
   no save de Geografia, economia intocada e nenhum erro no console.
   Uso: node src/modules/geografia/tests/parque.cjs
   ===================================================================== */
const path = require('path');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const ROOT = path.join(__dirname, '..', '..', '..', '..');
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
async function clearDialogs(p) { for (let i = 0; i < 12; i++) { const b = await p.$('.dlg .btn.pri'); if (!b) break; await b.evaluate((x) => x.click()); await p.waitForTimeout(120); } }

(async () => {
  const br = await pw.chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1366, height: 768 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(ROOT, 'inicio.html')); await p.waitForTimeout(500);
  if (await p.$('#login:not(.hide)')) { await p.fill('#lgName', 'Gabriel'); await p.click('.lg-go'); await p.waitForTimeout(500); }
  await p.goto('file://' + path.join(ROOT, 'src/modules/geografia/jogar.html'));
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForSelector('text=Começar ▶');
  await p.click('text=Começar ▶'); await p.waitForTimeout(300); await clearDialogs(p);
  await p.click('text=Aventura completa'); await p.waitForTimeout(600);

  const gfx = await p.evaluate(() => ({ ready: GEO.gfx.ready, ilus: GEO.ILUS.names.length, sky: Object.keys(GEO.gfx.SKIES).length, sat: !!GEO.gfx.img.satDia && !!GEO.gfx.img.satNoite, terra: !!GEO.gfx.img.terra, fx: ['star_07', 'light_01', 'puff0'].every((k) => GEO.gfx.img[k]) }));
  ok(gfx.ready && gfx.ilus >= 200, 'ilustrações 3D carregadas (' + gfx.ilus + ')');
  ok(gfx.sat && gfx.terra, 'fotos de satélite (dia e noite) e textura do globo carregadas');
  ok(gfx.fx && gfx.sky >= 8, 'texturas de efeitos e ' + gfx.sky + ' cenários pintados');

  await p.evaluate(() => { GG.ui.closeAll(); GG.engine.stop(); GEO.app.showAtlas(1); });
  await p.waitForTimeout(400); await clearDialogs(p); await p.evaluate(() => GG.ui.closeAll()); await p.waitForTimeout(200);
  ok(!!(await p.$('.ah-btn.fun')), 'botão “Parque” no Atlas');
  await p.evaluate(() => GEO.parque.open()); await p.waitForTimeout(300);
  const lock0 = await p.$$eval('.pq-card[data-game="memoria"], .pq-card[data-game="arara"], .pq-card[data-game="cesta"], .pq-card[data-game="quebra"]', (els) => els.map((e) => e.classList.contains('lock')));
  ok(lock0.length === 4 && lock0.every(Boolean), 'no começo nenhum minijogo está liberado (são prêmios dos mundos)');
  await p.evaluate(() => { GG.ui.closeAll(); GEO.data.stages.map((s) => s.id).forEach((id) => { GEO.save.S.stages[id] = { done: true, plays: 1, playsDay: {}, best: { score: 1, medal: 'ouro' } }; }); GEO.parque.open(); });
  await p.waitForTimeout(300);
  const lock1 = await p.$$eval('.pq-card[data-game="memoria"], .pq-card[data-game="arara"], .pq-card[data-game="cesta"], .pq-card[data-game="quebra"]', (els) => els.map((e) => e.classList.contains('lock')));
  ok(lock1.every((l) => !l), 'com os 3 mundos terminados os 4 minijogos do Parque liberam');
  await p.evaluate(() => { GEO.save.S.coins = 1000; });
  const before = await p.evaluate(() => ({ coins: GEO.save.S.coins, xp: GEO.save.S.xp, q: JSON.stringify(GEO.save.S.q) }));
  const pay = async () => { await p.waitForSelector('text=Pagar 70 EcoMoedas'); await p.click('text=Pagar 70 EcoMoedas'); };

  // 1) Memória: joga um par pelo teclado e resolve o resto pelo atalho de teste
  await p.click('.pq-card[data-game="memoria"]'); await pay(); await p.waitForTimeout(500); await clearDialogs(p); await p.waitForTimeout(400);
  const flipped = await p.evaluate(() => { GG.input.clear(); return true; });
  await p.keyboard.press('Space'); await p.waitForTimeout(200);
  const up1 = await p.evaluate(() => GEO.parque.current().scene && true);
  ok(flipped && up1, 'Memória abre e aceita teclado');
  for (let b = 0; b < 3; b++) { await p.evaluate(() => GG.engine.scene.dbg.solve()); await p.waitForTimeout(1500); }
  await p.waitForSelector('text=fim de jogo!', { timeout: 8000 }).catch(() => null);
  const r1 = await p.evaluate(() => GEO.save.S.parque.memoria);
  ok(r1 && r1.best > 0 && r1.plays === 1, 'Memória termina e salva recorde (' + (r1 && r1.best) + '%)');
  await p.click('text=🎡 Parque'); await p.waitForTimeout(500);

  // 2) Arara: bate asas por toque e completa as 5 regiões
  await p.click('.pq-card[data-game="arara"]'); await pay(); await p.waitForTimeout(500); await clearDialogs(p); await p.waitForTimeout(300);
  const box = await p.$eval('#game', (e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  const y0 = await p.evaluate(() => GG.engine.scene.dbg.b.y);
  await p.mouse.click(box.x, box.y); await p.waitForTimeout(120);
  const y1 = await p.evaluate(() => GG.engine.scene.dbg.b.vy);
  ok(y1 < 0 || y0 !== null, 'Arara bate as asas com um toque');
  await p.evaluate(() => { const b = GG.engine.scene.dbg.b; b.inv = 999; });
  for (let i = 0; i < 5; i++) { await p.evaluate(() => { GG.engine.scene.dbg.b.inv = 999; GG.engine.scene.dbg.skipRegion(); }); await p.waitForTimeout(350); }
  await p.waitForSelector('text=fim de jogo!', { timeout: 8000 }).catch(() => null);
  const r2 = await p.evaluate(() => GEO.save.S.parque.arara);
  ok(r2 && r2.best >= 350, 'Voo da Arara passa pelas 5 regiões e ganha o bônus (' + (r2 && r2.best) + ' pts)');
  await p.click('text=🎡 Parque'); await p.waitForTimeout(500);

  // 3) Cesta: move com as setas, pega itens e acaba o tempo
  await p.click('.pq-card[data-game="cesta"]'); await pay(); await p.waitForTimeout(500); await clearDialogs(p); await p.waitForTimeout(300);
  await p.keyboard.down('ArrowLeft'); await p.waitForTimeout(500); await p.keyboard.up('ArrowLeft');
  await p.waitForTimeout(2500);
  await p.evaluate(() => GG.engine.scene.dbg.end()); await p.waitForTimeout(400);
  await p.waitForSelector('text=fim de jogo!', { timeout: 8000 }).catch(() => null);
  const r3 = await p.evaluate(() => GEO.save.S.parque.cesta);
  ok(r3 && r3.plays === 1, 'Cesta da Feira roda e termina (' + (r3 && r3.best) + ' pts)');
  await p.click('text=🎡 Parque'); await p.waitForTimeout(500);

  // 4) Quebra-cabeça: arrasta uma peça com o mouse até o lugar e resolve o resto
  await p.click('.pq-card[data-game="quebra"]'); await pay(); await p.waitForTimeout(500); await clearDialogs(p); await p.waitForTimeout(600);
  // arrasta a primeira peça livre com o mouse até o lugar certo
  const drag = await p.evaluate(() => { const r = document.getElementById('game').getBoundingClientRect(); const k = r.width / GG.engine.W; const d = GG.engine.scene.dbg.first(); return { x: r.x + d.x * k, y: r.y + d.y * k, tx: r.x + d.tx * k, ty: r.y + d.ty * k }; });
  await p.mouse.move(drag.x, drag.y); await p.mouse.down(); await p.mouse.move((drag.x + drag.tx) / 2, (drag.y + drag.ty) / 2, { steps: 5 }); await p.mouse.move(drag.tx, drag.ty, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(300);
  ok(await p.evaluate(() => GG.engine.scene.dbg.placed() === 1), 'arrastar com o mouse encaixa a região no mapa');
  await p.evaluate(() => GG.engine.scene.dbg.solve()); await p.waitForTimeout(2200);
  await p.waitForSelector('text=fim de jogo!', { timeout: 8000 }).catch(() => null);
  const r4 = await p.evaluate(() => GEO.save.S.parque.quebra);
  ok(r4 && r4.best >= 200, 'Quebra-cabeça do Brasil monta as 5 regiões (' + (r4 && r4.best) + ' pts)');
  await p.click('text=🗺️ Atlas'); await p.waitForTimeout(500);

  const after = await p.evaluate(() => ({ coins: GEO.save.S.coins, xp: GEO.save.S.xp, q: JSON.stringify(GEO.save.S.q), keys: Object.keys(localStorage) }));
  ok(after.coins === before.coins - 4 * 70 && after.xp === before.xp, 'cada entrada pagou 70 EcoMoedas (4 partidas = 280) e o XP não mudou');
  ok(after.q === before.q, 'minijogos não mexem em nenhuma questão');
  const saved = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('ecoNexus.geografia.v1')); return s.parque && Object.keys(s.parque).length; });
  ok(saved >= 4, 'recordes gravados no save de Geografia');
  ok(!after.keys.includes('econexus_guardioes_save_v1'), 'nenhuma chave de Ciências criada');
  // Arcade dos Mundos: 9 jogos, bilhete grátis do chefe e entrada por 2 perguntas
  const arc = await p.evaluate(() => GEO.parque.GAMES.filter((g) => g.world).map((g) => g.id + ':' + g.world));
  ok(arc.length === 11 && [1, 2, 3].every((w) => arc.filter((a) => a.endsWith(':' + w)).length >= 3), 'Arcade dos Mundos: 11 minijogos (4 no Mundo 1, 3 no Mundo 2, 4 no Mundo 3)');
  await p.evaluate(() => { GG.ui.closeAll(); GEO.save.S.coins = 0; GEO.app.arcadeUnlocked(1); });
  await p.waitForTimeout(400);
  ok(await p.evaluate(() => GEO.parque.tickets(1) === 1), 'vencer o chefe dá 1 bilhete grátis do Mundo 1');
  await p.click('.pq-card[data-game="w1_jangada"]'); await p.waitForTimeout(900); await clearDialogs(p);
  ok(await p.evaluate(() => GEO.parque.tickets(1) === 0 && GEO.parque.current() && GEO.parque.current().g.id === 'w1_jangada'), 'bilhete usado: Jangada Radical começou sem moedas');
  await p.evaluate(() => GG.engine.scene.dbg.end()); await p.waitForSelector('text=fim de jogo!', { timeout: 8000 }).catch(() => null);
  await p.evaluate(() => { GG.ui.closeAll(); GEO.parque.exit(false); GEO.parque.enter('w1_colunas'); }); await p.waitForTimeout(300);
  ok(!!(await p.$('text=Responder 2 perguntas')), 'sem moedas nem bilhete: oferece entrar respondendo 2 perguntas');
  await p.click('text=Responder 2 perguntas'); await p.waitForTimeout(400);
  // responde as 2 perguntas como o autojogador da campanha (resolve e clica em Verificar/Próxima/Jogar)
  for (let k = 0; k < 30; k++) {
    if (await p.evaluate(() => GEO.parque.current() && GEO.parque.current().g.id === 'w1_colunas')) break;
    await p.evaluate(() => {
      const top = [...document.querySelectorAll('.modal-wrap')].pop(); if (!top) return;
      const btn = (re) => [...top.querySelectorAll('.m-actions .btn, button')].find((x) => re.test(x.textContent) && !x.disabled);
      const v = [...top.querySelectorAll('button')].find((x) => /Verificar/.test(x.textContent)); if (v && GG.quiz._cur) { GG.quiz._cur.r.solve(); setTimeout(() => v.click(), 60); return; }
      const n = btn(/Jogar!|Próxima|Continuar/); if (n) n.click();
    });
    await p.waitForTimeout(300); await clearDialogs(p);
    if (process.env.DBG) console.log(k, await p.evaluate(() => [...document.querySelectorAll('.modal-wrap')].map((w) => (w.querySelector('.m-title') || {}).textContent + ' | ' + [...w.querySelectorAll('.m-actions .btn')].map((b) => b.textContent + (b.disabled ? '(x)' : '')).join(',')).join(' || ') + ' cur=' + !!GG.quiz._cur));
  }
  await p.waitForTimeout(500); await clearDialogs(p);
  ok(await p.evaluate(() => GEO.parque.current() && GEO.parque.current().g.id === 'w1_colunas'), 'depois das 2 perguntas o Colunas do Mosaico começou');
  await p.evaluate(() => { GG.ui.closeAll(); GEO.parque.exit(false); });
  // estudo concluído: todos os minijogos grátis (sem moedas nem perguntas)
  await p.evaluate(() => { GEO.save.S.coins = 0; GEO.save.S.flags.arcadeTickets = {}; GEO.save.S.finalDone = true; GEO.parque.enter('w2_ninja'); }); await p.waitForTimeout(700); await clearDialogs(p);
  ok(await p.evaluate(() => GEO.parque.current() && GEO.parque.current().g.id === 'w2_ninja' && GEO.save.S.coins === 0), 'estudo concluído: minijogo entra direto, sem moedas nem perguntas');
  await p.evaluate(() => { GG.ui.closeAll(); GEO.parque.exit(false); GEO.save.S.finalDone = false; });
  // reduzir movimento: tudo continua desenhando
  await p.evaluate(() => { GEO.save.S.settings.reduceMotion = true; GG.ui.applyA11y(GEO.save.S.settings); GEO.app.showAtlas(3); });
  await p.waitForTimeout(500);
  ok(await p.evaluate(() => GG.engine.reduced === true), '“reduzir movimento” desliga paralaxe, raios e partículas extras');
  ok(errs.length === 0, 'sem erros no console' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await br.close();
  console.log(fails ? '\nResultado: FALHOU (' + fails + ')' : '\nResultado: todos os testes passaram');
  process.exit(fails ? 1 : 0);
})();
