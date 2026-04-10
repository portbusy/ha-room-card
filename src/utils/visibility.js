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
      return locations.some(loc => personStates.some(s => s === loc));
    }
    default:
      return true;
  }
}
