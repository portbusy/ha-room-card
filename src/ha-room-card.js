import { renderHeader } from './components/RoomHeader.js';
import { buildMushroomConfig, renderNativeChips } from './components/RoomChips.js';
import { handleAction } from './utils/actions.js';
import { evaluateVisibility } from './utils/visibility.js';

class HaRoomCard extends HTMLElement {
  constructor() {
    super();
    this._config = null;
    this._hass = null;
    this._prevStates = null;
    this._mushroomEl = null;
    this._watchedEntities = [];
  }

  setConfig(config) {
    if (!config.name) throw new Error('ha-room-card: "name" è obbligatorio');
    if (!config.accent) throw new Error('ha-room-card: "accent" è obbligatorio');
    if (!config.icon) throw new Error('ha-room-card: "icon" è obbligatorio');
    this._config = config;
    this._watchedEntities = this._buildWatchedEntities(config);
    this._mushroomEl = null;
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    this._evaluateVisibility();
    if (this._hasStateChanged(hass)) {
      this._updatePrevStates(hass);
      this._render();
    } else if (this._mushroomEl) {
      this._mushroomEl.hass = hass;
    }
  }

  getCardSize() {
    return 3;
  }

  static getStubConfig() {
    return {
      type: 'custom:ha-room-card',
      name: 'Cucina',
      accent: '#4E8062',
      icon: 'mdi:silverware-fork-knife',
      tap_action: { action: 'navigate', navigation_path: '#cucina' },
      sensors: [
        { type: 'presenza', entity: 'binary_sensor.example_motion' },
        { type: 'temperatura', entity: 'sensor.example_temperature' },
        { type: 'umidita', entity: 'sensor.example_humidity' },
      ],
      chips: [
        { type: 'light', entity: 'light.example_light', name: 'Luce' },
      ],
    };
  }

  _buildWatchedEntities(config) {
    const entities = new Set();
    (config.sensors || []).forEach(s => {
      if (s.entity) entities.add(s.entity);
      if (s.trigger_entity) entities.add(s.trigger_entity);
    });
    (config.chips || []).forEach(c => {
      if (c.entity) entities.add(c.entity);
    });
    this._extractVisibilityEntities(config.visibility || [], entities);
    return Array.from(entities);
  }

  _extractVisibilityEntities(conditions, entities) {
    conditions.forEach(c => {
      if (c.entity) entities.add(c.entity);
      if (c.conditions) this._extractVisibilityEntities(c.conditions, entities);
    });
  }

  _hasStateChanged(hass) {
    if (!this._prevStates) return true;
    return this._watchedEntities.some(id =>
      this._prevStates[id]?.state !== hass.states[id]?.state
    );
  }

  _updatePrevStates(hass) {
    this._prevStates = {};
    this._watchedEntities.forEach(id => {
      this._prevStates[id] = hass.states[id];
    });
  }

  _render() {
    if (!this._config || !this._hass) return;
    this._mushroomEl = null;
    const accent = this._config.accent || '#4E8062';
    this.innerHTML = `${renderHeader(this._config, this._hass)}<div class="rrc-chips" style="background:linear-gradient(120deg,${accent}1F 0%,${accent}0A 100%);border-radius:0 0 22px 22px;padding:8px 14px 12px 14px;"></div>`;
    this._attachHeaderListeners();
    this._attachChips();
  }

  _attachHeaderListeners() {
    const header = this.querySelector('.rrc-header');
    if (!header) return;
    let holdFired = false;
    let holdTimer = null;

    header.addEventListener('pointerdown', () => {
      holdFired = false;
      if (this._config.hold_action) {
        holdTimer = setTimeout(() => {
          holdFired = true;
          handleAction(this, this._hass, this._config.hold_action);
        }, 500);
      }
    });

    header.addEventListener('pointerup', () => {
      clearTimeout(holdTimer);
    });

    header.addEventListener('click', () => {
      if (!holdFired && this._config.tap_action) {
        handleAction(this, this._hass, this._config.tap_action);
      }
      holdFired = false;
    });
  }

  _attachChips() {
    const container = this.querySelector('.rrc-chips');
    if (!container || !this._config.chips?.length) return;

    if (!customElements.get('mushroom-chips-card')) {
      container.innerHTML = renderNativeChips(this._config.chips, this._hass, this._config.accent);
      this._attachNativeChipListeners(container);
      return;
    }

    const el = document.createElement('mushroom-chips-card');
    el.setConfig({ chips: buildMushroomConfig(this._config.chips, this._hass) });
    el.hass = this._hass;
    container.appendChild(el);
    this._mushroomEl = el;
  }

  _attachNativeChipListeners(container) {
    container.querySelectorAll('.rrc-chip').forEach((chipEl, index) => {
      const chip = this._config.chips[index];
      if (!chip) return;
      chipEl.addEventListener('click', () => {
        const action = chip.tap_action || { action: 'toggle', entity_id: chip.entity };
        handleAction(this, this._hass, action);
      });
    });
  }

  _evaluateVisibility() {
    const visible = evaluateVisibility(this._config.visibility, this._hass);
    this.style.display = visible ? '' : 'none';
  }
}

customElements.define('ha-room-card', HaRoomCard);
