import { record, Replayer } from 'rrweb';
import Session from './session';
import {
  storage, sendPayload, constructPayload, isShopifyApp,
} from './utils';

const SEND_DATA_INTERVAL = 5 * 1000; // 5 seconds
const EVENTS_THRESHOLD = 10; // Reduce lambda invocations

const session = new Session();
let events = [];

// We only want to track users who support local storage
if (storage && isShopifyApp()) {
  record({
    emit(event) {
      events.push(event);
    },
  });

  setInterval(() => {
    session.update();
    if (events.length < EVENTS_THRESHOLD) return;
    const payload = constructPayload(events, session.id);
    events = [];
    sendPayload(payload);
  }, SEND_DATA_INTERVAL);
}


export { record, Replayer };
