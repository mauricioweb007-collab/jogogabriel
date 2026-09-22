/* =====================================================================
   tools/economy-sim.cjs — SIMULAÇÃO ESTÁTICA DA ECONOMIA (sem navegador)
   Calcula, a partir dos dados do jogo, quantas EcoMoedas e quanto XP
   cada perfil recebe ao concluir a história e o que consegue comprar.
   (O teste e2e.cjs faz a mesma simulação jogando de verdade no navegador.)
   Perfis:
     minimo: todas as questões só após a versão guiada; confirmações
             erradas pela metade; poucas missões secundárias e segredos;
             Arena abaixo de 70%.
     medio:  65% de primeira, 35% na segunda tentativa; metade das
             secundárias; Arena abaixo de 70%.
     otimo:  tudo de primeira; todas as secundárias e segredos; Arena ≥ 70%.
   ===================================================================== */
'use strict';
function run(EN) {
  const D = EN.data, R = D.rewards;
  const nQ = D.questions.length;
  let nChecks = 0;
  Object.values(D.lessons).forEach((l) => l.steps.forEach((s) => { if (s.check) nChecks++; if (s.train) nChecks += s.train.length; }));
  const sides = Object.values(D.sides);
  const chests = Object.values(D.maps).reduce((a, m) => a + (m.extra || []).filter((e) => e.chest).length, 0);
  const regionChests = D.regions.reduce((a, r) => a + r.chest.coins, 0);
  const challengeItems = D.regions.length * 4;
  const profiles = {
    minimo: { t1: 0, t2: 0, t3: 1, checkFull: 0.3, confirmOk: 0.5, sides: 0.35, secrets: 0.25, arena70: false, arenaFirst: 0.45, mg: 4, challengeFirst: 0.3 },
    medio: { t1: 0.65, t2: 0.35, t3: 0, checkFull: 0.85, confirmOk: 0.8, sides: 0.6, secrets: 0.6, arena70: false, arenaFirst: 0.62, mg: 6, challengeFirst: 0.7 },
    otimo: { t1: 1, t2: 0, t3: 0, checkFull: 1, confirmOk: 1, sides: 1, secrets: 1, arena70: true, arenaFirst: 1, mg: 8, challengeFirst: 1 }
  };
  const out = {};
  console.log('\n[4] Simulação estática da economia (' + nQ + ' questões, ' + nChecks + ' checagens/treinos, ' + sides.length + ' secundárias, ' + chests + ' baús secretos)');
  Object.keys(profiles).forEach((k) => {
    const p = profiles[k];
    let xp = 0, coins = 0;
    const add = (x, c, n) => { xp += x * n; coins += c * n; };
    add(R.tier1.xp, R.tier1.coins, nQ * p.t1); add(R.tier2.xp, R.tier2.coins, nQ * p.t2); add(R.tier3.xp, R.tier3.coins, nQ * p.t3);
    if (p.t1 === 1) coins += R.medallionCap; // Medalhão Solar (se comprado cedo), limitado a 40
    add(R.check.xp, R.check.coins, nChecks * p.checkFull); add(R.checkGuided.xp, R.checkGuided.coins, nChecks * (1 - p.checkFull));
    const wrongQs = nQ * (1 - p.t1);
    add(R.recovery.xp, R.recovery.coins, wrongQs * p.confirmOk);
    add(R.mainQuest.xp, R.mainQuest.coins, 7);
    sides.forEach((s) => add(s.reward.xp, s.reward.coins, p.sides));
    coins += Math.round(chests * p.secrets) * R.secret.coins;
    coins += regionChests;
    coins += p.arena70 ? 40 : 15; xp += p.arena70 ? 100 : 0;
    add(R.check.xp, R.check.coins, challengeItems * p.challengeFirst);
    add(25, 0, 21 * p.arenaFirst);
    coins += p.mg * 3; xp += p.mg * 10;
    coins = Math.round(coins); xp = Math.round(xp);
    // compras: melhorias úteis primeiro, depois comuns, depois raros/épicos/lendários
    const lvl = EN.eco ? null : null;
    let lv = 1; D.levels.forEach((t, i) => { if (xp >= t) lv = i + 1; });
    let left = coins; const bought = [];
    const order = ['botas_explorador', 'bussola_lumi', 'lupa_ecologica', 'cantil', 'caderno_melhorado', 'uni_verde', 'bone_folha', 'pet_joaninha', 'mochila_ampliada', 'ima_fragmentos', 'medalhao_solar', 'mascara_mergulho', 'corda_escalada', 'semente_rara', 'chave_lab', 'lanterna', 'aura_folhas', 'passe_biomas', 'set_cerrado', 'lumi_cristal'];
    order.forEach((id) => { const it = D.itemById[id]; if (it.price <= left && lv >= D.rarities[it.rarity].minLevel) { left -= it.price; bought.push(it.name + ' (' + D.rarities[it.rarity].label + ', ' + it.price + ')'); } });
    out[k] = { xp, coins, level: lv, bought, left };
    console.log('  ' + k.padEnd(7) + ' → ' + coins + ' EcoMoedas, ' + xp + ' XP (nível ' + lv + '). Compra ' + bought.length + ' itens; sobra ' + left + '.');
    console.log('           ' + bought.join('; '));
  });
  console.log('  Todos os perfis concluem a história (nenhum conteúdo obrigatório depende de moedas ou nota).');
  return out;
}
module.exports = { run };
