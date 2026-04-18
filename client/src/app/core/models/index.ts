export interface Category {
  id: number;
  name: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface ProductListItem {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  weightGrams?: number;
  calories?: number;
  tags: string[];
  hasSizes: boolean;
}

export interface ProductSize {
  id: number;
  label: string; // 'S' | 'M' | 'L'
  priceDelta: number;
  weightGrams?: number;
}

export interface ProductAddon {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface ProductIngredient {
  id: number;
  name: string;
}

export interface ProductDetail {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  weightGrams?: number;
  calories?: number;
  tags: string[];
  sizes: ProductSize[];
  addons: ProductAddon[];
  ingredients: ProductIngredient[];
  recommendations: ProductListItem[];
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  weight: number;
  calories: number;
  tags: string[];
  sizes: ProductSize[];
  addons: ProductAddon[];
}

export interface CartItem {
  productId: number;
  product: Product;
  sizeId?: number;
  sizeLabel?: string;
  addonIds: number[];
  removedIngredients: string[];
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface Address {
  id: number;
  label: string;
  street: string;
  lat?: number;
  lng?: number;
}

export interface User {
  id: number;
  phone: string;
  name: string;
  email?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'OnTheWay'
  | 'Delivered'
  | 'Cancelled'
  | 'Delayed';

export type OrderType = 'Delivery' | 'Pickup';

export type PaymentMethod = 'SBP' | 'Card' | 'Cash';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  size?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  type: OrderType;
  paymentMethod: PaymentMethod;
  address?: Address;
  deliveryTime?: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  review?: OrderReview;
}

export interface OrderReview {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  isNewUser: boolean;
}
