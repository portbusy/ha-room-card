import { describe, it, expect } from 'vitest';
import { evaluateVisibility } from '../../src/utils/visibility.js';

const hass = {
  states: {
    'input_select.stanza': { state: 'Tutte' },
    'binary_sensor.movimento': { state: 'off' },
    'sensor.temperatura': { state: '21.5' },
    'person.mario': { state: 'home' },
    'person.sara': { state: 'not_home' },
  },
};

describe('evaluateVisibility', () => {
  it('undefined → true', () => expect(evaluateVisibility(undefined, hass)).toBe(true));
  it('array vuoto → true', () => expect(evaluateVisibility([], hass)).toBe(true));

  it('state match → true', () => {
    expect(evaluateVisibility([
      { condition: 'state', entity: 'input_select.stanza', state: 'Tutte' },
    ], hass)).toBe(true);
  });

  it('state no match → false', () => {
    expect(evaluateVisibility([
      { condition: 'state', entity: 'binary_sensor.movimento', state: 'on' },
    ], hass)).toBe(false);
  });

  it('state_not match → true', () => {
    expect(evaluateVisibility([
      { condition: 'state', entity: 'binary_sensor.movimento', state_not: 'on' },
    ], hass)).toBe(true);
  });

  it('state_not no match → false', () => {
    expect(evaluateVisibility([
      { condition: 'state', entity: 'input_select.stanza', state_not: 'Tutte' },
    ], hass)).toBe(false);
  });

  it('numeric_state above soddisfatto → true', () => {
    expect(evaluateVisibility([
      { condition: 'numeric_state', entity: 'sensor.temperatura', above: 20 },
    ], hass)).toBe(true);
  });

  it('numeric_state above non soddisfatto → false', () => {
    expect(evaluateVisibility([
      { condition: 'numeric_state', entity: 'sensor.temperatura', above: 25 },
    ], hass)).toBe(false);
  });

  it('numeric_state below soddisfatto → true', () => {
    expect(evaluateVisibility([
      { condition: 'numeric_state', entity: 'sensor.temperatura', below: 25 },
    ], hass)).toBe(true);
  });

  it('or con una vera → true', () => {
    expect(evaluateVisibility([{
      condition: 'or',
      conditions: [
        { condition: 'state', entity: 'input_select.stanza', state: 'Tutte' },
        { condition: 'state', entity: 'binary_sensor.movimento', state: 'on' },
      ],
    }], hass)).toBe(true);
  });

  it('or con tutte false → false', () => {
    expect(evaluateVisibility([{
      condition: 'or',
      conditions: [
        { condition: 'state', entity: 'binary_sensor.movimento', state: 'on' },
      ],
    }], hass)).toBe(false);
  });

  it('and con tutte vere → true', () => {
    expect(evaluateVisibility([{
      condition: 'and',
      conditions: [
        { condition: 'state', entity: 'input_select.stanza', state: 'Tutte' },
        { condition: 'state', entity: 'binary_sensor.movimento', state_not: 'on' },
      ],
    }], hass)).toBe(true);
  });

  it('and con una falsa → false', () => {
    expect(evaluateVisibility([{
      condition: 'and',
      conditions: [
        { condition: 'state', entity: 'input_select.stanza', state: 'Tutte' },
        { condition: 'state', entity: 'binary_sensor.movimento', state: 'on' },
      ],
    }], hass)).toBe(false);
  });

  it('location home → true (person.mario è home)', () => {
    expect(evaluateVisibility([
      { condition: 'location', locations: ['home'] },
    ], hass)).toBe(true);
  });

  it('location not_home → true (person.sara è not_home)', () => {
    expect(evaluateVisibility([
      { condition: 'location', locations: ['not_home'] },
    ], hass)).toBe(true);
  });

  it('entità non esistente → false (state non trova match)', () => {
    expect(evaluateVisibility([
      { condition: 'state', entity: 'sensor.nonexistent', state: 'on' },
    ], hass)).toBe(false);
  });

  it('più condizioni top-level → AND (tutte devono essere vere)', () => {
    expect(evaluateVisibility([
      { condition: 'state', entity: 'input_select.stanza', state: 'Tutte' },
      { condition: 'state', entity: 'binary_sensor.movimento', state: 'on' },
    ], hass)).toBe(false);
  });
});
