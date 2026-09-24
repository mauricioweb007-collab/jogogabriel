/* =====================================================================
   Teste de navegador do Gabriel Nexus + entrada + Área dos Pais.
   Cobre: entrada só com nome (maiúsculas com acento, sem senha, mesmo
   save), senha dos pais (certa/errada, sem usuário, não aparece),
   expiração da sessão, sandbox isolado, minigames bloqueados/liberados,
   replay sem pontos de estudo, 21 Nexóticos e assets, compras sem
   duplicar ao recarregar, saldo nunca negativo, lançador abrindo todos
   os títulos, ausência de erros no console e desempenho do hub.
   Uso: PARENT_ACCESS_PASSWORD=... node src/tests/nexus-e2e.cjs
   ===================================================================== */
const path = require('path');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const ROOT = path.join(__dirname, '..', '..');
const PASS = process.env.PARENT_ACCESS_PASSWORD;
const url = (f) => 'file://' + path.join(ROOT, f);
let fails = 0, oks = 0;
const ok = (c, m) => { if (c) { oks++; console.log('  ✓ ' + m); } else { fails++; console.log('  ✗ ' + m); } };

(async () => {
  if (!PASS) { console.log('Defina PARENT_ACCESS_PASSWORD para rodar este teste.'); process.exit(2); }
  const opts = {}; try { require('fs').accessSync('/opt/pw-browsers/chromium'); opts.executablePath = '/opt/pw-browsers/chromium'; } catch (e) { /* padrão */ }
  const br = await pw.chromium.launch(opts);
  const ctx = await br.newContext({ viewport: { width: 1366, height: 768 } });
  const p = await ctx.newPage();
  const errs = [], logs = [];
  p.on('console', (m) => { logs.push(m.text()); if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', (e) => errs.push(String(e)));
  const skip = async () => { for (let i = 0; i < 8; i++) { const d = await p.$('.dlg .btn.pri'); if (d) { await d.click(); await p.waitForTimeout(150); continue; } const c = await p.$('.modal .m-actions .btn.pri'); if (c) { await c.click(); await p.waitForTimeout(250); continue; } const n = await p.$('.modal .nxc'); if (n) { await n.click(); await p.waitForTimeout(300); continue; } break; } };
  const prof = () => p.evaluate(() => JSON.parse(localStorage.getItem('ecoNexus.franchise.v1') || 'null'));

  console.log('[1] Entrada da criança (só o nome)');
  await p.goto(url('inicio.html')); await p.waitForTimeout(700);
  const inputs = await p.$$eval('#login input', (l) => l.map((i) => i.type));
  ok(inputs.length === 1 && inputs[0] === 'text', 'a entrada pede só o nome (nenhum campo de senha)');
  await p.fill('#lgName', '  joão   gabriel  '); await p.click('.lg-go'); await p.waitForTimeout(900);
  let P1 = await prof();
  ok(P1 && P1.displayNameUppercase === 'JOÃO GABRIEL', 'nome normalizado em MAIÚSCULAS com acento: ' + (P1 && P1.displayNameUppercase));
  ok(/JOÃO GABRIEL/.test(await p.textContent('#lnHello')), 'nome aparece em maiúsculas no lançador');
  await p.evaluate(() => sessionStorage.clear()); await p.reload(); await p.waitForTimeout(700);
  ok((await p.inputValue('#lgName')) === 'JOÃO GABRIEL', 'o nome salvo é preenchido automaticamente');
  await p.fill('#lgName', 'Gabi'); await p.click('.lg-go'); await p.waitForTimeout(700);
  const P2 = await prof();
  ok(P2.profileId === P1.profileId && P2.displayNameUppercase === 'GABI', 'trocar o nome mantém o MESMO perfil (sem cadastro/seleção de contas)');
  const cards = await p.$$eval('#lnCards .ln-card', (l) => l.map((c) => c.innerText.split('\n')[0]));
  ok(cards.some((t) => /Ciências/.test(t)) && cards.some((t) => /Geografia/.test(t)) && cards.some((t) => /Matemática/.test(t)), 'lançador mostra Ciências, Geografia e Matemática (em breve)');
  ok(!(await p.$('text=Entrar no Nexus')), 'Nexus oculto para a criança no lançador (GG.FR.nexusVisible = false)');

  console.log('[2] Importação única e Nexus');
  await p.evaluate(() => {
    const q = {}; for (let i = 1; i <= 43; i++) q['L' + i] = { done: i <= 12, tier: 1 };
    localStorage.setItem('econexus_guardioes_save_v1', JSON.stringify({ v: 1, name: 'Gabriel', q, crystals: ['r1'], arena: {}, mg: { trilha_segura: { plays: 1 } } }));
  });
  const cien0 = await p.evaluate(() => localStorage.getItem('econexus_guardioes_save_v1'));
  await p.goto(url('src/nexus/nexus.html')); await p.waitForTimeout(2200); await skip();
  let P = await prof();
  ok(P.careerPoints === 12 * 100 + 200, 'importação inicial: ' + P.careerPoints + ' pontos');
  ok(P.nexusCoins >= 140 - 0, 'moedas convertidas (10 pontos = 1 moeda): ' + P.nexusCoins);
  await p.reload(); await p.waitForTimeout(2000); await skip();
  ok((await prof()).careerPoints === P.careerPoints, 'recarregar não importa de novo');
  ok((await p.evaluate(() => localStorage.getItem('econexus_guardioes_save_v1'))) === cien0, 'save de Ciências não foi alterado');
  const cat = await p.evaluate(() => ({ n: GG.catalog.list.length, err: GG.catalog.errors.length }));
  ok(cat.n === 21 && cat.err === 0, '21 Nexóticos carregados sem erro');
  const broken = await p.evaluate(() => Promise.all(GG.catalog.list.map((c) => new Promise((res) => { const i = new Image(); i.onload = () => res(i.naturalWidth > 0 ? null : c.id); i.onerror = () => res(c.id); i.src = c.assetUrl; }))).then((l) => l.filter(Boolean)));
  ok(!broken.length, 'todos os assets de personagem carregam' + (broken.length ? ': ' + broken.join(',') : ''));
  const imgs = await p.evaluate(() => Array.from(document.images).filter((i) => i.getAttribute('src') && i.complete && i.naturalWidth === 0).map((i) => i.src));
  ok(!imgs.length, 'nenhuma imagem quebrada no hub' + (imgs.length ? ': ' + imgs.join(',') : ''));

  console.log('[3] Fliperama: bloqueados, liberados, replay');
  await p.evaluate(() => NX.open('fliperama')); await p.waitForTimeout(600);
  const avail = await p.evaluate(() => GG.unlocks.available(GG.profile.load()).map((g) => g.minigameId));
  ok(avail.includes('ciencias_trilha_segura') && !avail.includes('ciencias_salve_lago') && !avail.includes('geografia_c1s1'), 'só aparecem minigames já liberados (' + avail.length + ')');
  const cardsTxt = await p.textContent('#nxAreaBody');
  ok(/Trilha Segura/.test(cardsTxt) && !/Treino livre[^]*Festival da Diversidade[^]*Treino livre/.test(cardsTxt), 'minigame bloqueado não aparece como jogável');
  await p.evaluate(() => { localStorage.setItem('ecoNexus.geografia.v1', JSON.stringify({ v: 1, name: 'Gabriel', q: {}, stages: { c1s1: { done: true } }, chaptersDone: [], unlockedBonus: [] })); });
  await p.reload(); await p.waitForTimeout(2000); await skip();
  ok(await p.evaluate(() => GG.unlocks.isUnlocked(GG.profile.load(), 'geografia_c1s1')), 'fase concluída no módulo aparece no Fliperama');
  const careerBefore = (await prof()).careerPoints;
  await p.evaluate(() => { GG.replay.push('geografia_c1s1', 77, 'tok-e2e-1'); GG.profile.update((pp) => { pp.arcade.pending = { token: 'tok-e2e-1', gameId: 'geografia_c1s1' }; }); });
  await p.reload(); await p.waitForTimeout(2000); await skip();
  P = await prof();
  ok(P.arcade.records.geografia_c1s1 && P.arcade.records.geografia_c1s1.score === 77, 'resultado do replay vira recorde');
  ok(P.careerPoints === careerBefore, 'replay não soma pontos de estudo (' + careerBefore + ' → ' + P.careerPoints + ')');

  console.log('[4] Loja: sem cobrança dupla, saldo nunca negativo, cápsula');
  await p.evaluate(() => { const it = GG.NEXUS_ITEMS.find((i) => i.id === 'bone_nexus'); GG.nexusEco.buyItem(it.id, 'txn-e2e-bone'); });
  const c1 = (await prof()).nexusCoins;
  await p.reload(); await p.waitForTimeout(1800); await skip();
  await p.evaluate(() => GG.nexusEco.buyItem('bone_nexus', 'txn-e2e-bone'));
  const P3 = await prof();
  ok(P3.nexusCoins === c1 && P3.inventory.bone_nexus, 'item comprado persiste e recarregar/repetir não cobra de novo');
  const neg = await p.evaluate(() => GG.nexusEco.buyItem('asas_luz', 'txn-e2e-caro-' + Date.now()));
  const P4 = await prof();
  ok(P4.nexusCoins >= 0 && (neg.ok || /Faltam/.test(neg.why || '')), 'sem saldo negativo');
  ok((await p.evaluate(() => GG.bridge.audit(GG.profile.load()))).length === 0, 'livro-razão confere');
  await p.evaluate(() => NX.open('loja', 'capsula')); await p.waitForTimeout(500);
  ok(/Proteção/.test(await p.textContent('#nxAreaBody')), 'cápsula mostra as regras e a proteção contra repetição');

  console.log('[5] Jogo recreativo com poder da equipe');
  const g = await p.evaluate(() => { GG.nexusEco.setTeam(['ciencias_microbio_miojo']); NX.reload(); const pr = NX.games.run('nexus_corrida'); setTimeout(() => { const s = document.querySelector('#nxGame'); s && s.dispatchEvent(new Event('x')); }, 10); return !!pr; });
  await p.waitForTimeout(1500);
  const hud = await p.textContent('#nxGameHud');
  ok(g && /Combo Elástico/.test(hud), 'poder da equipe ativo no jogo recreativo (Combo Elástico)');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300); await p.click('text=🚪 Sair do jogo'); await p.waitForTimeout(400);

  console.log('[6] Área dos Pais');
  const realBefore = await p.evaluate(() => localStorage.getItem('ecoNexus.franchise.v1'));
  await p.goto(url('src/pais/pais.html')); await p.waitForTimeout(900);
  const pin = await p.$$eval('#pLogin input', (l) => l.map((i) => i.type));
  ok(pin.length === 1 && pin[0] === 'password', 'Área dos Pais pede só a senha (sem nome de usuário)');
  await p.fill('#pPass', 'senha-errada'); await p.click('#pGo'); await p.waitForTimeout(300);
  ok(/incorreta/i.test(await p.textContent('#pMsg')) && (await p.isVisible('#pLogin')), 'senha incorreta não entra');
  await p.fill('#pPass', PASS); await p.click('#pGo'); await p.waitForTimeout(1200);
  ok(await p.isVisible('#pApp'), 'senha correta entra');
  const html = await p.content();
  ok(!html.includes(PASS) && !logs.some((l) => l.includes(PASS)), 'a senha não aparece na tela nem nos logs');
  for (const s of ['geral', 'questoes', 'pontos', 'colecao', 'minigames', 'dados']) { await p.click('[data-sec=' + s + ']'); await p.waitForTimeout(600); }
  const qtxt = await p.evaluate(() => { document.querySelector('[data-sec=questoes]').click(); return new Promise((r) => setTimeout(() => r(document.getElementById('pView').innerText), 900)); });
  ok(/L1-Q1|GEO-C1-Q01/.test(qtxt) || /concluídas/.test(qtxt), 'painel lista as questões com tentativas/erros/pistas');
  await p.click('[data-sec=dados]'); await p.waitForTimeout(500);
  const dtxt = await p.textContent('#pView');
  ok(/ecoNexus\.franchise\.v1/.test(dtxt) && /econexus_guardioes_save_v1/.test(dtxt), 'responsável vê todos os dados locais da criança');
  // modo de teste
  await p.click('[data-sec=teste]'); await p.waitForTimeout(400);
  await p.click('text=Iniciar modo de teste'); await p.waitForTimeout(1500);
  ok(await p.isVisible('#ggTestBanner'), 'faixa "MODO DE TESTE DOS PAIS" visível');
  await p.goto(url('src/nexus/nexus.html')); await p.waitForTimeout(2200); await skip();
  const sb = await p.evaluate(() => { const x = GG.profile.load(); return { t: x.testMode, all: x.allContentUnlocked, n: GG.unlocks.available(x).length, total: GG.unlocks.all().length, chars: GG.nexusEco.ownedChars(x).length }; });
  ok(sb.t && sb.all && sb.n === sb.total && sb.chars === 21, 'sandbox: todos os minigames (' + sb.n + ') e 21 Nexóticos liberados');
  await p.evaluate(() => { GG.profile.update((x) => { GG.bridge.credit(x, 999, 'sim-e2e'); }); GG.nexusEco.buyItem('coroa_cristal', 'sb-1'); GG.nexusEco.capsule('sb-cap-1'); });
  ok(await p.isVisible('#ggTestBanner'), 'faixa continua visível no Nexus em teste');
  await p.goto(url('src/pais/pais.html#teste')); await p.waitForTimeout(1200);
  await p.click('text=Sair do modo de teste'); await p.waitForTimeout(1200);
  ok((await p.evaluate(() => localStorage.getItem('ecoNexus.franchise.v1'))) === realBefore, 'sair do teste: perfil real idêntico, byte a byte');
  // sessão expira
  await p.evaluate(() => { const s = JSON.parse(sessionStorage.getItem('ecoNexus.pais.sessao')); s.last = Date.now() - 60 * 60 * 1000; sessionStorage.setItem('ecoNexus.pais.sessao', JSON.stringify(s)); });
  await p.waitForTimeout(1500);
  ok(await p.isVisible('#pLogin'), 'sessão dos pais expira por inatividade');
  // reset reforçado
  await p.fill('#pPass', PASS); await p.click('#pGo'); await p.waitForTimeout(900);
  await p.click('[data-sec=backup]'); await p.waitForTimeout(400);
  await p.click('text=🗑️ Gabriel Nexus (perfil global)'); await p.waitForTimeout(400);
  ok(/Confirme a senha/.test(await p.textContent('.modal')), 'apagar progresso real pede a senha de novo');
  await p.fill('.modal input[type=password]', PASS); await p.click('.modal .btn.pri'); await p.waitForTimeout(400);
  ok(/digite exatamente/i.test(await p.textContent('.modal')), 'e pede a confirmação explícita do alvo');
  await p.click('.modal .btn.ghost'); await p.waitForTimeout(300);
  ok((await p.evaluate(() => localStorage.getItem('ecoNexus.franchise.v1'))) === realBefore, 'cancelar não apaga nada');

  console.log('[7] Regressão rápida e desempenho');
  await p.goto(url('index.html')); await p.waitForTimeout(1200);
  ok(/Missão EcoNexus/.test(await p.title()) && !!(await p.$('#titleBtns')), 'Ciências abre normalmente');
  await p.evaluate(() => localStorage.removeItem('ecoNexus.geografia.v1')); // save sintético do passo [3] (sem as 45 questões)
  await p.goto(url('src/modules/geografia/jogar.html')); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => !!(window.GEO && GEO.app && GEO.mode.kind === 'normal')), 'Geografia abre normalmente (modo normal)');
  await p.goto(url('src/nexus/nexus.html')); await p.waitForTimeout(2000); await skip();
  const fps = await p.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else res(Math.round(n / ((performance.now() - t0) / 1000))); }; requestAnimationFrame(f); }));
  ok(fps >= 30, 'hub a ' + fps + ' quadros/s (desktop)');
  const mob = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const pm = await mob.newPage(); const merr = []; pm.on('pageerror', (e) => merr.push(String(e)));
  await pm.goto(url('inicio.html')); await pm.waitForTimeout(600); await pm.fill('#lgName', 'Gabriel'); await pm.click('.lg-go'); await pm.waitForTimeout(600);
  await pm.goto(url('src/nexus/nexus.html')); await pm.waitForTimeout(2200);
  const over = await pm.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  ok(!over && !merr.length, 'celular (390×844): sem rolagem horizontal e sem erros');
  await mob.close();
  ok(!errs.length, 'sem erros no console' + (errs.length ? ': ' + errs.slice(0, 5).join(' | ') : ''));
  await br.close();
  console.log('\n' + oks + ' ok, ' + fails + ' falha(s)');
  process.exit(fails ? 1 : 0);
})();
