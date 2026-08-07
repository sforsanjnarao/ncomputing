export type Role = "USER" | "ADMIN";
export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type LeadType = "DEMO" | "SALES" | "PRICING";
export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"];

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  role: Role;
};

export type ProductOption = {
  id: string;
  group: string;
  label: string;
  description: string | null;
  priceDeltaInPaise: number;
  isDefault: boolean;
  sortOrder: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  usersPerDevice: number;
  priceInPaise: number;
  imageEmoji: string;
  highlights: string[];
  specs: Record<string, string>;
  options: ProductOption[];
};

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type SelectedOption = {
  id: string;
  group: string;
  label: string;
  priceDeltaInPaise: number;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  unitPriceInPaise: number;
  quantity: number;
  lineTotalInPaise: number;
  selectedOptions: SelectedOption[];
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  billingAddress: Address;
  subtotalInPaise: number;
  taxInPaise: number;
  totalInPaise: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string; name: string; email: string; organization: string | null };
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
};
