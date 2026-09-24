/* =====================================================================
   src/nexus/main.js — INICIALIZAÇÃO DO GABRIEL NEXUS.
   Carrega manifestos e pacotes, sincroniza a ponte de pontuação (a
   importação inicial acontece uma única vez por módulo), processa
   resultados de replays, mostra a história e o resumo de boas-vindas,
   oferece o presente inicial e abre o hub (ou a área do endereço #).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, E = GG.nexusEco;
  const btn = UI.btn;
  const $ = (id) => document.getElementById(id);

  NX.story = function () {
    return UI.say('miojo', [
      'Uau, **' + NX.name() + '**! Você acordou o **Nexus**, o pequeno mundo que fica no centro de todas as suas aventuras.',
      'Cada coisa que você aprende nas matérias vira **energia**. Com energia, o Nexus cresce: novas áreas, criaturas e jogos aparecem.',
      'Nós somos os **Nexóticos**! Monte sua equipe, decore sua casa e jogue no Fliperama. Estudar nas matérias faz tudo aqui crescer!'
    ]);
  };
  function migrationSummary(sync) {
    return new Promise((res) => {
      // usa as marcas de migração gravadas (a importação pode ter ocorrido no lançador)
      const marks = NX.p.migrationMarkers || {};
      const mig = Object.keys(marks).map((k) => { const mod = GG.modules.get(k.split('@')[0]); return Object.assign({ title: mod ? mod.franchise.title : k }, marks[k]); }).filter((x) => x.points > 0);
      const pts = mig.reduce((a, x) => a + x.points, 0), coins = mig.reduce((a, x) => a + x.coins, 0);
      void sync;
      const m = UI.modal({ title: '🌀 Energia das suas aventuras', cls: 'small', onClose: res });
      if (pts > 0) {
        m.body.appendChild(U.el('p', { class: 'story' }, ['Suas aventuras anteriores trouxeram ', U.el('b', null, U.fmtInt(pts) + ' pontos'), ' e ', U.el('b', null, [NX.coin(), ' ' + coins + ' moedas']), '!']));
        m.body.appendChild(U.el('ul', null, mig.map((x) => U.el('li', null, x.title + ': ' + U.fmtInt(x.points) + ' pontos (' + x.events + ' conquistas)'))));
        m.body.appendChild(U.el('p', { class: 'tip' }, 'Isso foi importado uma única vez. Daqui em diante, cada conquista nova nas matérias soma sozinha.'));
      } else {
        m.body.appendChild(U.el('p', { class: 'story' }, 'O Nexus ainda está com pouca energia. Cada questão e missão concluída nas matérias vira pontos e Moedas Nexus!'));
      }
      m.setActions([btn('Continuar ▶', 'pri', () => m.close())]);
    });
  }
  function giftChoice() {
    return new Promise((res) => {
      const commons = GG.catalog.list.filter((c) => c.rarity === 'comum' && !NX.has(c.id));
      if (!commons.length) { GG.profile.update((p) => { p.seen.welcomeGift = 'fragmentos'; p.fragments += 10; }); NX.toast('🎁 Presente de boas-vindas: +10 fragmentos!', 'ok', 3000); res(); return; }
      const m = UI.modal({ title: '🎁 Escolha seu primeiro Nexótico', wide: true, noClose: true, onClose: res });
      m.body.appendChild(U.el('p', null, 'Presente de boas-vindas! Ele vai ser seu companheiro e aparecer no Parque. Os outros você conquista estudando, na Loja ou na Cápsula-surpresa.'));
      const g = U.el('div', { class: 'grid', style: { '--min': '150px' } });
      commons.forEach((ch) => g.appendChild(NX.charCard(ch, { showName: true, sub: '✨ ' + ch.power.name, onClick: () => {
        const r = E.welcomeGift(ch.id);
        if (r.ok) { NX.jingle(ch); NX.victoryFx(); NX.toast('🎉 ' + ch.name + ' é seu companheiro!', 'ok', 3000); }
        m.close();
      } })));
      m.body.appendChild(g);
    });
  }
  function newCharsModal(ids) {
    if (!ids.length) return Promise.resolve();
    return new Promise((res) => {
      const m = UI.modal({ title: ids.length > 1 ? '🎉 Novos Nexóticos chegaram!' : '🎉 Um novo Nexótico chegou!', wide: ids.length > 2, cls: ids.length > 2 ? '' : 'small', onClose: res });
      const g = U.el('div', { class: 'grid', style: { '--min': '150px' } });
      ids.map((id) => GG.catalog.get(id)).filter(Boolean).forEach((ch) => { g.appendChild(NX.charCard(ch, { sub: NX.p.collectibles[ch.id] && NX.p.collectibles[ch.id].label })); });
      m.body.appendChild(U.el('p', null, 'Conquistados pelos seus estudos! Eles já estão no Parque.'));
      m.body.appendChild(g);
      GG.profile.update((p) => { ids.forEach((id) => { if (!p.parkVisible.includes(id)) p.parkVisible.push(id); }); });
      NX.victoryFx(); NX.sfx('win', 'novo Nexótico');
      m.setActions([btn('Oba! ▶', 'pri', () => m.close())]);
    });
  }

  /* ---------------- barra de áreas e mapa rápido ---------------- */
  const DOCK = [['mundos', '🌍', 'Mundos'], ['parque', '🌳', 'Parque'], ['fliperama', '🕹️', 'Fliperama'], ['galeria', '🏆', 'Galeria'], ['oficina', '🎨', 'Oficina'], ['base', '🏠', 'Casa'], ['loja', '🛒', 'Loja'], ['coracao', '💠', 'Coração'], ['terminal', '👪', 'Pais']];
  function go(id) {
    if (id === 'mundos') { worlds(); return; }
    const onHub = !$('nxHub').classList.contains('hide');
    const s = NX.hub.SPOTS.find((x) => x.area === id);
    if (onHub && s && NX.areaOpen(id)) NX.hub.activate(s, true); else NX.open(id);
  }
  NX.go = go;
  function renderDock() {
    const d = $('nxDock'); d.innerHTML = '';
    DOCK.forEach(([id, ic, t], i) => {
      const lock = id !== 'mundos' && !NX.areaOpen(id);
      const badge = (id === 'parque' && NX.p.expedition && Date.now() >= NX.p.expedition.end) || (id === 'fliperama' && NX.p.arcade.tourney);
      const b = U.el('button', { type: 'button', class: lock ? 'locked' : '', title: t + ' (' + (i + 1) + ')' + (lock ? ' — bloqueado' : ''), 'aria-label': t + (lock ? ' (bloqueado)' : '') }, [U.el('span', { class: 'dk' }, String(i + 1)), U.el('span', { class: 'di' }, lock ? '🔒' : ic), t, badge ? U.el('span', { class: 'db' }) : null]);
      b.addEventListener('click', () => go(id));
      d.appendChild(b);
    });
  }
  function worlds() {
    const m = UI.modal({ title: '🌍 Portais dos mundos', cls: 'small' });
    m.setActions(NX.hub.SPOTS.filter((s) => s.id.indexOf('p_') === 0).map((s) => btn(s.icon + ' ' + s.label, '', () => { m.close(); if (!$('nxHub').classList.contains('hide')) NX.hub.activate(s, true); else NX.areas.portal.show(s.world); })).concat([btn('Fechar', 'ghost', () => m.close())]));
  }
  function quickMap() {
    const m = UI.modal({ title: '🗺️ Mapa rápido', wide: true });
    m.body.appendChild(U.el('p', { class: 'tip' }, NX.power('fast_travel') ? '🪽 Voo Direto ativo: viagem instantânea!' : 'Escolha um lugar. Atalhos: 1 a 9 no teclado.'));
    const g = U.el('div', { class: 'grid', style: { '--min': '170px' } });
    NX.hub.SPOTS.forEach((s) => {
      const lock = s.area && !NX.areaOpen(s.area);
      g.appendChild(btn((lock ? '🔒 ' : s.icon + ' ') + s.label, lock ? 'ghost' : '', () => { m.close(); if (s.area) { if ($('nxHub').classList.contains('hide')) NX.open(s.area); else NX.hub.activate(s, true); } else { if ($('nxHub').classList.contains('hide')) NX.showHub(); NX.hub.activate(s, true); } }));
    });
    m.body.appendChild(g);
    m.setActions([btn('Voltar para a Praça', '', () => { m.close(); NX.showHub(); }), btn('Fechar', 'pri', () => m.close())]);
  }
  function teamQuick() {
    const m = UI.modal({ title: '🧸 Minha equipe', wide: true });
    m.body.appendChild(U.el('p', null, 'Toque para pôr ou tirar da equipe (até 3). Poderes ativos: ' + (GG.powers.team(NX.p).map((c) => c.power.name).join(', ') || 'nenhum') + '.'));
    const g = U.el('div', { class: 'grid', style: { '--min': '140px' } });
    E.ownedChars(NX.p).forEach((ch) => g.appendChild(NX.charCard(ch, { still: true, sub: (NX.p.team.includes(ch.id) ? '⭐ Na equipe • ' : '') + ch.power.name, onClick: () => { const t = NX.p.team.slice(); const i = t.indexOf(ch.id); if (i >= 0) t.splice(i, 1); else if (t.length < 3) t.push(ch.id); else { NX.toast('A equipe tem até 3.', ''); return; } E.setTeam(t); NX.refresh(); m.close(); teamQuick(); } })));
    if (!g.children.length) g.appendChild(U.el('p', { class: 'empty' }, 'Você ainda não tem Nexóticos.'));
    m.body.appendChild(g);
    m.setActions([btn('📚 Coleção', '', () => { m.close(); NX.collection(); }), btn('Pronto', 'pri', () => m.close())]);
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    try { await GG.modules.load(NX.root); } catch (e) { GG.errlog.add('nexus', e.message); }
    GG.testMode.banner(NX.root);
    let sync = { points: 0, coins: 0, migrated: [], collectibles: [], minigames: [] };
    try { sync = GG.bridge.sync(); } catch (e) { GG.errlog.add('sync', e.message); }
    NX.reload(); NX.applySettings();
    if (!NX.p.team.length) { const own = E.ownedChars(NX.p); if (own.length && !NX.test()) { E.setTeam([own[0].id]); NX.reload(); } }
    UI.portraits.miojo = () => (GG.catalog.get('ciencias_microbio_miojo') || {}).assetUrl || '';
    UI.names.miojo = 'Micróbio Miojo';
    $('nxLoading').remove();
    $('nxHud').classList.remove('hide');
    NX.hub.init(); NX.refresh(); renderDock();
    const oldRefresh = NX.refresh; NX.refresh = function () { oldRefresh(); renderDock(); };
    $('nxBack').addEventListener('click', () => NX.showHub());
    $('nxMapBtn').addEventListener('click', quickMap);
    $('nxTeamBtn').addEventListener('click', teamQuick);
    $('nxSetBtn').addEventListener('click', () => NX.settings());
    $('nxExitBtn').addEventListener('click', () => { location.href = NX.root + 'inicio.html'; });
    window.addEventListener('keydown', (ev) => {
      if (UI.blocking() || !$('nxGame').classList.contains('hide') || /INPUT|TEXTAREA|SELECT/.test((ev.target && ev.target.tagName) || '')) return;
      if (ev.code === 'KeyM') { ev.preventDefault(); quickMap(); }
      else if (ev.code === 'KeyT') { ev.preventDefault(); teamQuick(); }
      else if (/^Digit[1-9]$/.test(ev.code)) { ev.preventDefault(); go(DOCK[+ev.code.slice(5) - 1][0]); }
      else if (ev.code === 'Escape' && $('nxHub').classList.contains('hide')) { ev.preventDefault(); NX.showHub(); }
    });
    // tempo aproximado de uso (só local, só com a aba visível)
    let warned = false, sessionSec = 0;
    setInterval(() => {
      if (document.hidden) return; sessionSec += 30;
      GG.profile.update((p) => { p.time.nexusSec += 30; });
      if (!warned && sessionSec >= GG.FR.suggestedMinutes * 60) { warned = true; NX.toast('⏸ Que tal uma pausa? Beba água, alongue-se. O Nexus fica salvo esperando você.', '', 5000); }
    }, 30000);
    GG.profile.update((p) => { p.time.sessions++; });
    const res = NX.processInbox();
    NX.reload();
    const hash = location.hash.slice(1);
    if (!NX.test() && !NX.p.seen.welcome) {
      NX.showHub();
      await NX.story();
      await migrationSummary(sync);
      if (!NX.p.seen.welcomeGift) await giftChoice();
      GG.profile.update((p) => { p.seen.welcome = new Date().toISOString(); });
      NX.refresh();
      const auto = GG.bridge.sync().collectibles.concat(sync.collectibles).filter((id, i, a) => a.indexOf(id) === i && id !== NX.p.seen.welcomeGift);
      NX.reload(); await newCharsModal(auto);
    } else {
      if (res) NX.open('fliperama', { result: res });
      else if (hash && NX.areas[hash]) NX.open(hash);
      else NX.showHub();
      if (sync.coins > 0 && !NX.test()) NX.toast('🌀 Seus estudos trouxeram +' + U.fmtInt(sync.points) + ' pontos e +' + sync.coins + ' Moedas Nexus!', 'gold', 4200);
      if (sync.minigames.length && !NX.test()) setTimeout(() => NX.toast('🕹️ Novo no Fliperama: ' + sync.minigames.map((id) => (GG.unlocks.get(id) || {}).title).filter(Boolean).join(', '), 'ok', 4200), 1200);
      if (!NX.test()) await newCharsModal(sync.collectibles);
    }
    NX.refresh();
  }
  window.addEventListener('DOMContentLoaded', boot);
})();
