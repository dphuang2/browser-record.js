import uuid from 'uuid/v4';
import store from 'store-js';
import cookie from 'cookie';

const SESSION_ID_KEY = 'session-id';
const EXPIRE_WINDOW = 600 * 1000; // 10 minutes

class Session {
  /*
   *This class defines a session and its metadata
   */
  constructor() {
    const previousSession = this.getCookie(SESSION_ID_KEY);
    if (previousSession) {
      this.uuid = previousSession;
      const previousExpire = store.getExpiration(SESSION_ID_KEY);
      store.set(
        SESSION_ID_KEY,
        previousSession,
        previousExpire + EXPIRE_WINDOW,
      );
    } else {
      store.set(SESSION_ID_KEY, uuid(), Date.now() + EXPIRE_WINDOW);
    }
  }

  static getCookie(key) {
    const cookies = cookie.parse(document.cookie);
    if (key in cookies) return cookies[key];
    return null;
  }

  static setCookie(key, value, expire) {
    document.cookie = cookie.serialize(key, value, {
      expires: expire,
    });
  }

  static updateExpire() {
    store.set(
      SESSION_ID_KEY,
      store.get(SESSION_ID_KEY),
      store.getExpiration(SESSION_ID_KEY) + EXPIRE_WINDOW,
    );
  }
}

export default Session;
