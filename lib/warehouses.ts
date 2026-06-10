export type Warehouse = {
  warehouseNumber: string;
  warehouseName: string;
  warehouseId?: string | number;
};

export type GetWarehousesApiResponse = {
  data: Warehouse[];
};
