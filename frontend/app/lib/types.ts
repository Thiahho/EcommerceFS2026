export type ProductCatalogItem = {
  id: string;
  name: string;
  brand: string;
  slug: string;
  categoryName: string;
  minPrice: number;
  inStock: boolean;
  hasActivePromotion: boolean;
};

export type ProductImage = {
  id: string;
  url: string;
  order: number;
  altText: string | null;
};

export type ProductVariant = {
  id: string;
  color: string;
  ram: string;
  storage: string;
  sku: string;
  price: number;
  stockActual: number;
  stockReserved: number;
};

export type ProductDetail = {
  id: string;
  name: string;
  description: string;
  brand: string;
  slug: string;
  categoryName: string;
  active: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  variantId: string;
  variantLabel: string;
  price: number;
  quantity: number;
};
