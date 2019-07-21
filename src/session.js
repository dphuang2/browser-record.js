/* eslint class-methods-use-this: ["error", { "exceptMethods": ["lastActive", "id"] }] */
import uuid from 'uuid/v4';
import { storage } from './utils';

const SESSION_ID_KEY = 'session-id';
const LAST_ACTIVE_KEY = 'session-last-active';
const LAST_ACTIVE_WINDOW_MIN = 30; // 30 minutes

class Session {
  // This class defines the delimitation of sessions
  constructor() {
    this.update();
  }

  get lastActive() {
    return storage.getItem(LAST_ACTIVE_KEY);
  }

  set lastActive(time) {
    storage.setItem(LAST_ACTIVE_KEY, time);
  }

  get id() {
    return storage.getItem(SESSION_ID_KEY);
  }

  set id(id) {
    storage.setItem(SESSION_ID_KEY, id);
  }

  update() {
    if (this.isNewSession()) this.id = uuid();
    this.lastActive = Date.now();
  }

  isNewSession() {
    const { lastActive } = this;
    const now = Date.now();
    return !lastActive || (now - lastActive) / 1000 / 60 >= LAST_ACTIVE_WINDOW_MIN;
  }
}

export default Session;
