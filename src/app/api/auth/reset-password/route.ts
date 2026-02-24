import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { rateLimiters, getIPFromRequest } from '@/lib/rate-limit';
import { sendEmail, emailTemplates } from '@/lib/email';

/**
 * Rate limit: 3 password reset requests per hour per email/IP
 */
const MAX_PASSWORD_RESET_REQUESTS = 3;
const PASSWORD_RESET_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
  try {
    const identifier = getIPFromRequest(request);

    // Check rate limit
    const rateLimitResult = rateLimiters.passwordReset.check(
      identifier,
      MAX_PASSWORD_RESET_REQUESTS,
      PASSWORD_RESET_WINDOW_MS
    );

    if (rateLimitResult.limited) {
      logger.warn('Rate limit exceeded for password reset', { ip: identifier });
      return NextResponse.json(
        {
          error: 'Too many password reset requests. Please wait before trying again.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': MAX_PASSWORD_RESET_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      logger.warn('Password reset attempt with missing email', { ip: identifier });
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // TODO: Implement actual password reset logic with Supabase
    // const supabase = createServerComponentClient();
    // const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    //   redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    // });

    // For now, we'll generate a reset link
    const resetToken = generateResetToken(email);
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    logger.info('Password reset requested', { ip: identifier, email: maskEmail(email) });

    // Send reset email
    const emailResult = await sendEmail(emailTemplates.passwordReset(email, resetLink));

    if (!emailResult.success) {
      logger.warn('Failed to send password reset email', {
        ip: identifier,
        email: maskEmail(email),
      });
      // Don't expose email service errors to the user
    }

    // Always return success for security reasons (to prevent email enumeration)
    return NextResponse.json(
      {
        message: 'If an account exists with this email, you will receive a password reset link.',
        rateLimit: {
          limit: MAX_PASSWORD_RESET_REQUESTS,
          remaining: rateLimitResult.remaining,
          reset: new Date(rateLimitResult.resetTime).toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': MAX_PASSWORD_RESET_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    );
  } catch (error) {
    logger.error('Password reset endpoint error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate a reset token
function generateResetToken(email: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  // In production, use a proper JWT or crypto library
  return Buffer.from(`${email}:${timestamp}:${random}`).toString('base64');
}

// Helper function to mask email for logging
function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `***@${domain}`;
  }
  return `${username.slice(0, 2)}***@${domain}`;
}
