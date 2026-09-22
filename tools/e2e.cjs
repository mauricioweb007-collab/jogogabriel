/* =====================================================================
   tools/e2e.cjs — teste de ponta a ponta no navegador (Playwright):
   joga a campanha inteira pela interface real com o jogador automático
   (tools/autoplayer.js) em um perfil de desempenho e imprime métricas.
   Uso: node econexus/tools/e2e.cjs [otimo|medio|minimo] [saida.json]
   Requer Playwright + Chromium instalados na máquina de teste.
   ===================================================================== */
'use strict';
const path = require('path');
const fs = require('fs');
let pw;
try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }

const profile = process.argv[2] || 'otimo';
const out = process.argv[3];
const root = path.join(__dirname, '..');

(async () => {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error ' + m.text()); else if (m.text().startsWith('[e2e]')) process.stderr.write(m.text() + '\n'); });
  page.setDefaultTimeout(0);
  await page.goto('file://' + path.join(root, 'index.html'));
  await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'autoplayer.js'), 'utf8') });
  await page.click('text=Novo jogo');
  await page.fill('.name-in', 'Gabriel');
  await page.click('text=Começar');
  await page.evaluate((p) => window.__AP.start(p), profile);
  const idle = () => page.waitForFunction(() => !EN.game.busy && !EN.ui.anyOpen(), null, { polling: 50 });
  await idle();
  const t0 = Date.now();

  const result = await page.evaluate(async () => {
    const G = EN.game, D = EN.data, E = EN.engine, Q = EN.quests;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const idle = async () => { for (let i = 0; i < 100000 && (G.busy || EN.ui.anyOpen()); i++) await wait(20); };
    const ent = (id) => E.map.entities.find((e) => e.id === id);
    const act = async (id) => { await idle(); const e = ent(id); if (!e) throw new Error('entidade ausente ' + id + ' em ' + E.map.id); await G.interact(e); await idle(); };
    const log = [];
    for (const r of D.regions) {
      await idle();
      await G.travel(r.map); await idle();
      // missões secundárias: aceitar, cumprir e entregar
      for (const sid of r.sides) {
        const sd = D.sides[sid];
        const giver = E.map.entities.find((e) => e.def.side === sid && E.visible(e));
        if (!giver) { log.push('sem doador visível: ' + sid); continue; }
        await act(giver.id);
        if (sd.type === 'collect') E.map.entities.filter((e) => e.def.side === sid && e.kind === 'pickup').forEach((e) => G.pickup(e));
        else for (const t of sd.targets) { const te = ent(t); if (te) await act(t); }
      }
      for (const lid of r.lessons) {
        const L = D.lessons[lid];
        for (const v of (L.requiresVisit || [])) await act(v);
        const e = E.map.entities.find((x) => x.def.lessons && x.def.lessons.includes(lid) && E.visible(x));
        if (!e) throw new Error('entidade da lição ' + lid + ' não visível');
        await act(e.id);
        if (!Q.lessonDone(lid)) throw new Error('lição não concluída: ' + lid);
        console.log('[e2e] lição ' + lid + ' ok');
      }
      for (const sid of r.sides) { const giver = E.map.entities.find((e) => e.def.side === sid && E.visible(e)); if (giver && Q.sideState(sid) === 'ready') await act(giver.id); }
      const chest = E.map.entities.find((e) => e.def.chest); if (chest) await act(chest.id);
      E.map.entities.filter((e) => e.def.pickup === 'frag').forEach((e) => G.pickup(e));
      await act('altar_' + r.id);
      if (!Q.regionComplete(r.id)) throw new Error('região não concluída ' + r.id);
      log.push(r.id + ': coins=' + EN.save.S.coins + ' xp=' + EN.save.S.xp + ' mastery=' + Math.round(Q.mastery(r.id) * 100) + '% recovery=' + !!EN.save.S.regionStats[r.id].recovery);
    }
    await idle();
    await act('portal_arena');
    await act('nucleo');
    const s = EN.save.S;
    return { log, storyDone: s.storyDone, arena: s.arena, coins: s.coins, earned: s.earned, xp: s.xp, level: EN.eco.level().lvl, coverage: Q.coverage(), mastery: Math.round(Q.overallMastery() * 100), medals: s.medals, inv: s.inv, crystals: s.crystals.length };
  });
  result.profile = profile;
  result.minutes = ((Date.now() - t0) / 60000).toFixed(1);
  result.apLog = await page.evaluate(() => window.__AP.log.slice(0, 20));
  result.acts = await page.evaluate(() => ({ acts: window.__AP.acts, wrongs: window.__AP.wrongs }));
  // revisão antes da prova + relatório do responsável
  result.review = await page.evaluate(async () => { const r = EN.learn.reviewSession(10); return await r; });
  result.report = await page.evaluate(() => { const r = EN.ui.report(); return { cobertura: r.cobertura, vistas: r.questoesVistas, primeira: r.acertosDePrimeira, erros: r.erros, dominio: r.dominioGeral, txtLen: EN.ui.reportTxt(r).length }; });
  // o que dá para comprar com o saldo final
  result.shopping = await page.evaluate(() => {
    const s = EN.save.S; const bought = [];
    const plan = ['botas_explorador', 'bussola_lumi', 'lupa_ecologica', 'cantil', 'mochila_ampliada', 'caderno_melhorado', 'ima_fragmentos', 'medalhao_solar', 'mascara_mergulho', 'corda_escalada', 'chave_lab', 'lanterna', 'passe_biomas', 'semente_rara', 'uni_verde', 'bone_folha', 'pet_joaninha', 'aura_folhas', 'capa_rio', 'pet_arara', 'lumi_ipe', 'deco_aquario', 'set_cerrado', 'pet_lobo', 'lumi_cristal', 'set_arcoiris', 'deco_arvore'];
    for (const id of plan) { const r = EN.eco.buy(id); if (r.ok) bought.push(id + '(' + EN.eco.item(id).price + ')'); }
    return { bought, left: s.coins, spent: s.spent };
  });
  result.errors = errors;
  await page.screenshot({ path: path.join(require('os').tmpdir(), 'e2e_' + profile + '.png') });
  console.log(JSON.stringify(result, null, 1));
  if (out) fs.writeFileSync(out, JSON.stringify(result, null, 1));
  await browser.close();
})().catch((e) => { console.error('FALHA', e); process.exit(1); });
