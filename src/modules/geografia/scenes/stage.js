/* =====================================================================
   scenes/stage.js — RUNTIME COMUM DAS FASES DE GEOGRAFIA.
   Toda fase (qualquer estilo) usa este contexto para: HUD, energia,
   fragmentos, pontuação (a maior parte vem do aprendizado), perguntas
   que PAUSAM a ação, checkpoints com retomada imediata, menu de pausa,
   tela de resultado com medalha e recorde. Também contém os modos
   "Estudo rápido" (vai direto aos checkpoints de conteúdo) e
   "Revisão da prova" (prioriza erros).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, D = GEO.data;
  const ST = (GEO.stage = {});
  const S = () => GEO.save.S;
  GEO.scenes = GEO.scenes || {};

  /* ============================================================ HUD da fase */
  const hud = {};
  function buildHud(ctx) {
    const h = document.getElementById('stageHud');
    h.innerHTML = ''; h.classList.remove('hide');
    hud.title = U.el('div', { class: 'sh-title' }, [U.el('span', { class: 'sh-ch pix' }, 'CAP ' + ctx.def.ch), ' ' + ctx.def.title]);
    hud.hearts = U.el('div', { class: 'sh-hearts', 'aria-label': 'Energia' });
    hud.frag = U.el('div', { class: 'sh-stat', title: 'Fragmentos do Atlas' });
    hud.score = U.el('div', { class: 'sh-stat', title: 'Pontos' });
    hud.time = U.el('div', { class: 'sh-stat', title: 'Tempo de ação (pausa na leitura)' });
    hud.goal = U.el('div', { class: 'sh-goal' });
    const pause = U.el('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Pausa', title: 'Pausa (Esc)', onclick: () => ST.pauseMenu(ctx) }, '⏸');
    const hear = U.el('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Repetir fala', title: 'Repetir a última fala', onclick: () => GG.tts.repeat() }, '🔁');
    h.appendChild(U.el('div', { class: 'sh-row' }, [hud.title, hud.hearts, hud.frag, hud.score, hud.time, U.el('span', { style: { flex: '1' } }), hear, pause]));
    h.appendChild(hud.goal);
  }
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  /** Troca o conteúdo do item do HUD por ilustração + valor, com "pulo" quando o valor sobe. */
  function stat(el, icon, emoji, val) {
    const v = String(val);
    if (el._v === v) return;
    const up = el._v != null && parseFloat(v) > parseFloat(el._v);
    el._v = v; el.textContent = '';
    if (X()) { el.appendChild(X().el(icon, 18)); el.appendChild(document.createTextNode(' ' + v)); } else el.textContent = emoji + ' ' + v;
    if (up) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  }
  ST.updateHud = function (ctx) {
    if (!hud.hearts || !ctx) return;
    const hk = ctx.energy + '/' + ctx.maxEnergy;
    if (hud.hearts._v !== hk) {
      const lost = hud.hearts._v && parseInt(hud.hearts._v, 10) > ctx.energy;
      hud.hearts._v = hk; hud.hearts.textContent = '';
      hud.hearts.setAttribute('aria-label', 'Energia ' + ctx.energy + ' de ' + ctx.maxEnergy);
      if (X()) for (let i = 0; i < ctx.maxEnergy; i++) hud.hearts.appendChild(X().el('coracao', 18, i < ctx.energy ? 'hp' : 'hp off'));
      else hud.hearts.textContent = '❤'.repeat(Math.max(0, ctx.energy)) + '♡'.repeat(Math.max(0, ctx.maxEnergy - ctx.energy));
      if (lost) { hud.hearts.classList.remove('shake'); void hud.hearts.offsetWidth; hud.hearts.classList.add('shake'); }
    }
    stat(hud.frag, 'mapa', '🗺️', ctx.fragments + (ctx.fragTotal ? '/' + ctx.fragTotal : ''));
    stat(hud.score, 'estrela', '⭐', Math.round(ctx.learnPts + ctx.actionPts));
    stat(hud.time, 'cronometro', '⏱', U.fmtTime(ctx.time));
    hud.goal.textContent = ctx.goalText || ctx.def.goal || '';
  };
  function hideHud() { const h = document.getElementById('stageHud'); if (h) h.classList.add('hide'); }

  /* ============================================================ contexto */
  function Ctx(def, mode) {
    this.def = def; this.mode = mode || 'aventura';
    this.bonus = !!def.bonus;
    this.maxEnergy = 3 + (GEO.eco.has('heart') ? 1 : 0);
    this.energy = this.maxEnergy; this.fragments = 0; this.fragTotal = 0;
    this.learnPts = 0; this.learnMax = 0; this.actionPts = 0; this.actionMax = 0;
    this.time = 0; this.studyTime = 0; this.damage = 0; this.refillUsed = false;
    this.results = []; this.answered = []; this.checksOk = 0; this.checksTotal = 0;
    this.usedStatements = []; this.extraHints = GEO.eco.has('hint') ? 1 : 0;
    this.speed = 1 + (GEO.eco.has('speed') && S().stages[def.id] && S().stages[def.id].done ? 0.2 : 0);
    this.magnet = GEO.eco.has('magnet'); this.arrow = GEO.eco.has('arrow');
    this.look = GEO.eco.look(); this.pet = GEO.eco.has('pet'); this.trail = GEO.eco.has('trail');
    const cp = S().stages[def.id] && S().stages[def.id].cp;
    this.resume = cp && !cp.finished ? cp : null;
    if (this.resume) { this.answered = (cp.answered || []).slice(); this.learnPts = cp.learnPts || 0; this.fragments = cp.fragments || 0; this.actionPts = cp.actionPts || 0; this.time = cp.time || 0; this.checksOk = cp.checksOk || 0; this.checksTotal = cp.checksTotal || 0; }
    this.learnMax = def.questions.length * 120;
  }
  Ctx.prototype.hud = function () { ST.updateHud(this); };
  Ctx.prototype.tick = function (dt) { this.time += dt; if (Math.floor(this.time * 4) !== Math.floor((this.time - dt) * 4)) this.hud(); };
  Ctx.prototype.say = function (who, lines) { const t0 = Date.now(); return UI.say(who, lines).then(() => { this.studyTime += (Date.now() - t0) / 1000; }); };
  Ctx.prototype.cards = function (key) { const c = this.def.cards && this.def.cards[key]; return c ? this.say('gaia', c) : Promise.resolve(); };
  Ctx.prototype.qDone = function (id) { return this.answered.includes(id); };
  /** Questão do livro dentro da fase: pausa a ação, aplica o fluxo pedagógico e registra. */
  Ctx.prototype.q = function (id, extra) {
    let q = GEO.campaign.qById(id);
    if (!q) return Promise.resolve(null);
    if (extra && extra.patch) q = Object.assign({}, q, { spec: Object.assign({}, q.spec, extra.patch) });
    const self = this; const t0 = Date.now();
    GG.audio.sfx('check');
    return GG.quiz.run(q, Object.assign({
      subject: 'Geografia', subjectIcon: '🌎', chips: [this.def.title], visual: GEO.visuals.render,
      mode: this.mode,
      extraHint: () => self.extraHints, useExtraHint: () => { if (self.extraHints > 0) { self.extraHints--; return true; } return false; }
    }, extra || {})).then((res) => {
      self.studyTime += (Date.now() - t0) / 1000;
      const r = GEO.campaign.recordQ(res, { mode: self.mode, factor: GEO.eco.replayFactor(self.def.id) });
      if (!self.answered.includes(id)) self.answered.push(id);
      self.learnPts += r.pts; self.results.push({ id, tier: res.tier, pts: r.pts, personal: res.personal });
      if (q.effect) UI.toast('✨ ' + q.effect, 'ok', 2600);
      if (r.coins) GG.engine.fx.float(self.fxX || 0, self.fxY || 0, '+' + r.coins + '🪙', '#ffd23f');
      self.hud();
      return res;
    });
  };
  /** Sorteia afirmações do capítulo (verdadeiras/falsas) sem repetir na fase. */
  Ctx.prototype.statements = function (nTrue, nFalse, ch) {
    const all = D.statements[ch || this.def.ch] || [];
    const pick = (v, n) => { const pool = U.shuffle(all.filter((s) => s.v === v && !this.usedStatements.includes(s.t))); const out = pool.slice(0, n); if (out.length < n) out.push(...U.shuffle(all.filter((s) => s.v === v)).slice(0, n - out.length)); out.forEach((s) => this.usedStatements.push(s.t)); return out; };
    return U.shuffle(pick(true, nTrue).concat(pick(false, nFalse)));
  };
  /** Checagem rápida: escolher a afirmação verdadeira entre opções (Bloco do Erro). */
  Ctx.prototype.check = function (opts) {
    const o = opts || {}; const self = this;
    const sts = o.statements || this.statements(1, 2);
    const spec = { keepOrder: true, options: sts.map((s) => ({ t: s.t, ok: s.v, fb: s.fb })) };
    const t0 = Date.now();
    return GG.quiz.quick(Object.assign({ prompt: o.prompt || 'Qual afirmação está **correta**? Escolha-a para quebrar o Bloco do Erro!', type: 'mc', recap: 'Leia cada frase com calma. Só uma está de acordo com o que estudamos.', hint2: 'Descarte as frases que generalizam ou contradizem a explicação da Gaia.' }, spec), { id: 'CHECAGEM', title: o.title || 'Bloco do Erro', subject: 'Geografia', chips: [this.def.title], doneLabel: 'Continuar ▶' }).then((res) => {
      self.studyTime += (Date.now() - t0) / 1000;
      const ok = res.attempts === 1; self.checksTotal++; if (ok) self.checksOk++;
      GEO.campaign.recordCheck(ok, 'Checagens do capítulo ' + self.def.ch);
      const pts = ok ? D.rewards.check.pts : 10; self.learnPts += pts; self.learnMax += D.rewards.check.pts;
      GEO.eco.award(ok ? D.rewards.check.xp : 10, ok ? D.rewards.check.coins : 1, 'Checagem ' + self.def.title, GEO.eco.replayFactor(self.def.id));
      self.hud();
      return { ok, res, statements: sts };
    });
  };
  Ctx.prototype.fragment = function (x, y) {
    this.fragments++; S().fragments++; this.actionPts += D.rewards.fragment.pts;
    GG.audio.sfx('frag'); GG.engine.fx.burst(x, y, ['#ffe9a8', '#f3d78a', '#fff'], 14, 90); GG.engine.fx.float(x, y - 8, '+1 🗺️', '#ffe9a8');
    if (X()) { X().sparkle(x, y, '#ffe39a', 7); X().ring(x, y, '#fff3c0', 22); }
    this.hud();
  };
  Ctx.prototype.coin = function (x, y) { this.actionPts += 1; GG.audio.sfx('coin'); GG.engine.fx.burst(x, y, '#ffd23f', 6, 60); if (X()) X().sparkle(x, y, '#ffd23f', 3); this.hud(); };
  Ctx.prototype.addAction = function (p) { this.actionPts += p; this.hud(); };
  /** Dano de ação. Retorna true se a energia acabou (a cena volta ao checkpoint com energia cheia). */
  Ctx.prototype.hurt = function () {
    this.damage++; this.energy--; GG.audio.sfx('hit'); GG.engine.shake(3, 0.2); if (X()) X().flash('#ff4d4d', 0.28);
    if (this.energy <= 0 && GEO.eco.has('refill') && !this.refillUsed) { this.refillUsed = true; this.energy = this.maxEnergy; UI.toast('🧃 Garrafinha de Energia usada!', 'ok'); this.hud(); return false; }
    if (this.energy <= 0) { this.energy = this.maxEnergy; this.hud(); UI.toast('Voltando ao último checkpoint — nada do que você aprendeu foi perdido.', '', 2600); return true; }
    this.hud(); return false;
  };
  Ctx.prototype.checkpoint = function (data) {
    const s = S(); const st = (s.stages[this.def.id] = s.stages[this.def.id] || { done: false, plays: 0, playsDay: {}, best: null });
    st.cp = { data, answered: this.answered.slice(), learnPts: this.learnPts, fragments: this.fragments, actionPts: this.actionPts, time: this.time, checksOk: this.checksOk, checksTotal: this.checksTotal, at: Date.now() };
    s.last = { stage: this.def.id, at: Date.now() };
    GEO.save.persist(); GG.audio.sfx('check');
    if (!this._quietCp) UI.toast('🚩 Checkpoint salvo', '', 1400);
  };
  Ctx.prototype.setGoal = function (t) { this.goalText = t; this.hud(); };
  /** Encerra a fase e mostra o resultado. extra: {geobot:{won}} */
  Ctx.prototype.finish = function (extra) {
    const self = this;
    GG.engine.scene && (GG.engine.scene.paused = true);
    const stats = Object.assign({ learnPts: this.learnPts, learnMax: Math.max(this.learnMax, 1), actionPts: this.actionPts, actionMax: this.actionMax, time: this.time, damage: this.damage, fragments: this.fragments, studyTime: this.studyTime }, extra || {});
    const r = GEO.campaign.finishStage(this.def.id, stats, this.mode);
    const st = S().stages[this.def.id]; if (st && st.cp) st.cp.finished = true;
    GEO.save.persist();
    GG.audio.music('vitoria'); GG.audio.sfx('win');
    return ST.results(this, r, stats);
  };

  /* ============================================================ executar fase */
  ST.cur = null;
  ST.run = async function (id, mode) {
    const def = D.stageById[id];
    if (!def) return;
    mode = mode || S().settings.pace || 'aventura';
    if (mode === 'revisao') { GEO.review.run(); return; }
    if (mode === 'rapido' && !def.bonus) { await ST.quick(def); return; }
    const ctx = new Ctx(def, 'aventura');
    ST.cur = ctx;
    if (ctx.resume) {
      const go = await new Promise((res) => {
        const m = UI.modal({ title: '🚩 Checkpoint encontrado', cls: 'small', onClose: () => res(true) });
        m.body.appendChild(U.el('p', null, 'Você parou no meio de “' + def.title + '”. Quer continuar do último checkpoint ou recomeçar a fase?'));
        m.setActions([UI.btn('Recomeçar', 'ghost', () => { ctx.resume = null; ctx.answered = []; ctx.learnPts = 0; ctx.fragments = 0; ctx.actionPts = 0; ctx.time = 0; ctx.checksOk = 0; ctx.checksTotal = 0; res(true); m.close(); }), UI.btn('Continuar ▶', 'pri', () => { res(true); m.close(); })]);
      });
      void go;
    }
    GEO.app.showStage();
    buildHud(ctx); ctx.hud();
    const scene = GEO.scenes[def.engine](ctx);
    ctx.scene = scene;
    GG.engine.start(scene);
    if (X()) { X().iris('in'); X().banner(def); }
    if (def.music) GG.audio.music(def.music);
    if (!ctx.resume && def.intro && S().settings.pace !== 'rapido') { scene.paused = false; await ctx.say('gaia', def.intro); }
    if (scene.begin) scene.begin();
  };
  ST.exitToAtlas = function (ctx) {
    if (GEO.mode && GEO.mode.isReplay()) { GG.engine.stop(); GG.replay.back('../../../'); return; }
    GG.engine.stop(); hideHud(); ST.cur = null; GG.tts.stop();
    if (ctx) S().time.total += 0;
    GEO.save.persist(); GEO.app.showAtlas();
  };

  /* ============================================================ pausa */
  ST.pauseMenu = function (ctx) {
    if (UI.blocking()) return;
    const m = UI.modal({ title: '⏸ Pausa — ' + ctx.def.title, cls: 'small' });
    m.body.appendChild(U.el('p', { class: 'tip' }, 'A ação está parada. Seu progresso fica salvo no último checkpoint.'));
    const cards = ctx.def.cards ? Object.values(ctx.def.cards) : [];
    m.setActions([
      UI.btn('⚙️ Configurações', '', () => { m.close(); GEO.app.settings(); }),
      cards.length || ctx.def.intro ? UI.btn('📖 Rever explicações', '', () => { m.close(); ctx.say('gaia', [].concat(ctx.def.intro || []).concat(...cards).slice(0, 3)); }) : null,
      UI.btn('🗺️ Sair para o Atlas', 'ghost', () => { m.close(); ST.exitToAtlas(ctx); }),
      UI.btn('Continuar ▶', 'pri', () => m.close())
    ]);
  };

  /* ============================================================ resultado */
  /** Linha "Gabriel Nexus": pontos de carreira e Moedas Nexus recebidos (só no jogo real). */
  ST.nexusRow = function () {
    try {
      if (!GG.bridge || !GEO.mode || GEO.mode.kind !== 'normal' || !window.GEO_MANIFEST) return null;
      const r = GG.bridge.sync({ modules: [window.GEO_MANIFEST], collectibles: false });
      if (!GG.FR.nexusVisible) return null; // Nexus oculto: pontos guardados, sem mostrar à criança
      if (!r.points) return null;
      return U.el('tr', null, [U.el('td', null, '🌀 Gabriel Nexus'), U.el('td', null, '+' + r.points + ' pontos de carreira • +' + r.coins + ' Moedas Nexus')]);
    } catch (e) { return null; }
  };
  /** Resultado de um REPLAY do Fliperama: vai para o Nexus como recorde (sem pontos de estudo). */
  ST.replayResults = function (ctx, r) {
    return new Promise((resolve) => {
      hideHud();
      const score = Math.round(r.pct * 100);
      if (GEO.mode.token) GG.replay.push('geografia_' + ctx.def.id, score, GEO.mode.token);
      const m = UI.modal({ title: '🕹️ ' + ctx.def.title + ' — replay', noClose: true });
      m.body.appendChild(U.el('div', { class: 'res-medal medal-' + r.medal.id }, [U.el('div', { class: 'res-icon' }, r.medal.icon), U.el('div', null, [U.el('b', { class: 'pix' }, 'Medalha ' + r.medal.t), U.el('div', null, 'Aproveitamento: ' + score + '%')])]));
      m.body.appendChild(U.el('p', { class: 'tip' }, 'Replay recreativo do Fliperama: vale recorde e Medalha de Fliperama no Gabriel Nexus, não pontos de estudo. Seu save de Geografia não mudou.'));
      m.setActions([UI.btn('🔁 Jogar de novo', '', () => { m.close(); GG.engine.stop(); ST.cur = null; resolve('again'); GEO.save.newGame(S().name); S().introDone = true; ST.run(ctx.def.id, 'aventura'); }), UI.btn('🕹️ Voltar ao Fliperama', 'pri', () => { m.close(); resolve('back'); GG.replay.back('../../../'); })]);
    });
  };
  ST.results = function (ctx, r, stats) {
    if (GEO.mode && GEO.mode.isReplay()) return ST.replayResults(ctx, r, stats);
    return new Promise((resolve) => {
      hideHud();
      const def = ctx.def;
      const m = UI.modal({ title: (def.bonus ? '🎁 ' : '🏁 ') + def.title + ' concluída!', noClose: true, wide: true });
      const b = m.body;
      const medalIcon = X() ? U.el('div', { class: 'res-icon res-3d' }, [U.el('span', { class: 'res-shine' }), X().el({ bronze: 'bronze', prata: 'prata', ouro: 'ouro', diamante: 'diamante' }[r.medal.id] || 'ouro', 64)]) : U.el('div', { class: 'res-icon' }, r.medal.icon);
      const medalBox = U.el('div', { class: 'res-medal medal-' + r.medal.id }, [medalIcon, U.el('div', null, [U.el('b', { class: 'pix' }, 'Medalha ' + r.medal.t), U.el('div', null, 'Aproveitamento: ' + Math.round(r.pct * 100) + '%'), r.record ? U.el('div', { class: 'res-rec' }, '🏆 Novo recorde pessoal!') : null])]);
      b.appendChild(medalBox);
      if (X()) { const nS = { bronze: 1, prata: 2, ouro: 3, diamante: 3 }[r.medal.id] || 1; b.appendChild(U.el('div', { class: 'res-stars', 'aria-label': nS + ' de 3 estrelas' }, [0, 1, 2].map((i) => { const e = X().el('estrela', 44, 'st ' + (i < nS ? 'on' : 'off')); e.style.animationDelay = (0.25 + i * 0.28) + 's'; return e; }))); }
      const lp = Math.round(stats.learnPts), ap = Math.round(Math.min(stats.actionPts, Math.round((stats.learnMax || 100) * 0.3)));
      b.appendChild(U.el('table', { class: 'tbl' }, [
        U.el('tr', null, [U.el('td', null, '📚 Pontos de aprendizado'), U.el('td', null, String(lp))]),
        U.el('tr', null, [U.el('td', null, '🎮 Pontos de ação (fragmentos, coleta, sem dano)'), U.el('td', null, String(ap))]),
        U.el('tr', null, [U.el('td', null, '🗺️ Fragmentos do Atlas'), U.el('td', null, String(stats.fragments || 0))]),
        U.el('tr', null, [U.el('td', null, '⏱ Tempo de ação'), U.el('td', null, U.fmtTime(stats.time))]),
        stats.geobot ? U.el('tr', null, [U.el('td', null, '🤖 Corrida contra o GeoBot'), U.el('td', null, stats.geobot.won ? 'Você venceu! 🥇' : 'GeoBot venceu desta vez')]) : null,
        U.el('tr', null, [U.el('td', null, '🪙 EcoMoedas / ⭐ XP ganhos'), U.el('td', null, '+' + r.rewards.coins + ' / +' + r.rewards.xp + (r.factor < 1 && !r.firstClear ? ' (repetição)' : ''))]),
        ST.nexusRow()
      ]));
      if (ctx.results.length) {
        b.appendChild(U.el('h3', null, 'Questões desta fase'));
        b.appendChild(U.el('ul', { class: 'res-q' }, ctx.results.map((x) => { const q = GEO.campaign.qById(x.id); return U.el('li', null, (x.personal ? '💬 ' : x.tier === 1 ? '⭐⭐⭐ ' : x.tier === 2 ? '⭐⭐ ' : '⭐ ') + q.id + ' — ' + q.title); })));
      }
      if (r.rewards.bonusUnlocked) b.appendChild(U.el('p', { class: 'res-rec' }, '🎁 Sala bônus liberada: ' + r.rewards.bonusUnlocked.title + '!'));
      const next = GEO.campaign.nextStage();
      const acts = [UI.btn('🗺️ Voltar ao Atlas', 'ghost', () => { m.close(); resolve('atlas'); after('atlas'); }), UI.btn('🔁 Repetir para melhorar', '', () => { m.close(); resolve('again'); after('again'); })];
      if (next && !def.bonus && next.id !== def.id) acts.push(UI.btn('Próxima: ' + next.title + ' ▶', 'pri', () => { m.close(); resolve('next'); after('next', next); }));
      m.setActions(acts);
      if (r.medal.id !== 'bronze') GG.engine.fx.confetti(GG.engine.W / 2 + ((ctx.scene && ctx.scene.cam && ctx.scene.cam.x) || 0), 60 + ((ctx.scene && ctx.scene.cam && ctx.scene.cam.y) || 0), 60);
      function after(what, nx) {
        GG.engine.stop(); ST.cur = null;
        const ch = r.rewards.chapter;
        const go = () => {
          if (what === 'again') ST.run(def.id, 'aventura');
          else if (what === 'next') ST.run(nx.id);
          else GEO.app.showAtlas();
        };
        if (ch) GEO.app.chapterComplete(ch).then(go); else go();
      }
    });
  };

  /* ============================================================ ESTUDO RÁPIDO */
  /** Vai direto aos checkpoints de conteúdo: explicações curtas, visuais e questões, sem trechos de ação. */
  ST.quick = async function (def) {
    const ctx = new Ctx(def, 'rapido'); ctx.resume = null; ctx.answered = []; ctx.learnPts = 0; ctx.time = 0;
    ST.cur = ctx; GEO.app.showStage(); GG.engine.start(GEO.scenes.studyRoom(ctx)); GG.audio.music('atlas');
    const t0 = Date.now();
    await ctx.say('gaia', ['Estudo rápido: **' + def.title + '**. Vamos direto ao conteúdo e às questões.']);
    const cardKeys = Object.keys(def.cards || {});
    for (const id of def.questions) {
      const k = cardKeys.shift(); if (k) await ctx.cards(k);
      await ctx.q(id, { chips: ['Estudo rápido', def.title] });
      await ctx.check({ title: 'Checagem rápida' });
    }
    while (cardKeys.length) await ctx.cards(cardKeys.shift());
    ctx.time = (Date.now() - t0) / 1000; ctx.studyTime = ctx.time;
    S().quickLog.push({ stage: def.id, at: Date.now(), pts: ctx.learnPts, max: ctx.learnMax });
    await ctx.finish();
  };

  /* ============================================================ REVISÃO DA PROVA */
  const RV = (GEO.review = {});
  RV.available = () => Object.values(S().q).some((x) => x.seen);
  RV.run = async function (opts) {
    const o = opts || {};
    if (!RV.available()) { UI.toast('Jogue a primeira fase para liberar a revisão.'); return; }
    const full = S().finalDone;
    const queue = GEO.campaign.reviewQueue(full).slice(0, o.size || 10);
    GEO.app.showStage(); GG.engine.start(GEO.scenes.studyRoom({ def: { title: 'Revisão da Prova', ch: 0 } })); GG.audio.music('atlas');
    await UI.say('gaia', [full ? '**Revisão da Prova**: primeiro as questões em que você teve dificuldade, depois o conteúdo principal.' : 'Revisão do que você já estudou, começando pelo que teve mais dificuldade.']);
    let ok = 0, n = 0; const t0 = Date.now();
    for (let i = 0; i < queue.length; i++) {
      const q = queue[i]; const rv = q.review; if (!rv) continue;
      const rq = { id: q.id, title: 'Revisão: ' + q.title, prompt: rv.prompt, type: rv.type, spec: rv, why: q.why, ok: 'Revisado!', recap: q.recap, hint1: q.hint1, hint2: q.hint2, guided: q.guided, book: q.book, confirm: null, visual: q.visual, visualOpen: false };
      const res = await GG.quiz.run(rq, { subject: 'Geografia', chips: ['Revisão da prova', (i + 1) + '/' + queue.length], visual: GEO.visuals.render, pre: false, doneLabel: i < queue.length - 1 ? 'Próxima ▶' : 'Terminar ▶' });
      n++; const st = S().q[q.id]; if (res.attempts === 1) { ok++; st.reviewOk++; } else { st.reviewWrong++; st.wrongOnce = true; }
      GEO.eco.award(res.attempts === 1 ? 15 : 8, res.attempts === 1 ? 2 : 1, 'Revisão ' + q.id);
      if (i % 3 === 2) { const c = await GEO.review.statement(); if (c) { n++; if (c.ok) ok++; } }
    }
    S().reviewLog.push({ at: Date.now(), n, ok, full, time: Math.round((Date.now() - t0) / 1000) });
    S().time.study += (Date.now() - t0) / 1000;
    GEO.save.persist();
    const m = UI.modal({ title: '📝 Revisão concluída', cls: 'small', noClose: true });
    m.body.appendChild(U.el('p', null, 'Você acertou de primeira ' + ok + ' de ' + n + ' itens.'));
    const weak = GEO.campaign.weakConcepts().slice(0, 3);
    if (weak.length) m.body.appendChild(U.el('p', { class: 'tip' }, 'Vale revisar: ' + weak.map((w) => w.concept).join(', ') + '.'));
    m.setActions([UI.btn('Mais uma rodada', '', () => { m.close(); RV.run(o); }), UI.btn('Voltar ao Atlas', 'pri', () => { m.close(); GG.engine.stop(); GEO.app.showAtlas(); })]);
  };
  RV.statement = function () {
    const ch = U.pick([1, 2, 3].filter((n) => GEO.data.stages.some((s) => s.ch === n && S().stages[s.id] && S().stages[s.id].done)).concat([1]));
    const all = GEO.data.statements[ch];
    const sts = U.shuffle(U.shuffle(all.filter((s) => s.v)).slice(0, 1).concat(U.shuffle(all.filter((s) => !s.v)).slice(0, 2)));
    return GG.quiz.quick({ prompt: 'Qual afirmação está **correta**?', type: 'mc', keepOrder: true, options: sts.map((s) => ({ t: s.t, ok: s.v, fb: s.fb })) }, { title: 'Afirmação do capítulo ' + ch, subject: 'Geografia', chips: ['Revisão'], doneLabel: 'Continuar ▶' }).then((r) => { GEO.campaign.recordCheck(r.attempts === 1, 'Checagens do capítulo ' + ch); return { ok: r.attempts === 1 }; });
  };
})();
