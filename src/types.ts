export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  colors: string[];
  sizes: string[];
  description: string;
  fullDescription: string;
  shippingInfo: string;
  badge?: string;
  rating: number;
  reviews: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export type Page =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'about'
  | 'contact'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'reset-password'
  | 'verify-email'
  | 'google-setup'
  | 'portal-gate'
  | 'admin'
  | 'staff';

export type UserRole = 'customer' | 'staff' | 'admin';

export interface NavProps {
  navigate: (page: Page, productId?: number) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, size: string, color: string) => void;
  updateQuantity: (productId: number, size: string, color: string, qty: number) => void;
  cartCount: number;
  products?: Product[];
  requireLoginForCheckout?: () => boolean;
}
