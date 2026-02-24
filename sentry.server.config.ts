import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || 'development',

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Server-side only integrations
  integrations: [],

  beforeSend(event) {
    // Don't send events from localhost in production
    if (process.env.NODE_ENV === 'production' && event.request?.url?.includes('localhost')) {
      return null;
    }
    return event;
  },
});
