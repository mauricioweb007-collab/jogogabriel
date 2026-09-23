/* =====================================================================
   systems/economy.js — XP, EcoMoedas (de Geografia), níveis, loja,
   inventário e efeitos. Valores fixos em content/loja.js.
   Repetir fase rende só uma fração (limite diário) — sem repetição vazia.
   ===================================================================== */
(function () {
  'use strict';
  const EC = (GEO.eco = {});
  const S = () => GEO.save.S;
  const R = () => GEO.data.rewards;

  EC.level = function (xp) {
    const L = GEO.data.levels; const x = xp == null ? S().xp : xp;
    let lvl = 1; for (let i = 0; i < L.length; i++) if (x >= L[i]) lvl = i + 1;
    const cur = L[lvl - 1] || 0, next = L[lvl] || (cur + 1500);
    return { lvl, title: GEO.data.titles[lvl - 1] || 'Lenda do Atlas', cur, next, pct: Math.min(1, (x - cur) / (next - cur)) };
  };
  /** Credita XP/moedas. factor < 1 em repetições. Retorna {xp, coins, levelUp}. */
  EC.award = function (xp, coins, reason, factor) {
    const s = S(); const f = factor == null ? 1 : factor;
    const before = EC.level().lvl;
    const gx = Math.round((xp || 0) * f), gc = Math.round((coins || 0) * f);
    s.xp += gx; s.coins += gc; s.earned += gc;
    if (gc || gx) s.ledger.push({ t: Date.now(), r: reason || '', xp: gx, c: gc });
    if (s.ledger.length > 400) s.ledger.splice(0, s.ledger.length - 400);
    const up = EC.level().lvl > before;
    GEO.hud && GEO.hud.update();
    if (up) { GG.audio.sfx('win'); GG.ui.toast('⭐ Nível ' + EC.level().lvl + ': ' + EC.level().title + '!', 'gold', 3000); }
    return { xp: gx, coins: gc, levelUp: up };
  };
  EC.item = (id) => GEO.data.items.find((i) => i.id === id);
  EC.owns = (id) => S().inv.includes(id);
  /** Efeito ativo (item possuído e equipado quando é visual). */
  EC.has = function (effect) {
    const it = GEO.data.items.find((i) => i.effect === effect);
    if (!it || !EC.owns(it.id)) return false;
    if (['skin', 'ship', 'trail', 'pet', 'cap', 'goldpack', 'heart'].includes(effect)) return S().equip[it.id] !== false;
    return true;
  };
  EC.buy = function (id) {
    const it = EC.item(id), s = S();
    if (!it || it.reward || EC.owns(id)) return { ok: false, msg: 'Indisponível.' };
    if (s.coins < it.price) return { ok: false, msg: 'Faltam ' + (it.price - s.coins) + ' EcoMoedas.' };
    s.coins -= it.price; s.spent += it.price; s.inv.push(id); s.equip[id] = true;
    s.ledger.push({ t: Date.now(), r: 'Compra: ' + it.name, xp: 0, c: -it.price });
    GEO.save.persist(); GEO.hud && GEO.hud.update();
    return { ok: true };
  };
  EC.give = function (id) { const s = S(); if (!s.inv.includes(id)) { s.inv.push(id); s.equip[id] = true; } };
  EC.toggle = function (id) { const s = S(); s.equip[id] = s.equip[id] === false; GEO.save.persist(); };
  /** Aparência atual de Gabriel (lateral/de frente). */
  EC.look = function () {
    const xilo = EC.has('skin');
    return {
      skin: xilo ? '#d8c39a' : '#c98e62', hair: xilo ? '#2a2233' : '#2b1d14', hairStyle: 'curto',
      shirt: xilo ? '#efe1bf' : '#1fa39a', pants: xilo ? '#2a2233' : '#33415e', shoes: xilo ? '#2a2233' : '#6b3f22',
      cap: true, capColor: EC.has('cap') ? '#3f6ad8' : (xilo ? '#2a2233' : '#f39c12'),
      backpack: EC.has('goldpack') ? '#ffd23f' : EC.owns('mochila') ? '#a0522d' : null,
      cape: EC.has('heart'), capeColor: '#e05a47'
    };
  };
  /** Fator de repetição: primeira conclusão 1; depois 0.3 até 2x/dia; depois 0. */
  EC.replayFactor = function (stageId) {
    const st = S().stages[stageId];
    if (!st || !st.done) return 1;
    const day = GG.util.today(); st.playsDay = st.playsDay || {};
    const n = st.playsDay[day] || 0;
    return n < R().replayPerDay ? R().replayFactor : 0;
  };
})();
