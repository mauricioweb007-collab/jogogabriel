/* =====================================================================
   src/modules/registry.js — REGISTRO CENTRAL DE MÓDULOS (matérias).
   Cada matéria é uma missão independente com pasta própria em
   src/modules/<nome>/ e um manifest.js que chama GG.registry.register().
   Para acrescentar uma matéria futura: criar a pasta do módulo e
   adicionar UMA linha em src/modules/modulos.js. Não é preciso editar
   módulos anteriores.
   Campos de cada módulo:
     id, subject, title, version, enabled, order, theme{color,icon,art},
     entry (página a abrir, relativa à raiz), reviewEntry, saveKey,
     progress() → {started, percent, last, medals, medalsLabel}
   ===================================================================== */
(function () {
  'use strict';
  const GG = (window.GG = window.GG || {});
  const REG = (GG.registry = { list: [] });
  REG.register = function (m) {
    if (!m || !m.id) throw new Error('Módulo sem id');
    if (REG.list.some((x) => x.id === m.id)) throw new Error('Módulo repetido: ' + m.id);
    REG.list.push(m);
    REG.list.sort((a, b) => (a.order || 99) - (b.order || 99));
    return m;
  };
  REG.get = (id) => REG.list.find((m) => m.id === id);
  REG.enabled = () => REG.list.filter((m) => m.enabled);
})();
