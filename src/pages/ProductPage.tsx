import { useState } from 'react';
import { Product, NavProps } from '../types';
import { products as fallbackProducts } from '../data/products';
import ProductCard from '../components/ProductCard';

interface ProductPageProps extends NavProps {
  product: Product;
}

export default function ProductPage({ product, navigate, addToCart, cart, products: productsProp }: ProductPageProps) {
  const products = productsProp ?? fallbackProducts;
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'shipping' | 'reviews'>('description');
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({ product, quantity, selectedSize, selectedColor });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);
  const fallbackRelated = products.filter((p) => p.id !== product.id).slice(0, 3);
  const relatedProducts = related.length >= 2 ? related : fallbackRelated;

  const reviews = [
    { name: 'Marco R.', rating: 5, date: 'Aug 2026', text: "Absolutely bomber quality. Used it on a 5-day traverse and it held up without a single issue. The fit is spot-on and the pockets are exactly where you need them." },
    { name: 'Aisha T.', rating: 5, date: 'Jul 2026', text: "Worth every peso. I've been through cheaper alternatives and nothing comes close. This is the last one I'll ever buy — in the best way." },
    { name: 'Carlo M.', rating: 4, date: 'Jun 2026', text: "Great product overall. Sizing runs slightly large so size down if you're between sizes. Otherwise absolutely love it." },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-black/8 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-black/50"
          style={{ fontFamily: "'Barlow', sans-serif" }}>
          <button onClick={() => navigate('home')} className="hover:text-brand transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate('shop')} className="hover:text-brand transition-colors">Shop</button>
          <span>/</span>
          <span className="text-black font-semibold">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 mb-3">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImage === i ? 'border-brand' : 'border-transparent hover:border-black/20'}`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.badge && (
              <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 ${
                product.badge === 'Sale' ? 'bg-black text-white' : 'bg-brand text-black'}`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {product.badge}
              </span>
            )}

            <h1 className="font-display font-black text-black uppercase leading-tight mb-3"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} width="16" height="16" viewBox="0 0 12 12" fill={s <= Math.round(product.rating) ? '#A4D233' : '#e5e7eb'}>
                    <path d="M6 1l1.39 2.82L10.5 4.24l-2.25 2.19.53 3.1L6 8.02 3.22 9.53l.53-3.1L1.5 4.24l3.11-.42L6 1z"/>
                  </svg>
                ))}
              </div>
              <span className="text-sm text-black/60">{product.rating} · {product.reviews} reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-display font-black text-3xl text-black"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                ₱{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-black/40 line-through">₱{product.originalPrice.toLocaleString()}</span>
              )}
              {product.originalPrice && (
                <span className="text-sm font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                  Save ₱{(product.originalPrice - product.price).toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-black/70 mb-8 leading-relaxed">{product.description}</p>

            {/* Color */}
            <div className="mb-6">
              <p className="font-bold text-sm uppercase tracking-wide mb-3"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                Color: <span className="font-normal text-black/60">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                      selectedColor === c
                        ? 'border-brand bg-brand/10 text-black'
                        : 'border-black/15 text-black/70 hover:border-black/40'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <p className="font-bold text-sm uppercase tracking-wide mb-3"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                Size: <span className="font-normal text-black/60">{selectedSize}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all min-w-[3rem] ${
                      selectedSize === s
                        ? 'border-brand bg-brand text-black'
                        : 'border-black/15 text-black/70 hover:border-black/40'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex gap-3 mb-8">
              <div className="flex items-center border-2 border-black/15 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-14 flex items-center justify-center text-xl hover:bg-black/5 transition-colors font-light">
                  −
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-14 flex items-center justify-center text-xl hover:bg-black/5 transition-colors">
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
                  added
                    ? 'bg-black text-white'
                    : 'bg-brand text-black hover:bg-brand-dark active:scale-95'}`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
            </div>

            {/* Go to cart nudge */}
            {cart.length > 0 && (
              <button onClick={() => navigate('cart')}
                className="w-full py-3.5 rounded-xl border-2 border-black text-black font-bold text-sm uppercase tracking-wide hover:bg-black hover:text-white transition-all mb-8"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
                View Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)
              </button>
            )}

            {/* Trust signals */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: '🚚', text: 'Free shipping over ₱2,000' },
                { icon: '↩️', text: '30-day returns' },
                { icon: '🔒', text: 'Secure checkout' },
              ].map((t) => (
                <div key={t.text} className="flex items-center gap-1.5 text-xs text-black/50">
                  <span>{t.icon}</span>
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 border-t border-black/8 pt-10">
          <div className="flex gap-0 border-b border-black/10 mb-8">
            {(['description', 'shipping', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-bold text-sm uppercase tracking-wide border-b-2 -mb-px transition-all ${
                  activeTab === tab ? 'border-brand text-black' : 'border-transparent text-black/40 hover:text-black/70'}`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {tab === 'reviews' ? `Reviews (${product.reviews})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="max-w-2xl">
              <p className="text-black/70 leading-relaxed text-base">{product.fullDescription}</p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-2xl">
              <p className="text-black/70 leading-relaxed text-base mb-4">{product.shippingInfo}</p>
              <ul className="space-y-2">
                {[
                  'Standard shipping: 3–5 business days',
                  'Express shipping: 1–2 business days (fee applies)',
                  'Metro Manila same-day available on select orders',
                  'Hassle-free 30-day returns. No questions asked.',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-black/70">
                    <span className="w-5 h-5 bg-brand/20 text-brand rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-6 bg-stone-50 rounded-2xl p-6 mb-8">
                <div className="text-center">
                  <p className="font-display font-black text-5xl text-black"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{product.rating}</p>
                  <div className="flex gap-0.5 justify-center my-1">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="14" height="14" viewBox="0 0 12 12" fill={s <= Math.round(product.rating) ? '#A4D233' : '#e5e7eb'}>
                        <path d="M6 1l1.39 2.82L10.5 4.24l-2.25 2.19.53 3.1L6 8.02 3.22 9.53l.53-3.1L1.5 4.24l3.11-.42L6 1z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-black/40">{product.reviews} reviews</p>
                </div>
              </div>
              {reviews.map((r) => (
                <div key={r.name} className="border border-black/8 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-sm">{r.name}</p>
                      <p className="text-xs text-black/40">{r.date}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill={s <= r.rating ? '#A4D233' : '#e5e7eb'}>
                          <path d="M6 1l1.39 2.82L10.5 4.24l-2.25 2.19.53 3.1L6 8.02 3.22 9.53l.53-3.1L1.5 4.24l3.11-.42L6 1z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-black/70 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* You may also like */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-black/8 pt-10">
            <h2 className="font-display font-black text-black uppercase mb-8"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} navigate={navigate} addToCart={addToCart} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
