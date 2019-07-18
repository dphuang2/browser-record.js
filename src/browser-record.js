import { record, Replayer } from 'rrweb';

function constructPayload(events) {
  return JSON.stringify({
      events,
      timestamp: Date.now()
  })
}

function init() {
  let events = [];

  record({
    emit(event) {
      events.push(event);
    },
  });

  function save() {
    const body = constructPayload(events);
    events = [];
    fetch('http://test.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
  }

  setInterval(save, 5 * 1000);
}

init();

export { record, Replayer }
