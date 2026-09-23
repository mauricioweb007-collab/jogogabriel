/* =====================================================================
   content/visuais.js — mapas, plantas, tabelas, gráficos e ilustrações
   do módulo de Geografia, recriados com design próprio (SVG/canvas).
   Números exatamente como no material. Todos os gráficos têm rótulos
   escritos e padrões, não dependem só de cor. Nenhuma imagem externa
   de obra protegida é usada: a cena "inspirada em Carybé" é um desenho
   original do jogo.
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, P = GG.pixel, MP = GG.maps;
  const V = (GEO.visuals = {});

  function card(title, body, cap) {
    return U.el('div', { class: 'vis' }, [title ? U.el('h4', null, title) : null].concat(Array.isArray(body) ? body : [body]).concat(cap ? [U.el('div', { class: 'cap' }, cap)] : []));
  }
  /** Cena em canvas (pixel art ampliada pelo CSS). */
  function scene(w, h, draw, alt) {
    const c = P.mk(w, h, (x) => draw(x, w, h));
    c.className = 'pic'; c.setAttribute('role', 'img'); c.setAttribute('aria-label', alt || '');
    return c;
  }
  const spr = (x, sheet, idx, dx, dy, k) => { const im = GG.engine.img[sheet]; if (!im) return; const S = { plat: [18, 20], town: [16, 12], urban: [16, 27], dungeon: [16, 12], food: [18, 10], farm: [18, 10], shmup: [16, 12] }[sheet]; const s = S[0]; x.drawImage(im, (idx % S[1]) * s, Math.floor(idx / S[1]) * s, s, s, dx, dy, s * (k || 1), s * (k || 1)); };
  const txt = (x, t, px, py, size, color, align, font) => { x.font = (size || 8) + 'px ' + (font || "'Press Start 2P', monospace"); x.textAlign = align || 'left'; x.textBaseline = 'top'; x.fillStyle = 'rgba(0,0,0,.4)'; x.fillText(t, px + 1, py + 1); x.fillStyle = color || '#fff'; x.fillText(t, px, py); };

  /* ------------------------------------------------ Festival da Diversidade (cartaz) */
  V.cartaz = function () {
    const people = P.crowd();
    return card('Cartaz: Festival da Diversidade Cultural', scene(240, 150, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffcf6b'); g.addColorStop(1, '#ff7a59'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 12; i++) { x.fillStyle = ['#e5484d', '#3ec1ff', '#2ecc71', '#f1c40f', '#9b59b6'][i % 5]; x.beginPath(); x.moveTo(i * 20, 6); x.lineTo(i * 20 + 10, 18); x.lineTo(i * 20 + 20, 6); x.fill(); }
      x.fillStyle = '#2a1f4a'; x.fillRect(0, 118, w, 32);
      txt(x, 'FESTIVAL DA', w / 2, 24, 9, '#2a1f4a', 'center'); txt(x, 'DIVERSIDADE CULTURAL', w / 2, 36, 9, '#2a1f4a', 'center');
      people.slice(0, 14).forEach((p, i) => { const col = i % 7, row = Math.floor(i / 7); x.drawImage(P.front(Object.assign({}, p, { frame: i % 2 })), 12 + col * 32 + row * 14, 62 + row * 30, 14 * 1.4, 20 * 1.4); });
      x.fillStyle = '#8b5a2b'; x.fillRect(200, 100, 14, 16); x.fillStyle = '#f3d78a'; x.fillRect(200, 98, 14, 4);
      txt(x, '♪', 20, 52, 10, '#2a1f4a'); txt(x, '♫', 214, 56, 10, '#2a1f4a');
      txt(x, 'música • dança • arte • culinária', w / 2, 132, 6, '#fff', 'center');
    }, 'Cartaz com pessoas de diferentes tons de pele, cabelos e roupas, dançando e tocando juntas'), 'Pessoas com aparências, tons de pele, cabelos e roupas diferentes, com música e dança, no mesmo festival (desenho do jogo).');
  };
  /* ------------------------------------------------ Sala de aula */
  V.sala = function () {
    const people = P.crowd();
    return card('Uma sala de aula', scene(240, 130, (x, w, h) => {
      x.fillStyle = '#e8dcc0'; x.fillRect(0, 0, w, h); x.fillStyle = '#2f5d46'; x.fillRect(20, 8, 200, 34); x.fillStyle = '#c9a24d'; x.fillRect(18, 42, 204, 3);
      txt(x, 'Nossa turma', w / 2, 20, 8, '#fff', 'center');
      for (let i = 0; i < 10; i++) { const cx = 16 + (i % 5) * 46, cy = 58 + Math.floor(i / 5) * 36; x.drawImage(P.front(Object.assign({}, people[(i * 3 + 1) % 18], { frame: 0 })), cx + 8, cy - 4, 20, 28); x.fillStyle = '#8b5a2b'; x.fillRect(cx, cy + 18, 36, 8); }
    }, 'Crianças diferentes numa sala de aula'), 'Colegas com aparências, origens, gostos e jeitos de falar diferentes estudam juntos.');
  };
  /* ------------------------------------------------ Resumo do texto do ISA */
  V.isa = function () {
    const items = [['🪶', 'Povos indígenas'], ['🌍', 'Descendentes de africanos'], ['🧳', 'Imigrantes europeus e asiáticos'], ['🕌', 'Árabes e judeus'], ['🛶', 'Caiçaras, caboclos e ribeirinhos'], ['🌾', 'Camponeses, extrativistas, pequenos fazendeiros e colonos'], ['🏙️', 'Populações rurais e urbanas']];
    return card('Texto do Instituto Socioambiental (resumo)', U.el('ul', { style: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '6px', fontSize: '1.05em', fontWeight: 800 } }, items.map((i) => U.el('li', null, i[0] + ' ' + i[1]))), 'Resumo feito a partir do material da prova.');
  };
  /* ------------------------------------------------ Povos indígenas diversos */
  V.povos = function () {
    const acts = [['Coleta de frutos', 7, '#2e7d32'], ['Caça', 29, '#6d4c41'], ['Pesca', 33, '#1565c0'], ['Pequenos roçados', 17, '#827717']];
    return card('Muitos povos, muitos jeitos de viver', scene(240, 120, (x, w, h) => {
      x.fillStyle = '#cfe8b8'; x.fillRect(0, 0, w, h);
      acts.forEach((a, i) => {
        const bx = 6 + i * 59; x.fillStyle = a[2]; x.fillRect(bx, 6, 54, 108); x.fillStyle = '#fff8e6'; x.fillRect(bx + 3, 9, 48, 102);
        txt(x, 'Povo ' + (i + 1), bx + 27, 13, 6, '#2a2233', 'center');
        x.drawImage(P.front({ skin: P.SKINS[(i + 2) % 6], hair: '#1b1b1b', hairStyle: ['liso', 'curto', 'longo', 'coque'][i], shirt: ['#c0392b', '#f39c12', '#16a085', '#8e44ad'][i], pants: '#6d4c41' }), bx + 16, 26, 21, 30);
        spr(x, 'town', [5, 4, 16, 28][i], bx + 18, 62, 1.1);
        txt(x, 'nome, língua', bx + 27, 84, 5, '#2a2233', 'center'); txt(x, 'e costumes', bx + 27, 92, 5, '#2a2233', 'center'); txt(x, 'próprios', bx + 27, 100, 5, '#2a2233', 'center');
      });
    }, 'Quatro cartões de povos diferentes, cada um com nome, língua e costumes próprios'), 'Atividades comuns: coleta de frutos, caça, pesca e pequenos roçados. Cada povo tem nome, língua e costumes próprios.');
  };
  /* ------------------------------------------------ Mapa histórico indígena */
  V.mapaIndigena = function () {
    const m = MP.brasil({
      labels: 'none', title: 'Mapa histórico simplificado dos povos indígenas',
      fill: (s) => (s.id === 'sp' ? '#f6b04a' : '#b9d99a'),
      patterns: { norte: 'dots', nordeste: 'dots', centro: 'dots', sul: 'dots' },
      extra: (svg) => {
        const sp = MP.state('sp');
        svg.appendChild(MP.sv('path', { d: sp.d, fill: 'none', stroke: '#b3261e', 'stroke-width': 4 }));
        MP.label(svg, sp.cx - 10, sp.cy + 4, 'Tupi-Guarani', 22, '#7a2e00');
        MP.label(svg, sp.cx + 70, sp.cy + 60, '(atual São Paulo)', 16, '#b3261e');
        MP.label(svg, 250, 170, 'Outros povos indígenas', 20, '#23512a');
        MP.label(svg, 470, 230, 'Outros povos indígenas', 20, '#23512a');
        MP.label(svg, 300, 330, 'Outros povos indígenas', 20, '#23512a');
      }
    });
    const leg = U.el('div', { class: 'legend' }, [U.el('span', { style: { '--c': '#f6b04a' } }, 'Tupi-Guarani'), U.el('span', { style: { '--c': '#b9d99a', '--p': 'radial-gradient(#0006 30%, transparent 32%)' } }, 'Outros povos indígenas (vários nomes, línguas e costumes)'), U.el('span', { style: { '--c': '#fff' } }, 'Contorno vermelho: atual estado de São Paulo')]);
    return card('Mapa histórico (simplificado)', [m.el, leg], 'Desenho do jogo inspirado no mapa histórico do livro: antes da colonização, o território era ocupado por muitos povos indígenas.');
  };
  /* ------------------------------------------------ Palavras de origem indígena */
  V.palavras = function () {
    const w = [['🍍', 'abacaxi'], ['🌿', 'mandioca'], ['🍿', 'pipoca'], ['🐾', 'capivara'], ['🐊', 'jacaré'], ['🐾', 'tatu']];
    return card('Cartões de palavras da Gaia', U.el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px,1fr))', gap: '8px' } }, w.map((i) => U.el('div', { style: { background: '#fff3d1', border: '3px solid #2a2233', borderRadius: '10px', padding: '10px', textAlign: 'center', fontWeight: 900, fontSize: '1.15em' } }, [U.el('div', { style: { fontSize: '1.8em' } }, i[0]), i[1]]))), 'Palavras de origem indígena usadas no dia a dia.');
  };
  /* ------------------------------------------------ Planta de Salvador (1631) — desenho próprio */
  V.salvador = function () {
    const NS = 'http://www.w3.org/2000/svg', sv = MP.sv;
    const svg = sv('svg', { viewBox: '0 0 520 340', role: 'img', 'aria-label': 'Planta de uma cidade colonial no litoral com construções concentradas, fortalezas, quartéis, canhões e navios' });
    sv('rect', { width: 520, height: 340, fill: '#f3e6c4' }, svg);
    sv('path', { d: 'M0,340 L0,0 L170,0 C150,60 190,110 160,170 C140,220 180,280 150,340 Z', fill: '#7fb8d8' }, svg);
    for (let i = 0; i < 9; i++) sv('path', { d: 'M' + (10 + (i % 3) * 40) + ',' + (30 + i * 34) + ' q8,-6 16,0 q8,6 16,0', stroke: '#fff', fill: 'none', 'stroke-width': 2 }, svg);
    sv('path', { d: 'M165,0 C145,60 185,110 155,170 C135,220 175,280 145,340', stroke: '#6b4f2a', 'stroke-width': 4, fill: 'none' }, svg);
    sv('rect', { x: 250, y: 60, width: 250, height: 200, fill: '#e8d3a2', stroke: '#b08d4a', 'stroke-dasharray': '6 4' }, svg);
    for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) sv('rect', { x: 262 + c * 26, y: 72 + r * 26, width: 18, height: 16, fill: '#b5473a', stroke: '#5a2a20' }, svg);
    const fort = (x, y) => { sv('path', { d: 'M' + x + ',' + (y - 16) + ' l7,9 l11,0 l-9,7 l4,11 l-13,-7 l-13,7 l4,-11 l-9,-7 l11,0 z', fill: '#8a8a8a', stroke: '#333', 'stroke-width': 2 }, svg); };
    fort(185, 40); fort(200, 175); fort(185, 300);
    const quartel = (x, y) => { sv('rect', { x, y, width: 34, height: 20, fill: '#6b7a3a', stroke: '#2f3818', 'stroke-width': 2 }, svg); sv('path', { d: 'M' + (x + 17) + ',' + y + ' v-14 l12,5 l-12,5', fill: '#c0392b', stroke: '#333' }, svg); };
    quartel(218, 100); quartel(218, 240);
    const canhao = (x, y) => { sv('rect', { x, y, width: 18, height: 6, rx: 3, fill: '#333' }, svg); sv('circle', { cx: x + 4, cy: y + 8, r: 4, fill: '#555' }, svg); };
    canhao(170, 70); canhao(178, 205); canhao(168, 272);
    const navio = (x, y) => { sv('path', { d: 'M' + x + ',' + y + ' h36 l-6,10 h-24 z', fill: '#7a4b1f', stroke: '#3b220b' }, svg); sv('path', { d: 'M' + (x + 18) + ',' + (y - 22) + ' v22 M' + (x + 18) + ',' + (y - 22) + ' l12,14 h-12', stroke: '#3b220b', fill: '#fff' }, svg); };
    navio(30, 90); navio(70, 200); navio(20, 280);
    const lab = (x, y, t, s) => { const e = sv('text', { x, y, 'font-size': s || 15, 'font-weight': 900, 'font-family': 'Nunito, sans-serif', fill: '#2a2233' }, svg); e.textContent = t; };
    lab(270, 50, 'Centro em terreno mais plano', 15); lab(20, 20, 'Mar (costa)', 15); lab(330, 300, 'Terreno mais alto', 14);
    const leg = U.el('div', { class: 'legend' }, [U.el('span', { style: { '--c': '#b5473a' } }, 'Construções concentradas'), U.el('span', { style: { '--c': '#8a8a8a' } }, 'Fortalezas (estrela)'), U.el('span', { style: { '--c': '#6b7a3a' } }, 'Quartéis (bandeira)'), U.el('span', { style: { '--c': '#333' } }, 'Canhões'), U.el('span', { style: { '--c': '#7a4b1f' } }, 'Navios'), U.el('span', { style: { '--c': '#7fb8d8' } }, 'Mar')]);
    return card('Planta inspirada em Salvador (1631)', [U.el('div', null, svg), leg], 'Desenho do jogo feito para a atividade: mostra o tipo de detalhe que se observa na planta de 1631.');
  };
  /* ------------------------------------------------ Cena inspirada nos temas de Carybé (original) */
  V.carybe = function () {
    const people = P.crowd();
    return card('Roda de capoeira (cena inspirada nos temas de Carybé)', scene(240, 140, (x, w, h) => {
      const g = x.createRadialGradient(120, 80, 10, 120, 80, 140); g.addColorStop(0, '#ffd27a'); g.addColorStop(1, '#b8572f'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#7a2e12'; x.lineWidth = 2; x.beginPath(); x.ellipse(120, 92, 92, 34, 0, 0, Math.PI * 2); x.stroke();
      for (let i = 0; i < 10; i++) { const a = Math.PI + i * (Math.PI / 9) - 0.2; const px = 120 + Math.cos(a) * 92 - 7, py = 92 + Math.sin(a) * 34 - 20; if (py < 80) x.drawImage(P.front(Object.assign({}, people[(i * 5) % 18], { frame: i % 2, shirt: '#fafafa' })), px, py, 14, 20); }
      x.save(); x.translate(96, 88); x.rotate(-0.5); x.drawImage(P.side({ skin: P.SKINS[4], hair: '#1b1b1b', hairStyle: 'crespo', shirt: '#fafafa', pants: '#fafafa', frame: 3 }), -9, -12, 18, 24); x.restore();
      x.save(); x.translate(142, 90); x.scale(-1, 1); x.rotate(-0.3); x.drawImage(P.side({ skin: P.SKINS[3], hair: '#1b1b1b', hairStyle: 'curto', shirt: '#fafafa', pants: '#fafafa', frame: 1 }), -9, -12, 18, 24); x.restore();
      x.strokeStyle = '#3b220b'; x.lineWidth = 2; x.beginPath(); x.moveTo(30, 126); x.lineTo(44, 84); x.stroke(); x.fillStyle = '#c98b45'; x.beginPath(); x.arc(33, 118, 5, 0, Math.PI * 2); x.fill();
      for (let i = 0; i < 4; i++) { const p = people[(i * 7 + 3) % 18]; x.drawImage(P.front(Object.assign({}, p, { shirt: '#fafafa' })), 180 + i * 14, 104, 14, 20); }
      txt(x, 'movimento, música e cores', w / 2, 8, 6, '#3b220b', 'center');
    }, 'Roda de capoeira com pessoas em círculo, dois jogadores ao centro e um berimbau'), 'Ilustração criada para o jogo, inspirada em temas representados por Carybé (capoeira, música, cultura afro-brasileira). Não é a obra original.');
  };
  /* ------------------------------------------------ Comunidade (quilombo) */
  V.quilombo = function () {
    return card('Vida em comunidade', scene(240, 120, (x, w, h) => {
      x.fillStyle = '#a7d86d'; x.fillRect(0, 0, w, h); x.fillStyle = '#8fd0ff'; x.fillRect(0, 0, w, 30);
      for (let i = 0; i < 4; i++) { spr(x, 'town', 63 + (i % 2) * 4, 20 + i * 52, 34, 1.3); spr(x, 'town', 75, 20 + i * 52, 54, 1.3); }
      for (let i = 0; i < 8; i++) { x.fillStyle = '#6d8f2c'; x.fillRect(20 + i * 12, 90, 8, 4); x.fillStyle = '#3f6b1a'; x.fillRect(22 + i * 12, 86, 4, 4); }
      spr(x, 'farm', 60, 150, 84, 1); spr(x, 'farm', 61, 172, 88, 1);
      P.crowd().slice(3, 8).forEach((p, i) => x.drawImage(P.front(p), 118 + i * 16, 64, 14, 20));
      txt(x, 'roçados • animais • tarefas divididas', w / 2, 108, 5, '#1b3a0b', 'center');
    }, 'Comunidade com casas, roçados, animais e pessoas trabalhando juntas'), 'Criar animais, cultivar pequenos roçados e dividir tarefas para abrigo e proteção.');
  };
  /* ------------------------------------------------ Rotas de imigração */
  V.rotasImigracao = function () {
    const m = MP.brasil({ title: 'Rotas de imigração', extra: (svg, M) => {
      MP.arrow(svg, 610, 330, M.regions.sudeste.cx + 20, M.regions.sudeste.cy + 20, '#c0392b', 'café, indústria, comércio', 0.4);
      MP.arrow(svg, 610, 560, M.regions.sul.cx + 30, M.regions.sul.cy, '#6d4c8f', 'agropecuária familiar', -0.3);
      MP.arrow(svg, 610, 250, M.regions.sudeste.cx + 40, M.regions.sudeste.cy - 20, '#1f7a5c', 'comércio', -0.3);
    } });
    const leg = U.el('div', { class: 'legend' }, [U.el('span', { style: { '--c': '#c0392b' } }, 'Italianos, espanhóis e japoneses: café, indústria e comércio'), U.el('span', { style: { '--c': '#1f7a5c' } }, 'Turcos, sírios e libaneses: comércio e pequena indústria'), U.el('span', { style: { '--c': '#6d4c8f' } }, 'No Sul: alemães, italianos, suíços, poloneses, russos e ucranianos')]);
    return card('Rotas de imigração (esquema)', [m.el, leg], 'Setas esquemáticas: por volta de 1820 começaram a chegar grupos numerosos de outros países.');
  };
  /* ------------------------------------------------ Símbolos do labirinto */
  V.simbolos = function () {
    const s = [['Rede para descansar', 'indígena'], ['Balangandãs', 'africana'], ['Três refeições: café, almoço e jantar', 'portuguesa/europeia'], ['Festa do Divino', 'portuguesa'], ['Samba de roda (Bahia)', 'africana'], ['Toré', 'indígena'], ['Brazilian Day (Nova York e Japão)', 'brasileiros no exterior']];
    const t = U.el('table', null, [U.el('tr', null, [U.el('th', null, 'Símbolo'), U.el('th', null, 'Influência / origem')])].concat(s.map((r) => U.el('tr', null, [U.el('td', null, r[0]), U.el('td', null, r[1])]))));
    return card('Símbolos coletados no labirinto', t, 'Conforme o material da prova.');
  };
  /* ------------------------------------------------ Cordel */
  V.cordel = function () {
    return card('Varal de cordel na feira', scene(240, 110, (x, w, h) => {
      x.fillStyle = '#f5e6c8'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#6b4f2a'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 18); x.quadraticCurveTo(120, 34, 240, 18); x.stroke();
      const titles = ['O Caipora', 'A Feira', 'O Sertão', 'A Onça'];
      titles.forEach((t, i) => { const px = 12 + i * 58, py = 22 + Math.sin(i) * 3; x.fillStyle = '#2a2233'; x.fillRect(px - 1, py - 1, 46, 62); x.fillStyle = '#efe1bf'; x.fillRect(px, py, 44, 60); x.fillStyle = '#2a2233'; x.fillRect(px + 6, py + 16, 32, 26); x.fillStyle = '#efe1bf'; x.fillRect(px + 10, py + 30, 6, 10); x.fillRect(px + 24, py + 22, 8, 6); x.fillRect(px + 14, py + 20, 3, 3); txt(x, t, px + 22, py + 5, 5, '#2a2233', 'center', "'Press Start 2P'"); x.fillStyle = '#6b4f2a'; x.fillRect(px + 20, py - 4, 4, 6); });
      txt(x, 'folhetos pendurados em cordas', w / 2, 94, 6, '#2a2233', 'center');
    }, 'Folhetos de cordel pendurados num varal, com capas em xilogravura'), 'Cordel: folhetos expostos em cordas nas feiras; versos com rima e linguagem simples.');
  };
  V.versosCaipora = function () {
    const verses = ['Lá na mata mora o Caipora,', 'guardião de toda a bicharada;', 'cuida da fauna a toda hora,', 'não quer bicho em disparada.', '', 'Caçador que chega na mata,', 'antes de pisar no chão,', 'pede ao Caipora, com respeito,', 'a sua autorização.'];
    return card('Folheto: O Guardião da Mata (versos da Gaia)', U.el('div', { style: { background: '#efe1bf', border: '4px solid #2a2233', borderRadius: '6px', padding: '12px 16px', fontSize: '1.15em', fontWeight: 800, lineHeight: 1.6 } }, verses.map((v) => (v ? U.el('div', null, v) : U.el('br')))), 'Versos criados para o jogo, no estilo do cordel, com base no que o livro conta sobre o Caipora.');
  };
  /* ------------------------------------------------ Xilogravura */
  V.xilo = function () {
    const st = [['1', '🪵🔪', 'Esculpir o desenho em relevo na madeira'], ['2', '🖌️⚫', 'Passar tinta na madeira'], ['3', '📄⬇️', 'Prensar a madeira sobre o papel']];
    return card('Como se faz uma xilogravura', U.el('div', { class: 'steps3' }, st.map((s) => U.el('div', null, [U.el('div', { style: { fontSize: '2em' } }, s[1]), s[2]]))), 'O desenho em relevo recebe tinta e é prensado no papel.');
  };
  V.xiloBoard = function () {
    return card('Sua prancha de xilogravura', scene(200, 90, (x, w, h) => {
      x.fillStyle = '#8b5a2b'; x.fillRect(0, 0, w, h); x.fillStyle = '#c99a5b'; x.fillRect(6, 6, w - 12, h - 12);
      for (let i = 0; i < 12; i++) { x.fillStyle = 'rgba(90,50,20,.25)'; x.fillRect(6, 10 + i * 6, w - 12, 1); }
      txt(x, 'Escolha o que desenhar ↓', w / 2, 40, 6, '#3b220b', 'center');
    }, 'Prancha de madeira vazia'), 'Escolha elementos variados e explique por quê.');
  };
  /* ------------------------------------------------ Cartão da Lia (personagem fictícia) */
  V.lia = function () {
    const img = scene(40, 44, (x) => { x.fillStyle = '#dff3ff'; x.fillRect(0, 0, 40, 44); x.drawImage(P.front({ skin: P.SKINS[2], hair: '#3b2412', hairStyle: 'crespo', shirt: '#e84393', pants: '#2d3436' }), 6, 4, 28, 40); x.fillStyle = '#1b1b2a'; x.fillRect(15, 12, 4, 2); x.fillRect(21, 12, 4, 2); x.fillRect(19, 12, 2, 1); }, 'Lia, personagem fictícia');
    img.style.maxWidth = '120px';
    const facts = ['🔈 Tom de voz: baixo', '🍽️ Comida preferida: tapioca', '⚽ Adora jogar futebol', '📜 Prefere ler histórias de cordel', '👓 Usa óculos', '💇 Tem cabelo cacheado'];
    return card('Cartão da personagem Lia (fictícia)', U.el('div', { style: { display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' } }, [img, U.el('ul', { style: { margin: 0, fontWeight: 800, fontSize: '1.05em' } }, facts.map((f) => U.el('li', null, f)))]), 'Descreva o que se observa — sem julgamentos.');
  };
  /* ------------------------------------------------ Mapas do capítulo 3 */
  const COAST = ['ce', 'rn', 'pb', 'pe', 'al', 'se', 'ba', 'es', 'rj', 'sp', 'pr', 'sc', 'rs'];
  V.mapaLitoral = function () {
    const m = MP.brasil({ labels: 'regions', title: 'Faixa leste, no litoral, mais povoada', fill: (s) => (COAST.includes(s.id) ? '#e8744f' : '#f6e7c1'), extra: (svg) => { MP.label(svg, 560, 120, 'litoral', 22, '#8a2b10'); } });
    return card('Ocupação do território (esquema)', [m.el, U.el('div', { class: 'legend' }, [U.el('span', { style: { '--c': '#e8744f' } }, 'Faixa leste/litoral: ocupada primeiro, mais povoada'), U.el('span', { style: { '--c': '#f6e7c1' } }, 'Interior: ocupado depois')])], 'Mapa esquemático do jogo.');
  };
  V.rotasInterior = function () {
    const m = MP.brasil({ title: 'Rumo ao interior', extra: (svg, M) => {
      const df = MP.state('df');
      MP.arrow(svg, M.regions.sudeste.cx + 20, M.regions.sudeste.cy + 10, M.regions.centro.cx, M.regions.centro.cy, '#c0392b', 'estradas', 0.3);
      MP.arrow(svg, M.regions.nordeste.cx, M.regions.nordeste.cy + 30, M.regions.norte.cx + 60, M.regions.norte.cy + 40, '#6d4c8f', 'terras mais baratas', 0.2);
      svg.appendChild(MP.sv('path', { d: 'M' + df.cx + ',' + (df.cy - 16) + ' l5,11 l12,1 l-9,8 l3,12 l-11,-6 l-11,6 l3,-12 l-9,-8 l12,-1 z', fill: '#ffd23f', stroke: '#2a2233', 'stroke-width': 2 }));
      MP.label(svg, df.cx + 8, df.cy - 22, 'Brasília', 20);
    } });
    return card('Ocupação do interior (esquema)', [m.el, U.el('div', { class: 'legend' }, [U.el('span', { style: { '--c': '#ffd23f' } }, 'Brasília'), U.el('span', { style: { '--c': '#c0392b' } }, 'Estradas para o interior'), U.el('span', { style: { '--c': '#6d4c8f' } }, 'Terras mais baratas, agropecuária moderna')])], 'No século XX, o governo estimulou a ocupação do Centro-Oeste e do Norte.');
  };
  V.rotaNordesteSudeste = function () {
    const m = MP.brasil({ title: 'Migração Nordeste → Sudeste', extra: (svg, M) => { MP.arrow(svg, M.regions.nordeste.cx, M.regions.nordeste.cy + 20, M.regions.sudeste.cx + 10, M.regions.sudeste.cy - 10, '#c0392b', 'trabalho nas fábricas', -0.2); } });
    return card('Migração para o Sudeste (esquema)', [m.el], 'O Sudeste industrializado atraiu trabalhadores, especialmente do Nordeste.');
  };
  V.campoCidade = function () {
    return card('Do campo para a cidade', scene(240, 110, (x, w, h) => {
      x.fillStyle = '#b8e07a'; x.fillRect(0, 0, 118, h); x.fillStyle = '#9fb3c8'; x.fillRect(122, 0, 118, h); x.fillStyle = '#2a2233'; x.fillRect(118, 0, 4, h);
      spr(x, 'town', 64, 20, 30, 1.2); spr(x, 'town', 4, 60, 34, 1.2); spr(x, 'farm', 0, 80, 60, 1);
      for (let i = 0; i < 6; i++) spr(x, 'urban', 297 + (i % 3), 130 + i * 17, 30 + (i % 2) * 10, 1);
      txt(x, 'Até 1960:', 59, 76, 6, '#1b3a0b', 'center'); txt(x, 'maioria no campo', 59, 86, 6, '#1b3a0b', 'center');
      txt(x, 'Hoje:', 181, 76, 6, '#1b1b2a', 'center'); txt(x, 'quase 61% nas cidades', 181, 86, 5, '#1b1b2a', 'center');
    }, 'Comparação entre campo e cidade'), 'Segundo o livro, até a década de 1960 a maior parte vivia no campo; hoje, quase 61% vive nas cidades.');
  };
  V.tabelaRenda = function () {
    const rows = [['Pretos', 'R$ 1.764,00'], ['Pardos', 'R$ 1.814,00'], ['Brancos', 'R$ 3.099,00']];
    const t = U.el('table', null, [U.el('tr', null, [U.el('th', null, 'Grupo'), U.el('th', null, 'Rendimento médio (2021)')])].concat(rows.map((r) => U.el('tr', null, [U.el('td', null, r[0]), U.el('td', { class: 'num' }, r[1])]))));
    return card('Tabela: rendimento médio em 2021', t, 'Valores do material. A tabela mostra desigualdade entre grupos — não é característica de cada pessoa.');
  };
  V.tabelaPop = function () {
    const d = [[1950, 51944397], [1960, 70992343], [1970, 94508583], [1980, 121150573], [1991, 146917459], [2000, 169872856], [2010, 190755799], [2022, 203080756]];
    const max = 203080756;
    const t = U.el('table', null, [U.el('tr', null, [U.el('th', null, 'Ano'), U.el('th', null, 'População')])].concat(d.map((r) => U.el('tr', { class: r[0] === 1970 || r[0] === 2022 ? 'hl' : '' }, [U.el('td', null, String(r[0])), U.el('td', { class: 'num' }, U.fmtInt(r[1]))]))));
    const bars = U.el('div', { class: 'bars', style: { marginTop: '10px' } }, d.map((r) => U.el('div', { class: 'brow' }, [U.el('span', null, String(r[0])), U.el('div', { class: 'bb' }, U.el('i', { style: { width: (r[1] / max * 100).toFixed(1) + '%', background: r[0] === 1970 || r[0] === 2022 ? '#f39c12' : '#5b8def' } })), U.el('span', null, (r[1] / 1e6).toFixed(1).replace('.', ',') + ' mi')])));
    return card('Tabela: população do Brasil (1950–2022)', [t, bars], 'Valores do material. Destaque: 1970 e 2022.');
  };
  V.faixasEtarias = function () {
    const mk = (label, a, b) => U.el('div', { style: { marginBottom: '8px' } }, [U.el('b', null, label), U.el('div', { class: 'bars' }, [U.el('div', { class: 'brow' }, [U.el('span', null, '0 a 14 anos'), U.el('div', { class: 'bb' }, U.el('i', { style: { width: a + '%', background: '#5b8def' } })), U.el('span', null, a > b ? 'maior' : 'menor')]), U.el('div', { class: 'brow' }, [U.el('span', null, 'Idosos'), U.el('div', { class: 'bb' }, U.el('i', { style: { width: b + '%', background: '#e8744f', backgroundImage: 'repeating-linear-gradient(45deg, #0003 0 4px, transparent 4px 8px)' } })), U.el('span', null, b > a ? 'maior' : 'menor')])])]);
    return card('Faixas etárias (esquema, sem escala)', [mk('Brasil “país jovem”', 80, 25), mk('Até a década de 2040 (segundo o material)', 45, 55)], 'Menos nascimentos e maior tempo de vida: a população idosa deverá ultrapassar a de 0 a 14 anos.');
  };
  V.graficoComposicao = function () {
    const d = [['Parda', 45.3, '#c98e62', 'none'], ['Branca', 42.8, '#f1d7b7', 'repeating-linear-gradient(45deg, #0002 0 3px, transparent 3px 7px)'], ['Preta', 10.6, '#6b4128', 'repeating-linear-gradient(90deg, #fff3 0 3px, transparent 3px 7px)'], ['Indígena, amarela ou sem declaração', 1.3, '#8e7cc3', 'none']];
    const bars = U.el('div', { class: 'bars' }, d.map((r) => U.el('div', { class: 'brow', style: { gridTemplateColumns: '170px 1fr 70px' } }, [U.el('span', null, r[0]), U.el('div', { class: 'bb' }, U.el('i', { style: { width: (r[1] / 50 * 100).toFixed(1) + '%', background: r[2], backgroundImage: r[3] } })), U.el('span', null, String(r[1]).replace('.', ',') + '%')])));
    return card('Gráfico: composição da população (2022)', bars, 'Valores do material: parda 45,3%; branca 42,8%; preta 10,6%; indígena, amarela ou sem declaração 1,3%.');
  };
  V.mapaTerras = function () {
    const ind = MP.brasil({ labels: 'regions', title: 'Terras indígenas regularizadas (esquema)', fill: (s) => (s.region === 'norte' ? '#5fae4e' : '#e9f2df'), patterns: { norte: 'hatch' } });
    const qui = MP.brasil({ labels: 'regions', title: 'Territórios quilombolas delimitados (esquema)', fill: (s) => (s.region === 'nordeste' ? '#e3a340' : '#f6ecd9'), patterns: { nordeste: 'dots' } });
    const wrap = U.el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' } }, [U.el('div', null, [U.el('b', null, 'Terras indígenas regularizadas'), ind.el, U.el('div', { class: 'cap' }, 'Hachuras: predomínio na Região Norte.')]), U.el('div', null, [U.el('b', null, 'Territórios quilombolas delimitados'), qui.el, U.el('div', { class: 'cap' }, 'Pontos: forte concentração no Nordeste.')])]);
    return card('Mapas esquemáticos para comparar', wrap, 'Esquema do jogo baseado na leitura orientada do material (não mostra limites exatos).');
  };

  /** Resolve um id de visual para um elemento (ou null). */
  V.render = function (id) { try { return V[id] ? V[id]() : null; } catch (e) { console.error('visual', id, e); return null; } };
})();
