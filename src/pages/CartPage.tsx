import { NavProps } from '../types';

export default function CartPage({
  cart,
  navigate,
  removeFromCart,
  updateQuantity,
  requireLoginForCheckout,
}: NavProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#A4D233" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <h2 className="font-display font-black text-3xl uppercase mb-3"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Your cart is empty</h2>
          <p className="text-black/50 mb-8">Looks like you haven't added any gear yet.</p>
          <button onClick={() => navigate('shop')}
            className="bg-brand text-black font-bold px-8 py-4 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wide text-sm"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-black text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display font-black text-white uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Your Cart
          </h1>
          <p className="text-white/40 mt-1 text-sm">{cart.reduce((s, i) => s + i.quantity, 0)} items</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                className="flex gap-4 p-4 border border-black/8 rounded-2xl hover:border-brand/30 transition-colors">
                {/* Thumbnail */}
                <button
                  onClick={() => navigate('product', item.product.id)}
                  className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => navigate('product', item.product.id)}
                      className="font-display font-bold text-lg text-black uppercase hover:text-brand transition-colors text-left leading-tight"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {item.product.name}
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                      className="w-7 h-7 flex items-center justify-center text-black/30 hover:text-black transition-colors flex-shrink-0 rounded-full hover:bg-black/5"
                      aria-label="Remove item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>

                  <div className="flex gap-3 mt-1 mb-3">
                    <span className="text-xs text-black/50 bg-stone-100 px-2 py-0.5 rounded-md">{item.selectedColor}</span>
                    <span className="text-xs text-black/50 bg-stone-100 px-2 py-0.5 rounded-md">{item.selectedSize}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center border border-black/15 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors text-sm">
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors text-sm">
                        +
                      </button>
                    </div>

                    {/* Line price */}
                    <span className="font-display font-bold text-lg text-black"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      ₱{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => navigate('shop')}
              className="flex items-center gap-2 text-sm text-black/50 hover:text-brand transition-colors font-semibold mt-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              Continue Shopping
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-stone-50 rounded-2xl p-6 sticky top-24">
              <h2 className="font-display font-black text-xl uppercase mb-5"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold">₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-brand' : ''}`}>
                    {shipping === 0 ? 'Free' : `₱${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-black/40 bg-brand/10 rounded-lg px-3 py-2">
                    Add ₱{(2000 - subtotal).toLocaleString()} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-black/10 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-display font-black text-2xl"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    ₱{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (requireLoginForCheckout?.() !== false) navigate('checkout');
                }}
                className="w-full bg-brand text-black font-bold py-4 rounded-xl hover:bg-brand-dark active:scale-95 transition-all uppercase tracking-wide text-sm"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
                Proceed to Checkout
              </button>

              <div className="flex items-center justify-center gap-4 mt-5">
                {['visa', 'mc', 'gcash', 'maya'].map((p) => (
                  <span key={p} className="text-xs font-bold text-black/30 uppercase tracking-wide">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
