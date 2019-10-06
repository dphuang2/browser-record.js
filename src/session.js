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
const LAST_ACTIVE_WINDOW_MIN = 30; // 30 minutes

function isNullOrNaN(obj) {
  return obj == null || isNaN(obj);
}

class Session {
  // This class defines the delimitation of sessions
  constructor() {
    this.updateUUIDAndLastActive();
    this.lastTotalCartPrice = isNullOrNaN(this.lastTotalCartPrice) ? 0 : this.lastTotalCartPrice;
    this.lastItemCount = isNullOrNaN(this.lastItemCount) ? 0 : this.lastItemCount;
    this.maxTotalCartPrice = isNullOrNaN(this.maxTotalCartPrice) ? 0 : this.maxTotalCartPrice;
    this.maxItemCount = isNullOrNaN(this.maxItemCount) ? 0 : this.maxItemCount;
  }

  get maxItemCount() { return storage.getItem(MAX_ITEM_COUNT_KEY); }
  set maxItemCount(count) { storage.setItem(MAX_ITEM_COUNT_KEY, count); }

  get maxTotalCartPrice() { return storage.getItem(MAX_TOTAL_CART_PRICE_KEY); }
  set maxTotalCartPrice(price) { storage.setItem(MAX_TOTAL_CART_PRICE_KEY, price); }

  get lastItemCount() { return storage.getItem(LAST_ITEM_COUNT_KEY); }
  set lastItemCount(count) { storage.setItem(LAST_ITEM_COUNT_KEY, count); }

  get lastTotalCartPrice() { return storage.getItem(LAST_TOTAL_CART_PRICE_KEY); }
  set lastTotalCartPrice(price) { storage.setItem(LAST_TOTAL_CART_PRICE_KEY, price); }

  get startTime() { return storage.getItem(START_TIME_KEY); }
  set startTime(time) { storage.setItem(START_TIME_KEY, time); }

  get lastActive() { return storage.getItem(LAST_ACTIVE_KEY); }
  set lastActive(time) { storage.setItem(LAST_ACTIVE_KEY, time); }

  get id() { return storage.getItem(SESSION_ID_KEY); }
  set id(id) { storage.setItem(SESSION_ID_KEY, id); }

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

  updateUUIDAndLastActive() {
    if (this.isNewSession()) {
      this.id = uuid();
    }
    this.lastActive = Date.now();
  }

  isNewSession() {
    const { lastActive } = this;
    const now = Date.now();
    return !lastActive || (now - lastActive) / 1000 / 60 >= LAST_ACTIVE_WINDOW_MIN;
  }
}

export default Session;
