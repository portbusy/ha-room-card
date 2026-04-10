import { describe, it, expect } from 'vitest';
import {
  getChipColor,
  getHeaderSensorColor,
  isExtraActive,
  resolveColorName,
  COLORS,
} from '../../src/utils/colors.js';

describe('COLORS', () => {
  it('ha le costanti attese', () => {
    expect(COLORS.active).toBe('#FFA726');
    expect(COLORS.dimmed).toBe('rgba(255,255,255,0.35)');
    expect(COLORS.red).toBe('#e74c3c');
    expect(COLORS.blue).toBe('#5b9bd5');
    expect(COLORS.green).toBe('#4E8062');
  });
});

describe('resolveColorName', () => {
  it('orange → COLORS.active', () => expect(resolveColorName('orange')).toBe(COLORS.active));
  it('amber → COLORS.active', () => expect(resolveColorName('amber')).toBe(COLORS.active));
  it('blue → COLORS.blue', () => expect(resolveColorName('blue')).toBe(COLORS.blue));
  it('green → COLORS.green', () => expect(resolveColorName('green')).toBe(COLORS.green));
  it('red → COLORS.red', () => expect(resolveColorName('red')).toBe(COLORS.red));
  it('hex passthrough', () => expect(resolveColorName('#abc123')).toBe('#abc123'));
});

describe('getChipColor', () => {
  it('light on → amber', () => expect(getChipColor('light', 'on', {})).toBe('amber'));
  it('light off → grey', () => expect(getChipColor('light', 'off', {})).toBe('grey'));
  it('cover open → amber', () => expect(getChipColor('cover', 'open', {})).toBe('amber'));
  it('cover closed → grey', () => expect(getChipColor('cover', 'closed', {})).toBe('grey'));
  it('climate cool → blue', () => expect(getChipColor('climate', 'cool', {})).toBe('blue'));
  it('climate heat → orange', () => expect(getChipColor('climate', 'heat', {})).toBe('orange'));
  it('climate off → grey', () => expect(getChipColor('climate', 'off', {})).toBe('grey'));
  it('switch on usa color_on da config', () => expect(getChipColor('switch', 'on', { color_on: 'orange' })).toBe('orange'));
  it('switch off → grey', () => expect(getChipColor('switch', 'off', { color_on: 'orange' })).toBe('grey'));
  it('action on usa color_on da config', () => expect(getChipColor('action', 'on', { color_on: 'amber' })).toBe('amber'));
  it('sensor on usa color_on', () => expect(getChipColor('sensor', 'on', { color_on: 'orange', color_off: 'grey' })).toBe('orange'));
  it('sensor off usa color_off', () => expect(getChipColor('sensor', 'off', { color_on: 'orange', color_off: 'grey' })).toBe('grey'));
  it('plant ok → green', () => expect(getChipColor('plant', 'ok', {})).toBe('green'));
  it('plant problem → red', () => expect(getChipColor('plant', 'problem', {})).toBe('red'));
});

const mockHass = {
  states: {
    'switch.lavatrice': { state: 'on' },
    'switch.off_device': { state: 'off' },
    'sensor.potenza': { state: '5.2' },
    'sensor.bassa_potenza': { state: '1.0' },
    'climate.ac': { state: 'cool' },
  },
};

describe('isExtraActive', () => {
  it('state on → true', () => {
    expect(isExtraActive({ entity: 'switch.lavatrice' }, mockHass)).toBe(true);
  });
  it('state off → false', () => {
    expect(isExtraActive({ entity: 'switch.off_device' }, mockHass)).toBe(false);
  });
  it('trigger numeric sopra soglia → true', () => {
    expect(isExtraActive({
      entity: 'switch.lavatrice',
      trigger: 'numeric',
      trigger_entity: 'sensor.potenza',
      above: 3,
    }, mockHass)).toBe(true);
  });
  it('trigger numeric sotto soglia → false', () => {
    expect(isExtraActive({
      entity: 'switch.lavatrice',
      trigger: 'numeric',
      trigger_entity: 'sensor.bassa_potenza',
      above: 3,
    }, mockHass)).toBe(false);
  });
  it('entità mancante → false', () => {
    expect(isExtraActive({ entity: 'sensor.nonexistent' }, mockHass)).toBe(false);
  });
});

describe('getHeaderSensorColor', () => {
  it('presenza on → active', () => {
    expect(getHeaderSensorColor({ type: 'presenza', entity: 'switch.lavatrice' }, mockHass)).toBe(COLORS.active);
  });
  it('presenza off → dimmed', () => {
    expect(getHeaderSensorColor({ type: 'presenza', entity: 'switch.off_device' }, mockHass)).toBe(COLORS.dimmed);
  });
  it('porta on → active', () => {
    expect(getHeaderSensorColor({ type: 'porta', entity: 'switch.lavatrice' }, mockHass)).toBe(COLORS.active);
  });
  it('porta off → red', () => {
    expect(getHeaderSensorColor({ type: 'porta', entity: 'switch.off_device' }, mockHass)).toBe(COLORS.red);
  });
  it('finestra → active', () => {
    expect(getHeaderSensorColor({ type: 'finestra', entity: 'switch.lavatrice' }, mockHass)).toBe(COLORS.active);
  });
  it('extra color_on_cool quando state=cool', () => {
    expect(getHeaderSensorColor({
      type: 'extra',
      entity: 'climate.ac',
      color_on: 'orange',
      color_on_cool: 'blue',
    }, mockHass)).toBe(COLORS.blue);
  });
  it('extra color_on altrimenti', () => {
    expect(getHeaderSensorColor({
      type: 'extra',
      entity: 'switch.lavatrice',
      color_on: 'orange',
    }, mockHass)).toBe(COLORS.active);
  });
});
