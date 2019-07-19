export function constructPayload(events, sessionID) {
  return {
    events,
    timestamp: Date.now(),
    shop: Shopify.shop,
    sessionID,
  };
}

export function sendPayload(payload) {
  const body = JSON.stringify(payload);
  fetch(__API__, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });
}
