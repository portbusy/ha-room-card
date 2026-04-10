# ha-room-card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementare `ha-room-card`, una custom card per Home Assistant con header a gradiente colorato, riga sensori configurabile e chip di controllo rapido integrati con mushroom-chips-card.

**Architecture:** Custom element `HaRoomCard extends HTMLElement` senza shadow DOM. Header e chip sono moduli separati. Il rendering avviene solo quando cambiano gli stati delle entità osservate. I chip usano `mushroom-chips-card` istanziata programmaticamente, con fallback a pill native.

**Tech Stack:** Vanilla JS ES modules, Rollup 4, @rollup/plugin-node-resolve, @rollup/plugin-terser, Vitest 1 (test utils puri)

**Spec di riferimento:** `docs/superpowers/specs/2026-04-10-ha-room-card-design.md`

---

## File Map

| File | Responsabilità |
|------|----------------|
| `src/utils/colors.js` | `getChipColor`, `getHeaderSensorColor`, `isExtraActive`, `resolveColorName`, `COLORS` |
| `src/utils/icons.js` | `getChipIcon`, `getHeaderIcon` |
| `src/utils/visibility.js` | `evaluateVisibility(conditions, hass)` |
| `src/utils/actions.js` | `handleAction(element, hass, actionConfig)` |
| `src/components/RoomHeader.js` | `renderHeader(config, hass)` → HTML string |
| `src/components/RoomChips.js` | `buildMushroomConfig(chips, hass)`, `renderNativeChips(chips, hass, accent)` |
| `src/ha-room-card.js` | Classe `HaRoomCard`, ciclo di vita HA, orchestrazione |
| `rollup.config.js` | Bundle config |
| `package.json` | Script + dipendenze |
| `hacs.json` | Metadati HACS |
| `test/utils/colors.test.js` | Unit test colors |
| `test/utils/icons.test.js` | Unit test icons |
| `test/utils/visibility.test.js` | Unit test visibility |
| `test/utils/actions.test.js` | Unit test actions |
| `test/components/RoomHeader.test.js` | Unit test header HTML |
| `test/components/RoomChips.test.js` | Unit test buildMushroomConfig |

---

## Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `rollup.config.js`
- Create: `hacs.json`
- Create: `vitest.config.js`
- Create: `.gitignore`

- [ ] **Step 1: Crea package.json**

```json
{
  "name": "ha-room-card",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "rollup": "^4.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-terser": "^0.4.0",
    "vitest": "^1.0.0"
  }
}
```

- [ ] **Step 2: Crea rollup.config.js**

```js
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/ha-room-card.js',
  output: {
    file: 'dist/ha-room-card.js',
    format: 'es',
  },
  plugins: [resolve(), terser()],
};
```

- [ ] **Step 3: Crea vitest.config.js**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

- [ ] **Step 4: Crea hacs.json**

```json
{
  "name": "HA Room Card",
  "description": "A beautiful room card for Home Assistant with gradient header, sensor info row and control chips",
  "render_readme": true,
  "filename": "ha-room-card.js",
  "content_in_root": false
}
```

- [ ] **Step 5: Crea .gitignore**

```
node_modules/
dist/
```

- [ ] **Step 6: Crea struttura directory src**

```bash
mkdir -p src/components src/utils test/utils test/components dist
```

- [ ] **Step 7: Installa dipendenze**

```bash
npm install
```

Expected: `node_modules/` creata, nessun errore.

- [ ] **Step 8: Commit**

```bash
git add package.json rollup.config.js hacs.json vitest.config.js .gitignore
git commit -m "chore: project scaffolding"
```

---

## Task 2: utils/colors.js

**Files:**
- Create: `src/utils/colors.js`
- Create: `test/utils/colors.test.js`

- [ ] **Step 1: Scrivi il test fallente**

