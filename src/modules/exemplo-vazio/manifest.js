/* =====================================================================
   src/modules/exemplo-vazio/manifest.js — MÓDULO VAZIO DE EXEMPLO.
   Mostra como registrar uma matéria futura sem alterar as existentes.
   Fica desativado (enabled:false): o lançador exibe apenas o espaço
   "Novas missões chegarão", sem inventar matéria, data ou conteúdo.
   Para criar uma missão nova, copie a pasta src/modules/geografia como
   modelo, troque o id/saveKey/conteúdo e ative aqui (enabled:true).
   ===================================================================== */
(function () {
  'use strict';
  GG.registry.register({
    id: 'exemplo_vazio', subject: '', title: 'Novas missões chegarão', version: 0, enabled: false, order: 90, placeholder: true,
    theme: { color: '#4a4f7a', icon: '✨', art: 'placeholder' },
    entry: null, saveKey: 'ecoNexus.exemplo.v1',
    progress() { return { started: false, percent: 0, last: '—', medals: 0 }; }
  });
})();
