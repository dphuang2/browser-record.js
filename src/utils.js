const CART_AJAX_API_URL = '/cart.js';

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

/**
 * This function's purpose is the intercept fetch responses
 * @param {*} urlmatch the substring match for intercepting the request
 * @param {*} callback the function to execute when a match is found
 */
function initInterceptFetch(urlmatch, callback) {
  const fetch = window.fetch;
  window.fetch = (...args) => (async (args) => {
    var response = await fetch(...args);
    if (response.url.includes(urlmatch)) {
      callback(response.clone());
    }
    return response;
  })(args);
}

/**
 * This function's purpose is the intercept AJAX responses
 * @param {*} urlmatch the substring match for intercepting the request
 * @param {*} callback the function to execute when a match is found
 */
function initInterceptAjax(urlmatch, callback) {
  let send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener('readystatechange', function () {
      if (this.responseURL.includes(urlmatch) && this.readyState === 4) {
        callback(this);
      }
    }, false);
    send.apply(this, arguments);
  };
};

/**
 * This function initializes the intercepts for the cart.js API
 * @param {*} callback function to call when fetch or AJAX is intercepted
 */
export function initCartIntercepts(callback) {
  initInterceptAjax(CART_AJAX_API_URL, callback);
  initInterceptFetch(CART_AJAX_API_URL, callback);
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
