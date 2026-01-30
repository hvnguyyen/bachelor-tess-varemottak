import { Order, OrderLine } from "../types";

type OrderDetailModalProps = {
  order: Order;
  onClose: () => void;
  onReceiveLine: (lineNumber: string | number) => void;
};

export default function OrderDetailModal({ order, onClose, onReceiveLine }: OrderDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Ordre {order.orderNumber}
                </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-600">
            <p>Leverandør/Lager: {order.supplierOrCustomer || order.warehouseName || "Ukjent"}</p>
            <p>Dato: {order.date || "-"}</p>
            <p>Status: {order.status}</p>
          </div>

          <h3 className="text-lg font-semibold mb-4">Ordrelinjer</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Linje</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Varenr</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Navn</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bestilt</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mottatt</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.orderLines.map((line: OrderLine) => {
                const received = line.receivedQuantity || 0;
                const percent = line.quantity > 0 ? Math.round((received / line.quantity) * 100) : 0;

                return (
                  <tr key={line.lineNumber} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{line.lineNumber}</td>
                    <td className="px-4 py-3 text-sm">{line.itemNumber}</td>
                    <td className="px-4 py-3 text-sm">{line.itemName || "-"}</td>
                    <td className="px-4 py-3 text-sm text-center">{line.quantity}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span>{received} ({percent}%)</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              percent === 100 ? "bg-green-500" : percent > 0 ? "bg-blue-500" : "bg-gray-400"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {received < line.quantity && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReceiveLine(line.lineNumber);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                        >
                          Merk som mottatt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
}