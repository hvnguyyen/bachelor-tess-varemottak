"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Order } from "@/lib/orders";
import { fetchOrders } from "@/lib/ordersClient";

type Props = {
  customerNumber: string;
  compact?: boolean;
};

type OrderRow = {
  id: number;
  orderId: number;
  orderNumber: string;
  date: string;
  warehouseName: string;
  companyName: string;
  customerRef: string;
  customerOrderRef: string;
  orderLineCount: number;
  totalSum: number;
  statusLabel: string;
  statusValues: number[];
  orderLines: Order["orderLines"];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("no-NO");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("no-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function OrdersOverview({ customerNumber, compact = false }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasRequestedLoad, setHasRequestedLoad] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [draftOrderNumber, setDraftOrderNumber] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    orderNumber: "",
    status: "",
  });

  useEffect(() => {
    if (!hasRequestedLoad) {
      return;
    }

    let cancelled = false;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await fetchOrders({
          customerNumber,
          ordernumber: appliedFilters.orderNumber || undefined,
          page,
          pageSize,
          status: appliedFilters.status || undefined,
        });

        if (cancelled) return;

        setOrders(result.data);
        setTotalItems(result.meta.totalItems);
        setTotalPages(result.meta.totalPages);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Kunne ikke hente ordredata");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, customerNumber, hasRequestedLoad, page, pageSize]);

  useEffect(() => {
    setOrders([]);
    setPage(1);
    setTotalItems(0);
    setTotalPages(0);
    setError("");
    setLoading(false);
    setHasRequestedLoad(false);
    setExpandedOrderId(null);
    setDraftOrderNumber("");
    setDraftStatus("");
    setSearchTerm("");
    setAppliedFilters({ orderNumber: "", status: "" });
  }, [customerNumber]);

  const rows = useMemo<OrderRow[]>(() => {
    return orders.map((order) => {
      const statusValues = Array.from(new Set(order.orderLines.map((line) => line.lineStatus))).sort(
        (a, b) => a - b
      );

      return {
        id: order.orderId,
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        date: order.date,
        warehouseName: order.warehouseName || "-",
        companyName: order.companyName || "-",
        customerRef: order.customerRef || "-",
        customerOrderRef: order.customerOrderRef || "-",
        orderLineCount: order.orderLines.length,
        totalSum: order.sum || 0,
        statusLabel: statusValues.join(" / "),
        statusValues,
        orderLines: order.orderLines,
      };
    });
  }, [orders]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((row) =>
      [
        row.orderNumber,
        row.companyName,
        row.warehouseName,
        row.customerRef,
        row.customerOrderRef,
      ].some((value) => value.toLowerCase().includes(normalizedSearch))
    );
  }, [rows, searchTerm]);

  const applyFilters = () => {
    setPage(1);
    setExpandedOrderId(null);
    setAppliedFilters({
      orderNumber: draftOrderNumber.trim(),
      status: draftStatus.trim(),
    });
    setHasRequestedLoad(true);
  };

  const resetFilters = () => {
    setDraftOrderNumber("");
    setDraftStatus("");
    setSearchTerm("");
    setAppliedFilters({ orderNumber: "", status: "" });
    setPage(1);
    setOrders([]);
    setTotalItems(0);
    setTotalPages(0);
    setError("");
    setLoading(false);
    setExpandedOrderId(null);
    setHasRequestedLoad(false);
  };

  return (
    <section className={`mb-6 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 ${compact ? "p-4" : "p-6"}`}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Ordregrunnlag</h2>
          <p className="text-sm text-gray-600">
            Kundenummer: <span className="font-medium">{customerNumber}</span>
            {hasRequestedLoad ? (
              <>
                . Side {page} av {Math.max(totalPages, 1)}.
              </>
            ) : null}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={!hasRequestedLoad || loading || page <= 1}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Forrige
          </button>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasRequestedLoad || loading || (totalPages > 0 && page >= totalPages)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Neste
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_12rem]">
        <input
          type="text"
          value={draftOrderNumber}
          onChange={(event) => setDraftOrderNumber(event.target.value)}
          placeholder="Filtrer på ordrenummer"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <input
          type="number"
          inputMode="numeric"
          value={draftStatus}
          onChange={(event) => setDraftStatus(event.target.value)}
          placeholder="Status"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <div className="flex gap-3">
          <button
            onClick={applyFilters}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {hasRequestedLoad ? "Oppdater ordregrunnlag" : "Hent ordregrunnlag"}
          </button>
          <button
            onClick={resetFilters}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Nullstill
          </button>
        </div>
      </div>

      {hasRequestedLoad ? (
        <div className="mt-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Søk i lastet side etter selskap, lager eller referanse"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      ) : null}

      {!hasRequestedLoad ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">

          Valgfritt oppslag for kontroll av ordrelinjer før eller under mottak.

        </div>
      ) : loading ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
          Henter ordredata...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
          Ingen ordrer matcher filtrene dine.
        </div>
      ) : (
        <div className={`mt-6 overflow-x-auto ${compact ? "max-h-[28rem] overflow-y-auto" : ""}`}>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className={`bg-gray-50 ${compact ? "sticky top-0 z-10" : ""}`}>
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Ordre</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Dato</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Selskap</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Lager</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Ordrelinjer</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Totalsum</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Detaljer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredRows.map((row) => {
                const isOpen = expandedOrderId === row.orderId;

                return (
                  <Fragment key={row.id}>
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDate(row.date)}</td>
                      <td className="px-4 py-3 text-gray-700">{row.companyName}</td>
                      <td className="px-4 py-3 text-gray-700">{row.warehouseName}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{row.orderLineCount}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(row.totalSum)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{row.statusLabel}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setExpandedOrderId(isOpen ? null : row.orderId)}
                          className="font-medium text-blue-700 transition hover:text-blue-900"
                        >
                          {isOpen ? "Skjul" : "Vis"}
                        </button>
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr key={`${row.id}-details`} className="bg-gray-50">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                              <div>
                                <p className="font-semibold text-gray-900">Ordrehode</p>
                                <p>Kundereferanse: {row.customerRef}</p>
                                <p>Kundeordrereferanse: {row.customerOrderRef}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Statusverdier</p>
                                <p>{row.statusValues.join(", ")}</p>
                              </div>
                            </div>

                            <div className="mt-4 space-y-3">
                              {row.orderLines.map((line) => (
                                <div
                                  key={`${row.orderId}-${line.orderLineNumber}`}
                                  className="rounded-lg border border-gray-200 px-4 py-3"
                                >
                                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                    <div>
                                      <p className="font-semibold text-gray-900">
                                        Linje {line.orderLineNumber}: {line.itemName}
                                      </p>
                                      <p className="mt-1 text-sm text-gray-600 font-mono">
                                        {line.itemNumber}
                                      </p>
                                    </div>
                                    <div className="text-sm text-gray-700 md:text-right">
                                      <p>
                                        {line.quantity} {line.unit}
                                      </p>
                                      <p>Status {line.lineStatus}</p>
                                      <p>{formatCurrency(line.lineSum)}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        {hasRequestedLoad
          ? `Totalt ${totalItems.toLocaleString("no-NO")} ordre i responsgrunnlaget.`
          : "Ingen ordredata lastet inn ennå."}
      </div>
    </section>
  );
}
