import { describe, it, expect } from 'vitest';
import { buildMushroomConfig, renderNativeChips } from '../../src/components/RoomChips.js';

const hass = {
  states: {
    'light.cucina': { state: 'on' },
    'light.off': { state: 'off' },
    'cover.tapparella': { state: 'open' },
    'cover.chiusa': { state: 'closed' },
    'climate.ac': { state: 'cool' },
    'plant.mario': { state: 'ok' },
    'plant.malata': { state: 'problem' },
    'switch.boiler': { state: 'on' },
  },
};

describe('buildMushroomConfig', () => {
  it('light on → lightbulb + amber', () => {
    const result = buildMushroomConfig([
      { type: 'light', entity: 'light.cucina', name: 'Luce' },
    ], hass);
    expect(result[0].icon).toBe('mdi:lightbulb');
    expect(result[0].icon_color).toBe('amber');
    expect(result[0].content).toBe('Luce');
  });

  it('light off → lightbulb-outline + grey', () => {
    const result = buildMushroomConfig([
      { type: 'light', entity: 'light.off', name: 'Luce' },
    ], hass);
    expect(result[0].icon).toBe('mdi:lightbulb-outline');
    expect(result[0].icon_color).toBe('grey');
  });

  it('cover open → amber, tap=toggle, hold=more-info', () => {
    const result = buildMushroomConfig([
      { type: 'cover', entity: 'cover.tapparella', name: 'Tapparella' },
    ], hass);
    expect(result[0].icon_color).toBe('amber');
    expect(result[0].tap_action).toEqual({ action: 'toggle', entity_id: 'cover.tapparella' });
    expect(result[0].hold_action).toEqual({ action: 'more-info', entity: 'cover.tapparella' });
  });

  it('climate cool → blue', () => {
    const result = buildMushroomConfig([
      { type: 'climate', entity: 'climate.ac', name: 'Clima' },
    ], hass);
    expect(result[0].icon_color).toBe('blue');
    expect(result[0].tap_action).toEqual({ action: 'more-info', entity: 'climate.ac' });
  });

  it('plant ok → green, no ⚠', () => {
    const result = buildMushroomConfig([
      { type: 'plant', entity: 'plant.mario', name: 'Mario' },
    ], hass);
    expect(result[0].icon_color).toBe('green');
    expect(result[0].content).toBe('Mario');
  });

  it('plant problem → red + ⚠', () => {
    const result = buildMushroomConfig([
      { type: 'plant', entity: 'plant.malata', name: 'Basilico' },
    ], hass);
    expect(result[0].icon_color).toBe('red');
    expect(result[0].content).toBe('Basilico ⚠');
  });

  it('action usa tap_action e hold_action dalla config', () => {
    const tapAction = { action: 'more-info' };
    const holdAction = { action: 'perform-action', perform_action: 'vacuum.start', target: { entity_id: 'vacuum.alfred' } };
    const result = buildMushroomConfig([
      { type: 'action', entity: 'vacuum.alfred', name: 'Alfred', icon: 'mdi:robot-vacuum', color_on: 'amber', tap_action: tapAction, hold_action: holdAction },
    ], hass);
    expect(result[0].tap_action).toEqual(tapAction);
    expect(result[0].hold_action).toEqual(holdAction);
  });

  it('chip senza entità in hass → state unavailable, non lancia eccezione', () => {
    expect(() => buildMushroomConfig([
      { type: 'light', entity: 'light.nonexistent', name: 'X' },
    ], hass)).not.toThrow();
  });

  it('array vuoto → array vuoto', () => {
    expect(buildMushroomConfig([], hass)).toEqual([]);
  });
});

describe('renderNativeChips', () => {
  it('genera HTML con classe rrc-chip', () => {
    const html = renderNativeChips([
      { type: 'light', entity: 'light.cucina', name: 'Luce' },
    ], hass, '#4E8062');
    expect(html).toContain('rrc-chip');
    expect(html).toContain('Luce');
    expect(html).toContain('mdi:lightbulb');
  });

  it('array vuoto → stringa vuota', () => {
    expect(renderNativeChips([], hass, '#4E8062')).toBe('');
  });
});
