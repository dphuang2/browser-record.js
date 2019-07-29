export function constructEventsPayload(events, id) {
  return {
    events,
    timestamp: Date.now(),
    shop: Shopify.shop,
    id,
  };
}

function sendInfo(endpoint, body, headers) {
  fetch(`${__API__}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

export function sendBrowserInfo(id) {
  sendInfo('/customers', {
    id,
    shop: Shopify.shop,
  }, {});
}

export function sendPayload(payload) {
  sendInfo('/sessions', payload, {
    'Content-Type': 'application/json',
  });
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
  return true;
}