Crea `test/utils/colors.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  getChipColor,
  getHeaderSensorColor,
  isExtraActive,
  resolveColorName,
  COLORS,
} from '../../src/utils/colors.js';

describe('COLORS', () => {
  it('ha le costanti attese', () => {
    expect(COLORS.active).toBe('#FFA726');
    expect(COLORS.dimmed).toBe('rgba(255,255,255,0.35)');
    expect(COLORS.red).toBe('#e74c3c');
    expect(COLORS.blue).toBe('#5b9bd5');
    expect(COLORS.green).toBe('#4E8062');
  });
});

describe('resolveColorName', () => {
  it('orange → COLORS.active', () => expect(resolveColorName('orange')).toBe(COLORS.active));
  it('amber → COLORS.active', () => expect(resolveColorName('amber')).toBe(COLORS.active));
  it('blue → COLORS.blue', () => expect(resolveColorName('blue')).toBe(COLORS.blue));
  it('green → COLORS.green', () => expect(resolveColorName('green')).toBe(COLORS.green));
  it('red → COLORS.red', () => expect(resolveColorName('red')).toBe(COLORS.red));
  it('hex passthrough', () => expect(resolveColorName('#abc123')).toBe('#abc123'));
});

describe('getChipColor', () => {
  it('light on → amber', () => expect(getChipColor('light', 'on', {})).toBe('amber'));
  it('light off → grey', () => expect(getChipColor('light', 'off', {})).toBe('grey'));
  it('cover open → amber', () => expect(getChipColor('cover', 'open', {})).toBe('amber'));
  it('cover closed → grey', () => expect(getChipColor('cover', 'closed', {})).toBe('grey'));
  it('climate cool → blue', () => expect(getChipColor('climate', 'cool', {})).toBe('blue'));
  it('climate heat → orange', () => expect(getChipColor('climate', 'heat', {})).toBe('orange'));
  it('climate off → grey', () => expect(getChipColor('climate', 'off', {})).toBe('grey'));
  it('switch on usa color_on da config', () => expect(getChipColor('switch', 'on', { color_on: 'orange' })).toBe('orange'));
  it('switch off → grey', () => expect(getChipColor('switch', 'off', { color_on: 'orange' })).toBe('grey'));
  it('action on usa color_on da config', () => expect(getChipColor('action', 'on', { color_on: 'amber' })).toBe('amber'));
  it('sensor on usa color_on', () => expect(getChipColor('sensor', 'on', { color_on: 'orange', color_off: 'grey' })).toBe('orange'));
  it('sensor off usa color_off', () => expect(getChipColor('sensor', 'off', { color_on: 'orange', color_off: 'grey' })).toBe('grey'));
  it('plant ok → green', () => expect(getChipColor('plant', 'ok', {})).toBe('green'));
  it('plant problem → red', () => expect(getChipColor('plant', 'problem', {})).toBe('red'));
});

const mockHass = {
  states: {
    'switch.lavatrice': { state: 'on' },
    'switch.off_device': { state: 'off' },
    'sensor.potenza': { state: '5.2' },
    'sensor.bassa_potenza': { state: '1.0' },
    'climate.ac': { state: 'cool' },
  },
};

describe('isExtraActive', () => {
  it('state on → true', () => {
    expect(isExtraActive({ entity: 'switch.lavatrice' }, mockHass)).toBe(true);
  });
  it('state off → false', () => {
    expect(isExtraActive({ entity: 'switch.off_device' }, mockHass)).toBe(false);
  });
  it('trigger numeric sopra soglia → true', () => {
    expect(isExtraActive({
      entity: 'switch.lavatrice',
      trigger: 'numeric',
      trigger_entity: 'sensor.potenza',
      above: 3,
    }, mockHass)).toBe(true);
  });
  it('trigger numeric sotto soglia → false', () => {
    expect(isExtraActive({
      entity: 'switch.lavatrice',
      trigger: 'numeric',
      trigger_entity: 'sensor.bassa_potenza',
      above: 3,
    }, mockHass)).toBe(false);
  });
  it('entità mancante → false', () => {
    expect(isExtraActive({ entity: 'sensor.nonexistent' }, mockHass)).toBe(false);
  });
});

describe('getHeaderSensorColor', () => {
  it('presenza on → active', () => {
    expect(getHeaderSensorColor({ type: 'presenza', entity: 'switch.lavatrice' }, mockHass)).toBe(COLORS.active);
  });
  it('presenza off → dimmed', () => {
    expect(getHeaderSensorColor({ type: 'presenza', entity: 'switch.off_device' }, mockHass)).toBe(COLORS.dimmed);
  });
  it('porta on → active', () => {
    expect(getHeaderSensorColor({ type: 'porta', entity: 'switch.lavatrice' }, mockHass)).toBe(COLORS.active);
  });
  it('porta off → red', () => {
    expect(getHeaderSensorColor({ type: 'porta', entity: 'switch.off_device' }, mockHass)).toBe(COLORS.red);
  });
  it('finestra → active', () => {
    expect(getHeaderSensorColor({ type: 'finestra', entity: 'switch.lavatrice' }, mockHass)).toBe(COLORS.active);
  });
  it('extra color_on_cool quando state=cool', () => {
    expect(getHeaderSensorColor({
      type: 'extra',
      entity: 'climate.ac',
      color_on: 'orange',
      color_on_cool: 'blue',
    }, mockHass)).toBe(COLORS.blue);
  });
  it('extra color_on altrimenti', () => {
    expect(getHeaderSensorColor({
      type: 'extra',
      entity: 'switch.lavatrice',
      color_on: 'orange',
    }, mockHass)).toBe(COLORS.active);
  });
});
```

- [ ] **Step 2: Esegui il test per verificare che fallisca**

```bash
npm test
```

Expected: FAIL con "Cannot find module '../../src/utils/colors.js'"

- [ ] **Step 3: Implementa src/utils/colors.js**

```js
export const COLORS = {
  active: '#FFA726',
  dimmed: 'rgba(255,255,255,0.35)',
  red: '#e74c3c',
  blue: '#5b9bd5',
  green: '#4E8062',
};

const COLOR_MAP = {
  orange: COLORS.active,
  amber: COLORS.active,
  blue: COLORS.blue,
  green: COLORS.green,
  red: COLORS.red,
  grey: 'rgba(255,255,255,0.35)',
  white: 'white',
};

export function resolveColorName(name) {
  return COLOR_MAP[name] || name;
}

export function isExtraActive(sensor, hass) {
  if (sensor.trigger === 'numeric') {
    const val = parseFloat(hass.states[sensor.trigger_entity]?.state);
    if (isNaN(val)) return false;
    if (sensor.above !== undefined) return val > sensor.above;
    if (sensor.below !== undefined) return val < sensor.below;
    return false;
  }
  const state = hass.states[sensor.entity]?.state;
  return Boolean(state) && state !== 'off' && state !== 'unavailable' && state !== 'unknown';
}

export function getChipColor(type, state, config) {
  switch (type) {
    case 'light':
      return state === 'on' ? 'amber' : 'grey';
    case 'cover':
      return state !== 'closed' ? 'amber' : 'grey';
    case 'climate':
      if (state === 'cool') return 'blue';
      if (state === 'heat') return 'orange';
      return 'grey';
    case 'switch':
    case 'action':
      return state === 'on' ? (config.color_on || 'amber') : 'grey';
    case 'sensor':
      return state === 'on' ? (config.color_on || 'orange') : (config.color_off || 'grey');
    case 'plant':
      return state === 'ok' ? 'green' : 'red';
    default:
      return 'grey';
  }
}

export function getHeaderSensorColor(sensor, hass) {
  const state = hass.states[sensor.entity]?.state ?? 'unavailable';
  switch (sensor.type) {
    case 'presenza':
      return state === 'on' ? COLORS.active : COLORS.dimmed;
    case 'porta':
      return state === 'on' ? COLORS.active : COLORS.red;
    case 'finestra':
      return COLORS.active;
    case 'extra': {
      const entityState = hass.states[sensor.entity]?.state;
      if (sensor.color_on_cool && entityState === 'cool') {
        return resolveColorName(sensor.color_on_cool);
      }
      return resolveColorName(sensor.color_on || 'orange');
    }
    default:
      return 'white';
  }
}
```

