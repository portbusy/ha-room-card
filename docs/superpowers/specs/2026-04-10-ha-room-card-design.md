# ha-room-card — Design Document

**Data:** 2026-04-10
**Stato:** Approvato

---

## Obiettivo

Custom card per Home Assistant pubblicabile su HACS. Web component standalone che visualizza una stanza con header a gradiente colorato (nome, icona, riga sensori configurabile) e sezione chip di controllo rapido (integrata con `mushroom-chips-card`).

Sostituisce il pattern precedente basato su `stack-in-card` + `button-card` + `mushroom-chips-card` separati, unificando tutto in un'unica config YAML.

---

## Dipendenze esterne (documentare nel README)

- **mushroom-cards** (installabile via HACS) — richiesto per la sezione chip
- **card-mod** — opzionale, supportato nativamente grazie all'assenza di shadow DOM

---

## Schema di configurazione YAML

```yaml
type: custom:ha-room-card

# Header — obbligatori
name: Cucina
accent: "#4E8062"
icon: mdi:silverware-fork-knife

# Azioni header — opzionali, standard HA
tap_action:
  action: navigate
  navigation_path: "#cucina"
hold_action:
  action: more-info
  entity: binary_sensor.sensori_movimento_cucina

# Sensori — array ordinato, ordine = ordine di visualizzazione nella riga info
sensors:
  - type: presenza
    entity: binary_sensor.sensori_movimento_cucina
  - type: porta
    entity: binary_sensor.contact_bagno
  - type: finestra
    entity: binary_sensor.contact_cucina_contact
  - type: extra
    entity: switch.shelly_1pm_gen4
    icon_on: mdi:washing-machine
    icon_off: ~                        # ~ = nascosto se off
    color_on: orange
    trigger: numeric                   # usa numeric_state invece di state
    trigger_entity: sensor.shelly_1pm_gen4_potenza
    above: 3
  - type: extra
    entity: climate.condizionatore_sala
    icon_on: mdi:air-conditioner
    icon_off: ~
    color_on: orange
    color_on_cool: blue                # colore speciale se state == 'cool'
  - type: temperatura
    entity: sensor.t_u_cucina_temperature
  - type: umidita
    entity: sensor.t_u_cucina_humidity
  - type: lux
    entity: sensor.0x54ef44100152acc7_illuminance

# Chips — lista ordinata
chips:
  - type: light
    entity: light.interruttore_cucina
    name: Luce 1

  - type: cover
    entity: cover.tapparella_cucina_2
    name: Tapparella

  - type: sensor
    entity: binary_sensor.contact_cucina_contact
    name: Finestra
    icon_on: mdi:window-open-variant
    icon_off: mdi:window-closed-variant
    color_on: orange
    color_off: grey

  - type: climate
    entity: climate.condizionatore_sala
    name: Clima

  - type: switch
    entity: switch.override_scaldabagno
    name: Scaldabagno
    icon: mdi:water-boiler
    color_on: orange

  - type: action
    entity: vacuum.alfred
    name: Alfred
    icon: mdi:robot-vacuum
    color_on: amber
    tap_action:
      action: more-info
    hold_action:
      action: perform-action
      perform_action: vacuum.start
      target:
        entity_id: vacuum.alfred

  - type: plant
    entity: plant.mario_il_rosmario
    name: Mario
    tap_action:
      action: navigate
      navigation_path: "#piante"

# Visibilità — stessa sintassi HA
visibility:
  - condition: or
    conditions:
      - condition: state
        entity: input_select.selezione_stanza
        state: Tutte
      - condition: state
        entity: binary_sensor.sensori_movimento_cucina
        state: "on"
```

---

## Struttura repository

```
ha-room-card/
├── dist/
│   └── ha-room-card.js          # bundle finale (output rollup)
├── src/
│   ├── ha-room-card.js          # entry point — custom element HaRoomCard
│   ├── components/
│   │   ├── RoomHeader.js        # renderHeader(config, hass) → HTML string
│   │   └── RoomChips.js         # buildMushroomConfig(config, hass) + _attachChips()
│   └── utils/
│       ├── icons.js             # getIcon(type, state, chipConfig) → 'mdi:xxx'
│       ├── colors.js            # getColor(type, state, chipConfig) → stringa CSS
│       ├── actions.js           # handleAction(element, hass, actionConfig)
│       └── visibility.js        # evaluateVisibility(conditions, hass) → boolean
├── docs/
│   └── superpowers/specs/
│       └── 2026-04-10-ha-room-card-design.md
├── hacs.json
├── package.json
├── rollup.config.js
└── README.md
```

