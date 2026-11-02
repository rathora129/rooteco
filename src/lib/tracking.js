export function trackEvent(type, { path, productId, metadata } = {}) {
  if (typeof window === 'undefined') return;
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      path: path || window.location.pathname,
      productId: productId || undefined,
      metadata: metadata || undefined,
    }),
    keepalive: true,
  }).catch(() => {});
}