- [ ] **Step 4: Esegui i test per verificare che passino**

```bash
npm test
```

Expected: tutti i test PASS, nessun errore.

- [ ] **Step 5: Commit**

```bash
git add src/utils/colors.js test/utils/colors.test.js
git commit -m "feat: add colors utility"
```

---

## Task 3: utils/icons.js

**Files:**
- Create: `src/utils/icons.js`
- Create: `test/utils/icons.test.js`

- [ ] **Step 1: Scrivi il test fallente**

Crea `test/utils/icons.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { getChipIcon, getHeaderIcon } from '../../src/utils/icons.js';

describe('getChipIcon', () => {
  it('light on → lightbulb', () => expect(getChipIcon('light', 'on', {})).toBe('mdi:lightbulb'));
  it('light off → lightbulb-outline', () => expect(getChipIcon('light', 'off', {})).toBe('mdi:lightbulb-outline'));
  it('cover → roller-shade', () => expect(getChipIcon('cover', 'open', {})).toBe('mdi:roller-shade'));
  it('climate → air-conditioner', () => expect(getChipIcon('climate', 'cool', {})).toBe('mdi:air-conditioner'));
  it('plant ok → flower', () => expect(getChipIcon('plant', 'ok', {})).toBe('mdi:flower'));
  it('plant problem → leaf', () => expect(getChipIcon('plant', 'problem', {})).toBe('mdi:leaf'));
  it('switch usa icon da config', () => expect(getChipIcon('switch', 'on', { icon: 'mdi:water-boiler' })).toBe('mdi:water-boiler'));
  it('action usa icon da config', () => expect(getChipIcon('action', 'on', { icon: 'mdi:robot-vacuum' })).toBe('mdi:robot-vacuum'));
  it('sensor on usa icon_on da config', () => {
    expect(getChipIcon('sensor', 'on', { icon_on: 'mdi:window-open-variant', icon_off: 'mdi:window-closed-variant' }))
      .toBe('mdi:window-open-variant');
  });
  it('sensor off usa icon_off da config', () => {
    expect(getChipIcon('sensor', 'off', { icon_on: 'mdi:window-open-variant', icon_off: 'mdi:window-closed-variant' }))
      .toBe('mdi:window-closed-variant');
  });
});

describe('getHeaderIcon', () => {
  it('presenza on → motion-sensor', () => expect(getHeaderIcon('presenza', 'on')).toBe('mdi:motion-sensor'));
  it('presenza off → motion-sensor-off', () => expect(getHeaderIcon('presenza', 'off')).toBe('mdi:motion-sensor-off'));
  it('porta on → door-open', () => expect(getHeaderIcon('porta', 'on')).toBe('mdi:door-open'));
  it('porta off → door-closed', () => expect(getHeaderIcon('porta', 'off')).toBe('mdi:door-closed'));
  it('finestra → window-open-variant', () => expect(getHeaderIcon('finestra', 'on')).toBe('mdi:window-open-variant'));
  it('tipo sconosciuto → null', () => expect(getHeaderIcon('unknown', 'on')).toBeNull());
});
```

- [ ] **Step 2: Esegui per verificare che fallisca**

```bash
npm test
```

Expected: FAIL con "Cannot find module '../../src/utils/icons.js'"

- [ ] **Step 3: Implementa src/utils/icons.js**

```js
export function getChipIcon(type, state, config) {
  switch (type) {
    case 'light':
      return state === 'on' ? 'mdi:lightbulb' : 'mdi:lightbulb-outline';
    case 'cover':
      return 'mdi:roller-shade';
    case 'climate':
      return 'mdi:air-conditioner';
    case 'plant':
      return state === 'ok' ? 'mdi:flower' : 'mdi:leaf';
    case 'switch':
    case 'action':
      return config.icon || 'mdi:toggle-switch';
    case 'sensor':
      return state === 'on'
        ? (config.icon_on || 'mdi:information')
        : (config.icon_off || 'mdi:information-off');
    default:
      return 'mdi:help-circle';
  }
}

export function getHeaderIcon(type, state) {
  switch (type) {
    case 'presenza':
      return state === 'on' ? 'mdi:motion-sensor' : 'mdi:motion-sensor-off';
    case 'porta':
      return state === 'on' ? 'mdi:door-open' : 'mdi:door-closed';
    case 'finestra':
      return 'mdi:window-open-variant';
    default:
      return null;
  }
}
```

- [ ] **Step 4: Esegui i test**

```bash
npm test
```

Expected: tutti i test PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/icons.js test/utils/icons.test.js
git commit -m "feat: add icons utility"
```

---

## Task 4: utils/visibility.js

**Files:**
- Create: `src/utils/visibility.js`
- Create: `test/utils/visibility.test.js`

- [ ] **Step 1: Scrivi il test fallente**

Crea `test/utils/visibility.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { evaluateVisibility } from '../../src/utils/visibility.js';