---

## Architettura — Custom Element

### Classe `HaRoomCard extends HTMLElement`

**Metodi obbligatori HA:**
- `setConfig(config)` — valida config, salva `this._config`, costruisce `this._watchedEntities` (lista flat di tutti gli entity_id usati)
- `set hass(hass)` — confronta stati di `_watchedEntities` con `_prevStates`; se cambiati chiama `_render()` e aggiorna `mushroom-chips-card.hass`; valuta visibilità
- `getCardSize()` → `3`
- `static getStubConfig()` → config di esempio minimale

**Metodi interni:**
- `_render()` — azzera `this._mushroomEl = null`, poi `this.innerHTML = renderHeader(config, hass) + '<div class="rrc-chips"></div>'`, poi `_attachChips()` (che ricrea il riferimento)
- `_attachChips()` — se `_mushroomEl` è null, crea e appende un nuovo `mushroom-chips-card`; altrimenti aggiorna solo `.hass` e chiama `setConfig` se la config chip è cambiata
- `_evaluateVisibility()` — chiama `evaluateVisibility()` e imposta `this.style.display`

**Ottimizzazione re-render:**
Alla prima chiamata `setConfig`, viene costruita la lista `_watchedEntities`. Ad ogni `set hass`:
- Se nessuno stato rilevante è cambiato → aggiorna solo `this._mushroomEl.hass` (nessun render)
- Se almeno uno stato è cambiato → `_render()` completo (azzera e ricrea DOM + mushroom)
- Visibilità valutata ad ogni `set hass` indipendentemente dal render

**No shadow DOM:** tutto viene scritto direttamente su `this`, compatibile con `card-mod`.

---

## Architettura — RoomHeader

`renderHeader(config, hass)` → stringa HTML.

**Stile header:**
- `background: linear-gradient(120deg, {accent} 0%, {accent}80 40%, {accent}26 70%, {accent}00 100%)`
- `border-radius: 22px 22px 0 0`
- `padding: 16px 18px 18px 18px`
- `position: relative`

**Icona stanza:** `position: absolute; top: 0; right: 0; color: {accent}A6; --mdc-icon-size: 36px`

**Nome stanza:** `font-size: 1.1em; font-weight: 600; color: white; margin-bottom: 7px`

**Riga info:** `display: flex; flex-wrap: nowrap; align-items: center; gap: 10px; font-size: 0.82em; color: white; opacity: 0.9`

**Rendering sensori (in ordine di array `sensors`):**

| type | Condizione visualizzazione | Icona | Colore |
|------|---------------------------|-------|--------|
| `presenza` | sempre | `motion-sensor` / `motion-sensor-off` | arancione / dimmed |
| `porta` | sempre | `door-open` / `door-closed` | arancione / rosso |
| `finestra` | solo se `state == 'on'` | `window-open-variant` | arancione |
| `extra` | se on (rispetta `icon_off: ~`); trigger numeric se `trigger: numeric` | da config | da config |
| `temperatura` | sempre se entità disponibile | testo `{val.toFixed(1)}°C` | — |
| `umidita` | sempre se entità disponibile | testo `{Math.round(val)}%` | — |
| `lux` | sempre se entità disponibile | testo `{Math.round(val)} lx` | — |

**Colori di default:**
- `active = '#FFA726'` (arancione)
- `dimmed = 'rgba(255,255,255,0.35)'`
- `red = '#e74c3c'`
- `blue = '#5b9bd5'`
- `green = '#4E8062'`

Ogni icona: `<ha-icon icon="mdi:xxx" style="--mdc-icon-size:18px">` dentro `<span style="display:inline-flex; align-items:center;">`.

Tap sull'header: event listener su `.rrc-header` che chiama `handleAction(this, hass, config.tap_action)`.

---

## Architettura — RoomChips

