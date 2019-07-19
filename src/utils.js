export function constructPayload(events, uuid) {
  return {
    events,
    timestamp: Date.now(),
    shop: Shopify.shop,
    sessionID: uuid,
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
