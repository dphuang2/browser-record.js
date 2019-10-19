import { record } from 'rrweb';
import Session from './session';
import {
  sendPayload,
  constructEventsPayload,
  isTrackableUser,
  sendBrowserInfo,
  sendPayloadWithBeacon,
  initCartIntercepts,
  initClickIntercepts,
} from './utils';

const SEND_DATA_INTERVAL = 3 * 1000; // 2 seconds
const EVENTS_MAX_THRESHOLD = 100; // Flush events when its too full
const RETRY_DELAY = 500; // 0.5 second
const RECORDING_FLAG = 'LOOPR_ENABLED';

const session = new Session();
let events = [];

function flushEvents() {
  if (events.length === 0) return;
  const payload = constructEventsPayload(events, session);
  events = [];
  sendPayload(payload);
}

function handleCartJSON(json) {
  const { total_price, item_count } = json;
  session.updateCartData(total_price, item_count);
}

async function handleCartResponse(response) {
  if (response instanceof XMLHttpRequest) {
    handleCartJSON(JSON.parse(response.response))
  } else if (response instanceof Response) {
    handleCartJSON(await response.json());
  }
}

function handleNewClick(event) {
  session.numClicks = Number(session.numClicks) + 1;
}

function init() {
  if ((typeof Shopify) !== 'undefined') {
    sendBrowserInfo(session.id);
    initCartIntercepts(handleCartResponse);
    initClickIntercepts(handleNewClick);
    session.numPageLoads = Number(session.numPageLoads) + 1;
    if (!session.startTime) session.startTime = Date.now();
    record({
      emit(event) {
        events.push(event);
        if (events.length > EVENTS_MAX_THRESHOLD || event.type === 2) {
          flushEvents();
        }
      },
    });

    setInterval(() => {
      session.updateSession();
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
