/* =====================================================================
   src/franchise/replay.js — CAIXA DE RESULTADOS DOS REPLAYS (GG.replay).
   Um minigame de matéria aberto pelo Fliperama (modo replay) grava aqui
   o resultado recreativo {token, gameId, score 0–100} e volta ao Nexus.
   O Nexus lê a caixa, registra recorde/medalha e esvazia. Isso NUNCA
   alimenta a Pontuação de Carreira (replay não é estudo novo).
   No modo de teste dos pais a caixa é outra (sandbox).
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const R = (GG.replay = {});
  R.KEY = 'ecoNexus.nexus.inbox.v1';
  const key = () => (GG.testMode ? GG.testMode.key(R.KEY) : R.KEY);
  R.params = () => { const q = new URLSearchParams(location.search); const o = {}; q.forEach((v, k) => { o[k] = v; }); return o; };
  const TOKEN_RE = /^[a-z0-9-]{4,80}$/i, GAME_RE = /^[a-z0-9_]{3,60}$/;
  R.list = function () { try { const v = JSON.parse(localStorage.getItem(key()) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  /** Guarda o resultado (valida tudo; valores da URL nunca são aceitos sem conferência). */
  R.push = function (gameId, score, token) {
    if (!GAME_RE.test(String(gameId)) || !TOKEN_RE.test(String(token))) return false;
    const s = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    const l = R.list().filter((x) => x.token !== token);
    l.push({ token, gameId, score: s, at: new Date().toISOString() });
    try { localStorage.setItem(key(), JSON.stringify(l.slice(-50))); return true; } catch (e) { return false; }
  };
  R.drain = function () { const l = R.list(); try { localStorage.setItem(key(), '[]'); } catch (e) { /* ok */ } return l; };
  /** Volta para o Fliperama do Nexus. root = caminho até a raiz do projeto. */
  R.back = function (root) { location.href = (root || '') + 'src/nexus/nexus.html#fliperama'; };
})();
