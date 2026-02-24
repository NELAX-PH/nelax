import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent, toCents } from '@/lib/paymongo';
import { logger } from '@/lib/logger';
import { rateLimiters, getIPFromRequest } from '@/lib/rate-limit';

/**
 * Rate limit: 20 payment intent creations per minute per IP
 */
const MAX_PAYMENT_ATTEMPTS = 20;
const PAYMENT_WINDOW_MS = 60 * 1000; // 1 minute

const PLANS = {
  lite: { amount: 0, name: 'Lite Plan' },
  pro_monthly: { amount: 499, name: 'Pro Plan (Monthly)' },
  pro_yearly: { amount: 4990, name: 'Pro Plan (Yearly)' },
};

export async function POST(request: NextRequest) {
  try {
    const identifier = getIPFromRequest(request);

    // Check rate limit
    const rateLimitResult = rateLimiters.api.check(
      identifier,
      MAX_PAYMENT_ATTEMPTS,
      PAYMENT_WINDOW_MS
    );

    if (rateLimitResult.limited) {
      logger.warn('Rate limit exceeded for payment intent creation', { ip: identifier });
      return NextResponse.json(
        { error: 'Too many payment attempts. Please wait before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'PHP', paymentMethod, planId, description, metadata } = body;

    if (!amount && !planId) {
      logger.warn('Payment intent creation with missing amount', { ip: identifier });
      return NextResponse.json({ error: 'Amount or planId is required' }, { status: 400 });
    }

    let finalAmount = amount;
    let finalDescription = description || 'Payment for Nelax Systems';
    let finalMetadata = metadata || {};

    // Handle plan-based payments
    if (planId && PLANS[planId as keyof typeof PLANS]) {
      const plan = PLANS[planId as keyof typeof PLANS];
      finalAmount = toCents(plan.amount);
      finalDescription = `Payment for ${plan.name}`;
      finalMetadata = {
        ...finalMetadata,
        planId,
        planName: plan.name,
      };
    } else {
      finalAmount = toCents(amount);
    }

    // Create payment intent
    const intent = await createPaymentIntent({
      amount: finalAmount,
      currency,
      payment_method: paymentMethod,
      description: finalDescription,
      metadata: finalMetadata,
    });

    logger.info('Payment intent created', {
      intentId: intent.id,
      amount: finalAmount,
      currency,
      ip: identifier,
    });

    return NextResponse.json(
      {
        success: true,
        paymentIntent: {
          id: intent.id,
          status: intent.attributes.status,
          amount: intent.attributes.amount,
          currency: intent.attributes.currency,
          clientSecret: intent.attributes.client_key,
          createdAt: intent.attributes.created_at,
        },
        rateLimit: {
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.resetTime,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Payment intent creation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to create payment intent. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve payment intent details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const intentId = searchParams.get('id');

    if (!intentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 });
    }

    const { getPaymentIntent } = await import('@/lib/paymongo');
    const intent = await getPaymentIntent(intentId);

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: intent.id,
        status: intent.attributes.status,
        amount: intent.attributes.amount,
        currency: intent.attributes.currency,
        lastPaymentError: intent.attributes.last_payment_error,
        createdAt: intent.attributes.created_at,
        updatedAt: intent.attributes.updated_at,
      },
    });
  } catch (error) {
    logger.error('Payment intent retrieval error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Failed to retrieve payment intent' }, { status: 500 });
  }
}
