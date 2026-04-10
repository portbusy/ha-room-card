import { describe, it, expect } from 'vitest';
import { getChipIcon, getHeaderIcon } from '../../src/utils/icons.js';

describe('getChipIcon', () => {
  it('light on → lightbulb', () => expect(getChipIcon('light', 'on', {})).toBe('mdi:lightbulb'));
  it('light off → lightbulb-outline', () => expect(getChipIcon('light', 'off', {})).toBe('mdi:lightbulb-outline'));
  it('cover → roller-shade', () => expect(getChipIcon('cover', 'open', {})).toBe('mdi:roller-shade'));
  it('climate → air-conditioner', () => expect(getChipIcon('climate', 'cool', {})).toBe('mdi:air-conditioner'));
  it('plant ok → flower', () => expect(getChipIcon('plant', 'ok', {})).toBe('mdi:flower'));
  it('plant problem → leaf', () => expect(getChipIcon('plant', 'problem', {})).toBe('mdi:leaf'));
  it('switch usa icon da config', () => expect(getChipIcon('switch', 'on', { icon: 'mdi:water-boiler' })).toBe('mdi:water-boiler'));
  it('action usa icon da config', () => expect(getChipIcon('action', 'on', { icon: 'mdi:robot-vacuum' })).toBe('mdi:robot-vacuum'));
  it('sensor on usa icon_on da config', () => {
    expect(getChipIcon('sensor', 'on', { icon_on: 'mdi:window-open-variant', icon_off: 'mdi:window-closed-variant' }))
      .toBe('mdi:window-open-variant');
  });
  it('sensor off usa icon_off da config', () => {
    expect(getChipIcon('sensor', 'off', { icon_on: 'mdi:window-open-variant', icon_off: 'mdi:window-closed-variant' }))
      .toBe('mdi:window-closed-variant');
  });
  it('switch senza config.icon → mdi:toggle-switch (default)', () => expect(getChipIcon('switch', 'on', {})).toBe('mdi:toggle-switch'));
  it('action senza config.icon → mdi:toggle-switch (default)', () => expect(getChipIcon('action', 'on', {})).toBe('mdi:toggle-switch'));
  it('sensor on senza config.icon_on → mdi:information (default)', () => expect(getChipIcon('sensor', 'on', {})).toBe('mdi:information'));
  it('sensor off senza config.icon_off → mdi:information-off (default)', () => expect(getChipIcon('sensor', 'off', {})).toBe('mdi:information-off'));
  it('config null non lancia errori', () => expect(() => getChipIcon('switch', 'on', null)).not.toThrow());
});

describe('getHeaderIcon', () => {
  it('presenza on → motion-sensor', () => expect(getHeaderIcon('presenza', 'on')).toBe('mdi:motion-sensor'));
  it('presenza off → motion-sensor-off', () => expect(getHeaderIcon('presenza', 'off')).toBe('mdi:motion-sensor-off'));
  it('porta on → door-open', () => expect(getHeaderIcon('porta', 'on')).toBe('mdi:door-open'));
  it('porta off → door-closed', () => expect(getHeaderIcon('porta', 'off')).toBe('mdi:door-closed'));
  it('finestra → window-open-variant', () => expect(getHeaderIcon('finestra', 'on')).toBe('mdi:window-open-variant'));
  it('finestra off → window-open-variant (sempre visibile se chiamata)', () => expect(getHeaderIcon('finestra', 'off')).toBe('mdi:window-open-variant'));
  it('tipo sconosciuto → null', () => expect(getHeaderIcon('unknown', 'on')).toBeNull());
});
