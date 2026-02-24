'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Package,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  X,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types/database';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

type CartItem = {
  product: Product;
  quantity: number;
};

export default function SellPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recording, setRecording] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSaleTotal, setLastSaleTotal] = useState(0);

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

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .gt('stock', 0)
      .order('name', { ascending: true });
    if (error) {
      console.error('Fetch products error:', error);
      toast.error(error.message || 'Failed to load products');
      return;
    }
    setProducts(data || []);
  }, [user]);

  useEffect(() => {
    if (user) fetchProducts();
  }, [user, fetchProducts]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Only ${product.stock} in stock`);
          return prev;
        }
        return prev.map(c =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(c => {
          if (c.product.id !== productId) return c;
          const next = c.quantity + delta;
          if (next > c.product.stock) {
            toast.error(`Only ${c.product.stock} in stock`);
            return c;
          }
          return { ...c, quantity: next };
        })
        .filter(c => c.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(c => c.product.id !== productId));
  };

  const cartTotal = cart.reduce((s, c) => s + c.product.price * c.quantity, 0);
  const cartProfit = cart.reduce((s, c) => s + (c.product.price - c.product.cost) * c.quantity, 0);

  const handleRecordSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (!user) return;

    setRecording(true);

    // Insert sale record
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ user_id: user.id, total: cartTotal, profit: cartProfit }])
      .select()
      .single();

    if (saleError || !saleData) {
      console.error('Record sale error:', saleError);
      toast.error(saleError?.message || 'Failed to record sale');
      setRecording(false);
      return;
    }

    // Insert sale items
    const saleItems = cart.map(c => ({
      sale_id: saleData.id,
      product_id: c.product.id,
      product_name: c.product.name,
      quantity: c.quantity,
      price: c.product.price,
      cost: c.product.cost,
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);

    if (itemsError) {
      console.error('Record sale items error:', itemsError);
      toast.error(itemsError.message || 'Failed to save sale items');
      setRecording(false);
      return;
    }

    // Deduct stock for each product
    const stockUpdates = cart.map(c =>
      supabase
        .from('products')
        .update({ stock: c.product.stock - c.quantity })
        .eq('id', c.product.id)
    );

    const results = await Promise.all(stockUpdates);
    const stockError = results.find(r => r.error);
    if (stockError?.error) {
      console.error('Stock deduction error:', stockError.error);
      toast.error('Sale recorded but stock update failed. Please check inventory.');
    }

    setLastSaleTotal(cartTotal);
    setCart([]);
    setShowSuccess(true);
    await fetchProducts();
    setRecording(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  if (loading) return null;

  return (
    <DashboardLayout currentPage="/dashboard/sell">
      {/* Left — Product List */}
      <div className="flex-grow flex flex-col p-4 md:p-6 overflow-y-auto">
        {/* Search */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-200 mb-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <p className="font-bold text-base">
              {products.length === 0 ? 'No products in stock' : 'No matching products'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {products.length === 0
                ? 'Add products to your inventory first.'
                : 'Try a different search term.'}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => router.push('/dashboard/inventory')}
                className="mt-4 btn btn-primary px-5 py-2.5 rounded-xl text-sm"
              >
                Go to Inventory
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(product => {
              const inCart = cart.find(c => c.product.id === product.id);
              const isLowStock = product.stock <= product.low_stock_threshold;
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`bg-white rounded-2xl border p-4 text-left transition-all hover:shadow-md active:scale-95 ${
                    inCart
                      ? 'border-primary shadow-md shadow-primary/10'
                      : 'border-gray-100 shadow-sm'
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${inCart ? 'bg-primary' : 'bg-primary/10'}`}
                  >
                    {inCart ? (
                      <span className="text-white text-sm font-black">{inCart.quantity}</span>
                    ) : (
                      <Package className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm font-semibold leading-tight line-clamp-2 mb-1">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                  <p className="text-base font-black text-primary">
                    &#8369;{product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`text-[10px] font-medium ${isLowStock ? 'text-red-500' : 'text-muted-foreground'}`}
                    >
                      {isLowStock && <AlertTriangle className="inline h-2.5 w-2.5 mr-0.5" />}
                      {product.stock} left
                    </span>
                    {inCart && <span className="text-[10px] font-bold text-primary">In cart</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right — Cart (desktop: fixed panel, mobile: bottom sheet triggered by FAB) */}
      <div className="hidden lg:flex w-80 xl:w-96 bg-white border-l border-gray-200 flex-col sticky top-20 h-[calc(100vh-5rem)]">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg">Cart</h2>
            {cartCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-muted-foreground hover:text-red-500 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/20 mb-3" />
              <p className="font-bold text-sm">Cart is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Tap a product to add it.</p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 bg-accent/30 rounded-xl p-3"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-semibold truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    &#8369;{item.product.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateQty(item.product.id, -1)}
                    className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.product.id, 1)}
                    className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 ml-1 transition-colors"
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {cartCount} item{cartCount !== 1 ? 's' : ''}
              </span>
              <span className="text-muted-foreground">
                Profit:{' '}
                <span className="text-green-600 font-bold">&#8369;{cartProfit.toFixed(2)}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-base">Total</span>
              <span className="font-black text-2xl text-primary">
                &#8369;{cartTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleRecordSale}
              disabled={recording}
              className="w-full btn btn-primary py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="h-5 w-5" />
              {recording ? 'Recording...' : 'Record Sale'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Cart FAB */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-20 right-4 z-30">
          <MobileCart
            cart={cart}
            cartTotal={cartTotal}
            cartProfit={cartProfit}
            cartCount={cartCount}
            recording={recording}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            onClear={() => setCart([])}
            onRecordSale={handleRecordSale}
          />
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-9 w-9 text-green-500" />
            </div>
            <h2 className="text-xl font-black mb-1">Sale Recorded!</h2>
            <p className="text-muted-foreground text-sm mb-2">
              Transaction saved and inventory updated.
            </p>
            <p className="text-3xl font-black text-primary mb-6">
              &#8369;{lastSaleTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  router.push('/dashboard');
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:bg-accent transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="flex-1 btn btn-primary py-3 rounded-xl text-sm font-bold"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

type MobileCartProps = {
  cart: CartItem[];
  cartTotal: number;
  cartProfit: number;
  cartCount: number;
  recording: boolean;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onRecordSale: () => void;
};

function MobileCart({
  cart,
  cartTotal,
  cartProfit,
  cartCount,
  recording,
  onUpdateQty,
  onRemove,
  onClear,
  onRecordSale,
}: MobileCartProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setOpen(true)}
        className="h-14 w-14 rounded-full bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center relative"
      >
        <ShoppingCart className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
          {cartCount}
        </span>
      </button>

      {/* Bottom Sheet */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-white w-full rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />
              <div className="flex items-center gap-2 mt-1">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span className="font-bold">
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClear}
                  className="text-xs text-muted-foreground hover:text-red-500 font-medium"
                >
                  Clear
                </button>
                <button onClick={() => setOpen(false)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-grow p-4 space-y-3">
              {cart.map(item => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 bg-accent/30 rounded-xl p-3"
                >
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      &#8369;{item.product.price.toFixed(2)} × {item.quantity} ={' '}
                      <span className="font-bold text-foreground">
                        &#8369;{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onUpdateQty(item.product.id, -1)}
                      className="h-8 w-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(item.product.id, 1)}
                      className="h-8 w-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="h-8 w-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center ml-1"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profit</span>
                <span className="text-green-600 font-bold">&#8369;{cartProfit.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-base">Total</span>
                <span className="font-black text-2xl text-primary">
                  &#8369;{cartTotal.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  onRecordSale();
                }}
                disabled={recording}
                className="w-full btn btn-primary py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="h-5 w-5" />
                {recording ? 'Recording...' : 'Record Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
