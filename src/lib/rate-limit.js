const attempts = new Map();

export function rateLimit(key, { limit = 8, windowMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || record.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  record.count += 1;
  const allowed = record.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - record.count),
    resetAt: record.resetAt,
  };
}

export function resetRateLimit(key) {
  attempts.delete(key);
}
