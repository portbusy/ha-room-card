export function getChipIcon(type, state, config) {
  config = config || {};
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
