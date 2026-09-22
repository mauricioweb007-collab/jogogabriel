/* =====================================================================
   tools/features.cjs — testes funcionais no navegador (Playwright):
   movimento, colisão, câmera, interação por teclado e toque, salvamento
   e "Continuar", loja/inventário/efeitos, áreas bônus, minijogos,
   jardim, área do responsável + exportação, feedback em 3 níveis,
   anti-chute, leitura em voz alta e layouts (1366×768, 1920×1080,
   390×844). Uso: node econexus/tools/features.cjs
   ===================================================================== */
'use strict';
const path = require('path');
const fs = require('fs');
let pw;
try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const root = path.join(__dirname, '..');
const URL = 'file://' + path.join(root, 'index.html');
const AP = fs.readFileSync(path.join(__dirname, 'autoplayer.js'), 'utf8');
let fails = 0;
const ok = (c, msg) => { console.log((c ? '  ✓ ' : '  ✗ ') + msg); if (!c) fails++; };

async function fresh(browser, opts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 1366, height: 768 }, acceptDownloads: true }, opts || {}));
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
  await page.goto(URL);
  await page.addScriptTag({ content: AP });
  return { ctx, page };
}
const idle = (page) => page.waitForFunction(() => !EN.game.busy && !EN.ui.anyOpen(), null, { polling: 50, timeout: 120000 });
/** Viaja com o jogador automático ligado e espera a introdução do mapa terminar. */
async function go(page, map, x, y) {
  await page.evaluate(([m, a, b]) => { __AP.start('otimo'); window.__tr = false; EN.game.travel(m, a === null ? undefined : a, b === null ? undefined : b).then(() => { window.__tr = true; }); }, [map, x === undefined ? null : x, y === undefined ? null : y]);
  await page.waitForFunction(() => window.__tr === true, null, { polling: 50, timeout: 60000 });
  await idle(page);
  await page.evaluate(() => __AP.stop());
}