const hass = {
  states: {
    'input_select.stanza': { state: 'Tutte' },
    'binary_sensor.movimento': { state: 'off' },
    'sensor.temperatura': { state: '21.5' },
    'person.mario': { state: 'home' },
    'person.sara': { state: 'not_home' },
  },
};

describe('evaluateVisibility', () => {
  it('undefined → true', () => expect(evaluateVisibility(undefined, hass)).toBe(true));
  it('array vuoto → true', () => expect(evaluateVisibility([], hass)).toBe(true));

  it('state match → true', () => {
    expect(evaluateVisibility([
      { condition: 'state', entity: 'input_select.stanza', state: 'Tutte' },
    ], hass)).toBe(true);
  });

  it('state no match → false', () => {
    expect(evaluateVisibility([
      { condition: 'state', entity: 'binary_sensor.movimento', state: 'on' },
    ], hass)).toBe(false);
  });

  it('state_not match → true', () => {
    expect(evaluateVisibility([
      { condition: 'state', entity: 'binary_sensor.movimento', state_not: 'on' },
    ], hass)).toBe(true);
  });

  it('state_not no match → false', () => {
    expect(evaluateVisibility([
      { condition: 'state', entity: 'input_select.stanza', state_not: 'Tutte' },
    ], hass)).toBe(false);
  });

  it('numeric_state above soddisfatto → true', () => {
    expect(evaluateVisibility([
      { condition: 'numeric_state', entity: 'sensor.temperatura', above: 20 },
    ], hass)).toBe(true);
  });

  it('numeric_state above non soddisfatto → false', () => {
    expect(evaluateVisibility([
      { condition: 'numeric_state', entity: 'sensor.temperatura', above: 25 },
    ], hass)).toBe(false);
  });

  it('numeric_state below soddisfatto → true', () => {
    expect(evaluateVisibility([
      { condition: 'numeric_state', entity: 'sensor.temperatura', below: 25 },
    ], hass)).toBe(true);
  });

  it('or con una vera → true', () => {
    expect(evaluateVisibility([{
      condition: 'or',
      conditions: [
        { condition: 'state', entity: 'input_select.stanza', state: 'Tutte' },
        { condition: 'state', entity: 'binary_sensor.movimento', state: 'on' },
      ],
    }], hass)).toBe(true);
  });

  it('or con tutte false → false', () => {
    expect(evaluateVisibility([{
      condition: 'or',
      conditions: [
        { condition: 'state', entity: 'binary_sensor.movimento', state: 'on' },
      ],
    }], hass)).toBe(false);
  });

  it('and con tutte vere → true', () => {
    expect(evaluateVisibility([{
      condition: 'and',
      conditions: [
        { condition: 'state', entity: 'input_select.stanza', state: 'Tutte' },
        { condition: 'state', entity: 'binary_sensor.movimento', state_not: 'on' },
      ],
    }], hass)).toBe(true);
  });

  it('and con una falsa → false', () => {
    expect(evaluateVisibility([{
      condition: 'and',
      conditions: [
        { condition: 'state', entity: 'input_select.stanza', state: 'Tutte' },
        { condition: 'state', entity: 'binary_sensor.movimento', state: 'on' },
      ],
    }], hass)).toBe(false);
  });

  it('location home → true (person.mario è home)', () => {
    expect(evaluateVisibility([
      { condition: 'location', locations: ['home'] },
    ], hass)).toBe(true);
  });

  it('location not_home → true (person.sara è not_home)', () => {
    expect(evaluateVisibility([
      { condition: 'location', locations: ['not_home'] },
    ], hass)).toBe(true);
  });

  it('entità non esistente → false (state non trova match)', () => {
    expect(evaluateVisibility([
      { condition: 'state', entity: 'sensor.nonexistent', state: 'on' },
    ], hass)).toBe(false);
  });

  it('più condizioni top-level → AND (tutte devono essere vere)', () => {
    expect(evaluateVisibility([
      { condition: 'state', entity: 'input_select.stanza', state: 'Tutte' },
      { condition: 'state', entity: 'binary_sensor.movimento', state: 'on' },
    ], hass)).toBe(false);
  });
});
```

- [ ] **Step 2: Esegui per verificare che fallisca**

```bash
npm test
```

Expected: FAIL con "Cannot find module '../../src/utils/visibility.js'"

- [ ] **Step 3: Implementa src/utils/visibility.js**

```js
export function evaluateVisibility(conditions, hass) {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every(condition => evaluateCondition(condition, hass));
}

function evaluateCondition(condition, hass) {
  switch (condition.condition) {
    case 'state': {
      const state = hass.states[condition.entity]?.state;
      if (condition.state !== undefined) return state === String(condition.state);
      if (condition.state_not !== undefined) return state !== String(condition.state_not);
      return false;
    }
    case 'numeric_state': {
      const val = parseFloat(hass.states[condition.entity]?.state);
      if (isNaN(val)) return false;
      if (condition.above !== undefined && val <= condition.above) return false;
      if (condition.below !== undefined && val >= condition.below) return false;
      return true;
    }
    case 'or':
      return (condition.conditions || []).some(c => evaluateCondition(c, hass));
    case 'and':
      return (condition.conditions || []).every(c => evaluateCondition(c, hass));
    case 'location': {
      const locations = condition.locations || [];
      const personStates = Object.entries(hass.states)
        .filter(([id]) => id.startsWith('person.') || id.startsWith('device_tracker.'))
        .map(([, s]) => s.state);
      return locations.some(loc => {
        if (loc === 'not_home') return personStates.some(s => s !== 'home');
        return personStates.some(s => s === loc);
      });
    }
    default:
      return true;
  }
}
```

- [ ] **Step 4: Esegui i test**

```bash
npm test
```

Expected: tutti i test PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/visibility.js test/utils/visibility.test.js
git commit -m "feat: add visibility utility"
```

