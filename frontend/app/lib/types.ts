export type ProductCatalogItem = {
  id: number;
  name: string;
  brand: string;
  slug: string;
  category: string;
  minPrice: number;
  hasStock: boolean;
  hasActivePromotion: boolean;
  imagePublicId: string | null;
};

export type ProductVariant = {
  id: number;
  color: string;
  ram: string;
  storage: string;
  sku: string;
  price: number;
  stockActual: number;
  stockReserved: number;
  active: boolean;
  imagePublicId: string | null;
};

export type ProductDetail = {
  id: number;
  name: string;
  description: string;
  brand: string;
  slug: string;
  category: string;
  active: boolean;
  variants: ProductVariant[];
};

export type CartItem = {
  id: number;
  name: string;
  slug: string;
  variantId: number;
  variantLabel: string;
  price: number;
  quantity: number;
  imagePublicId: string | null;
};
