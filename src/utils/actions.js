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
