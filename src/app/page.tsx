import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  Zap,
  BarChart3,
  Package,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6">
                Manage your shop <br />
                <span className="text-primary">faster and easier.</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
                The simple, affordable POS and inventory system built specifically for sari-sari
                stores and small groceries. No complex setup—just results.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/start-trial"
                  className="btn btn-primary text-lg px-8 py-6 w-full sm:w-auto shadow-lg shadow-primary/25"
                >
                  Start Your 7-Day Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="btn bg-white border border-gray-200 text-lg px-8 py-6 w-full sm:w-auto hover:bg-gray-50"
                >
                  See How It Works
                </Link>
              </div>
              <div className="mt-12 flex items-center justify-center gap-8 text-muted-foreground grayscale opacity-70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-medium">Safe & Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">Built for Growth</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
                Everything you need, nothing you don't
              </h2>
              <p className="text-muted-foreground text-lg">
                Designed for speed and simplicity on any device.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card border-none bg-accent/50">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Fast Sales Recording</h3>
                <p className="text-muted-foreground">
                  Record transactions in seconds. Works perfectly on your phone, tablet, or laptop.
                </p>
              </div>
              <div className="card border-none bg-accent/50">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
                  <Package className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Inventory</h3>
                <p className="text-muted-foreground">
                  Automatic stock deduction and low-stock alerts so you never run out of
                  best-sellers.
                </p>
              </div>
              <div className="card border-none bg-accent/50">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Daily Profit Reports</h3>
                <p className="text-muted-foreground">
                  See exactly how much you earned today, this week, or this month with simple
                  charts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
                Start managing in 3 easy steps
              </h2>
            </div>
            <div className="flex flex-col md:flex-row gap-12 justify-between items-start">
              <div className="flex-1 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2">Create Account</h3>
                <p className="text-muted-foreground">
                  Sign up in 30 seconds with just your email or phone number.
                </p>
              </div>
              <div className="flex-1 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">Add Products</h3>
                <p className="text-muted-foreground">
                  List your items and their prices. Our system is built for fast data entry.
                </p>
              </div>
              <div className="flex-1 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">Record Sales</h3>
                <p className="text-muted-foreground">
                  Start selling! View your profit dashboard update in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
                Simple, honest pricing
              </h2>
              <p className="text-muted-foreground text-lg">
                Choose the best plan for your shop's needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Lite Plan */}
              <div className="card border-gray-200 bg-white flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Sari-Sari Lite</h3>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-4xl font-extrabold">₱0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {[
                    'Up to 50 Products',
                    'Daily Sales Records',
                    'Barcode Scanning',
                    'Weekly Backups',
                    'Mobile Access',
                    'Community Support',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-gray-300 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/get-started"
                  className="btn border border-primary text-primary hover:bg-primary/5 w-full py-4 font-bold"
                >
                  Start for Free
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="card border-2 border-primary ring-4 ring-primary/5 relative scale-105 shadow-xl flex flex-col">
                <div className="absolute top-0 right-0 bg-secondary text-white px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg">
                  Recommended
                </div>
                <div className="text-center mb-8">
                  <h3 className="text-lg font-medium text-primary mb-2">Sari-Sari Pro</h3>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-4xl font-extrabold">₱149</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-xs text-secondary font-medium">Full business features</p>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {[
                    'Unlimited Products',
                    'Unlimited Sales Records',
                    'Profit Analytics',
                    'Daily Cloud Sync',
                    'Multi-Device Access',
                    'Priority Support',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/get-started" className="btn btn-primary w-full py-4 font-bold">
                  Get Started Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-24 bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl font-bold mb-6 sm:text-4xl">Ready to grow your business?</h2>
            <p className="text-primary-foreground/90 text-lg mb-10 max-w-2xl mx-auto">
              Join hundreds of shop owners in the Philippines who are simplifying their daily
              operations with Nelax Systems.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/pricing"
                className="btn bg-white text-primary hover:bg-gray-100 text-lg px-10 py-4 w-full sm:w-auto font-bold"
              >
                Join Now
              </Link>
              <Link
                href="mailto:support@nelax.com"
                className="btn border border-white text-white hover:bg-white/10 text-lg px-10 py-4 w-full sm:w-auto"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
