/* =====================================================================
   systems/save.js — SAVE ISOLADO E VERSIONADO DE GEOGRAFIA.
   Chave: "ecoNexus.geografia.v1". Guarda perfil, XP, EcoMoedas,
   inventário, configurações, fases, desempenho, questões erradas,
   recordes e desbloqueios SOMENTE desta matéria.
   Nunca lê para gravar, migra ou apaga "econexus_guardioes_save_v1"
   (Ciências). Apagar/reiniciar este save não afeta Ciências.
   ===================================================================== */
(function () {
  'use strict';
  const SV = (GEO.save = {});
  // Chave real do aluno; replay do Fliperama e modo de teste dos pais usam chaves separadas (systems/mode.js).
  SV.KEY = (GEO.mode && GEO.mode.key) || 'ecoNexus.geografia.v1';
  SV.S = null;
  SV.settingsDefault = () => ({ textSize: 1, contrast: false, reduceMotion: false, autoRead: false, music: 0.5, sfx: 0.7, voice: 0.9, touch: 'auto', bindings: null, pace: 'aventura' });

  SV.fresh = function (name) {
    const q = {};
    GEO.data.questions.forEach((x) => { q[x.id] = { seen: false, done: false, doneIn: null, attempts: 0, first: false, tier: 0, guided: false, hintUsed: false, confirmOk: null, errors: 0, time: 0, reviewOk: 0, reviewWrong: 0, wrongOnce: false }; });
    return {
      v: 1, module: 'geografia_2026_09',
      name: (name || 'Gabriel').trim().slice(0, 24) || 'Gabriel',
      created: Date.now(), updated: Date.now(), introDone: false,
      settings: SV.settingsDefault(),
      xp: 0, coins: 0, earned: 0, spent: 0, ledger: [],
      inv: [], equip: {}, fragments: 0, stars: 0,
      q, checks: { ok: 0, wrong: 0 }, concepts: {},
      stages: {}, chaptersDone: [], finalDone: false, trophies: [], unlockedBonus: [], parque: {},
      time: { study: 0, action: 0, total: 0, sessions: 0 },
      reviewLog: [], quickLog: [], geobot: { wins: 0, races: 0 },
      last: null, lastSession: null, summary: null, flags: {}
    };
  };
  SV.exists = function () { return !!GG.store.read(SV.KEY); };
  SV.load = function () {
    const data = GG.store.read(SV.KEY);
    if (!data || data.v !== 1) return false;
    const base = SV.fresh(data.name);
    SV.S = Object.assign(base, data);
    SV.S.settings = Object.assign(SV.settingsDefault(), data.settings || {});
    GEO.data.questions.forEach((x) => { if (!SV.S.q[x.id]) SV.S.q[x.id] = base.q[x.id]; });
    return true;
  };
  SV.newGame = function (name) { SV.S = SV.fresh(name); SV.persist(); return SV.S; };
  SV.persist = function () {
    if (!SV.S) return false;
    SV.S.updated = Date.now();
    SV.S.summary = GEO.campaign ? GEO.campaign.summary() : SV.S.summary;
    return GG.store.write(SV.KEY, SV.S);
  };
  /** Apaga SOMENTE o save de Geografia. */
  SV.reset = function () { GG.store.remove(SV.KEY); SV.S = null; };
  SV.export = () => JSON.stringify(SV.S, null, 2);
})();
