function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

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
    const label = escapeHtml(chip.name) + (isProblem ? ' ⚠' : '');
    return `<span class="rrc-chip" data-entity="${chip.entity}" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:99px;background:${accent}26;border:1px solid ${accent}66;font-size:0.82em;color:var(--primary-text-color);cursor:pointer;"><ha-icon icon="${icon}" style="--mdc-icon-size:16px;"></ha-icon>${label}</span>`;
  }).join('');
}
