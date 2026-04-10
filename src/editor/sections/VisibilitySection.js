class HaRoomCardEditorVisibilitySection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._conditions = [];
    this._hass = null;
  }

  set conditions(conditions) {
    this._conditions = conditions || [];
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const editor = this.shadowRoot.querySelector('ha-conditions-editor');
    if (editor) editor.hass = hass;
  }

  _render() {
    this.shadowRoot.innerHTML = '<style>:host { display: block; padding: 8px 0; }</style>';
    const editor = document.createElement('ha-conditions-editor');
    editor.hass = this._hass;
    editor.conditions = this._conditions;
    editor.addEventListener('value-changed', e => {
      this._conditions = e.detail.value;
      this.dispatchEvent(new CustomEvent('conditions-changed', {
        detail: { conditions: this._conditions },
        bubbles: true,
        composed: true,
      }));
    });
    this.shadowRoot.appendChild(editor);
  }
}

customElements.define('ha-room-card-editor-visibility', HaRoomCardEditorVisibilitySection);
