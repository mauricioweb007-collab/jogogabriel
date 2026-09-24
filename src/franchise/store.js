/* =====================================================================
   src/franchise/store.js — GRAVAÇÃO SEGURA NO localStorage.
   GG.fstore.write(chave, obj): grava primeiro em "<chave>.tmp", confere
   a leitura, guarda a versão anterior em "<chave>.bak" e só então troca
   a chave principal (estratégia equivalente a gravação atômica).
   GG.fstore.read(chave): lê a principal; se estiver corrompida, recupera
   de ".bak" e depois de ".tmp".
   Também contém GG.errlog: registro local de erros técnicos (Área dos
   Pais), sem dados pessoais e sem envio para a internet.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const FS = (GG.fstore = {});
  const parse = (raw) => { if (!raw) return null; try { return JSON.parse(raw); } catch (e) { return undefined; } };

  FS.raw = function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } };
  FS.read = function (key) {
    for (const k of [key, key + '.bak', key + '.tmp']) {
      const v = parse(FS.raw(k));
      if (v && typeof v === 'object') { if (k !== key) GG.errlog && GG.errlog.add('store', 'Recuperado de ' + k); return v; }
    }
    return null;
  };
  FS.write = function (key, obj) {
    if (GG.store && GG.store.FROZEN && GG.store.FROZEN.includes(key)) throw new Error('Chave congelada: ' + key);
    const json = JSON.stringify(obj);
    try {
      localStorage.setItem(key + '.tmp', json);
      if (localStorage.getItem(key + '.tmp') !== json) throw new Error('Falha na conferência');
      const prev = localStorage.getItem(key);
      if (prev) localStorage.setItem(key + '.bak', prev);
      localStorage.setItem(key, json);
      localStorage.removeItem(key + '.tmp');
      return true;
    } catch (e) {
      GG.errlog && GG.errlog.add('store', 'Falha ao gravar ' + key + ': ' + (e && e.message));
      return false;
    }
  };
  FS.remove = function (key) {
    if (GG.store && GG.store.FROZEN && GG.store.FROZEN.includes(key)) throw new Error('Chave congelada: ' + key);
    try { [key, key + '.tmp', key + '.bak'].forEach((k) => localStorage.removeItem(k)); } catch (e) { /* sem armazenamento */ }
  };

  /* ---------------- registro de erros técnicos (anel de 60) ---------------- */
  const EKEY = 'ecoNexus.erros.v1';
  const EL = (GG.errlog = {});
  EL.KEY = EKEY;
  EL.list = function () { const v = parse(FS.raw(EKEY)); return Array.isArray(v) ? v : []; };
  EL.add = function (where, msg) {
    try {
      const l = EL.list();
      l.push({ t: new Date().toISOString(), where: String(where).slice(0, 40), page: String(location.pathname.split('/').slice(-2).join('/')).slice(0, 60), msg: String(msg).slice(0, 300) });
      while (l.length > 60) l.shift();
      localStorage.setItem(EKEY, JSON.stringify(l));
    } catch (e) { /* ignora */ }
  };
  EL.clear = function () { try { localStorage.removeItem(EKEY); } catch (e) { /* ignora */ } };
  if (!window.__ggErrHooked) {
    window.__ggErrHooked = true;
    window.addEventListener('error', (ev) => EL.add('erro', (ev.message || 'erro') + (ev.filename ? ' @' + String(ev.filename).split('/').pop() + ':' + ev.lineno : '')));
    window.addEventListener('unhandledrejection', (ev) => EL.add('promessa', ev.reason && ev.reason.message ? ev.reason.message : String(ev.reason)));
  }
})();
