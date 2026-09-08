import { useEffect, useState } from 'react';
import { Page, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { api, Order, ProductFromApi } from '../services/api';
import PortalShell, {
  portalCardClass,
  portalInputClass,
  portalSectionTitleClass,
  portalTabClass,
} from '../components/PortalShell';

interface StaffPageProps {
  navigate: (page: Page) => void;
  products: Product[];
  onProductsChange: () => void;
}

export default function StaffPage({ navigate, products, onProductsChange }: StaffPageProps) {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productForm, setProductForm] = useState<Partial<ProductFromApi>>({
    name: '',
    category: 'backpacks',
    price: 0,
    image: '',
    description: '',
    fullDescription: '',
    colors: ['Default'],
    sizes: ['One Size'],
    stock: 100,
  });
  const [editProductId, setEditProductId] = useState<number | null>(null);

  const canAccess = user?.role === 'staff' || user?.role === 'admin';

  useEffect(() => {
    if (!authLoading && !canAccess) {
      navigate('login');
    }
  }, [user, authLoading, canAccess, navigate]);

  const loadOrders = async () => {
    try {
      setError('');
      const res = await api.getOrders(statusFilter || undefined);
      setOrders(res.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    }
  };

  useEffect(() => {
    if (canAccess) loadOrders();
  }, [canAccess, statusFilter]);

  const updateStatus = async (id: number, status: Order['status']) => {
    try {
      await api.updateOrderStatus(id, status);
      setMessage('Order status updated successfully.');
      loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = {
        ...productForm,
        images: productForm.image ? [productForm.image] : [],
        shippingInfo: productForm.shippingInfo ?? 'Standard delivery 3–5 business days.',
      };
      if (editProductId) {
        await api.updateProduct(editProductId, payload);
        setMessage('Product updated successfully.');
      } else {
        await api.createProduct(payload);
        setMessage('Product added to catalog.');
      }
      setProductForm({
        name: '',
        category: 'backpacks',
        price: 0,
        image: '',
        description: '',
        fullDescription: '',
        colors: ['Default'],
        sizes: ['One Size'],
        stock: 100,
      });
      setEditProductId(null);
      onProductsChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product save failed');
    }
  };

  const startEditProduct = (p: Product) => {
    setEditProductId(p.id);
    setProductForm({
      name: p.name,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image,
      description: p.description,
      fullDescription: p.fullDescription,
      shippingInfo: p.shippingInfo,
      badge: p.badge,
      colors: p.colors,
      sizes: p.sizes,
      stock: (p as Product & { stock?: number }).stock ?? 100,
    });
    setTab('products');
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await api.deleteProduct(id);
      setMessage('Product deactivated.');
      onProductsChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (authLoading || !canAccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-black/50">Loading...</p>
      </div>
    );
  }

  const statusColors: Record<Order['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  const backPage: Page = 'home';

  return (
    <PortalShell
      navigate={navigate}
      title="Operations"
      subtitle="Orders & product catalog"
      backPage={backPage}
    >
      <div className="mb-8">
        <div className="bg-black text-white rounded-2xl px-6 py-8 sm:py-10">
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-2">Workspace</p>
          <h2
            className="font-display font-black text-white uppercase"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            }}
          >
            Daily Operations
          </h2>
          <p className="text-white/40 text-sm mt-2 max-w-lg">
            Fulfill orders, update statuses, and keep the product catalog up to date.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {(['orders', 'products'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={portalTabClass(tab === t)}
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {t === 'orders' ? 'Orders' : 'Products'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-6 rounded-xl bg-brand/15 border border-brand/30 text-black text-sm px-4 py-3">
          {message}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={portalInputClass + ' max-w-xs'}
          >
            <option value="">All order statuses</option>
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          {orders.length === 0 ? (
            <div className={`${portalCardClass} text-center py-12`}>
              <p className="text-black/40">No orders found.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className={portalCardClass}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <p
                      className="font-display font-black text-xl uppercase"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-black/40 mt-1">
                      {order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName} · ${order.customer.email}`
                        : order.shipping.email}{' '}
                      · {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${statusColors[order.status]}`}
                    >
                      {order.status}
                    </span>
                    <span
                      className="font-display font-black text-xl"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      ₱{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
                <ul className="text-sm text-black/60 mb-5 space-y-1.5 bg-stone-50 rounded-xl p-4">
                  {order.items.map((item) => (
                    <li key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between">
                      <span>
                        {item.quantity}× {item.productName}{' '}
                        <span className="text-black/30">
                          ({item.size}, {item.color})
                        </span>
                      </span>
                      <span className="font-semibold text-black/70">
                        ₱{(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                  className={portalInputClass + ' max-w-xs'}
                >
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <option key={s} value={s}>
                      Mark as {s}
                    </option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={portalCardClass}>
            <h2 className={portalSectionTitleClass} style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              <span className="w-7 h-7 bg-brand rounded-full flex items-center justify-center text-xs font-bold text-black">
                {editProductId ? '✎' : '+'}
              </span>
              {editProductId ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <input
                placeholder="Product name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className={portalInputClass}
                required
              />
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className={portalInputClass}
              >
                {['backpacks', 'footwear', 'apparel', 'accessories'].map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price (₱)"
                value={productForm.price || ''}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })
                }
                className={portalInputClass}
                required
              />
              <input
                placeholder="Image URL"
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                className={portalInputClass}
                required
              />
              <textarea
                placeholder="Short description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className={portalInputClass}
                rows={2}
                required
              />
              <textarea
                placeholder="Full description"
                value={productForm.fullDescription}
                onChange={(e) =>
                  setProductForm({ ...productForm, fullDescription: e.target.value })
                }
                className={portalInputClass}
                rows={3}
                required
              />
              <input
                placeholder="Colors (comma-separated)"
                value={(productForm.colors ?? []).join(', ')}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    colors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className={portalInputClass}
              />
              <input
                placeholder="Sizes (comma-separated)"
                value={(productForm.sizes ?? []).join(', ')}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className={portalInputClass}
              />
              <input
                type="number"
                placeholder="Stock quantity"
                value={productForm.stock ?? 100}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })
                }
                className={portalInputClass}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand text-black font-bold py-3.5 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wide text-sm"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}
                >
                  {editProductId ? 'Save Product' : 'Add Product'}
                </button>
                {editProductId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditProductId(null);
                      setProductForm({
                        name: '',
                        category: 'backpacks',
                        price: 0,
                        image: '',
                        description: '',
                        fullDescription: '',
                        colors: ['Default'],
                        sizes: ['One Size'],
                        stock: 100,
                      });
                    }}
                    className="px-5 py-3.5 border-2 border-black/15 rounded-xl font-bold text-sm uppercase hover:border-black/30 transition-all"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className={`${portalCardClass} p-0 overflow-hidden`}>
            <div className="p-6 border-b border-black/8">
              <h2
                className={portalSectionTitleClass}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 0 }}
              >
                Catalog ({products.length})
              </h2>
            </div>
            <div className="divide-y divide-black/8 max-h-[640px] overflow-y-auto">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-14 h-14 rounded-xl object-cover border border-black/8"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-black/40 capitalize">{p.category}</p>
                    <p
                      className="font-display font-bold text-sm mt-0.5"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      ₱{p.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditProduct(p)}
                      className="text-xs font-bold uppercase px-3 py-1.5 rounded-lg bg-black/5 hover:bg-brand/20 transition-colors"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id)}
                      className="text-xs font-bold uppercase px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