`buildMushroomConfig(chips, hass)` → array chip in formato mushroom template.

Ogni chip viene tradotto in un mushroom `template` chip con valori già risolti in JS (non Jinja):

```js
{
  type: 'template',
  icon: getIcon(chip.type, state, chip),        // 'mdi:lightbulb'
  icon_color: getColor(chip.type, state, chip), // 'amber'
  content: chip.name + (problem ? ' ⚠' : ''),
  tap_action: resolveTapAction(chip),
  hold_action: resolveHoldAction(chip),
}
```

**Comportamenti per tipo:**

| type | icon on/off | color on/off | tap | hold |
|------|-------------|--------------|-----|------|
| `light` | `lightbulb` / `lightbulb-outline` | amber / grey | toggle | — |
| `cover` | `roller-shade` | amber (aperto) / grey (closed) | toggle | more-info |
| `sensor` | da config | da config | more-info | — |
| `climate` | `air-conditioner` | blue (cool) / orange (heat) / grey (off) | more-info | — |
| `switch` | da config `icon` | da config `color_on` / grey | toggle | — |
| `action` | da config `icon` | da config `color_on` | da config `tap_action` | da config `hold_action` |
| `plant` | `flower` (ok) / `leaf` (problem) | green / red | navigate o more-info | — |

**Integrazione mushroom:**
```js
_attachChips() {
  const container = this.querySelector('.rrc-chips');
  if (!this._mushroomEl) {
    if (!customElements.get('mushroom-chips-card')) {
      // fallback: renderizza pill native
      container.innerHTML = this._renderNativeChips();
      return;
    }
    this._mushroomEl = document.createElement('mushroom-chips-card');
    container.appendChild(this._mushroomEl);
  }
  this._mushroomEl.setConfig({ chips: buildMushroomConfig(this._config.chips, this._hass) });
  this._mushroomEl.hass = this._hass;
}
```

**Stile sezione chips:**
- `background: linear-gradient(120deg, {accent}1F 0%, {accent}0A 100%)`
- `border-radius: 0 0 22px 22px`
- `padding: 8px 14px 12px 14px`

---

## Architettura — utils

### `actions.js` — `handleAction(element, hass, actionConfig)`
```
navigate    → window.history.pushState(null, '', path) + dispatch 'location-changed' su window
more-info   → dispatch CustomEvent 'hass-more-info' { bubbles, composed, detail: { entityId } }
toggle      → hass.callService(domain, 'toggle', { entity_id })
perform-action → hass.callService(domain, service, { ...target, ...serviceData })
```

### `visibility.js` — `evaluateVisibility(conditions, hass)`
Condizioni supportate: `state` (con `state` e `state_not`), `numeric_state` (con `above`/`below`), `or`, `and`, `location` (legge `person.*` / `device_tracker.*`). Se tutte le condizioni top-level sono false → `false`.

### `icons.js` — `getIcon(type, state, config)`
Restituisce la stringa icona `mdi:xxx` in base al tipo chip e allo stato corrente.

### `colors.js` — `getColor(type, state, config)`
Restituisce il colore CSS (nome mushroom o hex) in base a tipo, stato e config.

---

## Build

```json
// package.json
{
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c --watch"
  },
  "devDependencies": {
    "rollup": "^4.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-terser": "^0.4.0"
  }
}
```

Output: `dist/ha-room-card.js` — singolo file minificato, aggiunto come risorsa Lovelace.

---

## hacs.json

```json
{
  "name": "HA Room Card",
  "description": "A beautiful room card for Home Assistant with gradient header, sensor info row and control chips",
  "render_readme": true,
  "filename": "ha-room-card.js",
  "content_in_root": false
}
```

---

## Fallback e robustezza

- Entità non trovata in `hass.states` → mostra `—` per valori numerici, nasconde icona per binary sensor
- `mushroom-chips-card` non disponibile → pill native con stesso stile visivo
- Config incompleta → `setConfig` lancia errore con messaggio descrittivo

---

## Note implementative

1. **No shadow DOM** — `this.innerHTML` direttamente, compatibile con `card-mod`
2. **`<ha-icon>`** funziona nel DOM HA globalmente, nessuna importazione necessaria
3. **Testare** con HA Developer Tools → Template per verificare valori entità
