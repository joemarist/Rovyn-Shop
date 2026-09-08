const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

function getToken(): string | null {
  return localStorage.getItem('rovyn_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('rovyn_token', token);
  } else {
    localStorage.removeItem('rovyn_token');
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error ?? 'Request failed');
  }

  return data as T;
}

export type LoginResponse =
  | { portalUnlocked: true; message: string }
  | { token: string; user: User };

export type RegisterResponse =
  | { needsVerification: true; email: string; message: string; devCode?: string; emailSent?: boolean }
  | { token: string; user: User };

export type GoogleLoginResponse =
  | {
      needsSetup: true;
      setupToken: string;
      email: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      message: string;
      devCode?: string;
      emailSent?: boolean;
    }
  | { token: string; user: User };

export interface User {
  id: number;
  username: string | null;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'staff' | 'admin';
  avatarUrl: string | null;
}

export interface StaffMember {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
  createdAt?: string;
}

export interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  size: string;
  color: string;
  unitPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    zip: string;
  };
  items: OrderItem[];
  createdAt: string;
  customer?: { email: string; firstName: string; lastName: string };
}

export interface ProductFromApi {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  images: string[];
  colors: string[];
  sizes: string[];
  description: string;
  fullDescription: string;
  shippingInfo: string;
  badge?: string | null;
  rating: number;
  reviews: number;
  stock: number;
  isActive?: boolean;
}

export const api = {
  login: (identifier: string, password: string) =>
    request<LoginResponse>('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) =>
    request<RegisterResponse>('/auth/register.php', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyRegister: (email: string, code: string) =>
    request<{ token: string; user: User }>('/auth/verify-register.php', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  googleLogin: (credential: string) =>
    request<GoogleLoginResponse>('/auth/google.php', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),

  completeGoogleSetup: (data: {
    setupToken: string;
    code: string;
    passwordMode: 'random' | 'manual';
    password?: string;
  }) =>
    request<{
      token: string;
      user: User;
      message: string;
      generatedPassword?: string;
      passwordNote?: string;
    }>('/auth/google-complete.php', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resendCode: (email: string, purpose: 'registration' | 'google_signup' | 'password_reset') =>
    request<{ success: boolean; message: string; devCode?: string; setupToken?: string }>(
      '/auth/resend-code.php',
      { method: 'POST', body: JSON.stringify({ email, purpose }) }
    ),

  forgotPassword: (email: string) =>
    request<{ success: boolean; message: string; email?: string; devCode?: string }>(
      '/auth/forgot-password.php',
      { method: 'POST', body: JSON.stringify({ email }) }
    ),

  resetPassword: (email: string, code: string, password: string) =>
    request<{ success: boolean; message: string }>('/auth/reset-password.php', {
      method: 'POST',
      body: JSON.stringify({ email, code, password }),
    }),

  me: () => request<{ user: User }>('/auth/me.php'),

  logout: () => request<{ success: boolean }>('/auth/logout.php', { method: 'POST' }),

  getProducts: (all = false) =>
    request<{ products: ProductFromApi[] }>(
      `/products/index.php${all ? '?all=1' : ''}`
    ),

  createProduct: (product: Partial<ProductFromApi>) =>
    request<{ product: ProductFromApi }>('/products/index.php', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  updateProduct: (id: number, product: Partial<ProductFromApi>) =>
    request<{ product: ProductFromApi }>(`/products/item.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),

  deleteProduct: (id: number) =>
    request<{ success: boolean }>(`/products/item.php?id=${id}`, { method: 'DELETE' }),

  getOrders: (status?: string) =>
    request<{ orders: Order[] }>(
      `/orders/index.php${status ? `?status=${status}` : ''}`
    ),

  createOrder: (data: {
    items: OrderItem[];
    paymentMethod: string;
    shipping: Order['shipping'];
  }) =>
    request<{ order: Order }>('/orders/index.php', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateOrderStatus: (id: number, status: Order['status']) =>
    request<{ order: Order }>(`/orders/status.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getStaff: () => request<{ staff: StaffMember[] }>('/staff/index.php'),

  createStaff: (data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) =>
    request<{ staff: StaffMember }>('/staff/index.php', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStaff: (id: number, data: Partial<StaffMember & { password?: string }>) =>
    request<{ staff: StaffMember }>(`/staff/item.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteStaff: (id: number) =>
    request<{ success: boolean }>(`/staff/item.php?id=${id}`, { method: 'DELETE' }),

  getAdminStats: () =>
    request<{
      stats: {
        totalCustomers: number;
        totalStaff: number;
        totalProducts: number;
        totalOrders: number;
        pendingOrders: number;
        revenue: number;
      };
    }>('/admin/stats.php'),
};

export function mapApiProduct(p: ProductFromApi) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    image: p.image,
    images: p.images,
    colors: p.colors,
    sizes: p.sizes,
    description: p.description,
    fullDescription: p.fullDescription,
    shippingInfo: p.shippingInfo,
    badge: p.badge ?? undefined,
    rating: p.rating,
    reviews: p.reviews,
    stock: p.stock,
  };
}
