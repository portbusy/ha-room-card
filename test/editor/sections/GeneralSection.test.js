import { describe, it, expect } from 'vitest';
import '../../../src/editor/sections/GeneralSection.js';

function makeSection(config) {
  const el = document.createElement('ha-room-card-editor-general');
  el.config = config;
  document.body.appendChild(el);
  return el;
}

function selectorByLabel(el, label) {
  return Array.from(el.shadowRoot.querySelectorAll('ha-selector')).find(s => s.label === label);
}

afterEach(() => { document.body.innerHTML = ''; });

describe('GeneralSection — campi presenti', () => {
  it('mostra selector per nome, icona, accento, tap_action, hold_action', () => {
    const el = makeSection({ name: 'Cucina', icon: 'mdi:home', accent: '#4E8062' });
    const labels = Array.from(el.shadowRoot.querySelectorAll('ha-selector')).map(s => s.label);
    expect(labels).toContain('Nome stanza');
    expect(labels).toContain('Icona');
    expect(labels).toContain('Colore accento');
    expect(labels).toContain('Azione al tap');
    expect(labels).toContain('Azione al hold');
  });
});

describe('GeneralSection — valori iniziali', () => {
  it('nome selector ha il valore del config', () => {
    const el = makeSection({ name: 'Cucina', icon: 'mdi:home', accent: '#4E8062' });
    expect(selectorByLabel(el, 'Nome stanza').value).toBe('Cucina');
  });

  it('icona selector ha il valore del config', () => {
    const el = makeSection({ name: 'Cucina', icon: 'mdi:home', accent: '#4E8062' });
    expect(selectorByLabel(el, 'Icona').value).toBe('mdi:home');
  });

  it('colore accento converte hex in rgb', () => {
    const el = makeSection({ name: 'Cucina', icon: 'mdi:home', accent: '#4E8062' });
    expect(selectorByLabel(el, 'Colore accento').value).toEqual([78, 128, 98]);
  });
});

describe('GeneralSection — eventi', () => {
  it('emette config-changed con nome aggiornato', () => {
    const el = makeSection({ name: 'Cucina', icon: 'mdi:home', accent: '#4E8062' });
    let fired = null;
    el.addEventListener('config-changed', e => { fired = e.detail.config; });

    selectorByLabel(el, 'Nome stanza').dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: 'Soggiorno' },
      bubbles: true,
    }));

    expect(fired?.name).toBe('Soggiorno');
  });

  it('converte rgb → hex nel config quando cambia il colore', () => {
    const el = makeSection({ name: 'Cucina', icon: 'mdi:home', accent: '#4E8062' });
    let fired = null;
    el.addEventListener('config-changed', e => { fired = e.detail.config; });

    selectorByLabel(el, 'Colore accento').dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: [78, 128, 98] },
      bubbles: true,
    }));

    expect(fired?.accent).toBe('#4e8062');
  });
});
