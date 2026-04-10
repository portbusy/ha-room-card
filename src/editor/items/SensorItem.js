import { SENSOR_TYPE_OPTIONS, COLOR_OPTIONS, TRIGGER_OPTIONS } from '../utils/options.js';

class HaRoomCardEditorSensorItem extends HTMLElement {
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
    if (key === 'type' || key === 'trigger') this._render();
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
    const type = this._config.type || 'presenza';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .fields { display: flex; flex-direction: column; gap: 16px; padding: 8px 0 4px; }
      </style>
      <div class="fields"></div>
    `;

    const fields = this.shadowRoot.querySelector('.fields');

    this._addSelector(fields, 'type', 'Tipo',
      { select: { options: SENSOR_TYPE_OPTIONS } },
      type
    );

    this._addSelector(fields, 'entity', 'Entità',
      { entity: {} },
      this._config.entity || null
    );

    if (type === 'extra') {
      this._addSelector(fields, 'icon_on', 'Icona (attivo)', { icon: {} }, this._config.icon_on || null);
      this._addSelector(fields, 'icon_off', 'Icona (inattivo, vuoto = nascosto)', { icon: {} }, this._config.icon_off ?? null);
      this._addSelector(fields, 'color_on', 'Colore (attivo)',
        { select: { options: COLOR_OPTIONS } },
        this._config.color_on || 'orange'
      );
      this._addSelector(fields, 'trigger', 'Trigger',
        { select: { options: TRIGGER_OPTIONS } },
        this._config.trigger || 'state'
      );

      if (this._config.trigger === 'numeric') {
        this._addSelector(fields, 'trigger_entity', 'Entità numerica', { entity: {} }, this._config.trigger_entity || null);
        this._addSelector(fields, 'above', 'Sopra (soglia)',
          { number: { min: -9999, max: 9999, step: 0.1, mode: 'box' } },
          this._config.above ?? null
        );
        this._addSelector(fields, 'below', 'Sotto (soglia)',
          { number: { min: -9999, max: 9999, step: 0.1, mode: 'box' } },
          this._config.below ?? null
        );
      }
    }
  }
}

customElements.define('ha-room-card-editor-sensor-item', HaRoomCardEditorSensorItem);
