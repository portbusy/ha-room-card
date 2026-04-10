import { describe, it, expect } from 'vitest';
import { renderHeader } from '../../src/components/RoomHeader.js';

const hass = {
  states: {
    'binary_sensor.movimento': { state: 'on' },
    'binary_sensor.porta': { state: 'off' },
    'binary_sensor.finestra': { state: 'on' },
    'switch.lavatrice': { state: 'on' },
    'sensor.potenza': { state: '10.0' },
    'sensor.temperatura': { state: '21.3' },
    'sensor.umidita': { state: '62' },
    'sensor.lux': { state: '42' },
  },
};

const baseConfig = {
  name: 'Cucina',
  accent: '#4E8062',
  icon: 'mdi:silverware-fork-knife',
  sensors: [],
};

describe('renderHeader', () => {
  it('contiene il nome stanza', () => {
    const html = renderHeader(baseConfig, hass);
    expect(html).toContain('Cucina');
  });

  it('contiene l\'icona stanza', () => {
    const html = renderHeader(baseConfig, hass);
    expect(html).toContain('mdi:silverware-fork-knife');
  });

  it('contiene il colore accent nel gradiente', () => {
    const html = renderHeader(baseConfig, hass);
    expect(html).toContain('#4E8062');
  });

  it('mostra temperatura formattata', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'temperatura', entity: 'sensor.temperatura' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('21.3°C');
  });

  it('mostra umidità arrotondata', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'umidita', entity: 'sensor.umidita' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('62%');
  });

  it('mostra lux arrotondato', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'lux', entity: 'sensor.lux' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('42 lx');
  });

  it('mostra icona presenza quando on', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'presenza', entity: 'binary_sensor.movimento' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('mdi:motion-sensor');
    expect(html).not.toContain('mdi:motion-sensor-off');
  });

  it('mostra icona presenza-off quando off', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'presenza', entity: 'binary_sensor.porta' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('mdi:motion-sensor-off');
  });

  it('nasconde finestra quando off', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'finestra', entity: 'binary_sensor.porta' }],
    };
    const html = renderHeader(config, hass);
    expect(html).not.toContain('mdi:window-open-variant');
  });

  it('mostra finestra quando on', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'finestra', entity: 'binary_sensor.finestra' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('mdi:window-open-variant');
  });

  it('nasconde extra con icon_off null quando inattivo', () => {
    const config = {
      ...baseConfig,
      sensors: [{
        type: 'extra',
        entity: 'switch.lavatrice',
        icon_on: 'mdi:washing-machine',
        icon_off: null,
        trigger: 'numeric',
        trigger_entity: 'sensor.potenza',
        above: 100,
      }],
    };
    const html = renderHeader(config, hass);
    expect(html).not.toContain('mdi:washing-machine');
  });

  it('mostra extra con icon_on quando attivo', () => {
    const config = {
      ...baseConfig,
      sensors: [{
        type: 'extra',
        entity: 'switch.lavatrice',
        icon_on: 'mdi:washing-machine',
        icon_off: null,
        trigger: 'numeric',
        trigger_entity: 'sensor.potenza',
        above: 3,
      }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('mdi:washing-machine');
  });

  it('usa — per entità mancante (temperatura)', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'temperatura', entity: 'sensor.nonexistent' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('—');
  });

  it('rispetta l\'ordine dell\'array sensors', () => {
    const config = {
      ...baseConfig,
      sensors: [
        { type: 'temperatura', entity: 'sensor.temperatura' },
        { type: 'presenza', entity: 'binary_sensor.movimento' },
      ],
    };
    const html = renderHeader(config, hass);
    const tempPos = html.indexOf('21.3°C');
    const presPos = html.indexOf('mdi:motion-sensor');
    expect(tempPos).toBeLessThan(presPos);
  });
});
