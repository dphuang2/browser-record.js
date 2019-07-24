export function constructEventsPayload(events, id) {
  return {
    events,
    timestamp: Date.now(),
    shop: Shopify.shop,
    id,
  };
}

export function sendBrowserInfo(id) {
  navigator.sendBeacon(`${__API__}/customers`, id);
}

export function sendPayload(payload) {
  navigator.sendBeacon(`${__API__}/sessions`, JSON.stringify(payload));
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
  // We need the user to be on a Shopify store, support local storage, support
  // the navigator API, and support the navigator.sendBeacon function
  if (!storage) return false;
  if (typeof (navigator) === 'undefined') return false;
  if (typeof (navigator.sendBeacon) === 'undefined') return false;
  return true;
}
