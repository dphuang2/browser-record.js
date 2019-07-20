import { record, Replayer } from 'rrweb';
import Session from './session';
import { storage, sendPayload, constructPayload } from './utils';

const SEND_DATA_INTERVAL = 3 * 1000; // 5 seconds
const EVENTS_THRESHOLD = 10; // Reduce lambda invocations

const session = new Session();
let events = [];

// We only want to track users who support local storage
if (storage) {
  record({
    emit(event) {
      events.push(event);
    },
  });

  setInterval(() => {
    if (events.length < EVENTS_THRESHOLD) return;
    const payload = constructPayload(events, session.id);
    events = [];
    sendPayload(payload);
  }, SEND_DATA_INTERVAL);
}


export { record, Replayer };
