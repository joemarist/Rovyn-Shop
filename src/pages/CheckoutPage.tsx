import { useState, useEffect } from 'react';
import { NavProps } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface CheckoutPageProps extends NavProps {
  onOrderPlaced: (orderNumber: string) => void;
  onRequireLogin: () => void;
}

export default function CheckoutPage({
  cart,
  onOrderPlaced,
  onRequireLogin,
}: CheckoutPageProps) {
  const { user, loading: authLoading, isCustomer } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gcash' | 'maya'>('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', province: '', zip: '',
    cardNumber: '', cardExpiry: '', cardCvv: '', cardName: '',
    gcashNumber: '', mayaNumber: '',
  });
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!authLoading && (!user || !isCustomer)) {
      onRequireLogin();
    }
  }, [user, authLoading, isCustomer, onRequireLogin]);

  useEffect(() => {
    if (user && isCustomer) {
      setForm((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || '',
        lastName: prev.lastName || user.lastName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user, isCustomer]);

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + shipping;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isCustomer) {
      onRequireLogin();
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const { order } = await api.createOrder({
        paymentMethod,
        shipping: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          province: form.province,
          zip: form.zip,
        },
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          unitPrice: item.product.price,
        })),
      });
      onOrderPlaced(order.orderNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user || !isCustomer) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-black/50">Redirecting to sign in...</p>
      </div>
    );
  }

  const inputClass = "w-full border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors bg-white";
  const labelClass = "block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5";

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <h1 className="font-display font-black text-3xl uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Checkout</h1>
          <div className="flex items-center gap-2 ml-auto">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s ? 'bg-brand text-black' : 'bg-black/10 text-black/40'}`}>
                  {s}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${step >= s ? 'text-black' : 'text-black/40'}`}>
                  {s === 1 ? 'Shipping' : 'Payment'}
                </span>
                {s < 2 && <div className={`w-8 h-px ${step > s ? 'bg-brand' : 'bg-black/15'}`}></div>}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: form */}
            <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <>
                  {/* Contact info */}
                  <div className="bg-white rounded-2xl p-6 border border-black/8">
                    <h2 className="font-display font-bold text-lg uppercase mb-5 flex items-center gap-2"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      <span className="w-6 h-6 bg-brand rounded-full flex items-center justify-center text-xs font-bold text-black">1</span>
                      Contact Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>First Name</label>
                        <input name="firstName" value={form.firstName} onChange={handleInput} className={inputClass} placeholder="Maria" required />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name</label>
                        <input name="lastName" value={form.lastName} onChange={handleInput} className={inputClass} placeholder="Santos" required />
                      </div>
                      <div>
                        <label className={labelClass}>Email Address</label>
                        <input name="email" type="email" value={form.email} onChange={handleInput} className={inputClass} placeholder="maria@email.com" required />
                      </div>
                      <div>
                        <label className={labelClass}>Phone Number</label>
                        <input name="phone" type="tel" value={form.phone} onChange={handleInput} className={inputClass} placeholder="+63 917 000 0000" required />
                      </div>
                    </div>
                  </div>

                  {/* Shipping address */}
                  <div className="bg-white rounded-2xl p-6 border border-black/8">
                    <h2 className="font-display font-bold text-lg uppercase mb-5 flex items-center gap-2"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      <span className="w-6 h-6 bg-brand rounded-full flex items-center justify-center text-xs font-bold text-black">2</span>
                      Shipping Address
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Street Address</label>
                        <input name="address" value={form.address} onChange={handleInput} className={inputClass} placeholder="123 Magsaysay Ave., Brgy. Pines" required />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClass}>City / Municipality</label>
                          <input name="city" value={form.city} onChange={handleInput} className={inputClass} placeholder="Baguio City" required />
                        </div>
                        <div>
                          <label className={labelClass}>Province</label>
                          <input name="province" value={form.province} onChange={handleInput} className={inputClass} placeholder="Benguet" required />
                        </div>
                        <div>
                          <label className={labelClass}>ZIP Code</label>
                          <input name="zip" value={form.zip} onChange={handleInput} className={inputClass} placeholder="2600" required />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full bg-brand text-black font-bold py-4 rounded-xl hover:bg-brand-dark active:scale-95 transition-all uppercase tracking-wide text-sm"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
                    Continue to Payment →
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Payment method */}
                  <div className="bg-white rounded-2xl p-6 border border-black/8">
                    <h2 className="font-display font-bold text-lg uppercase mb-5 flex items-center gap-2"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      <span className="w-6 h-6 bg-brand rounded-full flex items-center justify-center text-xs font-bold text-black">3</span>
                      Payment Method
                    </h2>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {(['card', 'gcash', 'maya'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-3 px-4 rounded-xl border-2 text-sm font-bold uppercase tracking-wide transition-all ${
                            paymentMethod === method
                              ? 'border-brand bg-brand/10 text-black'
                              : 'border-black/15 text-black/50 hover:border-black/40'}`}
                          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                          {method === 'card' ? '💳 Card' : method === 'gcash' ? '📱 GCash' : '🟣 Maya'}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <label className={labelClass}>Name on Card</label>
                          <input name="cardName" value={form.cardName} onChange={handleInput} className={inputClass} placeholder="MARIA SANTOS" required />
                        </div>
                        <div>
                          <label className={labelClass}>Card Number</label>
                          <input name="cardNumber" value={form.cardNumber} onChange={handleInput} className={inputClass} placeholder="1234 5678 9012 3456" maxLength={19} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Expiry Date</label>
                            <input name="cardExpiry" value={form.cardExpiry} onChange={handleInput} className={inputClass} placeholder="MM/YY" maxLength={5} required />
                          </div>
                          <div>
                            <label className={labelClass}>CVV</label>
                            <input name="cardCvv" value={form.cardCvv} onChange={handleInput} className={inputClass} placeholder="•••" maxLength={3} required />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'gcash' && (
                      <div>
                        <label className={labelClass}>GCash Number</label>
                        <input name="gcashNumber" value={form.gcashNumber} onChange={handleInput} className={inputClass} placeholder="09XX XXX XXXX" required />
                        <p className="text-xs text-black/40 mt-2">You will receive a payment prompt on your GCash app after placing the order.</p>
                      </div>
                    )}

                    {paymentMethod === 'maya' && (
                      <div>
                        <label className={labelClass}>Maya Account Number</label>
                        <input name="mayaNumber" value={form.mayaNumber} onChange={handleInput} className={inputClass} placeholder="09XX XXX XXXX" required />
                        <p className="text-xs text-black/40 mt-2">You will receive a payment request on your Maya app after placing the order.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)}
                      className="px-6 py-4 rounded-xl border-2 border-black/15 font-bold text-sm uppercase hover:border-black/40 transition-all"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      ← Back
                    </button>
                    <button type="submit" disabled={submitting}
                      className="flex-1 bg-brand text-black font-bold py-4 rounded-xl hover:bg-brand-dark active:scale-95 transition-all uppercase tracking-wide text-sm disabled:opacity-60"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
                      {submitting ? 'Placing Order...' : `Place Order · ₱${total.toLocaleString()}`}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Order summary */}
            <div>
              <div className="bg-white rounded-2xl p-6 border border-black/8 sticky top-24">
                <h2 className="font-display font-bold text-lg uppercase mb-5"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Order Summary</h2>

                <div className="space-y-3 mb-5">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex items-center gap-3">
                      <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate">{item.product.name}</p>
                        <p className="text-xs text-black/40">{item.selectedSize} · {item.selectedColor}</p>
                      </div>
                      <span className="font-bold text-sm flex-shrink-0">₱{(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-black/8 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Subtotal</span>
                    <span>₱{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Shipping</span>
                    <span className={shipping === 0 ? 'text-brand font-semibold' : ''}>
                      {shipping === 0 ? 'Free' : `₱${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-black/8">
                    <span className="font-bold">Total</span>
                    <span className="font-display font-black text-2xl"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      ₱{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-black/8 flex items-center gap-2 text-xs text-black/40">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Secured with SSL encryption
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
