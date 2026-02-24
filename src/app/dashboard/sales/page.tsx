'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Download,
  DollarSign,
  Package,
  User,
  XCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import type { Sale, SaleItem } from '@/types/database';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const TIME_RANGES = ['Today', 'Weekly', 'Monthly', 'Yearly'] as const;
type TimeRange = (typeof TIME_RANGES)[number];

type TopProduct = { product_name: string; total_qty: number; total_revenue: number };
type RecentSale = Sale & { sale_items: Pick<SaleItem, 'product_name' | 'quantity'>[] };

// Simple Line Chart with Dots
interface ChartProps {
  labels: string[];
  sales: number[];
  profits: number[];
}

function SimpleLineChart({ labels, sales, profits }: ChartProps) {
  if (sales.length === 0) return null;

  // Calculate min and max values for scaling
  const allValues = [...sales, ...profits];
  const maxValue = allValues.length > 0 ? Math.max(...allValues, 0) : 100;
  const minValue = allValues.length > 0 ? Math.min(...allValues, 0) : 0;
  const range = maxValue - minValue || 1;

  // Chart dimensions
  const width = 100;
  const height = 100;
  const padding = 8;

  function getY(value: number): number {
    const normalized = (value - minValue) / range;
    return padding + (1 - normalized) * (height - 2 * padding);
  }

  function getX(index: number): number {
    if (labels.length <= 1) {
      return width / 2;
    }
    return padding + (index / (labels.length - 1)) * (width - 2 * padding);
  }

  // Generate simple path (straight lines)
  const salesPoints = sales.map((value, i) => `${getX(i)},${getY(value)}`).join(' L');
  const salesPath = `M${salesPoints}`;

  const profitsPoints = profits.map((value, i) => `${getX(i)},${getY(value)}`).join(' L');
  const profitsPath = `M${profitsPoints}`;

  return (
    <div className="w-full h-full flex flex-col">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0.2, 0.4, 0.6, 0.8].map(i => (
          <line
            key={i}
            x1={padding}
            y1={padding + (height - 2 * padding) * i}
            x2={width - padding}
            y2={padding + (height - 2 * padding) * i}
            stroke="currentColor"
            strokeWidth="0.2"
            opacity="0.08"
          />
        ))}

        {/* Zero line */}
        {minValue < 0 && maxValue > 0 && (
          <line
            x1={padding}
            y1={getY(0)}
            x2={width - padding}
            y2={getY(0)}
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.2"
            strokeDasharray="2,1"
          />
        )}

        {/* Sales line */}
        {sales.length > 1 && (
          <polyline
            points={sales.map((value, i) => `${getX(i)},${getY(value)}`).join(' ')}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Sales dots - tiny circles at all points */}
        {sales.map((value, i) => (
          <circle
            key={`sales-dot-${i}`}
            cx={getX(i)}
            cy={getY(value)}
            r="1.2"
            fill="var(--primary)"
            stroke="white"
            strokeWidth="0.5"
          />
        ))}

        {/* Profit line */}
        {profits.length > 1 && (
          <polyline
            points={profits.map((value, i) => `${getX(i)},${getY(value)}`).join(' ')}
            fill="none"
            stroke="var(--secondary)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Profit dots - tiny circles at all points */}
        {profits.map((value, i) => (
          <circle
            key={`profits-dot-${i}`}
            cx={getX(i)}
            cy={getY(value)}
            r="1.2"
            fill="var(--secondary)"
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between text-[8px] text-muted-foreground mt-1 px-2">
        {labels.map((label, i) => (
          <span key={i} className="truncate max-w-[45px] text-center font-medium">
            {i % Math.ceil(labels.length / 5) === 0 ? label : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function getRangeStart(range: TimeRange): string {
  const now = new Date();
  switch (range) {
    case 'Today':
      return startOfDay(now).toISOString();
    case 'Weekly':
      return startOfWeek(now, { weekStartsOn: 1 }).toISOString();
    case 'Monthly':
      return startOfMonth(now).toISOString();
    case 'Yearly':
      return startOfYear(now).toISOString();
  }
}

export default function SalesReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('Today');

  const [grossSales, setGrossSales] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [avgSale, setAvgSale] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [voidConfirm, setVoidConfirm] = useState<string | null>(null);
  const [voidLoading, setVoidLoading] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{
    labels: string[];
    sales: number[];
    profits: number[];
  }>({ labels: [], sales: [], profits: [] });

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

  const fetchSalesData = useCallback(async () => {
    if (!user) return;

    const rangeStart = getRangeStart(timeRange);

    const [salesRes, topRes, recentRes] = await Promise.all([
      supabase
        .from('sales')
        .select('id, total, profit, created_at')
        .eq('user_id', user.id)
        .gte('created_at', rangeStart)
        .order('created_at', { ascending: true }),
      supabase
        .from('sale_items')
        .select('product_name, quantity, price')
        .in(
          'sale_id',
          (
            await supabase
              .from('sales')
              .select('id')
              .eq('user_id', user.id)
              .gte('created_at', rangeStart)
          ).data?.map(s => s.id) || []
        ),
      supabase
        .from('sales')
        .select('*, sale_items(product_name, quantity)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const sales = salesRes.data || [];
    const gross = sales.reduce((s, r) => s + (r.total || 0), 0);
    const profit = sales.reduce((s, r) => s + (r.profit || 0), 0);
    const count = sales.length;

    setGrossSales(gross);
    setNetProfit(profit);
    setTransactionCount(count);
    setAvgSale(count > 0 ? gross / count : 0);

    const itemAgg: Record<string, TopProduct> = {};
    (topRes.data || []).forEach(item => {
      const key = item.product_name;
      if (!itemAgg[key]) itemAgg[key] = { product_name: key, total_qty: 0, total_revenue: 0 };
      itemAgg[key].total_qty += item.quantity;
      itemAgg[key].total_revenue += item.price * item.quantity;
    });
    setTopProducts(
      Object.values(itemAgg)
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5)
    );

    setRecentSales((recentRes.data as RecentSale[]) || []);

    // Generate chart data based on time range
    const now = new Date();
    const labels: string[] = [];
    const salesData: number[] = [];
    const profitData: number[] = [];

    if (timeRange === 'Today') {
      // Group by hour (only show hours with data)
      const hourlyData: Record<number, { sales: number; profit: number }> = {};
      sales.forEach(s => {
        const hour = new Date(s.created_at).getHours();
        if (!hourlyData[hour]) hourlyData[hour] = { sales: 0, profit: 0 };
        hourlyData[hour].sales += s.total || 0;
        hourlyData[hour].profit += s.profit || 0;
      });

      Object.keys(hourlyData).forEach(hour => {
        labels.push(`${hour}:00`);
        salesData.push(hourlyData[Number(hour)].sales);
        profitData.push(hourlyData[Number(hour)].profit);
      });
    } else if (timeRange === 'Weekly') {
      // Group by day (last 7 days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyData: Record<number, { sales: number; profit: number }> = {};

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayIndex = date.getDay();
        dailyData[i] = { sales: 0, profit: 0 };
        labels.push(days[dayIndex]);
      }

      sales.forEach(s => {
        const daysDiff = Math.floor(
          (now.getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff >= 0 && daysDiff < 7) {
          dailyData[6 - daysDiff].sales += s.total || 0;
          dailyData[6 - daysDiff].profit += s.profit || 0;
        }
      });

      Object.values(dailyData).forEach(d => {
        salesData.push(d.sales);
        profitData.push(d.profit);
      });
    } else if (timeRange === 'Monthly') {
      // Group by week (4 weeks)
      const weeklyData: Record<number, { sales: number; profit: number }> = {};
      const monthStart = startOfMonth(now);

      for (let i = 0; i < 4; i++) {
        weeklyData[i] = { sales: 0, profit: 0 };
        labels.push(`Week ${i + 1}`);
      }

      sales.forEach(s => {
        const daysDiff = Math.floor(
          (now.getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff >= 0 && daysDiff < 30) {
          const week = Math.min(Math.floor(daysDiff / 7), 3);
          weeklyData[3 - week].sales += s.total || 0;
          weeklyData[3 - week].profit += s.profit || 0;
        }
      });

      Object.values(weeklyData).forEach(d => {
        salesData.push(d.sales);
        profitData.push(d.profit);
      });
    } else {
      // Yearly - group by month
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const monthlyData: Record<number, { sales: number; profit: number }> = {};

      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthIndex = date.getMonth();
        monthlyData[i] = { sales: 0, profit: 0 };
        labels.push(months[monthIndex]);
      }

      sales.forEach(s => {
        const saleDate = new Date(s.created_at);
        const monthsDiff =
          (now.getFullYear() - saleDate.getFullYear()) * 12 +
          (now.getMonth() - saleDate.getMonth());
        if (monthsDiff >= 0 && monthsDiff < 12) {
          monthlyData[11 - monthsDiff].sales += s.total || 0;
          monthlyData[11 - monthsDiff].profit += s.profit || 0;
        }
      });

      Object.values(monthlyData).forEach(d => {
        salesData.push(d.sales);
        profitData.push(d.profit);
      });
    }

    setChartData({ labels, sales: salesData, profits: profitData });
  }, [user, timeRange]);

  useEffect(() => {
    if (user) fetchSalesData();
  }, [user, fetchSalesData]);

  const handleVoidSale = async (saleId: string, saleItems: any[]) => {
    if (!user) return;

    setVoidLoading(saleId);
    try {
      // 1. Get the sale items to determine product stock to restore
      const itemsToRestore = saleItems;

      // 2. Update products to add back stock
      const stockUpdates = itemsToRestore.map(item =>
        supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .eq('user_id', user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              return supabase
                .from('products')
                .update({ stock: data.stock + item.quantity })
                .eq('id', item.product_id);
            }
          })
      );

      await Promise.all(stockUpdates);

      // 3. Update sale record - use voided flag if schema supports it, or delete
      // For now, we'll mark it as voided using a metadata approach
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          profit: 0, // Zero out the profit since it's voided
          total: 0, // Zero out the total
        })
        .eq('id', saleId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('Sale voided successfully');
      setVoidConfirm(null);
      fetchSalesData(); // Refresh the data
    } catch (err: any) {
      console.error('Void sale error:', err);
      toast.error(err.message || 'Failed to void sale');
    } finally {
      setVoidLoading(null);
    }
  };

  const handleExportCSV = async () => {
    if (!user) return;
    const rangeStart = getRangeStart(timeRange);

    // Fetch all products and sales items for the period
    const [productsRes, salesItemsRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, price, cost, stock, category')
        .eq('user_id', user.id)
        .order('name', { ascending: true }),
      supabase
        .from('sale_items')
        .select('product_id, quantity, price, cost, sales(created_at)')
        .in(
          'sale_id',
          (
            await supabase
              .from('sales')
              .select('id')
              .eq('user_id', user.id)
              .gte('created_at', rangeStart)
          ).data?.map(s => s.id) || []
        ),
    ]);

    const products = productsRes.data || [];
    const salesItems = salesItemsRes.data || [];

    if (products.length === 0) {
      toast.error('No products to export');
      return;
    }

    // Aggregate sales by product
    const salesByProduct: Record<
      string,
      { totalQty: number; totalRevenue: number; totalProfit: number }
    > = {};

    salesItems.forEach(item => {
      if (!salesByProduct[item.product_id]) {
        salesByProduct[item.product_id] = { totalQty: 0, totalRevenue: 0, totalProfit: 0 };
      }
      salesByProduct[item.product_id].totalQty += item.quantity;
      salesByProduct[item.product_id].totalRevenue += item.price * item.quantity;
      salesByProduct[item.product_id].totalProfit += (item.price - item.cost) * item.quantity;
    });

    // Format date as YYYY-MM-DD
    const dateOnly = format(new Date(rangeStart), 'yyyy-MM-dd');

    // Create CSV with improved readability
    // Using fixed-width columns with proper alignment
    const csvContent = [
      '# Product Sales Report',
      `# Period: ${timeRange}`,
      `# Date: ${dateOnly}`,
      '# Generated by Nelax Systems',
      '',
      // Header row with clear column names
      'ID,Name,Price,Stock,Sold,Sales,Profit',
      // Data rows
      ...products.map(p => {
        const sales = salesByProduct[p.id] || { totalQty: 0, totalRevenue: 0, totalProfit: 0 };
        return [
          p.id,
          `"${p.name}"`, // Quote names with spaces
          p.price.toFixed(2),
          p.stock,
          sales.totalQty,
          sales.totalRevenue.toFixed(2),
          sales.totalProfit.toFixed(2),
        ].join(',');
      }),
      '',
      // Summary row
      ',,TOTALS,,' +
        products.reduce((sum, p) => sum + (salesByProduct[p.id]?.totalQty || 0), 0) +
        ',' +
        products.reduce((sum, p) => sum + (salesByProduct[p.id]?.totalRevenue || 0), 0).toFixed(2) +
        ',' +
        products.reduce((sum, p) => sum + (salesByProduct[p.id]?.totalProfit || 0), 0).toFixed(2),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${timeRange.toLowerCase()}-${dateOnly}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`CSV exported: ${products.length} products`);
  };

  if (loading) return null;

  const fmtPeso = (v: number) => `\u20B1${v.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  return (
    <DashboardLayout
      currentPage="/dashboard/sales"
      title="Sales & Profit Reports"
      rightContent={
        <>
          <button
            onClick={handleExportCSV}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-accent transition-all"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="md:hidden h-9 w-9 rounded-full bg-accent flex items-center justify-center"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
          </button>
        </>
      }
    >
      {/* Time Range Filter */}
      <div className="flex items-center justify-between gap-3 mb-5 md:mb-8">
        <div className="flex items-center bg-white p-1 rounded-2xl border border-gray-200 overflow-x-auto shrink-0">
          {TIME_RANGES.map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 md:px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                timeRange === range
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-5 md:mb-8">
        {[
          {
            label: 'Gross Sales',
            value: fmtPeso(grossSales),
            icon: DollarSign,
            bg: 'bg-primary/10',
            textColor: 'text-primary',
          },
          {
            label: 'Net Profit',
            value: fmtPeso(netProfit),
            icon: TrendingUp,
            bg: 'bg-secondary/10',
            textColor: 'text-secondary',
          },
          {
            label: 'Transactions',
            value: String(transactionCount),
            icon: BarChart3,
            bg: 'bg-purple-100',
            textColor: 'text-purple-600',
          },
          {
            label: 'Avg. Sale',
            value: fmtPeso(avgSale),
            icon: DollarSign,
            bg: 'bg-orange-100',
            textColor: 'text-orange-600',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl ${stat.bg} flex items-center justify-center mb-3 md:mb-4`}
            >
              <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.textColor}`} />
            </div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-xl md:text-2xl font-black mt-1 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 md:p-8">
          <div className="flex items-start justify-between mb-5 md:mb-8 gap-3">
            <div>
              <h2 className="text-base md:text-xl font-bold">Sales Overview</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Revenue and profit trends over time.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full bg-[var(--primary)] shadow-sm"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground">
                  Sales
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full bg-[var(--secondary)] shadow-sm"
                  style={{ backgroundColor: 'var(--secondary)' }}
                />
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground">
                  Profit
                </span>
              </div>
            </div>
          </div>

          {transactionCount === 0 ? (
            <div className="h-52 md:h-80 w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-center p-6 relative overflow-hidden border border-dashed border-gray-200">
              <div className="relative z-10">
                <div className="h-14 w-14 md:h-16 md:w-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <TrendingUp
                    className="h-7 w-7 md:h-8 md:w-8 text-[var(--primary)] opacity-60"
                    style={{ color: 'var(--primary)' }}
                  />
                </div>
                <h3 className="font-bold text-sm md:text-lg text-foreground">
                  No data for this period
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm mt-1.5 max-w-[220px] md:max-w-xs">
                  Record sales to generate visual reports of your business performance.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-52 md:h-80 w-full bg-gradient-to-br from-slate-900/5 via-slate-800/3 to-slate-900/5 rounded-xl md:rounded-2xl p-3 border border-slate-900/8">
              <SimpleLineChart
                labels={chartData.labels}
                sales={chartData.sales}
                profits={chartData.profits}
              />
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 md:p-8">
          <h2 className="text-base md:text-xl font-bold mb-4 md:mb-6">Top Products</h2>

          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-muted-foreground text-sm">No sales data for this period.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((tp, i) => (
                <div
                  key={tp.product_name}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-primary text-white' : i === 1 ? 'bg-purple-100 text-purple-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-sm font-semibold truncate">{tp.product_name}</span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-bold tracking-tight">{fmtPeso(tp.total_revenue)}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {tp.total_qty} sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 md:mt-8 md:pt-8 border-t border-gray-100">
            <h3 className="font-bold mb-3 text-sm md:text-base">Recent Transactions</h3>
            {recentSales.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">No recent sales.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentSales.map(sale => {
                  const summary =
                    sale.sale_items?.map(si => `${si.product_name} x${si.quantity}`).join(', ') ||
                    'Sale';
                  const isVoided = sale.total === 0 && sale.profit === 0;
                  return (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between group p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold truncate">{summary}</p>
                          {isVoided && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                              Voided
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {format(new Date(sale.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      {voidConfirm === sale.id ? (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => handleVoidSale(sale.id, sale.sale_items || [])}
                            disabled={voidLoading === sale.id}
                            className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md font-bold disabled:opacity-50"
                          >
                            {voidLoading === sale.id ? 'Voiding...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setVoidConfirm(null)}
                            className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        !isVoided && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => setVoidConfirm(sale.id)}
                              className="text-[10px] text-red-500 font-semibold hover:bg-red-50 px-2 py-1 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                              title="Void this sale"
                            >
                              Void
                            </button>
                            <p
                              className={`text-xs font-bold shrink-0 tracking-tight ${isVoided ? 'text-gray-400 line-through' : ''}`}
                            >
                              {fmtPeso(sale.total)}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
