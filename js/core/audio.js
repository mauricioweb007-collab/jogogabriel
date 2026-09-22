/* =====================================================================
   core/audio.js — sons suaves sintetizados (Web Audio) e leitura em voz
   alta (Web Speech API, pt-BR). O jogo começa SEM som; o jogador ativa.
   Nenhum arquivo de áudio externo é usado.
   ===================================================================== */
EN.audio = (function () {
  'use strict';
  const A = {};
  let ctx = null;
  A.enabled = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  /** Toca uma nota curta e suave. */
  function tone(freq, dur, type, vol, when) {
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime + (when || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.06, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  const SFX = {
    click: () => tone(660, 0.08, 'sine', 0.035),
    ok: () => { tone(523, 0.14, 'triangle', 0.05); tone(659, 0.14, 'triangle', 0.05, 0.1); tone(784, 0.22, 'triangle', 0.05, 0.2); },
    err: () => { tone(330, 0.16, 'sine', 0.04); tone(294, 0.2, 'sine', 0.035, 0.12); },
    coin: () => { tone(988, 0.08, 'square', 0.02); tone(1319, 0.14, 'square', 0.02, 0.07); },
    open: () => { tone(392, 0.1, 'triangle', 0.04); tone(523, 0.16, 'triangle', 0.04, 0.08); },
    step: () => tone(180, 0.04, 'sine', 0.012),
    levelup: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.05, i * 0.1)); },
    pickup: () => { tone(880, 0.07, 'sine', 0.04); tone(1175, 0.1, 'sine', 0.04, 0.06); },
    portal: () => { [300, 400, 500, 650].forEach((f, i) => tone(f, 0.2, 'sine', 0.03, i * 0.06)); },
    bad: () => tone(220, 0.12, 'sine', 0.03)
  };

  A.play = function (name) {
    if (!A.enabled) return;
    try { (SFX[name] || SFX.click)(); } catch (e) { /* som é opcional */ }
  };

  A.setEnabled = function (on) {
    A.enabled = !!on;
    if (on) { ensure(); A.play('open'); }
  };

  /* ---------------- Leitura em voz alta ---------------- */
  A.ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
  let voice = null;
  function chooseVoice() {
    if (!A.ttsSupported) return;
    const vs = window.speechSynthesis.getVoices() || [];
    voice = vs.find((v) => /pt[-_]BR/i.test(v.lang)) || vs.find((v) => /^pt/i.test(v.lang)) || null;
  }
  if (A.ttsSupported) {
    chooseVoice();
    try { window.speechSynthesis.onvoiceschanged = chooseVoice; } catch (e) { /* ignora */ }
  }

  A.speak = function (text) {
    if (!A.ttsSupported) return false;
    try {
      window.speechSynthesis.cancel();
      const clean = EN.util.strip(text).replace(/→/g, ' para ').replace(/[🌿💧☀️⭐🪙]/gu, '');
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'pt-BR';
      if (voice) u.voice = voice;
      u.rate = 0.95; u.pitch = 1.05;
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  };
  A.stopSpeech = function () {
    if (A.ttsSupported) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignora */ } }
  };

  return A;
})();
