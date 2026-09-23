/* =====================================================================
   systems/campaign.js — progresso da campanha de Geografia:
   desbloqueio de fases, registro das 45 questões (cobertura,
   tentativas, acerto de primeira, ajuda), pontuação, medalhas
   (bronze/prata/ouro/diamante), recordes, GeoBot, capítulos e final.
   Pontuação mínima NUNCA bloqueia: concluir a fase (com correção
   guiada) sempre libera a próxima.
   ===================================================================== */
(function () {
  'use strict';
  const C = (GEO.campaign = {});
  const D = GEO.data, S = () => GEO.save.S;
  C.MEDALS = [
    { id: 'diamante', t: 'Diamante', icon: '💎', min: 0.95 }, { id: 'ouro', t: 'Ouro', icon: '🥇', min: 0.8 },
    { id: 'prata', t: 'Prata', icon: '🥈', min: 0.6 }, { id: 'bronze', t: 'Bronze', icon: '🥉', min: 0 }
  ];
  C.medalFor = (pct) => C.MEDALS.find((m) => pct >= m.min);
  C.medalRank = (id) => ({ bronze: 1, prata: 2, ouro: 3, diamante: 4 }[id] || 0);
  C.qById = (id) => D.questions.find((q) => q.id === id);
  C.stageList = () => D.stages;

  C.stageState = function (id) {
    const s = S().stages[id]; if (s && s.done) return 'done';
    return C.unlocked(id) ? 'open' : 'locked';
  };
  C.unlocked = function (id) {
    const st = D.stageById[id]; if (!st) return false;
    if (st.bonus) return S().unlockedBonus.includes(id);
    const list = D.stages; const i = list.indexOf(st);
    if (i === 0) return true;
    const prev = list[i - 1];
    return !!(S().stages[prev.id] && S().stages[prev.id].done);
  };
  C.nextStage = () => D.stages.find((st) => C.stageState(st.id) === 'open') || null;
  C.chapterDone = (n) => D.stages.filter((s) => s.ch === n).every((s) => S().stages[s.id] && S().stages[s.id].done);
  C.coverage = function () {
    const ids = D.questions.map((q) => q.id);
    const done = ids.filter((id) => S().q[id].done);
    return { done: done.length, total: ids.length, missing: ids.filter((id) => !S().q[id].done) };
  };
  C.medalCount = function (min) { return Object.values(S().stages).filter((st) => st.best && C.medalRank(st.best.medal) >= C.medalRank(min || 'bronze')).length; };
  C.summary = function () {
    const s = S(); if (!s) return null;
    const cov = C.coverage();
    const lastSt = s.last && D.stageById[s.last.stage];
    return { started: true, name: s.name, percent: Math.round(cov.done / cov.total * 100), last: lastSt ? lastSt.title : '—', medals: C.medalCount('bronze'), done: s.finalDone, coverage: cov.done + '/' + cov.total };
  };

  /** Registra o resultado de uma questão do livro/checagem (campanha). */
  C.recordQ = function (res, ctx) {
    const s = S(), q = C.qById(res.id); if (!q) return { xp: 0, coins: 0, pts: 0 };
    const st = s.q[res.id];
    const first = !st.done;
    st.seen = true; st.attempts += res.attempts; st.errors += Math.max(0, res.attempts - 1);
    st.time += res.time || 0; st.hintUsed = st.hintUsed || res.hintUsed;
    if (res.attempts > 1 || res.guided) st.wrongOnce = true;
    if (first || res.tier < (st.tier || 9)) st.tier = res.tier;
    if (first) { st.first = res.firstTry && !res.hintUsed; st.guided = res.guided; }
    st.done = true; st.doneIn = st.doneIn || (ctx && ctx.mode) || 'aventura';
    if (res.confirmOk != null) st.confirmOk = res.confirmOk;
    const cc = (s.concepts[q.concept] = s.concepts[q.concept] || { ok: 0, wrong: 0 });
    if (res.tier === 1) cc.ok++; else cc.wrong++;
    const rw = D.rewards['tier' + (res.tier || 3)];
    const factor = first ? 1 : (ctx && ctx.factor != null ? ctx.factor : D.rewards.replayFactor);
    const a = GEO.eco.award(rw.xp + (res.confirmOk ? D.rewards.confirm.xp : 0), rw.coins + (res.confirmOk ? D.rewards.confirm.coins : 0), q.id + ' (' + rw.label + ')', factor);
    if (first) s.stars += rw.stars || 0;
    s.time.study += res.time || 0;
    GEO.save.persist();
    return { xp: a.xp, coins: a.coins, pts: rw.pts + (res.confirmOk ? D.rewards.confirm.pts : 0), tier: res.tier };
  };
  C.recordCheck = function (ok, concept) {
    const s = S(); if (ok) s.checks.ok++; else s.checks.wrong++;
    if (concept) { const cc = (s.concepts[concept] = s.concepts[concept] || { ok: 0, wrong: 0 }); if (ok) cc.ok++; else cc.wrong++; }
  };

  /**
   * Conclui uma fase. stats: {learnPts, learnMax, actionPts, actionMax, time, damage, fragments, geobot:{won,time}}
   * Retorna {medal, pct, score, record, rewards, firstClear}.
   */
  C.finishStage = function (id, stats, mode) {
    const s = S(), stDef = D.stageById[id];
    const st = (s.stages[id] = s.stages[id] || { done: false, plays: 0, playsDay: {}, best: null });
    const factor = GEO.eco.replayFactor(id);
    const actionCap = Math.round((stats.learnMax || 100) * 0.3);
    const aMax = Math.min(stats.actionMax || 0, actionCap) || 1;
    const aPts = Math.min(stats.actionPts || 0, aMax);
    const max = (stats.learnMax || 0) + aMax;
    const score = Math.round((stats.learnPts || 0) + aPts);
    let pct = max ? score / max : 1;
    if (mode === 'rapido') pct = stats.learnMax ? (stats.learnPts / stats.learnMax) : 1;
    const medal = C.medalFor(pct);
    const firstClear = !st.done;
    const prevRank = st.best ? C.medalRank(st.best.medal) : 0;
    const record = !st.best || score > st.best.score;
    const day = GG.util.today(); st.playsDay[day] = (st.playsDay[day] || 0) + 1; st.plays++;
    if (!st.best || score > st.best.score) st.best = { score, max, pct: Math.round(pct * 100), medal: medal.id, time: Math.round(stats.time || 0), date: Date.now(), mode };
    else if (C.medalRank(medal.id) > C.medalRank(st.best.medal)) st.best.medal = medal.id;
    if (stats.time && (!st.bestTime || stats.time < st.bestTime)) st.bestTime = Math.round(stats.time);
    if (!stats.damage && mode !== 'rapido') st.noDamage = true;
    if (mode === 'rapido') st.quick = true;
    st.done = true;
    if (stats.geobot) { s.geobot.races++; if (stats.geobot.won) s.geobot.wins++; st.geobotBest = Math.min(st.geobotBest || 9999, Math.round(stats.time)); st.geobotWins = (st.geobotWins || 0) + (stats.geobot.won ? 1 : 0); }
    const rewards = { xp: 0, coins: 0 };
    const add = (r) => { rewards.xp += r.xp; rewards.coins += r.coins; };
    if (!stDef.bonus) add(GEO.eco.award(D.rewards.stage.xp, D.rewards.stage.coins, 'Fase ' + stDef.title, firstClear ? 1 : factor));
    else add(GEO.eco.award(40, 6, 'Sala bônus ' + stDef.title, factor));
    const rankNow = C.medalRank(medal.id);
    if (rankNow > prevRank && rankNow >= 2) { const bonus = D.rewards.medal[medal.id] || 0; add(GEO.eco.award(bonus * 5, bonus, 'Medalha ' + medal.t + ' — ' + stDef.title)); }
    s.last = { stage: id, at: Date.now() };
    s.time.action += Math.max(0, (stats.time || 0) - (stats.studyTime || 0));
    // salas bônus por medalhas de ouro no capítulo
    D.bonus.forEach((b) => { if (!s.unlockedBonus.includes(b.id)) { const golds = D.stages.filter((x) => x.ch === b.ch && s.stages[x.id] && s.stages[x.id].best && C.medalRank(s.stages[x.id].best.medal) >= 3).length; if (golds >= b.need) { s.unlockedBonus.push(b.id); rewards.bonusUnlocked = b; } } });
    // capítulos
    [1, 2, 3].forEach((n) => { if (!s.chaptersDone.includes(n) && C.chapterDone(n)) { s.chaptersDone.push(n); rewards.chapter = n; } });
    // molduras por medalhas
    const fr = []; if (C.medalCount('bronze') >= 3) fr.push('bronze'); if (C.medalCount('prata') >= 5) fr.push('prata'); if (C.medalCount('ouro') >= 8) fr.push('ouro');
    if (Object.values(s.stages).filter((x) => x.best && x.best.medal === 'diamante').length >= 5) fr.push('diamante');
    s.flags.frames = fr;
    GEO.save.persist();
    return { medal, pct, score, max, record, rewards, firstClear, factor };
  };
  /** Final: troféu, moedas e item temático. */
  C.finishCampaign = function () {
    const s = S(); if (s.finalDone) return null;
    s.finalDone = true; s.trophies.push('guardiao_diversidade');
    GEO.eco.give('atlasDourado');
    const r = GEO.eco.award(D.rewards.finalTrophy.xp, D.rewards.finalTrophy.coins, 'Troféu Guardião da Diversidade Brasileira');
    GEO.save.persist();
    return r;
  };
  C.frame = function () { const f = (S().flags.frames || []); return f[f.length - 1] || null; };
  /** Conceitos com dificuldade (para o painel e a revisão). */
  C.weakConcepts = function () {
    return Object.entries(S().concepts).filter(([, v]) => v.wrong > 0).sort((a, b) => (b[1].wrong - b[1].ok) - (a[1].wrong - a[1].ok)).map(([k, v]) => ({ concept: k, ok: v.ok, wrong: v.wrong }));
  };
  /** Questões para revisão priorizando erros. */
  C.reviewQueue = function (all) {
    const s = S();
    const seen = D.questions.filter((q) => s.q[q.id].seen || all);
    const score = (q) => { const st = s.q[q.id]; return (st.wrongOnce ? 5 : 0) + (st.guided ? 4 : 0) + (st.tier === 3 ? 3 : st.tier === 2 ? 2 : 0) + st.reviewWrong * 2 - st.reviewOk; };
    return seen.slice().sort((a, b) => score(b) - score(a));
  };
})();
