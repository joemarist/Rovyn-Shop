import { Product, CartItem, Page } from '../types';

interface ProductCardProps {
  product: Product;
  navigate: (page: Page, productId?: number) => void;
  addToCart: (item: CartItem) => void;
}

export default function ProductCard({ product, navigate, addToCart }: ProductCardProps) {
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      product,
      quantity: 1,
      selectedSize: product.sizes[0],
      selectedColor: product.colors[0],
    });
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-black/8 overflow-hidden hover:border-brand/40 transition-all duration-200 hover:shadow-lg cursor-pointer"
      onClick={() => navigate('product', product.id)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide
            ${product.badge === 'Sale' ? 'bg-black text-white' : 'bg-brand text-black'}`}
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}>
            {product.badge}
          </span>
        )}
        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <button
            onClick={handleQuickAdd}
            className="w-full py-3 bg-brand text-black font-bold text-sm uppercase tracking-wide hover:bg-brand-dark transition-colors"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}>
            Quick Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-black/40 uppercase tracking-widest mb-1 font-semibold"
          style={{ fontFamily: "'Barlow', sans-serif" }}>
          {product.category}
        </p>
        <h3 className="font-display font-bold text-lg text-black leading-tight mb-2"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {product.name}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} width="11" height="11" viewBox="0 0 12 12" fill={s <= Math.round(product.rating) ? '#A4D233' : '#e5e7eb'}>
                <path d="M6 1l1.39 2.82L10.5 4.24l-2.25 2.19.53 3.1L6 8.02 3.22 9.53l.53-3.1L1.5 4.24l3.11-.42L6 1z"/>
              </svg>
            ))}
          </div>
          <span className="text-xs text-black/40">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xl text-black"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            ₱{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-black/40 line-through">
              ₱{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
