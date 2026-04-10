import { describe, it, expect } from 'vitest';
import '../../../src/editor/items/ChipItem.js';

function makeItem(config) {
  const el = document.createElement('ha-room-card-editor-chip-item');
  el.config = config;
  document.body.appendChild(el);
  return el;
}

function labels(el) {
  return Array.from(el.shadowRoot.querySelectorAll('ha-selector')).map(s => s.label);
}

function selectorByLabel(el, label) {
  return Array.from(el.shadowRoot.querySelectorAll('ha-selector')).find(s => s.label === label);
}

afterEach(() => { document.body.innerHTML = ''; });

describe('ChipItem — campi comuni', () => {
  it('mostra tipo, entità e nome per tutti i tipi', () => {
    ['light', 'cover', 'sensor', 'climate', 'switch', 'action', 'plant'].forEach(type => {
      const el = makeItem({ type, entity: 'light.test', name: 'Test' });
      const l = labels(el);
      expect(l).toContain('Tipo');
      expect(l).toContain('Entità');
      expect(l).toContain('Etichetta');
      document.body.innerHTML = '';
    });
  });
});

describe('ChipItem — light e cover e climate', () => {
  it('non mostra campi extra per light', () => {
    const el = makeItem({ type: 'light', entity: 'light.test', name: 'Luce' });
    expect(labels(el)).not.toContain('Icona');
    expect(labels(el)).not.toContain('Colore (attivo)');
  });
});

describe('ChipItem — switch', () => {
  it('mostra icona e colore per switch', () => {
    const el = makeItem({ type: 'switch', entity: 'switch.boiler', name: 'Boiler' });
    const l = labels(el);
    expect(l).toContain('Icona');
    expect(l).toContain('Colore (attivo)');
  });

  it('non mostra azioni per switch', () => {
    const el = makeItem({ type: 'switch', entity: 'switch.boiler', name: 'Boiler' });
    expect(labels(el)).not.toContain('Azione al tap');
  });
});

describe('ChipItem — sensor', () => {
  it('mostra icon_on, icon_off, color_on, color_off', () => {
    const el = makeItem({ type: 'sensor', entity: 'binary_sensor.window', name: 'Finestra' });
    const l = labels(el);
    expect(l).toContain('Icona (attivo)');
    expect(l).toContain('Icona (inattivo)');
    expect(l).toContain('Colore (attivo)');
    expect(l).toContain('Colore (inattivo)');
  });
});

describe('ChipItem — action', () => {
  it('mostra icona, colore e azioni per action', () => {
    const el = makeItem({ type: 'action', entity: 'vacuum.robot', name: 'Robot' });
    const l = labels(el);
    expect(l).toContain('Icona');
    expect(l).toContain('Colore (attivo)');
    expect(l).toContain('Azione al tap');
    expect(l).toContain('Azione al hold');
  });
});

describe('ChipItem — plant', () => {
  it('mostra solo tap_action per plant', () => {
    const el = makeItem({ type: 'plant', entity: 'plant.basil', name: 'Basilico' });
    const l = labels(el);
    expect(l).toContain('Azione al tap');
    expect(l).not.toContain('Azione al hold');
    expect(l).not.toContain('Icona');
  });
});

describe('ChipItem — eventi', () => {
  it('emette config-changed al cambio valore', () => {
    const el = makeItem({ type: 'light', entity: '', name: '' });
    let fired = null;
    el.addEventListener('config-changed', e => { fired = e.detail.config; });

    selectorByLabel(el, 'Entità').dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: 'light.kitchen' },
      bubbles: true,
    }));

    expect(fired?.entity).toBe('light.kitchen');
  });

  it('ri-renderizza al cambio tipo', () => {
    const el = makeItem({ type: 'light', entity: 'light.test', name: 'Test' });
    selectorByLabel(el, 'Tipo').dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: 'action' },
      bubbles: true,
    }));
    expect(labels(el)).toContain('Azione al tap');
  });
});
