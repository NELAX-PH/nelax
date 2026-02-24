import Paymongo from 'paymongo';

// Initialize PayMongo client
const paymongo = process.env.PAYMONGO_SECRET_KEY
  ? new Paymongo(process.env.PAYMONGO_SECRET_KEY)
  : null;

export interface PaymentIntentData {
  amount: number;
  currency?: string;
  payment_method?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentMethodData {
  type: string; // 'card', 'gcash', 'maya', 'grab_pay', 'dob_exc'
  details?: {
    card_number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  billing?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface WebhookSecret {
  secretKey: string;
}

/**
 * Create a payment intent
 */
export async function createPaymentIntent(data: PaymentIntentData) {
  if (!paymongo) {
    throw new Error('PayMongo not configured');
  }

  try {
    const response = await paymongo.paymentIntents.create({
      data: {
        attributes: {
          amount: data.amount, // in cents (multiply by 100)
          currency: data.currency || 'PHP',
          payment_method_allowed: data.payment_method
            ? [data.payment_method]
            : ['card', 'gcash', 'maya'],
          payment_method_options: {
            card: {
              request_three_d_secure: 'automatic',
            },
          },
          metadata: data.metadata || {},
        },
      },
    });

    return response.data;
  } catch (error) {
    console.error('PayMongo payment intent error:', error);
    throw error;
  }
}

/**
 * Attach a payment method to a payment intent
 */
export async function attachPaymentMethod(
  paymentIntentId: string,
  paymentMethodId: string,
  clientKey?: string
) {
  if (!paymongo) {
    throw new Error('PayMongo not configured');
  }

  try {
    const response = await paymongo.paymentIntents.attach(paymentIntentId, {
      data: {
        attributes: {
          payment_method: paymentMethodId,
          client_key: clientKey,
        },
      },
    });

    return response.data;
  } catch (error) {
    console.error('PayMongo attach payment method error:', error);
    throw error;
  }
}

/**
 * Create a payment method (client-side use only - never send raw card data to server)
 */
export async function createPaymentMethod(data: PaymentMethodData, publicKey?: string) {
  if (!publicKey && !process.env.PAYMONGO_PUBLIC_KEY) {
    throw new Error('PayMongo public key required for payment method creation');
  }

  const key = publicKey || process.env.PAYMONGO_PUBLIC_KEY;
  const client = new Paymongo(key!);

  try {
    const response = await client.paymentMethods.create({
      data: {
        attributes: data,
      },
    });

    return response.data;
  } catch (error) {
    console.error('PayMongo payment method error:', error);
    throw error;
  }
}

/**
 * Retrieve a payment intent by ID
 */
export async function getPaymentIntent(id: string) {
  if (!paymongo) {
    throw new Error('PayMongo not configured');
  }

  try {
    const response = await paymongo.paymentIntents.retrieve(id);
    return response.data;
  } catch (error) {
    console.error('PayMongo retrieve payment intent error:', error);
    throw error;
  }
}

/**
 * List webhooks
 */
export async function listWebhooks() {
  if (!paymongo) {
    throw new Error('PayMongo not configured');
  }

  try {
    const response = await paymongo.webhooks.list();
    return response.data;
  } catch (error) {
    console.error('PayMongo list webhooks error:', error);
    throw error;
  }
}

/**
 * Create a webhook
 */
export async function createWebhook(url: string, events: string[]) {
  if (!paymongo) {
    throw new Error('PayMongo not configured');
  }

  try {
    const response = await paymongo.webhooks.create({
      data: {
        attributes: {
          url: url,
          events: events,
        },
      },
    });

    return response.data;
  } catch (error) {
    console.error('PayMongo create webhook error:', error);
    throw error;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  secret: string
): boolean {
  // Implement signature verification logic
  // This is a simplified version - in production, use proper HMAC verification
  const parts = signatureHeader.split(',');
  const signature = parts[0].split('=')[1];
  const timestamp = parts[1].split('=')[1];

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Convert amount from Pesos to cents
 */
export const toCents = (amount: number): number => Math.round(amount * 100);

/**
 * Convert amount from cents to Pesos
 */
export const toPesos = (cents: number): number => cents / 100;

/**
 * Format amount for display
 */
export const formatAmount = (cents: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(toPesos(cents));
};
