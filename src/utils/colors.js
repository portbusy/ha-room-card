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
  grey: COLORS.dimmed,
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
    case 'extra':
      if (sensor.color_on_cool && state === 'cool') {
        return resolveColorName(sensor.color_on_cool);
      }
      return resolveColorName(sensor.color_on || 'orange');
    default:
      return 'white';
  }
}
