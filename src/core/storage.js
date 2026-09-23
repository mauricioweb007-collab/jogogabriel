/* =====================================================================
   src/core/storage.js — armazenamento local isolado por módulo.
   Cada módulo novo grava apenas na própria chave versionada
   (ex.: "ecoNexus.geografia.v1"). A chave antiga de Ciências
   ("econexus_guardioes_save_v1") é somente LIDA pelo lançador, nunca
   gravada, migrada ou apagada por este código.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const ST = (GG.store = {});
  /** Chaves legadas que o código novo está proibido de gravar/apagar. */
  ST.FROZEN = ['econexus_guardioes_save_v1'];

  ST.read = function (key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  };
  ST.write = function (key, obj) {
    if (ST.FROZEN.includes(key)) throw new Error('Chave congelada: ' + key);
    try { localStorage.setItem(key, JSON.stringify(obj)); return true; } catch (e) { return false; }
  };
  ST.remove = function (key) {
    if (ST.FROZEN.includes(key)) throw new Error('Chave congelada: ' + key);
    try { localStorage.removeItem(key); } catch (e) { /* sem armazenamento */ }
  };
  /** Preferências gerais do lançador (última matéria escolhida). */
  ST.LAUNCHER = 'ecoNexus.launcher.v1';
  ST.launcher = () => ST.read(ST.LAUNCHER) || { last: null, visits: 0 };
  ST.setLauncher = (patch) => ST.write(ST.LAUNCHER, Object.assign(ST.launcher(), patch));
})();
