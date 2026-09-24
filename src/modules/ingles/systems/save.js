/* =====================================================================
   systems/mode.js + save.js — MODO DE EXECUÇÃO E SAVE ISOLADO DE INGLÊS.
   Chave real: "ecoNexus.ingles.v1" (só Inglês). Modos:
     • normal  → save real da criança;
     • replay  → jogar.html?replay=<minijogo>&token=… (Fliperama do Nexus):
                 save temporário "ecoNexus.replay.ingles.v1", sem pontos;
     • teste   → jogar.html?teste=1 (Área dos Pais com modo de teste ativo):
                 save sandbox "ecoNexus.teste.ecoNexus.ingles.v1", tudo
                 liberado, com atalhos &ato= &passo= &questao= &minijogo=
                 &licao= &final=1 &revisao=1 &tela=… (todos validados).
   Salva ao concluir cada questão, bloco, minijogo e ato: dá para
   continuar exatamente de onde parou.
   ===================================================================== */
(function () {
  'use strict';
  const ING = window.ING, D = ING.data;
  const REAL = 'ecoNexus.ingles.v1';
  const q = new URLSearchParams(location.search);
  const M = (ING.mode = { kind: 'normal', key: REAL, unlockAll: false });
  const replay = q.get('replay'), token = q.get('token') || '';
  if (q.get('teste') === '1') {
    if (!(GG.testMode && GG.testMode.active())) { location.replace('../../pais/pais.html#teste-necessario'); M.blocked = true; }
    else {
      M.kind = 'teste'; M.key = GG.testMode.keyFor(REAL); M.unlockAll = true;
      const a = q.get('ato'); if (a && D.acts.some((x) => x.id === a)) M.act = a;
      const p = q.get('passo'); if (M.act && /^\d{1,2}$/.test(p || '') && +p < D.stepsOf(M.act).length) M.step = +p;
      const qq = q.get('questao'); if (qq && D.byId(qq)) M.question = qq;
      const mj = q.get('minijogo'); if (mj && D.games[mj]) M.game = mj;
      const li = q.get('licao'); if (li && D.lessons[li]) M.lesson = li;
      if (q.get('final') === '1') M.final = true;
      if (q.get('revisao') === '1') M.review = true;
      const tl = q.get('tela'); if (tl && /^(intro|bilhete-[123]|fim|mapa)$/.test(tl)) M.screen = tl;
    }
  } else if (replay && D.games[replay]) {
    M.kind = 'replay'; M.key = 'ecoNexus.replay.ingles.v1'; M.unlockAll = true; M.game = replay;
    M.token = /^[a-z0-9-]{4,80}$/i.test(token) ? token : null;
  }
  M.isTest = () => M.kind === 'teste';
  M.isReplay = () => M.kind === 'replay';

  /* ================================================================ save */
  const SV = (ING.save = {});
  SV.REAL = REAL;
  SV.KEY = M.key;
  SV.S = null;
  SV.settingsDefault = () => ({ textSize: 1, contrast: false, reduceMotion: false, music: 0.35, sfx: 0.7, voice: 0.9, osk: 'auto' });
  SV.qFresh = () => ({ seen: false, done: false, tier: 0, attempts: 0, errors: 0, hints: 0, alt: false, first: false, typed: [], time: 0, reviewOk: 0, reviewWrong: 0 });
  SV.fresh = function (name) {
    const qq = {}; D.questions.forEach((x) => { qq[x.id] = SV.qFresh(); });
    const acts = {}; D.acts.forEach((a) => { acts[a.id] = { step: 0, qi: 0, done: false, doneAt: null }; });
    return {
      v: 1, module: 'ingles', name: (name || 'Gabriel').trim().slice(0, 24) || 'Gabriel',
      created: Date.now(), updated: Date.now(), introDone: false, settings: SV.settingsDefault(),
      q: qq, acts, cur: 'a1', tickets: [], finalDone: false, final: { plays: 0, ok: 0, wrong: 0, doneAt: null },
      mg: {}, rewards: [], time: { total: 0, sessions: 0 }, summary: null, flags: {}
    };
  };
  SV.load = function () {
    const data = GG.store.read(SV.KEY);
    if (!data || data.v !== 1) return false;
    const base = SV.fresh(data.name);
    SV.S = Object.assign(base, data);
    SV.S.settings = Object.assign(SV.settingsDefault(), data.settings || {});
    D.questions.forEach((x) => { SV.S.q[x.id] = Object.assign(SV.qFresh(), (data.q || {})[x.id] || {}); });
    D.acts.forEach((a) => { SV.S.acts[a.id] = Object.assign({ step: 0, qi: 0, done: false, doneAt: null }, (data.acts || {})[a.id] || {}); });
    return true;
  };
  SV.newGame = function (name) { SV.S = SV.fresh(name); SV.persist(); return SV.S; };
  SV.summary = function () {
    const S = SV.S, core = D.questions.filter((x) => x.core), all = core.length, done = core.filter((x) => S.q[x.id].done).length;
    const extras = D.questions.filter((x) => !x.core && S.q[x.id].done).length;
    const act = D.acts.find((a) => a.id === S.cur) || D.acts[0];
    return { percent: Math.round(done * 100 / all), done, all, extras, tickets: S.tickets.length, last: S.finalDone ? 'Passagem de Volta 🏁' : 'Ato ' + act.n + ' — ' + act.title };
  };
  SV.persist = function () {
    if (!SV.S) return false;
    SV.S.updated = Date.now(); SV.S.summary = SV.summary();
    return GG.store.write(SV.KEY, SV.S);
  };
  SV.reset = function () { GG.store.remove(SV.KEY); SV.S = null; };
})();
