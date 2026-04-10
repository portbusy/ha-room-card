import '../items/SensorItem.js';

class HaRoomCardEditorSensorsSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._sensors = [];
    this._hass = null;
    this._expandedIndex = null;
  }

  set sensors(sensors) {
    this._sensors = sensors ? [...sensors] : [];
    this._render();
  }

  get hass() { return this._hass; }

  set hass(hass) {
    this._hass = hass;
    this.shadowRoot.querySelectorAll('ha-selector').forEach(sel => { sel.hass = hass; });
    this.shadowRoot.querySelectorAll('ha-room-card-editor-sensor-item').forEach(el => { el.hass = hass; });
  }

  _fire() {
    this.dispatchEvent(new CustomEvent('sensors-changed', {
      detail: { sensors: [...this._sensors] },
      bubbles: true,
      composed: true,
    }));
  }

  _addSensor() {
    this._sensors = [...this._sensors, { type: 'presenza', entity: '' }];
    this._expandedIndex = this._sensors.length - 1;
    this._render();
    this._fire();
  }

  _removeSensor(index) {
    this._sensors = this._sensors.filter((_, i) => i !== index);
    if (this._expandedIndex >= this._sensors.length) this._expandedIndex = null;
    this._render();
    this._fire();
  }

  _moveSensor(oldIndex, newIndex) {
    const items = [...this._sensors];
    const [moved] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, moved);
    this._sensors = items;
    if (this._expandedIndex === oldIndex) this._expandedIndex = newIndex;
    this._render();
    this._fire();
  }

  _updateSensor(index, config) {
    this._sensors = this._sensors.map((s, i) => i === index ? { ...config } : s);
    this._fire();
  }

  _toggleExpand(index) {
    this._expandedIndex = this._expandedIndex === index ? null : index;
    this._render();
  }

  _label(sensor) {
    return `${sensor.type || '?'} · ${sensor.entity || 'nessuna entità'}`;
  }

  _render() {
    const root = this.shadowRoot;
    root.innerHTML = `
      <style>
        :host { display: block; }
        .sortable-item { border-bottom: 1px solid var(--divider-color, #e8e8e8); }
        .item-header {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 0; cursor: pointer; user-select: none;
        }
        .handle { color: var(--secondary-text-color); cursor: grab; flex-shrink: 0; }
        .item-label { flex: 1; font-size: 0.88em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .chevron { color: var(--secondary-text-color); transition: transform 0.2s; flex-shrink: 0; }
        .chevron.open { transform: rotate(180deg); }
        .delete-btn {
          background: none; border: none; cursor: pointer; padding: 4px;
          color: var(--secondary-text-color); display: flex; align-items: center; flex-shrink: 0;
        }
        .delete-btn:hover { color: var(--error-color, #db4437); }
        .item-content { padding: 0 0 12px 32px; }
        .add-btn {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 12px 0; margin-top: 4px;
          background: none; border: none; cursor: pointer;
          color: var(--primary-color); font-size: 0.9em;
        }
      </style>
    `;

    const sortable = document.createElement('ha-sortable');
    sortable.setAttribute('handle-selector', '.handle');
    sortable.addEventListener('item-moved', e => {
      this._moveSensor(e.detail.oldIndex, e.detail.newIndex);
    });

    this._sensors.forEach((sensor, index) => {
      const isExpanded = this._expandedIndex === index;

      const item = document.createElement('div');
      item.className = 'sortable-item';

      const header = document.createElement('div');
      header.className = 'item-header';

      const handle = document.createElement('ha-icon');
      handle.setAttribute('icon', 'mdi:drag');
      handle.className = 'handle';
      handle.addEventListener('click', e => e.stopPropagation());

      const labelEl = document.createElement('span');
      labelEl.className = 'item-label';
      labelEl.textContent = this._label(sensor);

      const chevron = document.createElement('ha-icon');
      chevron.setAttribute('icon', 'mdi:chevron-down');
      chevron.className = 'chevron' + (isExpanded ? ' open' : '');

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.setAttribute('aria-label', 'Rimuovi');
      deleteBtn.innerHTML = '<ha-icon icon="mdi:delete-outline"></ha-icon>';
      deleteBtn.addEventListener('click', e => { e.stopPropagation(); this._removeSensor(index); });

      header.appendChild(handle);
      header.appendChild(labelEl);
      header.appendChild(chevron);
      header.appendChild(deleteBtn);
      header.addEventListener('click', () => this._toggleExpand(index));
      item.appendChild(header);

      if (isExpanded) {
        const content = document.createElement('div');
        content.className = 'item-content';
        const sensorItem = document.createElement('ha-room-card-editor-sensor-item');
        sensorItem.config = sensor;
        sensorItem.hass = this._hass;
        sensorItem.addEventListener('config-changed', e => {
          this._updateSensor(index, e.detail.config);
          labelEl.textContent = this._label(e.detail.config);
        });
        content.appendChild(sensorItem);
        item.appendChild(content);
      }

      sortable.appendChild(item);
    });

    root.appendChild(sortable);

    const addBtn = document.createElement('button');
    addBtn.className = 'add-btn';
    addBtn.innerHTML = '<ha-icon icon="mdi:plus-circle-outline"></ha-icon> Aggiungi sensore';
    addBtn.addEventListener('click', () => this._addSensor());
    root.appendChild(addBtn);
  }
}

customElements.define('ha-room-card-editor-sensors', HaRoomCardEditorSensorsSection);
