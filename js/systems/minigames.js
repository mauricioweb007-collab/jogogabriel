/* =====================================================================
   systems/minigames.js — MINIJOGOS curtos e rejogáveis (teclado e toque):
     Trilha Segura, Corredor da Cadeia, Coleta Solar, Salve o Lago,
     Torre dos Níveis, Corrida dos Biomas, Jardim da Vila e o único
     desafio cronometrado (opcional): Desafio Relâmpago.
   Recompensas pequenas (1 a 5 moedas) e limitadas (economy.js).
   ===================================================================== */
EN.minigames = (function () {
  'use strict';
  const U = EN.util, SP = EN.sprites;
  const MG = {};
  MG.names = { trilha_segura: 'Trilha Segura', corredor_cadeia: 'Corredor da Cadeia', coleta_solar: 'Coleta Solar', salve_lago: 'Salve o Lago', torre_niveis: 'Torre dos Níveis', corrida_biomas: 'Corrida dos Biomas', jardim: 'Jardim da Vila', relampago: 'Desafio Relâmpago' };
  const INTRO = {
    trilha_segura: ['Trilha Segura', '🥾', 'Ande pela trilha e **pegue os itens certos** para uma investigação na natureza: água, chapéu, protetor solar, repelente, calçado fechado e kit de primeiros socorros. **Desvie** de pedras e de ações inadequadas. Use ◀ ▶ (ou A/D, ou arraste).'],
    corredor_cadeia: ['Corredor da Cadeia', '➡️', 'Em cada rodada aparecem dois seres. Toque (ou tecle 1/2) no que é o **ALIMENTO**: ele vai para o começo da seta, e quem come vai para a ponta. Lembre: **alimento → consumidor**.'],
    coleta_solar: ['Coleta Solar', '☀️', 'Mova-se e colete **luz do Sol ☀️**, **água 💧** e **gás carbônico ⚪** para completar a fotossíntese. Evite o que não entra na fotossíntese. Complete **3 fotossínteses**!'],
    salve_lago: ['Salve o Lago', '🫧', 'Pegue as **bolhas de oxigênio 🫧** e leve até os **peixes 🐟**. Quando um cano de **nutrientes** abrir (fica verde), vá até ele e aperte **E/Espaço** (ou toque nele) para fechar. Encha o oxigênio até 100%!'],
    torre_niveis: ['Torre dos Níveis', '🏗️', 'Construa a torre de **baixo para cima**: primeiro o **produtor**, depois os consumidores na ordem certa. São 5 torres.'],
    corrida_biomas: ['Corrida dos Biomas', '🏃', 'Leia a **pista** e ande até o **portal do bioma** certo. São 6 pistas.'],
    relampago: ['Desafio Relâmpago (opcional)', '⏱️', 'Versão **cronometrada e opcional** do Corredor da Cadeia: quantos pares “alimento → consumidor” você acerta em **60 segundos**? Não conta para a história; é só um bônus.']
  };

  /* ---------------- janela com canvas e controles ---------------- */
  function stage(id, opts) {
    const m = EN.ui.modal({ title: '🎮 ' + MG.names[id], wide: true, cls: 'mg', noClose: true });
    const cv = U.el('canvas', { class: 'mg-cv', width: 640, height: 400 });
    const status = U.el('div', { class: 'mg-status' });
    m.body.appendChild(status); m.body.appendChild(cv);
    const keys = new Set();
    const kd = (ev) => { const k = ev.key.toLowerCase(); const map = { arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r', arrowup: 'u', w: 'u', arrowdown: 'd', s: 'd' }; if (map[k]) { keys.add(map[k]); ev.preventDefault(); } if ((k === 'e' || k === ' ') && opts.onAction) { ev.preventDefault(); opts.onAction(); } if (opts.onKey) opts.onKey(k); };
    const ku = (ev) => { const k = ev.key.toLowerCase(); const map = { arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r', arrowup: 'u', w: 'u', arrowdown: 'd', s: 'd' }; if (map[k]) keys.delete(map[k]); };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    // toque/arrasto: o jogador segue o dedo
    let pointer = null;
    const toLocal = (ev) => { const r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width * 640, y: (ev.clientY - r.top) / r.height * 400 }; };
    cv.addEventListener('pointerdown', (ev) => { pointer = toLocal(ev); if (opts.onTap) opts.onTap(pointer); });
    cv.addEventListener('pointermove', (ev) => { if (pointer) pointer = toLocal(ev); });
    window.addEventListener('pointerup', () => { pointer = null; });
    const pad = U.el('div', { class: 'mg-pad' });
    [['◀', 'l'], ['▲', 'u'], ['▼', 'd'], ['▶', 'r']].forEach(([t, k]) => {
      if (opts.axes === 'x' && (k === 'u' || k === 'd')) return;
      const b = U.el('button', { type: 'button', class: 'btn big' }, t);
      b.addEventListener('pointerdown', (ev) => { ev.preventDefault(); keys.add(k); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => b.addEventListener(e, () => keys.delete(k)));
      pad.appendChild(b);
    });
    if (opts.onAction) { const b = U.el('button', { type: 'button', class: 'btn big pri' }, '✋ Fechar cano'); b.addEventListener('click', () => opts.onAction()); pad.appendChild(b); }
    m.body.appendChild(pad);
    const ctx = cv.getContext('2d');
    let raf = 0, last = 0, alive = true;
    function start(update, draw) {
      last = performance.now();
      const loop = (now) => {
        if (!alive) return;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        update(dt, keys, pointer); draw(ctx);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    function stop() { alive = false; cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); }
    return { m, cv, ctx, status, keys, start, stop };
  }
  function moveDir(keys, pointer, p, sp, dt, axes) {
    let dx = 0, dy = 0;
    if (keys.has('l')) dx--; if (keys.has('r')) dx++;
    if (axes !== 'x') { if (keys.has('u')) dy--; if (keys.has('d')) dy++; }
    if (pointer) { const vx = pointer.x - p.x, vy = axes === 'x' ? 0 : pointer.y - p.y; const d = Math.hypot(vx, vy); if (d > 6) { dx = vx / d; dy = vy / d; } }
    const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
    p.x = U.clamp(p.x + dx * sp * dt, 20, 620); if (axes !== 'x') p.y = U.clamp(p.y + dy * sp * dt, 30, 380);
  }
  function emoji(ctx, e, x, y, s) { SP.drawEmoji(ctx, e, x, y, s || 30); }
  function label(ctx, t, x, y, c) { ctx.font = 'bold 15px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.strokeText(t, x, y); ctx.fillStyle = c || '#fff'; ctx.fillText(t, x, y); }

  /* ---------------- Trilha Segura ---------------- */
  function trilha() {
    return new Promise((resolve) => {
      const GOOD = [['💧', 'Água'], ['👒', 'Chapéu'], ['🧴', 'Protetor solar'], ['🦟', 'Repelente'], ['🥾', 'Calçado fechado'], ['⛑️', 'Primeiros socorros']];
      const BAD = [['🪨', 'Pedra: desvie!'], ['✋', 'Não toque nos animais'], ['🥀', 'Não arranque plantas'], ['🚶', 'Não saia sozinho da trilha']];
      const st = stage('trilha_segura', { axes: 'x' });
      const p = { x: 320, y: 350 };
      const list = []; let spawnT = 0, spawned = 0, total = 30, got = 0, goodTotal = 0, bad = 0, msg = '', msgT = 0, scroll = 0;
      st.start((dt, keys, ptr) => {
        moveDir(keys, ptr, p, 260, dt, 'x');
        scroll += dt * 90;
        spawnT -= dt;
        if (spawnT <= 0 && spawned < total) {
          spawnT = 1.5; spawned++;
          const isGood = Math.random() < 0.62;
          const k = isGood ? U.pick(GOOD) : U.pick(BAD);
          if (isGood) goodTotal++;
          list.push({ x: U.rand(60, 580), y: -20, e: k[0], n: k[1], good: isGood });
        }
        list.forEach((o) => { o.y += 120 * dt; });
        list.forEach((o) => {
          if (!o.hit && Math.abs(o.x - p.x) < 38 && Math.abs(o.y - p.y) < 34) {
            o.hit = true; msg = o.good ? '+ ' + o.n : o.n; msgT = 1.2;
            if (o.good) { got++; EN.audio.play('pickup'); } else { bad++; EN.audio.play('bad'); }
          }
        });
        for (let i = list.length - 1; i >= 0; i--) if (list[i].y > 430 || list[i].hit) list.splice(i, 1);
        msgT -= dt;
        st.status.textContent = 'Itens certos: ' + got + '  •  Esbarrões: ' + bad + '  •  Trilha: ' + Math.min(100, Math.round(spawned / total * 100)) + '%';
        if (spawned >= total && !list.length) { st.stop(); finish('trilha_segura', goodTotal ? U.clamp((got - bad * 0.5) / goodTotal, 0, 1) : 0, 'Você coletou ' + got + ' itens certos e esbarrou ' + bad + ' vez(es).', resolve, st.m); }
      }, (ctx) => {
        ctx.fillStyle = '#5fb85c'; ctx.fillRect(0, 0, 640, 400);
        ctx.fillStyle = '#d9b77e'; ctx.fillRect(40, 0, 560, 400);
        ctx.fillStyle = '#c9a36a'; for (let y = -40 + (scroll % 40); y < 400; y += 40) { ctx.fillRect(100, y, 8, 18); ctx.fillRect(530, y + 20, 8, 18); }
        for (let y = -60 + (scroll % 60); y < 420; y += 60) { emoji(ctx, '🌳', 18, y, 34); emoji(ctx, '🌳', 622, y + 30, 34); }
        list.forEach((o) => { emoji(ctx, o.e, o.x, o.y, 34); });
        SP.drawCharacter(ctx, p.x, p.y + 20, EN.eco.look(), { dir: 'up', moving: true, walk: scroll / 10, t: scroll / 50 });
        if (msgT > 0) label(ctx, msg, 320, 60, '#ffe066');
      });
    });
  }

  /* ---------------- Corredor da Cadeia (e Relâmpago) ---------------- */
  const PAIRS = [['🌾', 'Capim', '#capivara', 'Capivara'], ['🥕', 'Cenoura', '🐇', 'Coelho'], ['🐇', 'Coelho', '🦊', 'Raposa'], ['🌽', 'Milho', '🐁', 'Rato'], ['🐁', 'Rato', '🦉', 'Coruja'], ['🦗', 'Gafanhoto', '🐸', 'Sapo'], ['🐸', 'Sapo', '🐍', 'Serpente'], ['🐍', 'Serpente', '🦅', 'Gavião'], ['🥥', 'Coquinhos', '#cutia', 'Cutia'], ['#cutia', 'Cutia', '🐍', 'Jararaca'], ['🐍', 'Jararaca', '🦅', 'Harpia'], ['#capivara', 'Capivara', '🐆', 'Onça'], ['🌿', 'Plantas', '🦗', 'Gafanhoto'], ['🟢', 'Algas', '🐟', 'Peixe']];
  function corredor(timed) {
    return new Promise((resolve) => {
      const id = timed ? 'relampago' : 'corredor_cadeia';
      const m = EN.ui.modal({ title: '🎮 ' + MG.names[id], wide: true, cls: 'mg', noClose: true });
      const rounds = timed ? U.shuffle(PAIRS.concat(PAIRS)) : U.shuffle(PAIRS).slice(0, 8);
      let r = 0, first = 0, missed = false, left = 60, iv = null, answered = 0;
      const status = U.el('div', { class: 'mg-status' });
      const row = U.el('div', { class: 'chain-game' });
      const fb = U.el('p', { class: 'sim-note' });
      m.body.appendChild(status); m.body.appendChild(U.el('p', { class: 'tip' }, 'Toque no ALIMENTO (ou tecle 1 / 2).')); m.body.appendChild(row); m.body.appendChild(fb);
      const onKey = (ev) => { if (ev.key === '1' || ev.key === '2') choose(+ev.key - 1); };
      m.onKey = onKey;
      let cur = null;
      function show() {
        const pr = rounds[r];
        cur = U.shuffle([{ ic: pr[0], t: pr[1], food: true }, { ic: pr[2], t: pr[3], food: false }]);
        row.innerHTML = '';
        cur.forEach((c, i) => { const b = U.el('button', { type: 'button', class: 'org big' }, [EN.learn.icon(c.ic, 48), U.el('span', null, (i + 1) + '. ' + c.t)]); b.addEventListener('click', () => choose(i)); row.appendChild(b); });
        row.appendChild(U.el('div', { class: 'slot-line' }, [U.el('span', { class: 'slot' }, 'alimento'), U.el('span', { class: 'arrow' }, '→'), U.el('span', { class: 'slot' }, 'consumidor')]));
        status.textContent = timed ? '⏱️ ' + left + ' s  •  Acertos: ' + first : 'Rodada ' + (r + 1) + '/' + rounds.length + '  •  Acertos de primeira: ' + first;
      }
      function choose(i) {
        if (!cur) return;
        const c = cur[i];
        if (c.food) {
          if (!missed) first++;
          answered++;
          const other = cur.find((x) => !x.food);
          fb.textContent = '✔ ' + c.t + ' → ' + other.t + ': ' + other.t.toLowerCase() + ' come ' + c.t.toLowerCase() + '.';
          EN.audio.play('ok'); missed = false; r++;
          if (r >= rounds.length) return end();
          show();
        } else {
          missed = true; EN.audio.play('err');
          fb.textContent = 'Quase! A seta não mostra quem é maior. Ela sai do ALIMENTO e aponta para quem o come.';
        }
      }
      function end() {
        if (iv) clearInterval(iv);
        cur = null;
        const score = timed ? U.clamp(first / 15, 0, 1) : first / rounds.length;
        finish(id, score, timed ? 'Você acertou ' + first + ' pares em 60 segundos.' : 'Acertos de primeira: ' + first + '/' + rounds.length + '.', resolve, m);
      }
      if (timed) iv = setInterval(() => { left--; status.textContent = '⏱️ ' + left + ' s  •  Acertos: ' + first; if (left <= 0) end(); }, 1000);
      show();
    });
  }

  /* ---------------- Coleta Solar ---------------- */
  function solar() {
    return new Promise((resolve) => {
      const GOOD = [['☀️', 'sol', 'Luz do Sol'], ['💧', 'agua', 'Água'], ['⚪', 'co2', 'Gás carbônico']];
      const BAD = [['🍔', 'Lanche não entra na fotossíntese'], ['🧸', 'Brinquedo não entra na fotossíntese'], ['🪨', 'Pedra não entra na fotossíntese']];
      const st = stage('coleta_solar', {});
      const p = { x: 320, y: 220 };
      const items = []; const have = { sol: false, agua: false, co2: false };
      let done = 0, bad = 0, msg = '', msgT = 0, t = 0, o2 = [];
      const spawn = () => { const g = Math.random() < 0.7; const k = g ? U.pick(GOOD) : U.pick(BAD); items.push({ x: U.rand(40, 600), y: U.rand(60, 370), vx: U.rand(-40, 40), vy: U.rand(-40, 40), e: k[0], k: g ? k[1] : null, n: g ? k[2] : k[1] }); };
      for (let i = 0; i < 7; i++) spawn();
      MG._dbg = { p, items, have }; // gancho para testes automáticos
      st.start((dt, keys, ptr) => {
        t += dt;
        moveDir(keys, ptr, p, 230, dt);
        // garante que cada ingrediente que ainda falta exista no campo (ninguém fica travado)
        GOOD.forEach((g) => { if (!have[g[1]] && !items.some((o) => o.k === g[1])) items.push({ x: U.rand(40, 600), y: U.rand(60, 370), vx: U.rand(-40, 40), vy: U.rand(-40, 40), e: g[0], k: g[1], n: g[2] }); });
        items.forEach((o) => { o.x += o.vx * dt; o.y += o.vy * dt; if (o.x < 30 || o.x > 610) o.vx *= -1; if (o.y < 50 || o.y > 380) o.vy *= -1; });
        for (let i = items.length - 1; i >= 0; i--) {
          const o = items[i];
          if (Math.hypot(o.x - p.x, o.y - p.y) < 34) {
            items.splice(i, 1); spawn();
            if (o.k) { if (!have[o.k]) { have[o.k] = true; msg = '+ ' + o.n; EN.audio.play('pickup'); } else msg = 'Você já tem ' + o.n.toLowerCase() + '!'; }
            else { bad++; msg = o.n; EN.audio.play('bad'); const ks = Object.keys(have).filter((k) => have[k]); if (ks.length) have[U.pick(ks)] = false; }
            msgT = 1.3;
          }
        }
        if (have.sol && have.agua && have.co2) { done++; have.sol = have.agua = have.co2 = false; msg = '🌿 Fotossíntese! A planta formou matéria orgânica e liberou gás oxigênio.'; msgT = 2.2; o2.push({ x: p.x, y: p.y, t: 0 }); EN.audio.play('ok'); }
        o2.forEach((b) => { b.t += dt; b.y -= 50 * dt; }); o2 = o2.filter((b) => b.t < 2);
        msgT -= dt;
        st.status.textContent = 'Fotossínteses: ' + done + '/3  •  ☀️' + (have.sol ? '✔' : '…') + '  💧' + (have.agua ? '✔' : '…') + '  ⚪' + (have.co2 ? '✔' : '…') + '  •  Itens errados: ' + bad;
        if (done >= 3) { st.stop(); finish('coleta_solar', U.clamp(1 - bad * 0.12, 0.2, 1), 'Três fotossínteses completas com ' + bad + ' item(ns) errado(s).', resolve, st.m); }
      }, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, '#bfe8ff'); g.addColorStop(1, '#8fd49a');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 640, 400);
        emoji(ctx, '🌱', 320, 380, 40);
        items.forEach((o) => emoji(ctx, o.e, o.x, o.y, 30));
        o2.forEach((b) => { label(ctx, 'gás oxigênio', b.x, b.y - 18, '#dff'); emoji(ctx, '🔵', b.x, b.y, 18); });
        SP.drawCharacter(ctx, p.x, p.y + 20, EN.eco.look(), { dir: 'down', t, moving: true, walk: t * 8 });
        if (msgT > 0) label(ctx, msg, 320, 34, '#2b2d42');
        ctx.font = '12px Nunito'; ctx.fillStyle = '#2b2d42'; ctx.textAlign = 'left'; ctx.fillText('⚪ = gás carbônico', 8, 392);
      });
    });
  }

  /* ---------------- Salve o Lago ---------------- */
  function lago() {
    return new Promise((resolve) => {
      let st;
      const pipes = [{ x: 110, open: false, t: 0 }, { x: 320, open: false, t: 0 }, { x: 530, open: false, t: 0 }];
      let opened = 0, closed = 0;
      const tryClose = (px, py) => { pipes.forEach((pp) => { if (pp.open && Math.hypot(pp.x - px, 40 - py) < 90) { pp.open = false; closed++; EN.audio.play('ok'); msg = 'Cano de nutrientes fechado!'; msgT = 1.2; } }); };
      let msg = '', msgT = 0;
      st = stage('salve_lago', { onAction: () => tryClose(p.x, p.y), onTap: (pt) => tryClose(pt.x, pt.y) });
      const p = { x: 320, y: 250 };
      const fish = [0, 1, 2].map((i) => ({ x: 120 + i * 200, y: 300 - i * 30, vx: 40 * (i % 2 ? -1 : 1) }));
      const bubbles = [];
      let carry = 0, oxy = 30, t = 0, openT = 3;
      MG._dbg = { p, bubbles, fish, pipes, tryClose, carry: () => carry }; // gancho para testes
      st.start((dt, keys, ptr) => {
        t += dt; moveDir(keys, ptr, p, 220, dt);
        if (Math.random() < dt * 1.4 && bubbles.length < 8) bubbles.push({ x: U.rand(40, 600), y: 390, vy: U.rand(-40, -20) });
        bubbles.forEach((b) => { b.y += b.vy * dt; });
        for (let i = bubbles.length - 1; i >= 0; i--) { const b = bubbles[i]; if (b.y < 80) { bubbles.splice(i, 1); continue; } if (carry < 3 && Math.hypot(b.x - p.x, b.y - p.y) < 30) { bubbles.splice(i, 1); carry++; EN.audio.play('pickup'); } }
        fish.forEach((f) => { f.x += f.vx * dt; if (f.x < 40 || f.x > 600) f.vx *= -1; if (carry > 0 && Math.hypot(f.x - p.x, f.y - p.y) < 40) { oxy = Math.min(100, oxy + carry * 5); carry = 0; msg = 'Oxigênio para os peixes!'; msgT = 1; EN.audio.play('coin'); } });
        openT -= dt;
        if (openT <= 0) { openT = U.rand(4, 7); const c = pipes.filter((pp) => !pp.open); if (c.length) { U.pick(c).open = true; opened++; } }
        const nOpen = pipes.filter((pp) => pp.open).length;
        oxy = Math.max(0, oxy - nOpen * 1.6 * dt);
        msgT -= dt;
        st.status.textContent = 'Oxigênio: ' + Math.round(oxy) + '%  •  Bolhas carregadas: ' + carry + '/3  •  Canos abertos: ' + nOpen;
        if (oxy >= 100) { st.stop(); finish('salve_lago', opened ? U.clamp(0.5 + 0.5 * closed / opened, 0, 1) : 1, 'Lago com 100% de oxigênio! Você fechou ' + closed + ' de ' + opened + ' canos de nutrientes.', resolve, st.m); }
      }, (ctx) => {
        const nOpen = pipes.filter((pp) => pp.open).length;
        const k = Math.min(1, nOpen / 3 + (1 - oxy / 100) * 0.5);
        ctx.fillStyle = 'rgb(' + Math.round(63 + 32 * k) + ',' + Math.round(155) + ',' + Math.round(224 - 160 * k) + ')'; ctx.fillRect(0, 0, 640, 400);
        ctx.fillStyle = '#6fbf62'; ctx.fillRect(0, 0, 640, 60);
        pipes.forEach((pp) => { ctx.fillStyle = '#6f7b87'; ctx.fillRect(pp.x - 18, 20, 36, 40); if (pp.open) { ctx.fillStyle = 'rgba(110,160,60,.8)'; ctx.beginPath(); ctx.ellipse(pp.x, 80 + Math.sin(t * 6) * 4, 28, 16, 0, 0, 7); ctx.fill(); label(ctx, 'nutrientes!', pp.x, 16, '#ffe066'); } else emoji(ctx, '✅', pp.x, 40, 18); });
        bubbles.forEach((b) => emoji(ctx, '🫧', b.x, b.y, 22));
        fish.forEach((f) => { ctx.save(); ctx.translate(f.x, f.y); if (f.vx < 0) ctx.scale(-1, 1); emoji(ctx, '🐟', 0, 0, 34); ctx.restore(); });
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(p.x, p.y, 16, 0, 7); ctx.fill(); emoji(ctx, '🤿', p.x, p.y, 20);
        for (let i = 0; i < carry; i++) emoji(ctx, '🫧', p.x - 14 + i * 14, p.y - 26, 14);
        if (msgT > 0) label(ctx, msg, 320, 110, '#fff');
      });
    });
  }

  /* ---------------- Torre dos Níveis ---------------- */
  const TOWERS = [
    [['🌾', 'Capim'], ['🦗', 'Gafanhoto'], ['🐦', 'Ave insetívora'], ['🐍', 'Serpente'], ['🦉', 'Coruja']],
    [['🥕', 'Cenoura'], ['🐇', 'Coelho'], ['🦊', 'Raposa']],
    [['🌽', 'Milho'], ['🐁', 'Rato'], ['🦉', 'Coruja']],
    [['🥥', 'Coquinhos'], ['#cutia', 'Cutia'], ['🐍', 'Jararaca'], ['🦅', 'Harpia']],
    [['🌾', 'Gramíneas'], ['#capivara', 'Capivara'], ['🐆', 'Onça-pintada']]
  ];
  function torre() {
    return new Promise((resolve) => {
      const m = EN.ui.modal({ title: '🎮 Torre dos Níveis', wide: true, cls: 'mg', noClose: true });
      let r = 0, clean = 0, mistakes = 0, built = [];
      const status = U.el('div', { class: 'mg-status' }), tower = U.el('div', { class: 'tower' }), pal = U.el('div', { class: 'org-grid' }), fb = U.el('p', { class: 'sim-note' });
      m.body.appendChild(status); m.body.appendChild(tower); m.body.appendChild(pal); m.body.appendChild(fb);
      function show() {
        const tw = TOWERS[r];
        status.textContent = 'Torre ' + (r + 1) + '/' + TOWERS.length + ' • construa de BAIXO para CIMA';
        tower.innerHTML = '';
        for (let i = tw.length - 1; i >= 0; i--) tower.appendChild(U.el('div', { class: 'floor' + (built[i] ? ' on' : ''), style: { width: (40 + 60 * (tw.length - i) / tw.length) + '%' } }, built[i] ? [EN.learn.icon(built[i][0], 28), U.el('span', null, built[i][1])] : U.el('span', { class: 'tip' }, i === 0 ? 'base' : 'andar ' + (i + 1))));
        pal.innerHTML = '';
        U.shuffle(tw.filter((x) => !built.includes(x))).forEach((x) => { const b = U.el('button', { type: 'button', class: 'org' }, [EN.learn.icon(x[0], 34), U.el('span', null, x[1])]); b.addEventListener('click', () => pick(x)); pal.appendChild(b); });
      }
      let roundMiss = false;
      function pick(x) {
        const tw = TOWERS[r];
        if (tw[built.length] === x) {
          built.push(x); EN.audio.play('pickup'); fb.textContent = built.length === 1 ? 'Base certa: o produtor!' : x[1] + ' come ' + tw[built.length - 2][1].toLowerCase() + '.';
          if (built.length === tw.length) { if (!roundMiss) clean++; r++; built = []; roundMiss = false; EN.audio.play('ok'); if (r >= TOWERS.length) return finish('torre_niveis', clean / TOWERS.length, 'Torres sem erros: ' + clean + '/' + TOWERS.length + '.', resolve, m); }
          show();
        } else { mistakes++; roundMiss = true; EN.audio.play('err'); fb.textContent = built.length === 0 ? 'A base da torre é o PRODUTOR (quem fabrica o próprio alimento).' : 'Quem come ' + tw[built.length - 1][1].toLowerCase() + '? Esse vem no próximo andar.'; }
      }
      show();
    });
  }

  /* ---------------- Corrida dos Biomas ---------------- */
  function corrida() {
    return new Promise((resolve) => {
      const B = [['Cerrado', '🌳', '#e0b84a', 'Árvores baixas, retorcidas e espaçadas; queimadas.'], ['Caatinga', '🌵', '#d8c59a', 'Período seco marcante; plantas perdem folhas.'], ['Mata Atlântica', '🌴', '#2ecc71', 'Floresta úmida perto do litoral.'], ['Amazônia', '🌲', '#1e8449', 'Árvores altas e rios muito largos.'], ['Pantanal', '🐊', '#5dade2', 'Extensas áreas alagáveis.'], ['Pampas', '🌾', '#c5e17a', 'Campos com plantas baixas e horizonte aberto.']];
      const st = stage('corrida_biomas', {});
      const portals = B.map((b, i) => { const a = i / 6 * Math.PI * 2 - Math.PI / 2; return { b, x: 320 + Math.cos(a) * 240, y: 210 + Math.sin(a) * 150 }; });
      const order = U.shuffle(B.map((_, i) => i));
      let k = 0, first = 0, miss = false, p = { x: 320, y: 210 }, t = 0, msg = '', msgT = 0, cool = 0;
      MG._dbg = { portals, clue: () => B[order[k]], go: (x, y) => { p.x = x; p.y = y; } }; // gancho para testes
      st.start((dt, keys, ptr) => {
        t += dt; moveDir(keys, ptr, p, 240, dt); cool -= dt; msgT -= dt;
        const clue = B[order[k]];
        st.status.textContent = 'Pista ' + (k + 1) + '/6: ' + clue[3];
        portals.forEach((pt) => {
          if (cool <= 0 && Math.hypot(pt.x - p.x, pt.y - p.y) < 34) {
            cool = 0.8;
            if (pt.b === clue) { if (!miss) first++; miss = false; k++; msg = '✔ ' + pt.b[0] + '!'; msgT = 1.2; EN.audio.play('ok'); p = { x: 320, y: 210 }; if (k >= 6) { st.stop(); finish('corrida_biomas', first / 6, 'Acertos de primeira: ' + first + '/6.', resolve, st.m); } }
            else { miss = true; msg = 'Não é ' + pt.b[0] + '. Releia a pista!'; msgT = 1.6; EN.audio.play('err'); p = { x: 320, y: 210 }; }
          }
        });
      }, (ctx) => {
        ctx.fillStyle = '#c9c2b5'; ctx.fillRect(0, 0, 640, 400);
        ctx.fillStyle = '#b3ab9c'; ctx.beginPath(); ctx.ellipse(320, 210, 280, 175, 0, 0, 7); ctx.fill();
        portals.forEach((pt) => { ctx.fillStyle = pt.b[2]; ctx.beginPath(); ctx.arc(pt.x, pt.y, 30, 0, 7); ctx.fill(); emoji(ctx, pt.b[1], pt.x, pt.y, 28); label(ctx, pt.b[0], pt.x, pt.y + 48, '#fff'); });
        SP.drawCharacter(ctx, p.x, p.y + 20, EN.eco.look(), { dir: 'down', t, moving: true, walk: t * 8 });
        if (msgT > 0) label(ctx, msg, 320, 30, '#ffe066');
      });
    });
  }

  /* ---------------- finalização comum ---------------- */
  function finish(id, score, text, resolve, m) {
    const r = EN.eco.minigameReward(id, score);
    if (r.coins) EN.eco.award(10, r.coins, MG.names[id]); else EN.eco.award(10, 0, MG.names[id]);
    EN.save.persist('minijogo');
    m.body.innerHTML = '';
    const pct = Math.round(score * 100);
    m.body.appendChild(U.el('div', { class: 'mg-end' }, [U.el('div', { class: 'art big' }, pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '🌱'), U.el('h3', null, 'Pontuação: ' + pct + '%'), U.el('p', null, text), U.el('p', null, 'Recompensa: +10 XP e +' + r.coins + ' 🪙' + (r.limited ? ' (recompensa reduzida: conclua outra missão de aprendizagem para recarregar os prêmios dos minijogos)' : '')), r.trophy ? U.el('p', { class: 'fb good' }, '🏅 Novo troféu: ' + MG.names[id] + '! Ele aparece na Sala de Troféus.') : null]));
    m.setActions([EN.ui.btn('Jogar de novo ↻', '', () => { m.close(); resolve('again'); }), EN.ui.btn('Sair ▶', 'pri', () => { m.close(); resolve('done'); })]);
  }

  /** Abre a introdução e roda o minijogo (com opção de repetir). */
  MG.play = async function (id) {
    if (id === 'jardim') { EN.ui.garden(); return; }
    const intro = INTRO[id];
    const go = await new Promise((res) => {
      const m = EN.ui.modal({ title: intro[1] + ' ' + intro[0], cls: 'small', onClose: () => res(false) });
      m.body.appendChild(U.el('p', { class: 'prompt', html: U.rich(intro[2], { noGloss: true }) }));
      m.body.appendChild(U.el('p', { class: 'tip' }, 'Minijogos dão prêmios pequenos. O que mais rende moedas é aprender nas missões!'));
      m.setActions([EN.ui.btn('Agora não', 'ghost', () => { m.close(); }), EN.ui.btn('Jogar ▶', 'pri', () => { res(true); m.close(); })]);
    });
    if (!go) return;
    const run = { trilha_segura: trilha, corredor_cadeia: () => corredor(false), relampago: () => corredor(true), coleta_solar: solar, salve_lago: lago, torre_niveis: torre, corrida_biomas: corrida }[id];
    let again = 'again';
    while (again === 'again') again = await run();
    EN.ui.hudUpdate(true);
  };

  return MG;
})();
