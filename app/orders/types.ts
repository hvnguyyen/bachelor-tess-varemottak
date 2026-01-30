// app/orders/types.ts

export interface OrderLine {
    lineNumber: string | number;            // "1", 1, etc.
    itemNumber: string;                     // "HS-150" or "VH380070"
    itemName?: string;                      // name of choice
    quantity: number;                       // ordered quantity
    unit?: string;                          // "pcs", "stk", etc.
    receivedQuantity?: number;              // quantity received so far
    netPrice?: number;                      // price per unit
    lineStatus?: string | number;           // "1", "open", etc.
}

export interface Order {
    orderId?: string;                       // "700001" (internal ID)
    orderNumber: string;                    // "400001" or "00000"
    date?: string;                          // "2023-08-15" or "requestDate"
    status: string;                         // "open", "partial", "closed", etc.
    customerNumber?: string;                // from /order/{customerNumber}
    warehouseId?: string;                   // "10"
    warehouseName?: string;                 // "Main Warehouse" - can be used as default
    supplierOrCustomer?: string;            // placeholder for supplier/customer name
    sum?: number;                           // total sum
    orderLines: OrderLine[];                // array of order lines
    totalLines?: number;                    // total number of lines
}

