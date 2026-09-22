/* =====================================================================
   systems/quests.js — SISTEMA DE MISSÕES: missão principal por etapas
   (lições em ordem), desbloqueio linear das regiões, objetivo atual
   (com rota entre mapas para "mostrar caminho" e Bússola), missões
   secundárias e cálculo de domínio por região.
   ===================================================================== */
EN.quests = (function () {
  'use strict';
  const D = EN.data;
  const Q = {};
  const S = () => EN.save.S;

  /* ---------------- lições ---------------- */
  Q.lessonDone = (id) => !!(S().lessons[id] && S().lessons[id].done);
  Q.regionOf = (lid) => D.lessons[lid].region;
  Q.regionUnlocked = function (rid) {
    const n = D.regionById[rid].n;
    return n === 1 || Q.regionComplete('r' + (n - 1));
  };
  Q.regionComplete = (rid) => !!(S().regionStats[rid] && S().regionStats[rid].complete);
  Q.allRegionsDone = () => D.regions.every((r) => Q.regionComplete(r.id));
  Q.currentLesson = function (rid) {
    if (!Q.regionUnlocked(rid)) return null;
    return D.regionById[rid].lessons.find((l) => !Q.lessonDone(l)) || null;
  };
  Q.lessonFrac = function (rid) {
    const ls = D.regionById[rid].lessons;
    return ls.filter(Q.lessonDone).length / ls.length;
  };
  Q.visitsMissing = function (lid) {
    const L = D.lessons[lid];
    return (L.requiresVisit || []).filter((id) => !S().seenEnt[id]);
  };
  /** 'done' | 'current' | 'needvisit' | 'locked' */
  Q.lessonState = function (lid) {
    if (Q.lessonDone(lid)) return 'done';
    const rid = Q.regionOf(lid);
    if (Q.currentLesson(rid) !== lid) return 'locked';
    return Q.visitsMissing(lid).length ? 'needvisit' : 'current';
  };
  Q.activeRegion = function () {
    return D.regions.find((r) => Q.regionUnlocked(r.id) && !Q.regionComplete(r.id)) || null;
  };

  /* ---------------- objetivo atual ---------------- */
  Q.objective = function () {
    const s = S();
    const r = Q.activeRegion();
    if (r) {
      const lid = Q.currentLesson(r.id);
      if (!lid) return { text: 'Vá até o Altar do Cristal (' + r.name + ') para o Desafio da Região', entity: 'altar_' + r.id, region: r.id };
      const L = D.lessons[lid];
      const miss = Q.visitsMissing(lid);
      if (miss.length) return { text: L.visitText + ' (' + (L.requiresVisit.length - miss.length) + '/' + L.requiresVisit.length + ')', entity: miss[0], region: r.id };
      return { text: L.obj, entity: L.entity, region: r.id, lesson: lid };
    }
    if (!s.storyDone) return { text: 'Os seis cristais brilham! Entre no Portal da Arena Final, na Vila, e toque no Núcleo da Névoa', entity: 'nucleo', region: 'arena' };
    return { text: 'História concluída! Faça a “Revisão antes da prova” (menu ☰) e explore as áreas bônus', entity: null, region: null };
  };

  const PARENT = { loja: 'vila', casa: 'vila', r1: 'vila', r2: 'vila', r3: 'vila', r4: 'vila', r5: 'vila', r6: 'vila', arena: 'vila', bonus_copa: 'r1', bonus_caverna: 'r2', bonus_lab: 'r3', bonus_mergulho: 'r4', bonus_biomas: 'r6' };
  const ENTRANCE = { r1: 'portal_regioes', r2: 'portal_regioes', r3: 'portal_regioes', r4: 'portal_regioes', r5: 'portal_regioes', r6: 'portal_regioes', arena: 'portal_arena', loja: 'loja_porta', casa: 'casa_porta' };

  function zoneOf(def, x, y) {
    return (def.zones || []).find((z) => x >= z.rect[0] && y >= z.rect[1] && x < z.rect[0] + z.rect[2] && y < z.rect[1] + z.rect[3]) || null;
  }
  const tile = (id) => { const e = D.entityIndex[id]; return e ? { tx: e.x, ty: e.y, map: e.map } : null; };

  /** Alvo do objetivo no mapa atual (entidade, ou a saída que leva até ele). */
  Q.objectiveTarget = function (curMap, px, py) {
    const o = Q.objective();
    if (!o.entity) return null;
    const t = tile(o.entity);
    if (!t) return null;
    if (t.map === curMap) {
      const def = D.maps[curMap];
      if (def.zones) {
        const zt = zoneOf(def, t.tx, t.ty), zp = zoneOf(def, px, py);
        if (zt !== zp) {
          if (zp) return tile(zp.ret);
          if (zt) return tile(zt.portal);
        }
      }
      return t;
    }
    if (curMap === 'vila') return tile(ENTRANCE[PARENT[t.map] === 'vila' ? t.map : PARENT[t.map]] || 'portal_regioes');
    // subir para o mapa "pai" pela saída
    const parent = PARENT[curMap];
    const ex = (D.maps[curMap].extra || []).find((e) => e.portal && e.portal.map === parent);
    return ex ? { tx: ex.x, ty: ex.y, map: curMap } : null;
  };

  /** Texto do objetivo com a rota quando o alvo está em outro mapa. */
  Q.objectiveText = function (curMap) {
    const o = Q.objective();
    if (!o.entity) return o.text;
    const t = tile(o.entity);
    if (!t || t.map === curMap) return o.text;
    let pre;
    if (curMap === 'vila') pre = t.map === 'arena' ? 'Entre no Portal da Arena (leste da praça)' : 'Vá ao Portal das Regiões (norte da Vila) e viaje para ' + D.maps[PARENT[t.map] === 'vila' ? t.map : PARENT[t.map]].name;
    else if (PARENT[curMap] === 'vila') pre = 'Volte para a Vila pelo portal de saída';
    else pre = 'Saia desta área bônus';
    return pre + ' → ' + o.text;
  };

  /* ---------------- missões secundárias ---------------- */
  Q.side = (id) => D.sides[id];
  Q.sideState = function (id) {
    const st = S().side[id];
    if (!st) return 'none';
    if (st.state === 'done') return 'done';
    return Q.sideProgress(id) >= Q.sideGoal(id) ? 'ready' : 'active';
  };
  Q.sideGoal = (id) => { const sd = D.sides[id]; return sd.type === 'collect' ? sd.count : sd.targets.length; };
  Q.sideProgress = function (id) {
    const sd = D.sides[id];
    if (sd.type === 'collect') { let n = 0; for (let i = 0; i < sd.count; i++) if (S().picked['side:' + id + i]) n++; return n; }
    return sd.targets.filter((t) => S().seenEnt[t]).length;
  };
  Q.sideAccept = function (id) { S().side[id] = { state: 'active', t: Date.now() }; EN.save.persist('missão aceita'); };
  Q.sideFinish = function (id) {
    S().side[id].state = 'done';
    const r = D.sides[id].reward;
    EN.eco.award(r.xp, r.coins, 'Missão secundária: ' + D.sides[id].title);
    EN.save.persist('missão concluída');
  };
  Q.sidesOf = (region) => Object.values(D.sides).filter((s) => s.region === region);

  /* ---------------- domínio (percentual) ---------------- */
  Q.questionsOf = (rid) => D.questions.filter((q) => q.region === rid);
  const tierScore = [0, 1, 0.7, 0.4];
  Q.questionScore = function (qid) { const st = S().q[qid]; return st && st.done ? tierScore[st.tier] || 0.4 : 0; };
  Q.regionQuestionMastery = function (rid) {
    const qs = Q.questionsOf(rid);
    return qs.reduce((a, q) => a + Q.questionScore(q.id), 0) / qs.length;
  };
  Q.mastery = function (rid) {
    const st = S().regionStats[rid] || {};
    const qm = Q.regionQuestionMastery(rid);
    return st.challenge === undefined ? qm : 0.7 * qm + 0.3 * st.challenge;
  };
  Q.overallMastery = function () {
    const qs = D.questions;
    return qs.reduce((a, q) => a + Q.questionScore(q.id), 0) / qs.length;
  };
  Q.coverage = function () {
    const done = D.REQUIRED_IDS.filter((id) => S().q[id] && S().q[id].done && S().q[id].seen).length;
    return { done, total: D.REQUIRED_IDS.length };
  };
  /** Progresso total da história (lições + desafios + arena). */
  Q.totalProgress = function () {
    const all = D.regions.reduce((a, r) => a + r.lessons.length + 1, 0) + 1;
    let n = 0;
    D.regions.forEach((r) => { n += r.lessons.filter(Q.lessonDone).length + (Q.regionComplete(r.id) ? 1 : 0); });
    if (S().storyDone) n++;
    return n / all;
  };
  Q.regionProgress = function (rid) {
    const r = D.regionById[rid];
    return (r.lessons.filter(Q.lessonDone).length + (Q.regionComplete(rid) ? 1 : 0)) / (r.lessons.length + 1);
  };

  return Q;
})();
