/* =====================================================================
   src/modules/ciencias-legacy-adapter/manifest.js
   ADAPTADOR SOMENTE DE LEITURA para o módulo legado de Ciências.
   - O jogo de Ciências continua em /index.html, /css, /js, /docs, /tools
     exatamente como na versão 1.0 (congelado; nenhum arquivo alterado).
   - Este adaptador apenas aponta para a entrada antiga e LÊ o save
     "econexus_guardioes_save_v1" para mostrar o progresso no lançador.
     Ele nunca grava, migra, reformata ou apaga esse save.
   ===================================================================== */
(function () {
  'use strict';
  const KEY = 'econexus_guardioes_save_v1';
  const MAPS = { vila: 'Vila EcoNexus', loja: 'Loja do Guardião', casa: 'Casa de Lumi', r1: 'Trilha dos Animais Livres', r2: 'Vale das Cadeias Alimentares', r3: 'Laboratório dos Ciclos', r4: 'Lago Esverdeado', r5: 'Torre da Energia e dos Ecossistemas', r6: 'Portal dos Biomas Brasileiros', arena: 'Arena da Restauração' };
  function readOnly() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  GG.registry.register({
    id: 'ciencias_v1', subject: 'Ciências', title: 'Missão EcoNexus', subtitle: 'Guardiões dos Biomas', version: 1, enabled: true, order: 1, legacy: true,
    theme: { color: '#2f9e5b', icon: '🔬', art: 'ciencias' },
    entry: 'index.html', entryAlt: 'ciencias.html',
    saveKey: KEY,
    reviewTip: 'A Revisão de Ciências fica no Menu (☰) do próprio jogo, depois de restaurar os cristais.',
    progress() {
      const S = readOnly();
      if (!S) return { started: false, percent: 0, last: '—', medals: 0, medalsLabel: 'cristais' };
      const q = S.q || {}; const ids = Object.keys(q); const done = ids.filter((k) => q[k] && q[k].done).length;
      return {
        started: true, name: S.name,
        percent: ids.length ? Math.round(done / ids.length * 100) : 0,
        last: (S.map && MAPS[S.map]) || '—',
        medals: (S.crystals || []).length, medalsLabel: 'cristais', extra: (S.medals || []).length + ' medalhas',
        done: !!S.storyDone
      };
    }
  });
})();
