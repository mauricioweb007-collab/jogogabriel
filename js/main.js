/* =====================================================================
   main.js — FACHADA DO JOGO (EN.game): liga o motor 2D, os dados das
   regiões, o motor pedagógico, a economia e a interface.
   Fluxo: andar → observar → conversar → objetivo → investigar/agir →
   aprender → desafio → recompensa → explorar algo novo.
   ===================================================================== */
EN.game = (function () {
  'use strict';
  const U = EN.util, D = EN.data, E = EN.engine, UI = EN.ui, Q = EN.quests, ECO = EN.eco, LRN = EN.learn;
  const G = {};
  const S = () => EN.save.S;
  G.busy = false;
  let tempPicked = {};

  /* ================================================================ condições usadas pelos mapas */
  G.flag = (k) => !!(S() && S().flags[k]);
  G.setFlag = (k) => { S().flags[k] = true; };
  G.q = (id) => !!(S() && S().q[id] && S().q[id].done);
  G.done = (lid) => Q.lessonDone(lid);
  G.regionDone = (r) => Q.regionComplete(r);
  G.lessonFrac = (r) => Q.lessonFrac(r);
  G.crystals = () => (S() ? S().crystals.length : 0);
  G.has = (id) => ECO.owns(id);
  G.shown = (id) => ECO.owns(id) && ECO.equipped(id);
  G.sideState = (id) => Q.sideState(id);
  G.picked = (k) => !!(S() && S().picked[k]);
  G.tempPicked = (k) => !!tempPicked[k];
  G.seen = (id) => !!(S() && S().seenEnt[id]);
  G.arenaRound = () => (S() ? S().arena.round : 0);
  G.storyDone = () => !!(S() && S().storyDone);
  G.gardenAt = (i) => (S() ? S().garden[i] : null);
  G.medalIcons = () => {
    const icons = D.regions.filter((r) => S().medals.includes(r.medal)).map((r) => r.medalIcon);
    if (S().medals.includes('Guardião do EcoNexus')) icons.push('🌟');
    return icons.length ? icons.slice(0, 6) : ['📗'];
  };

  /* ================================================================ ganchos do motor */
  G.look = () => ECO.look();
  G.lumiVariant = () => ECO.lumiVariant();
  G.petKind = () => ECO.petKind();
  G.lumiFollows = () => true;
  G.speedMult = () => (ECO.effect('speed') ? 1.15 : 1);
  G.magnetRadius = () => (ECO.effect('ima') ? 3.5 * EN.sprites.TS : 0);
  G.lupaActive = () => ECO.effect('lupa');
  G.compassActive = () => ECO.effect('bussola');
  G.showPath = () => !!S().settings.path;
  G.secretFound = (e) => (e.def.chest ? G.picked('chest:' + e.id) : e.def.pickup === 'frag' ? G.picked('frag:' + e.id.replace('_frag', '')) : false);
  G.objectiveTarget = () => {
    if (!E.map) return null;
    const TS = EN.sprites.TS;
    return Q.objectiveTarget(E.map.id, Math.floor(E.player.x / TS), Math.floor(E.player.y / TS));
  };
  G.entityBadge = function (e) {
    const d = e.def;
    const o = Q.objective();
    let quest = o.entity === d.id;
    if (d.side && Q.sideState(d.side) === 'ready') quest = true;
    if (d.lessons && d.lessons.some((l) => ['current', 'needvisit'].includes(Q.lessonState(l)))) quest = true;
    let icon = 'E';
    if (quest) icon = '!';
    else if (d.kind === 'npc') icon = '💬';
    else if (d.chest) icon = '🎁';
    else if (d.minigame) icon = '🎮';
    else if (d.shop) icon = '🛒';
    else if (d.portal || d.regionPortal || d.arenaPortal || d.bonus) icon = '➜';
    else if (d.info || d.visitOnly) icon = '🔍';
    return { icon, quest };
  };
  G.openMenu = () => { if (!G.busy) UI.menu(); };
  G.openInventory = () => { if (!G.busy) UI.inventory(); };
  G.openNotebook = () => { if (!G.busy) UI.notebook(); };
  G.openBoard = () => { if (!G.busy) UI.board(); };
  G.togglePath = () => {
    S().settings.path = !S().settings.path;
    EN.save.persist();
    UI.hudUpdate(true);
    UI.toast(S().settings.path ? '🧭 Mostrando o caminho até o objetivo' : '🧭 Caminho escondido');
  };
  G.applyTouch = () => {
    const t = S() ? S().settings.touch : 'auto';
    document.body.classList.toggle('touch-on', t === 'on' || (t === 'auto' && U.isTouch()));
  };

  /* ================================================================ falas */
  function speakerOf(d) {
    if (d.kind === 'npc') { const base = D.speakers[d.speaker] || {}; return { name: d.name || base.name, look: d.look || base.look }; }
    if (d.kind === 'animal') return { name: d.name, kind: 'animal', animal: d.animal };
    return 'lumi';
  }
  /** Fala linhas; linhas que começam com "Lumi:" são ditas pela Lumi. */
  async function talk(d, lines) {
    let buf = [], who = null;
    const flush = async () => { if (buf.length) await UI.say(who, buf); buf = []; };
    for (const ln of lines) {
      const isLumi = /^Lumi:\s*/.test(ln);
      const w = isLumi ? 'lumi' : speakerOf(d);
      if (who !== null && ((who === 'lumi') !== (w === 'lumi'))) await flush();
      who = w; buf.push(ln.replace(/^Lumi:\s*/, ''));
    }
    await flush();
  }

  /* ================================================================ INTERAÇÃO */
  G.interact = async function (e) {
    if (G.busy || UI.anyOpen()) return;
    G.busy = true;
    try { await dispatch(e); } catch (err) { console.error(err); UI.toast('Ops! Algo deu errado. Tente de novo.'); }
    finally { G.busy = false; UI.hudUpdate(true); }
  };

  function markSeen(id) {
    if (!S().seenEnt[id]) { S().seenEnt[id] = true; EN.save.persist(); }
  }

  async function dispatch(e) {
    const d = e.def;
    const firstSeen = !S().seenEnt[d.id];
    markSeen(d.id);
    if (d.visitOnly && firstSeen) {
      // retorno de progresso para "visitar"
      const side = Object.values(D.sides).find((s) => s.type === 'visit' && s.targets.includes(d.id) && Q.sideState(s.id) !== 'none');
      if (side) UI.toast('📍 ' + side.title + ': ' + Q.sideProgress(side.id) + '/' + Q.sideGoal(side.id));
      const r = Q.activeRegion();
      if (r) { const lid = Q.currentLesson(r.id); if (lid && (D.lessons[lid].requiresVisit || []).includes(d.id)) UI.toast('🔎 Investigação: ' + (D.lessons[lid].requiresVisit.length - Q.visitsMissing(lid).length) + '/' + D.lessons[lid].requiresVisit.length); }
      E.refreshTiles();
    }
    if (d.lessons) { await lessonEntity(e); return; }
    if (d.altar) { await altar(d.altar); return; }
    if (d.arena) { await arenaCore(); return; }
    if (d.regionPortal) { const map = await UI.regionPortal(); if (map) await G.travel(map); return; }
    if (d.arenaPortal) {
      if (Q.allRegionsDone()) await G.travel('arena');
      else await UI.say('lumi', ['O Portal da Arena só se abre quando os seis cristais estiverem restaurados. Faltam ' + (6 - G.crystals()) + '.']);
      return;
    }
    if (d.bonus) { await bonusEntrance(d); return; }
    if (d.portal) { await G.travel(d.portal.map, d.portal.x, d.portal.y); return; }
    if (d.chest) { await openChest(e); return; }
    if (d.minigame) { await EN.minigames.play(d.minigame); return; }
    if (d.shop) { if (d.talk && !S().flags['talk_' + d.id]) { S().flags['talk_' + d.id] = true; await talk(d, d.talk); } UI.shop(d.shop); return; }
    if (d.wardrobe) { UI.inventory('roupa'); return; }
    if (d.trophies) { UI.trophies(); return; }
    if (d.board) { UI.board(); return; }
    if (d.garden) {
      if (d.talk) await talk(d, d.talk);
      UI.garden(d.garden === 'raro' ? 'raro' : 'comum');
      return;
    }
    if (d.notebook) { UI.notebook(); return; }
    if (d.bed) { EN.save.persist('salvo'); await UI.say('lumi', ['Progresso salvo! Você pode descansar tranquilo, {nome}. O jogo também salva sozinho.']); return; }
    if (d.review) { await reviewStation(d); return; }
    if (d.side) { if (await sideHandler(d)) return; }
    if (d.info) { await UI.info(d.info); return; }
    if (d.talk) { await talk(d, d.talk); return; }
  }

  /* ---------------------------------------------------------------- lições */
  async function lessonEntity(e) {
    const d = e.def;
    const states = d.lessons.map((l) => [l, Q.lessonState(l)]);
    const cur = states.find(([, s]) => s === 'current');
    if (cur) { await G.runLesson(cur[0]); return; }
    const nv = states.find(([, s]) => s === 'needvisit');
    if (nv) {
      const L = D.lessons[nv[0]];
      const miss = Q.visitsMissing(nv[0]).map((id) => (D.entityIndex[id] ? D.entityIndex[id].def.name : id));
      await talk(d, [L.visitText, 'Lumi: Ainda falta investigar: ' + miss.join(', ') + '.']);
      return;
    }
    if (states.every(([, s]) => s === 'done')) {
      if (d.side && Q.sideState(d.side) !== 'done') { if (await sideHandler(d)) return; }
      const last = D.lessons[states[states.length - 1][0]];
      const k = await UI.choice(speakerOf(d), (last.after || ['Obrigado pela ajuda!'])[0], ['Rever a explicação', 'Até mais!']);
      if (k === 0) await G.runLesson(last.id, true);
      return;
    }
    // lição ainda bloqueada
    if (d.side && Q.regionUnlocked(Q.regionOf(d.lessons[0]))) { if (await sideHandler(d)) return; }
    const o = Q.objective();
    await UI.say('lumi', ['Vamos com calma, um passo de cada vez! Primeiro: ' + o.text + '.', 'Se precisar, toque em 🧭 para eu mostrar o caminho.']);
  }

  /** Executa uma lição (ou só as explicações, ao rever). */
  G.runLesson = async function (lid, replay) {
    const L = D.lessons[lid];
    for (const step of L.steps) {
      if (step.say) await UI.say(step.say, step.lines);
      else if (step.explain) await UI.cardsPromise(step.explain, { title: L.title });
      else if (step.guided) await UI.guided(step.guided);
      else if (replay) continue;
      else if (step.check) await LRN.practice(step.check, 'check', lid);
      else if (step.train) { for (const t of step.train) await LRN.practice(t, 'train', lid); }
      else if (step.q) {
        if (S().q[step.q].done) continue;
        await LRN.book(step.q, lid);
        afterQuestion(step.q);
      } else if (step.flag) { G.setFlag(step.flag); E.refreshTiles(); E.celebrate(); EN.save.persist(); }
    }
    if (replay) return;
    S().lessons[lid] = { done: true, t: Date.now() };
    ECO.onLessonComplete();
    const newF = (L.notebook || []).map((id) => D.notebook.find((c) => c.id === id)).filter(Boolean);
    newF.forEach((c) => UI.toast('📓 Nova ficha no Caderno: ' + c.title));
    EN.save.persist('lição concluída');
    E.refreshTiles();
    const r = D.regionById[L.region];
    if (!Q.currentLesson(r.id)) UI.toast('💎 Todas as lições concluídas! Vá ao Altar do Cristal.');
  };

  function afterQuestion(qid) {
    const q = D.questionById[qid];
    E.refreshTiles();
    E.celebrate();
    UI.toast('🌿 No cenário: ' + q.scene.text);
    EN.save.persist('questão');
  }

  /* ---------------------------------------------------------------- secundárias */
  async function sideHandler(d) {
    const id = d.side, sd = D.sides[id];
    if (!sd) return false;
    const st = Q.sideState(id);
    const spk = speakerOf(d);
    if (st === 'none') {
      const k = await UI.choice(spk, sd.offer[0] + ' (Missão opcional: ' + sd.title + ')', ['Aceitar missão', 'Agora não']);
      if (k === 0) { Q.sideAccept(id); UI.toast('📋 Nova missão secundária: ' + sd.title); E.refreshTiles(); }
      return true;
    }
    if (st === 'active') { await UI.say(spk, [sd.progress[0] + ' (' + Q.sideProgress(id) + '/' + Q.sideGoal(id) + ')']); return true; }
    if (st === 'ready') { await UI.say(spk, sd.done); Q.sideFinish(id); E.celebrate(); return true; }
    return false;
  }

  /* ---------------------------------------------------------------- baús, áreas bônus, revisão */
  async function openChest(e) {
    const key = 'chest:' + e.id;
    if (G.picked(key)) { await UI.say('lumi', ['Este baú já está vazio. Você pegou o colecionável secreto daqui!']); return; }
    S().picked[key] = true;
    ECO.award(0, D.rewards.secret.coins, 'Colecionável secreto');
    E.celebrate();
    EN.save.persist('colecionável');
    await UI.say('lumi', ['Um baú secreto! Dentro havia um cristalzinho colecionável e ' + D.rewards.secret.coins + ' EcoMoedas.', 'Ele aparece nas suas Lembranças.']);
  }

  const BONUS_SPAWN = { bonus_copa: { x: 2, y: 7 }, bonus_caverna: { x: 2, y: 6 }, bonus_lab: { x: 10, y: 11 }, bonus_mergulho: { x: 2, y: 2 }, bonus_biomas: { x: 11, y: 11 } };
  async function bonusEntrance(d) {
    const it = ECO.item(d.item);
    if (!ECO.owns(d.item)) {
      await UI.say('lumi', ['Esta é uma área bônus opcional: ' + D.maps[d.bonus].name + '.', 'Ela abre com o item “' + it.name + '” (' + it.price + ' EcoMoedas), vendido na Loja do Guardião.', 'Nenhum conteúdo da prova fica aqui dentro: é só diversão e revisão extra!']);
      return;
    }
    const sp = BONUS_SPAWN[d.bonus];
    await G.travel(d.bonus, sp.x, sp.y);
  }

  async function reviewStation(d) {
    const k = await UI.choice('lumi', 'Estação de revisão bônus: 3 atividades de revisão da região. Quer jogar?', ['Sim, vamos!', 'Agora não']);
    if (k === 0) await LRN.reviewStation(d.review);
  }

  /* ---------------------------------------------------------------- coletáveis */
  G.pickup = function (e) {
    const d = e.def;
    if (d.pickup === 'frag') {
      const key = 'frag:' + d.id.replace('_frag', '');
      if (G.picked(key)) return;
      S().picked[key] = true; S().fragments++; S().seeds++;
      EN.audio.play('pickup');
      UI.toast('💎 EcoFragmento! +1 semente para o Jardim da Vila');
      EN.save.persist();
    } else if (d.pickup === 'side') {
      const key = 'side:' + d.side + d.idx;
      if (G.picked(key)) return;
      S().picked[key] = true;
      EN.audio.play('pickup');
      const st = Q.sideState(d.side);
      UI.toast('📦 ' + D.sides[d.side].title + ': ' + Q.sideProgress(d.side) + '/' + Q.sideGoal(d.side) + (st === 'ready' ? ' — volte para entregar!' : ''));
      EN.save.persist();
    } else if (d.pickup === 'bubble') {
      tempPicked['bolha' + d.idx] = true;
      EN.audio.play('pickup');
      const n = Object.keys(tempPicked).filter((k) => k.startsWith('bolha')).length;
      UI.toast('🫧 Bolhas de oxigênio: ' + n + '/10');
      if (n === 10) {
        const r = ECO.minigameReward('mergulho', 1);
        ECO.award(10, r.coins, 'Coleta de bolhas');
        if (r.limited) UI.toast('Prêmio reduzido: conclua outra missão de aprendizagem para recarregar.');
      }
    }
    UI.hudUpdate(true);
  };

  /* ================================================================ VIAGEM ENTRE MAPAS */
  G.travel = async function (map, x, y) {
    EN.audio.play('portal');
    for (let i = 1; i <= 6; i++) { E.fade = i / 6; await U.wait(30); }
    const def = D.maps[map];
    const sp = x !== undefined ? { x, y, dir: 'down' } : def.spawn;
    E.loadMap(map, sp);
    if (def.bonusArea) tempPicked = {};
    const firstVisit = !S().visitedMaps[map];
    S().visitedMaps[map] = true;
    S().map = map;
    S().pos = { px: E.player.x, py: E.player.y };
    EN.save.persist('nova área');
    for (let i = 5; i >= 0; i--) { E.fade = i / 6; await U.wait(30); }
    UI.hudUpdate(true);
    if (firstVisit) await mapIntro(map);
  };

  const INTROS = {
    r1: ['Chegamos à Trilha dos Animais Livres! A Névoa deixou os animais confusos por aqui.', 'O objetivo aparece no alto da tela. Toque em 🧭 se quiser que eu mostre o caminho.'],
    r2: ['Este é o Vale das Cadeias Alimentares. A Névoa embaralhou quem come quem!', 'Vamos procurar o Professor Broto na horta.'],
    r3: ['Uau, o Laboratório dos Ciclos! As máquinas estão desligadas.', 'A Dra. Cicla está no saguão.'],
    r4: ['O Lago Esverdeado… A água está verde e os peixes estão sofrendo.', 'Vamos falar com o Ribeirinho Téo, na margem.'],
    r5: ['A Torre da Energia! Os andares estão fora de ordem.', 'O Mestre Solar nos espera na entrada.'],
    r6: ['A Praça dos Portais! Cada portal leva a um bioma brasileiro.', 'A Bia Bioma está no centro da praça.'],
    arena: ['A Arena da Restauração! A Névoa se concentrou no Núcleo, no centro.', 'São quatro rodadas. Estou com você!'],
    loja: ['A Loja do Guardião! Aqui você troca EcoMoedas por itens. Tudo tem preço fixo.'],
    casa: ['Esta é a minha casa, que também é o seu quarto! Troféus, cristais e decorações aparecem aqui.'],
    bonus_copa: ['Que vista! Estamos na copa das árvores.'], bonus_caverna: ['Está escuro… a Lanterna ajuda! Procure os cogumelos brilhantes.'],
    bonus_lab: ['A Sala Bônus dos Ciclos! Aqui dá para revisar os ciclos.'], bonus_mergulho: ['Estamos debaixo d’água! Pegue as 10 bolhas de oxigênio.'], bonus_biomas: ['Trilhas extras dos seis biomas!']
  };
  async function mapIntro(map) {
    if (INTROS[map]) { G.busy = true; await UI.say('lumi', INTROS[map]); G.busy = false; }
  }

  /* ================================================================ ALTAR: DESAFIO DA REGIÃO */
  async function altar(rid) {
    const r = D.regionById[rid];
    if (Q.regionComplete(rid)) {
      const k = await UI.choice('lumi', 'O ' + r.crystal + ' já brilha! Quer refazer o Desafio da Região só para treinar?', ['Treinar o desafio', 'Agora não']);
      if (k === 0) { await LRN.challenge(rid); UI.toast('Treino concluído!'); }
      return;
    }
    if (Q.currentLesson(rid)) {
      await UI.say('lumi', ['O altar ainda está apagado. Antes, precisamos terminar a missão desta região.', 'Próximo passo: ' + Q.objective().text + '.']);
      return;
    }
    await UI.say('lumi', ['Este é o Altar do ' + r.crystal + '.', 'Para restaurar o cristal, vamos fazer o Desafio da Região, que mistura tudo o que você aprendeu aqui.']);
    const pct = await LRN.challenge(rid);
    const st = S().regionStats[rid] = Object.assign(S().regionStats[rid] || {}, { challenge: pct });
    let mastery = Q.mastery(rid);
    if (mastery < 0.7) {
      await UI.say('lumi', ['Seu cristal está recarregando. Vamos rever uma ideia e tentar uma missão menor.']);
      await LRN.recovery(rid);
      st.recovery = true;
    }
    await completeRegion(rid, mastery);
  }

  async function completeRegion(rid, mastery) {
    const r = D.regionById[rid];
    const s = S();
    const st = s.regionStats[rid];
    st.complete = true; st.mastery = mastery;
    if (!s.crystals.includes(rid)) s.crystals.push(rid);
    if (!s.medals.includes(r.medal)) s.medals.push(r.medal);
    ECO.award(D.rewards.mainQuest.xp, D.rewards.mainQuest.coins, 'Missão principal: ' + r.name);
    const hadItem = ECO.owns(r.chest.item);
    ECO.award(0, r.chest.coins + (hadItem ? 10 : 0), 'Baú da região');
    ECO.give(r.chest.item);
    // recompensa base (tudo com ajuda) × bônus de desempenho
    const qs = Q.questionsOf(rid);
    const base = { xp: qs.length * D.rewards.tier3.xp, coins: qs.length * D.rewards.tier3.coins };
    const got = qs.reduce((a, q) => { const t = D.rewards['tier' + (s.q[q.id].tier || 3)]; return { xp: a.xp + t.xp, coins: a.coins + t.coins }; }, { xp: 0, coins: 0 });
    const starsN = qs.reduce((a, q) => a + (s.q[q.id].stars || 0), 0);
    const info = { base, bonus: { xp: got.xp - base.xp, coins: got.coins - base.coins }, mastery, recovery: !!st.recovery, stars: Math.max(1, Math.round(starsN / qs.length)), starsN, starsMax: qs.length * 3, hadItem };
    EN.save.persist('região concluída');
    E.refreshTiles();
    E.celebrate();
    await UI.regionReward(r, info);
    const next = D.regions[r.n];
    await UI.say('lumi', next ? ['Incrível, {nome}! A Névoa recuou desta região.', 'Nova região liberada: ' + next.name + '! Vamos voltar à Vila: ela ficou mais bonita.'] : ['Os seis cristais estão restaurados! O Portal da Arena Final se abriu na Vila.']);
    await G.travel('vila', 17, 6);
  }

  /* ================================================================ ARENA FINAL */
  async function arenaCore() {
    const s = S();
    if (!Q.allRegionsDone()) { await UI.say('lumi', ['O Núcleo só pode ser enfrentado com os seis cristais.']); return; }
    if (s.storyDone) {
      const k = await UI.choice('solar', 'A Arena pode ser jogada de novo para melhorar sua pontuação (melhor: ' + Math.round(s.arena.best * 100) + '%). Vamos?', ['Jogar a Arena de novo', 'Agora não']);
      if (k !== 0) return;
    } else await UI.say('solar', ['Guardião, a Névoa se concentrou no Núcleo.', 'São 4 rodadas: Reconhecer, Construir, Explicar e o Chefão da Névoa. Cada acerto dissipa parte da Névoa.', 'A meta de 70% dá o prêmio máximo. Mas ninguém fica para trás!']);
    s.arena.round = 0; E.refreshTiles();
    const A = D.arena;
    const rounds = [
      { name: 'Rodada 1 — Reconhecer', text: '**5 questões rápidas** de conceitos e imagens.', items: U.shuffle(A.round1).slice(0, 5).map((x) => ({ spec: x })) },
      { name: 'Rodada 2 — Construir', text: 'Monte **uma cadeia**, **um ciclo** e **uma pirâmide**.', items: A.round2.map((x) => ({ spec: x })) },
      { name: 'Rodada 3 — Explicar', text: '**3 situações de causa e efeito**, com resposta guiada.', items: A.round3.map((x) => ({ spec: x })) },
      { name: 'Rodada 4 — Chefão da Névoa', text: '**10 questões** de todas as regiões, com prioridade para o que você errou antes.', items: LRN.pick(D.regions.map((r) => r.id), 10, { perRegion: true, originalForWrong: true }) }
    ];
    let first = 0, total = 0;
    const missedConcepts = [];
    for (let ri = 0; ri < rounds.length; ri++) {
      const rd = rounds[ri];
      await UI.cardsPromise([{ title: rd.name, art: ['👀', '🧱', '💬', '🌫️'][ri], text: rd.text }], { speaker: 'lumi' });
      for (let i = 0; i < rd.items.length; i++) {
        const it = rd.items[i];
        const q = it.q;
        const o = q ? { level: q.level, recap: q.recap, hint1: q.hint1, hint2: q.hint2, why: q.why, err: q.err, concept: q.concept, guidedSpec: it.orig ? q.guided : null, model: it.orig ? q.model : null }
          : { concept: it.spec.concept, hint1: 'Pense no que você aprendeu nas regiões.', hint2: 'Releia as palavras destacadas da pergunta.', recap: conceptRecap(it.spec.concept) };
        const res = await LRN.run(it.spec, Object.assign(o, { title: '⚔️ ' + rd.name + ' (' + (i + 1) + '/' + rd.items.length + ')', prompt: it.spec.prompt, missionKey: 'arena' }));
        total++;
        if (res.firstTry) first++; else missedConcepts.push(q ? q.concept : it.spec.concept);
        if (q) { const stq = s.q[q.id]; if (res.firstTry) stq.reviewOk++; else stq.reviewWrong++; }
        ECO.award(res.tier === 3 ? D.rewards.checkGuided.xp : D.rewards.check.xp, 0, 'Arena');
      }
      s.arena.round = ri + 1;
      E.refreshTiles(); E.celebrate();
      EN.save.persist('arena');
      UI.toast('🌫️ A Névoa enfraqueceu! (' + (ri + 1) + '/4)');
    }
    const pct = first / total;
    s.arena.tries++; s.arena.last = pct; s.arena.best = Math.max(s.arena.best, pct);
    const firstWin = !s.storyDone;
    if (pct >= 0.7) {
      await UI.say('lumi', ['Você atingiu ' + Math.round(pct * 100) + '%! O Núcleo da Névoa se desfez por completo!']);
      if (!s.arena.bonusWon) {
        s.arena.bonusWon = true;
        ECO.award(100, 40, 'Baú especial da Arena');
        ECO.give('coroa_folhas');
        if (!s.medals.includes('Mestre da Restauração')) s.medals.push('Mestre da Restauração');
        UI.toast('🎁 Baú especial: 40 EcoMoedas + Coroa de Folhas + medalha Mestre da Restauração!');
      }
    } else {
      await UI.say('lumi', ['Você fez ' + Math.round(pct * 100) + '%. O cristal ainda está recarregando.', 'Vamos fazer uma revisão guiada só dos conceitos que ficaram difíceis. Depois, a Névoa se desfaz!']);
      await guidedArenaReview(missedConcepts);
      if (firstWin) ECO.award(0, 15, 'Baú da Arena');
      UI.toast('Você pode voltar à Arena depois para buscar 70% e o prêmio raro!');
    }
    if (firstWin) {
      ECO.award(D.rewards.mainQuest.xp, D.rewards.mainQuest.coins, 'Missão principal: Arena Final');
      if (!s.medals.includes('Guardião do EcoNexus')) s.medals.push('Guardião do EcoNexus');
    }
    s.storyDone = true; s.arena.done = true; s.arena.round = 4;
    EN.save.persist('história concluída');
    E.refreshTiles();
    await restorationAnimation();
    const nxt = await UI.certificate();
    if (nxt === 'review') await G.reviewMode();
    else if (nxt === 'notebook') UI.notebook();
  }

  function conceptRecap(c) { const n = D.notebook.find((x) => x.id === c); return n ? n.text : ''; }

  async function guidedArenaReview(concepts) {
    const uniq = [...new Set(concepts)];
    let qs = uniq.map((c) => D.questions.find((q) => q.concept === c)).filter(Boolean);
    if (qs.length < 3) qs = qs.concat(U.shuffle(D.questions.filter((q) => !qs.includes(q))).slice(0, 3 - qs.length));
    qs = qs.slice(0, 5);
    await UI.cardsPromise(qs.map((q) => ({ title: 'Relembrando: ' + q.title, art: '📖', text: q.recap + '\n\n' + q.why })), { speaker: 'lumi', title: 'Revisão guiada' });
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      await LRN.run(Object.assign({ level: q.level }, q.review), { title: '🧭 Revisão guiada (' + (i + 1) + '/' + qs.length + ')', prompt: q.review.prompt, startGuided: 1, recap: q.recap, hint1: q.hint1, hint2: q.hint2, why: q.why, err: q.err, concept: q.concept, missionKey: 'arena_rev' });
      ECO.award(D.rewards.checkGuided.xp, D.rewards.checkGuided.coins, 'Revisão guiada');
    }
  }

  async function restorationAnimation() {
    const m = UI.modal({ title: 'Os seis cristais restauram o EcoNexus!', wide: true, cls: 'restore', noClose: true });
    const row = U.el('div', { class: 'cert-crystals anim' });
    m.body.appendChild(row);
    m.body.appendChild(U.el('p', { class: 'prompt' }, 'Trilha, Vale, Laboratório, Lago, Torre e Biomas: tudo em equilíbrio outra vez!'));
    for (const r of D.regions) { row.appendChild(U.el('span', { class: 'crystal on pop', style: { '--c': r.color } }, '💎')); EN.audio.play('coin'); await U.wait(350); }
    E.celebrate();
    await new Promise((res) => m.setActions([UI.btn('Ver meu certificado ▶', 'pri', () => { m.close(); res(); })]));
  }

  /* ================================================================ REVISÃO ANTES DA PROVA */
  G.reviewMode = async function () {
    if (!S().storyDone) { UI.toast('A Revisão antes da prova libera ao concluir a história.'); return; }
    if (G.busy) return;
    G.busy = true;
    try {
      await UI.cardsPromise([{ title: 'Revisão antes da prova', art: '📝', text: 'São **10 questões** sorteadas de todas as regiões, com **prioridade para as que você errou**. As que você errou voltam no formato original do livro. Boa revisão!' }], { speaker: 'lumi' });
      const r = await LRN.reviewSession(10);
      await UI.cardsPromise([{ title: 'Revisão concluída', art: r.ok >= 7 ? '🏆' : '🌱', text: 'Você acertou de primeira **' + r.ok + ' de ' + r.n + '**. ' + (r.ok >= 7 ? 'Excelente! Você está pronto para a prova.' : 'Ótimo treino! Repita a revisão: as questões erradas voltam com prioridade.') }], { speaker: 'lumi', finalLabel: 'Ok ▶' });
    } finally { G.busy = false; UI.hudUpdate(true); }
  };

  G.onPurchase = function (it) {
    if (it.bonus) UI.toast('🗝️ Área bônus liberada: ' + (it.bonus === 'jardim_raro' ? 'Canteiro Secreto do Jardim' : D.maps[it.bonus].name));
    if (it.deco) UI.toast('🪴 Veja a decoração no seu quarto (Casa de Lumi).');
    E.refreshTiles();
  };

  /* ================================================================ INÍCIO, CONTINUAR, REINICIAR */
  G.newGameFlow = async function () {
    if (EN.save.exists() && !(await UI.confirm('Já existe um jogo salvo. Começar um **novo jogo** apaga o progresso anterior. Continuar?', 'Novo jogo', 'Cancelar'))) return;
    const name = await UI.askName();
    EN.save.newGame(name);
    start(true);
  };
  G.continueGame = function () {
    if (!EN.save.load()) { UI.toast('Não encontrei um jogo salvo.'); return; }
    start(false);
  };
  async function start(isNew) {
    const s = S();
    UI.hideTitle();
    if (s.settings.sound) EN.audio.setEnabled(true);
    document.body.classList.toggle('big', !!s.settings.bigText);
    G.applyTouch();
    const map = D.maps[s.map] ? s.map : 'vila';
    E.loadMap(map, s.pos && s.pos.px ? { px: s.pos.px, py: s.pos.py } : undefined);
    S().visitedMaps[map] = true;
    UI.hudUpdate(true);
    if (isNew) {
      G.busy = true;
      await UI.cardsPromise([
        { title: 'Missão EcoNexus: Guardiões dos Biomas', art: '🌍', text: 'Uma força chamada **Névoa do Desequilíbrio** embaralhou as cadeias alimentares, aprisionou animais silvestres, desregulou os ciclos da matéria, poluiu rios e apagou as pistas dos biomas brasileiros.' },
        { title: 'Os seis Cristais da Natureza', art: '💎💎💎💎💎💎', text: 'Para restaurar o equilíbrio, é preciso recuperar **seis Cristais da Natureza**, um em cada região. **{nome}** foi escolhido como o novo **Guardião EcoNexus**!' },
        { title: 'Lumi, sua guia', art: '💧🍃☀️', text: 'Eu sou a **Lumi**: um pouquinho de folha, de gota d’água e de luz do Sol. Vou explicar, dar pistas e ficar do seu lado o tempo todo.' }
      ], { speaker: 'lumi', finalLabel: 'Vamos lá! ▶' });
      await UI.say('lumi', ['Esta é a Vila EcoNexus, nossa base!', 'Ande com WASD ou as setas (no celular, use o direcional). Para conversar e interagir, aperte E, Espaço ou o botão ✋.', 'O Portal das Regiões fica logo ali, ao norte. Nossa primeira parada: a Trilha dos Animais Livres!']);
      s.introDone = true;
      EN.save.persist('início');
      G.busy = false;
    }
  }
  G.toTitle = function () { EN.save.persist(); UI.title(); };
  G.resetAll = function () { E.map = null; EN.save.reset(); UI.toast('Progresso apagado.'); UI.title(); };

  /* ================================================================ LAÇO DE APOIO (tempo, HUD, posição) */
  let saveT = 0;
  setInterval(() => {
    const s = S();
    if (!s || UI.titleOpen) return;
    if (!document.hidden) {
      s.time.total++;
      const reg = E.map ? (D.maps[E.map.id].region || 'vila') : 'vila';
      s.time.region[reg] = (s.time.region[reg] || 0) + 1;
    }
    saveT++;
    if (E.map) { s.pos = { px: E.player.x, py: E.player.y }; s.map = E.map.id; }
    if (saveT >= 10) { saveT = 0; EN.save.persist(); }
  }, 1000);
  setInterval(() => { if (S() && !UI.titleOpen) UI.hudUpdate(); }, 300);
  window.addEventListener('beforeunload', () => { if (S()) EN.save.persist(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && S()) EN.save.persist(); });

  /* ================================================================ BOOT */
  G.boot = function () {
    UI.init();
    E.G = G;
    E.init(U.$('#world'));
    UI.title();
  };
  return G;
})();

window.addEventListener('DOMContentLoaded', () => EN.game.boot());
