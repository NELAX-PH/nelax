'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  ChevronDown,
  Search,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  low_stock_threshold: number;
  created_at: string;
};

type ProductFormData = {
  name: string;
  category: string;
  price: string;
  cost: string;
  stock: string;
  low_stock_threshold: string;
};

const emptyForm: ProductFormData = {
  name: '',
  category: '',
  price: '',
  cost: '',
  stock: '',
  low_stock_threshold: '5',
};

const CATEGORIES = [
  'Beverages',
  'Snacks',
  'Canned Goods',
  'Condiments',
  'Personal Care',
  'Household',
  'Rice & Grains',
  'Frozen',
  'Others',
];

export default function InventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
      .order('created_at', { ascending: false });
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

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      cost: String(product.cost),
      stock: String(product.stock),
      low_stock_threshold: String(product.low_stock_threshold),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error('Please enter a valid selling price');
      return;
    }
    if (!form.cost || Number(form.cost) < 0) {
      toast.error('Please enter a valid cost price');
      return;
    }
    if (form.stock === '' || Number(form.stock) < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      category: form.category || 'Others',
      price: Number(form.price),
      cost: Number(form.cost),
      stock: Number(form.stock),
      low_stock_threshold: Number(form.low_stock_threshold) || 5,
      user_id: user.id,
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      if (error) {
        console.error('Update product error:', error);
        toast.error(error.message || 'Failed to update product');
      } else {
        toast.success('Product updated');
        closeModal();
        fetchProducts();
      }
    } else {
      const { error } = await supabase.from('products').insert([payload]);
      if (error) {
        console.error('Insert product error:', error);
        toast.error(error.message || 'Failed to add product');
      } else {
        toast.success('Product added');
        closeModal();
        fetchProducts();
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted');
      setDeleteConfirm(null);
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = products.filter(p => p.stock <= p.low_stock_threshold).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  if (loading) return null;

  return (
    <DashboardLayout
      currentPage="/dashboard/inventory"
      showSearch={true}
      lowStockCount={lowStockCount}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      rightContent={
        <div className="md:hidden flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-200">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      }
    >
      {/* Page title row */}
      <div className="flex items-center justify-between mb-5 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground text-sm">Manage your products and stock levels.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard/sell')}
            className="btn btn-secondary flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-sm"
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">New Sale</span>
          </button>
          <button
            onClick={openAddModal}
            className="btn btn-primary flex items-center gap-2 px-3 py-2.5 md:px-5 md:py-3 rounded-xl text-sm"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-5 md:mb-8">
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-blue-50 flex items-center justify-center mb-3 md:mb-4">
            <Package className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
          </div>
          <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Products</p>
          <p className="text-2xl md:text-3xl font-black mt-1">{products.length}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
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
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm col-span-2 md:col-span-1">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-green-50 flex items-center justify-center mb-3 md:mb-4">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
          </div>
          <p className="text-xs md:text-sm font-medium text-muted-foreground">Inventory Value</p>
          <p className="text-2xl md:text-3xl font-black mt-1">
            &#8369;{totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="relative">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <span className="text-xs md:text-sm text-muted-foreground">
          {filteredProducts.length} of {products.length} products
        </span>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-14 text-center">
          <div className="h-16 w-16 md:h-20 md:w-20 bg-accent rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/30" />
          </div>
          <h3 className="font-bold text-base md:text-lg">
            {products.length === 0 ? 'No products yet' : 'No matching products'}
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
            {products.length === 0
              ? 'Add your first product to start tracking your inventory.'
              : 'Try adjusting your search or filter.'}
          </p>
          {products.length === 0 && (
            <button
              onClick={openAddModal}
              className="mt-5 btn btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Your First Product
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: Card list */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map(product => {
              const isLowStock = product.stock <= product.low_stock_threshold;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{product.name}</p>
                        <span className="text-[10px] font-medium bg-accent px-2 py-0.5 rounded-full text-muted-foreground">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(product)}
                        className="h-8 w-8 rounded-lg bg-accent hover:bg-primary/10 flex items-center justify-center transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      {deleteConfirm === product.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md font-bold"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-bold"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="h-8 w-8 rounded-lg bg-accent hover:bg-red-50 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium">COST</p>
                        <p className="font-semibold">&#8369;{product.cost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium">PRICE</p>
                        <p className="font-bold text-primary">&#8369;{product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-medium">STOCK</p>
                      <span
                        className={`font-bold flex items-center gap-1 justify-end ${isLowStock ? 'text-red-500' : ''}`}
                      >
                        {isLowStock && <AlertTriangle className="h-3 w-3" />}
                        {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                      Cost
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                      Price
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const isLowStock = product.stock <= product.low_stock_threshold;
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-50 hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-semibold text-sm">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium bg-accent px-3 py-1 rounded-full text-muted-foreground">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                          &#8369;{product.cost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold">
                          &#8369;{product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-sm font-bold ${isLowStock ? 'text-red-500' : ''}`}
                          >
                            {isLowStock && <AlertTriangle className="h-3.5 w-3.5" />}
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="h-8 w-8 rounded-lg bg-accent hover:bg-primary/10 flex items-center justify-center transition-colors"
                            >
                              <Edit2 className="h-4 w-4 text-muted-foreground" />
                            </button>
                            {deleteConfirm === product.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md font-bold"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-bold"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(product.id)}
                                className="h-8 w-8 rounded-lg bg-accent hover:bg-red-50 flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal — bottom sheet on mobile, centered on desktop */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl md:rounded-t-3xl z-10">
              {/* Mobile drag indicator */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full md:hidden" />
              <h2 className="text-lg md:text-xl font-bold mt-1 md:mt-0">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={closeModal}
                className="h-9 w-9 rounded-full bg-accent hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Lucky Me Pancit Canton"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Category</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Cost (&#8369;)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.cost}
                    onChange={e => setForm({ ...form, cost: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Price (&#8369;)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Low Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    value={form.low_stock_threshold}
                    onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })}
                    placeholder="5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {form.price && form.cost && Number(form.price) > 0 && Number(form.cost) > 0 && (
                <div className="bg-green-50 rounded-xl p-3.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Profit per unit</span>
                  <span className="font-bold text-green-700">
                    &#8369;{(Number(form.price) - Number(form.cost)).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn btn-primary py-3 rounded-xl disabled:opacity-50 text-sm"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
