export interface MessageResponse {
  message: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminAuthResponse {
  access_token: string;
  token_type: string;
  admin: AdminUser;
}

export interface DashboardStats {
  total_products: number;
  total_categories: number;
  total_brands: number;
  total_customers: number;
  low_stock_variants: number;
}
