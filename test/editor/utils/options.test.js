import { describe, it, expect } from 'vitest';
import { SENSOR_TYPE_OPTIONS, CHIP_TYPE_OPTIONS, COLOR_OPTIONS, TRIGGER_OPTIONS } from '../../../src/editor/utils/options.js';

describe('SENSOR_TYPE_OPTIONS', () => {
  it('contiene tutti i 7 tipi', () => {
    const values = SENSOR_TYPE_OPTIONS.map(o => o.value);
    expect(values).toContain('presenza');
    expect(values).toContain('porta');
    expect(values).toContain('finestra');
    expect(values).toContain('extra');
    expect(values).toContain('temperatura');
    expect(values).toContain('umidita');
    expect(values).toContain('lux');
    expect(values).toHaveLength(7);
  });

  it('ogni opzione ha value e label', () => {
    SENSOR_TYPE_OPTIONS.forEach(o => {
      expect(o.value).toBeTruthy();
      expect(o.label).toBeTruthy();
    });
  });
});

describe('CHIP_TYPE_OPTIONS', () => {
  it('contiene tutti i 7 tipi', () => {
    const values = CHIP_TYPE_OPTIONS.map(o => o.value);
    expect(values).toContain('light');
    expect(values).toContain('cover');
    expect(values).toContain('sensor');
    expect(values).toContain('climate');
    expect(values).toContain('switch');
    expect(values).toContain('action');
    expect(values).toContain('plant');
    expect(values).toHaveLength(7);
  });
});

describe('COLOR_OPTIONS', () => {
  it('contiene i colori del COLOR_MAP', () => {
    const values = COLOR_OPTIONS.map(o => o.value);
    expect(values).toContain('orange');
    expect(values).toContain('amber');
    expect(values).toContain('blue');
    expect(values).toContain('green');
    expect(values).toContain('red');
    expect(values).toContain('grey');
    expect(values).toContain('white');
  });
});

describe('TRIGGER_OPTIONS', () => {
  it('contiene state e numeric', () => {
    const values = TRIGGER_OPTIONS.map(o => o.value);
    expect(values).toContain('state');
    expect(values).toContain('numeric');
  });
});