---

## Task 5: utils/actions.js

**Files:**
- Create: `src/utils/actions.js`
- Create: `test/utils/actions.test.js`

- [ ] **Step 1: Scrivi il test fallente**

Crea `test/utils/actions.test.js`:

```js
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
```

- [ ] **Step 2: Esegui per verificare che fallisca**

```bash
npm test
```

Expected: FAIL con "Cannot find module '../../src/utils/actions.js'"

- [ ] **Step 3: Implementa src/utils/actions.js**

```js
export function handleAction(element, hass, actionConfig) {
  if (!actionConfig || !actionConfig.action) return;

  switch (actionConfig.action) {
    case 'navigate': {
      const path = actionConfig.navigation_path;
      if (!path) return;
      window.history.pushState(null, '', path);
      window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
      break;
    }
    case 'more-info': {
      const entityId = actionConfig.entity;
      if (!entityId) return;
      element.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId },
      }));
      break;
    }
    case 'toggle': {
      const entityId = actionConfig.entity_id || actionConfig.entity;
      if (!entityId || !hass) return;
      const domain = entityId.split('.')[0];
      hass.callService(domain, 'toggle', { entity_id: entityId });
      break;
    }
    case 'perform-action': {
      if (!hass || !actionConfig.perform_action) return;
      const [domain, service] = actionConfig.perform_action.split('.');
      const serviceData = {
        ...(actionConfig.target || {}),
        ...(actionConfig.data || {}),
      };
      hass.callService(domain, service, serviceData);
      break;
    }
  }
}
```

- [ ] **Step 4: Esegui i test**

```bash
npm test
```

Expected: tutti i test PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/actions.js test/utils/actions.test.js
git commit -m "feat: add actions utility"
```

---

## Task 6: components/RoomHeader.js

**Files:**
- Create: `src/components/RoomHeader.js`
- Create: `test/components/RoomHeader.test.js`

- [ ] **Step 1: Scrivi il test fallente**

Crea `test/components/RoomHeader.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { renderHeader } from '../../src/components/RoomHeader.js';

const hass = {
  states: {
    'binary_sensor.movimento': { state: 'on' },
    'binary_sensor.porta': { state: 'off' },
    'binary_sensor.finestra': { state: 'on' },
    'switch.lavatrice': { state: 'on' },
    'sensor.potenza': { state: '10.0' },
    'sensor.temperatura': { state: '21.3' },
    'sensor.umidita': { state: '62' },
    'sensor.lux': { state: '42' },
  },
};

const baseConfig = {
  name: 'Cucina',
  accent: '#4E8062',
  icon: 'mdi:silverware-fork-knife',
  sensors: [],
};

describe('renderHeader', () => {
  it('contiene il nome stanza', () => {
    const html = renderHeader(baseConfig, hass);
    expect(html).toContain('Cucina');
  });

  it('contiene l\'icona stanza', () => {
    const html = renderHeader(baseConfig, hass);
    expect(html).toContain('mdi:silverware-fork-knife');
  });

  it('contiene il colore accent nel gradiente', () => {
    const html = renderHeader(baseConfig, hass);
    expect(html).toContain('#4E8062');
  });

  it('mostra temperatura formattata', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'temperatura', entity: 'sensor.temperatura' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('21.3°C');
  });

  it('mostra umidità arrotondata', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'umidita', entity: 'sensor.umidita' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('62%');
  });

  it('mostra lux arrotondato', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'lux', entity: 'sensor.lux' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('42 lx');
  });

  it('mostra icona presenza quando on', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'presenza', entity: 'binary_sensor.movimento' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('mdi:motion-sensor');
    expect(html).not.toContain('mdi:motion-sensor-off');
  });

  it('mostra icona presenza-off quando off', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'presenza', entity: 'binary_sensor.porta' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('mdi:motion-sensor-off');
  });

  it('nasconde finestra quando off', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'finestra', entity: 'binary_sensor.porta' }],
    };
    const html = renderHeader(config, hass);
    expect(html).not.toContain('mdi:window-open-variant');
  });

  it('mostra finestra quando on', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'finestra', entity: 'binary_sensor.finestra' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('mdi:window-open-variant');
  });

  it('nasconde extra con icon_off null quando inattivo', () => {
    const config = {
      ...baseConfig,
      sensors: [{
        type: 'extra',
        entity: 'switch.lavatrice',
        icon_on: 'mdi:washing-machine',
        icon_off: null,
        trigger: 'numeric',
        trigger_entity: 'sensor.potenza',
        above: 100,
      }],
    };
    const html = renderHeader(config, hass);
    expect(html).not.toContain('mdi:washing-machine');
  });

  it('mostra extra con icon_on quando attivo', () => {
    const config = {
      ...baseConfig,
      sensors: [{
        type: 'extra',
        entity: 'switch.lavatrice',
        icon_on: 'mdi:washing-machine',
        icon_off: null,
        trigger: 'numeric',
        trigger_entity: 'sensor.potenza',
        above: 3,
      }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('mdi:washing-machine');
  });

  it('usa — per entità mancante (temperatura)', () => {
    const config = {
      ...baseConfig,
      sensors: [{ type: 'temperatura', entity: 'sensor.nonexistent' }],
    };
    const html = renderHeader(config, hass);
    expect(html).toContain('—');
  });

  it('rispetta l\'ordine dell\'array sensors', () => {
    const config = {
      ...baseConfig,
      sensors: [
        { type: 'temperatura', entity: 'sensor.temperatura' },
        { type: 'presenza', entity: 'binary_sensor.movimento' },
      ],
    };
    const html = renderHeader(config, hass);
    const tempPos = html.indexOf('21.3°C');
    const presPos = html.indexOf('mdi:motion-sensor');
    expect(tempPos).toBeLessThan(presPos);
  });
});
```

- [ ] **Step 2: Esegui per verificare che fallisca**

```bash
npm test
```

Expected: FAIL con "Cannot find module '../../src/components/RoomHeader.js'"

- [ ] **Step 3: Implementa src/components/RoomHeader.js**

```js
import { getHeaderIcon } from '../utils/icons.js';
import { isExtraActive, getHeaderSensorColor, COLORS } from '../utils/colors.js';

