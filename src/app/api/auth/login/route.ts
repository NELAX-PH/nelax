import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { rateLimiters, getIPFromRequest } from '@/lib/rate-limit';

/**
 * Rate limit: 10 login attempts per 5 minutes per IP
 */
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const identifier = getIPFromRequest(request);

    // Check rate limit
    const rateLimitResult = rateLimiters.auth.check(
      identifier,
      MAX_LOGIN_ATTEMPTS,
      LOGIN_WINDOW_MS
    );

    if (rateLimitResult.limited) {
      logger.warn('Rate limit exceeded for login', { ip: identifier });
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please wait before trying again.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': MAX_LOGIN_ATTEMPTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      logger.warn('Login attempt with missing credentials', { ip: identifier });
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // TODO: Implement actual authentication logic with Supabase
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });

    // For now, we'll return a success response with rate limit headers
    logger.info('Login attempt', { ip: identifier, email: maskEmail(email) });

    return NextResponse.json(
      {
        message: 'Login endpoint - implement Supabase auth',
        rateLimit: {
          limit: MAX_LOGIN_ATTEMPTS,
          remaining: rateLimitResult.remaining,
          reset: new Date(rateLimitResult.resetTime).toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': MAX_LOGIN_ATTEMPTS.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    );

    /*
    // Example with Supabase integration:
    const supabase = createServerComponentClient({ cookies: () => request.cookies });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn('Login failed', { ip: identifier, email: maskEmail(email), error: error.message });
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    logger.info('Login success', { ip: identifier, email: maskEmail(email), userId: data.user?.id });

    return NextResponse.json(
      { 
        success: true,
        user: { id: data.user?.id, email: data.user?.email },
        rateLimit: {
          limit: MAX_LOGIN_ATTEMPTS,
          remaining: rateLimitResult.remaining,
          reset: new Date(rateLimitResult.resetTime).toISOString(),
        }
      },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': MAX_LOGIN_ATTEMPTS.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        }
      }
    );
    */
  } catch (error) {
    logger.error('Login endpoint error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to mask email for logging
function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `***@${domain}`;
  }
  return `${username.slice(0, 2)}***@${domain}`;
}
