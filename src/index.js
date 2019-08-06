import { record } from 'rrweb';
import Session from './session';
import {
  sendPayload,
  constructEventsPayload,
  isTrackableUser,
  sendBrowserInfo,
  sendPayloadWithBeacon,
} from './utils';

const SEND_DATA_INTERVAL = 2 * 1000; // 2 seconds
const EVENTS_MAX_THRESHOLD = 20; // Flush events when its too full
const RETRY_DELAY = 500; // 0.5 second

const session = new Session();
let events = [];

function flushEvents() {
  if (events.length === 0) return;
  session.update();
  const payload = constructEventsPayload(events, session.id);
  events = [];
  sendPayload(payload);
}

function init() {
  // We only want to track users who support local storage the proper APIs
  if (isTrackableUser()) {
    if ((typeof Shopify) !== 'undefined') {
      session.update();
      sendBrowserInfo(session.id);

      record({
        emit(event) {
          events.push(event);
          if (events.length > EVENTS_MAX_THRESHOLD || event.type === 2) {
            flushEvents();
          }
        },
      });

      setInterval(flushEvents, SEND_DATA_INTERVAL);

      window.addEventListener('pagehide', () => {
        if (events.length === 0) return;
        session.update();
        sendPayloadWithBeacon(constructEventsPayload(
          events,
          session.id,
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
}

// Initialize our app
init();