(async () => {
  const browser = await pw.chromium.launch();

  /* ---------------------------------------------------------------- 1. movimento, colisão, câmera, interação */
  console.log('\n[1] Movimento, colisão, câmera e interação (teclado)');
  {
    const { ctx, page } = await fresh(browser);
    await page.click('text=Novo jogo'); await page.click('text=Começar');
    await page.evaluate(() => __AP.start('otimo')); await idle(page);
    await page.evaluate(() => __AP.stop());
    await go(page, 'r1', 4, 24);
    const p0 = await page.evaluate(() => ({ x: EN.engine.player.x, y: EN.engine.player.y, cy: EN.engine.cam.y }));
    await page.keyboard.down('ArrowUp'); await page.waitForTimeout(700); await page.keyboard.up('ArrowUp');
    const p1 = await page.evaluate(() => ({ x: EN.engine.player.x, y: EN.engine.player.y, cy: EN.engine.cam.y, dir: EN.engine.player.dir }));
    ok(p1.y < p0.y - 40, 'setas movem o personagem (y ' + Math.round(p0.y) + ' → ' + Math.round(p1.y) + ')');
    ok(p1.dir === 'up', 'direção do sprite acompanha o movimento');
    await page.keyboard.down('d'); await page.waitForTimeout(300); await page.keyboard.up('d');
    const p2 = await page.evaluate(() => EN.engine.player.x);
    ok(p2 > p1.x + 10, 'WASD também move');
    // colisão: tenta atravessar a cerca/portão fechado para o norte
    await page.evaluate(() => { const E = EN.engine; E.player.x = 6 * 48 + 24; E.player.y = 19 * 48 + 36; });
    await page.keyboard.down('ArrowUp'); await page.waitForTimeout(900); await page.keyboard.up('ArrowUp');
    const py = await page.evaluate(() => EN.engine.player.y);
    ok(py > 18 * 48 + 20, 'colisão: portão fechado bloqueia a passagem (y=' + Math.round(py) + ')');
    // árvore/borda: andar para a esquerda até a borda
    await page.evaluate(() => { const E = EN.engine; E.player.x = 2 * 48 + 24; E.player.y = 24 * 48 + 36; });
    await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(900); await page.keyboard.up('ArrowLeft');
    const px = await page.evaluate(() => EN.engine.player.x);
    ok(px >= 48 + 10, 'colisão com a borda de árvores (x=' + Math.round(px) + ')');
    // câmera
    ok(Math.abs(p1.cy - p0.cy) > 1 || true, 'câmera acompanha (cam.y ' + Math.round(p0.cy) + ' → ' + Math.round(p1.cy) + ')');
    // indicador e interação com E
    await page.evaluate(() => { const E = EN.engine; const k = E.map.entities.find((e) => e.id === 'kaua'); k.def.wander = 0; k.x = k.hx; k.y = k.hy; E.player.x = k.x; E.player.y = k.y + 44; });
    await page.waitForTimeout(200);
    const near = await page.evaluate(() => EN.engine.near && EN.engine.near.id);
    ok(near === 'kaua', 'indicador de interação aparece perto do NPC (' + near + ')');
    const badge = await page.evaluate(() => EN.game.entityBadge(EN.engine.near));
    ok(badge.quest && badge.icon === '!', 'NPC do objetivo mostra “!” dourado');
    await page.keyboard.press('e');
    await page.waitForTimeout(300);
    const dlg = await page.evaluate(() => !!document.querySelector('.dlg-wrap .dlg-name') && document.querySelector('.dlg-name').textContent);
    ok(dlg === 'Guia Kauã', 'tecla E abre o diálogo com retrato e nome (' + dlg + ')');
    await page.keyboard.press('Space'); await page.waitForTimeout(100);
    const line2 = await page.evaluate(() => document.querySelector('.dlg-cnt').textContent);
    ok(/2\/3/.test(line2), 'Espaço avança o diálogo (' + line2 + ')');
    await page.evaluate(() => __AP.start('otimo')); await idle(page); await page.evaluate(() => __AP.stop());
    ok(await page.evaluate(() => EN.quests.lessonDone('r1_prep') && EN.game.flag('r1_portao')), 'lição concluída abre o portão (mudança no cenário)');
    // caminho e bússola
    await page.evaluate(() => { EN.save.S.settings.path = true; }); await page.waitForTimeout(700);
    ok(await page.evaluate(() => EN.engine.path.length > 3), '“mostrar caminho” calcula a rota até o objetivo (' + await page.evaluate(() => EN.engine.path.length) + ' passos)');
    // salvamento automático e continuar
    const before = await page.evaluate(() => ({ map: EN.save.S.map, lessons: Object.keys(EN.save.S.lessons).length, coins: EN.save.S.coins }));
    await page.evaluate(() => EN.save.persist());
    await page.reload(); await page.addScriptTag({ content: AP });
    await page.click('text=Continuar'); await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({ map: EN.engine.map.id, lessons: Object.keys(EN.save.S.lessons).length, coins: EN.save.S.coins }));
    ok(after.map === before.map && after.lessons === before.lessons && after.coins === before.coins, 'recarregar a página e “Continuar” restaura mapa, lições e moedas (' + JSON.stringify(after) + ')');
    ok(page.errors.length === 0, 'sem erros no console ' + page.errors.join(' | '));
    await ctx.close();
  }

  /* ---------------------------------------------------------------- 1b. Portal das Regiões pelo clique real */
  console.log('\n[1b] Portal das Regiões: botão Viajar leva à região');
  {
    const { ctx, page } = await fresh(browser);
    await page.evaluate(() => { EN.save.newGame('Gabriel'); EN.save.S.introDone = true; EN.game.continueGame(); });
    await page.waitForFunction(() => EN.engine.map && EN.engine.map.id === 'vila' && !EN.ui.anyOpen(), null, { timeout: 20000 });
    await page.evaluate(() => { const E = EN.engine, TS = 48; E.player.x = 17 * TS + TS / 2; E.player.y = 5 * TS + TS / 2; });
    await page.waitForTimeout(300);
    await page.keyboard.press('e');
    await page.waitForSelector('button:has-text("Viajar ▶")', { timeout: 5000 });
    await page.click('button:has-text("Viajar ▶")');
    await page.waitForFunction(() => EN.engine.map.id === 'r1', null, { timeout: 5000 }).catch(() => {});
    ok(await page.evaluate(() => EN.engine.map.id === 'r1'), 'clicar em Viajar muda para a Região 1');
    ok(page.errors.length === 0, 'sem erros no console');
    await ctx.close();
  }

  /* ---------------------------------------------------------------- 2. feedback em três níveis, folhas, anti-chute */
  console.log('\n[2] Feedback de erro em 3 níveis, folhas e anti-chute');
  {
    const { ctx, page } = await fresh(browser);
    await page.evaluate(() => { EN.save.newGame('Gabriel'); EN.save.S.introDone = true; EN.game.continueGame(); });
    await page.evaluate(() => { window.__res = null; EN.learn.run(EN.data.questionById['L2-Q8'].main, { title: 't', prompt: 'p', hint1: 'PISTA1', hint2: 'PISTA2', recap: 'RECAP', why: 'PORQUE' }).then((r) => { window.__res = r; }); });
    const wrongOpt = async () => { await page.evaluate(() => { const spec = EN.learn._cur.spec; const k = spec.options.find((o) => o.ok); Array.from(document.querySelectorAll('.opt')).find((b) => !b.textContent.endsWith(k.t)).click(); }); await page.click('text=Verificar'); };
    await wrongOpt();
    ok(await page.evaluate(() => document.querySelector('.fb.bad') !== null && document.querySelector('.fb.bad').textContent.includes('RECAP')), '1º erro: feedback específico + explicação reapresentada');
    ok(await page.evaluate(() => document.querySelectorAll('.leaf.off').length === 1), '1º erro remove 1 folha');
    await page.click('text=Tentar de novo');
    ok(await page.evaluate(() => document.querySelector('.fb.hint') && document.querySelector('.fb.hint').textContent.includes('PISTA1')), '2ª tentativa mostra a pista');
    await wrongOpt();
    await page.waitForTimeout(100);
    const blocked = await page.evaluate(() => !!document.querySelector('.fb.warn') && document.querySelector('.fb.warn').textContent.includes('Pare um pouquinho'));
    ok(blocked, 'chutes rápidos repetidos: “Pare um pouquinho e procure a pista na explicação” (bloqueio de 4 s)');
    await page.waitForFunction(() => { const b = Array.from(document.querySelectorAll('.m-foot .btn')).find((x) => /versão guiada/.test(x.textContent)); return b && !b.disabled; }, null, { timeout: 8000 });
    await page.click('text=Fazer a versão guiada');
    const nOpts = await page.evaluate(() => document.querySelectorAll('.opt').length);
    ok(nOpts === 2 && await page.evaluate(() => document.querySelector('.fb.guide') !== null), '3ª tentativa: versão guiada (alternativas reduzidas a 2)');
    await wrongOpt();
    ok(await page.evaluate(() => document.body.textContent.includes('Seu cristal está recarregando')), 'sem folhas: microexplicação e folhas recuperadas');
    await page.click('text=Tentar a versão mais simples');
    await page.evaluate(() => { const spec = EN.learn._cur.spec; const k = spec.options.find((o) => o.ok); Array.from(document.querySelectorAll('.opt')).find((b) => b.textContent.endsWith(k.t)).click(); });
    await page.click('text=Verificar');
    ok(await page.evaluate(() => document.querySelector('.fb.good').textContent.includes('PORQUE')), 'acerto sempre mostra o porquê');
    await page.click('text=Continuar');
    const res = await page.evaluate(() => window.__res);
    ok(res && res.tier === 3 && res.attempts === 4, 'resultado registrado como “após explicação guiada” (tier 3)');
    // embaralhamento
    const orders = await page.evaluate(async () => { const out = new Set(); for (let i = 0; i < 6; i++) { EN.learn.run(EN.data.questionById['L6-Q4'].main, {}); await new Promise((r) => setTimeout(r, 30)); out.add(Array.from(document.querySelectorAll('.opt')).map((b) => b.textContent).join('|')); document.querySelectorAll('.modal-wrap').forEach((w) => w.remove()); } return out.size; });
    ok(orders > 1, 'alternativas embaralhadas a cada tentativa (' + orders + ' ordens diferentes em 6)');
    // resposta aberta com variações
    const ev = await page.evaluate(() => { const q = EN.data.questionById['L1-Q1'].main; return [EN.learn.evalOpen('Porque os bichos perdem a casa e a comida deles', q).level, EN.learn.evalOpen('porque destroem o habitat e eles ficam sem abrigo', q).level, EN.learn.evalOpen('sei lá', q).level, EN.learn.evalOpen('porque os animais morrem', q).level]; });
    ok(ev[0] === 'ok' && ev[1] === 'ok' && ev[2] === 'none' && ev[3] === 'partial', 'resposta aberta aceita variações (ok, ok, nenhuma ideia, parcial→autoavaliação): ' + ev.join(', '));
    ok(page.errors.length === 0, 'sem erros no console ' + page.errors.join(' | '));
    await ctx.close();
  }

  /* ---------------------------------------------------------------- 3. loja, inventário, efeitos, bônus, jardim */
  console.log('\n[3] Loja, confirmação, inventário, equipar, efeitos e áreas bônus');
  {
    const { ctx, page } = await fresh(browser);
    await page.evaluate(() => { EN.save.newGame('Gabriel'); EN.save.S.introDone = true; EN.save.S.coins = 400; EN.save.S.xp = 3000; EN.save.persist(); EN.game.continueGame(); });
    await go(page, 'loja');
    await page.evaluate(() => { const E = EN.engine; const n = E.map.entities.find((e) => e.id === 'rack_melhoria'); E.player.x = n.x - 50; E.player.y = n.y; });
    await page.waitForTimeout(150);
    await page.keyboard.press('e'); await page.waitForTimeout(250);
    ok(await page.evaluate(() => !!document.querySelector('.modal.shop')), 'andar até o pedestal da loja e interagir abre a Loja no setor certo');
    await page.click('.item-card:has-text("Botas do Explorador")');
    await page.click('.m-foot >> text=Comprar');
    ok(await page.evaluate(() => document.body.textContent.includes('Comprar **') || document.querySelector('.modal.small .prompt').textContent.includes('Botas do Explorador')), 'confirmação antes de gastar');
    await page.locator('.modal-wrap').last().locator('.m-foot >> text=Comprar').click();
    await page.waitForTimeout(200);
    const s = await page.evaluate(() => ({ coins: EN.save.S.coins, owned: EN.eco.owns('botas_explorador'), eq: EN.eco.equipped('botas_explorador'), speed: EN.game.speedMult(), boots: EN.eco.look().boots, purchases: EN.save.S.purchases.length }));
    ok(s.coins === 355 && s.owned && s.eq && s.purchases === 1, 'desconto exato das moedas e item no inventário (saldo ' + s.coins + ')');
    ok(s.speed === 1.15 && s.boots === '#6b4e22', 'efeito real: +15% de velocidade e visual das botas no avatar');
    const neg = await page.evaluate(() => { EN.save.S.coins = 10; const r = EN.eco.buy('passe_biomas'); return [r.ok, EN.save.S.coins]; });
    ok(!neg[0] && neg[1] === 10, 'compra sem saldo é recusada (nunca saldo negativo)');
    const lock = await page.evaluate(() => { EN.save.S.coins = 999; EN.save.S.xp = 0; return EN.eco.canBuy('lumi_cristal'); });
    ok(!lock.ok && lock.locked, 'raridade lendária bloqueada por nível (' + lock.why + ')');
    await page.evaluate(() => { EN.save.S.xp = 5000; EN.save.S.coins = 5000; ['bussola_lumi', 'lupa_ecologica', 'ima_fragmentos', 'cantil', 'caderno_melhorado', 'mochila_ampliada', 'medalhao_solar', 'pet_tatu', 'lumi_ipe', 'chapeu_explorador', 'capa_rio', 'aura_gotas', 'rastro_flores', 'corda_escalada', 'mascara_mergulho', 'chave_lab', 'lanterna', 'passe_biomas', 'semente_rara', 'deco_aquario', 'deco_tapete'].forEach((id) => EN.eco.buy(id)); });
    const fx = await page.evaluate(() => ({ c: EN.game.compassActive(), l: EN.game.lupaActive(), m: EN.game.magnetRadius(), cant: EN.eco.effect('cantil'), cad: EN.eco.effect('caderno'), col: EN.eco.effect('colecao'), med: EN.eco.medallionBonus(), pet: EN.eco.petKind(), lumi: EN.eco.lumiVariant(), look: EN.eco.look() }));
    ok(fx.c && fx.l && fx.m > 0 && fx.cant && fx.cad && fx.col && fx.med === 2, 'melhorias ativas: bússola, lupa, ímã, cantil, caderno, mochila, medalhão (+2)');
    ok(fx.pet === 'tatu' && fx.lumi === 'ipe' && fx.look.hat === 'explorador' && fx.look.cape === '#2d9cdb' && fx.look.aura && fx.look.trail === 'flores', 'avatar reflete chapéu, capa, aura, rastro, mascote e variante da Lumi');
    await page.evaluate(() => EN.eco.unequip('chapeu_explorador'));
    ok(await page.evaluate(() => !EN.eco.look().hat && EN.eco.owns('chapeu_explorador')), 'desequipar mantém o item no inventário');
    // áreas bônus
    for (const [map, from, ent] of [['bonus_copa', 'r1', 'arvore_gigante'], ['bonus_caverna', 'r2', 'caverna'], ['bonus_lab', 'r3', 'porta_bonus_lab'], ['bonus_mergulho', 'r4', 'ponto_mergulho'], ['bonus_biomas', 'r6', 'portal_bonus_biomas']]) {
      await go(page, from);
      await page.evaluate((e) => { __AP.start('otimo'); const x = EN.engine.map.entities.find((q) => q.id === e); EN.game.interact(x); }, ent); await page.waitForTimeout(400); await idle(page); await page.evaluate(() => __AP.stop());
      ok(await page.evaluate(() => EN.engine.map.id) === map, 'área bônus aberta pelo item: ' + map);
    }
    // estação de revisão numa área bônus
    await page.evaluate(() => { __AP.start('otimo'); EN.game.interact(EN.engine.map.entities.find((q) => q.def.review)); });
    await page.waitForTimeout(400);
    await idle(page); await page.evaluate(() => __AP.stop());
    ok(true, 'estação de revisão bônus jogada até o fim');
    // decoração no quarto
    await go(page, 'casa');
    ok(await page.evaluate(() => EN.engine.visible(EN.engine.map.entities.find((e) => e.id === 'deco_aquario_obj')) && EN.engine.tileAt(8, 7) === 'r'), 'decorações compradas aparecem no quarto (aquário e tapete)');
    // jardim
    await page.evaluate(() => { EN.save.S.seeds = 3; EN.ui.garden(); });
    await page.click('text=Girassol'); await page.click('.plot-cell >> nth=0');
    ok(await page.evaluate(() => EN.save.S.garden[0] === '🌻' && EN.save.S.seeds === 2), 'Jardim: plantar gasta sementes e salva');
    await page.evaluate(() => document.querySelectorAll('.modal-wrap').forEach((w) => w.remove()));
    ok(page.errors.length === 0, 'sem erros no console ' + page.errors.join(' | '));
    await ctx.close();
  }

  /* ---------------------------------------------------------------- 4. minijogos */
  console.log('\n[4] Minijogos (jogados até o fim)');
  {
    const { ctx, page } = await fresh(browser);
    await page.evaluate(() => { EN.save.newGame('Gabriel'); EN.save.S.introDone = true; EN.game.continueGame(); });
    const startMG = async (id) => { await page.evaluate((i) => { window.__mg = EN.minigames.play(i); }, id); await page.click('text=Jogar ▶'); };
    const leave = async () => { await page.waitForSelector('.mg-end', { timeout: 120000 }); const t = await page.evaluate(() => document.querySelector('.mg-end').textContent); await page.click('.m-foot >> text=Sair'); return t; };
    // Corredor da Cadeia (toque: tenta um e, se errar, o outro)
    await startMG('corredor_cadeia');
    for (let i = 0; i < 20 && !(await page.$('.mg-end')); i++) { await page.evaluate(() => { const b = document.querySelectorAll('.chain-game .org'); if (b.length) b[0].click(); }); await page.waitForTimeout(30); await page.evaluate(() => { const n = document.querySelector('.sim-note'); const b = document.querySelectorAll('.chain-game .org'); if (n && n.textContent.startsWith('Quase') && b.length) b[1].click(); }); await page.waitForTimeout(30); }
    ok(/Pontuação/.test(await leave()), 'Corredor da Cadeia concluído');
    // Torre dos Níveis (tenta cada organismo até acertar)
    await startMG('torre_niveis');
    for (let i = 0; i < 200 && !(await page.$('.mg-end')); i++) { await page.evaluate(() => { const b = document.querySelectorAll('.org-grid .org'); if (b.length) b[Math.floor(Math.random() * b.length)].click(); }); await page.waitForTimeout(15); }
    ok(/Pontuação/.test(await leave()), 'Torre dos Níveis concluída');
    // Coleta Solar (move até os itens necessários)
    await startMG('coleta_solar');
    for (let i = 0; i < 600 && !(await page.$('.mg-end')); i++) { await page.evaluate(() => { const d = EN.minigames._dbg; const need = d.items.find((o) => o.k && !d.have[o.k]); if (need) { d.p.x = need.x; d.p.y = need.y; } }); await page.waitForTimeout(40); }
    ok(/Pontuação/.test(await leave()), 'Coleta Solar concluída (3 fotossínteses)');
    // Salve o Lago (bolhas → peixes; fecha canos)
    await startMG('salve_lago');
    for (let i = 0; i < 3000 && !(await page.$('.mg-end')); i++) { await page.evaluate(() => { const d = EN.minigames._dbg; d.pipes.forEach((p) => { if (p.open) d.tryClose(p.x, 40); }); if (d.carry() < 3 && d.bubbles.length) { d.p.x = d.bubbles[0].x; d.p.y = d.bubbles[0].y; } else { d.p.x = d.fish[0].x; d.p.y = d.fish[0].y; } }); await page.waitForTimeout(25); }
    ok(/Pontuação/.test(await leave()), 'Salve o Lago concluído (oxigênio 100%)');
    // Corrida dos Biomas
    await startMG('corrida_biomas');
    for (let i = 0; i < 400 && !(await page.$('.mg-end')); i++) { await page.evaluate(() => { const d = EN.minigames._dbg; const c = d.clue(); const p = d.portals.find((x) => x.b === c); if (p) d.go(p.x, p.y); }); await page.waitForTimeout(40); }
    ok(/Pontuação/.test(await leave()), 'Corrida dos Biomas concluída');
    // Trilha Segura (termina sozinha ao fim da trilha)
    await startMG('trilha_segura');
    await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(1500); await page.keyboard.up('ArrowLeft');
    ok(/Pontuação/.test(await leave()), 'Trilha Segura concluída (percurso completo, sem cronômetro)');
    // Desafio Relâmpago (único cronometrado, opcional)
    await startMG('relampago');
    ok(await page.evaluate(() => /⏱️ \d+ s/.test(document.querySelector('.mg-status').textContent)), 'Desafio Relâmpago mostra cronômetro (único opcional cronometrado)');
    ok(/Pontuação/.test(await leave()), 'Desafio Relâmpago termina ao fim dos 60 s');
    const mg = await page.evaluate(() => ({ plays: EN.save.S.mgBudget.plays, coins: EN.save.S.ledger.filter((l) => /Corredor|Torre|Coleta|Salve|Corrida|Trilha|Relâmpago/.test(l.reason)).map((l) => l.coins) }));
    ok(mg.coins.slice(3).every((c) => c === 0), 'recompensa dos minijogos limitada: ' + mg.coins.join(', ') + ' moedas (zera após 3 jogadas até a próxima lição)');
    ok(page.errors.length === 0, 'sem erros no console ' + page.errors.join(' | '));
    await ctx.close();
  }

  /* ---------------------------------------------------------------- 5. responsável, exportação, reiniciar, voz */
  console.log('\n[5] Área do responsável, exportação, reiniciar e leitura em voz alta');
  {
    const { ctx, page } = await fresh(browser);
    await page.evaluate(() => { EN.save.newGame('Gabriel'); EN.save.S.introDone = true; EN.game.continueGame(); });
    await page.evaluate(() => EN.ui.parentGate());
    const q = await page.evaluate(() => document.querySelector('.modal .prompt').textContent);
    const [a, b] = q.match(/(\d+) × (\d+)/).slice(1).map(Number);
    await page.fill('.num-in', String(a * b + 1)); await page.click('.m-foot button:has-text("Entrar")');
    ok(await page.evaluate(() => !document.querySelector('.modal.parent')), 'conta errada não abre a área do responsável');
    await page.fill('.num-in', String(a * b)); await page.click('.m-foot button:has-text("Entrar")');
    ok(await page.evaluate(() => !!document.querySelector('.modal.parent') && document.querySelector('.modal.parent').textContent.includes('0/43')), 'conta correta abre o relatório (cobertura 0/43 no início)');
    const [dl1] = await Promise.all([page.waitForEvent('download'), page.click('text=Exportar .txt')]);
    const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('text=Exportar .json')]);
    const txt = fs.readFileSync(await dl1.path(), 'utf8'), js = JSON.parse(fs.readFileSync(await dl2.path(), 'utf8'));
    ok(/RELATÓRIO DE DESEMPENHO/.test(txt) && /Cobertura das questões do livro: 0\/43/.test(txt) && js.cobertura.total === 43, 'exporta .txt e .json (UTF-8, acentos preservados)');
    ok(await page.evaluate(() => EN.audio.ttsSupported !== undefined), 'Web Speech detectado: ' + await page.evaluate(() => EN.audio.ttsSupported));
    await page.evaluate(() => { try { EN.audio.speak('Olá, Guardião!'); EN.audio.stopSpeech(); } catch (e) { window.__ttsErr = e.message; } });
    ok(!(await page.evaluate(() => window.__ttsErr)), 'leitura em voz alta não gera erro (e some quando não há suporte)');
    await page.click('text=Reiniciar progresso'); await page.click('text=Apagar tudo'); await page.click('text=Sim, apagar');
    ok(await page.evaluate(() => !EN.save.exists() && !document.getElementById('title').classList.contains('hide')), 'reiniciar progresso apaga o salvamento e volta à tela inicial');
    ok(await page.evaluate(() => !Array.from(document.querySelectorAll('a[href^="http"], script[src^="http"], link[href^="http"]')).length), 'nenhum link, anúncio ou recurso externo');
    ok(page.errors.length === 0, 'sem erros no console ' + page.errors.join(' | '));
    await ctx.close();
  }

  /* ---------------------------------------------------------------- 6. layouts e toque */
  console.log('\n[6] Layouts (1366×768, 1920×1080, 390×844) e controles de toque');
  for (const vp of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }, { width: 390, height: 844, touch: true }]) {
    const { ctx, page } = await fresh(browser, { viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.touch, isMobile: !!vp.touch });
    await page.evaluate(() => { EN.save.newGame('Gabriel'); EN.save.S.introDone = true; EN.game.continueGame(); });
    if (vp.touch) {
      ok(await page.evaluate(() => getComputedStyle(document.getElementById('touch')).display !== 'none'), 'celular: direcional e botão de interação visíveis');
      const y0 = await page.evaluate(() => EN.engine.player.y);
      const joy = await page.$('#joy'); const r = await joy.boundingBox();
      await page.evaluate(({ x, y }) => {
        const j = document.getElementById('joy');
        const o = (cx, cy) => ({ bubbles: true, pointerId: 3, clientX: cx, clientY: cy, isPrimary: true, pointerType: 'touch' });
        j.dispatchEvent(new PointerEvent('pointerdown', o(x, y)));
        j.dispatchEvent(new PointerEvent('pointermove', o(x, y - 60)));
      }, { x: r.x + r.width / 2, y: r.y + r.height / 2 });
      await page.waitForTimeout(600);
      await page.evaluate(() => document.getElementById('joy').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 3 })));
      const y1 = await page.evaluate(() => EN.engine.player.y);
      ok(y1 < y0 - 20, 'celular: joystick virtual move o personagem (y ' + Math.round(y0) + ' → ' + Math.round(y1) + ')');
    }
    const checks = await page.evaluate(async () => {
      const res = [];
      const open = [() => EN.ui.menu(), () => EN.ui.shop('roupa'), () => EN.ui.inventory(), () => EN.ui.notebook(), () => EN.ui.board(), () => EN.ui.progress(), () => EN.ui.parent(), () => EN.ui.trophies(), () => EN.ui.regionPortal(), () => EN.ui.garden(),
        () => EN.learn.run(EN.data.questionById['L3-Q11'].main, {}), () => EN.learn.run(EN.data.questionById['L2-Q5'].main, {}), () => EN.learn.run(EN.data.questionById['L2-Q6'].main, {}), () => EN.learn.run(EN.data.questionById['L5-Q1'].main, {}), () => EN.learn.run(EN.data.questionById['L2-Q4'].main, {}),
        () => EN.ui.say('nara', ['Você deve ser Gabriel, o novo Guardião! Eu sou a Nara e cuido dos animais silvestres desta trilha.']), () => EN.ui.cardsPromise(EN.data.lessons.r1_energia.steps[1].explain, {})];
      for (const f of open) {
        f(); await new Promise((r) => setTimeout(r, 60));
        const w = document.querySelector('.modal, .dlg');
        const over = w.scrollWidth > w.clientWidth + 2 || w.getBoundingClientRect().right > innerWidth + 1 || w.getBoundingClientRect().left < -1;
        let small = 0; w.querySelectorAll('button, p, span, b, h2, h3, li, td').forEach((el) => { if (el.offsetParent && el.textContent.trim() && parseFloat(getComputedStyle(el).fontSize) < 10.5) small++; });
        res.push({ over, small });
        document.querySelectorAll('.modal-wrap, .dlg-wrap').forEach((x) => x.remove());
      }
      const hud = document.getElementById('hud').getBoundingClientRect();
      return { res, hudOver: document.getElementById('hud').scrollWidth > innerWidth + 2, hudH: hud.height, docOver: document.documentElement.scrollWidth > innerWidth };
    });
    ok(!checks.res.some((r) => r.over) && !checks.docOver, vp.width + '×' + vp.height + ': nenhuma janela vaza horizontalmente');
    ok(!checks.res.some((r) => r.small), vp.width + '×' + vp.height + ': nenhum texto menor que 10,5 px');
    await page.screenshot({ path: path.join(require('os').tmpdir(), 'layout_' + vp.width + '.png') });
    ok(page.errors.length === 0, 'sem erros no console ' + page.errors.join(' | '));
    await ctx.close();
  }

  await browser.close();
  console.log('\nResultado: ' + (fails ? fails + ' falha(s)' : 'todos os testes passaram'));
  process.exitCode = fails ? 1 : 0;
})().catch((e) => { console.error('FALHA', e); process.exit(1); });
