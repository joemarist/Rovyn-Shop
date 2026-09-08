import { useState } from 'react';
import { NavProps } from '../types';
import { products as fallbackProducts } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function ShopPage({ navigate, addToCart, products: productsProp }: NavProps) {
  const products = productsProp ?? fallbackProducts;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'backpacks', label: 'Backpacks' },
    { id: 'footwear', label: 'Footwear' },
    { id: 'apparel', label: 'Apparel' },
  ];

  const filtered = products
    .filter((p) => selectedCategory === 'all' || p.category === selectedCategory)
    .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  const paginated = filtered.slice(0, page * PER_PAGE);

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-2"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Rovyn Store</p>
          <h1 className="font-display font-black text-white uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            All Gear
          </h1>
          <p className="text-white/50 mt-2 text-sm">{filtered.length} products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-6 flex gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex-1 flex items-center justify-center gap-2 border border-black/20 rounded-xl py-3 text-sm font-bold uppercase tracking-wide hover:border-brand transition-colors"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
            </svg>
            Filters
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 border border-black/20 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-brand bg-white">
            <option value="popular">Most Popular</option>
            <option value="rating">Top Rated</option>
            <option value="price-asc">Price: Low–High</option>
            <option value="price-desc">Price: High–Low</option>
          </select>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`w-64 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
            <div className="sticky top-24 space-y-8">
              {/* Sort — desktop only */}
              <div className="hidden md:block">
                <h3 className="font-display font-bold text-sm uppercase tracking-widest text-black/50 mb-3"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Sort By</h3>
                <div className="space-y-1">
                  {[
                    { id: 'popular', label: 'Most Popular' },
                    { id: 'rating', label: 'Top Rated' },
                    { id: 'price-asc', label: 'Price: Low–High' },
                    { id: 'price-desc', label: 'Price: High–Low' },
                  ].map((s) => (
                    <button key={s.id} onClick={() => setSortBy(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === s.id ? 'bg-brand text-black font-bold' : 'hover:bg-black/5 text-black/70'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-widest text-black/50 mb-3"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Category</h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                        selectedCategory === cat.id ? 'bg-brand text-black font-bold' : 'hover:bg-black/5 text-black/70'}`}>
                      <span>{cat.label}</span>
                      <span className="text-xs opacity-60">
                        {cat.id === 'all' ? products.length : products.filter(p => p.category === cat.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-widest text-black/50 mb-3"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Price Range</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Under ₱100', range: [0, 100] as [number, number] },
                    { label: '₱100 – ₱200', range: [100, 200] as [number, number] },
                    { label: '₱200 – ₱300', range: [200, 300] as [number, number] },
                    { label: 'Over ₱300', range: [300, 1000] as [number, number] },
                    { label: 'All Prices', range: [0, 500] as [number, number] },
                  ].map((opt) => (
                    <button key={opt.label}
                      onClick={() => { setPriceRange(opt.range); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        priceRange[0] === opt.range[0] && priceRange[1] === opt.range[1]
                          ? 'bg-brand text-black font-bold' : 'hover:bg-black/5 text-black/70'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-4xl mb-4">🏔️</p>
                <p className="text-black/50">No products match your filters.</p>
                <button onClick={() => { setSelectedCategory('all'); setPriceRange([0, 500]); }}
                  className="mt-4 text-brand font-bold underline underline-offset-2">Clear filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginated.map((product) => (
                    <ProductCard key={product.id} product={product} navigate={navigate} addToCart={addToCart} />
                  ))}
                </div>

                {paginated.length < filtered.length && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setPage(page + 1)}
                      className="border-2 border-black text-black font-bold px-10 py-3.5 rounded-xl hover:bg-black hover:text-white transition-all uppercase tracking-wide text-sm"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
                      Load More ({filtered.length - paginated.length} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
