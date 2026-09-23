/* =====================================================================
   src/core/audio.js — efeitos sonoros e músicas chiptune ORIGINAIS
   sintetizados com WebAudio (sem arquivos de áudio de terceiros) e
   leitura em voz alta pt-BR (Web Speech). Nenhum som toca antes de uma
   interação do usuário. Volumes separados: música, efeitos e voz.
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const A = (GG.audio = {});
  let ctx = null, master = null, musG = null, sfxG = null;
  A.vol = { music: 0.5, sfx: 0.7, voice: 0.9 };
  A.unlocked = false;

  /** Cria o contexto de áudio (só depois de um clique/toque/tecla). */
  A.unlock = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      musG = ctx.createGain(); musG.connect(master); sfxG = ctx.createGain(); sfxG.connect(master);
      A.setVolumes(A.vol);
      A.unlocked = true;
      if (pendingSong) { const s = pendingSong; pendingSong = null; A.music(s); }
    } catch (e) { ctx = null; }
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, () => A.unlock(), { passive: true }));

  A.setVolumes = function (v) {
    Object.assign(A.vol, v || {});
    if (musG) musG.gain.value = A.vol.music * 0.32;
    if (sfxG) sfxG.gain.value = A.vol.sfx * 0.55;
  };

  function tone(freq, t0, dur, type, gainNode, vol, slideTo) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(gainNode); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  let noiseBuf = null;
  function noise(t0, dur, vol, gainNode, hp) {
    if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp || 1200;
    g.gain.setValueAtTime(vol || 0.2, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(gainNode); s.start(t0); s.stop(t0 + dur + 0.02);
  }

  /* ------------------------------------------------------------ efeitos */
  const SFX = {
    jump: (t) => tone(330, t, 0.16, 'square', sfxG, 0.25, 660),
    coin: (t) => { tone(988, t, 0.07, 'square', sfxG, 0.2); tone(1319, t + 0.07, 0.16, 'square', sfxG, 0.2); },
    frag: (t) => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, t + i * 0.06, 0.12, 'triangle', sfxG, 0.28)); },
    hit: (t) => { tone(220, t, 0.2, 'sawtooth', sfxG, 0.25, 80); noise(t, 0.12, 0.2, sfxG, 600); },
    stomp: (t) => { tone(180, t, 0.12, 'square', sfxG, 0.3, 90); noise(t, 0.08, 0.15, sfxG); },
    shoot: (t) => tone(880, t, 0.09, 'square', sfxG, 0.14, 1760),
    boom: (t) => { noise(t, 0.35, 0.35, sfxG, 200); tone(120, t, 0.3, 'triangle', sfxG, 0.3, 40); },
    ok: (t) => { [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.08, 0.18, 'square', sfxG, 0.2)); },
    bad: (t) => { tone(330, t, 0.16, 'triangle', sfxG, 0.25); tone(262, t + 0.16, 0.26, 'triangle', sfxG, 0.25); },
    click: (t) => tone(1200, t, 0.04, 'square', sfxG, 0.1),
    power: (t) => { for (let i = 0; i < 6; i++) tone(440 + i * 120, t + i * 0.05, 0.1, 'square', sfxG, 0.16); },
    check: (t) => { tone(660, t, 0.1, 'triangle', sfxG, 0.3); tone(880, t + 0.1, 0.2, 'triangle', sfxG, 0.3); },
    spring: (t) => tone(260, t, 0.3, 'triangle', sfxG, 0.35, 1040),
    shield: (t) => { noise(t, 0.5, 0.3, sfxG, 2400); [1568, 1319, 1047, 784].forEach((f, i) => tone(f, t + i * 0.07, 0.2, 'square', sfxG, 0.18)); },
    win: (t) => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.11, 0.2, 'square', sfxG, 0.22)); },
    boost: (t) => { tone(200, t, 0.4, 'sawtooth', sfxG, 0.18, 1200); noise(t, 0.3, 0.1, sfxG, 3000); },
    drum: (t) => { tone(140, t, 0.16, 'sine', sfxG, 0.6, 50); },
    clap: (t) => noise(t, 0.08, 0.35, sfxG, 1500),
    shaker: (t) => noise(t, 0.05, 0.22, sfxG, 5000),
    bell: (t) => { tone(1047, t, 0.35, 'triangle', sfxG, 0.25); tone(2093, t, 0.2, 'sine', sfxG, 0.08); },
    string: (t) => { tone(196, t, 0.3, 'sawtooth', sfxG, 0.18, 190); }
  };
  A.sfx = function (name) {
    if (!ctx || !SFX[name] || A.vol.sfx <= 0) return;
    try { SFX[name](ctx.currentTime + 0.005); } catch (e) { /* ignora */ }
  };

  /* ------------------------------------------------------------ músicas originais */
  const N = {}; // nome da nota -> frequência
  ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].forEach((n, i) => { for (let o = 1; o <= 7; o++) N[n + o] = 440 * Math.pow(2, (i - 9 + (o - 4) * 12) / 12); });
  /** Cada música: bpm, lead (colcheias), bass, drums ("k" bumbo, "s" caixa, "h" chimbal). Composições próprias. */
  const SONGS = {
    atlas: { bpm: 104, wave: 'triangle', lead: 'E5 - G5 A5 - G5 E5 - D5 - E5 G5 - - - - C5 - D5 E5 - G5 A5 - G5 - E5 D5 - - - -', bass: 'C3 - - - G2 - - - A2 - - - F2 - - - C3 - - - G2 - - - F2 - - - G2 - - -', drums: 'k - h - s - h - k - h - s - h h' },
    festa: { bpm: 132, wave: 'square', lead: 'C5 E5 G5 E5 A5 G5 E5 - D5 F5 A5 F5 G5 - - - E5 G5 C6 G5 A5 G5 E5 C5 D5 E5 D5 C5 D5 - - -', bass: 'C3 - C3 - A2 - A2 - F2 - F2 - G2 - G2 - C3 - C3 - A2 - A2 - F2 - G2 - C3 - - -', drums: 'k h s h k k s h' },
    oceano: { bpm: 92, wave: 'triangle', lead: 'A4 - C5 - E5 - D5 - C5 - A4 - G4 - - - A4 - C5 - E5 - G5 - E5 - D5 - C5 - - -', bass: 'A2 - - - - - - - F2 - - - - - - - C3 - - - - - - - G2 - - - - - - -', drums: 'k - - h - - s - - h - -' },
    corrida: { bpm: 150, wave: 'square', lead: 'E5 E5 G5 E5 A5 G5 E5 D5 C5 D5 E5 G5 A5 - G5 - E5 E5 G5 E5 C6 A5 G5 E5 D5 E5 D5 C5 D5 - - -', bass: 'A2 A2 A3 A2 G2 G2 G3 G2 F2 F2 F3 F2 G2 G2 G3 G2', drums: 'k h s h k h s s' },
    labirinto: { bpm: 120, wave: 'square', lead: 'C5 - D#5 - G5 - D#5 - F5 - D5 - A#4 - - - C5 - D#5 - G5 - C6 - A#5 - G5 - F5 - - -', bass: 'C3 C3 - C3 G#2 G#2 - G#2 A#2 A#2 - A#2 G2 G2 - G2', drums: 'k h h s k h s h' },
    cordel: { bpm: 112, wave: 'square', lead: 'D5 - D5 E5 F#5 - A5 - G5 F#5 E5 - D5 - - - E5 - F#5 G5 A5 - B5 A5 G5 F#5 E5 - D5 - - -', bass: 'D3 - A2 - D3 - A2 - G2 - D3 - A2 - D3 -', drums: 'k - s k - k s -' },
    cidade: { bpm: 116, wave: 'square', lead: 'G4 B4 D5 B4 C5 E5 G5 E5 A4 C5 E5 C5 D5 - - - G4 B4 D5 G5 E5 C5 A4 C5 B4 D5 B4 G4 A4 - - -', bass: 'G2 - G2 - C3 - C3 - A2 - A2 - D3 - D3 -', drums: 'k h s h k h s h' },
    torre: { bpm: 124, wave: 'triangle', lead: 'C5 D5 E5 G5 E5 D5 C5 - D5 E5 F5 A5 G5 F5 E5 - E5 F5 G5 C6 B5 A5 G5 - F5 E5 D5 C5 D5 - - -', bass: 'C3 - E3 - F3 - G3 - A2 - C3 - D3 - G2 -', drums: 'k h s h k k s h' },
    chefe: { bpm: 140, wave: 'sawtooth', lead: 'A4 A4 C5 A4 D5 C5 A4 G4 A4 A4 C5 E5 D5 C5 A4 - F4 F4 A4 F4 C5 A4 F4 E4 G4 G4 B4 D5 E5 - - -', bass: 'A2 A2 A2 A2 A2 A2 A2 A2 F2 F2 F2 F2 G2 G2 E2 E2', drums: 'k h s h k k s s' },
    calma: { bpm: 72, wave: 'triangle', lead: 'E4 - - - G4 - - - A4 - - - G4 - - - E4 - - - D4 - - - E4 - - - - - - -', bass: 'A2 - - - - - - - C3 - - - - - - - A2 - - - - - - - E2 - - - - - - -', drums: '- - - - - - - -' },
    vitoria: { bpm: 128, wave: 'square', lead: 'C5 E5 G5 C6 - G5 C6 - - - E5 G5 C6 E6 - - - -', bass: 'C3 - - - G2 - - - C3 - - - - - - -', drums: 'k - s - k - s s' }
  };
  let pendingSong = null, curSong = null, timer = null, step = 0, nextT = 0;
  A.music = function (name) {
    if (!name) { A.stopMusic(); return; }
    if (!ctx) { pendingSong = name; return; }
    if (curSong === name && timer) return;
    A.stopMusic(); curSong = name; step = 0; nextT = ctx.currentTime + 0.08;
    const S = SONGS[name]; if (!S) return;
    const lead = S.lead.split(/\s+/), bass = S.bass.split(/\s+/), drums = S.drums.split(/\s+/);
    const dt = 60 / S.bpm / 2;
    timer = setInterval(() => {
      if (!ctx || A.vol.music <= 0) return;
      while (nextT < ctx.currentTime + 0.25) {
        const l = lead[step % lead.length], b = bass[step % bass.length], d = drums[step % drums.length];
        if (l && l !== '-' && N[l]) tone(N[l], nextT, dt * 0.9, S.wave, musG, 0.16);
        if (b && b !== '-' && N[b]) tone(N[b], nextT, dt * 1.6, 'triangle', musG, 0.3);
        if (d === 'k') tone(110, nextT, 0.12, 'sine', musG, 0.5, 45);
        else if (d === 's') noise(nextT, 0.1, 0.18, musG, 1800);
        else if (d === 'h') noise(nextT, 0.03, 0.08, musG, 6000);
        nextT += dt; step++;
      }
    }, 60);
  };
  A.stopMusic = function () { if (timer) clearInterval(timer); timer = null; curSong = null; };
  A.current = () => curSong;
  /** Toca uma nota isolada (jogo de ritmo). */
  A.note = function (name, dur, wave) { if (ctx && N[name]) tone(N[name], ctx.currentTime + 0.005, dur || 0.2, wave || 'square', sfxG, 0.2); };
  A.time = () => (ctx ? ctx.currentTime : performance.now() / 1000);

  /* ------------------------------------------------------------ voz (TTS) */
  const TTS = (GG.tts = {});
  let last = '';
  TTS.supported = () => 'speechSynthesis' in window;
  TTS.voice = function () {
    if (!TTS.supported()) return null;
    const vs = speechSynthesis.getVoices();
    return vs.find((v) => /pt[-_]BR/i.test(v.lang)) || vs.find((v) => /^pt/i.test(v.lang)) || null;
  };
  TTS.speak = function (text) {
    if (!TTS.supported()) return false;
    const t = String(text || '').replace(/\*\*/g, '').replace(/[🎯🧭✨⭐🏅🪙]/gu, '').trim();
    if (!t) return false;
    last = t;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = 'pt-BR'; u.rate = 0.95; u.volume = A.vol.voice;
      const v = TTS.voice(); if (v) u.voice = v;
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  };
  TTS.repeat = () => TTS.speak(last);
  TTS.stop = function () { try { if (TTS.supported()) speechSynthesis.cancel(); } catch (e) { /* ok */ } };
  TTS.last = () => last;
})();
