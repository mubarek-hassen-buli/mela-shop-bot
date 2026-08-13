import { Product, ProductVariant } from './product';

export interface CartItem {
  id: number;
  user_id: number;
  variant_id: number;
  quantity: number;
  updated_at: string;
  variant?: ProductVariant | null;
  product?: Product | null;
  item_subtotal: number;
}

export interface CartSummary {
  items: CartItem[];
  total_items: number;
  subtotal: number;
}
