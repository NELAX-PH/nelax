import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, toPesos } from '@/lib/paymongo';
import { logger } from '@/lib/logger';

type WebhookEvent = {
  id: string;
  type: string;
  data: {
    attributes: {
      data?: any;
      amount?: number;
      currency?: string;
      status?: string;
      payment_intent?: {
        id: string;
        attributes: any;
      };
    };
  };
};

// Webhook events handled
const SUPPORTED_EVENTS = [
  'payment_intent.payment_succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
  'payment.paid',
  'payment.failed',
];

export async function POST(request: NextRequest) {
  try {
    const signatureHeader = request.headers.get('paymongo-signature');

    if (!signatureHeader) {
      logger.warn('Webhook received without signature');
      return NextResponse.json({ error: 'Missing signature header' }, { status: 401 });
    }

    // Get raw body text for signature verification
    const payload = await request.text();

    // Verify webhook signature
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('PAYMONGO_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const isValid = verifyWebhookSignature(payload, signatureHeader, webhookSecret);

    if (!isValid) {
      logger.warn('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: WebhookEvent = JSON.parse(payload);

    // Check if event type is supported
    if (!SUPPORTED_EVENTS.includes(event.type)) {
      logger.info('Unsupported webhook event type', { eventType: event.type });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Handle different webhook events
    switch (event.type) {
      case 'payment_intent.payment_succeeded':
        await handlePaymentIntentSucceeded(event);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event);
        break;

      case 'payment.paid':
        await handlePaymentPaid(event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event);
        break;

      default:
        logger.info('Unhandled webhook event type', { eventType: event.type });
    }

    logger.info('Webhook processed successfully', {
      eventId: event.id,
      eventType: event.type,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error('Webhook processing error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Return 200 even on error to avoid duplicate webhook deliveries
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

async function handlePaymentIntentSucceeded(event: WebhookEvent) {
  try {
    const { data } = event.data.attributes;
    const amount = data.amount || 0;
    const currency = data.currency || 'PHP';

    logger.info('Payment intent succeeded', {
      intentId: event.id,
      amount: toPesos(amount),
      currency,
    });

    // TODO: Implement business logic:
    // 1. Update database with successful payment
    // 2. Grant access to user
    // 3. Send confirmation email
    // 4. Update subscription status

    // Example: const supabase = createServerComponentClient();
    // await supabase.from('payments').insert({ ... });
  } catch (error) {
    logger.error('Error handling payment intent succeeded', { error });
  }
}

async function handlePaymentIntentFailed(event: WebhookEvent) {
  try {
    const { data } = event.data.attributes;
    const amount = data.amount || 0;
    const currency = data.currency || 'PHP';

    logger.warn('Payment intent failed', {
      intentId: event.id,
      amount: toPesos(amount),
      currency,
    });

    // TODO: Implement business logic:
    // 1. Update database with failed payment
    // 2. Send notification to user
    // 3. Handle retry logic if applicable
  } catch (error) {
    logger.error('Error handling payment intent failed', { error });
  }
}

async function handlePaymentPaid(event: WebhookEvent) {
  try {
    logger.info('Payment paid', { paymentId: event.id });

    // TODO: Implement business logic for payment confirmation
  } catch (error) {
    logger.error('Error handling payment paid', { error });
  }
}

async function handlePaymentFailed(event: WebhookEvent) {
  try {
    logger.warn('Payment failed', { paymentId: event.id });

    // TODO: Implement business logic for payment failure
  } catch (error) {
    logger.error('Error handling payment failed', { error });
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
