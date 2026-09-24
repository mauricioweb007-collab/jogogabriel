/* =====================================================================
   systems/mode.js — MODO DE EXECUÇÃO DO MÓDULO (integração com o Nexus).
   Decide, ANTES do save carregar, qual chave usar:
     • normal  → "ecoNexus.geografia.v1" (save real do aluno, como antes);
     • replay  → jogar.html?replay=<fase>&token=… (aberto pelo Fliperama):
                 save temporário "ecoNexus.replay.geografia.v1"; o resultado
                 volta ao Nexus como recorde e NÃO vale pontos de estudo;
     • teste   → jogar.html?teste=1 (Área dos Pais, com sessão de teste
                 ativa): save sandbox, tudo liberado, fase/questão direta.
   Nenhum parâmetro da URL é aceito sem validação.
   ===================================================================== */
(function () {
  'use strict';
  const q = new URLSearchParams(location.search);
  const REAL = 'ecoNexus.geografia.v1';
  const ids = (GEO.data.stages || []).concat(GEO.data.bonus || []).map((s) => s.id);
  const M = (GEO.mode = { kind: 'normal', key: REAL, unlockAll: false });
  const replay = q.get('replay'), token = q.get('token') || '';
  if (q.get('teste') === '1') {
    if (!(GG.testMode && GG.testMode.active())) { location.replace('../../pais/pais.html#teste-necessario'); M.blocked = true; return; }
    M.kind = 'teste'; M.key = GG.testMode.keyFor(REAL); M.unlockAll = true;
    const f = q.get('fase'); if (f && ids.includes(f)) M.stage = f;
    const qq = q.get('questao'); if (qq && GEO.data.questions.some((x) => x.id === qq)) M.question = qq;
  } else if (replay && ids.includes(replay)) {
    M.kind = 'replay'; M.key = 'ecoNexus.replay.geografia.v1'; M.unlockAll = true; M.stage = replay;
    M.token = /^[a-z0-9-]{4,80}$/i.test(token) ? token : null;
  }
  M.isReplay = () => M.kind === 'replay';
  M.isTest = () => M.kind === 'teste';
})();
