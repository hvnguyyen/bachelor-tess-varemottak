// app/orders/page.tsx
"use client"; // ← Viktig! For state og events

import { useState } from "react";
import { mockOrders } from "@/lib/mockData"; // eller fra types hvis du flyttet
import { Order } from "@/app/orders/types";
import OrderTable from "./components/OrderTable";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders); // lokal state for endringer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Funksjon for å merke en linje som full mottatt
  const handleReceiveLine = (orderNumber: string, lineNumber: string | number) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderNumber === orderNumber
          ? {
              ...order,
              orderLines: order.orderLines.map((line) =>
                line.lineNumber === lineNumber
                  ? { ...line, receivedQuantity: line.quantity }
                  : line
              ),
            }
          : order
      )
    );
  };

  const closeModal = () => setSelectedOrder(null);

  return (
    <main className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Ordre til mottak
          </h1>
          <p className="text-sm text-gray-600">Digitalt Varemottak – TESS AS</p>
        </div>

        {/* Tabell */}
        <OrderTable
            orders={orders}
            onRowClick={setSelectedOrder}
        />

        {/* Modal – legges til her midlertidig */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Ordre {selectedOrder.orderNumber}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                  <p>Leverandør/Lager: {selectedOrder.supplierOrCustomer || selectedOrder.warehouseName || "Ukjent"}</p>
                  <p>Dato: {selectedOrder.date || "-"}</p>
                  <p>Status: {selectedOrder.status}</p>
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
                    {selectedOrder.orderLines.map((line) => {
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
                                onClick={() => handleReceiveLine(selectedOrder.orderNumber, line.lineNumber)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
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
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Dette er mock-data. Klikk på rad for detaljer og mottak.
        </p>
      </div>
    </main>
  );
}