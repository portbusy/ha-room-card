import './sections/GeneralSection.js';
import './sections/SensorsSection.js';
import './sections/ChipsSection.js';
import './sections/VisibilitySection.js';

class HaRoomCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._expandedPanels = new Set(['general']);
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const get = tag => this.shadowRoot.querySelector(tag);
    const sections = ['ha-room-card-editor-general', 'ha-room-card-editor-sensors',
      'ha-room-card-editor-chips', 'ha-room-card-editor-visibility'];
    sections.forEach(tag => { const el = get(tag); if (el) el.hass = hass; });
  }

  _fireConfigChanged(config) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true,
    }));
  }

  _createPanel(id, header, expanded) {
    const panel = document.createElement('ha-expansion-panel');
    panel.header = header;
    panel.expanded = expanded;
    panel.outlined = true;
    panel.addEventListener('expanded-changed', e => {
      if (e.detail.value) this._expandedPanels.add(id);
      else this._expandedPanels.delete(id);
    });
    return panel;
  }

  _render() {
    const root = this.shadowRoot;
    root.innerHTML = `
      <style>
        :host { display: block; }
        .panels { display: flex; flex-direction: column; gap: 4px; }
        ha-expansion-panel {
          --expansion-panel-content-padding: 0 16px 16px;
        }
      </style>
      <div class="panels"></div>
    `;
    const panels = root.querySelector('.panels');

    // Generale
    const generalPanel = this._createPanel('general', 'Generale', this._expandedPanels.has('general'));
    const generalSection = document.createElement('ha-room-card-editor-general');
    generalSection.config = this._config;
    generalSection.hass = this._hass;
    generalSection.addEventListener('config-changed', e => {
      this._config = { ...this._config, ...e.detail.config };
      this._fireConfigChanged(this._config);
    });
    generalPanel.appendChild(generalSection);
    panels.appendChild(generalPanel);

    // Sensori
    const sensorCount = (this._config.sensors || []).length;
    const sensorsPanel = this._createPanel(
      'sensors',
      sensorCount ? `Sensori · ${sensorCount}` : 'Sensori',
      this._expandedPanels.has('sensors')
    );
    const sensorsSection = document.createElement('ha-room-card-editor-sensors');
    sensorsSection.sensors = this._config.sensors || [];
    sensorsSection.hass = this._hass;
    sensorsSection.addEventListener('sensors-changed', e => {
      this._config = { ...this._config, sensors: e.detail.sensors };
      this._fireConfigChanged(this._config);
    });
    sensorsPanel.appendChild(sensorsSection);
    panels.appendChild(sensorsPanel);

    // Chip
    const chipCount = (this._config.chips || []).length;
    const chipsPanel = this._createPanel(
      'chips',
      chipCount ? `Chip · ${chipCount}` : 'Chip',
      this._expandedPanels.has('chips')
    );
    const chipsSection = document.createElement('ha-room-card-editor-chips');
    chipsSection.chips = this._config.chips || [];
    chipsSection.hass = this._hass;
    chipsSection.addEventListener('chips-changed', e => {
      this._config = { ...this._config, chips: e.detail.chips };
      this._fireConfigChanged(this._config);
    });
    chipsPanel.appendChild(chipsSection);
    panels.appendChild(chipsPanel);

    // Visibilità
    const visCount = (this._config.visibility || []).length;
    const visPanel = this._createPanel(
      'visibility',
      visCount ? `Visibilità · ${visCount} condizioni` : 'Visibilità',
      this._expandedPanels.has('visibility')
    );
    const visSection = document.createElement('ha-room-card-editor-visibility');
    visSection.conditions = this._config.visibility || [];
    visSection.hass = this._hass;
    visSection.addEventListener('conditions-changed', e => {
      this._config = { ...this._config, visibility: e.detail.conditions };
      this._fireConfigChanged(this._config);
    });
    visPanel.appendChild(visSection);
    panels.appendChild(visPanel);
  }
}

customElements.define('ha-room-card-editor', HaRoomCardEditor);
