import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleAction } from '../../src/utils/actions.js';

function makeElement() {
  return { dispatchEvent: vi.fn() };
}

function makeHass() {
  return { callService: vi.fn() };
}

describe('handleAction', () => {
  beforeEach(() => {
    vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    vi.spyOn(window, 'dispatchEvent').mockImplementation(() => {});
  });

  it('navigate chiama pushState e dispatcha location-changed', () => {
    const el = makeElement();
    handleAction(el, null, { action: 'navigate', navigation_path: '#cucina' });
    expect(window.history.pushState).toHaveBeenCalledWith(null, '', '#cucina');
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'location-changed' })
    );
  });

  it('more-info dispatcha hass-more-info con entityId', () => {
    const el = makeElement();
    handleAction(el, null, { action: 'more-info', entity: 'light.cucina' });
    expect(el.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'hass-more-info',
        detail: { entityId: 'light.cucina' },
      })
    );
  });

  it('toggle chiama callService con il dominio giusto', () => {
    const el = makeElement();
    const hass = makeHass();
    handleAction(el, hass, { action: 'toggle', entity_id: 'light.cucina' });
    expect(hass.callService).toHaveBeenCalledWith('light', 'toggle', { entity_id: 'light.cucina' });
  });

  it('toggle accetta anche entity invece di entity_id', () => {
    const el = makeElement();
    const hass = makeHass();
    handleAction(el, hass, { action: 'toggle', entity: 'switch.foo' });
    expect(hass.callService).toHaveBeenCalledWith('switch', 'toggle', { entity_id: 'switch.foo' });
  });

  it('perform-action chiama callService con dominio e servizio corretti', () => {
    const el = makeElement();
    const hass = makeHass();
    handleAction(el, hass, {
      action: 'perform-action',
      perform_action: 'vacuum.start',
      target: { entity_id: 'vacuum.alfred' },
    });
    expect(hass.callService).toHaveBeenCalledWith('vacuum', 'start', { entity_id: 'vacuum.alfred' });
  });

  it('action null → non lancia eccezione', () => {
    const el = makeElement();
    expect(() => handleAction(el, null, null)).not.toThrow();
    expect(() => handleAction(el, null, {})).not.toThrow();
  });
});
