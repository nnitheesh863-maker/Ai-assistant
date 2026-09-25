const hitCounters = new Map();

/**
 * Creates an in-memory sliding window rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60,000ms = 1m)
 * @param {number} options.max - Max allowed requests per window (default: 100)
 * @param {string} options.message - Error message when rate limit is exceeded
 */
export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 100,
  message = 'Too many requests from this IP, please try again later.'
} = {}) {
  // Periodically clean up expired entries
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of hitCounters.entries()) {
      if (now - data.startTime > windowMs) {
        hitCounters.delete(key);
      }
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    let record = hitCounters.get(ip);
    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now };
      hitCounters.set(ip, record);
    } else {
      record.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((record.startTime + windowMs) / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        error: message
      });
    }

    next();
  };
}

export const apiLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 120 });
export const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many authentication attempts, please try again in 15 minutes.' });
