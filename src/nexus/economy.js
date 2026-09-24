/* =====================================================================
   src/nexus/economy.js — ECONOMIA DO GABRIEL NEXUS (GG.nexusEco) e
   PODERES DOS NEXÓTICOS (GG.powers).
   Toda operação lê o perfil, valida, grava de uma vez (GG.profile.update)
   e usa um txnId único: repetir/recarregar nunca cobra duas vezes nem
   desfaz uma compra concluída. Saldo nunca fica negativo.
   Repetir minigames no Fliperama NÃO gera pontos de estudo nem moedas:
   só recordes, Medalhas de Fliperama e recompensas cosméticas limitadas.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const E = (GG.nexusEco = {});
  const B = () => GG.bridge, FR = () => GG.FR;
  const iso = () => new Date().toISOString();
  const today = () => iso().slice(0, 10);

  E.owns = (p, id) => !!(p.allContentUnlocked || p.inventory[id]);
  E.hasChar = (p, id) => !!(p.allContentUnlocked ? GG.catalog.get(id) : p.collectibles[id]);
  E.ownedChars = (p) => GG.catalog.list.filter((c) => E.hasChar(p, c.id));
  E.materials = (p) => (p.allContentUnlocked ? 99 : (p.materials | 0));
  /** Gerador determinístico a partir do txnId (o resultado de uma cápsula nunca muda ao recarregar). */
  function rngFrom(s) {
    let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /** Compra de item da loja. */
  E.buyItem = function (id, txnId) {
    const it = GG.NEXUS_ITEMS.find((i) => i.id === id);
    if (!it) return { ok: false, why: 'Item inexistente.' };
    return GG.profile.update((p) => {
      if (p.appliedTxns[txnId]) return { ok: true, repeated: true };
      if (it.slot !== 'fragments' && p.inventory[id] && !it.repeatable) return { ok: false, why: 'Você já tem este item.' };
      const r = B().spend(p, it.price, txnId, { label: 'Loja: ' + it.name, item: id });
      if (!r.ok) return r;
      if (it.slot === 'fragments') p.fragments += it.amount;
      else p.inventory[id] = { at: iso(), txnId };
      if (it.slot === 'decor') E._placeNew(p, id);
      return { ok: true };
    });
  };
  /** Equipa (ou tira, com id null) um item de um slot. */
  E.equip = function (slot, id) {
    return GG.profile.update((p) => {
      if (id && !E.owns(p, id) && !(p.arcade.cosmeticRewards || {})[id]) return { ok: false };
      p.equipped[slot] = id || null; return { ok: true };
    });
  };
  /** Compra direta de Nexótico (quando o pacote permite). */
  E.buyChar = function (charId, txnId) {
    const ch = GG.catalog.get(charId); if (!ch) return { ok: false, why: 'Personagem inexistente.' };
    const shop = ch.unlock.find((u) => u.type === 'shop'); if (!shop) return { ok: false, why: 'Este Nexótico não é vendido: conquiste-o!' };
    return GG.profile.update((p) => {
      if (p.appliedTxns[txnId]) return { ok: true, repeated: true };
      if (p.collectibles[charId]) return { ok: false, why: 'Você já tem este Nexótico.' };
      const r = B().spend(p, shop.price, txnId, { label: 'Nexótico: ' + ch.name, char: charId });
      if (!r.ok) return r;
      p.collectibles[charId] = { at: iso(), via: 'compra', txnId };
      GG.unlocks.applyAutoCollectibles(p);
      return { ok: true };
    });
  };
  /** Troca fragmentos por um Nexótico. */
  E.exchangeFragments = function (charId, txnId) {
    const ch = GG.catalog.get(charId); if (!ch) return { ok: false };
    const u = ch.unlock.find((x) => x.type === 'fragments'); if (!u) return { ok: false, why: 'Este Nexótico não pode ser trocado por fragmentos.' };
    const cost = u.cost || FR().rarityById(ch.rarity).fragmentCost;
    return GG.profile.update((p) => {
      if (p.appliedTxns[txnId]) return { ok: true, repeated: true };
      if (p.collectibles[charId]) return { ok: false, why: 'Você já tem este Nexótico.' };
      if (p.fragments < cost) return { ok: false, why: 'Faltam ' + (cost - p.fragments) + ' fragmentos.' };
      p.fragments -= cost; p.collectibles[charId] = { at: iso(), via: 'fragmentos', txnId };
      B().txn(p, { txnId, type: 'fragments', amount: 0, fragments: -cost, label: 'Troca por ' + ch.name });
      GG.unlocks.applyAutoCollectibles(p);
      return { ok: true };
    });
  };
  /** Nexóticos que podem sair na cápsula. */
  E.capsulePool = () => GG.catalog.list.filter((c) => c.unlock.some((u) => u.type === 'capsule'));
  /**
   * Cápsula-surpresa: custa Moedas Nexus (nunca dinheiro real). Regras visíveis:
   * sai um Nexótico (chance por raridade) ou um pacote de fragmentos; se sair
   * um repetido, ele vira fragmentos; a cada `pity` cápsulas sem novidade, a
   * próxima garante um Nexótico novo (se ainda houver).
   */
  E.capsule = function (txnId) {
    const C = FR().capsule;
    return GG.profile.update((p) => {
      if (p.appliedTxns[txnId]) return Object.assign({ ok: true, repeated: true }, p.capsule.last && p.capsule.last.txnId === txnId ? p.capsule.last : {});
      const r = B().spend(p, C.price, txnId, { label: 'Cápsula-surpresa' });
      if (!r.ok) return r;
      const rnd = rngFrom(txnId);
      const pool = E.capsulePool();
      const locked = pool.filter((c) => !p.collectibles[c.id]);
      const weight = (c) => FR().rarityById(c.rarity).capsuleWeight;
      const pickW = (arr) => { const tot = arr.reduce((a, c) => a + weight(c), 0); let x = rnd() * tot; for (const c of arr) { x -= weight(c); if (x <= 0) return c; } return arr[arr.length - 1]; };
      let res;
      if (locked.length && p.capsule.misses >= C.pity - 1) {
        const c = pickW(locked); p.collectibles[c.id] = { at: iso(), via: 'capsula', txnId }; res = { charId: c.id, isNew: true, guaranteed: true };
      } else if (rnd() < 0.6 && pool.length) {
        const c = pickW(pool);
        if (!p.collectibles[c.id]) { p.collectibles[c.id] = { at: iso(), via: 'capsula', txnId }; res = { charId: c.id, isNew: true }; }
        else { const f = FR().rarityById(c.rarity).dupFragments; p.fragments += f; res = { charId: c.id, duplicate: true, fragments: f }; }
      } else { p.fragments += C.fragmentsOnly; res = { fragmentsOnly: true, fragments: C.fragmentsOnly }; }
      p.capsule.misses = res.isNew ? 0 : p.capsule.misses + 1;
      p.capsule.opened++;
      p.capsule.last = Object.assign({ txnId }, res);
      GG.unlocks.applyAutoCollectibles(p);
      return Object.assign({ ok: true }, res);
    });
  };
  /** Presente de boas-vindas: escolher 1 Nexótico Comum (uma única vez). */
  E.welcomeGift = function (charId) {
    const ch = GG.catalog.get(charId);
    if (!ch || ch.rarity !== 'comum') return { ok: false };
    return GG.profile.update((p) => {
      if (p.seen.welcomeGift) return { ok: false, why: 'O presente já foi escolhido.' };
      p.seen.welcomeGift = charId;
      if (!p.collectibles[charId]) p.collectibles[charId] = { at: iso(), via: 'presente de boas-vindas' };
      else p.fragments += FR().rarityById('comum').dupFragments;
      if (!p.team.length) { p.team = [charId]; p.companion = charId; }
      if (!p.parkVisible.includes(charId)) p.parkVisible.push(charId);
      return { ok: true };
    });
  };

  /* ---------------- equipe, companheiro, parque ---------------- */
  E.setTeam = function (ids) {
    return GG.profile.update((p) => {
      p.team = Array.from(new Set(ids)).filter((id) => E.hasChar(p, id)).slice(0, 3);
      if (p.companion && !p.team.includes(p.companion)) p.companion = p.team[0] || null;
      if (!p.companion) p.companion = p.team[0] || null;
      return { ok: true, team: p.team };
    });
  };
  E.setCompanion = (id) => GG.profile.update((p) => { if (E.hasChar(p, id)) { p.companion = id; if (!p.team.includes(id)) { p.team.unshift(id); p.team = p.team.slice(0, 3); } } });
  E.toggleParkVisible = (id) => GG.profile.update((p) => { const i = p.parkVisible.indexOf(id); if (i >= 0) p.parkVisible.splice(i, 1); else if (E.hasChar(p, id)) p.parkVisible.push(id); });
  E.setAccessory = (charId, accId) => GG.profile.update((p) => { p.charAcc = p.charAcc || {}; if (!accId) delete p.charAcc[charId]; else if (E.owns(p, accId)) p.charAcc[charId] = accId; });

  /* ---------------- base: decorações ---------------- */
  const ANCHORS_BIG = [[18, 78], [82, 78], [50, 84], [30, 70], [70, 70]];
  E._placeNew = function (p, id) {
    const it = GG.nexusItem(id); if (!it) return;
    const big = it.size === 'big';
    const usedBig = p.decorations.placed.filter((d) => (GG.nexusItem(d.item) || {}).size === 'big').length;
    const pos = big ? ANCHORS_BIG[usedBig % ANCHORS_BIG.length] : [20 + ((p.decorations.placed.length * 13) % 60), 58 + ((p.decorations.placed.length * 7) % 20)];
    p.decorations.placed.push({ uid: id + '-' + Date.now().toString(36) + Math.floor(Math.random() * 1e4), item: id, x: pos[0], y: pos[1], flip: false });
  };
  E.placeDecor = (id) => GG.profile.update((p) => { if (!E.owns(p, id) && !(p.crafted || {})[id] && !(p.arcade.cosmeticRewards || {})[id]) return { ok: false }; E._placeNew(p, id); return { ok: true }; });
  E.moveDecor = function (uid, x, y) {
    return GG.profile.update((p) => {
      const d = p.decorations.placed.find((q) => q.uid === uid); if (!d) return { ok: false };
      const it = GG.nexusItem(d.item) || {};
      if (it.size === 'big' && !GG.powers.has(p, 'move_big_decor')) return { ok: false, why: 'Decorações grandes só se movem com a Força Continental (Globo Gorilão na equipe).' };
      d.x = Math.max(4, Math.min(96, Math.round(x))); d.y = Math.max(30, Math.min(96, Math.round(y)));
      return { ok: true };
    });
  };
  E.flipDecor = (uid) => GG.profile.update((p) => { const d = p.decorations.placed.find((q) => q.uid === uid); if (d) d.flip = !d.flip; });
  E.removeDecor = (uid) => GG.profile.update((p) => { p.decorations.placed = p.decorations.placed.filter((q) => q.uid !== uid); });
  /** Modelos prontos: reorganizam as decorações que já existem (grátis). */
  E.TEMPLATES = {
    modelo_laboratorio: [[14, 62], [30, 60], [46, 64], [62, 60], [78, 62], [22, 80], [50, 84], [80, 80], [36, 74], [66, 74]],
    modelo_explorador: [[10, 70], [26, 78], [42, 72], [58, 78], [74, 70], [90, 76], [18, 88], [50, 90], [82, 88], [34, 64]],
    modelo_fliperama: [[12, 76], [24, 76], [36, 76], [64, 76], [76, 76], [88, 76], [50, 88], [30, 90], [70, 90], [50, 66]]
  };
  E.applyTemplate = (tid) => GG.profile.update((p) => {
    const T = E.TEMPLATES[tid]; if (!T) return { ok: false };
    p.decorations.placed.forEach((d, i) => { const pos = T[i % T.length]; d.x = pos[0] + Math.floor(i / T.length) * 3; d.y = pos[1]; });
    p.decorations.template = tid; return { ok: true };
  });

  /* ---------------- materiais: coleta no hub, expedições, oficina ---------------- */
  E.bagSize = (p) => FR().hubBag + (GG.powers.sum(p, 'bag_slot', 'slots') | 0);
  E.pickup = function (pickId) {
    return GG.profile.update((p) => {
      if (p.hub.bag.day !== today()) p.hub.bag = { day: today(), picked: 0, ids: {} };
      p.hub.bag.ids = p.hub.bag.ids || {};
      if (p.hub.bag.ids[pickId]) return { ok: false, why: 'Já coletado hoje.' };
      if (p.hub.bag.picked >= E.bagSize(p)) return { ok: false, why: 'Sua bolsa de coleta de hoje está cheia (' + E.bagSize(p) + ').' };
      p.hub.bag.picked++; p.hub.bag.ids[pickId] = 1; p.materials = (p.materials | 0) + 1;
      return { ok: true, materials: p.materials };
    });
  };
  E.startExpedition = function (charId) {
    return GG.profile.update((p) => {
      if (!E.hasChar(p, charId)) return { ok: false };
      if (p.expedition) return { ok: false, why: 'Já há uma expedição em andamento.' };
      if (p.expeditionsDay.day !== today()) p.expeditionsDay = { day: today(), n: 0 };
      if (p.expeditionsDay.n >= FR().expedition.perDay) return { ok: false, why: 'Os Nexóticos já exploraram bastante hoje. Voltem amanhã!' };
      p.expeditionsDay.n++;
      p.expedition = { charId, start: Date.now(), end: Date.now() + FR().expedition.seconds * 1000, id: 'exp-' + Date.now().toString(36) };
      return { ok: true };
    });
  };
  E.claimExpedition = function () {
    return GG.profile.update((p) => {
      const x = p.expedition; if (!x) return { ok: false };
      if (Date.now() < x.end) return { ok: false, why: 'Ainda explorando…', left: Math.ceil((x.end - Date.now()) / 1000) };
      const found = 2 + (rngFrom(x.id)() * 3 | 0);
      p.materials = (p.materials | 0) + found; p.expedition = null;
      p.expeditionLog = (p.expeditionLog || []).concat([{ at: iso(), charId: x.charId, found }]).slice(-20);
      return { ok: true, found, charId: x.charId };
    });
  };
  E.craft = function (id, txnId) {
    const c = GG.NEXUS_CRAFT.find((x) => x.id === id); if (!c) return { ok: false };
    return GG.profile.update((p) => {
      if (p.appliedTxns[txnId]) return { ok: true, repeated: true };
      p.crafted = p.crafted || {};
      if (p.crafted[id]) return { ok: false, why: 'Você já fez esta decoração.' };
      if ((p.materials | 0) < c.cost && !p.allContentUnlocked) return { ok: false, why: 'Faltam ' + (c.cost - (p.materials | 0)) + ' 💎.' };
      if (!p.allContentUnlocked) p.materials -= c.cost;
      p.crafted[id] = { at: iso() };
      B().txn(p, { txnId, type: 'craft', amount: 0, materials: -c.cost, label: 'Oficina: ' + c.name });
      E._placeNew(p, id);
      return { ok: true };
    });
  };

  /* ---------------- Fliperama: recordes, medalhas, recompensas cosméticas ---------------- */
  E.medalFor = function (score) { const M = FR().arcade.medalScores; return score >= M.ouro ? 'ouro' : score >= M.prata ? 'prata' : score >= M.bronze ? 'bronze' : null; };
  /** Registra um resultado de replay (score 0–100). Idempotente por runId. NÃO gera pontos de estudo. */
  E.arcadeResult = function (gameId, score, runId, extra) {
    score = Math.max(0, Math.min(100, Math.round(score || 0)));
    return GG.profile.update((p) => {
      const A = p.arcade; A.runs = A.runs || {};
      if (A.runs[runId]) return Object.assign({ ok: true, repeated: true }, A.runs[runId]);
      const prev = A.records[gameId] || null;
      const record = !prev || score > prev.score;
      if (record) A.records[gameId] = { score, at: iso(), ghost: extra && extra.ghost ? extra.ghost : (prev && prev.ghost) || null };
      A.plays[gameId] = (A.plays[gameId] | 0) + 1;
      const medal = E.medalFor(score); const m = (A.medals[gameId] = A.medals[gameId] || {});
      const newMedals = [];
      ['bronze', 'prata', 'ouro'].forEach((k) => { if (medal && ['bronze', 'prata', 'ouro'].indexOf(k) <= ['bronze', 'prata', 'ouro'].indexOf(medal) && !m[k]) { m[k] = iso(); newMedals.push(k); } });
      const total = GG.unlocks.arcadeMedals(p);
      const rewards = [];
      GG.NEXUS_ARCADE_REWARDS.forEach((r) => { if (total >= r.need && !A.cosmeticRewards[r.id]) { A.cosmeticRewards[r.id] = iso(); rewards.push(r.id); if (!r.slot) E._placeNew(p, r.id); } });
      const res = { score, record, prevBest: prev ? prev.score : null, medal, newMedals, rewards };
      A.runs[runId] = res;
      const keys = Object.keys(A.runs); if (keys.length > 300) keys.slice(0, keys.length - 300).forEach((k) => delete A.runs[k]);
      GG.unlocks.applyAutoCollectibles(p);
      return Object.assign({ ok: true }, res);
    });
  };
  E.toggleFavorite = (gameId) => GG.profile.update((p) => { const f = p.arcade.favorites; const i = f.indexOf(gameId); if (i >= 0) f.splice(i, 1); else f.push(gameId); });

  /* ================================================================ PODERES */
  const PW = (GG.powers = {});
  /** Personagens ativos = equipe (até 3). No sandbox dos pais, também só a equipe (para testar cada poder). */
  PW.team = (p) => (p.team || []).map((id) => GG.catalog.get(id)).filter(Boolean).filter((c) => E.hasChar(p, c.id));
  PW.list = (p, type) => PW.team(p).filter((c) => c.power.type === type);
  PW.has = (p, type) => PW.list(p, type).length > 0;
  PW.sum = (p, type, param) => PW.list(p, type).reduce((a, c) => a + (Number(c.power.params[param]) || 0), 0);
  PW.params = (p, type) => (PW.list(p, type)[0] || { power: { params: {} } }).power.params;
})();
