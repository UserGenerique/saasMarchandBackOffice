export interface LoginRequest { phone: string; password: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; fullName: string; }

export interface AdminStats {
  totalMerchants: number;
  activeMerchants: number;
  expiredMerchants: number;
  suspendedMerchants: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  revenueCurrentMonth: number;
  revenueTotal: number;
  expiringNext7Days: number;
}

export interface Merchant {
  merchantId: number;
  userId: number;
  businessName: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  userActive: boolean;
  createdAt: string;
  subscriptionId: number | null;
  planName: string | null;
  subscriptionStatus: string | null;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
}

export type FeatureCode =
  | 'SALES' | 'STOCK' | 'CLIENTS' | 'CREDITS'
  | 'SUPPLIERS' | 'REPORTS' | 'INVOICES'
  | 'NOTIFICATIONS_ADVANCED' | 'EXPORT';

export const ALL_FEATURES: FeatureCode[] = [
  'SALES', 'STOCK', 'CLIENTS', 'CREDITS',
  'SUPPLIERS', 'REPORTS', 'INVOICES',
  'NOTIFICATIONS_ADVANCED', 'EXPORT',
];

export const FEATURE_LABELS: Record<FeatureCode, string> = {
  SALES: 'Ventes', STOCK: 'Stock', CLIENTS: 'Clients', CREDITS: 'Crédits',
  SUPPLIERS: 'Fournisseurs', REPORTS: 'Rapports', INVOICES: 'Factures',
  NOTIFICATIONS_ADVANCED: 'Notifs avancées', EXPORT: 'Export',
};

export interface Plan {
  id: number;
  name: string;
  description: string | null;
  priceFcfa: number;
  durationDays: number;
  isTrial: boolean;
  isActive: boolean;
  features: FeatureCode[];
}

export interface PlanRequest {
  name: string;
  description?: string;
  priceFcfa: number;
  durationDays: number;
  isTrial: boolean;
  features: FeatureCode[];
}

export interface Subscription {
  id: number;
  merchant: { id: number; businessName: string };
  plan: { id: number; name: string };
  status: string;
  startDate: string;
  endDate: string;
}

export interface AssignPlanRequest { merchantId: number; planId: number; }

export interface SubscriptionPayment {
  id: number;
  amountFcfa: number;
  paymentDate: string;
  paymentMethod: string | null;
  reference: string | null;
}

export interface SubscriptionPaymentRequest {
  amountFcfa: number;
  paymentDate?: string;
  paymentMethod?: string;
  reference?: string;
}
