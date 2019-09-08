export function constructEventsPayload(events, session) {
  const mostRecentEvent = events[events.length - 1];
  return {
    events,
    timestamp: Date.now(),
    shop: Shopify.shop,
    id: session.id,
    sessionDuration: (mostRecentEvent.timestamp - session.startTime) / 1000,
  };
}

function sendInfoWithBeacon(endpoint, body) {
  navigator.sendBeacon(`${__API__}${endpoint}`, JSON.stringify(body));
}

function sendInfoWithFetch(endpoint, body) {
  fetch(`${__API__}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function sendBrowserInfo(id) {
  sendInfoWithFetch('/customers', {
    id,
    shop: Shopify.shop,
  });
}

export function sendPayload(payload) {
  sendInfoWithFetch('/sessions', payload);
}

export function sendPayloadWithBeacon(payload) {
  sendInfoWithBeacon(
    '/sessions',
    payload,
  );
}

// Feature detect local storage
function testStorage() {
  const uid = 'test';
  let storage;
  let result;
  try {
    (storage = window.localStorage).setItem(uid, uid);
    result = storage.getItem(uid) === uid;
    storage.removeItem(uid);
    return result && localStorage;
  } catch (exception) { return undefined; }
}
// This is undefined if localStorage is not supported
export const storage = testStorage();

export function isTrackableUser() {
  // We need the user to support local storage
  if (!storage) return false;
  if (!navigator) return false;
  if (!navigator.sendBeacon) return false;
  return true;
}
