import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { UserPlus, PlusSquare, ShoppingCart, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: 'Create your shop profile',
      description: 'Sign up with your business name and location. It takes less than a minute.',
      icon: UserPlus,
    },
    {
      title: 'Add your products',
      description:
        'Enter your items, their cost, and selling price. Add barcodes if you have a scanner.',
      icon: PlusSquare,
    },
    {
      title: 'Start selling immediately',
      description:
        "Select items from your screen and click 'Charge'. The inventory updates instantly.",
      icon: ShoppingCart,
    },
    {
      title: 'Monitor your growth',
      description:
        'Check your dashboard at the end of the day to see your total profit and sales trends.',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <div className="bg-primary py-24 text-white text-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold sm:text-6xl mb-6">How It Works</h1>
            <p className="text-xl text-primary-foreground max-w-2xl mx-auto">
              Built for simplicity. You don't need to be a tech expert to use Nelax Systems.
            </p>
          </div>
        </div>

        <div className="py-24 mx-auto max-w-5xl px-4">
          <div className="space-y-24">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
              >
                <div className="flex-1">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary text-2xl font-bold mb-6">
                    {i + 1}
                  </div>
                  <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="mt-8 space-y-3">
                    <li className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-secondary" />
                      Works on Android & iOS
                    </li>
                    <li className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-secondary" />
                      Zero installation required
                    </li>
                  </ul>
                </div>
                <div className="flex-1 w-full aspect-video bg-accent rounded-3xl border border-gray-100 flex items-center justify-center shadow-inner">
                  <step.icon className="h-24 w-24 text-primary/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
