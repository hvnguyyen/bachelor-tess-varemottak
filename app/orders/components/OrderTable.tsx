// app/orders/components/OrderTable.tsx
import { Order } from "../types";

type OrderTableProps = {
  orders: Order[];
  onRowClick: (order: Order) => void;   // gjør den required siden den brukes
};

export default function OrderTable({ orders, onRowClick }: OrderTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-4 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
              Ordrenr
            </th>
            <th className="px-4 py-4 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
              Leverandør / Lager
            </th>
            <th className="px-4 py-4 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
              Dato
            </th>
            <th className="px-4 py-4 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
              Status
            </th>
            <th className="px-4 py-4 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
              Linjer
            </th>
            <th className="px-4 py-4 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
              Mottatt
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {orders.map((order) => {
            const totalOrdered = order.orderLines.reduce((sum, line) => sum + (line.quantity || 0), 0);
            const totalReceived = order.orderLines.reduce((sum, line) => sum + (line.receivedQuantity || 0), 0);
            const receivedPercent = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

            return (
              <tr
                key={order.orderNumber}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onRowClick(order)}
              >
                <td className="px-4 py-5 sm:px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-5 sm:px-6 text-sm text-gray-700">
                  {order.supplierOrCustomer || order.warehouseName || "Ukjent"}
                </td>
                <td className="px-4 py-5 sm:px-6 text-sm text-gray-700 whitespace-nowrap">
                  {order.date || "-"}
                </td>
                <td className="px-4 py-5 sm:px-6 text-sm">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                      order.status === "open"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "partial"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {order.status === "open"
                      ? "Åpen"
                      : order.status === "partial"
                      ? "Delvis mottatt"
                      : "Fullført"}
                  </span>
                </td>
                <td className="px-4 py-5 sm:px-6 text-sm text-gray-700 text-center">
                  {order.totalLines ?? order.orderLines.length}
                </td>
                <td className="px-4 py-5 sm:px-6 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span>{receivedPercent}%</span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          receivedPercent === 100
                            ? "bg-green-500"
                            : receivedPercent > 0
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        }`}
                        style={{ width: `${receivedPercent}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}