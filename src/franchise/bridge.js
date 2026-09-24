/* =====================================================================
   src/franchise/bridge.js — ScoreBridge (GG.bridge): PONTE DE PONTUAÇÃO.
   Recebe resultados válidos das matérias e alimenta o perfil global:
     • Pontuação de Carreira (histórica, nunca diminui ao gastar);
     • Moedas Nexus (gastáveis; 1 moeda a cada GG.FR.pointsPerCoin pontos,
       o resto fica acumulado em conversionRemainder).
   Garantias:
     • IDEMPOTENTE — o mesmo eventId nunca soma duas vezes (appliedEvents);
     • só inteiros; livro-razão de pontos (scoreLedger) e de moedas
       (transactionLedger) com identificador único; recalculável (audit);
     • testMode:true NUNCA entra no perfil real (e evento real não entra
       no sandbox);
     • fila local (outbox) para eventos enviados pelos jogos — processada
       sem duplicar, mesmo entre abas/sessões;
     • importação inicial por módulo registrada em migrationMarkers.
   As matérias atuais são lidas por ADAPTADORES (scoreAdapter no
   manifesto) que derivam eventos estáveis do save — sem alterar o jogo.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const B = (GG.bridge = {});
  B.OUTBOX = 'ecoNexus.franchise.outbox.v1';
  const SOURCE_TYPES = ['mission', 'question', 'boss', 'achievement'];
  const EVT_RE = /^[a-z0-9][a-z0-9_.:@\-]{2,159}$/i;
  const isInt = (n) => typeof n === 'number' && Number.isInteger(n);
  const nowIso = () => new Date().toISOString();

  /** Valida um evento contra o perfil atual. Retorna texto do problema ou null. */
  B.validate = function (ev, p) {
    if (!ev || typeof ev !== 'object') return 'evento vazio';
    if (ev.schemaVersion !== 1) return 'schemaVersion inválida';
    if (typeof ev.eventId !== 'string' || !EVT_RE.test(ev.eventId)) return 'eventId inválido';
    if (typeof ev.moduleId !== 'string' || !/^[a-z0-9_]{2,40}$/.test(ev.moduleId)) return 'moduleId inválido';
    if (GG.modules && GG.modules.list().length && !GG.modules.get(ev.moduleId)) return 'módulo não registrado';
    if (ev.profileId !== p.profileId) return 'profileId diferente';
    if (!SOURCE_TYPES.includes(ev.sourceType)) return 'sourceType inválido';
    if (typeof ev.sourceId !== 'string' || !ev.sourceId || ev.sourceId.length > 120) return 'sourceId inválido';
    if (typeof ev.runId !== 'string' || ev.runId.length > 120) return 'runId inválido';
    if (!isInt(ev.scoreEarned) || ev.scoreEarned < 0 || ev.scoreEarned > GG.FR.maxEventScore) return 'scoreEarned inválido';
    if (typeof ev.occurredAt !== 'string' || isNaN(Date.parse(ev.occurredAt))) return 'occurredAt inválido';
    if (typeof ev.testMode !== 'boolean') return 'testMode ausente';
    if (ev.testMode && !p.testMode) return 'evento de teste recusado no perfil real';
    if (!ev.testMode && p.testMode) return 'evento real recusado no sandbox';
    return null;
  };
  /** Monta um evento estável a partir do resultado de um adaptador. */
  B.makeEvent = function (p, moduleId, r) {
    return {
      schemaVersion: 1,
      eventId: moduleId + ':' + r.sourceType + ':' + r.sourceId + (r.variant ? ':' + r.variant : ''),
      moduleId, profileId: p.profileId,
      sourceType: r.sourceType, sourceId: String(r.sourceId), runId: String(r.runId || 'save'),
      scoreEarned: r.scoreEarned | 0,
      occurredAt: r.occurredAt || nowIso(),
      testMode: !!p.testMode
    };
  };
  /** Aplica um evento no objeto de perfil (sem gravar). */
  B.apply = function (p, ev) {
    const bad = B.validate(ev, p);
    if (bad) return { applied: false, reason: bad };
    if (p.appliedEvents[ev.eventId]) return { applied: false, reason: 'duplicado' };
    const pts = ev.scoreEarned, ppc = GG.FR.pointsPerCoin;
    p.careerPoints += pts;
    p.conversionRemainder += pts;
    const coins = Math.floor(p.conversionRemainder / ppc);
    p.conversionRemainder -= coins * ppc;
    p.nexusCoins += coins; p.coinsEarnedTotal += coins;
    p.appliedEvents[ev.eventId] = 1;
    p.scoreLedger.push({ eventId: ev.eventId, moduleId: ev.moduleId, sourceType: ev.sourceType, sourceId: ev.sourceId, runId: ev.runId, points: pts, coins, occurredAt: ev.occurredAt, appliedAt: nowIso() });
    if (coins) B.txn(p, { txnId: 'earn:' + ev.eventId, type: 'earn', amount: coins, ref: ev.eventId, label: 'Estudo: ' + ev.moduleId });
    return { applied: true, points: pts, coins };
  };
  /** Registra uma transação de moedas (idempotente pelo txnId). */
  B.txn = function (p, t) {
    if (p.appliedTxns[t.txnId]) return false;
    p.appliedTxns[t.txnId] = 1;
    p.transactionLedger.push(Object.assign({ at: nowIso(), balance: p.nexusCoins }, t));
    return true;
  };
  /** Gasta moedas. Nunca deixa saldo negativo. Idempotente pelo txnId. */
  B.spend = function (p, amount, txnId, meta) {
    if (!isInt(amount) || amount < 0) return { ok: false, why: 'valor inválido' };
    if (p.appliedTxns[txnId]) return { ok: true, repeated: true };
    if (p.nexusCoins < amount) return { ok: false, why: 'Faltam ' + (amount - p.nexusCoins) + ' Moedas Nexus.' };
    p.nexusCoins -= amount; p.coinsSpentTotal += amount;
    B.txn(p, Object.assign({ txnId, type: 'spend', amount: -amount }, meta || {}));
    return { ok: true };
  };
  /** Crédito extra — SOMENTE no sandbox (simulação dos pais). */
  B.credit = function (p, amount, txnId, meta) {
    if (!p.testMode) return { ok: false, why: 'crédito manual só no modo de teste' };
    if (!isInt(amount) || amount <= 0 || p.appliedTxns[txnId]) return { ok: false };
    p.nexusCoins += amount;
    B.txn(p, Object.assign({ txnId, type: 'credit', amount }, meta || {}));
    return { ok: true };
  };
  /** Confere se os totais batem com os livros-razão. Retorna lista de problemas. */
  B.audit = function (p) {
    const out = [];
    const pts = p.scoreLedger.reduce((a, e) => a + e.points, 0);
    if (pts !== p.careerPoints) out.push('Pontuação de Carreira difere do livro-razão (' + pts + ' ≠ ' + p.careerPoints + ')');
    const earned = Math.floor(pts / GG.FR.pointsPerCoin);
    if (earned !== p.coinsEarnedTotal) out.push('Moedas ganhas diferem da conversão (' + earned + ' ≠ ' + p.coinsEarnedTotal + ')');
    if (pts % GG.FR.pointsPerCoin !== p.conversionRemainder) out.push('Resto de conversão incorreto');
    const bal = p.transactionLedger.reduce((a, t) => a + t.amount, 0);
    if (bal !== p.nexusCoins) out.push('Saldo difere do livro-razão de moedas (' + bal + ' ≠ ' + p.nexusCoins + ')');
    if (p.nexusCoins < 0) out.push('Saldo negativo');
    return out;
  };

  /* ---------------- fila local (outbox) ---------------- */
  const obKey = () => (GG.testMode ? GG.testMode.key(B.OUTBOX) : B.OUTBOX);
  B.outbox = function () { try { const v = JSON.parse(localStorage.getItem(obKey()) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  /** Um jogo pode ENVIAR um evento: ele fica na fila até a próxima sincronização. */
  B.submit = function (ev) {
    const l = B.outbox();
    if (!l.some((x) => x && x.eventId === ev.eventId)) l.push(ev);
    try { localStorage.setItem(obKey(), JSON.stringify(l.slice(-500))); return true; } catch (e) { return false; }
  };

  /**
   * Sincroniza: lê os saves das matérias pelos adaptadores, aplica os
   * eventos novos, processa a fila, libera minigames e colecionáveis.
   * opts.modules: lista de manifestos (padrão: todos os registrados).
   * Retorna {points, coins, events, migrated:[], minigames:[], collectibles:[], rejected:[]}.
   */
  B.sync = function (opts) {
    opts = opts || {};
    const mods = opts.modules || (GG.modules ? GG.modules.list() : []);
    const out = { points: 0, coins: 0, events: 0, migrated: [], minigames: [], collectibles: [], rejected: [], modules: {} };
    const queued = B.outbox();
    const p = GG.profile.load();
    mods.forEach((m) => {
      const F = m.franchise; if (!F || !F.saveNamespace) return;
      const save = GG.modules ? GG.modules.readSave(m) : null;
      const marker = F.moduleId + '@' + F.version;
      const first = !p.migrationMarkers[marker];
      let mp = 0, mc = 0, mn = 0;
      if (save) {
        let rs = [];
        try { rs = F.scoreAdapter(save) || []; } catch (e) { GG.errlog && GG.errlog.add('adaptador ' + F.moduleId, e.message); }
        rs.forEach((r) => {
          const res = B.apply(p, B.makeEvent(p, F.moduleId, r));
          if (res.applied) { mp += res.points; mc += res.coins; mn++; }
          else if (res.reason !== 'duplicado') out.rejected.push(F.moduleId + ': ' + res.reason);
        });
        let st = {};
        try { st = F.stats ? F.stats(save) : {}; } catch (e) { st = {}; }
        p.moduleSummaries[F.moduleId] = Object.assign({ title: F.title, version: F.version, syncedAt: nowIso(), hasSave: true }, st);
        try { (F.unlockedMinigames ? F.unlockedMinigames(save) : []).forEach((id) => { if (!p.unlockedMinigames[id]) { p.unlockedMinigames[id] = { at: nowIso(), module: F.moduleId }; out.minigames.push(id); } }); } catch (e) { /* ignora */ }
      } else if (!p.moduleSummaries[F.moduleId]) {
        p.moduleSummaries[F.moduleId] = { title: F.title, version: F.version, hasSave: false, percent: 0 };
      }
      if (first && save) {
        p.migrationMarkers[marker] = { at: nowIso(), source: F.saveNamespace, method: 'eventos derivados do save (1 por conquista)', events: mn, points: mp, coins: mc };
        out.migrated.push({ moduleId: F.moduleId, title: F.title, points: mp, coins: mc, events: mn });
      }
      out.points += mp; out.coins += mc; out.events += mn;
      out.modules[F.moduleId] = { points: mp, coins: mc, events: mn };
    });
    // fila enviada pelos jogos
    queued.forEach((ev) => {
      const res = B.apply(p, ev);
      if (res.applied) { out.points += res.points; out.coins += res.coins; out.events++; }
      else if (res.reason !== 'duplicado') out.rejected.push('fila: ' + res.reason);
    });
    // minigames recreativos do Nexus por nível
    GG.unlocks.minigames.forEach((g) => { if (!p.unlockedMinigames[g.minigameId] && g.rule && g.rule(p)) { p.unlockedMinigames[g.minigameId] = { at: nowIso(), module: 'nexus' }; out.minigames.push(g.minigameId); } });
    if (opts.collectibles !== false) out.collectibles = GG.unlocks.applyAutoCollectibles(p);
    p.lastSyncAt = nowIso();
    const ok = GG.profile.save(p);
    if (ok && queued.length) { try { localStorage.setItem(obKey(), '[]'); } catch (e) { /* ignora */ } }
    out.saved = ok;
    out.profile = p;
    return out;
  };
})();
