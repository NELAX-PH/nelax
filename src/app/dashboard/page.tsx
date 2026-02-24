'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Package,
  BarChart3,
  TrendingUp,
  Plus,
  AlertTriangle,
  Search,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Sale, SaleItem } from '@/types/database';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

type RecentSale = Sale & { sale_items: Array<{ product_name: string; quantity: number }> };

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [productCount, setProductCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [monthlyProfit, setMonthlyProfit] = useState(0);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [allRecentSales, setAllRecentSales] = useState<RecentSale[]>([]);

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

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toISOString();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const [productsRes, lowStockRes, todaySalesRes, monthlySalesRes, recentRes] = await Promise.all(
      [
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .filter('stock', 'lte', 'low_stock_threshold'),
        supabase.from('sales').select('total').eq('user_id', user.id).gte('created_at', todayStart),
        supabase
          .from('sales')
          .select('profit')
          .eq('user_id', user.id)
          .gte('created_at', monthStart),
        supabase
          .from('sales')
          .select('*, sale_items(product_name, quantity)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]
    );

    setProductCount(productsRes.count ?? 0);
    setLowStockCount(lowStockRes.count ?? 0);
    setTodaySales(todaySalesRes.data?.reduce((sum, s) => sum + (s.total || 0), 0) ?? 0);
    setMonthlyProfit(monthlySalesRes.data?.reduce((sum, s) => sum + (s.profit || 0), 0) ?? 0);

    const salesData = (recentRes.data as RecentSale[]) || [];
    setRecentSales(salesData);
    setAllRecentSales(salesData);
  }, [user]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, fetchDashboardData]);

  // Filter sales based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setRecentSales(allRecentSales);
      return;
    }

    const filtered = allRecentSales.filter(sale => {
      const itemNames = sale.sale_items?.map(si => si.product_name.toLowerCase()).join(' ') || '';
      return itemNames.includes(searchQuery.toLowerCase());
    });

    setRecentSales(filtered);
  }, [searchQuery, allRecentSales]);

  if (loading) {
    return null;
  }

  const fullName = user?.user_metadata?.full_name || 'Owner';

  return (
    <DashboardLayout
      currentPage="/dashboard"
      showSearch={true}
      lowStockCount={lowStockCount}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      rightContent={
        <div className="md:hidden flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-200">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search products or transactions..."
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      }
    >
      <div className="flex items-center justify-between mb-5 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Good day, {fullName.split(' ')[0]}!</h1>
          <p className="text-muted-foreground text-sm">
            Here's what's happening with your shop today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard/inventory')}
            className="btn flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-sm border border-gray-200 bg-white hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
          <button
            onClick={() => router.push('/dashboard/sell')}
            className="btn btn-primary flex items-center gap-2 px-3 py-2.5 md:px-5 md:py-3 rounded-xl text-sm"
          >
            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
            <span className="hidden sm:inline">New Sale</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-5 md:mb-8">
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-green-50 flex items-center justify-center mb-3 md:mb-4">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
          </div>
          <p className="text-xs md:text-sm font-medium text-muted-foreground">Today's Sales</p>
          <p className="text-2xl md:text-3xl font-black mt-1">
            &#8369;{todaySales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-blue-50 flex items-center justify-center mb-3 md:mb-4">
            <Package className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
          </div>
          <p className="text-xs md:text-sm font-medium text-muted-foreground">Active Products</p>
          <p className="text-2xl md:text-3xl font-black mt-1">{productCount}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-purple-50 flex items-center justify-center mb-3 md:mb-4">
            <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
          </div>
          <p className="text-xs md:text-sm font-medium text-muted-foreground">Monthly Profit</p>
          <p className="text-2xl md:text-3xl font-black mt-1">
            &#8369;{monthlyProfit.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm col-span-2 md:col-span-1">
          <div
            className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl ${lowStockCount > 0 ? 'bg-red-50' : 'bg-green-50'} flex items-center justify-center mb-3 md:mb-4`}
          >
            <AlertTriangle
              className={`h-5 w-5 md:h-6 md:w-6 ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}
            />
          </div>
          <p className="text-xs md:text-sm font-medium text-muted-foreground">Low Stock</p>
          <p
            className={`text-2xl md:text-3xl font-black mt-1 ${lowStockCount > 0 ? 'text-red-500' : ''}`}
          >
            {lowStockCount}
          </p>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm p-5 md:p-8">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold">Recent Sales</h2>
          {recentSales.length > 0 && (
            <button
              onClick={() => router.push('/dashboard/sales')}
              className="text-sm text-primary font-semibold hover:underline"
            >
              View All
            </button>
          )}
        </div>

        {recentSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-16 w-16 md:h-20 md:w-20 bg-accent rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/30" />
            </div>
            <h3 className="font-bold text-base md:text-lg">No sales recorded yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
              Start recording your transactions to see your daily profit and growth reports here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSales.map(sale => {
              const itemSummary =
                sale.sale_items?.map(si => `${si.product_name} x${si.quantity}`).join(', ') ||
                'Sale';
              return (
                <div
                  key={sale.id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <ShoppingCart className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{itemSummary}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(sale.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold">
                      &#8369;{sale.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      +&#8369;{sale.profit.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
