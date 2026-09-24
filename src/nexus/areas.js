/* =====================================================================
   src/nexus/areas.js — ÁREAS DO GABRIEL NEXUS.
   portal (janela de cada mundo), Coração do Nexus, Parque dos
   Nexóticos, Galeria das Conquistas, Oficina de Personalização, Casa do
   Gabriel (base decorável), Loja Nexus e Terminal dos Pais.
   (O Fliperama Multimundos fica em arcade.js.)
   Nenhuma área mostra questões ou respostas escolares.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, E = GG.nexusEco;
  const A = NX.areas;
  const btn = UI.btn;
  const coinTxt = (n) => U.el('span', { class: 'price' }, [NX.coin(), ' ' + U.fmtInt(n)]);

  /* ================================================================ PORTAIS DOS MUNDOS */
  A.portal = {
    show(world) {
      if (!world) {
        const m = UI.modal({ title: '✨ Mundos futuros', cls: 'small' });
        m.body.appendChild(U.el('p', { class: 'story' }, 'Este portal ainda está dormindo. Cada nova matéria que chegar vai acender um portal aqui na Praça, com um mundo novo e novos Nexóticos.'));
        m.setActions([btn('Legal!', 'pri', () => m.close())]);
        return;
      }
      const mod = GG.modules.get(world); const F = mod && mod.franchise;
      const sum = NX.p.moduleSummaries[world] || {};
      const chars = GG.catalog.byWorld(world);
      const owned = chars.filter((c) => NX.has(c.id)).length;
      const m = UI.modal({ title: (F ? F.icon : '✨') + ' ' + (F ? F.world || F.title : world), wide: true });
      const next = chars.filter((c) => !NX.has(c.id)).map((c) => ({ c, a: GG.unlocks.charInfo(NX.p, c).autos.find((x) => !x.ok && x.need) })).filter((x) => x.a).sort((a, b) => (a.a.need - a.a.have) - (b.a.need - b.a.have)).slice(0, 3);
      m.body.appendChild(U.el('div', { class: 'portal-card' }, [
        U.el('div', { class: 'portal-ic', style: { '--pc': (F && F.color) || '#888' } }, (F && F.icon) || '✨'),
        U.el('div', { class: 'stack' }, [
          U.el('b', { style: { fontSize: '1.2em' } }, F ? F.title : world),
          F && F.comingSoon ? U.el('p', { class: 'story' }, 'Este mundo ainda está sendo construído. Quando o jogo de Matemática chegar, este portal vai abrir! O Gato Gráfico já está esperando por você.') : null,
          !F || F.comingSoon ? null : U.el('div', { class: 'bar', role: 'progressbar', 'aria-label': 'Concluído' }, U.el('i', { style: { width: (sum.percent || 0) + '%' } })),
          !F || F.comingSoon ? null : U.el('div', { class: 'row' }, [U.el('span', { class: 'chip' }, '📈 ' + (sum.percent || 0) + '% concluído'), sum.questionsTotal ? U.el('span', { class: 'chip' }, '📘 ' + (sum.questionsDone || 0) + '/' + sum.questionsTotal + ' questões') : null, sum.missionsTotal ? U.el('span', { class: 'chip' }, '🗺️ ' + (sum.missionsDone || 0) + '/' + sum.missionsTotal + ' missões') : null, sum.bossesTotal ? U.el('span', { class: 'chip' }, '👑 ' + (sum.bossesDone || 0) + '/' + sum.bossesTotal + ' chefes') : null]),
          U.el('span', { class: 'chip' }, '🧸 ' + owned + '/' + chars.length + ' Nexóticos deste mundo')
        ])
      ]));
      if (next.length) {
        m.body.appendChild(U.el('h3', null, '🎁 Próximas recompensas deste mundo'));
        m.body.appendChild(U.el('ul', null, next.map((x) => U.el('li', null, x.c.name + ' (' + GG.FR.rarityById(x.c.rarity).label + '): ' + x.a.label + ' — ' + Math.min(x.a.have, x.a.need) + '/' + x.a.need))));
      }
      const acts = [btn('Fechar', 'ghost', () => m.close())];
      if (F && !F.comingSoon) {
        const url = NX.test() ? F.testEntry({}) : F.entryRoute;
        acts.push(btn(NX.test() ? '🧪 Testar este mundo' : '🌀 Entrar no mundo', 'go', () => { NX.sfx('power', 'portal abrindo'); NX.burst(innerWidth / 2, innerHeight / 2, 'portal', 30); setTimeout(() => { location.href = NX.root + url; }, 350); }));
      }
      m.setActions(acts);
    }
  };

  /* ================================================================ CORAÇÃO DO NEXUS */
  A.coracao = {
    title: 'Coração do Nexus', icon: '💠', level: 1, bg: 'assets/cenarios/02_cenario_praca_dos_mundos.jpg', blur: true, key: '8',
    open(body) {
      const p = NX.p, lv = NX.level();
      const byMod = {}; p.scoreLedger.forEach((e) => { byMod[e.moduleId] = (byMod[e.moduleId] || 0) + e.points; });
      const unlocks = Object.keys(A).filter((k) => A[k].level > 1).map((k) => ({ k, t: A[k].title, lv: A[k].level }))
        .concat(GG.unlocks.minigames.filter((g) => g.level).map((g) => ({ k: g.minigameId, t: 'Jogo: ' + g.title, lv: g.level }))).sort((a, b) => a.lv - b.lv);
      body.appendChild(U.el('div', { class: 'wrapc' }, [
        NX.areaTitle('💠', 'Coração do Nexus', 'Toda vez que você estuda nas matérias, o Nexus ganha energia e cresce.'),
        U.el('div', { class: 'panel' }, [
          U.el('div', { class: 'grid', style: { '--min': '170px' } }, [
            U.el('div', { class: 'kpi' }, [U.el('b', null, 'Nível ' + lv.level), U.el('span', null, lv.name)]),
            U.el('div', { class: 'kpi' }, [U.el('b', null, U.fmtInt(p.careerPoints)), U.el('span', null, '⭐ Pontuação de Carreira (nunca diminui)')]),
            U.el('div', { class: 'kpi' }, [U.el('b', null, [NX.coin(), ' ' + U.fmtInt(p.nexusCoins)]), U.el('span', null, 'Moedas Nexus para gastar')]),
            U.el('div', { class: 'kpi' }, [U.el('b', null, lv.next == null ? 'Máximo!' : U.fmtInt(lv.next - p.careerPoints)), U.el('span', null, lv.next == null ? 'Nexus completo' : 'pontos para o Nível ' + (lv.level + 1))])
          ]),
          U.el('div', { class: 'bar', style: { marginTop: '12px', height: '16px' } }, U.el('i', { style: { width: lv.pct + '%', background: 'linear-gradient(90deg,#29e7ff,#8b5cf6)' } })),
          U.el('p', { class: 'tip' }, 'Como funciona: cada 10 pontos de estudo = 1 Moeda Nexus (o resto fica guardado para a próxima). Gastar moedas não diminui a Pontuação de Carreira. Jogar no Fliperama dá recordes e medalhas, mas não dá pontos de estudo.')
        ]),
        U.el('div', { class: 'panel' }, [U.el('h2', null, '⚡ Energia de cada mundo'), U.el('div', { class: 'grid', style: { '--min': '220px' } }, GG.modules.list().map((m) => { const F = m.franchise; return U.el('div', { class: 'kpi', style: { boxShadow: 'inset 0 0 0 2px ' + F.color } }, [U.el('b', null, F.icon + ' ' + U.fmtInt(byMod[F.moduleId] || 0)), U.el('span', null, F.title + (F.comingSoon ? ' — em breve' : ''))]); }))]),
        U.el('div', { class: 'panel' }, [U.el('h2', null, '🌱 O que desperta em cada nível'), U.el('ul', null, unlocks.map((u) => U.el('li', null, (lv.level >= u.lv || p.allContentUnlocked ? '✅ ' : '🔒 ') + 'Nível ' + u.lv + ': ' + u.t)))]),
        U.el('div', { class: 'panel' }, [U.el('h2', null, '📜 A história do Nexus'), U.el('p', { class: 'story' }, 'Depois das primeiras aventuras, ' + NX.name() + ' encontrou o Nexus: um pequeno mundo adormecido no centro de todos os mundos. Cada conhecimento conquistado nas matérias vira energia. Com energia, ilhas acordam, construções brilham e os Nexóticos — criaturas engraçadas e imprevisíveis — chegam para morar aqui.'), btn('▶ Ouvir a história de novo', '', () => NX.story(true))])
      ]));
    }
  };

  /* ================================================================ PARQUE DOS NEXÓTICOS */
  const LINES = {
    ciencias: ['Você sabia que eu tenho um laboratório no bolso?', 'Hoje eu observei uma formiga por 10 minutos!', 'Borbulhas! Borbulhas por toda parte!'],
    geografia: ['Já viajei por este parque inteiro três vezes!', 'Este caminho é um atalho, confia!', 'Olha, dá para ver as ilhas flutuantes daqui!'],
    matematica: ['Contei 37 flores. Não, 38!', 'Minhas barras estão todas para cima hoje!'],
    x: ['Oi, oi, oi!', 'Bora brincar?', 'Hehehe!', 'Que dia bonito no Nexus!']
  };
  const SCENES = [
    { a: 'ciencias_capivara_tubinho', b: 'geografia_capimapa', t: 'As duas capivaras apostam quem fica mais tempo relaxando. Empate: as duas dormiram!' },
    { a: 'ciencias_vulcao_gelatina', b: 'geografia_montanha_patins', t: 'O Vulcão Gelatina e a Montanha Patins disputam quem é o morro mais divertido. A plateia aplaude os dois!' },
    { a: 'ciencias_astro_axolote', b: 'geografia_atlas_alado', t: 'Astro Axolote e Atlas Alado fazem um voo em dupla pelas ilhas flutuantes.' },
    { a: 'ciencias_bacteria_batucada', b: 'geografia_tucano_transito', t: 'Bactéria Batucada toca o ritmo e o Tucano Trânsito sinaliza: verde para dançar!' },
    { a: 'ciencias_microbio_miojo', b: 'matematica_gato_grafico', t: 'O Micróbio Miojo conta os fios de macarrão e o Gato Gráfico faz um gráfico de barras. Deu 1.000!' },
    { a: 'geografia_globo_gorilao', b: 'geografia_rio_robozao', t: 'Globo Gorilão e Rio Robozão constroem um lago no parque. Splash!' }
  ];
  A.parque = {
    title: 'Parque dos Nexóticos', icon: '🌳', level: 1, bg: 'assets/cenarios/03_cenario_parque_nexoticos.jpg', music: 'parque', key: '2',
    open(body) {
      const p = NX.p;
      const park = U.el('div', { class: 'park' }); body.appendChild(park);
      body.style.padding = '0';
      const visible = (p.allContentUnlocked ? GG.catalog.list.map((c) => c.id) : p.parkVisible.filter((id) => NX.has(id))).slice(0, 12);
      const shown = visible.length ? visible : E.ownedChars(p).slice(0, 8).map((c) => c.id);
      const crit = [];
      shown.forEach((id, i) => {
        const ch = GG.catalog.get(id); if (!ch) return;
        const b = U.el('button', { type: 'button', class: 'critter', 'aria-label': ch.name + ' (' + GG.FR.rarityById(ch.rarity).label + ')' }, [GG.catalog.img(ch, 'idle-' + ch.idle)]);
        b.style.left = (12 + (i * 71) % 76) + '%'; b.style.top = (58 + (i * 37) % 32) + '%';
        b.addEventListener('click', () => { say(b, ch, U.pick(LINES[ch.world] || LINES.x)); const im = b.querySelector('img'); im.className = 'cel-' + ch.celebrate; NX.jingle(ch); setTimeout(() => { im.className = 'idle-' + ch.idle; NX.ficha(ch); }, 900); });
        park.appendChild(b); crit.push({ b, ch });
      });
      function say(b, ch, t) { U.$$('.bubble', b).forEach((x) => x.remove()); const bb = U.el('span', { class: 'bubble' }, t); b.appendChild(bb); setTimeout(() => bb.remove(), 2600); }
      const wander = setInterval(() => {
        crit.forEach((c) => { if (Math.random() < 0.6) { c.b.style.left = (8 + Math.random() * 84) + '%'; c.b.style.top = (52 + Math.random() * 40) + '%'; c.b.style.zIndex = String(Math.round(parseFloat(c.b.style.top))); } });
        if (Math.random() < 0.35) { const c = U.pick(crit); if (c) say(c.b, c.ch, U.pick(LINES[c.ch.world] || LINES.x)); }
        const sc = SCENES.find((s) => shown.includes(s.a) && shown.includes(s.b) && !(NX.p.seen.dialogs || {})[s.a + '+' + s.b]);
        if (sc && Math.random() < 0.3) { GG.profile.update((pp) => { pp.seen.dialogs = pp.seen.dialogs || {}; pp.seen.dialogs[sc.a + '+' + sc.b] = new Date().toISOString(); }); NX.reload(); NX.toast('🎬 Cena desbloqueada: ' + sc.t, 'ok', 5200); }
      }, 3800);
      // painel inferior
      const ui = U.el('div', { class: 'park-ui' }); body.appendChild(ui);
      ui.appendChild(U.el('div', { class: 'panel', style: { maxWidth: '520px' } }, [
        U.el('b', null, '🌳 Parque dos Nexóticos'),
        U.el('p', { class: 'tip', style: { margin: '4px 0 8px' } }, shown.length ? 'Toque num Nexótico para ver a ficha dele. Eles passeiam, conversam e às vezes fazem cenas juntos!' : 'O parque está vazio. Conquiste Nexóticos estudando nas matérias, na Loja ou na Cápsula-surpresa!'),
        U.el('div', { class: 'row' }, [btn('👀 Quem aparece', '', choose), btn('🧭 Expedição', 'pri', expedition), btn('📚 Coleção', '', () => collection())])
      ]));
      function choose() {
        const m = UI.modal({ title: '👀 Quem aparece no parque', wide: true });
        const g = U.el('div', { class: 'grid', style: { '--min': '140px' } });
        E.ownedChars(NX.p).forEach((ch) => g.appendChild(NX.charCard(ch, { still: true, sub: NX.p.parkVisible.includes(ch.id) ? '✅ Aparece' : '⬜ Escondido', onClick: () => { E.toggleParkVisible(ch.id); NX.reload(); m.close(); choose(); } })));
        if (!g.children.length) g.appendChild(U.el('p', { class: 'empty' }, 'Você ainda não tem Nexóticos.'));
        m.body.appendChild(g);
        m.setActions([btn('Pronto', 'pri', () => { m.close(); NX.open('parque'); })]);
      }
      return { close() { clearInterval(wander); } };
    }
  };
  /** Expedição: mandar um Nexótico procurar materiais de decoração (sem espera longa). */
  function expedition() {
    NX.reload(); const p = NX.p, x = p.expedition;
    const m = UI.modal({ title: '🧭 Expedição de materiais', wide: true });
    if (x) {
      const ch = GG.catalog.get(x.charId); const left = Math.max(0, Math.ceil((x.end - Date.now()) / 1000));
      m.body.appendChild(U.el('p', null, (ch ? ch.name : 'Seu Nexótico') + (left ? ' está explorando as ilhas… volta em ' + left + ' s.' : ' voltou com cristais de decoração!')));
      m.setActions([btn('Fechar', 'ghost', () => m.close()), left ? null : btn('🎁 Receber', 'pri', () => { const r = E.claimExpedition(); if (r.ok) { NX.sfx('frag', 'cristais recebidos'); NX.toast('💎 +' + r.found + ' Cristais de Decoração!', 'ok'); NX.refresh(); } m.close(); })]);
      if (left) { const t = setInterval(() => { if (m.closed) { clearInterval(t); return; } if (Date.now() >= x.end) { clearInterval(t); m.close(); expedition(); } }, 1000); }
      return;
    }
    m.body.appendChild(U.el('p', null, 'Escolha um Nexótico para procurar 💎 Cristais de Decoração nas ilhas. Leva só ' + GG.FR.expedition.seconds + ' segundos. Os cristais servem na Oficina para criar decorações.'));
    const g = U.el('div', { class: 'grid', style: { '--min': '130px' } });
    E.ownedChars(p).forEach((ch) => g.appendChild(NX.charCard(ch, { still: true, onClick: () => { const r = E.startExpedition(ch.id); if (!r.ok) NX.toast(r.why || 'Não foi possível.', ''); else { NX.sfx('power', 'expedição começou'); NX.toast(ch.name + ' partiu em expedição!', 'ok'); } NX.refresh(); m.close(); } })));
    if (!g.children.length) g.appendChild(U.el('p', { class: 'empty' }, 'Você precisa de pelo menos um Nexótico.'));
    m.body.appendChild(g); m.setActions([btn('Fechar', 'ghost', () => m.close())]);
  }
  NX.expedition = expedition;

  /** Coleção completa: filtros por mundo, raridade e tema. */
  function collection(filter) {
    const m = UI.modal({ title: '📚 Coleção de Nexóticos', wide: true });
    const f = Object.assign({ world: 'todos', rarity: 'todas', owned: 'todos' }, filter || {});
    const tabs = (key, opts) => U.el('div', { class: 'tabs' }, opts.map(([v, t]) => U.el('button', { type: 'button', class: f[key] === v ? 'on' : '', onclick: () => { m.close(); collection(Object.assign({}, f, { [key]: v })); } }, t)));
    m.body.appendChild(tabs('world', [['todos', 'Todos os mundos']].concat(GG.catalog.worlds().map((w) => [w, NX.worldIcon(w) + ' ' + NX.worldName(w)]))));
    m.body.appendChild(tabs('rarity', [['todas', 'Todas as raridades']].concat(GG.FR.rarities.map((r) => [r.id, r.icon + ' ' + r.label]))));
    m.body.appendChild(tabs('owned', [['todos', 'Todos'], ['sim', 'Tenho'], ['nao', 'Faltam']]));
    const list = GG.catalog.sorted().filter((c) => (f.world === 'todos' || c.world === f.world) && (f.rarity === 'todas' || c.rarity === f.rarity) && (f.owned === 'todos' || (f.owned === 'sim') === NX.has(c.id)));
    const g = U.el('div', { class: 'grid', style: { '--min': '150px' } }); list.forEach((c) => g.appendChild(NX.charCard(c)));
    if (!list.length) g.appendChild(U.el('p', { class: 'empty' }, 'Nenhum Nexótico com esse filtro.'));
    m.body.appendChild(U.el('p', { class: 'tip' }, 'Você tem ' + GG.catalog.list.filter((c) => NX.has(c.id)).length + ' de ' + GG.catalog.list.length + ' Nexóticos.'));
    m.body.appendChild(g); m.setActions([btn('Fechar', 'pri', () => m.close())]);
  }
  NX.collection = collection;

  /* ================================================================ GALERIA DAS CONQUISTAS */
  A.galeria = {
    title: 'Galeria das Conquistas', icon: '🏆', level: 1, bg: 'assets/cenarios/01_keyart_gabriel_nexus.jpg', blur: true, key: '4',
    open(body) {
      const p = NX.p;
      const byMod = {}; p.scoreLedger.forEach((e) => { const o = (byMod[e.moduleId] = byMod[e.moduleId] || { points: 0, question: 0, mission: 0, boss: 0, achievement: 0 }); o.points += e.points; o[e.sourceType] = (o[e.sourceType] || 0) + 1; });
      const worlds = GG.modules.list();
      const colBy = (w) => GG.FR.rarities.map((r) => { const cs = GG.catalog.list.filter((c) => c.world === w && c.rarity === r.id); return cs.length ? U.el('span', { class: 'chip', style: { boxShadow: 'inset 0 0 0 2px ' + r.color } }, r.icon + ' ' + cs.filter((c) => NX.has(c.id)).length + '/' + cs.length) : null; });
      const scenes = Object.keys(p.seen.dialogs || {}).length;
      body.appendChild(U.el('div', { class: 'wrapc' }, [
        NX.areaTitle('🏆', 'Galeria das Conquistas', 'Tudo o que ' + NX.name() + ' já conquistou nos mundos da franquia.'),
        U.el('div', { class: 'panel' }, [U.el('div', { class: 'grid', style: { '--min': '170px' } }, [
          U.el('div', { class: 'kpi' }, [U.el('b', null, '⭐ ' + U.fmtInt(p.careerPoints)), U.el('span', null, 'Pontuação de Carreira')]),
          U.el('div', { class: 'kpi' }, [U.el('b', null, '🧸 ' + GG.catalog.list.filter((c) => NX.has(c.id)).length + '/' + GG.catalog.list.length), U.el('span', null, 'Nexóticos')]),
          U.el('div', { class: 'kpi' }, [U.el('b', null, '🏅 ' + GG.unlocks.arcadeMedals(p)), U.el('span', null, 'Medalhas de Fliperama')]),
          U.el('div', { class: 'kpi' }, [U.el('b', null, '🌍 ' + worlds.filter((m) => (p.moduleSummaries[m.franchise.moduleId] || {}).hasSave).length), U.el('span', null, 'Mundos visitados')]),
          U.el('div', { class: 'kpi' }, [U.el('b', null, '🎬 ' + scenes + '/' + SCENES.length), U.el('span', null, 'Cenas do parque')])
        ])]),
        U.el('div', { class: 'panel' }, [U.el('h2', null, '🌍 Mundos'), U.el('div', { class: 'grid', style: { '--min': '260px' } }, worlds.map((m) => {
          const F = m.franchise, s = p.moduleSummaries[F.moduleId] || {}, b = byMod[F.moduleId] || {};
          return U.el('div', { class: 'kpi', style: { boxShadow: 'inset 0 0 0 2px ' + F.color, gap: '6px' } }, [
            U.el('b', null, F.icon + ' ' + F.title), F.comingSoon ? U.el('span', null, 'Em breve') : U.el('span', null, (s.percent || 0) + '% concluído • ' + U.fmtInt(b.points || 0) + ' pontos'),
            F.comingSoon ? null : U.el('div', { class: 'row' }, [U.el('span', { class: 'chip' }, '🗺️ Missões ' + (s.missionsDone || 0) + '/' + (s.missionsTotal || 0)), U.el('span', { class: 'chip' }, '👑 Chefes ' + (s.bossesDone || 0) + '/' + (s.bossesTotal || 0)), s.worldDone ? U.el('span', { class: 'chip ok' }, '🏆 Mundo concluído') : null]),
            U.el('div', { class: 'row' }, colBy(F.moduleId))
          ]);
        }))]),
        U.el('div', { class: 'panel' }, [U.el('h2', null, '🎖️ Medalhas e troféus'), medals(p)]),
        U.el('div', { class: 'panel' }, [U.el('h2', null, '🧸 Coleção'), U.el('div', { class: 'row' }, [btn('📚 Ver a coleção completa', 'pri', () => collection())])])
      ]));
      function medals(pp) {
        const list = [];
        GG.modules.list().forEach((m) => { const s = pp.moduleSummaries[m.franchise.moduleId] || {}; if (s.bossesDone) list.push(m.franchise.icon + ' ' + s.bossesDone + ' chefe(s) vencido(s) em ' + m.franchise.title); if (s.worldDone) list.push('🏆 ' + m.franchise.title + ' concluído!'); });
        Object.keys(pp.arcade.cosmeticRewards || {}).forEach((id) => { const it = GG.nexusItem(id); if (it) list.push(it.icon + ' ' + it.name); });
        Object.keys(pp.arcade.medals || {}).forEach((g) => { const md = pp.arcade.medals[g]; const gm = GG.unlocks.get(g); list.push((md.ouro ? '🥇' : md.prata ? '🥈' : '🥉') + ' ' + (gm ? gm.title : g)); });
        return list.length ? U.el('ul', null, list.map((t) => U.el('li', null, t))) : U.el('p', { class: 'empty' }, 'Suas medalhas aparecem aqui. Vença chefes nas matérias e desafios no Fliperama!');
      }
    }
  };

  /* ================================================================ OFICINA DE PERSONALIZAÇÃO */
  const WEAR = ['hat', 'face', 'back', 'frame', 'title', 'trail', 'entry', 'victory', 'palette', 'music'];
  function avatarPreview(eq) {
    const box = U.el('div', { class: 'av-preview' });
    const back = eq.back && GG.nexusItem(eq.back); if (back) box.appendChild(U.el('span', { class: 'l-back' }, back.icon));
    box.appendChild(U.el('img', { class: 'gab', src: 'assets/gabriel.png', alt: 'Gabriel' }));
    const hat = eq.hat && GG.nexusItem(eq.hat); if (hat) box.appendChild(U.el('span', { class: 'l-hat' }, hat.icon));
    const face = eq.face && GG.nexusItem(eq.face); if (face) box.appendChild(U.el('span', { class: 'l-face' }, face.icon));
    return box;
  }
  NX.avatarPreview = avatarPreview;
  A.oficina = {
    title: 'Oficina', icon: '🎨', level: 2, bg: 'assets/cenarios/05_cenario_base_gabriel.jpg', blur: true, key: '5',
    open(body, tab) {
      tab = tab || 'avatar';
      const p = NX.p;
      const wrap = U.el('div', { class: 'wrapc' }); body.appendChild(wrap);
      wrap.appendChild(NX.areaTitle('🎨', 'Oficina de Personalização', 'Avatar, equipe de 3 Nexóticos, acessórios e decorações feitas com cristais.'));
      wrap.appendChild(U.el('div', { class: 'tabs' }, [['avatar', '🧢 Avatar e efeitos'], ['equipe', '⭐ Equipe'], ['acc', '🎀 Acessórios'], ['criar', '💎 Criar decorações']].map(([id, t]) => U.el('button', { type: 'button', class: tab === id ? 'on' : '', onclick: () => NX.open('oficina', id) }, t))));
      const panel = U.el('div', { class: 'panel' }); wrap.appendChild(panel);
      if (tab === 'avatar') {
        panel.appendChild(U.el('div', { class: 'row', style: { alignItems: 'flex-start' } }, [avatarPreview(p.equipped), U.el('div', { class: 'stack', style: { flex: '1 1 300px' } }, WEAR.map((slot) => {
          const items = GG.NEXUS_ITEMS.filter((i) => i.slot === slot && NX.owns(i.id)).concat(slot === 'title' ? GG.NEXUS_ARCADE_REWARDS.filter((r) => r.slot === 'title' && (p.arcade.cosmeticRewards || {})[r.id]) : []);
          const sel = U.el('select', { 'aria-label': GG.NEXUS_SLOTS[slot] }, [U.el('option', { value: '' }, '— nenhum —')].concat(items.map((i) => U.el('option', { value: i.id }, i.icon + ' ' + i.name))));
          sel.value = p.equipped[slot] || '';
          sel.addEventListener('change', () => { E.equip(slot, sel.value || null); NX.refresh(); if (slot === 'music') NX.music(); NX.sfx('check', 'item equipado'); NX.open('oficina', 'avatar'); });
          return U.el('div', { class: 'set-row' }, [U.el('label', null, GG.NEXUS_SLOTS[slot]), items.length ? sel : U.el('span', { class: 'tip' }, 'Nenhum ainda — veja na Loja')]);
        }))]));
        panel.appendChild(U.el('p', { class: 'tip' }, 'Quer provar antes de comprar? Na Loja, use “👀 Provar” em qualquer roupa ou efeito.'));
      } else if (tab === 'equipe') {
        panel.appendChild(U.el('p', null, 'Escolha até 3 Nexóticos. Os poderes de conforto da equipe funcionam no Nexus e nos jogos recreativos. O primeiro é o seu companheiro, que segue você na Praça.'));
        const team = U.el('div', { class: 'grid', style: { '--min': '160px' } });
        for (let i = 0; i < 3; i++) {
          const ch = GG.catalog.get(p.team[i]);
          team.appendChild(ch ? NX.charCard(ch, { sub: (i === 0 ? '🐾 Companheiro • ' : '') + ch.power.name, onClick: () => NX.ficha(ch) }) : U.el('div', { class: 'nxc', style: { cursor: 'default' } }, [U.el('div', { class: 'nxc-img' }, '➕'), U.el('b', null, 'Vaga livre')]));
        }
        panel.appendChild(team);
        panel.appendChild(U.el('h3', null, 'Poderes ativos'));
        const pw = GG.powers.team(p); panel.appendChild(pw.length ? U.el('ul', null, pw.map((c) => U.el('li', null, '✨ ' + c.power.name + ' (' + c.name + '): ' + c.power.description))) : U.el('p', { class: 'tip' }, 'Nenhum poder ativo.'));
        panel.appendChild(U.el('h3', null, 'Seus Nexóticos'));
        const g = U.el('div', { class: 'grid', style: { '--min': '140px' } });
        E.ownedChars(p).forEach((ch) => g.appendChild(NX.charCard(ch, { still: true, sub: ch.power.name, onClick: () => { const t = p.team.slice(); const i = t.indexOf(ch.id); if (i >= 0) t.splice(i, 1); else if (t.length < 3) t.push(ch.id); else { NX.toast('A equipe tem até 3. Toque num da equipe para tirar.', ''); return; } E.setTeam(t); NX.refresh(); NX.open('oficina', 'equipe'); } })));
        if (!g.children.length) g.appendChild(U.el('p', { class: 'empty' }, 'Você ainda não tem Nexóticos.'));
        panel.appendChild(g);
        if (p.team.length > 1) panel.appendChild(U.el('div', { class: 'row', style: { marginTop: '10px' } }, [U.el('span', null, 'Companheiro:')].concat(p.team.map((id) => btn((p.companion === id ? '🐾 ' : '') + GG.catalog.get(id).name, p.companion === id ? 'pri small' : 'small', () => { const t = [id].concat(p.team.filter((x) => x !== id)); E.setTeam(t); NX.refresh(); NX.open('oficina', 'equipe'); })))));
      } else if (tab === 'acc') {
        const accs = GG.NEXUS_ITEMS.filter((i) => i.slot === 'acc' && NX.owns(i.id));
        panel.appendChild(U.el('p', null, 'Acessórios aparecem no Nexótico na Praça e na ficha dele.'));
        if (!accs.length) panel.appendChild(U.el('p', { class: 'empty' }, 'Você ainda não tem acessórios. Veja na Loja!'));
        else E.ownedChars(p).forEach((ch) => {
          const sel = U.el('select', { 'aria-label': 'Acessório de ' + ch.name }, [U.el('option', { value: '' }, '— nenhum —')].concat(accs.map((a) => U.el('option', { value: a.id }, a.icon + ' ' + a.name))));
          sel.value = (p.charAcc || {})[ch.id] || '';
          sel.addEventListener('change', () => { E.setAccessory(ch.id, sel.value || null); NX.reload(); NX.sfx('check', 'acessório colocado'); });
          panel.appendChild(U.el('div', { class: 'set-row' }, [U.el('label', null, ch.name), sel]));
        });
      } else {
        panel.appendChild(U.el('p', null, ['Você tem ', U.el('b', null, '💎 ' + E.materials(p)), ' Cristais de Decoração. Eles vêm da coleta na Praça e das expedições do Parque (nunca das notas da escola).']));
        const g = U.el('div', { class: 'grid', style: { '--min': '200px' } });
        GG.NEXUS_CRAFT.forEach((c) => {
          const done = (p.crafted || {})[c.id];
          g.appendChild(U.el('div', { class: 'shop-item' + (done ? ' owned' : '') }, [U.el('span', { class: 'si-ic' }, c.icon), U.el('b', null, c.name), U.el('span', { class: 'tip' }, c.desc + (c.size === 'big' ? ' (grande)' : '')), U.el('span', { class: 'price' }, '💎 ' + c.cost),
            done ? U.el('span', { class: 'chip ok' }, 'Feito! Está na sua base') : btn('🔨 Criar', 'pri small', () => { const r = E.craft(c.id, NX.txn('craft')); if (r.ok) { NX.sfx('win', 'decoração criada'); NX.confetti(); NX.toast(c.name + ' criada e colocada na sua base!', 'ok'); } else NX.toast(r.why || 'Não deu.', ''); NX.refresh(); NX.open('oficina', 'criar'); })]));
        });
        panel.appendChild(g);
      }
    }
  };

  /* ================================================================ CASA DO GABRIEL (BASE) */
  A.base = {
    title: 'Casa do Gabriel', icon: '🏠', level: 1, bg: 'assets/cenarios/05_cenario_base_gabriel.jpg', music: 'base', key: '6',
    open(body) {
      body.style.padding = '0';
      const room = U.el('div', { class: 'base-room' }); body.appendChild(room);
      let sel = null;
      function draw() {
        NX.reload(); const p = NX.p; room.innerHTML = '';
        // troféus reais das matérias (somente leitura)
        const tro = [];
        GG.modules.list().forEach((m) => { const s = p.moduleSummaries[m.franchise.moduleId] || {}; if (s.worldDone) tro.push(['🏆', 'Troféu: ' + m.franchise.title]); else if (s.bossesDone) tro.push(['🥇', 'Chefes vencidos em ' + m.franchise.title]); });
        tro.forEach((t, i) => room.appendChild(U.el('span', { class: 'deco fixed', style: { left: (58 + i * 6) + '%', top: '38%', fontSize: '42px' }, title: t[1], 'aria-label': t[1] }, t[0])));
        // equipe passeando pela casa
        GG.powers.team(p).forEach((ch, i) => { const im = GG.catalog.img(ch, 'idle-' + ch.idle); im.style.cssText = 'position:absolute;width:clamp(60px,8vw,110px);left:' + (30 + i * 16) + '%;top:' + (70 + (i % 2) * 8) + '%;transform:translate(-50%,-100%);pointer-events:none;filter:drop-shadow(0 6px 4px rgba(0,0,0,.3))'; room.appendChild(im); });
        p.decorations.placed.forEach((d) => {
          const it = GG.nexusItem(d.item); if (!it) return;
          const big = it.size === 'big';
          const locked = big && !GG.powers.has(p, 'move_big_decor');
          const el = U.el('button', { type: 'button', class: 'deco' + (big ? ' big' : '') + (d.flip ? ' flip' : '') + (sel === d.uid ? ' sel' : '') + (locked ? ' fixed' : ''), style: { left: d.x + '%', top: d.y + '%', zIndex: String(d.y) }, 'aria-label': it.name + (locked ? ' (grande: precisa da Força Continental para mover)' : '') }, it.tint ? U.el('span', { class: 'poster', style: { '--tint': it.tint } }, it.icon) : it.icon);
          el.addEventListener('pointerdown', (ev) => startDrag(ev, d, el, locked));
          room.appendChild(el);
        });
        room.appendChild(ui());
      }
      function startDrag(ev, d, el, locked) {
        ev.preventDefault(); sel = d.uid; U.$$('.deco', room).forEach((x) => x.classList.remove('sel')); el.classList.add('sel'); showSel(d);
        if (locked) { NX.toast('🦍 Decorações grandes só se movem com a Força Continental (Globo Gorilão na equipe). Use um modelo pronto para reorganizar.', '', 3600); return; }
        const r = room.getBoundingClientRect();
        const mv = (e) => { el.style.left = ((e.clientX - r.left) / r.width * 100) + '%'; el.style.top = ((e.clientY - r.top + el.offsetHeight * 0.5) / r.height * 100) + '%'; };
        const up = (e) => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); const x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top + el.offsetHeight * 0.5) / r.height * 100; const res = E.moveDecor(d.uid, x, y); if (!res.ok && res.why) NX.toast(res.why, ''); NX.sfx('click', null); draw(); showSel(d); };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
      }
      let selBox = null;
      function showSel(d) {
        if (!selBox) return; selBox.innerHTML = '';
        const it = GG.nexusItem(d.item);
        selBox.appendChild(U.el('b', null, it.icon + ' ' + it.name));
        selBox.appendChild(btn('↔️ Virar', 'small', () => { E.flipDecor(d.uid); draw(); }));
        selBox.appendChild(btn('🗑️ Guardar', 'small ghost', () => { E.removeDecor(d.uid); sel = null; draw(); }));
      }
      function ui() {
        const p = NX.p;
        const box = U.el('div', { class: 'base-ui' });
        selBox = U.el('div', { class: 'row' }, U.el('span', { class: 'tip' }, 'Arraste as decorações para mudar de lugar. Tudo é salvo sozinho.'));
        box.appendChild(U.el('div', { class: 'panel', style: { maxWidth: '760px' } }, [
          U.el('div', { class: 'row' }, [U.el('b', null, '🏠 Casa de ' + NX.name()), btn('➕ Colocar decoração', 'pri small', add), btn('✨ Modelos prontos', 'small', templates), btn('🛒 Loja', 'small ghost', () => NX.open('loja', 'decor'))]),
          selBox
        ]));
        void p;
        return box;
      }
      function add() {
        const p = NX.p;
        const m = UI.modal({ title: '➕ Colocar decoração', wide: true });
        const owned = GG.NEXUS_ITEMS.filter((i) => i.slot === 'decor' && NX.owns(i.id)).concat(GG.NEXUS_CRAFT.filter((c) => (p.crafted || {})[c.id])).concat(GG.NEXUS_ARCADE_REWARDS.filter((r) => !r.slot && (p.arcade.cosmeticRewards || {})[r.id]));
        const g = U.el('div', { class: 'grid', style: { '--min': '150px' } });
        owned.forEach((it) => { const n = p.decorations.placed.filter((d) => d.item === it.id).length; g.appendChild(U.el('div', { class: 'shop-item' }, [U.el('span', { class: 'si-ic' }, it.icon), U.el('b', null, it.name), U.el('span', { class: 'tip' }, n ? 'Na casa: ' + n : 'Guardada'), btn('Colocar', 'small pri', () => { E.placeDecor(it.id); m.close(); draw(); NX.sfx('check', 'decoração colocada'); })])); });
        if (!owned.length) g.appendChild(U.el('p', { class: 'empty' }, 'Você ainda não tem decorações. Compre na Loja ou crie na Oficina!'));
        m.body.appendChild(g); m.setActions([btn('Fechar', 'ghost', () => m.close())]);
      }
      function templates() {
        const m = UI.modal({ title: '✨ Modelos prontos', cls: 'small' });
        m.body.appendChild(U.el('p', null, 'Os modelos arrumam sozinhos as decorações que você já tem. São grátis e podem ser trocados quando quiser.'));
        m.setActions(GG.NEXUS_ITEMS.filter((i) => i.slot === 'template').map((t) => btn(t.icon + ' ' + t.name.replace('Modelo ', ''), '', () => { E.applyTemplate(t.id); m.close(); draw(); NX.sfx('win', 'base arrumada'); })).concat([btn('Fechar', 'ghost', () => m.close())]));
      }
      draw();
    }
  };

  /* ================================================================ LOJA NEXUS */
  A.loja = {
    title: 'Loja Nexus', icon: '🛒', level: 1, bg: 'assets/cenarios/04_cenario_fliperama.jpg', blur: true, key: '7',
    open(body, tab) {
      tab = tab || 'nexoticos';
      const p = NX.p;
      const wrap = U.el('div', { class: 'wrapc' }); body.appendChild(wrap);
      wrap.appendChild(NX.areaTitle('🛒', 'Loja Nexus', 'Só Moedas Nexus. Nada aqui usa dinheiro de verdade.'));
      wrap.appendChild(U.el('div', { class: 'panel', style: { padding: '10px 14px' } }, U.el('div', { class: 'row' }, [U.el('b', null, 'Seu saldo: '), coinTxt(p.nexusCoins), U.el('span', { class: 'chip' }, '🧩 ' + p.fragments + ' fragmentos'), U.el('span', { class: 'tip', style: { marginLeft: 'auto' } }, 'Comprar não diminui sua Pontuação de Carreira.')])));
      const TABS = [['nexoticos', '🧸 Nexóticos'], ['capsula', '🎁 Cápsula'], ['fragmentos', '🧩 Fragmentos'], ['roupas', '🧢 Roupas'], ['efeitos', '✨ Efeitos'], ['decor', '🛋️ Decoração'], ['extras', '🎵 Extras']];
      wrap.appendChild(U.el('div', { class: 'tabs', style: { marginTop: '12px' } }, TABS.map(([id, t]) => U.el('button', { type: 'button', class: tab === id ? 'on' : '', onclick: () => NX.open('loja', id) }, t))));
      const panel = U.el('div', { class: 'panel' }); wrap.appendChild(panel);
      const reopen = () => { NX.refresh(); NX.open('loja', tab); };
      if (tab === 'nexoticos') {
        panel.appendChild(U.el('p', { class: 'tip' }, 'Estes Nexóticos podem ser comprados direto. Todos também podem ser conquistados estudando nas matérias.'));
        const g = U.el('div', { class: 'grid', style: { '--min': '170px' } });
        GG.catalog.sorted().forEach((ch) => {
          const inf = GG.unlocks.charInfo(p, ch);
          if (inf.price == null) return;
          const owned = NX.has(ch.id);
          const card = NX.charCard(ch, { still: true, showName: true, sub: owned ? '✅ Você tem' : 'Preço: ' + inf.price + ' moedas' });
          const wrapc = U.el('div', { class: 'stack' }, [card, owned ? null : btn('Comprar', 'pri small', () => buyChar(ch, inf.price))]);
          g.appendChild(wrapc);
        });
        panel.appendChild(g);
      } else if (tab === 'capsula') {
        const C = GG.FR.capsule; const pool = E.capsulePool();
        panel.appendChild(U.el('div', { class: 'capsule-box' }, [U.el('div', { class: 'capsule', id: 'capsule' }, '🎁'), U.el('div', { class: 'stack' }, [
          U.el('h2', { style: { margin: 0 } }, 'Cápsula-surpresa'),
          U.el('p', null, ['Custa ', coinTxt(C.price), '. Regras (sempre visíveis):']),
          U.el('ul', null, [
            U.el('li', null, 'Pode sair um Nexótico Comum, Raro ou Épico (Comuns saem mais; Épicos, menos) ou um pacote de ' + C.fragmentsOnly + ' fragmentos.'),
            U.el('li', null, 'Míticos e Lendários nunca saem na cápsula: eles são conquistados, comprados ou trocados.'),
            U.el('li', null, 'Repetido vira fragmentos automaticamente.'),
            U.el('li', null, 'Proteção: a cada ' + C.pity + ' cápsulas sem novidade, a próxima garante um Nexótico novo.'),
            U.el('li', null, 'Não há contagem regressiva nem oferta que acaba. Tudo também pode ser conseguido por caminhos garantidos.')
          ]),
          U.el('p', { class: 'tip' }, 'Progresso da proteção: ' + p.capsule.misses + '/' + (C.pity - 1) + ' • Nexóticos que podem sair: ' + pool.filter((c) => !NX.has(c.id)).length + ' novos de ' + pool.length),
          btn('🎁 Abrir cápsula', 'pri', () => capsule())
        ])]));
      } else if (tab === 'fragmentos') {
        panel.appendChild(U.el('p', null, 'Troque fragmentos por Nexóticos (menos Lendários). Fragmentos vêm de repetidos na cápsula e do pacote de fragmentos.'));
        const g = U.el('div', { class: 'grid', style: { '--min': '170px' } });
        GG.catalog.sorted().forEach((ch) => {
          const inf = GG.unlocks.charInfo(p, ch); if (inf.fragmentCost == null || NX.has(ch.id)) return;
          g.appendChild(U.el('div', { class: 'stack' }, [NX.charCard(ch, { still: true, showName: true, sub: '🧩 ' + inf.fragmentCost + ' fragmentos' }), btn('Trocar', 'small' + (p.fragments >= inf.fragmentCost ? ' pri' : ''), () => { const r = E.exchangeFragments(ch.id, NX.txn('frag')); if (r.ok) { celebrate(ch); } else NX.toast(r.why || 'Não deu.', ''); reopen(); })]));
        });
        if (!g.children.length) g.appendChild(U.el('p', { class: 'empty' }, 'Você já tem todos os Nexóticos trocáveis!'));
        panel.appendChild(g);
        const pk = GG.NEXUS_ITEMS.find((i) => i.slot === 'fragments');
        panel.appendChild(U.el('div', { class: 'row', style: { marginTop: '12px' } }, [U.el('span', null, pk.icon + ' ' + pk.name + ' — '), coinTxt(pk.price), btn('Comprar', 'small', () => buyItem(pk))]));
      } else {
        const slots = { roupas: ['hat', 'face', 'back', 'frame', 'title'], efeitos: ['trail', 'entry', 'victory', 'palette'], decor: ['decor'], extras: ['music', 'acc'] }[tab];
        const g = U.el('div', { class: 'grid', style: { '--min': '190px' } });
        GG.NEXUS_ITEMS.filter((i) => slots.includes(i.slot)).forEach((it) => {
          const owned = NX.owns(it.id);
          g.appendChild(U.el('div', { class: 'shop-item' + (owned ? ' owned' : '') }, [
            U.el('span', { class: 'si-ic' }, it.icon), U.el('b', null, it.name), U.el('span', { class: 'chip' }, GG.NEXUS_SLOTS[it.slot] + (it.size === 'big' ? ' • grande' : '')), U.el('span', { class: 'tip' }, it.desc), coinTxt(it.price),
            U.el('div', { class: 'row' }, [btn('👀 Provar', 'small ghost', () => tryOn(it)), owned ? U.el('span', { class: 'chip ok' }, 'Você tem') : btn('Comprar', 'small pri', () => buyItem(it))])
          ]));
        });
        panel.appendChild(g);
      }
      async function confirmBig(price, what) {
        if (price < 100) return true;
        return UI.confirm('Comprar **' + what + '** por **' + price + ' Moedas Nexus**? Seu saldo ficará em ' + (NX.p.nexusCoins - price) + '.', 'Comprar', 'Agora não');
      }
      async function buyItem(it) {
        if (NX.p.nexusCoins < it.price) { NX.toast('Faltam ' + (it.price - NX.p.nexusCoins) + ' Moedas Nexus. Estudar nas matérias rende moedas!', '', 3200); return; }
        if (!(await confirmBig(it.price, it.name))) return;
        const r = E.buyItem(it.id, NX.txn('loja'));
        if (r.ok) { NX.sfx('coin', 'compra feita'); NX.toast(it.icon + ' ' + it.name + ' é seu!' + (it.slot === 'decor' ? ' Já está na sua casa.' : ''), 'ok'); if (['hat', 'face', 'back', 'frame', 'title', 'trail', 'entry', 'victory', 'palette', 'music'].includes(it.slot)) E.equip(it.slot, it.id); }
        else NX.toast(r.why || 'Não deu para comprar.', '');
        reopen();
      }
      async function buyChar(ch, price) {
        if (NX.p.nexusCoins < price) { NX.toast('Faltam ' + (price - NX.p.nexusCoins) + ' Moedas Nexus.', '', 3000); return; }
        if (!(await confirmBig(price, ch.name))) return;
        const r = E.buyChar(ch.id, NX.txn('nexotico'));
        if (r.ok) celebrate(ch); else NX.toast(r.why || 'Não deu.', '');
        reopen();
      }
      function tryOn(it) {
        const m = UI.modal({ title: '👀 Provando: ' + it.name, cls: 'small' });
        if (['hat', 'face', 'back'].includes(it.slot)) m.body.appendChild(avatarPreview(Object.assign({}, NX.p.equipped, { [it.slot]: it.id })));
        else if (it.slot === 'decor') { const box = U.el('div', { style: { position: 'relative', height: '220px', borderRadius: '14px', overflow: 'hidden' } }, [U.el('img', { src: 'assets/cenarios/05_cenario_base_gabriel.jpg', alt: '', style: { width: '100%', height: '100%', objectFit: 'cover' } }), U.el('span', { class: 'deco' + (it.size === 'big' ? ' big' : ''), style: { left: '50%', top: '85%', position: 'absolute' } }, it.icon)]); m.body.appendChild(box); }
        else if (it.slot === 'music') { GG.audio.music(it.song); m.body.appendChild(U.el('p', null, '🎵 Tocando uma amostra da trilha…')); }
        else if (['trail', 'entry', 'victory'].includes(it.slot)) { NX.burst(innerWidth / 2, innerHeight / 2, it.fx === 'fogos' || it.fx === 'confete' ? null : it.fx, 50); m.body.appendChild(U.el('p', null, 'Veja o efeito na tela!')); }
        else if (it.slot === 'palette') m.body.appendChild(U.el('img', { src: 'assets/cenarios/02_cenario_praca_dos_mundos.jpg', alt: 'Praça com a paleta', style: { width: '100%', borderRadius: '14px', filter: it.filter } }));
        else if (it.slot === 'frame') m.body.appendChild(U.el('div', { class: 'nx-avatar' + (it.color === 'rainbow' ? ' rainbow' : ''), style: { width: '120px', height: '120px', margin: '10px auto', backgroundImage: 'url("assets/gabriel.png")', '--fc': it.color } }));
        else m.body.appendChild(U.el('p', { class: 'story' }, it.icon + ' ' + it.desc));
        m.setActions([btn('Fechar', 'ghost', () => { m.close(); if (it.slot === 'music') NX.music('nexus'); })]);
      }
      async function capsule() {
        if (NX.p.nexusCoins < GG.FR.capsule.price) { NX.toast('Faltam ' + (GG.FR.capsule.price - NX.p.nexusCoins) + ' Moedas Nexus.', '', 3000); return; }
        const cap = document.getElementById('capsule'); if (cap) { cap.classList.add('shake'); NX.sfx('shield', 'cápsula balançando'); }
        await U.wait(NX.p.settings.reduceMotion ? 100 : 1500);
        const r = E.capsule(NX.txn('capsula'));
        if (!r.ok) { NX.toast(r.why || 'Não deu.', ''); reopen(); return; }
        const ch = r.charId && GG.catalog.get(r.charId);
        const m = UI.modal({ title: r.isNew ? '🎉 Novo Nexótico!' : r.duplicate ? '🔁 Repetido → fragmentos' : '🧩 Fragmentos!', cls: 'small', onClose: reopen });
        m.body.appendChild(U.el('div', { class: 'reveal' }, [ch ? GG.catalog.img(ch, r.isNew ? 'cel-' + ch.celebrate : '') : U.el('div', { style: { fontSize: '90px' } }, '🧩'), ch ? U.el('h2', null, ch.name) : null, ch ? NX.rar(ch.rarity) : null,
          U.el('p', null, r.isNew ? (r.guaranteed ? 'A proteção garantiu um Nexótico novo!' : 'Ele já está no seu Parque.') : '+' + r.fragments + ' fragmentos.')]));
        if (ch && r.isNew) { NX.jingle(ch); NX.victoryFx(); GG.profile.update((pp) => { if (!pp.parkVisible.includes(ch.id)) pp.parkVisible.push(ch.id); }); }
        else NX.sfx('frag');
        m.setActions([btn('Ver ficha', '', () => { if (ch) NX.ficha(ch); }), btn('Legal!', 'pri', () => m.close())]);
      }
      function celebrate(ch) {
        GG.profile.update((pp) => { if (!pp.parkVisible.includes(ch.id)) pp.parkVisible.push(ch.id); });
        NX.jingle(ch); NX.victoryFx(); NX.toast('🎉 ' + ch.name + ' entrou para a sua coleção!', 'ok', 3200);
      }
    }
  };

  /* ================================================================ TERMINAL DOS PAIS */
  A.terminal = {
    title: 'Terminal dos Pais', icon: '👪', level: 1, bg: 'assets/cenarios/01_keyart_gabriel_nexus.jpg', blur: true, key: '9',
    open(body) {
      body.appendChild(U.el('div', { class: 'wrapc' }, [
        NX.areaTitle('👪', 'Terminal dos Pais', 'Área protegida por senha para os responsáveis.'),
        U.el('div', { class: 'panel' }, [
          U.el('p', null, 'Aqui os responsáveis acompanham o progresso, veem os dados salvos neste computador e testam todo o conteúdo em um modo separado, que não mexe no progresso da criança.'),
          U.el('div', { class: 'row' }, [btn('🔐 Entrar na Área dos Pais', 'pri', () => { location.href = NX.root + 'src/pais/pais.html'; }), btn('⚙️ Configurações', '', () => NX.settings())])
        ])
      ]));
    }
  };
})();
