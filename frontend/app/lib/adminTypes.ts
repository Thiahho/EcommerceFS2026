export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
};

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  brand: string;
  slug: string;
  categoryId: string;
  active: boolean;
};

export type AdminProductVariant = {
  id: string;
  productId: string;
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
