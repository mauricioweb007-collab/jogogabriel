/* =====================================================================
   src/launcher/launcher.js — CENTRAL DE MISSÕES (camada de entrada).
   Pequena e separada: carrega os manifests listados em
   src/modules/modulos.js e mostra um cartão por matéria. Ciências abre
   pela rota antiga (index.html, sem alterações); Geografia pela rota
   nova. Este arquivo só LÊ os saves das matérias; grava apenas a chave
   "ecoNexus.launcher.v1" (última matéria escolhida).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, P = GG.pixel, ST = GG.store;

  /** Entrada do módulo. Na página publicada (onde o lançador é a página principal),
   *  Ciências fica disponível como "ciencias.html" (cópia idêntica de index.html) — ver go(). */
  function entryOf(m) { return m.entry || null; }
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
    if (m.placeholder || !m.enabled) {
      return U.el('article', { class: 'ln-card ph' }, [art(m), U.el('div', { class: 'ln-body' }, [U.el('h2', { class: 'pix' }, 'Novas missões chegarão'), U.el('p', { class: 'tip' }, 'Quando houver uma nova prova, uma nova missão aparece aqui.')])]);
    }
    const pr = (() => { try { return m.progress(); } catch (e) { return { started: false, percent: 0 }; } })();
    const entry = entryOf(m);
    const go = async (url) => {
      ST.setLauncher({ last: m.id, visits: (ST.launcher().visits || 0) + 1 }); GG.audio.sfx('click');
      // Online (site publicado), a cópia "ciencias.html" é usada quando existir; abrindo o arquivo local, index.html.
      if (url === m.entry && m.entryAlt && /^https?:/.test(location.protocol)) {
        try { const r = await fetch(m.entryAlt, { method: 'HEAD' }); if (r.ok) url = m.entryAlt; } catch (e) { /* mantém a entrada padrão */ }
      }
      setTimeout(() => { location.href = url; }, 120);
    };
    const acts = U.el('div', { class: 'ln-acts' }, [UI.btn(pr.started ? '▶ Continuar' : '▶ Jogar', 'go', () => go(entry))]);
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
  function credits() {
    const m = UI.modal({ title: 'Créditos e licenças', wide: true });
    m.body.appendChild(U.el('ul', null, [
      U.el('li', null, 'Sprites de cenário: Kenney (kenney.nl) — Pixel Platformer, Pixel Shmup, Tiny Town, Tiny Dungeon, RPG Urban Pack e expansões — licença CC0 (domínio público).'),
      U.el('li', null, 'Mapa do Brasil: @svg-maps/brazil (Victor Cazanave) — licença CC BY 4.0.'),
      U.el('li', null, 'Fontes: Press Start 2P e Nunito — SIL Open Font License 1.1.'),
      U.el('li', null, 'Personagens (Gabriel, Gaia, GeoBot, adversários), músicas e efeitos: criados para este projeto.'),
      U.el('li', null, 'Arquivos de licença: src/assets/shared/licencas/. Lista completa: CREDITOS.md.')
    ]));
    m.setActions([UI.btn('Fechar', 'pri', () => m.close())]);
  }

  async function boot() {
    try { await U.loadScripts(GG.MODULE_MANIFESTS); } catch (e) { console.error(e); }
    const box = document.getElementById('lnCards');
    const list = GG.registry.list;
    list.forEach((m) => box.appendChild(card(m)));
    // nome: lido (somente leitura) dos saves das matérias
    let name = null;
    list.forEach((m) => { try { const p = m.progress(); if (p && p.name && !name) name = p.name; } catch (e) { /* ignora */ } });
    document.getElementById('lnHello').textContent = 'Olá, ' + (name || 'explorador') + '!';
    const gc = document.getElementById('lnGaia').getContext('2d'); gc.imageSmoothingEnabled = false; gc.drawImage(P.gaiaPortrait(), 0, 0);
    document.getElementById('lnCredits').addEventListener('click', credits);
  }
  window.addEventListener('DOMContentLoaded', boot);
})();
