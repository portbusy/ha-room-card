import { CHIP_TYPE_OPTIONS, COLOR_OPTIONS } from '../utils/options.js';

class HaRoomCardEditorChipItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
  }

  set config(config) {
    this._config = { ...config };
    this._render();
  }

  get config() {
    return this._config;
  }

  set hass(hass) {
    this._hass = hass;
    this.shadowRoot.querySelectorAll('ha-selector').forEach(sel => {
      sel.hass = hass;
    });
  }

  _fire() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config } },
      bubbles: true,
      composed: true,
    }));
  }

  _onChange(key, value) {
    this._config = { ...this._config, [key]: value };
    if (key === 'type') this._render();
    this._fire();
  }

  _addSelector(container, key, label, selector, value) {
    const sel = document.createElement('ha-selector');
    sel.hass = this._hass;
    sel.selector = selector;
    sel.value = value !== undefined ? value : null;
    sel.label = label;
    sel.addEventListener('value-changed', e => this._onChange(key, e.detail.value));
    container.appendChild(sel);
    return sel;
  }

  _render() {
    const type = this._config.type || 'light';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .fields { display: flex; flex-direction: column; gap: 16px; padding: 8px 0 4px; }
      </style>
      <div class="fields"></div>
    `;

    const fields = this.shadowRoot.querySelector('.fields');

    this._addSelector(fields, 'type', 'Tipo',
      { select: { options: CHIP_TYPE_OPTIONS } },
      type
    );
    this._addSelector(fields, 'entity', 'Entità', { entity: {} }, this._config.entity || null);
    this._addSelector(fields, 'name', 'Etichetta', { text: {} }, this._config.name || '');

    if (type === 'switch' || type === 'action') {
      this._addSelector(fields, 'icon', 'Icona', { icon: {} }, this._config.icon || null);
      this._addSelector(fields, 'color_on', 'Colore (attivo)',
        { select: { options: COLOR_OPTIONS } },
        this._config.color_on || 'amber'
      );
    }

    if (type === 'sensor') {
      this._addSelector(fields, 'icon_on', 'Icona (attivo)', { icon: {} }, this._config.icon_on || null);
      this._addSelector(fields, 'icon_off', 'Icona (inattivo)', { icon: {} }, this._config.icon_off || null);
      this._addSelector(fields, 'color_on', 'Colore (attivo)',
        { select: { options: COLOR_OPTIONS } },
        this._config.color_on || 'orange'
      );
      this._addSelector(fields, 'color_off', 'Colore (inattivo)',
        { select: { options: COLOR_OPTIONS } },
        this._config.color_off || 'grey'
      );
    }

    if (type === 'action' || type === 'plant') {
      this._addSelector(fields, 'tap_action', 'Azione al tap', { action: {} }, this._config.tap_action || null);
    }

    if (type === 'action') {
      this._addSelector(fields, 'hold_action', 'Azione al hold', { action: {} }, this._config.hold_action || null);
    }
  }
}

customElements.define('ha-room-card-editor-chip-item', HaRoomCardEditorChipItem);
