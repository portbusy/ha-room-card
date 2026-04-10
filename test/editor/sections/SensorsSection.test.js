import { describe, it, expect } from 'vitest';
import '../../../src/editor/sections/SensorsSection.js';
import '../../../src/editor/items/SensorItem.js';

function makeSection(sensors = []) {
  const el = document.createElement('ha-room-card-editor-sensors');
  el.sensors = sensors;
  document.body.appendChild(el);
  return el;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('SensorsSection — rendering', () => {
  it('rende tanti item quanti sono i sensori', () => {
    const el = makeSection([
      { type: 'presenza', entity: 'binary_sensor.a' },
      { type: 'temperatura', entity: 'sensor.b' },
    ]);
    expect(el.shadowRoot.querySelectorAll('.sortable-item').length).toBe(2);
  });

  it('mostra il label riepilogativo per ogni sensore', () => {
    const el = makeSection([{ type: 'presenza', entity: 'binary_sensor.motion' }]);
    expect(el.shadowRoot.textContent).toContain('presenza');
    expect(el.shadowRoot.textContent).toContain('binary_sensor.motion');
  });

  it('rende pulsante aggiungi', () => {
    const el = makeSection([]);
    expect(el.shadowRoot.querySelector('.add-btn')).not.toBeNull();
  });
});

describe('SensorsSection — aggiunta sensore', () => {
  it('emette sensors-changed con nuovo sensore quando si clicca aggiungi', () => {
    const el = makeSection([]);
    let fired = null;
    el.addEventListener('sensors-changed', e => { fired = e.detail.sensors; });

    el.shadowRoot.querySelector('.add-btn').click();

    expect(fired).not.toBeNull();
    expect(fired.length).toBe(1);
    expect(fired[0].type).toBe('presenza');
  });
});

describe('SensorsSection — rimozione sensore', () => {
  it('emette sensors-changed senza il sensore rimosso', () => {
    const el = makeSection([
      { type: 'presenza', entity: 'binary_sensor.a' },
      { type: 'temperatura', entity: 'sensor.b' },
    ]);
    let fired = null;
    el.addEventListener('sensors-changed', e => { fired = e.detail.sensors; });

    el.shadowRoot.querySelectorAll('.delete-btn')[0].click();

    expect(fired.length).toBe(1);
    expect(fired[0].entity).toBe('sensor.b');
  });
});

describe('SensorsSection — riordino', () => {
  it('riordina correttamente l\'array dopo item-moved', () => {
    const el = makeSection([
      { type: 'presenza', entity: 'binary_sensor.a' },
      { type: 'temperatura', entity: 'sensor.b' },
      { type: 'umidita', entity: 'sensor.c' },
    ]);
    let fired = null;
    el.addEventListener('sensors-changed', e => { fired = e.detail.sensors; });

    el.shadowRoot.querySelector('ha-sortable').dispatchEvent(
      new CustomEvent('item-moved', { detail: { oldIndex: 0, newIndex: 2 }, bubbles: true })
    );

    expect(fired[0].entity).toBe('sensor.b');
    expect(fired[1].entity).toBe('sensor.c');
    expect(fired[2].entity).toBe('binary_sensor.a');
  });
});

describe('SensorsSection — espansione item', () => {
  it('espande un item al click sull\'header', () => {
    const el = makeSection([{ type: 'presenza', entity: 'binary_sensor.a' }]);
    el.shadowRoot.querySelector('.item-header').click();
    expect(el.shadowRoot.querySelector('ha-room-card-editor-sensor-item')).not.toBeNull();
  });

  it('emette sensors-changed quando l\'item espanso modifica il config', () => {
    const el = makeSection([{ type: 'presenza', entity: 'binary_sensor.a' }]);
    el.shadowRoot.querySelector('.item-header').click();
    let fired = null;
    el.addEventListener('sensors-changed', e => { fired = e.detail.sensors; });

    const sensorItem = el.shadowRoot.querySelector('ha-room-card-editor-sensor-item');
    sensorItem.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { type: 'presenza', entity: 'binary_sensor.new' } },
      bubbles: true,
      composed: true,
    }));

    expect(fired?.[0].entity).toBe('binary_sensor.new');
  });
});
