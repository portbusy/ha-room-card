import { describe, it, expect, beforeEach } from 'vitest';
import '../../../src/editor/items/SensorItem.js';

function makeItem(config, hass = null) {
  const el = document.createElement('ha-room-card-editor-sensor-item');
  if (hass) el.hass = hass;
  el.config = config;
  document.body.appendChild(el);
  return el;
}

function selectors(el) {
  return Array.from(el.shadowRoot.querySelectorAll('ha-selector'));
}

function selectorByLabel(el, label) {
  return selectors(el).find(s => s.label === label);
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('SensorItem — tipo semplice (presenza)', () => {
  it('crea ha-selector per tipo e entità', () => {
    const el = makeItem({ type: 'presenza', entity: 'binary_sensor.motion' });
    const labels = selectors(el).map(s => s.label);
    expect(labels).toContain('Tipo');
    expect(labels).toContain('Entità');
  });

  it('imposta il valore corretto sul selector tipo', () => {
    const el = makeItem({ type: 'presenza', entity: 'binary_sensor.motion' });
    const tipoSel = selectorByLabel(el, 'Tipo');
    expect(tipoSel.value).toBe('presenza');
  });

  it('imposta il valore corretto sul selector entità', () => {
    const el = makeItem({ type: 'presenza', entity: 'binary_sensor.motion' });
    const entitySel = selectorByLabel(el, 'Entità');
    expect(entitySel.value).toBe('binary_sensor.motion');
  });

  it('non mostra campi extra per tipi semplici', () => {
    const el = makeItem({ type: 'presenza', entity: 'binary_sensor.motion' });
    const labels = selectors(el).map(s => s.label);
    expect(labels).not.toContain('Icona (attivo)');
    expect(labels).not.toContain('Trigger');
  });
});

describe('SensorItem — tipo extra', () => {
  it('mostra campi aggiuntivi per tipo extra', () => {
    const el = makeItem({ type: 'extra', entity: 'switch.boiler' });
    const labels = selectors(el).map(s => s.label);
    expect(labels).toContain('Icona (attivo)');
    expect(labels).toContain('Icona (inattivo, vuoto = nascosto)');
    expect(labels).toContain('Colore (attivo)');
    expect(labels).toContain('Trigger');
  });

  it('non mostra campi numerici se trigger è state', () => {
    const el = makeItem({ type: 'extra', entity: 'switch.boiler', trigger: 'state' });
    const labels = selectors(el).map(s => s.label);
    expect(labels).not.toContain('Entità numerica');
    expect(labels).not.toContain('Sopra (soglia)');
  });

  it('mostra campi numerici se trigger è numeric', () => {
    const el = makeItem({ type: 'extra', entity: 'switch.boiler', trigger: 'numeric' });
    const labels = selectors(el).map(s => s.label);
    expect(labels).toContain('Entità numerica');
    expect(labels).toContain('Sopra (soglia)');
    expect(labels).toContain('Sotto (soglia)');
  });
});

describe('SensorItem — eventi', () => {
  it('emette config-changed quando cambia il valore di un selector', () => {
    const el = makeItem({ type: 'presenza', entity: '' });
    let fired = null;
    el.addEventListener('config-changed', e => { fired = e.detail.config; });

    const entitySel = selectorByLabel(el, 'Entità');
    entitySel.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: 'binary_sensor.motion' },
      bubbles: true,
    }));

    expect(fired).not.toBeNull();
    expect(fired.entity).toBe('binary_sensor.motion');
  });

  it('ri-renderizza e mostra campi extra quando il tipo cambia a extra', () => {
    const el = makeItem({ type: 'presenza', entity: 'binary_sensor.motion' });

    const tipoSel = selectorByLabel(el, 'Tipo');
    tipoSel.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: 'extra' },
      bubbles: true,
    }));

    const labels = selectors(el).map(s => s.label);
    expect(labels).toContain('Icona (attivo)');
  });

  it('imposta hass su tutti i selector', () => {
    const mockHass = { states: {} };
    const el = makeItem({ type: 'presenza', entity: '' });
    el.hass = mockHass;
    selectors(el).forEach(sel => {
      expect(sel.hass).toBe(mockHass);
    });
  });
});
