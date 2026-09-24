/* =====================================================================
   src/launcher/launcher.js — TELA DE ENTRADA + CENTRAL DE MISSÕES.
   1) Entrada: pede SÓ o nome (sem senha, sem cadastro). O nome é
      normalizado (NFC, espaços, MAIÚSCULAS pt-BR com acentos) e salvo
      no perfil local único; trocar o nome não cria outro perfil.
   2) Central: cartão do Gabriel Nexus + um cartão por matéria (lidos dos
      manifestos em src/modules/modulos.js). Ciências abre pela rota
      antiga (index.html, sem alterações).
   3) Sincroniza a ponte de pontuação (lê os saves das matérias).
   No MODO DE TESTE DOS PAIS, todos os links abrem as versões sandbox.
   Este arquivo só LÊ os saves das matérias; grava o perfil da franquia
   ("ecoNexus.franchise.v1") e "ecoNexus.launcher.v1" (última matéria).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, P = GG.pixel, ST = GG.store, PR = GG.profile, TM = GG.testMode;
  const ENTERED = 'ecoNexus.entrou';
  const inSession = () => { try { return sessionStorage.getItem(ENTERED) === '1'; } catch (e) { return false; } };

  /** Entrada do módulo (no modo de teste: versão sandbox). */
  function entryOf(m) {
    if (TM.active()) return m.franchise && m.franchise.testEntry ? m.franchise.testEntry({}) : null;
    return m.entry || null;
  }
  function art(m) {
    const c = P.mk(160, 90, (x) => {
      if (m.theme.art === 'ciencias') {
        const g = x.createLinearGradient(0, 0, 0, 90); g.addColorStop(0, '#8fe3ff'); g.addColorStop(1, '#d6f7c4'); x.fillStyle = g; x.fillRect(0, 0, 160, 90);
        x.fillStyle = '#ffd23f'; P.circ(x, 132, 18, 10);
        x.fillStyle = '#2f9e5b'; x.fillRect(0, 62, 160, 28); x.fillStyle = '#3f8fd8'; x.fillRect(96, 70, 64, 20);
        for (let i = 0; i < 5; i++) { x.fillStyle = '#6b3f22'; x.fillRect(14 + i * 18, 44, 4, 20); x.fillStyle = i % 2 ? '#1f7a3f' : '#2ecc71'; P.circ(x, 16 + i * 18, 40, 9); }
        x.fillStyle = '#8fe3ff'; x.beginPath(); x.moveTo(80, 20); x.lineTo(90, 36); x.lineTo(80, 52); x.lineTo(70, 36); x.closePath(); x.fill(); x.strokeStyle = '#15152a'; x.stroke();
      } else if (m.theme.art === 'geografia') {
        const g = x.createLinearGradient(0, 0, 0, 90); g.addColorStop(0, '#1b2a5a'); g.addColorStop(1, '#2f6b9a'); x.fillStyle = g; x.fillRect(0, 0, 160, 90);
        GG.maps.drawCanvas(x, 42, 4, 80, (s) => ({ norte: '#86d17a', nordeste: '#f7b267', centro: '#f4e285', sudeste: '#8ecae6', sul: '#c9b2ff' }[s.region]), 'rgba(0,0,0,.25)');
        P.crowd().slice(0, 6).forEach((pp, i) => x.drawImage(P.front(pp), 6 + i * 24 + (i > 2 ? 32 : 0), 66, 14, 20));
        x.drawImage(P.gaia(0), 124, 10, 24, 24);
      } else if (m.theme.art === 'matematica') {
        const g = x.createLinearGradient(0, 0, 0, 90); g.addColorStop(0, '#3a1747'); g.addColorStop(1, '#7a2a6a'); x.fillStyle = g; x.fillRect(0, 0, 160, 90);
        ['#ff5d8f', '#ffd23f', '#3ddc84', '#3ec1ff', '#b07bff'].forEach((c, i) => { x.fillStyle = c; const h = 16 + i * 11; x.fillRect(22 + i * 24, 78 - h, 16, h); });
        x.fillStyle = 'rgba(255,255,255,.8)'; x.font = '12px sans-serif'; x.fillText('+ − × ÷', 104, 22);
      } else {
        x.fillStyle = '#262c5c'; x.fillRect(0, 0, 160, 90);
        x.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 30; i++) x.fillRect((i * 53) % 160, (i * 29) % 90, 1, 1);
        x.font = '28px sans-serif'; x.textAlign = 'center'; x.fillText('✨', 80, 58);
      }
    });
    c.className = 'ln-art'; c.setAttribute('aria-hidden', 'true');
    return c;
  }
  function card(m) {
    if (m.comingSoon) {
      return U.el('article', { class: 'ln-card ph soon', style: { '--c': m.theme.color } }, [art(m), U.el('div', { class: 'ln-body' }, [
        U.el('div', { class: 'ln-subject' }, [U.el('span', null, m.theme.icon), ' ' + m.subject]),
        U.el('h2', { class: 'pix' }, 'Em breve'),
        U.el('p', { class: 'tip' }, 'O jogo de ' + m.subject + ' ainda vai ser criado. O Gato Gráfico já espera por você no Gabriel Nexus!')])]);
    }
    if (m.placeholder || !m.enabled) {
      return U.el('article', { class: 'ln-card ph' }, [art(m), U.el('div', { class: 'ln-body' }, [U.el('h2', { class: 'pix' }, 'Novas missões chegarão'), U.el('p', { class: 'tip' }, 'Quando houver uma nova prova, uma nova missão aparece aqui.')])]);
    }
    const pr = (() => { try { return TM.active() ? { started: false, percent: 0 } : m.progress(); } catch (e) { return { started: false, percent: 0 }; } })();
    const entry = entryOf(m);
    const go = async (url) => {
      if (!url) return;
      if (!TM.active()) ST.setLauncher({ last: m.id, visits: (ST.launcher().visits || 0) + 1 });
      GG.audio.sfx('click');
      // Online (site publicado), a cópia "ciencias.html" é usada quando existir; abrindo o arquivo local, index.html.
      if (url === m.entry && m.entryAlt && /^https?:/.test(location.protocol)) {
        try { const r = await fetch(m.entryAlt, { method: 'HEAD' }); if (r.ok) url = m.entryAlt; } catch (e) { /* mantém a entrada padrão */ }
      }
      setTimeout(() => { location.href = url; }, 120);
    };
    const acts = U.el('div', { class: 'ln-acts' }, [UI.btn(TM.active() ? '🧪 Testar' : pr.started ? '▶ Continuar' : '▶ Jogar', 'go', () => go(entry))]);
    if (pr.started) {
      acts.appendChild(UI.btn('📝 Revisar', '', () => {
        if (m.reviewEntry) go(m.reviewEntry);
        else { UI.toast(m.reviewTip || 'A revisão fica no menu do jogo.', '', 3500); setTimeout(() => go(entry), 1800); }
      }));
    }
    const last = ST.launcher().last === m.id;
    return U.el('article', { class: 'ln-card' + (last ? ' last' : ''), style: { '--c': m.theme.color } }, [
      art(m),
      U.el('div', { class: 'ln-body' }, [
        U.el('div', { class: 'ln-subject' }, [U.el('span', null, m.theme.icon), ' ' + m.subject]),
        U.el('h2', { class: 'pix' }, m.title),
        m.subtitle ? U.el('p', { class: 'ln-sub' }, m.subtitle) : null,
        U.el('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': String(pr.percent || 0), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': 'Percentual concluído' }, U.el('i', { style: { width: (pr.percent || 0) + '%' } })),
        U.el('ul', { class: 'ln-stats' }, [
          U.el('li', null, '📈 ' + (pr.percent || 0) + '% concluído' + (pr.done ? ' 🏆' : '')),
          U.el('li', null, '📍 Última fase: ' + (pr.last || '—')),
          U.el('li', null, '🏅 ' + (pr.medals || 0) + ' ' + (pr.medalsLabel || 'medalhas') + (pr.extra ? ' • ' + pr.extra : ''))
        ]),
        last ? U.el('span', { class: 'chip' }, 'Última jogada') : null,
        acts
      ])
    ]);
  }
  function coin() { return U.el('span', { class: 'nx-coin', 'aria-hidden': 'true' }); }
  function nexusCard(p, sync) {
    const box = document.getElementById('lnNexus'); box.innerHTML = '';
    const lv = GG.FR.levelFor(p.careerPoints);
    const owned = GG.catalog.list.filter((c) => p.allContentUnlocked || p.collectibles[c.id]).length;
    const news = sync && !sync.migrated.length && sync.coins > 0 ? U.el('span', { class: 'chip ln-new' }, '+' + sync.coins + ' Moedas Nexus novas!') : null;
    box.appendChild(U.el('article', { class: 'ln-hero' }, [
      U.el('img', { class: 'ln-hero-bg', src: 'src/nexus/assets/cenarios/01_keyart_gabriel_nexus.jpg', alt: '', 'aria-hidden': 'true' }),
      U.el('div', { class: 'ln-hero-body' }, [
        U.el('p', { class: 'ln-hero-k' }, 'Jogo central da franquia'),
        U.el('h2', { class: 'ln-hero-t' }, 'Gabriel Nexus'),
        U.el('p', { class: 'ln-hero-s' }, 'O Mundo dos Nexóticos'),
        U.el('ul', { class: 'ln-hero-stats' }, [
          U.el('li', null, ['⭐ ', U.el('b', null, U.fmtInt(p.careerPoints)), ' pontos de carreira']),
          U.el('li', null, [coin(), ' ', U.el('b', null, U.fmtInt(p.nexusCoins)), ' Moedas Nexus']),
          U.el('li', null, ['🌀 Nível ', U.el('b', null, String(lv.level)), ' — ' + lv.name]),
          U.el('li', null, ['🧸 ', U.el('b', null, owned + '/' + GG.catalog.list.length), ' Nexóticos'])
        ]),
        news,
        U.el('div', { class: 'ln-acts' }, [UI.btn(TM.active() ? '🧪 Testar o Nexus' : '🌀 Entrar no Nexus', 'pri ln-hero-go', () => { GG.audio.sfx('click'); setTimeout(() => { location.href = 'src/nexus/nexus.html'; }, 120); })])
      ])
    ]));
  }
  function credits() {
    const m = UI.modal({ title: 'Créditos e licenças', wide: true });
    m.body.appendChild(U.el('ul', null, [
      U.el('li', null, 'Sprites de cenário: Kenney (kenney.nl) — Pixel Platformer, Pixel Shmup, Tiny Town, Tiny Dungeon, RPG Urban Pack e expansões — licença CC0 (domínio público).'),
      U.el('li', null, 'Mapa do Brasil: @svg-maps/brazil (Victor Cazanave) — licença CC BY 4.0.'),
      U.el('li', null, 'Fontes: Press Start 2P e Nunito — SIL Open Font License 1.1.'),
      U.el('li', null, 'Personagens (Gabriel, Gaia, GeoBot, adversários), músicas e efeitos: criados para este projeto.'),
      U.el('li', null, 'Gabriel Nexus: cenários, Nexóticos e referência do Gabriel fornecidos pelo responsável do projeto; logo do Colégio Kodomo usado como arquivo original, sem alterações.'),
      U.el('li', null, 'Arquivos de licença: src/assets/shared/licencas/. Lista completa: CREDITOS.md.')
    ]));
    m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  }

  /* ---------------- entrada pelo nome ---------------- */
  /** Encaixa o formulário dentro do painel desenhado no cenário (sem deformar a imagem). */
  const IMG = { w: 1672, h: 941, panel: { x: 924, y: 184, w: 661, h: 630 }, posX: 0.35, posY: 0.5 };
  function fitLogin() {
    const card = document.getElementById('lgForm'); if (!card) return;
    const W = window.innerWidth, H = window.innerHeight;
    if (W / H < 1.15 || W < 760) { card.removeAttribute('style'); card.classList.remove('fit'); return; }
    const s = Math.max(W / IMG.w, H / IMG.h);
    const ox = (W - IMG.w * s) * IMG.posX, oy = (H - IMG.h * s) * IMG.posY;
    const P0 = IMG.panel, pad = 0.07;
    const x = ox + (P0.x + P0.w * pad) * s, y = oy + (P0.y + P0.h * pad) * s, w = P0.w * (1 - 2 * pad) * s, h = P0.h * (1 - 2 * pad) * s;
    card.classList.add('fit');
    Object.assign(card.style, { left: Math.round(x) + 'px', top: Math.round(y) + 'px', width: Math.round(w) + 'px', minHeight: Math.round(Math.min(h, H - y - 12)) + 'px', right: 'auto', transform: 'none' });
  }
  function login() {
    return new Promise((resolve) => {
      const sec = document.getElementById('login'), inp = document.getElementById('lgName'), prev = document.getElementById('lgPreview');
      sec.classList.remove('hide'); document.body.classList.add('in-login');
      fitLogin(); window.addEventListener('resize', fitLogin);
      inp.value = PR.suggestName();
      const upd = () => { const n = PR.normalizeName(inp.value); prev.textContent = n ? 'Olá, ' + n + '!' : ''; };
      inp.addEventListener('input', upd); upd();
      setTimeout(() => { try { inp.focus(); inp.select(); } catch (e) { /* ok */ } }, 60);
      document.getElementById('lgForm').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const n = PR.setName(inp.value);
        if (!n) { prev.textContent = 'Digite seu nome para entrar.'; prev.classList.add('err'); inp.focus(); return; }
        try { sessionStorage.setItem(ENTERED, '1'); } catch (e) { /* ok */ }
        GG.audio.sfx('ok');
        sec.classList.add('hide'); document.body.classList.remove('in-login');
        resolve(n);
      });
    });
  }
  function renameDialog() {
    const m = UI.modal({ title: '✏️ Seu nome', cls: 'small' });
    const inp = U.el('input', { type: 'text', maxlength: '30', value: PR.name(), 'aria-label': 'Seu nome' });
    m.body.appendChild(U.el('p', null, 'O nome aparece nas telas e diálogos. Trocar o nome não apaga nem separa o progresso.'));
    m.body.appendChild(inp);
    m.setActions([UI.btn('Cancelar', 'ghost', () => m.close()), UI.btn('Salvar', 'pri', () => { if (PR.setName(inp.value)) { m.close(); render(); } })]);
    setTimeout(() => inp.select(), 50);
  }
  const toParents = () => { location.href = 'src/pais/pais.html'; };

  let lastSync = null;
  function render() {
    const p = PR.load();
    document.getElementById('lnHello').textContent = 'Olá, ' + (p.displayNameUppercase || 'EXPLORADOR') + '!';
    nexusCard(p, lastSync);
    const box = document.getElementById('lnCards'); box.innerHTML = '';
    GG.registry.list.forEach((m) => box.appendChild(card(m)));
  }
  async function boot() {
    await GG.modules.load('');
    if (TM.active()) TM.banner('');
    document.getElementById('lgParents').addEventListener('click', toParents);
    document.getElementById('lnParents').addEventListener('click', toParents);
    document.getElementById('lnCredits').addEventListener('click', credits);
    document.getElementById('lnName').addEventListener('click', renameDialog);
    if (!inSession() && !TM.active()) await login();
    try { lastSync = GG.bridge.sync(); } catch (e) { GG.errlog.add('sync', e.message); }
    document.getElementById('launcherMain').classList.remove('hide');
    const gc = document.getElementById('lnGaia').getContext('2d'); gc.imageSmoothingEnabled = false; gc.drawImage(P.gaiaPortrait(), 0, 0);
    render();
    if (lastSync && lastSync.migrated.length) UI.toast('🌀 Suas aventuras anteriores trouxeram ' + U.fmtInt(lastSync.points) + ' pontos e ' + lastSync.coins + ' Moedas Nexus!', 'gold', 5000);
    else if (lastSync && lastSync.coins > 0) UI.toast('🌀 +' + lastSync.coins + ' Moedas Nexus pelos seus estudos!', 'gold', 3500);
  }
  window.addEventListener('DOMContentLoaded', boot);
})();
