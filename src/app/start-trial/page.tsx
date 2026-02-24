'use client';

import Link from 'next/link';
import { Store, Gift, Clock, CreditCard } from 'lucide-react';
import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function StartTrial() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let cleaned = val.replace(/\D/g, '').substring(0, 11);

    if (cleaned.length === 11) {
      cleaned = cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }

    setPhone(cleaned);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 11) return;

    setLoading(true);
    // Redirect to get-started with the phone number
    const cleanPhone = phone.replace(/\s/g, '');
    router.push(`/get-started?phone=${cleanPhone}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <Store className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Nelax Systems</span>
          </Link>
          <div className="mx-auto h-20 w-20 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
            <Gift className="h-10 w-10 text-secondary" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Claim your free trial</h1>
          <p className="text-muted-foreground">Try all premium features free for 7 days.</p>
        </div>

        <div className="bg-accent/50 p-6 rounded-2xl mb-8 border border-accent">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            What's included:
          </h3>
          <ul className="space-y-3">
            {[
              { text: 'No commitment, cancel anytime', icon: Clock },
              { text: 'No credit card required now', icon: CreditCard },
              { text: 'Full shop management system', icon: Store },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium">
                <item.icon className="h-4 w-4 text-primary" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="tel"
            required
            value={phone}
            onChange={handlePhoneChange}
            placeholder="0900 000 0000"
            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary outline-none transition-all text-lg"
          />
          <button
            disabled={loading || phone.length < 11}
            className="btn btn-primary w-full py-5 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Redirecting...' : 'Start My Free Trial'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Need help?{' '}
          <Link
            href="mailto:support@nelax.com"
            className="text-primary font-medium hover:underline"
          >
            Chat with us
          </Link>
        </p>
      </div>
    </div>
  );
}