function iconSpan(icon, color) {
  return `<span style="display:inline-flex;align-items:center;"><ha-icon icon="${icon}" style="--mdc-icon-size:18px;color:${color};"></ha-icon></span>`;
}

function textSpan(text) {
  return `<span style="display:inline-flex;align-items:center;">${text}</span>`;
}

function renderSensorItem(sensor, hass) {
  const entityState = hass?.states?.[sensor.entity];
  const state = entityState?.state ?? 'unavailable';

  switch (sensor.type) {
    case 'presenza':
      return iconSpan(getHeaderIcon('presenza', state), getHeaderSensorColor(sensor, hass));

    case 'porta':
      return iconSpan(getHeaderIcon('porta', state), getHeaderSensorColor(sensor, hass));

    case 'finestra':
      if (state !== 'on') return '';
      return iconSpan('mdi:window-open-variant', COLORS.active);

    case 'extra': {
      const active = isExtraActive(sensor, hass);
      if (!active) {
        if (sensor.icon_off == null) return '';
        return iconSpan(sensor.icon_off, COLORS.dimmed);
      }
      return iconSpan(sensor.icon_on, getHeaderSensorColor(sensor, hass));
    }

    case 'temperatura': {
      const val = parseFloat(entityState?.state);
      return isNaN(val) ? textSpan('—') : textSpan(`${val.toFixed(1)}°C`);
    }

    case 'umidita': {
      const val = parseFloat(entityState?.state);
      return isNaN(val) ? textSpan('—') : textSpan(`${Math.round(val)}%`);
    }

    case 'lux': {
      const val = parseFloat(entityState?.state);
      return isNaN(val) ? textSpan('—') : textSpan(`${Math.round(val)} lx`);
    }

    default:
      return '';
  }
}

export function renderHeader(config, hass) {
  const accent = config.accent || '#4E8062';
  const sensorsHtml = (config.sensors || [])
    .map(sensor => renderSensorItem(sensor, hass))
    .join('');

  return `<div class="rrc-header" style="background:linear-gradient(120deg,${accent} 0%,${accent}80 40%,${accent}26 70%,${accent}00 100%);border-radius:22px 22px 0 0;padding:16px 18px 18px 18px;position:relative;overflow:hidden;"><ha-icon icon="${config.icon || 'mdi:home'}" style="position:absolute;top:0;right:0;color:${accent}A6;--mdc-icon-size:36px;"></ha-icon><div style="font-size:1.1em;font-weight:600;margin-bottom:7px;color:white;">${config.name || ''}</div><div style="display:flex;flex-wrap:nowrap;align-items:center;gap:10px;font-size:0.82em;color:white;opacity:0.9;">${sensorsHtml}</div></div>`;
}
```

- [ ] **Step 4: Esegui i test**

```bash
npm test
```

Expected: tutti i test PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/RoomHeader.js test/components/RoomHeader.test.js
git commit -m "feat: add RoomHeader component"
```

---

## Task 7: components/RoomChips.js

**Files:**
- Create: `src/components/RoomChips.js`
- Create: `test/components/RoomChips.test.js`

- [ ] **Step 1: Scrivi il test fallente**

