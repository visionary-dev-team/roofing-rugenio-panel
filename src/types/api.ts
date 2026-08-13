export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface ServiceStep {
  title: string;
  detail: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  short: string;
  description: string;
  image: string;
  features: string[];
  steps: ServiceStep[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioImage {
  id?: string;
  url: string;
  s3Key: string;
  caption?: string;
  isBeforeAfter?: boolean;
  isCover?: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  city?: string;
  state?: string;
  completedAt?: string;
  serviceId: string;
  service?: Service;
  images: PortfolioImage[];
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  s3Key: string;
}
