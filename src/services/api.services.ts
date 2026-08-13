import { Service, PortfolioItem } from '@/types/api';
import { apiFetch } from '@/lib/api-client';

export const servicesService = {
  getAll: () => apiFetch<Service[]>('/services'),
  getById: (id: string) => apiFetch<Service>(`/services/${id}`),
  create: (data: Partial<Service>) =>
    apiFetch<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Service>) =>
    apiFetch<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/services/${id}`, {
      method: 'DELETE',
    }),
};

export const portfolioService = {
  getAll: () => apiFetch<PortfolioItem[]>('/portfolio'),
  getById: (id: string) => apiFetch<PortfolioItem>(`/portfolio/${id}`),
  create: (data: Partial<PortfolioItem>) =>
    apiFetch<PortfolioItem>('/portfolio', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<PortfolioItem>) =>
    apiFetch<PortfolioItem>(`/portfolio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/portfolio/${id}`, {
      method: 'DELETE',
    }),
};
