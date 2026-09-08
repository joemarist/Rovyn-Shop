import { NavProps } from '../types';
import { products as fallbackProducts, categories } from '../data/products';
import ProductCard from '../components/ProductCard';
import logoMark from '../imports/2.png';

export default function HomePage({ navigate, addToCart, products: productsProp }: NavProps) {
  const products = productsProp ?? fallbackProducts;
  const featured = products.slice(0, 6);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-black">
        <img
          src="https://images.unsplash.com/photo-1586022045497-31fcf76fa6cc?w=1400&h=900&fit=crop&auto=format"
          alt="Hiker on a rocky summit at golden hour"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        {/* Faint mountain watermark */}
        <div className="absolute inset-0 flex items-end justify-end pointer-events-none pr-8 pb-16 opacity-10">
          <img src={logoMark} alt="" className="w-96 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand/20 border border-brand/30 text-brand text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse"></div>
              New Season Arrivals
            </div>
            <h1 className="font-display font-black text-white uppercase leading-none mb-6"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(3.5rem, 8vw, 7rem)', lineHeight: 1 }}>
              Built for<br />
              <span className="text-brand">Your</span><br />
              Everyday.
            </h1>
            <p className="text-white/70 text-lg mb-10 max-w-md leading-relaxed">
              Gear that keeps up — from the ridgeline to the daily grind. Rugged. Reliable. Ready for anything.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('shop')}
                className="bg-brand text-black font-bold text-base px-8 py-4 rounded-xl hover:bg-brand-dark active:scale-95 transition-all uppercase tracking-wide"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
                Shop Now
              </button>
              <button
                onClick={() => navigate('about')}
                className="border border-white/30 text-white font-bold text-base px-8 py-4 rounded-xl hover:bg-white/10 transition-all uppercase tracking-wide"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
                Our Story
              </button>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"></div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🚚', label: 'Free Shipping', sub: 'On orders over ₱2,000' },
              { icon: '↩️', label: 'Easy Returns', sub: '30-day hassle-free returns' },
              { icon: '🔒', label: 'Secure Checkout', sub: 'SSL encrypted payments' },
            ].map((t) => (
              <div key={t.label} className="flex items-center justify-center gap-3 text-black">
                <span className="text-xl">{t.icon}</span>
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide leading-none"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{t.label}</p>
                  <p className="text-black/70 text-xs mt-0.5">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="font-display font-black text-black uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Shop by Category
            </h2>
            <div className="w-16 h-1 bg-brand mt-3"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => navigate('shop')}
                className={`group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand ${i === 0 ? 'col-span-2 row-span-2 aspect-auto min-h-64' : ''}`}
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 text-left">
                  <p className="text-white font-display font-black text-xl uppercase leading-tight"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {cat.label}
                  </p>
                  <p className="text-white/60 text-xs mt-1">{cat.count > 0 ? `${cat.count} products` : 'Coming soon'}</p>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-sm
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  →
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Mountain divider */}
      <div className="bg-white overflow-hidden leading-none">
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 block">
          <path d="M0,48 L0,38 L120,20 L200,32 L320,8 L400,22 L510,4 L580,18 L640,2 L720,20 L800,6 L900,28 L1000,10 L1100,26 L1220,8 L1340,22 L1440,14 L1440,48 Z" fill="#f5f5f4"/>
        </svg>
      </div>

      {/* ── Best Sellers ── */}
      <section className="bg-stone-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="font-display font-black text-black uppercase"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Best Sellers
              </h2>
              <div className="w-16 h-1 bg-brand mt-3"></div>
            </div>
            <button onClick={() => navigate('shop')}
              className="text-sm font-bold uppercase tracking-wide text-black border-b-2 border-brand hover:text-brand transition-colors pb-0.5"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                navigate={navigate}
                addToCart={addToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Banner ── */}
      <section className="bg-black text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <img src={logoMark} alt="" className="w-3/4 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black uppercase text-white mb-6"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.05 }}>
            Gear that moves<br />
            <span className="text-brand">as fast as you do.</span>
          </h2>
          <p className="text-white/60 text-base max-w-lg mx-auto mb-10">
            Every Rovyn product is stress-tested in the field before it reaches your hands. No compromises. No shortcuts. Just gear you can count on.
          </p>
          <button onClick={() => navigate('about')}
            className="border-2 border-brand text-brand font-bold text-sm px-8 py-4 rounded-xl hover:bg-brand hover:text-black transition-all uppercase tracking-wide"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
            Read Our Story
          </button>
        </div>
      </section>
    </div>
  );
}
