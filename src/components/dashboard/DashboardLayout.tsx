'use client';

import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Store,
  Package,
  BarChart3,
  TrendingUp,
  LogOut,
  User,
  Settings,
  Bell,
  Search,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';

export const NAV_ITEMS = [
  { label: 'Overview', icon: BarChart3, href: '/dashboard' },
  { label: 'Inventory', icon: Package, href: '/dashboard/inventory' },
  { label: 'Sell', icon: ShoppingCart, href: '/dashboard/sell' },
  { label: 'Sales', icon: TrendingUp, href: '/dashboard/sales' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

type DashboardLayoutProps = {
  children: ReactNode;
  title?: string;
  showSearch?: boolean;
  rightContent?: ReactNode;
  lowStockCount?: number;
  currentPage?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
};

export default function DashboardLayout({
  children,
  title,
  showSearch = false,
  rightContent,
  lowStockCount = 0,
  currentPage = '',
  searchQuery = '',
  onSearchChange,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if account is marked as deleted
      if (user.user_metadata?.account_status === 'deleted') {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      setUser(user);
      setLoading(false);
    }
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/30">
        <div className="animate-pulse flex flex-col items-center">
          <Store className="h-12 w-12 text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const shopName = user?.user_metadata?.shop_name || 'My Sari-Sari Store';
  const plan = user?.user_metadata?.plan || 'Lite';

  return (
    <div className="min-h-screen bg-accent/20 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Store className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-lg truncate">{shopName}</span>
        </div>

        <nav className="flex-grow p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.href === currentPage
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-accent/50 rounded-2xl p-4 mb-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Current Plan
            </p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary">Sari-Sari {plan}</span>
              {plan === 'Lite' && (
                <button
                  onClick={() => router.push('/dashboard/upgrade')}
                  className="text-[10px] bg-secondary text-white px-2 py-1 rounded-md font-bold uppercase"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="md:hidden h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <div className="md:hidden">
              <span className="font-bold text-base">{title || ''}</span>
            </div>
          </div>

          {showSearch && (
            <div className="hidden md:flex items-center gap-3 bg-accent/50 px-4 py-2 rounded-xl w-full max-w-md">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search products or transactions..."
                className="bg-transparent border-none outline-none text-sm w-full"
                value={searchQuery}
                onChange={e => onSearchChange?.(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-4">
            {lowStockCount > 0 && (
              <div
                className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-red-50 flex items-center justify-center relative cursor-pointer"
                title={`${lowStockCount} products running low on stock${plan === 'Lite' ? ' (Push: Pro only)' : ''}`}
              >
                <Bell className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
              </div>
            )}
            <button
              onClick={() => router.push('/dashboard/profile')}
              className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden relative hover:shadow-md hover:ring-2 hover:ring-primary/20 transition-all"
              aria-label="Go to profile"
            >
              {user?.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="36px"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <span className="text-white text-xs md:text-sm font-bold">
                    {user?.user_metadata?.full_name
                      ? user.user_metadata.full_name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'U'}
                  </span>
                </div>
              )}
            </button>
            {rightContent}
          </div>
        </header>

        {/* Content */}
        <main className="flex-grow p-4 md:p-8 pb-24 md:pb-8">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center z-20">
        {NAV_ITEMS.map(item => {
          const active = item.href === currentPage;
          const isSell = item.href === '/dashboard/sell';
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex-1 flex flex-col items-center gap-1 transition-colors ${
                isSell ? 'py-1' : 'py-3'
              } ${active ? 'text-primary' : isSell ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {isSell ? (
                <div className="h-11 w-11 rounded-full bg-primary flex items-center justify-center -mt-4 shadow-lg shadow-primary/40">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
