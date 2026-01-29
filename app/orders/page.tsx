// app/orders/page.tsx
import { mockOrders, type Order, type OrderLine } from "@/lib/mockData";

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Ordre til mottak
          </h1>
          <p className="text-sm text-gray-600">
            Digitalt Varemottak – TESS AS
          </p>
        </div>

        {/* Table-container with scroll */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-4 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap"
                >
                  Ordrenr
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap"
                >
                  Leverandør / Lager
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap"
                >
                  Dato
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap"
                >
                  Linjer
                </th>
                <th
                  scope="col"
                  className="px-4 py-4 sm:px-6 text-left text-sm font-semibold text-gray-700 whitespace-nowrap"
                >
                  Mottatt
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {mockOrders.map((order: Order) => {
                // Calculate received % for whole order (based on lines)
                const totalOrdered = order.orderLines.reduce(
                  (sum, line) => sum + (line.quantity || 0),
                  0
                );
                const totalReceived = order.orderLines.reduce(
                  (sum, line) => sum + (line.receivedQuantity || 0),
                  0
                );
                const receivedPercent =
                  totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

                return (
                  <tr
                    key={order.orderNumber}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-5 sm:px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-5 sm:px-6 text-sm text-gray-700">
                      {order.supplierOrCustomer || order.warehouseName || "-"}
                    </td>
                    <td className="px-4 py-5 sm:px-6 text-sm text-gray-700 whitespace-nowrap">
                      {order.date || "-"}
                    </td>
                    <td className="px-4 py-5 sm:px-6 text-sm">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          order.status === "open" || order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "partial"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {order.status === "open" || order.status === "pending"
                          ? "Åpen / Venter"
                          : order.status === "partial"
                          ? "Delvis mottatt"
                          : "Fullført"}
                      </span>
                    </td>
                    <td className="px-4 py-5 sm:px-6 text-sm text-gray-700 text-center">
                      {order.orderLines.length}
                    </td>
                    <td className="px-4 py-5 sm:px-6 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span>{receivedPercent}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
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

        {/* Footer-info */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Dette er mock-data basert på TESS Proxy API (sales orders). Neste: Koble til ekte GET /order/{"{customerNumber}"}; eller riktig varemottak-endepunkt.
        </p>
      </div>
    </main>
  );
}