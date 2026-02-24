import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Check, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const faqs = [
    {
      q: 'Is there really no setup fee?',
      a: 'Yes. You only pay the monthly subscription. No hidden costs.',
    },
    {
      q: 'Can I use it on multiple phones?',
      a: 'Absolutely. You can log in from any device using your account credentials.',
    },
    {
      q: 'What happens if I lose my phone?',
      a: 'Your data is stored securely in the cloud. Just log in on a new device and everything will be there.',
    },
    {
      q: 'Do I need a barcode scanner?',
      a: "It's optional. You can search for products by name or category if you don't have a scanner.",
    },
  ];

  return (
    <div className="min-h-screen bg-accent/30">
      <Navbar />
      <main className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl mb-4">Pricing</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your shop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-200 flex flex-col">
              <div className="p-8 text-center border-b border-gray-100">
                <h2 className="text-xl font-bold mb-2 text-muted-foreground">Sari-Sari Lite</h2>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-4xl font-black">₱0</span>
                  <span className="text-muted-foreground text-lg">/mo</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground font-medium italic">
                  Perfect for small kiosks
                </p>
              </div>
              <div className="p-8 flex-grow">
                <ul className="space-y-4 mb-8">
                  {[
                    'Up to 50 inventory items',
                    'Basic daily sales records',
                    'Barcode scanning support',
                    'Mobile-only access',
                    'Weekly data backup',
                    'Community support',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-gray-400" />
                      </div>
                      <span className="text-foreground text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 pt-0">
                <Link
                  href="/get-started?plan=Lite"
                  className="btn border border-primary text-primary hover:bg-primary/5 w-full py-4 text-lg font-bold rounded-xl"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-primary relative flex flex-col scale-105 z-10">
              <div className="absolute top-0 right-0 bg-secondary text-white px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div className="bg-primary p-10 text-center text-white">
                <h2 className="text-2xl font-bold mb-2">Sari-Sari Pro</h2>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-5xl font-black">₱149</span>
                  <span className="text-primary-foreground/80 text-xl">/mo</span>
                </div>
                <p className="mt-4 text-primary-foreground/90 font-medium">
                  Full power for your growing business.
                </p>
              </div>
              <div className="p-10 flex-grow">
                <ul className="space-y-4 mb-8">
                  {[
                    'Unlimited inventory items',
                    'Advanced profit dashboards',
                    'Low-stock SMS alerts',
                    'Multi-device cloud sync',
                    'Daily automatic backup',
                    'Priority 24/7 support',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-secondary" />
                      </div>
                      <span className="text-foreground font-semibold">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-10 pt-0">
                <Link
                  href="/get-started?plan=Pro"
                  className="btn btn-primary w-full py-5 text-xl font-bold rounded-2xl shadow-lg shadow-primary/20"
                >
                  Start 7-Day Free Trial
                </Link>
                <p className="text-center mt-4 text-xs text-muted-foreground">
                  Cancel anytime. No hidden fees.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-32 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" />
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