Crea `test/components/RoomChips.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { buildMushroomConfig, renderNativeChips } from '../../src/components/RoomChips.js';

const hass = {
  states: {
    'light.cucina': { state: 'on' },
    'light.off': { state: 'off' },
    'cover.tapparella': { state: 'open' },
    'cover.chiusa': { state: 'closed' },
    'climate.ac': { state: 'cool' },
    'plant.mario': { state: 'ok' },
    'plant.malata': { state: 'problem' },
    'switch.boiler': { state: 'on' },
  },
};

describe('buildMushroomConfig', () => {
  it('light on → lightbulb + amber', () => {
    const result = buildMushroomConfig([
      { type: 'light', entity: 'light.cucina', name: 'Luce' },
    ], hass);
    expect(result[0].icon).toBe('mdi:lightbulb');
    expect(result[0].icon_color).toBe('amber');
    expect(result[0].content).toBe('Luce');
  });

  it('light off → lightbulb-outline + grey', () => {
    const result = buildMushroomConfig([
      { type: 'light', entity: 'light.off', name: 'Luce' },
    ], hass);
    expect(result[0].icon).toBe('mdi:lightbulb-outline');
    expect(result[0].icon_color).toBe('grey');
  });

  it('cover open → amber, tap=toggle, hold=more-info', () => {
    const result = buildMushroomConfig([
      { type: 'cover', entity: 'cover.tapparella', name: 'Tapparella' },
    ], hass);
    expect(result[0].icon_color).toBe('amber');
    expect(result[0].tap_action).toEqual({ action: 'toggle', entity_id: 'cover.tapparella' });
    expect(result[0].hold_action).toEqual({ action: 'more-info', entity: 'cover.tapparella' });
  });

  it('climate cool → blue', () => {
    const result = buildMushroomConfig([
      { type: 'climate', entity: 'climate.ac', name: 'Clima' },
    ], hass);
    expect(result[0].icon_color).toBe('blue');
    expect(result[0].tap_action).toEqual({ action: 'more-info', entity: 'climate.ac' });
  });

  it('plant ok → green, no ⚠', () => {
    const result = buildMushroomConfig([
      { type: 'plant', entity: 'plant.mario', name: 'Mario' },
    ], hass);
    expect(result[0].icon_color).toBe('green');
    expect(result[0].content).toBe('Mario');
  });

  it('plant problem → red + ⚠', () => {
    const result = buildMushroomConfig([
      { type: 'plant', entity: 'plant.malata', name: 'Basilico' },
    ], hass);
    expect(result[0].icon_color).toBe('red');
    expect(result[0].content).toBe('Basilico ⚠');
  });

  it('action usa tap_action e hold_action dalla config', () => {
    const tapAction = { action: 'more-info' };
    const holdAction = { action: 'perform-action', perform_action: 'vacuum.start', target: { entity_id: 'vacuum.alfred' } };
    const result = buildMushroomConfig([
      { type: 'action', entity: 'vacuum.alfred', name: 'Alfred', icon: 'mdi:robot-vacuum', color_on: 'amber', tap_action: tapAction, hold_action: holdAction },
    ], hass);
    expect(result[0].tap_action).toEqual(tapAction);
    expect(result[0].hold_action).toEqual(holdAction);
  });

  it('chip senza entità in hass → state unavailable, non lancia eccezione', () => {
    expect(() => buildMushroomConfig([
      { type: 'light', entity: 'light.nonexistent', name: 'X' },
    ], hass)).not.toThrow();
  });

  it('array vuoto → array vuoto', () => {
    expect(buildMushroomConfig([], hass)).toEqual([]);
  });
});

describe('renderNativeChips', () => {
  it('genera HTML con classe rrc-chip', () => {
    const html = renderNativeChips([
      { type: 'light', entity: 'light.cucina', name: 'Luce' },
    ], hass, '#4E8062');
    expect(html).toContain('rrc-chip');
    expect(html).toContain('Luce');
    expect(html).toContain('mdi:lightbulb');
  });

  it('array vuoto → stringa vuota', () => {
    expect(renderNativeChips([], hass, '#4E8062')).toBe('');
  });
});
```

- [ ] **Step 2: Esegui per verificare che fallisca**

```bash
npm test
```

Expected: FAIL con "Cannot find module '../../src/components/RoomChips.js'"

- [ ] **Step 3: Crea src/components/RoomChips.js**

```js
import { getChipIcon } from '../utils/icons.js';
import { getChipColor } from '../utils/colors.js';

function getChipState(chip, hass) {
  return hass?.states?.[chip.entity]?.state ?? 'unavailable';
}

function resolveTapAction(chip) {
  if (chip.tap_action) return chip.tap_action;
  switch (chip.type) {
    case 'light':
    case 'cover':
    case 'switch':
      return { action: 'toggle', entity_id: chip.entity };
    case 'climate':
    case 'sensor':
    case 'plant':
    default:
      return { action: 'more-info', entity: chip.entity };
  }
}

function resolveHoldAction(chip) {
  if (chip.hold_action) return chip.hold_action;
  if (chip.type === 'cover') return { action: 'more-info', entity: chip.entity };
  return { action: 'none' };
}

export function buildMushroomConfig(chips, hass) {
  return (chips || []).map(chip => {
    const state = getChipState(chip, hass);
    const isProblem = chip.type === 'plant' && state !== 'ok';
    return {
      type: 'template',
      icon: getChipIcon(chip.type, state, chip),
      icon_color: getChipColor(chip.type, state, chip),
      content: chip.name + (isProblem ? ' ⚠' : ''),
      tap_action: resolveTapAction(chip),
      hold_action: resolveHoldAction(chip),
      card_mod: {
        style: ':host { --chip-background: rgba(255,255,255,0.07); }',
      },
    };
  });
}

export function renderNativeChips(chips, hass, accent) {
  return (chips || []).map(chip => {
    const state = getChipState(chip, hass);
    const icon = getChipIcon(chip.type, state, chip);
    const isProblem = chip.type === 'plant' && state !== 'ok';
    const label = chip.name + (isProblem ? ' ⚠' : '');
    return `<span class="rrc-chip" data-entity="${chip.entity}" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:99px;background:${accent}26;border:1px solid ${accent}66;font-size:0.82em;color:var(--primary-text-color);cursor:pointer;"><ha-icon icon="${icon}" style="--mdc-icon-size:16px;"></ha-icon>${label}</span>`;
  }).join('');
}
```

- [ ] **Step 4: Esegui i test**

```bash
npm test
```

Expected: tutti i test PASS, inclusi i nuovi test di RoomChips.

- [ ] **Step 5: Commit**

```bash
git add src/components/RoomChips.js test/components/RoomChips.test.js
git commit -m "feat: add RoomChips component"
```

---

## Task 8: src/ha-room-card.js

**Files:**
- Create: `src/ha-room-card.js`

Questo è il custom element principale. Il test è manuale in HA (nessun DOM HA disponibile in unit test).

- [ ] **Step 1: Crea src/ha-room-card.js**

```js
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
```

- [ ] **Step 2: Verifica che tutti i test passino**

```bash
npm test
```

Expected: tutti i test PASS.

- [ ] **Step 3: Commit**

```bash
git add src/ha-room-card.js
git commit -m "feat: add HaRoomCard custom element"
```

---

## Task 9: Build e verifica bundle

**Files:**
- Create: `dist/ha-room-card.js` (generato da rollup)
- Create: `README.md`

- [ ] **Step 1: Scrivi README.md**

```markdown
# ha-room-card

