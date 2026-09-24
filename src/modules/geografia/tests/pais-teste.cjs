/* =====================================================================
   tests/pais-teste.cjs — Área dos Pais × Geografia (modo de teste).
   Regra do projeto: TODO conteúdo novo de Geografia precisa aparecer no
   modo de teste da Área dos Pais. Este teste confere que:
     • cada minijogo registrado em GEO.parque (Parque + Arcade) está em
       franchise.testExtras do manifesto (não dá para esquecer um novo);
     • o painel "Abrir jogos (sandbox)" lista esses itens;
     • cada link abre o jogo/menu/tela certo no SANDBOX, sem erros;
     • a entrada paga/por perguntas também pode ser testada (botão extra
       "Entrar grátis (teste)") e nada toca o save real.
   A sessão dos pais é simulada gravando a sessão no sessionStorage (a
   senha NÃO é usada nem guardada aqui).
   Uso: node src/modules/geografia/tests/pais-teste.cjs
   ===================================================================== */
const path = require('path');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const ROOT = path.join(__dirname, '..', '..', '..', '..');
const url = (f) => 'file://' + path.join(ROOT, f);
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
const session = () => { sessionStorage.setItem('ecoNexus.pais.sessao', JSON.stringify({ start: Date.now(), last: Date.now() })); sessionStorage.setItem('ecoNexus.teste.ativo', '1'); };

