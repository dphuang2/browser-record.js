/* eslint class-methods-use-this: ["error", { "exceptMethods": ["lastActive", "id"] }] */
import uuid from 'uuid/v4';
import store from 'store-js';

const SESSION_ID_KEY = 'session-id';
const LAST_ACTIVE_KEY = 'session-last-active';
const LAST_ACTIVE_WINDOW_MIN = 30; // 30 minutes

class Session {
  // This class defines a session. It automatically updates the id if we are in
  // a new session. The only thing the client needs to do is retrieve the id
  // member variable.
  constructor() {
    this.update();
  }

  get lastActive() {
    return store.get(LAST_ACTIVE_KEY);
  }

  set lastActive(time) {
    store.set(LAST_ACTIVE_KEY, time);
  }

  get id() {
    // This line is crucial to how this class works. It guarantees that the id
    // of the session is either unchanged or renewed based on the last activity
    // whenever the id is retrieved
    this.update();

    return store.get(SESSION_ID_KEY);
  }

  set id(id) {
    store.set(SESSION_ID_KEY, id);
  }

  update() {
    if (this.isNewSession()) {
      this.lastActive = Date.now();
      this.id = uuid();
    } else {
      this.lastActive = Date.now();
    }
  }

  isNewSession() {
    const { lastActive } = this;
    const now = Date.now();
    return !lastActive || (now - lastActive) / 1000 / 60 >= LAST_ACTIVE_WINDOW_MIN;
  }
}

export default Session;
