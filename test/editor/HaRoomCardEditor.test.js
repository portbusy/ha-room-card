import { describe, it, expect } from 'vitest';
import '../../src/editor/HaRoomCardEditor.js';

const BASE_CONFIG = {
  type: 'custom:ha-room-card',
  name: 'Cucina',
  accent: '#4E8062',
  icon: 'mdi:silverware-fork-knife',
  sensors: [],
  chips: [],
};

function makeEditor(config = BASE_CONFIG) {
  const el = document.createElement('ha-room-card-editor');
  el.setConfig(config);
  document.body.appendChild(el);
  return el;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('HaRoomCardEditor — struttura', () => {
  it('crea 4 pannelli ha-expansion-panel', () => {
    const el = makeEditor();
    expect(el.shadowRoot.querySelectorAll('ha-expansion-panel').length).toBe(4);
  });

  it('il pannello Generale è espanso di default', () => {
    const el = makeEditor();
    const panels = el.shadowRoot.querySelectorAll('ha-expansion-panel');
    expect(panels[0].expanded).toBe(true);
  });

  it('contiene la sezione generale', () => {
    const el = makeEditor();
    expect(el.shadowRoot.querySelector('ha-room-card-editor-general')).not.toBeNull();
  });

  it('contiene la sezione sensori', () => {
    const el = makeEditor();
    expect(el.shadowRoot.querySelector('ha-room-card-editor-sensors')).not.toBeNull();
  });

  it('contiene la sezione chip', () => {
    const el = makeEditor();
    expect(el.shadowRoot.querySelector('ha-room-card-editor-chips')).not.toBeNull();
  });

  it('contiene la sezione visibilità', () => {
    const el = makeEditor();
    expect(el.shadowRoot.querySelector('ha-room-card-editor-visibility')).not.toBeNull();
  });
});

describe('HaRoomCardEditor — propagazione config', () => {
  it('emette config-changed quando la sezione generale cambia', () => {
    const el = makeEditor();
    let fired = null;
    el.addEventListener('config-changed', e => { fired = e.detail.config; });

    el.shadowRoot.querySelector('ha-room-card-editor-general').dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: { ...BASE_CONFIG, name: 'Soggiorno' } },
        bubbles: true,
        composed: true,
      })
    );

    expect(fired?.name).toBe('Soggiorno');
  });

  it('emette config-changed quando la sezione sensori cambia', () => {
    const el = makeEditor();
    let fired = null;
    el.addEventListener('config-changed', e => { fired = e.detail.config; });

    el.shadowRoot.querySelector('ha-room-card-editor-sensors').dispatchEvent(
      new CustomEvent('sensors-changed', {
        detail: { sensors: [{ type: 'presenza', entity: 'binary_sensor.motion' }] },
        bubbles: true,
        composed: true,
      })
    );

    expect(fired?.sensors?.[0].entity).toBe('binary_sensor.motion');
  });

  it('emette config-changed quando la sezione chip cambia', () => {
    const el = makeEditor();
    let fired = null;
    el.addEventListener('config-changed', e => { fired = e.detail.config; });

    el.shadowRoot.querySelector('ha-room-card-editor-chips').dispatchEvent(
      new CustomEvent('chips-changed', {
        detail: { chips: [{ type: 'light', entity: 'light.kitchen', name: 'Luce' }] },
        bubbles: true,
        composed: true,
      })
    );

    expect(fired?.chips?.[0].entity).toBe('light.kitchen');
  });

  it('emette config-changed quando la visibilità cambia', () => {
    const el = makeEditor();
    let fired = null;
    el.addEventListener('config-changed', e => { fired = e.detail.config; });

    el.shadowRoot.querySelector('ha-room-card-editor-visibility').dispatchEvent(
      new CustomEvent('conditions-changed', {
        detail: { conditions: [{ condition: 'state', entity: 'input_boolean.show', state: 'on' }] },
        bubbles: true,
        composed: true,
      })
    );

    expect(fired?.visibility?.[0].entity).toBe('input_boolean.show');
  });
});

describe('HaRoomCardEditor — stato espansione persistente', () => {
  it('mantiene i pannelli espansi/collassati attraverso setConfig', () => {
    const el = makeEditor();
    const panels = el.shadowRoot.querySelectorAll('ha-expansion-panel');

    // Simula apertura del pannello Sensori (indice 1)
    panels[1].dispatchEvent(new CustomEvent('expanded-changed', {
      detail: { value: true },
      bubbles: false,
    }));

    // setConfig viene chiamato da HA dopo config-changed
    el.setConfig({ ...BASE_CONFIG, name: 'Aggiornato' });

    const newPanels = el.shadowRoot.querySelectorAll('ha-expansion-panel');
    expect(newPanels[1].expanded).toBe(true);
  });
});

describe('HaRoomCardEditor — hass', () => {
  it('propaga hass alle sezioni figlie', () => {
    const el = makeEditor();
    const mockHass = { states: {} };
    el.hass = mockHass;

    expect(el.shadowRoot.querySelector('ha-room-card-editor-general').hass).toBe(mockHass);
    expect(el.shadowRoot.querySelector('ha-room-card-editor-sensors').hass).toBe(mockHass);
    expect(el.shadowRoot.querySelector('ha-room-card-editor-chips').hass).toBe(mockHass);
  });
});
