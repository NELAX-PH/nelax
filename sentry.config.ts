// This file configures Sentry for the application
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Sample rate for transactions
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Sample rate for session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filter errors
  beforeSend(event) {
    // Filter out errors from localhost in production
    if (process.env.NODE_ENV === 'production' && event.request?.url?.includes('localhost')) {
      return null;
    }
    return event;
  },

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes here
    }),
  ],
});
