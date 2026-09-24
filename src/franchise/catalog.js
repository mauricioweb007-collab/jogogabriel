/* =====================================================================
   src/franchise/catalog.js — REGISTRO DE COLECIONÁVEIS (Nexóticos).
   Catálogo aberto e "append-only": cada matéria fornece um
   collectiblePack versionado (declarado no manifesto do módulo). O
   registro valida schema, IDs (imutáveis e globalmente únicos),
   raridade, poder (declarativo: tipo + parâmetros, nunca código) e
   asset. Personagem inválido é ignorado e registrado — não quebra os
   demais. IDs existentes nunca são removidos, renumerados ou trocados.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const C = (GG.catalog = { packs: [], list: [], byId: {}, errors: [] });

  /** Tipos de poder aceitos (todos de CONFORTO/APARÊNCIA; nenhum mexe em respostas). */
  C.POWER_TYPES = {
    combo_window: { scope: 'nexus_replay', params: ['seconds'] },
    shield: { scope: 'nexus_replay', params: ['hits'] },
    highlight_interactive: { scope: 'nexus_exploration', params: ['seconds'] },
    speed_boost: { scope: 'nexus_replay', params: ['percent'] },
    magnet: { scope: 'nexus_arcade', params: ['radius'] },
    zoom: { scope: 'nexus_ui', params: ['factor'] },
    extra_jump: { scope: 'nexus_replay', params: ['jumps'] },
    bounce_boost: { scope: 'nexus_replay', params: ['percent'] },
    ghost_run: { scope: 'nexus_replay', params: [] },
    slow_obstacles: { scope: 'nexus_arcade', params: ['percent', 'seconds'] },
    bag_slot: { scope: 'nexus_exploration', params: ['slots'] },
    compass_home: { scope: 'nexus_hub', params: [] },
    route_hint: { scope: 'nexus_hub', params: [] },
    round_delay: { scope: 'nexus_arcade', params: ['seconds'] },
    map_marker: { scope: 'nexus_hub', params: ['markers'] },
    race_accel: { scope: 'nexus_replay', params: ['percent'] },
    move_big_decor: { scope: 'nexus_base', params: [] },
    water_dash: { scope: 'nexus_exploration', params: ['percent'] },
    fast_travel: { scope: 'nexus_hub', params: [] },
    weather: { scope: 'nexus_cosmetic', params: ['modes'] },
    combo_bar: { scope: 'nexus_ui', params: [] }
  };
  C.UNLOCK_TYPES = ['moduleStat', 'shop', 'fragments', 'capsule', 'collection', 'careerPoints', 'arcadeRecord', 'nexusLevel', 'gift'];
  const REQUIRED = ['id', 'name', 'world', 'rarity', 'visual', 'personality', 'idle', 'celebrate', 'sound', 'unlock', 'power', 'asset', 'alt'];
  const ID_RE = /^[a-z][a-z0-9_]{2,60}$/;

  function err(msg) { C.errors.push(msg); if (GG.errlog) GG.errlog.add('catalogo', msg); }

  /** Valida um personagem. Retorna lista de problemas (vazia = ok). */
  C.validateChar = function (ch, pack) {
    const bad = [];
    REQUIRED.forEach((k) => { if (ch[k] == null || ch[k] === '') bad.push('campo ausente: ' + k); });
    if (ch.id && !ID_RE.test(ch.id)) bad.push('id inválido: ' + ch.id);
    if (ch.id && pack && pack.world && ch.id.indexOf(pack.world + '_') !== 0) bad.push('id deve começar com "' + pack.world + '_"');
    if (ch.rarity && !GG.FR.rarityById(ch.rarity)) bad.push('raridade desconhecida: ' + ch.rarity);
    if (ch.power) {
      const t = C.POWER_TYPES[ch.power.type];
      if (!t) bad.push('tipo de poder desconhecido: ' + ch.power.type);
      else t.params.forEach((pn) => { if (typeof (ch.power.params || {})[pn] !== 'number' && !Array.isArray((ch.power.params || {})[pn])) bad.push('parâmetro do poder ausente: ' + pn); });
      if (!ch.power.id || !ch.power.name || !ch.power.description) bad.push('poder sem id/nome/descrição');
    }
    if (Array.isArray(ch.unlock)) ch.unlock.forEach((u) => { if (!C.UNLOCK_TYPES.includes(u.type)) bad.push('forma de desbloqueio desconhecida: ' + u.type); });
    else if (ch.unlock != null) bad.push('unlock deve ser lista');
    return bad;
  };
  /** Registra um pacote. Nunca substitui personagens já registrados. */
  C.registerPack = function (pack, root) {
    if (!pack || !pack.packId || !pack.version || !Array.isArray(pack.characters)) { err('Pacote inválido'); return 0; }
    if (C.packs.some((p) => p.packId === pack.packId)) { err('Pacote repetido: ' + pack.packId); return 0; }
    let n = 0;
    pack.characters.forEach((ch) => {
      const bad = C.validateChar(ch, pack);
      if (C.byId[ch.id]) bad.push('ID já existe (conflito): ' + ch.id);
      if (bad.length) { err(pack.packId + ' / ' + (ch.id || '?') + ': ' + bad.join('; ')); return; }
      const c = Object.assign({}, ch, { pack: pack.packId, packVersion: pack.version, assetUrl: (root || '') + (pack.base || '') + ch.asset });
      C.list.push(c); C.byId[c.id] = c; n++;
    });
    C.packs.push({ packId: pack.packId, version: pack.version, world: pack.world, title: pack.title, count: n });
    return n;
  };
  C.get = (id) => C.byId[id] || null;
  C.worlds = () => Array.from(new Set(C.list.map((c) => c.world)));
  C.byWorld = (w) => C.list.filter((c) => c.world === w);
  C.sorted = (arr) => (arr || C.list).slice().sort((a, b) => (a.world === b.world ? GG.FR.rarityById(a.rarity).order - GG.FR.rarityById(b.rarity).order : 0));

  /** Imagem do personagem com reserva visual (silhueta com iniciais) se o arquivo faltar. */
  C.img = function (ch, cls) {
    const im = document.createElement('img');
    im.alt = ch.alt || ch.name; im.className = cls || ''; im.decoding = 'async'; im.loading = 'lazy'; im.draggable = false;
    im.src = ch.assetUrl;
    im.addEventListener('error', () => { if (!im.dataset.fb) { im.dataset.fb = '1'; im.src = C.fallback(ch); } });
    return im;
  };
  C.fallback = function (ch) {
    const r = GG.FR.rarityById(ch.rarity) || { color: '#888' };
    const ini = String(ch.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="55" r="38" fill="' + r.color + '" opacity=".35"/><circle cx="50" cy="55" r="38" fill="none" stroke="' + r.color + '" stroke-width="4"/><text x="50" y="66" font-size="30" text-anchor="middle" font-family="sans-serif" fill="#fff">' + ini + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };
})();
