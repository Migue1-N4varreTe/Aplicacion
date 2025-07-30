// Global type definitions for La Económica

// Base utility types
export type ID = string;
export type Timestamp = string | Date | number;
export type Currency = number;
export type Percentage = number;
export type EmailAddress = string;
export type PhoneNumber = string;
export type URL = string;

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'error';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'es' | 'en';

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Timestamp;
  requestId?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User related types
export interface User {
  id: ID;
  email: EmailAddress;
  name: string;
  avatar?: URL;
  role: UserRole;
  permissions: Permission[];
  preferences: UserPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  isActive: boolean;
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'customer' | 'guest';

export interface Permission {
  id: ID;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface UserPreferences {
  theme: Theme;
  language: Language;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showActivity: boolean;
  allowDataCollection: boolean;
  allowCookies: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
}

// Product related types
export interface Product {
  id: ID;
  name: string;
  description: string;
  price: Currency;
  originalPrice?: Currency;
  category: ProductCategory;
  subcategory?: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  images: ProductImage[];
  tags: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stock: number;
  unit: ProductUnit;
  sellByWeight?: boolean;
  isNew?: boolean;
  isOffer?: boolean;
  isFeatured?: boolean;
  deliveryTime: string;
  aisle?: string;
  ingredients?: string[];
  nutritionalInfo?: NutritionalInfo;
  allergens?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductImage {
  id: ID;
  url: URL;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export type ProductUnit = 'kg' | 'pieza' | 'litro' | 'gramo' | 'paquete' | 'caja' | 'botella' | 'lata' | 'sobre' | 'manojo';

export type ProductCategory = 
  | 'lacteos-huevos'
  | 'carniceria-cremeria'
  | 'pescaderia-mariscos'
  | 'frutas-verduras'
  | 'panaderia-pasteleria'
  | 'congelados'
  | 'abarrotes-basicos'
  | 'bebidas'
  | 'limpieza-hogar'
  | 'cuidado-personal';

export interface NutritionalInfo {
  servingSize: string;
  calories: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  totalCarbohydrates: number;
  dietaryFiber: number;
  sugars: number;
  protein: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
}

// Cart and shopping types
export interface CartItem {
  id: ID;
  productId: ID;
  quantity: number;
  addedAt: Timestamp;
  unit?: ProductUnit;
  isWeightBased?: boolean;
  notes?: string;
}

export interface ShoppingList {
  id: ID;
  name: string;
  description?: string;
  items: ShoppingListItem[];
  isShared: boolean;
  sharedWith: ID[];
  category: ShoppingListCategory;
  priority: Priority;
  dueDate?: Timestamp;
  createdBy: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  isCompleted: boolean;
  tags: string[];
  budget?: Currency;
  estimatedTotal: Currency;
}

export interface ShoppingListItem {
  id: ID;
  productId?: ID;
  name: string;
  quantity: number;
  unit: ProductUnit;
  estimatedPrice?: Currency;
  notes?: string;
  isCompleted: boolean;
  addedAt: Timestamp;
  completedAt?: Timestamp;
  addedBy: ID;
}

export type ShoppingListCategory = 'weekly' | 'monthly' | 'special' | 'party' | 'diet' | 'custom';

// Address and delivery types
export interface Address {
  id: ID;
  label: string;
  fullAddress: string;
  street: string;
  number: string;
  apartment?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: Coordinates;
  isDefault: boolean;
  isActive: boolean;
  deliveryInstructions?: string;
  accessCode?: string;
  contactPhone?: PhoneNumber;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DeliveryOption {
  id: ID;
  name: string;
  description: string;
  estimatedTime: string;
  price: Currency;
  isAvailable: boolean;
  restrictions?: string[];
}

// Order types
export interface Order {
  id: ID;
  orderNumber: string;
  customerId: ID;
  items: OrderItem[];
  subtotal: Currency;
  taxes: Currency;
  deliveryFee: Currency;
  discounts: Currency;
  total: Currency;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress?: Address;
  deliveryOption: DeliveryOption;
  estimatedDeliveryTime: Timestamp;
  actualDeliveryTime?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface OrderItem {
  id: ID;
  productId: ID;
  product: Product;
  quantity: number;
  unitPrice: Currency;
  totalPrice: Currency;
  notes?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mobile' | 'zelle' | 'paypal';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

// Review types
export interface Review {
  id: ID;
  productId: ID;
  customerId: ID;
  rating: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  totalVotes: number;
  images?: ReviewImage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  responses?: ReviewResponse[];
}

export interface ReviewImage {
  id: ID;
  url: URL;
  alt: string;
  order: number;
}

export interface ReviewResponse {
  id: ID;
  authorId: ID;
  authorName: string;
  authorRole: UserRole;
  message: string;
  createdAt: Timestamp;
}

// Notification types
export interface Notification {
  id: ID;
  userId: ID;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  isArchived: boolean;
  priority: Priority;
  channels: NotificationChannel[];
  scheduledFor?: Timestamp;
  sentAt?: Timestamp;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export type NotificationType = 
  | 'order_update'
  | 'delivery'
  | 'promotion'
  | 'system'
  | 'security'
  | 'reminder'
  | 'flash_sale'
  | 'pickup_ready'
  | 'low_stock';

export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app';

// Flash sale types
export interface FlashSale {
  id: ID;
  name: string;
  description: string;
  productIds: ID[];
  discountType: DiscountType;
  discountValue: number;
  startTime: Timestamp;
  endTime: Timestamp;
  maxQuantityPerUser?: number;
  totalQuantityLimit?: number;
  currentQuantitySold: number;
  isActive: boolean;
  priority: Priority;
  images?: URL[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type DiscountType = 'percentage' | 'fixed' | 'buy_x_get_y';

// Pickup types
export interface PickupOrder {
  id: ID;
  orderId: ID;
  customerId: ID;
  storeId: ID;
  pickupCode: string;
  qrCode: string;
  scheduledTime: Timestamp;
  estimatedReadyTime: Timestamp;
  actualReadyTime?: Timestamp;
  pickedUpAt?: Timestamp;
  status: PickupStatus;
  instructions?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PickupStatus = 'scheduled' | 'preparing' | 'ready' | 'picked_up' | 'expired' | 'cancelled';

export interface Store {
  id: ID;
  name: string;
  address: Address;
  phone: PhoneNumber;
  email: EmailAddress;
  hours: StoreHours;
  services: StoreService[];
  isActive: boolean;
  coordinates: Coordinates;
}

export interface StoreHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  breaks?: TimeRange[];
}

export interface TimeRange {
  start: string;
  end: string;
}

export type StoreService = 'pickup' | 'delivery' | 'pharmacy' | 'bakery' | 'deli' | 'photo';

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: ProductCategory;
  subcategory?: string;
  brand?: string;
  priceRange?: [number, number];
  rating?: number;
  inStock?: boolean;
  isOffer?: boolean;
  isNew?: boolean;
  tags?: string[];
  sortBy?: SortOption;
  sortDirection?: 'asc' | 'desc';
}

export type SortOption = 'relevance' | 'price' | 'rating' | 'name' | 'popularity' | 'newest';

export interface SearchResult<T = Product> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  filters: SearchFilters;
  suggestions: string[];
  facets: SearchFacets;
}

export interface SearchFacets {
  categories: FacetItem[];
  brands: FacetItem[];
  priceRanges: FacetItem[];
  ratings: FacetItem[];
}

export interface FacetItem {
  value: string;
  label: string;
  count: number;
  isSelected: boolean;
}

// Event and analytics types
export interface AnalyticsEvent {
  id: ID;
  name: string;
  category: string;
  properties: Record<string, any>;
  userId?: ID;
  sessionId: string;
  timestamp: Timestamp;
  source: string;
  medium: string;
  campaign?: string;
}

export interface UserSession {
  id: ID;
  userId?: ID;
  deviceId: string;
  userAgent: string;
  ip: string;
  country: string;
  city: string;
  referrer?: URL;
  landingPage: URL;
  startTime: Timestamp;
  endTime?: Timestamp;
  pageViews: number;
  events: AnalyticsEvent[];
  isActive: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Timestamp;
  userId?: ID;
  sessionId?: string;
  stack?: string;
  level: 'info' | 'warn' | 'error' | 'fatal';
}

// Form types
export interface FormField<T = any> {
  name: string;
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
  required: boolean;
  disabled: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  submitCount: number;
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface LoadingProps {
  isLoading: boolean;
  loadingText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface ErrorProps {
  error?: AppError | Error | string;
  onRetry?: () => void;
  showRetry?: boolean;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type NonEmptyArray<T> = [T, ...T[]];
export type ValueOf<T> = T[keyof T];
export type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];

// Hook return types
export interface AsyncState<T> {
  data?: T;
  loading: boolean;
  error?: AppError | Error;
  lastFetch?: Timestamp;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// Constants
export const CURRENCIES = ['VES', 'USD'] as const;
export const LANGUAGES = ['es', 'en'] as const;
export const THEMES = ['light', 'dark', 'system'] as const;

export type SupportedCurrency = typeof CURRENCIES[number];
export type SupportedLanguage = typeof LANGUAGES[number];
export type SupportedTheme = typeof THEMES[number];
