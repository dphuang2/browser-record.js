export function constructPayload(events, id) {
  return {
    events,
    timestamp: Date.now(),
    shop: Shopify.shop,
    id,
  };
}

export function sendPayload(payload) {
  const body = JSON.stringify(payload);
  fetch(__API__, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
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
