interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every hour
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      60 * 60 * 1000
    );
  }

  private cleanup() {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }

  /**
   * Check if the request should be rate limited
   * @param identifier - unique identifier (IP, userId, email, etc.)
   * @param maxRequests - maximum number of requests allowed
   * @param windowMs - time window in milliseconds
   * @returns { limited: boolean, remaining: number, resetTime: number }
   */
  check(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60 * 1000
  ): { limited: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store[identifier];

    // Check if the entry exists and if it's within the time window
    if (entry && entry.resetTime > now) {
      // Entry exists and is still within the window
      if (entry.count >= maxRequests) {
        return {
          limited: true,
          remaining: 0,
          resetTime: entry.resetTime,
        };
      }

      // Increment the count
      entry.count++;
      return {
        limited: false,
        remaining: maxRequests - entry.count,
        resetTime: entry.resetTime,
      };
    }

    // Create a new entry
    this.store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };

    return {
      limited: false,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  /**
   * Reset the rate limit for a specific identifier
   */
  reset(identifier: string) {
    delete this.store[identifier];
  }

  /**
   * Get the current status for an identifier
   */
  getStatus(identifier: string): { count: number; resetTime: number } | null {
    const entry = this.store[identifier];
    if (!entry) return null;

    if (entry.resetTime < Date.now()) {
      delete this.store[identifier];
      return null;
    }

    return { count: entry.count, resetTime: entry.resetTime };
  }

  /**
   * Clean up the interval when the limiter is no longer needed
   */
  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Create singleton instances for different rate limits
export const rateLimiters = {
  // General API rate limiting: 100 requests per minute
  api: new RateLimiter(),

  // Auth endpoints: 10 requests per 5 minutes
  auth: new RateLimiter(),

  // Password reset: 3 requests per hour
  passwordReset: new RateLimiter(),

  // Email sending: 10 per hour
  email: new RateLimiter(),
};

/**
 * Rate limit middleware function for Next.js API routes
 */
export const rateLimit = (
  limiter: RateLimiter,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000
) => {
  return (identifier: string) => {
    const result = limiter.check(identifier, maxRequests, windowMs);

    if (result.limited) {
      const resetSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);
      throw new Error('Rate limit exceeded. Please wait before trying again.');
    }

    return result;
  };
};

/**
 * Helper to get IP address from request
 */
export const getIPFromRequest = (req: Request): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown';
};

/**
 * Helper to get user identifier based on available info
 */
export const getUserIdentifier = (req: Request, userId?: string, email?: string): string => {
  // Prefer userId, then email, then IP
  if (userId) return `user:${userId}`;
  if (email) return `email:${email}`;
  const ip = getIPFromRequest(req);
  return `ip:${ip}`;
};
