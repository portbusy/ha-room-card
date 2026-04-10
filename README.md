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
