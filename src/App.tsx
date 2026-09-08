import { useState, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Page, CartItem, Product } from './types';
import { products as fallbackProducts } from './data/products';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api, mapApiProduct } from './services/api';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PortalGatePage from './pages/PortalGatePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import GoogleSetupPage from './pages/GoogleSetupPage';
import AdminPage from './pages/AdminPage';
import StaffPage from './pages/StaffPage';
import logoMark from './imports/2.png';

const AUTH_PAGES: Page[] = [
  'login',
  'signup',
  'forgot-password',
  'reset-password',
  'verify-email',
  'google-setup',
  'portal-gate',
  'admin',
  'staff',
];

function getInitialPage(): Page {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page') as Page | null;
  if (page && AUTH_PAGES.includes(page)) return page;
  return 'home';
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState<Page>(getInitialPage);
  const [selectedProductId, setSelectedProductId] = useState<number>(fallbackProducts[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [checkoutRedirect, setCheckoutRedirect] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const { products: apiProducts } = await api.getProducts();
      if (apiProducts.length > 0) {
        setProducts(apiProducts.map(mapApiProduct));
      }
    } catch {
      /* use fallback products */
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const navigate = (newPage: Page, productId?: number) => {
    if (productId !== undefined) setSelectedProductId(productId);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const requireLoginForCheckout = () => {
    if (!user || user.role !== 'customer') {
      setCheckoutRedirect(true);
      navigate('login');
      return false;
    }
    return true;
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.product.id === item.product.id &&
          i.selectedSize === item.selectedSize &&
          i.selectedColor === item.selectedColor
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: number, size: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (i) =>
          !(i.product.id === productId && i.selectedSize === size && i.selectedColor === color)
      )
    );
  };

  const updateQuantity = (productId: number, size: string, color: string, qty: number) => {
    if (qty < 1) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.selectedSize === size && i.selectedColor === color
          ? { ...i, quantity: qty }
          : i
      )
    );
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? products[0];

  const navProps = {
    navigate,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    products,
    requireLoginForCheckout,
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
        <div className="mb-8">
          <img src={logoMark} alt="Rovyn" className="h-20 w-auto mx-auto" />
        </div>
        <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
          ✓
        </div>
        <h1
          className="font-display font-black text-black uppercase mb-3"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          }}
        >
          Order Confirmed!
        </h1>
        <p className="text-black/50 max-w-sm mb-2">
          Thank you for your order. You will receive a confirmation email shortly.
        </p>
        <p className="text-xs text-black/30 font-mono mb-10">
          Order #{placedOrderNumber}
        </p>
        <button
          onClick={() => {
            setOrderPlaced(false);
            setCart([]);
            navigate('home');
          }}
          className="bg-brand text-black font-bold px-10 py-4 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wide text-sm"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const isAuthLayout = AUTH_PAGES.includes(page);

  if (page === 'login') {
    return (
      <LoginPage
        navigate={navigate}
        redirectAfter={checkoutRedirect ? 'checkout' : 'home'}
      />
    );
  }
  if (page === 'signup') return <SignupPage navigate={navigate} />;
  if (page === 'forgot-password') return <ForgotPasswordPage navigate={navigate} />;
  if (page === 'reset-password') return <ResetPasswordPage navigate={navigate} />;
  if (page === 'verify-email') {
    return (
      <VerifyEmailPage
        navigate={navigate}
        redirectAfter={checkoutRedirect ? 'checkout' : 'home'}
      />
    );
  }
  if (page === 'google-setup') {
    return (
      <GoogleSetupPage
        navigate={navigate}
        redirectAfter={checkoutRedirect ? 'checkout' : 'home'}
      />
    );
  }
  if (page === 'portal-gate') return <PortalGatePage navigate={navigate} />;
  if (page === 'admin') return <AdminPage navigate={navigate} />;
  if (page === 'staff') {
    return (
      <StaffPage navigate={navigate} products={products} onProductsChange={loadProducts} />
    );
  }

  return (
    <div className="min-h-full flex flex-col" style={{ fontFamily: "'Barlow', sans-serif" }}>
      {!isAuthLayout && (
        <Header page={page} navigate={navigate} cartCount={cartCount} authLoading={authLoading} />
      )}
      <main className="flex-1">
        {page === 'home' && <HomePage {...navProps} />}
        {page === 'shop' && <ShopPage {...navProps} />}
        {page === 'product' && <ProductPage {...navProps} product={selectedProduct} />}
        {page === 'cart' && <CartPage {...navProps} />}
        {page === 'checkout' && (
          <CheckoutPage
            {...navProps}
            onOrderPlaced={(orderNumber) => {
              setPlacedOrderNumber(orderNumber);
              setOrderPlaced(true);
              setCheckoutRedirect(false);
            }}
            onRequireLogin={() => {
              setCheckoutRedirect(true);
              navigate('login');
            }}
          />
        )}
        {page === 'about' && <AboutPage navigate={navigate} />}
        {page === 'contact' && <ContactPage navigate={navigate} />}
      </main>
      {!isAuthLayout && <Footer navigate={navigate} />}
    </div>
  );
}

export default function App() {
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ??
    '683085655451-o2rlo2us983qfhbhtka4pcffrd1uv20v.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
