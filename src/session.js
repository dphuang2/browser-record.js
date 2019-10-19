/* eslint class-methods-use-this: ["error", { "exceptMethods": ["lastActive", "id"] }] */
import uuid from 'uuid/v4';
import { storage, makeCartAjaxRequest } from './utils';

const SESSION_ID_KEY = 'session-id';
const LAST_ACTIVE_KEY = 'session-last-active';
const START_TIME_KEY = 'session-start-time';
const LAST_TOTAL_CART_PRICE_KEY = 'last-total-cart-price';
const LAST_ITEM_COUNT_KEY = 'last-item-count';
const MAX_TOTAL_CART_PRICE_KEY = 'max-total-cart-price';
const MAX_ITEM_COUNT_KEY = 'max-item-count';
const NUM_CLICKS_KEY = 'num-clicks';
const PAGE_LOADS_KEY = 'page-loads';
const LAST_ACTIVE_WINDOW_MIN = 30; // 30 minutes

function isNullOrNaN(obj) {
  return obj == null || isNaN(obj);
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function get(key) {
  return storage.getItem(key.hashCode());
}

function set(key, val) {
  return storage.setItem(key.hashCode(), val);
}

class Session {
  // This class defines the delimitation of sessions
  constructor() {
    this.updateSession();
    this.lastTotalCartPrice = isNullOrNaN(this.lastTotalCartPrice) ? 0 : this.lastTotalCartPrice;
    this.lastItemCount = isNullOrNaN(this.lastItemCount) ? 0 : this.lastItemCount;
    this.maxTotalCartPrice = isNullOrNaN(this.maxTotalCartPrice) ? 0 : this.maxTotalCartPrice;
    this.maxItemCount = isNullOrNaN(this.maxItemCount) ? 0 : this.maxItemCount;
    this.numClicks = isNullOrNaN(this.numClicks) ? 0 : this.numClicks;
    this.numPageLoads = isNullOrNaN(this.numPageLoads) ? 0 : this.numPageLoads;
    this.numPageLoads = Number(this.numPageLoads) + 1;
    if (!this.startTime) this.startTime = Date.now();
  }

  get numPageLoads() { return get(PAGE_LOADS_KEY); }

  set numPageLoads(numPageLoads) { set(PAGE_LOADS_KEY, numPageLoads); }

  get numClicks() { return get(NUM_CLICKS_KEY); }

  set numClicks(numClicks) { set(NUM_CLICKS_KEY, numClicks); }

  get maxItemCount() { return get(MAX_ITEM_COUNT_KEY); }

  set maxItemCount(count) { set(MAX_ITEM_COUNT_KEY, count); }

  get maxTotalCartPrice() { return get(MAX_TOTAL_CART_PRICE_KEY); }

  set maxTotalCartPrice(price) { set(MAX_TOTAL_CART_PRICE_KEY, price); }

  get lastItemCount() { return get(LAST_ITEM_COUNT_KEY); }

  set lastItemCount(count) { set(LAST_ITEM_COUNT_KEY, count); }

  get lastTotalCartPrice() { return get(LAST_TOTAL_CART_PRICE_KEY); }

  set lastTotalCartPrice(price) { set(LAST_TOTAL_CART_PRICE_KEY, price); }

  get startTime() { return get(START_TIME_KEY); }

  set startTime(time) { set(START_TIME_KEY, time); }

  get lastActive() { return get(LAST_ACTIVE_KEY); }

  set lastActive(time) { set(LAST_ACTIVE_KEY, time); }

  get id() { return get(SESSION_ID_KEY); }

  set id(id) { set(SESSION_ID_KEY, id); }

  updateCartData(totalCartPrice, itemCount) {
    if (isNaN(totalCartPrice) || isNaN(itemCount)) {
      /**
       * In the case that the data returned does not yield and updated cart
       * values, lets make a manual request to the /cart.js endpoint to get a
       * proper Cart JSON object that we can update our session member variables
       * with
       */
      makeCartAjaxRequest();
      return;
    }
    this.lastItemCount = itemCount;
    this.lastTotalCartPrice = totalCartPrice;
    this.maxItemCount = Math.max(itemCount, this.maxItemCount);
    this.maxTotalCartPrice = Math.max(totalCartPrice, this.maxTotalCartPrice);
  }

  updateSession() {
    if (this.isNewSession()) {
      this.id = uuid();
      this.startTime = Date.now();
      this.lastTotalCartPrice = 0;
      this.lastItemCount = 0;
      this.maxTotalCartPrice = 0;
      this.maxItemCount = 0;
      this.numPageLoads = 0;
      this.numClicks = 0;
    }
    this.lastActive = Date.now();
  }

  isNewSession() {
    const { lastActive } = this;
    const now = Date.now();
    const minutesSinceLastActive = (now - lastActive) / 1000 / 60;
    return !lastActive || minutesSinceLastActive >= LAST_ACTIVE_WINDOW_MIN;
  }
}

export default Session;
