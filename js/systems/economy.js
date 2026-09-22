/* =====================================================================
   systems/economy.js — XP (nível, títulos, molduras), EcoMoedas,
   loja, inventário, equipamentos e EFEITOS REAIS das melhorias.
   Regras: nunca saldo negativo; confirmação antes de gastar (na UI);
   sem sorteios; conteúdo obrigatório nunca depende de moedas.
   ===================================================================== */
EN.eco = (function () {
  'use strict';
  const D = EN.data;
  const Eco = {};
  const S = () => EN.save.S;

  /* ---------------- nível e títulos ---------------- */
  Eco.level = function (xp) {
    xp = xp === undefined ? S().xp : xp;
    const L = D.levels;
    let lvl = 1;
    for (let i = 0; i < L.length; i++) if (xp >= L[i]) lvl = i + 1;
    const cur = L[lvl - 1], next = L[lvl] !== undefined ? L[lvl] : null;
    return { lvl, cur, next, pct: next ? (xp - cur) / (next - cur) : 1 };
  };
  Eco.title = (lvl) => { let t = D.titles[0].t; D.titles.forEach((x) => { if (lvl >= x.lvl) t = x.t; }); return t; };
  Eco.frame = (lvl) => { let f = D.frames[0]; D.frames.forEach((x) => { if (lvl >= x.lvl) f = x; }); return f; };

  /* ---------------- ganhos e gastos ---------------- */
  Eco.award = function (xp, coins, reason, opts) {
    const s = S(); opts = opts || {};
    const before = Eco.level().lvl;
    xp = Math.max(0, Math.round(xp || 0)); coins = Math.max(0, Math.round(coins || 0));
    s.xp += xp; s.coins += coins; s.earned += coins;
    if (xp || coins) {
      s.ledger.push({ t: Date.now(), xp, coins, reason: reason || '' });
      if (s.ledger.length > 400) s.ledger.shift();
    }
    const after = Eco.level().lvl;
    if (!opts.silent && EN.ui) EN.ui.rewardPop(xp, coins, reason);
    if (after > before && EN.ui) EN.ui.levelUp(after, Eco.title(after));
    return { xp, coins, levelUp: after > before };
  };

  Eco.spend = function (amount, reason) {
    const s = S();
    if (amount < 0 || s.coins < amount) return false; // nunca saldo negativo
    s.coins -= amount; s.spent += amount;
    s.ledger.push({ t: Date.now(), xp: 0, coins: -amount, reason: reason || '' });
    return true;
  };

  /* ---------------- itens ---------------- */
  Eco.item = (id) => D.itemById[id];
  Eco.owns = (id) => S().inv.includes(id);
  Eco.slotOf = (it) => it.slot;
  Eco.equipped = (id) => { const it = Eco.item(id); return !!(it && it.slot && S().equip[it.slot] === id); };

  Eco.canBuy = function (id) {
    const it = Eco.item(id);
    if (!it || it.free) return { ok: false, why: 'Item indisponível.' };
    if (Eco.owns(id)) return { ok: false, why: 'Você já tem este item.' };
    const need = D.rarities[it.rarity].minLevel;
    if (Eco.level().lvl < need) return { ok: false, why: 'Libera no nível ' + need + ' de Guardião.', locked: true };
    if (S().coins < it.price) return { ok: false, why: 'Faltam ' + (it.price - S().coins) + ' EcoMoedas.' };
    return { ok: true };
  };

  Eco.buy = function (id) {
    const chk = Eco.canBuy(id);
    if (!chk.ok) return chk;
    const it = Eco.item(id);
    if (!Eco.spend(it.price, 'Compra: ' + it.name)) return { ok: false, why: 'Saldo insuficiente.' };
    Eco.give(id, 'compra');
    S().purchases.push({ id, price: it.price, t: Date.now() });
    if (it.slot) Eco.equip(id);
    EN.save.persist('compra');
    return { ok: true };
  };

  /** Coloca um item no inventário (compra ou baú de conteúdo conhecido). */
  Eco.give = function (id) {
    if (!Eco.owns(id)) S().inv.push(id);
  };

  Eco.equip = function (id) {
    const it = Eco.item(id);
    if (!it || !it.slot || !Eco.owns(id)) return false;
    S().equip[it.slot] = id;
    EN.save.persist();
    return true;
  };
  Eco.unequip = function (id) {
    const it = Eco.item(id);
    if (!it || !it.slot) return false;
    if (S().equip[it.slot] === id) {
      if (it.slot === 'roupa') S().equip.roupa = 'uni_classico';
      else if (it.slot === 'lumi') S().equip.lumi = 'lumi_classica';
      else delete S().equip[it.slot];
    }
    EN.save.persist();
    return true;
  };

  /** Efeito ativo = item de melhoria possuído E equipado. */
  Eco.effect = function (fx) {
    const eq = S().equip;
    return Object.keys(eq).some((slot) => { const it = Eco.item(eq[slot]); return it && it.fx === fx; });
  };

  const LOOK_ORDER = ['roupa', 'capa', 'chapeu', 'botas', 'mochila', 'oculos', 'ferramenta', 'aura', 'rastro'];
  /** Aparência do avatar a partir dos itens equipados (reflete no mundo). */
  Eco.look = function (equip) {
    const eq = equip || S().equip;
    const look = Object.assign({}, D.baseLook);
    LOOK_ORDER.forEach((slot) => { const it = Eco.item(eq[slot]); if (it && it.look) Object.assign(look, it.look); });
    return look;
  };
  Eco.lumiVariant = function (equip) { const it = Eco.item((equip || S().equip).lumi); return (it && it.lumi) || 'classica'; };
  Eco.petKind = function (equip) { const it = Eco.item((equip || S().equip).mascote); return (it && it.pet) || null; };

  /* ---------------- bônus das melhorias ---------------- */
  /** Medalhão Solar: +2 moedas ao acertar de primeira, com limite total. */
  Eco.medallionBonus = function () {
    if (!Eco.effect('medalhao')) return 0;
    const cap = D.rewards.medallionCap;
    const s = S();
    const add = Math.min(2, cap - s.medallion);
    if (add <= 0) return 0;
    s.medallion += add;
    return add;
  };

  /* ---------------- minijogos: recompensa pequena e limitada ---------------- */
  /**
   * score01 de 0 a 1. Moedas base: 1 a 5. Depois de 2 jogadas premiadas
   * desde a última lição concluída, a recompensa cai pela metade; da 4ª
   * em diante, zera até que outra missão de aprendizagem seja concluída.
   */
  Eco.minigameReward = function (id, score01) {
    const s = S();
    const m = s.mg[id] = s.mg[id] || { plays: 0, best: 0, coins: 0, trophy: false };
    m.plays++;
    m.best = Math.max(m.best, score01);
    let base = Math.max(1, Math.min(5, Math.round(1 + score01 * 4)));
    const n = s.mgBudget.plays;
    let coins = n < 2 ? base : n < 3 ? Math.max(1, Math.floor(base / 2)) : 0;
    s.mgBudget.plays++;
    m.coins += coins;
    let trophy = false;
    if (!m.trophy && score01 >= 0.8) { m.trophy = true; trophy = true; }
    return { coins, base, limited: coins < base, trophy };
  };
  Eco.onLessonComplete = function () { S().mgBudget.plays = 0; };

  return Eco;
})();
