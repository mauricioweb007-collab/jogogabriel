/* =====================================================================
   src/franchise/profile.js — FranchiseProfileService (GG.profile).
   UM único perfil infantil local por navegador (chave
   "ecoNexus.franchise.v1"). O nome é só personalização: trocar o nome
   NUNCA cria outro perfil nem reinicia nada. Não há contas, senhas ou
   seleção de perfis para a criança.
   No modo de teste dos pais usa-se outro perfil ("ecoNexus.teste.…"),
   isolado, com todo o conteúdo liberado. Os dois nunca se misturam.
   Versão do schema + migrações em GG.profile.migrate().
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const P = (GG.profile = {});
  P.KEY = 'ecoNexus.franchise.v1';
  P.SCHEMA = 1;

  P.key = () => (GG.testMode && GG.testMode.active() ? GG.testMode.keyFor(P.KEY) : P.KEY);
  P.isTest = () => !!(GG.testMode && GG.testMode.active());

  /** Normaliza o nome: NFC, sem espaços nas pontas, espaços internos simples, MAIÚSCULAS pt-BR (mantém acentos). */
  P.normalizeName = function (s) {
    return String(s == null ? '' : s).normalize('NFC').replace(/[\u0000-\u001f<>]/g, '').trim().replace(/\s+/g, ' ').slice(0, 30).toLocaleUpperCase('pt-BR');
  };
  const uid = () => {
    const r = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return 'gx-' + Date.now().toString(36) + '-' + r(10);
  };
  P.uid = uid;

  P.fresh = function (test) {
    const t = new Date().toISOString();
    return {
      schemaVersion: P.SCHEMA,
      profileId: (test ? 'teste-' : '') + uid(),
      displayNameUppercase: '',
      careerPoints: 0, nexusCoins: 0, conversionRemainder: 0, coinsEarnedTotal: 0, coinsSpentTotal: 0,
      nexusLevel: 1,
      moduleSummaries: {},
      scoreLedger: [], appliedEvents: {},
      transactionLedger: [], appliedTxns: {},
      unlockedMinigames: {},
      collectibles: {}, fragments: 0, capsule: { misses: 0, opened: 0 },
      inventory: {}, equipped: { frame: null, outfit: null, hat: null, trail: null, entry: null, victory: null, title: null, palette: null, music: null },
      team: [], companion: null, parkVisible: [],
      decorations: { placed: [], template: null },
      achievements: {},
      migrationMarkers: {},
      arcade: { records: {}, medals: {}, plays: {}, favorites: [], tourney: null, tourneys: 0, cosmeticRewards: {} },
      hub: { marker: null, weather: 'sol', lastArea: 'praca', bag: { day: '', picked: 0 }, pickups: {} },
      expedition: null, expeditionsDay: { day: '', n: 0 },
      seen: { welcome: false, lastSummaryAt: null, dialogs: {} },
      pending: [],
      time: { nexusSec: 0, sessions: 0 },
      settings: { music: 0.5, sfx: 0.7, voice: 0.9, textSize: 1, contrast: false, reduceMotion: false, autoRead: false, captions: true, touch: 'auto', bindings: null },
      materials: 0, crafted: {}, charAcc: {},
      createdAt: t, updatedAt: t, lastSyncAt: null,
      isolated: !!test, allContentUnlocked: !!test, testMode: !!test
    };
  };

  /** Migrações de schema (cada passo guarda backup antes). */
  P.migrations = {
    // Exemplo para o futuro: 2: (p) => { p.novoCampo = ...; return p; }
  };
  P.migrate = function (p, key) {
    let changed = false;
    if (!p.schemaVersion) p.schemaVersion = 1;
    while (P.migrations[p.schemaVersion + 1]) {
      try { localStorage.setItem(key + '.pre-v' + (p.schemaVersion + 1), JSON.stringify(p)); } catch (e) { /* ignora */ }
      p = P.migrations[p.schemaVersion + 1](p); p.schemaVersion++; changed = true;
    }
    // campos novos com valores padrão (tolerância a versões antigas)
    const base = P.fresh(p.testMode);
    for (const k in base) if (p[k] === undefined) { p[k] = base[k]; changed = true; }
    ['equipped', 'arcade', 'hub', 'seen', 'time', 'settings', 'decorations', 'capsule'].forEach((k) => { p[k] = Object.assign({}, base[k], p[k] || {}); });
    return { p, changed };
  };

  P.exists = () => !!GG.fstore.read(P.key());
  /** Lê o perfil atual (criando um novo se não existir). Nunca apaga um perfil existente. */
  P.load = function () {
    const key = P.key();
    let p = GG.fstore.read(key);
    if (!p) { p = P.fresh(P.isTest()); GG.fstore.write(key, p); return p; }
    const m = P.migrate(p, key); p = m.p;
    if (m.changed) GG.fstore.write(key, p);
    return p;
  };
  P.save = function (p) {
    p.updatedAt = new Date().toISOString();
    p.nexusLevel = GG.FR.levelFor(p.careerPoints).level;
    return GG.fstore.write(P.key(), p);
  };
  /** Ler-modificar-gravar (relê antes de mudar para não perder alterações de outra aba). */
  P.update = function (fn) {
    const p = P.load();
    const r = fn(p);
    P.save(p);
    return r === undefined ? p : r;
  };
  /** Define o nome exibido. Mantém o MESMO perfil e o progresso. */
  P.setName = function (raw) {
    const n = P.normalizeName(raw);
    if (!n) return null;
    P.update((p) => { p.displayNameUppercase = n; });
    return n;
  };
  /** Sugestão de nome a partir dos saves existentes (somente leitura). */
  P.suggestName = function () {
    const p = GG.fstore.read(P.KEY);
    if (p && p.displayNameUppercase) return p.displayNameUppercase;
    for (const k of ['ecoNexus.geografia.v1', 'econexus_guardioes_save_v1']) {
      try { const s = JSON.parse(localStorage.getItem(k) || 'null'); if (s && s.name) return P.normalizeName(s.name); } catch (e) { /* ignora */ }
    }
    return '';
  };
  P.name = function () { const p = P.load(); return p.displayNameUppercase || 'EXPLORADOR'; };
})();
