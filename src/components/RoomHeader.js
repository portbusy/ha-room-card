function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

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
    case 'presenza': {
      const icon = getHeaderIcon('presenza', state);
      if (!icon) return '';
      return iconSpan(icon, getHeaderSensorColor(sensor, hass));
    }

    case 'porta': {
      const icon = getHeaderIcon('porta', state);
      if (!icon) return '';
      return iconSpan(icon, getHeaderSensorColor(sensor, hass));
    }

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

  return `<div class="rrc-header" style="background:linear-gradient(120deg,${accent} 0%,${accent}80 40%,${accent}26 70%,${accent}00 100%);border-radius:22px 22px 0 0;padding:16px 18px 18px 18px;position:relative;overflow:hidden;"><ha-icon icon="${escapeHtml(config.icon || 'mdi:home')}" style="position:absolute;top:0;right:0;color:${accent}A6;--mdc-icon-size:36px;"></ha-icon><div style="font-size:1.1em;font-weight:600;margin-bottom:7px;color:white;">${escapeHtml(config.name || '')}</div><div style="display:flex;flex-wrap:nowrap;align-items:center;gap:10px;font-size:0.82em;color:white;opacity:0.9;">${sensorsHtml}</div></div>`;
}
