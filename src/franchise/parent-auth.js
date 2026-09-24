/* =====================================================================
   src/franchise/parent-auth.js — ACESSO DA ÁREA DOS PAIS + MODO DE TESTE.
   O projeto é 100% estático (sem servidor). Por isso a senha NÃO fica
   no repositório: guardamos só um hash SHA-256 iterado com sal. Isso é
   uma BARREIRA FAMILIAR, não segurança forte contra quem inspeciona o
   código. Para trocar a senha: src/tools/nexus-senha.cjs (ver
   jogodogabriel.md). A senha nunca é mostrada, registrada ou enviada.
   - Tentativas: após N falhas seguidas, espera curta.
   - Sessão: sessionStorage (fecha com a aba) + expiração por inatividade.
   - Modo de teste: perfil sandbox separado; só existe com sessão ativa.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const SALT = '1548d5ec0e4d5500454e1d1c66363ac4';
  const ITER = 12000;
  const HASH = 'e70f45a45c21923177b71386b6f200ceb87df40f19da18da1c4f5fcfe9ca5d17';
  const GUARD = 'ecoNexus.pais.guard.v1', CONF = 'ecoNexus.pais.config.v1', SESS = 'ecoNexus.pais.sessao', TEST = 'ecoNexus.teste.ativo';
  const now = () => Date.now();
  const jget = (st, k) => { try { return JSON.parse(st.getItem(k) || 'null'); } catch (e) { return null; } };
  const jset = (st, k, v) => { try { st.setItem(k, JSON.stringify(v)); } catch (e) { /* ignora */ } };
  const del = (st, k) => { try { st.removeItem(k); } catch (e) { /* ignora */ } };

  const PA = (GG.parentAuth = {});
  PA.config = () => Object.assign({ sessionMinutes: GG.FR.parent.sessionMinutesDefault }, jget(localStorage, CONF) || {});
  PA.setConfig = (patch) => jset(localStorage, CONF, Object.assign(PA.config(), patch));
  PA.guard = () => Object.assign({ fails: 0, lockUntil: 0 }, jget(localStorage, GUARD) || {});
  PA.lockedFor = () => Math.max(0, Math.ceil((PA.guard().lockUntil - now()) / 1000));

  /** Confere a senha. Retorna {ok} ou {ok:false, wait} (segundos de espera). Nunca registra a senha. */
  PA.verify = function (secret) {
    const wait = PA.lockedFor();
    if (wait > 0) return { ok: false, wait };
    const ok = typeof secret === 'string' && secret.length > 0 && secret.length < 200 && GG.stretch(secret, SALT, ITER) === HASH;
    const g = PA.guard();
    if (ok) { jset(localStorage, GUARD, { fails: 0, lockUntil: 0 }); return { ok: true }; }
    g.fails++;
    if (g.fails >= GG.FR.parent.maxAttempts) { g.lockUntil = now() + GG.FR.parent.lockSeconds * 1000; g.fails = 0; }
    jset(localStorage, GUARD, g);
    return { ok: false, wait: PA.lockedFor() };
  };
  /** Confirma a senha de novo (operações sensíveis) sem abrir outra sessão. */
  PA.reconfirm = (secret) => PA.verify(secret).ok;

  PA.login = function (secret) {
    const r = PA.verify(secret);
    if (r.ok) jset(sessionStorage, SESS, { start: now(), last: now() });
    return r;
  };
  PA.active = function () {
    const s = jget(sessionStorage, SESS); if (!s) return false;
    if (now() - s.last > PA.config().sessionMinutes * 60000) { PA.logout(); return false; }
    return true;
  };
  PA.remaining = function () { const s = jget(sessionStorage, SESS); return s ? Math.max(0, Math.ceil((s.last + PA.config().sessionMinutes * 60000 - now()) / 1000)) : 0; };
  PA.touch = function () { const s = jget(sessionStorage, SESS); if (s) { s.last = now(); jset(sessionStorage, SESS, s); } };
  PA.logout = function () { del(sessionStorage, SESS); del(sessionStorage, TEST); };
  /** Mantém a sessão viva enquanto o responsável interage na página. */
  PA.watchActivity = function () {
    let lastTouch = 0;
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => window.addEventListener(ev, () => { if (now() - lastTouch > 3000 && PA.active()) { lastTouch = now(); PA.touch(); } }, { passive: true }));
  };

  /* ================================================================ MODO DE TESTE */
  const TM = (GG.testMode = {});
  TM.active = () => { let f = false; try { f = sessionStorage.getItem(TEST) === '1'; } catch (e) { f = false; } return f && PA.active(); };
  TM.start = function () { if (!PA.active()) return false; try { sessionStorage.setItem(TEST, '1'); } catch (e) { return false; } return true; };
  TM.stop = function () { del(sessionStorage, TEST); };
  /** Chave sandbox equivalente a uma chave real (nunca a mesma). */
  TM.keyFor = (realKey) => 'ecoNexus.teste.' + realKey;
  /** Chave a usar agora: real para o aluno, sandbox no modo de teste. */
  TM.key = (realKey) => (TM.active() ? TM.keyFor(realKey) : realKey);
  /** Remove SOMENTE as chaves sandbox (reiniciar o sandbox). */
  TM.resetSandbox = function () {
    try {
      const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('ecoNexus.teste.') === 0) ks.push(k); }
      ks.forEach((k) => localStorage.removeItem(k));
      return ks.length;
    } catch (e) { return 0; }
  };
  /** Faixa permanente “MODO DE TESTE DOS PAIS”. root = caminho até a raiz do projeto. */
  TM.banner = function (root) {
    if (!TM.active() || document.getElementById('ggTestBanner')) return;
    const b = document.createElement('div');
    b.id = 'ggTestBanner'; b.setAttribute('role', 'status');
    b.innerHTML = '<b>🧪 MODO DE TESTE DOS PAIS</b><span class="gg-tb-t">Nada feito aqui altera o progresso real da criança.</span>';
    const mk = (t, fn) => { const x = document.createElement('button'); x.type = 'button'; x.textContent = t; x.addEventListener('click', fn); b.appendChild(x); };
    mk('Painel dos pais', () => { location.href = (root || '') + 'src/pais/pais.html'; });
    mk('Sair do teste', () => { TM.stop(); location.href = (root || '') + 'src/pais/pais.html#saiu'; });
    document.body.appendChild(b); document.body.classList.add('gg-testing');
    PA.watchActivity();
    setInterval(() => { if (!TM.active()) { location.href = (root || '') + 'src/pais/pais.html#expirou'; } }, 15000);
  };
})();
