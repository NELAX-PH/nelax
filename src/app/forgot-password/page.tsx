'use client';

import Link from 'next/link';
import { Store, ArrowLeft, KeyRound } from 'lucide-react';
import { useState, ChangeEvent } from 'react';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let cleaned = val.replace(/[^a-zA-Z0-9@.]/g, '');

    if (/^\d{11}$/.test(cleaned)) {
      cleaned = cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }

    setIdentifier(cleaned);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-12 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to login
        </Link>

        <div className="card shadow-xl border-none">
          {!isSubmitted ? (
            <>
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
              <p className="text-muted-foreground mb-8">
                Enter your email or phone number and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    placeholder="0917 000 0000"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full py-4 font-bold text-lg rounded-xl"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Store className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Check your inbox</h2>
              <p className="text-muted-foreground mb-8">
                We've sent a password reset link to{' '}
                <span className="font-bold text-foreground">{identifier}</span>.
              </p>
              <Link
                href="/login"
                className="btn btn-primary w-full py-4 font-bold text-lg rounded-xl"
              >
                Return to Login
              </Link>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-6 text-sm font-medium text-primary hover:underline"
              >
                Didn't receive a link? Try again
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Still having trouble?{' '}
            <Link
              href="mailto:support@nelax.com"
              className="text-primary font-bold hover:underline"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
