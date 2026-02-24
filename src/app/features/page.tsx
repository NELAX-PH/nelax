import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Zap, Package, BarChart3, Smartphone, Cloud, Lock, Users, History } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      title: 'Lightning Fast POS',
      description:
        'Record sales in less than 3 seconds. Designed for the busy rush hours of a sari-sari store.',
      icon: Zap,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Real-time Inventory',
      description: "Know exactly what's on your shelves. Automatic deductions with every sale.",
      icon: Package,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      title: 'Profit Insights',
      description: 'Understand your daily, weekly, and monthly earnings at a glance.',
      icon: BarChart3,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Mobile-First Design',
      description: 'No computer needed. Manage your entire business from any smartphone.',
      icon: Smartphone,
      color: 'text-foreground',
      bg: 'bg-gray-100',
    },
    {
      title: 'Offline Sync',
      description:
        "Slow internet? No problem. Record sales offline and sync when you're back online.",
      icon: Cloud,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Secure Data',
      description: 'Your business data is encrypted and backed up daily. Never lose your records.',
      icon: Lock,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      title: 'Multiple Logins',
      description: 'Add employees or family members with limited access to your records.',
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Transaction History',
      description: 'Easily look back at past sales to handle returns or verify payments.',
      icon: History,
      color: 'text-foreground',
      bg: 'bg-gray-100',
    },
  ];

  return (
    <div className="min-h-screen bg-accent/30">
      <Navbar />
      <main className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl mb-4">
              Powerful tools for <span className="text-primary">micro-retailers</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've stripped away the complexity of traditional POS systems to give you exactly what
              you need to grow your shop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`h-12 w-12 rounded-xl ${f.bg} flex items-center justify-center mb-6`}
                >
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
