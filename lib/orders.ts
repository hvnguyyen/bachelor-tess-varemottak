export type OrderLine = {
  orderLineNumber: number;
  itemId: number;
  itemName: string;
  itemNumber: string;
  quantity: number;
  unit: string;
  netPrice: number;
  lineStatus: number;
  lineSum: number;
  orderLineAmendedDate?: string;
};

export type Order = {
  orderId: number;
  orderNumber: string;
  date: string;
  customerNumber: string;
  customerOrderRef?: string;
  customerRef?: string;
  companyNumber?: number;
  companyName?: string;
  warehouseId?: string;
  warehouseNumber?: string;
  warehouseName?: string;
  sum?: number;
  orderAmendedDate?: string;
  orderLines: OrderLine[];
};

export type OrdersMeta = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
};

export type GetOrdersApiResponse = {
  data: Order[];
  meta: OrdersMeta;
};
