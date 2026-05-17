import axios from 'axios';
import type {
  AdminStats, Merchant, Plan, PlanRequest, FeatureCode,
  Subscription, AssignPlanRequest, SubscriptionPayment, SubscriptionPaymentRequest,
  LoginRequest, AuthResponse,
} from './types';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('fullName');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
};

// Stats
export const statsApi = {
  get: () => api.get<AdminStats>('/admin/subscriptions/stats'),
};

// Merchants
export const merchantApi = {
  list: () => api.get<Merchant[]>('/admin/merchants'),
  getById: (id: number) => api.get<Merchant>(`/admin/merchants/${id}`),
  suspend: (id: number) => api.put<Merchant>(`/admin/merchants/${id}/suspend`),
  reactivate: (id: number) => api.put<Merchant>(`/admin/merchants/${id}/reactivate`),
};

// Plans
export const planApi = {
  list: () => api.get<Plan[]>('/admin/plans'),
  getById: (id: number) => api.get<Plan>(`/admin/plans/${id}`),
  create: (data: PlanRequest) => api.post<Plan>('/admin/plans', data),
  update: (id: number, data: PlanRequest) => api.put<Plan>(`/admin/plans/${id}`, data),
  updateFeatures: (id: number, features: FeatureCode[]) => api.put<Plan>(`/admin/plans/${id}/features`, features),
};

// Subscriptions
export const subscriptionApi = {
  list: () => api.get<Subscription[]>('/admin/subscriptions'),
  assign: (data: AssignPlanRequest) => api.post<Subscription>('/admin/subscriptions', data),
  expiring: () => api.get<Subscription[]>('/admin/subscriptions/expiring'),
  payments: (subId: number) => api.get<SubscriptionPayment[]>(`/admin/subscriptions/${subId}/payments`),
  recordPayment: (subId: number, data: SubscriptionPaymentRequest) =>
    api.post<SubscriptionPayment>(`/admin/subscriptions/${subId}/payments`, data),
};

export default api;
