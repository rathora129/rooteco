import crypto from 'node:crypto';

export const PAYMENT_PROVIDER = 'razorpay';

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return {
    keyId: keyId || '',
    keySecret: keySecret || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  };
}

export function paymentAvailability(settings) {
  const { keyId, keySecret, webhookSecret } = credentials();
  const configured = Boolean(keyId && keySecret);
  const webhookConfigured = Boolean(webhookSecret);
  const enabled = Boolean(configured && webhookConfigured && settings?.payments?.onlineEnabled);
  return {
    provider: PAYMENT_PROVIDER,
    configured,
    enabled,
    webhookConfigured,
    keyId: enabled ? keyId : null,
  };
}

function safeCompare(expected, received) {
  const a = Buffer.from(String(expected));
  const b = Buffer.from(String(received));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function verifyCheckoutSignature({ orderId, paymentId, signature }) {
  const { keySecret } = credentials();
  if (!keySecret || !orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return safeCompare(expected, signature);
}

export function verifyWebhookSignature(rawBody, signature) {
  const { webhookSecret } = credentials();
  if (!webhookSecret || !signature) return false;
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  return safeCompare(expected, signature);
}

export async function createRazorpayOrder({ amount, receipt, notes }) {
  const { keyId, keySecret } = credentials();
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured.');
  }

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt,
      notes,
      payment_capture: 1,
    }),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.id) {
    const message =
      payload?.error?.description ||
      payload?.error?.reason ||
      'The payment provider rejected the request.';
    throw new Error(message);
  }
  return payload;
}
