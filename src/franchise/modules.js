/* =====================================================================
   src/franchise/modules.js — ModuleManifestRegistry + UnlockRegistry.
   GG.modules: descobre as matérias pelos manifestos (src/modules/
   modulos.js) e carrega seus collectiblePacks. Nenhum "if" por matéria:
   tudo vem do bloco `franchise` de cada manifesto (contrato abaixo).
   GG.unlocks: metadados de minigames (das matérias e do Nexus) e regras
   de liberação de minigames e colecionáveis.

   CONTRATO `franchise` (em manifest.js de cada matéria):
     moduleId, title, version ('1.0.0'), cover, entryRoute,
     saveNamespace (chave do save real; o sandbox deriva dela),
     scoreAdapter(save)  → [{sourceType, sourceId, scoreEarned, occurredAt}]
     stats(save)         → {percent, questionsDone, questionsTotal, firstTry,
                            missionsDone, missionsTotal, bossesDone, worldDone}
     unlockedMinigames(save) → [minigameId]
     minigames: [ metadados — ver GG.unlocks.MINIGAME_FIELDS ]
     collectiblePacks: ['caminho/relativo/à/raiz/pacote.js']
     questionBank: { scripts:[...], build() → [questões normalizadas] } (Área dos Pais)
     testEntry(opts) → url do jogo no modo de teste (sandbox)
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const M = (GG.modules = { loaded: false });

  /** Carrega manifestos + pacotes. root = caminho da página até a raiz do projeto. */
  M.load = async function (root, opts) {
    root = root || ''; GG.ROOT = root; opts = opts || {};
    if (!M.loaded) {
      try { await GG.util.loadScripts((GG.MODULE_MANIFESTS || []).map((s) => root + s)); } catch (e) { GG.errlog && GG.errlog.add('manifestos', e.message); }
      M.loaded = true;
    }
    if (opts.packs !== false && !M.packsLoaded) {
      const packs = [];
      M.list().forEach((m) => (m.franchise.collectiblePacks || []).forEach((p) => packs.push(root + p)));
      for (const src of packs) { try { await GG.util.loadScripts([src]); } catch (e) { GG.errlog && GG.errlog.add('pacote', e.message); } }
      M.packsLoaded = true;
    }
    return M.list();
  };
  /** Módulos com contrato de franquia (inclui matérias “em breve”, que só trazem pacote). */
  M.list = () => (GG.registry ? GG.registry.list : []).filter((m) => m.franchise && m.franchise.moduleId);
  M.get = (moduleId) => M.list().find((m) => m.franchise.moduleId === moduleId) || null;
  /** Lê o save de um módulo (real ou sandbox) — SOMENTE leitura. */
  M.readSave = function (m) {
    const key = GG.testMode ? GG.testMode.key(m.franchise.saveNamespace) : m.franchise.saveNamespace;
    if (!key) return null;
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  };

  /* ================================================================ UnlockRegistry */
  const UN = (GG.unlocks = { minigames: [] });
  UN.MINIGAME_FIELDS = ['minigameId', 'module', 'title', 'description', 'entry', 'controls', 'unlockText', 'freePlay', 'parentTest', 'records', 'genre', 'assets', 'deps'];
  /** Todos os minigames conhecidos: das matérias (manifestos) + recreativos do Nexus (registrados pelo Nexus). */
  UN.all = function () {
    const mods = [];
    M.list().forEach((m) => (m.franchise.minigames || []).forEach((g) => mods.push(Object.assign({ module: m.franchise.moduleId }, g))));
    return mods.concat(UN.minigames);
  };
  UN.registerNative = function (g) { if (!UN.minigames.some((x) => x.minigameId === g.minigameId)) UN.minigames.push(g); };
  UN.get = (id) => UN.all().find((g) => g.minigameId === id) || null;
  UN.isUnlocked = (p, id) => !!(p.allContentUnlocked || p.unlockedMinigames[id]);
  UN.available = (p) => UN.all().filter((g) => UN.isUnlocked(p, g.minigameId));

  /* ---------------- colecionáveis ---------------- */
  UN.ownedInWorld = (p, world, exceptId) => Object.keys(p.collectibles).filter((id) => id !== exceptId && GG.catalog.get(id) && GG.catalog.get(id).world === world).length;
  UN.arcadeMedals = (p) => Object.values(p.arcade.medals || {}).reduce((a, m) => a + (m.bronze ? 1 : 0) + (m.prata ? 1 : 0) + (m.ouro ? 1 : 0), 0);
  /** Avalia UMA condição automática. Retorna {ok, have, need, label}. */
  UN.cond = function (p, u) {
    const ms = (mod) => (p.moduleSummaries[mod] || {});
    switch (u.type) {
      case 'moduleStat': { const have = Number(ms(u.module)[u.stat] || 0) | 0; return { ok: have >= u.min, have, need: u.min, label: u.label }; }
      case 'careerPoints': return { ok: p.careerPoints >= u.min, have: p.careerPoints, need: u.min, label: u.label || ('Pontuação de Carreira ' + u.min) };
      case 'nexusLevel': { const lv = GG.FR.levelFor(p.careerPoints).level; return { ok: lv >= u.min, have: lv, need: u.min, label: u.label || ('Nível do Nexus ' + u.min) }; }
      case 'collection': { const have = UN.ownedInWorld(p, u.world, u.self); return { ok: have >= u.count, have, need: u.count, label: u.label }; }
      case 'arcadeRecord': { const have = UN.arcadeMedals(p); return { ok: have >= u.medals, have, need: u.medals, label: u.label || ('Medalhas de Fliperama ' + u.medals) }; }
      case 'gift': return { ok: true, have: 1, need: 1, label: u.label || 'Presente de boas-vindas' };
      default: return { ok: false, have: 0, need: 1, label: '' };
    }
  };
  const AUTO = ['moduleStat', 'careerPoints', 'nexusLevel', 'collection', 'arcadeRecord', 'gift'];
  /** Resumo das formas de conseguir um personagem. */
  UN.charInfo = function (p, ch) {
    const owned = !!p.collectibles[ch.id] || !!p.allContentUnlocked;
    const autos = ch.unlock.filter((u) => AUTO.includes(u.type)).map((u) => Object.assign({ type: u.type }, UN.cond(p, Object.assign({ self: ch.id }, u))));
    const shop = ch.unlock.find((u) => u.type === 'shop');
    const frag = ch.unlock.find((u) => u.type === 'fragments');
    const rar = GG.FR.rarityById(ch.rarity);
    return {
      owned, autos, autoOk: autos.some((a) => a.ok),
      price: shop ? shop.price : null,
      fragmentCost: frag ? (frag.cost || rar.fragmentCost) : null,
      capsule: ch.unlock.some((u) => u.type === 'capsule')
    };
  };
  /** Aplica liberações automáticas de personagens (chamado pela ponte). Retorna ids novos. */
  UN.applyAutoCollectibles = function (p) {
    const out = [];
    if (!GG.catalog) return out;
    for (let pass = 0; pass < 3; pass++) { // coleções podem liberar em cadeia
      GG.catalog.list.forEach((ch) => {
        if (p.collectibles[ch.id]) return;
        const inf = UN.charInfo(p, ch);
        if (inf.autoOk) { const via = inf.autos.find((a) => a.ok); p.collectibles[ch.id] = { at: new Date().toISOString(), via: 'auto:' + via.type, label: via.label || '' }; out.push(ch.id); }
      });
    }
    return out;
  };
})();
