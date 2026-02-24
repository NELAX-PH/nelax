'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-32 h-32 bg-yellow-100 rounded-full mb-8">
          <div className="text-6xl font-bold text-yellow-600">404</div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>

        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. The page might have been removed or
          the URL might be incorrect.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="primary">Go Home</Button>
          </Link>
          <Button onClick={() => window.history.back()} variant="secondary">
            Go Back
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
              Dashboard
            </Link>
            <Link href="/pricing" className="text-blue-600 hover:text-blue-700 hover:underline">
              Pricing
            </Link>
            <Link href="/get-started" className="text-blue-600 hover:text-blue-700 hover:underline">
              Get Started
            </Link>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