A custom Home Assistant card with a colored gradient header, configurable sensor info row, and quick-control chips.

## Dependencies

| Dependency | Required | Install via |
|-----------|----------|-------------|
| [mushroom-cards](https://github.com/piitaya/lovelace-mushroom) | **Required** (chips section) | HACS |
| [card-mod](https://github.com/thomasloven/lovelace-card-mod) | Optional | HACS |

## Installation

### HACS
Add this repository to HACS as a custom repository (Lovelace), then install **HA Room Card**.

### Manual
1. Copy `dist/ha-room-card.js` to `config/www/ha-room-card.js`
2. Add to Lovelace resources:
   ```yaml
   url: /local/ha-room-card.js
   type: module
   ```

## Configuration

```yaml
type: custom:ha-room-card
name: Cucina              # required
accent: "#4E8062"         # required — hex color
icon: mdi:silverware-fork-knife  # required — mdi icon

# Header actions (standard HA action format)
tap_action:
  action: navigate
  navigation_path: "#cucina"
hold_action:
  action: more-info
  entity: binary_sensor.sensori_movimento_cucina

# Sensors — ordered array, display order = array order
sensors:
  - type: presenza          # binary_sensor — always shown
    entity: binary_sensor.motion
  - type: porta             # binary_sensor — always shown, red when closed
    entity: binary_sensor.door
  - type: finestra          # binary_sensor — shown only when open (state=on)
    entity: binary_sensor.window
  - type: extra             # custom entity — flexible
    entity: switch.washing_machine
    icon_on: mdi:washing-machine
    icon_off: ~             # ~ = hide when inactive
    color_on: orange
    trigger: numeric        # check numeric_state instead of state
    trigger_entity: sensor.washing_machine_power
    above: 3
  - type: extra
    entity: climate.ac
    icon_on: mdi:air-conditioner
    icon_off: ~
    color_on: orange
    color_on_cool: blue     # special color when state == 'cool'
  - type: temperatura
    entity: sensor.temperature
  - type: umidita
    entity: sensor.humidity
  - type: lux
    entity: sensor.illuminance

# Chips — ordered list
chips:
  - type: light             # toggle, auto icon on/off
    entity: light.kitchen
    name: Luce

  - type: cover             # toggle (tap), more-info (hold)
    entity: cover.shutter
    name: Tapparella

  - type: sensor            # informational only, tap = more-info
    entity: binary_sensor.window
    name: Finestra
    icon_on: mdi:window-open-variant
    icon_off: mdi:window-closed-variant
    color_on: orange
    color_off: grey

  - type: climate           # tap = more-info, dynamic color
    entity: climate.ac
    name: Clima

  - type: switch            # toggle
    entity: switch.boiler
    name: Scaldabagno
    icon: mdi:water-boiler
    color_on: orange

  - type: action            # custom actions
    entity: vacuum.robot
    name: Robot
    icon: mdi:robot-vacuum
    color_on: amber
    tap_action:
      action: more-info
    hold_action:
      action: perform-action
      perform_action: vacuum.start
      target:
        entity_id: vacuum.robot

  - type: plant             # green if ok, red + ⚠ if problem
    entity: plant.basil
    name: Basilico
    tap_action:
      action: navigate
      navigation_path: "#piante"

# Visibility (standard HA syntax)
visibility:
  - condition: or
    conditions:
      - condition: state
        entity: input_select.room_selector
        state: All
      - condition: state
        entity: binary_sensor.motion
        state: "on"
```
```

- [ ] **Step 2: Build il bundle**

```bash
npm run build
```

Expected: `dist/ha-room-card.js` creato, nessun errore di rollup.

- [ ] **Step 3: Verifica che il bundle contenga la registrazione del custom element**

```bash
grep -c "ha-room-card" dist/ha-room-card.js
```

Expected: output `1` o superiore (la stringa è presente nel bundle minificato).

- [ ] **Step 4: Verifica dimensione bundle (deve essere < 50KB)**

```bash
wc -c dist/ha-room-card.js
```

Expected: < 51200 bytes.

- [ ] **Step 5: Commit finale**

```bash
git add dist/ha-room-card.js README.md
git commit -m "feat: add build output and README"
```

---

## Test manuale in Home Assistant

Dopo aver copiato `dist/ha-room-card.js` in HA e aggiunto la risorsa Lovelace:

1. **Aggiungi la risorsa:**
   In HA → Impostazioni → Dashboard → Menu → Gestisci risorse → Aggiungi risorsa
   URL: `/local/ha-room-card.js` — Tipo: Modulo JavaScript

2. **Config di test minimale:**
   ```yaml
   type: custom:ha-room-card
   name: Test
   accent: "#4E8062"
   icon: mdi:home
   ```
   Expected: card con header verde, nessuna chip, nessun crash.

3. **Test sensori:**
   Aggiungi una voce `sensors` con entità reali. Verifica che temperatura/umidità/lux mostrino i valori corretti.

4. **Test chip:**
   Aggiungi `chips` con un `type: light` e un'entità luce reale. Verifica che il tap faccia toggle.

5. **Test visibilità:**
   Aggiungi una condizione `visibility` che valuti a `false`. Verifica che la card sparisca (display: none).
