/* =====================================================================
   src/modules/ciencias-legacy-adapter/shim.js — REDIRECIONADOR DE SAVE.
   Usado SOMENTE pelas páginas replay.html e teste.html (nunca pelo jogo
   real em index.html). Antes de carregar os scripts de Ciências (que
   estão congelados), troca a chave do save real por uma chave separada
   (window.__CIENCIAS_KEY). Assim o minijogo de replay e o modo de teste
   dos pais funcionam sem ler/gravar "econexus_guardioes_save_v1".
   ===================================================================== */
(function () {
  'use strict';
  var REAL = 'econexus_guardioes_save_v1';
  var target = window.__CIENCIAS_KEY;
  if (!target || target === REAL) throw new Error('Chave de sandbox ausente');
  var sp = Storage.prototype, g = sp.getItem, s = sp.setItem, r = sp.removeItem;
  var map = function (k) { return k === REAL ? target : k; };
  sp.getItem = function (k) { return g.call(this, map(k)); };
  sp.setItem = function (k, v) { return s.call(this, map(k), v); };
  sp.removeItem = function (k) { return r.call(this, map(k)); };
})();
