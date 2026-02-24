export type Product = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  low_stock_threshold: number;
  created_at: string;
};

export type Sale = {
  id: string;
  user_id: string;
  total: number;
  profit: number;
  created_at: string;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  cost: number;
  created_at: string;
};

export type SaleWithItems = Sale & {
  sale_items: SaleItem[];
};
