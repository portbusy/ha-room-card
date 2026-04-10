import { describe, it, expect } from 'vitest';
import '../../../src/editor/sections/ChipsSection.js';
import '../../../src/editor/items/ChipItem.js';

function makeSection(chips = []) {
  const el = document.createElement('ha-room-card-editor-chips');
  el.chips = chips;
  document.body.appendChild(el);
  return el;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('ChipsSection — rendering', () => {
  it('rende tanti item quanti sono i chip', () => {
    const el = makeSection([
      { type: 'light', entity: 'light.a', name: 'Luce' },
      { type: 'switch', entity: 'switch.b', name: 'Switch' },
    ]);
    expect(el.shadowRoot.querySelectorAll('.sortable-item').length).toBe(2);
  });

  it('rende pulsante aggiungi', () => {
    const el = makeSection([]);
    expect(el.shadowRoot.querySelector('.add-btn')).not.toBeNull();
  });
});

describe('ChipsSection — aggiunta chip', () => {
  it('emette chips-changed con nuovo chip di default', () => {
    const el = makeSection([]);
    let fired = null;
    el.addEventListener('chips-changed', e => { fired = e.detail.chips; });

    el.shadowRoot.querySelector('.add-btn').click();

    expect(fired?.length).toBe(1);
    expect(fired[0].type).toBe('light');
  });
});

describe('ChipsSection — rimozione chip', () => {
  it('emette chips-changed senza il chip rimosso', () => {
    const el = makeSection([
      { type: 'light', entity: 'light.a', name: 'A' },
      { type: 'switch', entity: 'switch.b', name: 'B' },
    ]);
    let fired = null;
    el.addEventListener('chips-changed', e => { fired = e.detail.chips; });

    el.shadowRoot.querySelectorAll('.delete-btn')[0].click();

    expect(fired.length).toBe(1);
    expect(fired[0].name).toBe('B');
  });
});

describe('ChipsSection — riordino', () => {
  it('riordina correttamente dopo item-moved', () => {
    const el = makeSection([
      { type: 'light', entity: 'light.a', name: 'A' },
      { type: 'switch', entity: 'switch.b', name: 'B' },
      { type: 'sensor', entity: 'sensor.c', name: 'C' },
    ]);
    let fired = null;
    el.addEventListener('chips-changed', e => { fired = e.detail.chips; });

    el.shadowRoot.querySelector('ha-sortable').dispatchEvent(
      new CustomEvent('item-moved', { detail: { oldIndex: 2, newIndex: 0 }, bubbles: true })
    );

    expect(fired[0].name).toBe('C');
    expect(fired[1].name).toBe('A');
    expect(fired[2].name).toBe('B');
  });
});

describe('ChipsSection — espansione', () => {
  it('mostra ChipItem quando l\'header viene cliccato', () => {
    const el = makeSection([{ type: 'light', entity: 'light.a', name: 'Luce' }]);
    el.shadowRoot.querySelector('.item-header').click();
    expect(el.shadowRoot.querySelector('ha-room-card-editor-chip-item')).not.toBeNull();
  });
});
