

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export type Role = "USER" | "ADMIN";
export type ProductType = "HARDWARE" | "SOFTWARE";
export type OrderStatus =
  "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type LeadType = "DEMO" | "SALES" | "PRICING";
export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
export type VisitorEventType =
  | "PAGE_VIEW"
  | "PRODUCT_VIEW"
  | "ADD_TO_CART"
  | "CHECKOUT_STARTED"
  | "LEAD_SUBMITTED";
export type LeadScoreLabel = "WEAK" | "MEDIUM" | "STRONG";

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const LEAD_STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CLOSED",
];

export type Address = {
  id: string;
  fullName: string;
  fullAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  role: Role;
  addresses: Address[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  type: ProductType;
  amount: number;
  currency: string;
  isActive: boolean;
  tagline: string;
  summary: string;
  highlights: string[];
  specifications: Record<string, string>;
  platforms: string[];
};

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  seats: number | null;
  serviceDurationMonths: number | null;
  serviceStartsAt: string | null;
  serviceEndsAt: string | null;
  
  
  product: Product;
};

export type Order = {
  id: string;
  orderNumber: string;
  orderAmount: number;
  orderCurrency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  billingAddress: Address;
  shippingAddress: Address | null;
  createdAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
    organization: string | null;
  };
};

export type Lead = {
  id: string;
  type: LeadType;
  name: string;
  email: string;
  phone: string;
  organization: string | null;
  seats: number | null;
  productSlug: string | null;
  message: string | null;
  status: LeadStatus;
  createdAt: string;
  
  
  
  
  score?: number;
  scoreLabel?: LeadScoreLabel;
  activity?: { type: VisitorEventType; count: number }[];
};
