const CART_AJAX_API_URL_BASE = '/cart';
const CART_AJAX_API_URL = '.js';
const CART_UPDATE_AJAX_API_URL = '/update.js';
const CART_CHANGE_AJAX_API_URL = '/change.js';
const CART_CLEAR_AJAX_API_URL = '/clear.js';

export function constructEventsPayload(events, session) {
  const mostRecentEvent = events[events.length - 1];
  return {
    events,
    timestamp: Date.now(), // To order the chunks
    shop: Shopify.shop,
    id: session.id,
    startTime: session.startTime,
    sessionDuration: (mostRecentEvent.timestamp - session.startTime) / 1000,
    lastTotalCartPrice: session.lastTotalCartPrice,
    lastItemCount: session.lastItemCount,
    maxTotalCartPrice: session.maxTotalCartPrice,
    maxItemCount: session.maxItemCount,
    numClicks: session.numClicks,
    pageLoads: session.numPageLoads,
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

function matchesEnd(string, prefix) {
  return string.match(`${prefix}.*$`);
}

function urlMatchesCartResponseURL(url) {
  if (url.includes(CART_AJAX_API_URL_BASE)) {
    if (matchesEnd(url, CART_AJAX_API_URL) ||
      matchesEnd(url, CART_UPDATE_AJAX_API_URL) ||
      matchesEnd(url, CART_CHANGE_AJAX_API_URL) ||
      matchesEnd(url, CART_CLEAR_AJAX_API_URL)) {
      return true;
    }
  }
  return false;
}

/**
 * This function's purpose is the intercept fetch responses
 * @param {*} callback the function to execute when a match is found
 */
function initInterceptFetch(callback) {
  const fetch = window.fetch;
  window.fetch = (...args) => (async (args) => {
    var response = await fetch(...args);
    if (urlMatchesCartResponseURL(response.url)) {
      callback(response.clone());
    }
    return response;
  })(args);
}

/**
 * This function's purpose is the intercept AJAX responses
 * @param {*} callback the function to execute when a match is found
 */
function initInterceptAjax(callback) {
  let send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener('readystatechange', function () {
      if (urlMatchesCartResponseURL(this.responseURL) && this.readyState === 4) {
        callback(this);
      }
    }, false);
    send.apply(this, arguments);
  };
};

export function initClickIntercepts(callback) {
  document.addEventListener('click', callback, false);
}

export function makeCartAjaxRequest() {
  fetch('/cart.js');
}

/**
 * This function initializes the intercepts for the cart.js API
 * @param {*} callback function to call when fetch or AJAX is intercepted
 */
export function initCartIntercepts(callback) {
  initInterceptAjax(callback);
  initInterceptFetch(callback);
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
