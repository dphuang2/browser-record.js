import { record, Replayer } from 'rrweb';
import Session from './session';
import { sendPayload, constructPayload } from './utils';

const SEND_DATA_INTERVAL = 5 * 1000; // 5 seconds

const session = new Session();
let events = [];

record({
  emit(event) {
    events.push(event);
  },
});

setInterval(() => {
  const payload = constructPayload(events, session.id);
  events = [];
  sendPayload(payload);
}, SEND_DATA_INTERVAL);

export { record, Replayer };
