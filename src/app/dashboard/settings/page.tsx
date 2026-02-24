'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  Bell,
  BellOff,
  Shield,
  Trash2,
  Save,
  Package,
  TrendingUp,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { softDeleteAccount } from '@/app/actions/delete-account';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifySales, setNotifySales] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
        setShopName(user.user_metadata?.shop_name || '');
        setShopAddress(user.user_metadata?.shop_address || '');
        setLowStockThreshold(String(user.user_metadata?.low_stock_threshold || 5));
        setNotifyLowStock(user.user_metadata?.notify_low_stock !== false);
        setNotifySales(user.user_metadata?.notify_sales !== false);
        setLoading(false);
      }
    }
    checkUser();
  }, [router]);

  const handleSave = async () => {
    if (!shopName.trim()) {
      toast.error('Shop name is required');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          shop_name: shopName.trim(),
          shop_address: shopAddress.trim(),
          low_stock_threshold: Number(lowStockThreshold) || 5,
          notify_low_stock: notifyLowStock,
          notify_sales: notifySales,
        },
      });

      if (error) {
        console.error('Settings save error:', error);
        toast.error(error.message || 'Failed to save settings');
      } else {
        toast.success('Settings saved successfully');

        // Refresh user data to confirm save
        const {
          data: { user: refreshedUser },
        } = await supabase.auth.getUser();
        if (refreshedUser) {
          setUser(refreshedUser);
        }
      }
    } catch (error: any) {
      console.error('Settings save error:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      toast.loading('Deleting account...', { id: 'delete-account' });

      const result = await softDeleteAccount(user.id, user.email || '');

      if (result.success) {
        toast.success('Your account has been deleted', { id: 'delete-account' });

        // Sign the user out
        await supabase.auth.signOut();

        // Redirect to login page after a brief delay
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        toast.error(result.error || 'Failed to delete account', { id: 'delete-account' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account', { id: 'delete-account' });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return null;

  return (
    <DashboardLayout currentPage="/dashboard/settings">
      <div className="max-w-2xl mx-auto space-y-5 md:space-y-6">
        {/* Shop Information */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm p-5 md:p-8">
          <div className="flex items-center gap-3 mb-5 md:mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Store className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg">Shop Information</h2>
              <p className="text-xs md:text-sm text-muted-foreground">Update your store details.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                placeholder="e.g., Maria's Sari-Sari Store"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Shop Address</label>
              <input
                type="text"
                value={shopAddress}
                onChange={e => setShopAddress(e.target.value)}
                placeholder="e.g., Brgy. San Jose, Manila"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm p-5 md:p-8">
          <div className="flex items-center gap-3 mb-5 md:mb-6">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Package className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg">Inventory</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Default inventory preferences.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Default Low Stock Threshold
            </label>
            <input
              type="number"
              min="1"
              value={lowStockThreshold}
              onChange={e => setLowStockThreshold(e.target.value)}
              className="w-full max-w-[120px] px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Products with stock at or below this number will trigger a low stock alert.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm p-5 md:p-8">
          <div className="flex items-center gap-3 mb-5 md:mb-6">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Bell className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg">Notifications</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Choose what alerts you receive.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">Low Stock Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified when a product is running low.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifyLowStock(!notifyLowStock)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  notifyLowStock ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    notifyLowStock ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">Sales Summary</p>
                  <p className="text-xs text-muted-foreground">Daily sales summary notification.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifySales(!notifySales)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  notifySales ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    notifySales ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm p-5 md:p-8">
          <div className="flex items-center gap-3 mb-5 md:mb-6">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg">Subscription</h2>
              <p className="text-xs md:text-sm text-muted-foreground">Manage your current plan.</p>
            </div>
          </div>

          <div className="bg-accent/50 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-primary text-lg">Sari-Sari {plan}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {plan === 'Lite'
                  ? 'Free forever. Upgrade for more features.'
                  : '₱149/month. Full access to all features.'}
              </p>
            </div>
            {plan === 'Lite' ? (
              <button
                onClick={() => router.push('/dashboard/upgrade')}
                className="btn btn-secondary px-4 py-2 rounded-xl text-sm font-bold"
              >
                Upgrade to Pro
              </button>
            ) : (
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full btn btn-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-red-200 shadow-sm p-5 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg text-red-600">Danger Zone</h2>
              <p className="text-xs md:text-sm text-muted-foreground">Irreversible actions.</p>
            </div>
          </div>

          {showDeleteConfirm ? (
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-sm font-medium text-red-700 mb-2">
                Are you sure you want to delete your account?
              </p>
              <p className="text-xs text-red-600 mb-3">
                Your email will be anonymized and you will not be able to access your account. Your
                data will be retained for internal purposes.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm text-red-500 font-semibold hover:underline"
            >
              Delete my account
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
