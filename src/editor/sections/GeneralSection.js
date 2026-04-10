import { hexToRgb, rgbToHex } from '../utils/colorConvert.js';

class HaRoomCardEditorGeneralSection extends HTMLElement {
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

  get hass() { return this._hass; }

  set hass(hass) {
    this._hass = hass;
    this.shadowRoot.querySelectorAll('ha-selector').forEach(sel => {
      sel.hass = hass;
    });
  }

  _fire(config) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true,
    }));
  }

  _onChange(key, value) {
    this._config = { ...this._config, [key]: value };
    this._fire(this._config);
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
    const config = this._config;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .fields { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }
        .row { display: flex; gap: 16px; }
        .row > * { flex: 1; min-width: 0; }
        .section-label {
          font-size: 0.82em;
          font-weight: 500;
          color: var(--secondary-text-color);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      </style>
      <div class="fields"></div>
    `;

    const fields = this.shadowRoot.querySelector('.fields');

    this._addSelector(fields, 'name', 'Nome stanza', { text: {} }, config.name || '');

    const row = document.createElement('div');
    row.className = 'row';

    const iconSel = document.createElement('ha-selector');
    iconSel.hass = this._hass;
    iconSel.selector = { icon: {} };
    iconSel.value = config.icon || null;
    iconSel.label = 'Icona';
    iconSel.addEventListener('value-changed', e => this._onChange('icon', e.detail.value));
    row.appendChild(iconSel);

    const accentSel = document.createElement('ha-selector');
    accentSel.hass = this._hass;
    accentSel.selector = { color_rgb: {} };
    accentSel.value = config.accent ? hexToRgb(config.accent) : [78, 128, 98];
    accentSel.label = 'Colore accento';
    accentSel.addEventListener('value-changed', e => this._onChange('accent', rgbToHex(e.detail.value)));
    row.appendChild(accentSel);

    fields.appendChild(row);

    const actionsLabel = document.createElement('div');
    actionsLabel.className = 'section-label';
    actionsLabel.textContent = 'Azioni header';
    fields.appendChild(actionsLabel);

    this._addSelector(fields, 'tap_action', 'Azione al tap', { action: {} }, config.tap_action || null);
    this._addSelector(fields, 'hold_action', 'Azione al hold', { action: {} }, config.hold_action || null);
  }
}

customElements.define('ha-room-card-editor-general', HaRoomCardEditorGeneralSection);
