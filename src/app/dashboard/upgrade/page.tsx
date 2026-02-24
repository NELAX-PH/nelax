'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Crown, Zap, Shield, BarChart3, Users } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const plan = user?.user_metadata?.plan || 'Lite';

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    }
    checkUser();
  }, [router]);

  const handleUpgrade = async () => {
    if (!user) return;

    setProcessing(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          plan: 'Pro',
        },
      });

      if (error) {
        console.error('Upgrade error:', error);
        toast.error(error.message || 'Failed to upgrade plan');
      } else {
        toast.success('Successfully upgraded to Pro plan!');

        // Refresh user data
        const {
          data: { user: refreshedUser },
        } = await supabase.auth.getUser();
        if (refreshedUser) {
          setUser(refreshedUser);
        }

        // Redirect to dashboard after delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message || 'Failed to upgrade plan');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return null;

  return (
    <DashboardLayout currentPage="/dashboard/upgrade">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => router.push('/dashboard/settings')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </button>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Upgrade Your Plan</h1>
          <p className="text-muted-foreground">
            Unlock powerful features to grow your sari-sari store business.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Lite Plan */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Lite</h3>
                <p className="text-xs text-muted-foreground">Basic features</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-3xl md:text-4xl font-black">Free</span>
              <span className="text-muted-foreground ml-1">forever</span>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>Up to 50 products</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>Basic sales tracking</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>Low stock alerts</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 border border-gray-300 rounded shrink-0" />
                <span>Limited reports</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 border border-gray-300 rounded shrink-0" />
                <span>Single user</span>
              </li>
            </ul>

            {plan === 'Lite' && (
              <button
                disabled
                className="w-full btn py-3 rounded-xl text-sm font-bold border border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
              >
                Current Plan
              </button>
            )}
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl md:rounded-3xl border-2 border-primary shadow-sm p-6 md:p-8 relative">
            <div className="absolute -top-3 right-6 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
              Popular
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary">Pro</h3>
                <p className="text-xs text-muted-foreground">Full access</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-3xl md:text-4xl font-black text-primary">&#8369;149</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span className="font-semibold">Unlimited products</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span className="font-semibold">Advanced analytics dashboard</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span className="font-semibold">Custom reports & exports</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span className="font-semibold">Multi-user support</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span className="font-semibold">Priority support</span>
              </li>
            </ul>

            {plan === 'Lite' ? (
              <button
                onClick={handleUpgrade}
                disabled={processing}
                className="w-full btn btn-primary py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                {processing ? 'Processing...' : 'Upgrade to Pro'}
              </button>
            ) : (
              <button
                disabled
                className="w-full btn py-3 rounded-xl text-sm font-bold border border-primary bg-primary/10 text-primary cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                Current Plan
              </button>
            )}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Feature Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Lite</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-primary">Pro</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-50">
                  <td className="py-3 px-4">Products</td>
                  <td className="py-3 px-4 text-center">50 max</td>
                  <td className="py-3 px-4 text-center font-semibold text-primary">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 px-4">Users</td>
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 px-4 text-center font-semibold text-primary">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 px-4">Sales Reports</td>
                  <td className="py-3 px-4 text-center">Basic</td>
                  <td className="py-3 px-4 text-center font-semibold text-primary">Advanced</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 px-4">Inventory Reports</td>
                  <td className="py-3 px-4 text-center">Basic</td>
                  <td className="py-3 px-4 text-center font-semibold text-primary">Advanced</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 px-4">Export Data</td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-5 w-5 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                      <div className="h-2 w-2 bg-gray-400 rounded-full" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-5 w-5 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Multi-user Access</td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-5 w-5 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                      <div className="h-2 w-2 bg-gray-400 rounded-full" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-5 w-5 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 space-y-4">
          <h2 className="text-lg md:text-xl font-bold">Frequently Asked Questions</h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold mb-2">Can I cancel my Pro subscription?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your Pro subscription at any time. You'll continue to have access
              until the end of your billing period.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground">
              We accept credit/debit cards, GCash, Maya, and bank transfers.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold mb-2">Is my data secure?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, we use bank-level encryption and follow industry best practices to keep your data
              safe and secure.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