(async () => {
  const br = await pw.chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1366, height: 768 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url('inicio.html')); await p.waitForTimeout(500);
  if (await p.$('#login:not(.hide)')) { await p.fill('#lgName', 'Gabriel'); await p.click('.lg-go'); await p.waitForTimeout(500); }
  await p.evaluate(() => localStorage.setItem('ecoNexus.geografia.v1', JSON.stringify({ marcador: 'save-real' })));
  const realBefore = await p.evaluate(() => localStorage.getItem('ecoNexus.geografia.v1'));

  // 1) manifesto × jogos registrados
  await p.goto(url('src/modules/geografia/jogar.html')); await p.waitForTimeout(800);
  const cov = await p.evaluate(() => {
    const ex = GEO_MANIFEST.franchise.testExtras.flatMap((g) => g.items);
    const ids = ex.map((i) => i.p.minijogo).filter(Boolean);
    return { games: GEO.parque.GAMES.map((g) => g.id), ids, missing: GEO.parque.GAMES.map((g) => g.id).filter((id) => !ids.includes(id)), extra: ids.filter((id) => !GEO.parque.GAMES.some((g) => g.id === id)), n: ex.length };
  });
  ok(cov.missing.length === 0, 'todo minijogo do Parque/Arcade está na Área dos Pais' + (cov.missing.length ? ' — faltam: ' + cov.missing.join(', ') : ' (' + cov.games.length + ')'));
  ok(cov.extra.length === 0, 'nenhum item da Área dos Pais aponta para jogo inexistente');

  // 2) painel dos pais (sessão simulada, modo de teste ativo)
  await p.goto(url('src/pais/pais.html')); await p.evaluate(session);
  await p.goto(url('src/pais/pais.html#teste')); await p.reload(); await p.waitForTimeout(1500);
  const opts = await p.$$eval('select[aria-label^="Minijogos e telas de Geografia"] option', (l) => l.map((o) => o.textContent));
  ok(opts.length === cov.n && opts.some((t) => /Estrada Brasil/.test(t)) && opts.some((t) => /Parque \+ Arcade/.test(t)), 'modo de teste mostra ' + opts.length + ' minijogos/telas de Geografia');
  const groups = await p.$$eval('select[aria-label^="Minijogos e telas de Geografia"] optgroup', (l) => l.map((o) => o.label));
  ok(['Parque do Atlas', 'Arcade do Mundo 1', 'Arcade do Mundo 2', 'Arcade do Mundo 3'].every((g) => groups.includes(g)), 'agrupado por Parque e Arcade de cada mundo');
  // abre pelo botão (Estrada Brasil)
  const sel = 'select[aria-label^="Minijogos e telas de Geografia"]';
  const idx = await p.$eval(sel, (s) => [...s.options].find((o) => /Estrada Brasil/.test(o.textContent)).value);
  await p.selectOption(sel, idx);
  await p.evaluate((s) => [...document.querySelector(s).closest('.kpi').querySelectorAll('button')].find((b) => b.textContent === 'Abrir').click(), sel);
  await p.waitForTimeout(2000);
  ok(/minijogo=w3_estrada/.test(p.url()) && await p.evaluate(() => GEO.mode.isTest() && GEO.parque.current() && GEO.parque.current().g.id === 'w3_estrada'), 'botão “Abrir” leva direto ao Estrada Brasil no sandbox');
  ok(await p.isVisible('#ggTestBanner'), 'faixa do modo de teste visível no jogo');

  // 3) cada item abre o que promete
  const items = await p.evaluate(() => GEO_MANIFEST.franchise.testExtras.flatMap((g) => g.items));
  let bad = [];
  for (const it of items) {
    await p.goto(url(await p.evaluate((o) => GEO_MANIFEST.franchise.testEntry(o), it.p))); await p.waitForTimeout(1100);
    const r = await p.evaluate((o) => {
      const t = [...document.querySelectorAll('.modal-wrap .m-title')].map((x) => x.textContent).join(' | ');
      if (o.minijogo) return !!(GEO.parque.current() && GEO.parque.current().g.id === o.minijogo);
      if (o.parque === 'todos') return /Parque do Atlas/.test(t) && document.querySelectorAll('.pq-card.lock').length === 0 && document.querySelectorAll('.pq-card').length === GEO.parque.GAMES.length && !!document.querySelector('.pq-test');
      if (o.parque) return new RegExp('Arcade do Mundo ' + o.parque).test(t) && document.querySelectorAll('.pq-card').length === 3;
      if (o.recompensa) return new RegExp('Arcade do Mundo ' + o.recompensa + ' liberado').test(t);
      return false;
    }, it.p);
    if (!r) bad.push(it.t);
    await p.evaluate(() => { GG.ui.closeAll(); GEO.parque.current() && GEO.parque.exit(false); });
  }
  ok(!bad.length, 'os ' + items.length + ' atalhos abrem o jogo/menu/tela certos' + (bad.length ? ' — falharam: ' + bad.join(', ') : ''));

  // 4) entrada paga/perguntas testável no sandbox + ferramentas de teste
  await p.goto(url('src/modules/geografia/jogar.html?teste=1&parque=todos')); await p.waitForTimeout(1200);
  await p.evaluate(() => { const b = [...document.querySelectorAll('.pq-test button')].find((x) => /Zerar/.test(x.textContent)); b.click(); });
  await p.waitForTimeout(300);
  ok(await p.evaluate(() => GEO.save.S.coins === 0), 'ferramenta de teste: zerar EcoMoedas do sandbox');
  await p.evaluate(() => { const b = [...document.querySelectorAll('.pq-test button')].find((x) => /\+100/.test(x.textContent)); b.click(); });
  await p.waitForTimeout(300);
  ok(await p.evaluate(() => GEO.save.S.coins === 100), 'ferramenta de teste: +100 EcoMoedas');
  await p.evaluate(() => { const b = [...document.querySelectorAll('.pq-test button')].find((x) => /Tirar/.test(x.textContent)); b.click(); });
  await p.waitForTimeout(300);
  ok(await p.evaluate(() => [1, 2, 3].every((w) => GEO.parque.tickets(w) === 0)), 'ferramenta de teste: tirar os bilhetes grátis');
  await p.click('.pq-card[data-game="w2_ninja"]'); await p.waitForTimeout(400);
  const entry = await p.$$eval('.modal-wrap .m-actions .btn', (l) => l.map((b) => b.textContent));
  ok(entry.some((t) => /Pagar 70/.test(t)) && entry.some((t) => /2 perguntas/.test(t)) && entry.some((t) => /Entrar grátis \(teste\)/.test(t)), 'no teste a tela de entrada aparece (moedas, perguntas e “Entrar grátis”)');
  await p.click('text=Pagar 70 EcoMoedas'); await p.waitForTimeout(900);
  ok(await p.evaluate(() => GEO.save.S.coins === 30 && GEO.parque.current() && GEO.parque.current().g.id === 'w2_ninja'), 'pagar no sandbox desconta 70 e abre a Feira Ninja');
  await p.evaluate(() => { GG.ui.closeAll(); GEO.parque.exit(false); });

  await p.goto(url('inicio.html')); await p.waitForTimeout(400);
  ok((await p.evaluate(() => localStorage.getItem('ecoNexus.geografia.v1'))) === realBefore, 'save real de Geografia intacto, byte a byte');
  ok(errs.length === 0, 'sem erros no console' + (errs.length ? ': ' + errs.slice(0, 5).join(' | ') : ''));
  await br.close();
  console.log(fails ? '\nResultado: FALHOU (' + fails + ')' : '\nResultado: todos os testes passaram');
  process.exit(fails ? 1 : 0);
})();
