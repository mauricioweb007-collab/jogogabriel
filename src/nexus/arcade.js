/* =====================================================================
   src/nexus/arcade.js — FLIPERAMA MULTIMUNDOS.
   Reúne SOMENTE os minigames já liberados no perfil (no modo de teste
   dos pais: todos). Filtros por matéria, gênero e favoritos. Treino
   livre, recorde pessoal, Medalhas de Fliperama e torneios curtos (3–5
   jogos alternando mundos) contra pilotos fictícios do computador.
   Minigames das matérias abrem pela página de replay do próprio jogo
   (sem alterar o comportamento original) e voltam com o resultado.
   Replays NÃO geram pontos de estudo nem moedas.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, E = GG.nexusEco;
  const btn = UI.btn;
  const CPU = ['Zeca Turbo', 'Lola Faísca', 'Bento Bip', 'Nina Neon', 'Tito Trovão', 'Duda Dínamo'];
  const originOf = (g) => (g.module === 'nexus' ? { t: 'Nexus', i: '🌀', c: '#29e7ff' } : (() => { const m = GG.modules.get(g.module); return m ? { t: m.franchise.title.split(' — ')[0], i: m.franchise.icon, c: m.franchise.color } : { t: g.module, i: '🎮', c: '#b07bff' }; })());
  const medalsTxt = (id) => { const m = (NX.p.arcade.medals || {})[id] || {}; return (m.bronze ? '🥉' : '○') + ' ' + (m.prata ? '🥈' : '○') + ' ' + (m.ouro ? '🥇' : '○'); };

  NX.areas.fliperama = {
    title: 'Fliperama Multimundos', icon: '🕹️', level: 2, bg: 'assets/cenarios/04_cenario_fliperama.jpg', music: 'fliperama', key: '3',
    open(body, arg) {
      const f = Object.assign({ mod: 'todos', genre: 'todos', fav: false }, (arg && arg.filter) || {});
      const p = NX.p;
      const all = GG.unlocks.all();
      const avail = GG.unlocks.available(p);
      const wrap = U.el('div', { class: 'wrapc' }); body.appendChild(wrap);
      wrap.appendChild(NX.areaTitle('🕹️', 'Fliperama Multimundos', 'Jogue de novo os minigames que você já liberou. Recordes e medalhas não mudam suas notas nem sua Pontuação de Carreira.'));
      // torneio em andamento
      if (p.arcade.tourney) wrap.appendChild(tourneyPanel(p.arcade.tourney));
      const mods = Array.from(new Set(avail.map((g) => g.module)));
      const genres = Array.from(new Set(avail.map((g) => g.genre))).sort();
      const re = (patch) => NX.open('fliperama', { filter: Object.assign({}, f, patch) });
      wrap.appendChild(U.el('div', { class: 'panel' }, [
        U.el('div', { class: 'tabs' }, [['todos', '🎮 Todos']].concat(mods.map((m) => { const o = originOf({ module: m }); return [m, o.i + ' ' + o.t]; })).map(([v, t]) => U.el('button', { type: 'button', class: f.mod === v ? 'on' : '', onclick: () => re({ mod: v }) }, t)).concat([U.el('button', { type: 'button', class: f.fav ? 'on' : '', onclick: () => re({ fav: !f.fav }) }, '⭐ Favoritos')])),
        U.el('div', { class: 'row' }, [U.el('label', { for: 'nxGenre' }, 'Gênero:'), (() => { const s = U.el('select', { id: 'nxGenre' }, [U.el('option', { value: 'todos' }, 'Todos')].concat(genres.map((g) => U.el('option', { value: g }, g)))); s.value = f.genre; s.addEventListener('change', () => re({ genre: s.value })); return s; })(),
          U.el('span', { style: { flex: '1' } }), btn('🏆 Torneio relâmpago', 'pri', () => startTourney(avail))])
      ]));
      const list = avail.filter((g) => (f.mod === 'todos' || g.module === f.mod) && (f.genre === 'todos' || g.genre === f.genre) && (!f.fav || p.arcade.favorites.includes(g.minigameId)));
      const grid = U.el('div', { class: 'grid', style: { '--min': '250px', marginTop: '14px' } });
      list.forEach((g) => grid.appendChild(gameCard(g)));
      if (!list.length) grid.appendChild(U.el('div', { class: 'panel empty' }, avail.length ? 'Nenhum jogo com esse filtro.' : 'Nenhum minigame liberado ainda. Jogue nas matérias: cada minijogo encontrado lá aparece aqui!'));
      wrap.appendChild(grid);
      const locked = all.filter((g) => !GG.unlocks.isUnlocked(p, g.minigameId));
      if (locked.length) {
        wrap.appendChild(U.el('div', { class: 'panel', style: { marginTop: '14px' } }, [U.el('h2', null, '🔒 Ainda não liberados (' + locked.length + ')'), U.el('ul', null, locked.map((g) => U.el('li', null, originOf(g).i + ' ' + g.title + ' — ' + (g.unlockText || '')))) ]));
      }
      if (arg && arg.result) setTimeout(() => showResult(arg.result), 200);
    }
  };

  function gameCard(g) {
    const o = originOf(g), rec = (NX.p.arcade.records || {})[g.minigameId];
    const fav = NX.p.arcade.favorites.includes(g.minigameId);
    return U.el('article', { class: 'game-card', style: { '--gc': o.c } }, [
      U.el('div', { class: 'gc-top' }, [U.el('span', { class: 'gc-ic' }, g.icon || o.i), U.el('div', null, [U.el('b', null, g.title), U.el('div', { class: 'tip' }, o.i + ' ' + o.t + ' • ' + g.genre)])]),
      U.el('div', { class: 'gc-b' }, [
        U.el('span', { class: 'tip' }, g.description),
        U.el('span', { class: 'tip' }, '🎮 ' + g.controls),
        U.el('div', { class: 'row' }, [U.el('span', { class: 'chip' }, '🏅 Recorde: ' + (rec ? rec.score : '—')), U.el('span', { class: 'medals', title: 'Bronze, prata e ouro' }, medalsTxt(g.minigameId)), U.el('span', { class: 'chip' }, '▶ ' + ((NX.p.arcade.plays || {})[g.minigameId] || 0) + 'x')]),
        U.el('div', { class: 'gc-acts' }, [btn('▶ Treino livre', 'go small', () => play(g)), btn(fav ? '★' : '☆', 'small ghost', () => { E.toggleFavorite(g.minigameId); NX.reload(); NX.open('fliperama'); }, { 'aria-label': fav ? 'Tirar dos favoritos' : 'Favoritar', title: 'Favorito' })])
      ])
    ]);
  }

  /** Joga um minigame. Nativo: aqui mesmo. Das matérias: página de replay com token. */
  function play(g, tourney) {
    const token = NX.txn('run');
    if (g.entry.type === 'native') {
      GG.audio.stopMusic();
      NX.games.run(g.minigameId).then((res) => {
        NX.music('fliperama');
        if (!res) { if (tourney) NX.open('fliperama'); return; }
        const r = E.arcadeResult(g.minigameId, res.score, token, { ghost: res.ghost });
        afterRun(g, r, tourney);
      });
      return;
    }
    GG.profile.update((p) => { p.arcade.pending = { token, gameId: g.minigameId, tourney: !!tourney, at: Date.now() }; });
    const q = Object.assign({}, g.entry.params, { token });
    const url = NX.root + g.entry.url + '?' + Object.keys(q).map((k) => k + '=' + encodeURIComponent(q[k])).join('&');
    NX.sfx('power', 'abrindo minigame'); setTimeout(() => { location.href = url; }, 250);
  }
  NX.playGame = play;
  /** Resultado que voltou de uma página de replay (chamado no boot). */
  NX.processInbox = function () {
    const got = GG.replay.drain(); let shown = null;
    got.forEach((x) => {
      NX.reload();
      const pend = NX.p.arcade.pending;
      if (!GG.unlocks.get(x.gameId)) return;
      const r = E.arcadeResult(x.gameId, x.score, x.token);
      const isT = pend && pend.token === x.token && pend.tourney;
      GG.profile.update((p) => { if (p.arcade.pending && p.arcade.pending.token === x.token) p.arcade.pending = null; });
      shown = { g: GG.unlocks.get(x.gameId), r, tourney: isT };
    });
    return shown;
  };
  function afterRun(g, r, tourney) {
    NX.refresh();
    if (tourney) { tourneyStep(g, r.score); return; }
    NX.open('fliperama', { result: { g, r } });
  }
  function showResult(o) {
    const g = o.g, r = o.r;
    if (o.tourney) { tourneyStep(g, r.score); return; }
    if (r.record || r.newMedals.length) NX.victoryFx();
    const m = UI.modal({ title: '🏁 ' + g.title, cls: 'small' });
    m.body.appendChild(U.el('div', { class: 'stack' }, [
      U.el('div', { class: 'kpi' }, [U.el('b', null, r.score + ' / 100'), U.el('span', null, 'Pontuação desta rodada (recreativa)')]),
      r.record ? U.el('p', { class: 'chip ok' }, '🏆 Novo recorde pessoal!' + (r.prevBest != null ? ' (antes: ' + r.prevBest + ')' : '')) : U.el('p', { class: 'tip' }, 'Recorde: ' + ((NX.p.arcade.records[g.minigameId] || {}).score || r.score)),
      r.newMedals.length ? U.el('p', null, 'Medalha de Fliperama: ' + r.newMedals.map((x) => ({ bronze: '🥉 Bronze', prata: '🥈 Prata', ouro: '🥇 Ouro' }[x])).join(', ')) : null,
      r.rewards.length ? U.el('p', { class: 'chip ok' }, '🎁 Recompensa cosmética: ' + r.rewards.map((id) => GG.nexusItem(id).name).join(', ')) : null,
      U.el('p', { class: 'tip' }, 'Replays dão recordes e medalhas. Pontos de estudo e moedas vêm das matérias.')
    ]));
    m.setActions([btn('🔁 Jogar de novo', '', () => { m.close(); play(g); }), btn('Pronto', 'pri', () => m.close())]);
  }
  NX.showArcadeResult = showResult;

  /* ================================================================ TORNEIOS */
  function seedRand(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return () => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 8) / 16777216; }; }
  function startTourney(avail) {
    if (avail.length < 3) { NX.toast('Um torneio precisa de pelo menos 3 minigames liberados. Continue explorando as matérias!', '', 3600); return; }
    const size = Math.min(avail.length, 3 + (avail.length >= 8 ? 2 : avail.length >= 5 ? 1 : 0));
    // alterna mundos
    const byMod = {}; U.shuffle(avail).forEach((g) => { (byMod[g.module] = byMod[g.module] || []).push(g); });
    const keys = Object.keys(byMod); const list = []; let i = 0;
    while (list.length < size) { const k = keys[i % keys.length]; const g = byMod[k].shift(); if (g) list.push(g.minigameId); i++; if (i > 100) break; }
    const id = NX.txn('torneio'); const rnd = seedRand(id);
    const rivals = U.shuffle(CPU).slice(0, 3).map((n, j) => ({ n, skill: 48 + j * 9 + Math.round(rnd() * 10) }));
    GG.profile.update((p) => { p.arcade.tourney = { id, list, idx: 0, mine: [], rivals, cpu: rivals.map(() => []), started: new Date().toISOString() }; });
    NX.reload();
    const m = UI.modal({ title: '🏆 Torneio relâmpago', cls: 'small' });
    m.body.appendChild(U.el('p', null, list.length + ' jogos seguidos contra ' + rivals.map((r) => r.n).join(', ') + ' (pilotos do computador).'));
    m.body.appendChild(U.el('ol', null, list.map((gid) => U.el('li', null, GG.unlocks.get(gid).title))));
    m.body.appendChild(U.el('p', { class: 'tip' }, 'Sem pressa: você pode pausar entre os jogos. Não há ranking online.'));
    m.setActions([btn('Cancelar', 'ghost', () => { GG.profile.update((p) => { p.arcade.tourney = null; }); m.close(); NX.open('fliperama'); }), btn('▶ Começar', 'pri', () => { m.close(); nextTourneyGame(); })]);
  }
  function nextTourneyGame() {
    const t = NX.reload().arcade.tourney; if (!t) return;
    const g = GG.unlocks.get(t.list[t.idx]); if (!g) { GG.profile.update((p) => { p.arcade.tourney = null; }); return; }
    play(g, true);
  }
  function tourneyStep(g, score) {
    let done = false, t = null;
    GG.profile.update((p) => {
      t = p.arcade.tourney; if (!t) return;
      if (t.list[t.idx] !== g.minigameId) return;
      const rnd = seedRand(t.id + ':' + t.idx);
      t.mine.push(score); t.rivals.forEach((r, j) => t.cpu[j].push(Math.max(10, Math.min(98, Math.round(r.skill + (rnd() - 0.5) * 30)))));
      t.idx++; done = t.idx >= t.list.length;
    });
    NX.reload(); t = NX.p.arcade.tourney; if (!t) return;
    const table = standings(t);
    const m = UI.modal({ title: done ? '🏆 Resultado do torneio' : '📊 Parcial do torneio (' + t.idx + '/' + t.list.length + ')', cls: 'small', noClose: true });
    m.body.appendChild(U.el('p', null, g.title + ': você fez ' + score + ' pontos.'));
    m.body.appendChild(U.el('div', { class: 'tourney' }, table.map((r, i) => U.el('div', { class: 'row' + (r.me ? ' me' : '') }, [U.el('b', null, (i + 1) + 'º'), U.el('span', { style: { flex: '1' } }, r.n), U.el('b', null, String(r.total))]))));
    if (done) {
      const pos = table.findIndex((r) => r.me) + 1;
      let prize = null;
      GG.profile.update((p) => { p.arcade.tourneys = (p.arcade.tourneys | 0) + 1; p.arcade.lastTourney = { at: new Date().toISOString(), pos, of: table.length }; if (pos === 1 && !p.arcade.cosmeticRewards.taca_torneio) { p.arcade.cosmeticRewards.taca_torneio = new Date().toISOString(); E._placeNew(p, 'taca_torneio'); prize = 'taca_torneio'; } p.arcade.tourney = null; });
      if (pos === 1) NX.victoryFx();
      m.body.appendChild(U.el('p', { class: 'story' }, pos === 1 ? '🥇 Você venceu o torneio!' : pos === 2 ? '🥈 Segundo lugar! Foi por pouco.' : 'Você terminou em ' + pos + 'º. Cada torneio é um treino novo!'));
      if (prize) m.body.appendChild(U.el('p', { class: 'chip ok' }, '🏆 Taça do Torneio colocada na sua casa!'));
      m.setActions([btn('Pronto', 'pri', () => { m.close(); NX.open('fliperama'); })]);
    } else {
      m.setActions([btn('⏸ Continuar depois', 'ghost', () => { m.close(); NX.open('fliperama'); }), btn('▶ Próximo: ' + GG.unlocks.get(t.list[t.idx]).title, 'pri', () => { m.close(); nextTourneyGame(); })]);
    }
  }
  function standings(t) {
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    return [{ n: NX.name(), total: sum(t.mine), me: true }].concat(t.rivals.map((r, j) => ({ n: r.n + ' 🤖', total: sum(t.cpu[j]) }))).sort((a, b) => b.total - a.total);
  }
  function tourneyPanel(t) {
    return U.el('div', { class: 'panel', style: { marginBottom: '14px', boxShadow: '0 0 0 3px #ffd23f' } }, [
      U.el('b', null, '🏆 Torneio em andamento: jogo ' + (t.idx + 1) + ' de ' + t.list.length),
      U.el('div', { class: 'row', style: { marginTop: '8px' } }, [btn('▶ Continuar: ' + ((GG.unlocks.get(t.list[t.idx]) || {}).title || ''), 'pri small', nextTourneyGame), btn('Desistir', 'ghost small', () => { GG.profile.update((p) => { p.arcade.tourney = null; }); NX.open('fliperama'); })])
    ]);
  }
})();
