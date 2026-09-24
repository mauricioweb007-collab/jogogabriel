/* =====================================================================
   scenes/roleta.js — ROLETA DA SORTE (pedido do usuário, 24/09/2026).
   Quando a criança termina uma fase com 100% DE ACERTO (todas as
   questões de primeira e todas as checagens certas), ganha 1 GIRO
   GRÁTIS. A roleta sorteia QUALQUER minijogo (Parque e Arcade),
   inclusive os que ainda estão bloqueados, para 1 partida bônus.
   • O giro fica guardado (S().flags.spins) se ela não quiser girar na hora;
     o menu do Parque mostra "Girar agora".
   • Para não virar "fábrica de giros" repetindo uma fase fácil: 1 giro
     por fase por dia (S().flags.spinDays[fase] = dia).
   • Os desbloqueios normais continuam a cada chefe (a roleta não libera
     o jogo; é só 1 partida).
   ===================================================================== */
(function () {
  'use strict';
  const U = GG.util, UI = GG.ui, PQ = GEO.parque;
  const S = () => GEO.save.S;
  const X = () => (GEO.gfx && GEO.gfx.ready ? GEO.gfx : null);
  const flags = () => { const s = S(); s.flags = s.flags || {}; return s.flags; };
  PQ.spins = () => flags().spins || 0;
  PQ.giveSpin = () => { flags().spins = PQ.spins() + 1; GEO.save.persist(); };

  /** 100% de acerto na fase? (pelo menos 1 questão ou checagem; tudo de primeira) */
  PQ.isPerfect = function (ctx) {
    if (!ctx || (ctx.def && ctx.def.bonus)) return false;
    const qs = ctx.results || [], anyQ = qs.length > 0, anyC = (ctx.checksTotal || 0) > 0;
    if (!anyQ && !anyC) return false;
    return qs.every((x) => x.personal || x.tier === 1) && (ctx.checksOk || 0) === (ctx.checksTotal || 0);
  };
  /** Dá o giro (1 por fase por dia). Retorna true se deu. */
  PQ.awardPerfect = function (stageId) {
    if (GEO.mode && GEO.mode.isReplay && GEO.mode.isReplay()) return false;
    // fases de chefe nunca dão giro: o prêmio delas é o bilhete do Arcade (escolhido pela criança)
    const st = (GEO.data.stages || []).find((x) => x.id === stageId); if (st && st.engine === 'boss') return false;
    const f = flags(); f.spinDays = f.spinDays || {};
    const day = U.today();
    if (f.spinDays[stageId] === day) return false;
    f.spinDays[stageId] = day; PQ.giveSpin(); return true;
  };

  /** Abre a roleta e gasta 1 giro. */
  PQ.roulette = function () {
    if (PQ.spins() <= 0) { UI.toast('Você não tem giros. Acerte 100% em uma fase para ganhar!', '', 2600); return Promise.resolve(null); }
    const games = PQ.GAMES.slice();
    return new Promise((resolve) => {
      const m = UI.modal({ title: '🎰 Roleta da Sorte', noClose: true, cls: 'roleta-modal' });
      m.body.appendChild(U.el('p', { class: 'tip' }, 'Pode sair QUALQUER minijogo — até um que você ainda não liberou! Você joga 1 partida bônus.'));
      const cv = U.el('canvas', { width: 300, height: 300, class: 'roleta-cv', 'aria-label': 'Roleta com todos os minijogos' });
      const res = U.el('p', { class: 'roleta-res', 'aria-live': 'polite' }, '');
      m.body.appendChild(U.el('div', { class: 'roleta-wrap' }, [cv, U.el('div', { class: 'roleta-pin' }, '▼')]));
      m.body.appendChild(res);
      const ctx = cv.getContext('2d'), n = games.length, seg = Math.PI * 2 / n;
      const cols = ['#e5484d', '#ff9a3d', '#ffd23f', '#35e07a', '#3ec1ff', '#b07bff'];
      let ang = 0;
      function draw() {
        ctx.clearRect(0, 0, 300, 300);
        ctx.save(); ctx.translate(150, 150);
        for (let i = 0; i < n; i++) {
          const a0 = ang + i * seg - Math.PI / 2 - seg / 2;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 140, a0, a0 + seg); ctx.closePath();
          ctx.fillStyle = cols[i % cols.length]; ctx.fill(); ctx.strokeStyle = '#15152a'; ctx.lineWidth = 2; ctx.stroke();
          const am = a0 + seg / 2, ix = Math.cos(am) * 104, iy = Math.sin(am) * 104;
          if (!(X() && X().ilus(ctx, games[i].icon, ix, iy, 30, { rot: am + Math.PI / 2 }))) { ctx.fillStyle = '#15152a'; ctx.fillText(games[i].title.slice(0, 3), ix, iy); }
        }
        ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fillStyle = '#15152a'; ctx.fill(); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      draw();
      const go = UI.btn('🎰 GIRAR!', 'pri', () => {
        go.disabled = true; flags().spins = PQ.spins() - 1; GEO.save.persist();
        const win = Math.floor(Math.random() * n);
        // a fatia "win" termina embaixo do ponteiro (no topo): ang final = -win*seg (+ voltas)
        const turns = 5 + Math.floor(Math.random() * 2), start = ang, end = -win * seg - turns * Math.PI * 2 + (Math.random() - 0.5) * seg * 0.6;
        const dur = GG.engine.reduced ? 900 : 3600, t0 = performance.now();
        let lastTick = -1;
        (function step(now) {
          const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          ang = start + (end - start) * e; draw();
          const tick = Math.floor(-ang / seg); if (tick !== lastTick) { lastTick = tick; GG.audio.note('A5', 0.02); }
          if (k < 1) { requestAnimationFrame(step); return; }
          const g = games[win], locked = !PQ.unlocked(g);
          GG.audio.sfx('win'); if (X()) X().flash('#fff6c0', 0.25);
          res.textContent = '';
          res.appendChild(U.el('b', null, 'Saiu: ' + g.title + '!'));
          res.appendChild(document.createTextNode(locked ? ' (um jogo que você ainda NÃO liberou — aproveite!)' : ' Boa!'));
          m.setActions([UI.btn('Jogar agora ▶', 'pri', () => { m.close(); resolve(g.id); setTimeout(() => PQ.play(g.id, false, { bonus: true }), 80); })]);
        })(t0);
      });
      m.setActions([go]);
      GG.audio.sfx('power');
    });
  };
})();
