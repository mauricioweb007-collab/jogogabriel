/* =====================================================================
   systems/save.js — ESTADO DO JOGO e salvamento automático no
   localStorage do próprio aparelho. Nada é enviado para a internet.
   ===================================================================== */
EN.save = (function () {
  'use strict';
  const KEY = 'econexus_guardioes_save_v1';
  const SV = {};
  SV.S = null;

  /** Estado inicial de um novo jogo. */
  SV.fresh = function (name) {
    const q = {};
    EN.data.questions.forEach((x) => {
      q[x.id] = { seen: false, done: false, attempts: 0, first: false, errors: 0, tier: 0, stars: 0, time: 0, guided: false, reviewOk: 0, reviewWrong: 0, recovered: false, wrongOnce: false };
    });
    return {
      v: 1,
      name: (name || 'Gabriel').trim().slice(0, 24) || 'Gabriel',
      created: Date.now(), updated: Date.now(),
      map: 'vila', pos: null, introDone: false,
      flags: {}, lessons: {}, seenEnt: {}, visitedMaps: {},
      q, concepts: {}, acts: { total: 0, firstOk: 0, wrong: 0 },
      xp: 0, coins: 0, earned: 0, spent: 0, ledger: [],
      inv: ['uni_classico', 'lumi_classica'], equip: { roupa: 'uni_classico', lumi: 'lumi_classica' }, purchases: [],
      side: {}, picked: {}, fragments: 0, seeds: 0,
      medals: [], crystals: [], regionStats: {}, chestsOpened: {},
      mg: {}, mgBudget: { plays: 0 }, medallion: 0, cantilUsed: {},
      garden: [], gardenRare: [],
      time: { total: 0, region: {} },
      arena: { round: 0, best: 0, done: false, last: null, bonusWon: false, tries: 0 },
      storyDone: false, reviewSessions: 0, reviewLog: [],
      settings: { sound: false, tts: true, path: false, hudMin: false, touch: 'auto', bigText: false },
      log: []
    };
  };

  SV.exists = function () {
    try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
  };

  SV.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      const base = SV.fresh(data.name);
      // mescla para tolerar versões antigas do salvamento
      SV.S = Object.assign(base, data);
      SV.S.q = Object.assign(base.q, data.q || {});
      SV.S.settings = Object.assign(SV.fresh().settings, data.settings || {});
      SV.S.arena = Object.assign(SV.fresh().arena, data.arena || {});
      return true;
    } catch (e) { console.warn('Falha ao carregar o salvamento', e); return false; }
  };

  SV.newGame = function (name) {
    SV.S = SV.fresh(name);
    SV.persist('novo jogo');
    return SV.S;
  };

  let lastToast = 0;
  /** Salvamento automático (entrar em área, missão, compra, pergunta…). */
  SV.persist = function (reason) {
    if (!SV.S) return false;
    SV.S.updated = Date.now();
    try {
      localStorage.setItem(KEY, JSON.stringify(SV.S));
      if (reason && EN.ui && EN.ui.saveBadge && Date.now() - lastToast > 1500) { lastToast = Date.now(); EN.ui.saveBadge(); }
      return true;
    } catch (e) { console.warn('Não foi possível salvar', e); return false; }
  };

  SV.reset = function () {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ }
    SV.S = null;
  };

  SV.log = function (text) {
    if (!SV.S) return;
    SV.S.log.push({ t: Date.now(), text });
    if (SV.S.log.length > 200) SV.S.log.shift();
  };

  return SV;
})();
