export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  image_url?: string | null;
  is_active: boolean;
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  is_active: boolean;
}

export interface Color {
  id: number;
  name: string;
  hex_code: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  color_id?: number | null;
  size?: string | null;
  price: number;
  compare_at_price?: number | null;
  stock_quantity: number;
  is_active: boolean;
  color?: Color | null;
}

export interface ProductImage {
  id: number;
  cloudinary_public_id: string;
  url: string;
  display_order: number;
  is_primary: boolean;
}

export interface ProductSpecification {
  id: number;
  spec_key: string;
  spec_value: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  category_id: number;
  brand_id?: number | null;
  is_active: boolean;
  created_at: string;
  category?: Category | null;
  brand?: Brand | null;
  variants: ProductVariant[];
  images: ProductImage[];
  specifications: ProductSpecification[];
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
