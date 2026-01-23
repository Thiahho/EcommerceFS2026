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

export type AdminOrderListItem = {
  id: number;
  customerName: string;
  customerEmail: string;
  status: string;
  currency: string;
  totalAmount: number;
  paymentStatus: string | null;
  createdAt: string;
  itemsCount: number;
};

export type AdminOrderItem = {
  id: number;
  productVariantId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  total: number;
};

export type AdminOrderDetail = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDni: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  status: string;
  currency: string;
  totalAmount: number;
  paymentProvider: string | null;
  paymentStatus: string | null;
  createdAt: string;
  updatedAt: string | null;
  items: AdminOrderItem[];
};

export type AdminStockVariant = {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  color: string;
  ram: string;
  storage: string;
  stockActual: number;
  stockReserved: number;
  active: boolean;
};

export type AdminPromotion = {
  id: number;
  name: string;
  description: string;
  type: number;
  value: number;
  code: string | null;
  startsAt: string;
  endsAt: string;
  active: boolean;
  combinable: boolean;
};

export type AdminPromotionProduct = {
  productId: number;
  name: string;
  brand: string;
  slug: string;
};
