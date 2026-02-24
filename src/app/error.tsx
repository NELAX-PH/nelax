'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error('Application error:', error);

    // Log to our custom logger
    try {
      const { logger } = require('@/lib/logger');
      logger.error('Application error occurred', { digest: error.digest }, error);
      // @ts-ignore - Sentry
      if (typeof Sentry !== 'undefined') {
        // @ts-ignore
        Sentry.captureException(error);
      }
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
          <p className="text-gray-600">We encountered an error while processing your request.</p>
        </div>

        <ErrorMessage
          message={error.message || 'An unexpected error occurred. Please try again.'}
          onRetry={reset}
          className="mb-6"
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What you can do:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
            <li>• Clear your browser cache</li>
            <li>• If the problem persists, contact our support team</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="primary">
            Try Again
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="secondary">
            Go Home
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-gray-400 mt-6 text-center">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
