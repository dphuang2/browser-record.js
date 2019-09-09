import { record } from 'rrweb';
import Session from './session';
import {
  sendPayload,
  constructEventsPayload,
  isTrackableUser,
  sendBrowserInfo,
  sendPayloadWithBeacon,
} from './utils';

const SEND_DATA_INTERVAL = 3 * 1000; // 2 seconds
const EVENTS_MAX_THRESHOLD = 100; // Flush events when its too full
const RETRY_DELAY = 500; // 0.5 second
const RECORDING_FLAG = 'BR_IS_RECORDING';

const session = new Session();
let events = [];

function flushEvents() {
  if (events.length === 0) return;
  const payload = constructEventsPayload(events, session);
  events = [];
  sendPayload(payload);
}

function init() {
  if ((typeof Shopify) !== 'undefined') {
    sendBrowserInfo(session.id);

    record({
      emit(event) {
        events.push(event);
        if (!session.startTime) session.startTime = event.timestamp;
        if (events.length > EVENTS_MAX_THRESHOLD || event.type === 2) {
          flushEvents();
        }
      },
    });

    setInterval(() => {
      session.update();
      flushEvents();
    }, SEND_DATA_INTERVAL);

    window.addEventListener('unload', () => {
      if (events.length === 0) return;
      sendPayloadWithBeacon(constructEventsPayload(
        events,
        session,
      ));
    }, false);
  } else {
    // The "Shopify" variable might not be defined because it could
    // intialized after our script is loaded it so we initialize by using the event
    // loop until the "Shopify" variable is initialized.
    // Refer to
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop for
    // explanation on stack vs. event loop.
    setTimeout(init, RETRY_DELAY);
  }
}

// We only want to track users who support local storage the proper APIs
if (isTrackableUser()) {
  if (!window[RECORDING_FLAG]) {
    // Initialize our app
    init();
    window[RECORDING_FLAG] = true;
  }
}
