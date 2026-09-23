/* =====================================================================
   src/tests/ciencias-regressao.cjs — PROVA DE QUE CIÊNCIAS NÃO MUDOU.
   1) Compara o SHA-256 de todos os arquivos do módulo de Ciências com a
      linha de base gravada antes da atualização (ciencias-baseline.sha256).
   2) Roda os testes originais de Ciências (tools/audit.cjs e
      tools/features.cjs) numa CÓPIA temporária, para não gravar nada na
      pasta do projeto, e exige o mesmo resultado de antes.
   3) Abre index.html com um save de Ciências existente e confirma que a
      chave "econexus_guardioes_save_v1" continua idêntica após abrir e
      após abrir/usar o lançador e o módulo de Geografia.
   Uso: node src/tests/ciencias-regressao.cjs [--rapido]  (--rapido pula features.cjs)
   ===================================================================== */
const fs = require('fs'), path = require('path'), crypto = require('crypto'), os = require('os'), cp = require('child_process');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const ROOT = path.join(__dirname, '..', '..');
const quick = process.argv.includes('--rapido');
let fails = 0; const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };

(async () => {
  console.log('[1] Arquivos de Ciências idênticos à linha de base');
  const base = fs.readFileSync(path.join(__dirname, 'ciencias-baseline.sha256'), 'utf8').trim().split('\n').map((l) => { const i = l.indexOf(' '); return [l.slice(0, i), l.slice(i).trim()]; });
  let changed = 0;
  base.forEach(([h, f]) => { const p = path.join(ROOT, f); const now = fs.existsSync(p) ? crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex') : 'AUSENTE'; if (now !== h) { changed++; console.log('    alterado: ' + f); } });
  ok(changed === 0, base.length + ' arquivos verificados, ' + changed + ' alterados');

  console.log('[2] Testes originais de Ciências (em cópia temporária)');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cie-'));
  const files = base.map((b) => b[1]);
  files.forEach((f) => { const d = path.join(tmp, f); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(path.join(ROOT, f), d); });
  const audit = cp.spawnSync(process.execPath, [path.join(tmp, 'tools', 'audit.cjs')], { encoding: 'utf8' });
  ok(/nenhum problema encontrado/.test(audit.stdout), 'tools/audit.cjs: ' + (audit.stdout.trim().split('\n').pop() || audit.stderr));
  if (!quick) {
    const feat = cp.spawnSync(process.execPath, [path.join(tmp, 'tools', 'features.cjs')], { encoding: 'utf8', timeout: 20 * 60 * 1000 });
    const nOk = (feat.stdout.match(/✓/g) || []).length;
    ok(/todos os testes passaram/.test(feat.stdout), 'tools/features.cjs: ' + nOk + ' verificações ✓ — ' + (feat.stdout.trim().split('\n').pop() || feat.stderr.slice(0, 200)));
  }

  console.log('[3] Save de Ciências não é migrado nem regravado pelo lançador/Geografia');
  const browser = await pw.chromium.launch();
  const page = await browser.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  const KEY = 'econexus_guardioes_save_v1';
  await page.goto('file://' + path.join(ROOT, 'inicio.html'));
  // save real de Ciências criado pelo próprio jogo de Ciências
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.waitForTimeout(1200);
  await page.evaluate(() => { localStorage.clear(); EN.save.newGame('Gabriel'); EN.save.S.coins = 77; EN.save.S.q['L1-Q1'].done = true; EN.save.persist(); });
  // sair de Ciências (o próprio jogo de Ciências pode salvar ao fechar); a foto "antes" é tirada fora dele
  await page.goto('file://' + path.join(ROOT, 'inicio.html')); await page.waitForTimeout(1000);
  const before = await page.evaluate((k) => localStorage.getItem(k), KEY);
  const cardTxt = await page.evaluate(() => document.getElementById('lnCards').innerText);
  ok(/Ciências/.test(cardTxt) && /Geografia/.test(cardTxt), 'lançador mostra Ciências e Geografia');
  ok(/2% concluído|\d+% concluído/.test(cardTxt), 'lançador lê o progresso de Ciências sem gravar');
  await page.goto('file://' + path.join(ROOT, 'src', 'modules', 'geografia', 'jogar.html')); await page.waitForTimeout(1200);
  await page.click('text=Começar ▶'); await page.waitForTimeout(600);
  await page.evaluate(() => { GEO.save.S.coins = 999; GEO.save.persist(); GEO.save.reset(); });
  await page.goto('file://' + path.join(ROOT, 'inicio.html')); await page.waitForTimeout(800);
  const after = await page.evaluate((k) => localStorage.getItem(k), KEY);
  ok(before === after, 'chave de Ciências idêntica byte a byte após lançador + Geografia + reinício de Geografia');
  const geoGone = await page.evaluate(() => localStorage.getItem('ecoNexus.geografia.v1'));
  ok(geoGone === null, 'reiniciar Geografia apaga só "ecoNexus.geografia.v1"');
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(1500);
  const cont = await page.evaluate(() => document.getElementById('titleBtns').innerText);
  ok(/Continuar/.test(cont), 'Ciências abre pela rota antiga e oferece “Continuar” com o save antigo');
  ok(!errs.length, 'sem erros de página' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(fails ? '\nResultado: ' + fails + ' falha(s)' : '\nResultado: Ciências intacta');
  process.exit(fails ? 1 : 0);
})();
