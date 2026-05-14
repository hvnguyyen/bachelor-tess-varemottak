"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchOrders } from "@/lib/ordersClient";
import { mapOrderToTrackingOrder, TrackingOrder } from "@/lib/tracking";
import { fetchWarehouses } from "@/lib/warehousesClient";
import { useRequiredUserProfile } from "@/lib/useRequiredUserProfile";

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100] as const;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("no-NO");
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Ingen registrering oppgitt";
  }

  return new Date(value).toLocaleString("no-NO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("no-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 2,
  }).format(value);
}

function sortNumberValues(values: number[]) {
  return Array.from(new Set(values.filter((value) => !Number.isNaN(value)))).sort((a, b) => a - b);
}

export default function TrackParcelPage() {
  const { profile, isReady } = useRequiredUserProfile();
  const [customerNumber, setCustomerNumber] = useState("");
  const [warehouses, setWarehouses] = useState<string[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedStatusCode, setSelectedStatusCode] = useState<string | null>(null);
  const [statusCodes, setStatusCodes] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [pageSize, setPageSize] = useState<number>(25);
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState("");

  const hasActiveFilters = Boolean(searchTerm.trim() || selectedWarehouse || selectedStatusCode);

  useEffect(() => {
    if (!profile) {
      return;
    }

    const numbers = profile.customerNumbers ?? [];

    setCustomerNumber(profile.defaultCustomerNumber ?? numbers[0] ?? "");
    setSelectedWarehouse(profile.defaultWarehouseName ?? null);
  }, [profile]);

  const loadWarehouses = useCallback(async () => {
    try {
      setWarehousesLoading(true);
      const result = await fetchWarehouses(customerNumber || undefined);
      const names = Array.from(
        new Set(
          result.data
            .map((warehouse) => warehouse.warehouseName)
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, "no"));

      setWarehouses(names);
    } catch {
      // La lagerfilter stå tomt hvis oppslaget feiler.
    } finally {
      setWarehousesLoading(false);
    }
  }, [customerNumber]);

  useEffect(() => {
    void loadWarehouses();
  }, [loadWarehouses]);

  useEffect(() => {
    if (!selectedWarehouse) {
      return;
    }

    if (warehouses.includes(selectedWarehouse)) {
      return;
    }

    setSelectedWarehouse(null);
  }, [selectedWarehouse, warehouses]);

  useEffect(() => {
    if (!loading) {
      setLoadingProgress(0);
      return;
    }

    setLoadingProgress(10);

    const interval = window.setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 92) {
          return current;
        }

        if (current < 40) {
          return current + 10;
        }

        if (current < 70) {
          return current + 6;
        }

        return current + 3;
      });
    }, 220);

    return () => window.clearInterval(interval);
  }, [loading]);

  const visibleOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          order.orderNumber,
          order.customerRef,
          order.customerOrderRef,
          order.warehouseName,
          order.currentLocationLabel,
          order.statusLabel,
        ].some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesWarehouse = !selectedWarehouse || order.warehouseName === selectedWarehouse;
      const matchesStatus =
        !selectedStatusCode || order.statusValues.includes(Number(selectedStatusCode));

      return matchesSearch && matchesWarehouse && matchesStatus;
    });
  }, [orders, searchTerm, selectedWarehouse, selectedStatusCode]);

  const loadTrackingData = useCallback(
    async (targetPage = 1, requestedPageSize = pageSize) => {
      if (!customerNumber) {
        setError("Fant ikke kundenummer for innlogget bruker.");
        return;
      }

      try {
        setLoading(true);
        setLoadingProgress(10);
        setError("");
        setExpandedOrderId(null);

        const result = await fetchOrders({
          customerNumber,
          page: targetPage,
          pageSize: requestedPageSize,
          status: selectedStatusCode ?? undefined,
        });

        const mappedOrders = result.data
          .map(mapOrderToTrackingOrder)
          .sort((a, b) => {
            const aTime = a.lastUpdatedTimestamp ?? 0;
            const bTime = b.lastUpdatedTimestamp ?? 0;

            if (bTime !== aTime) {
              return bTime - aTime;
            }

            return b.orderNumber.localeCompare(a.orderNumber, "no");
          });

        setOrders(mappedOrders);
        setStatusCodes(sortNumberValues(mappedOrders.flatMap((order) => order.statusValues)));
        setPage(result.meta.page);
        setTotalPages(result.meta.totalPages);
        setTotalItems(result.meta.totalItems);
        setHasLoaded(true);
        setLoadingProgress(100);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke hente sporingsdata");
      } finally {
        setLoading(false);
      }
    },
    [customerNumber, pageSize, selectedStatusCode]
  );

  const clearActiveFilters = () => {
    setSearchTerm("");
    setSelectedWarehouse(null);
    setSelectedStatusCode(null);
    setExpandedOrderId(null);
  };

  if (!isReady || !profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Sporingsverktøy</h1>
          <Link
            href="/dashboard"
            className="rounded-lg bg-gray-600 px-4 py-2 font-medium text-white transition hover:bg-gray-700"
          >
            Tilbake
          </Link>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Sporing</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Ordrestatus og siste registrering</h2>
          </div>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Søk etter ordrenummer, referanse eller lager"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 lg:min-w-[30rem]"
              />

              <button
                onClick={() => setShowFilters((current) => !current)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {showFilters ? "Skjul filtervalg" : "Vis filtervalg"}
              </button>

              {hasActiveFilters ? (
                <button
                  onClick={clearActiveFilters}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Nullstill filtre
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Vis
                <select
                  value={pageSize}
                  onChange={(event) => {
                    const nextPageSize = Number(event.target.value);
                    setPageSize(nextPageSize);

                    if (hasLoaded) {
                      void loadTrackingData(1, nextPageSize);
                    }
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <button
                onClick={() => loadTrackingData(1, pageSize)}
                disabled={loading || !customerNumber}
                className="rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:bg-gray-300 lg:min-w-36"
              >
                Hent ordre
              </button>
            </div>
          </div>

          {showFilters ? (
            <div className="mt-4 grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Lager
                <select
                  value={selectedWarehouse ?? ""}
                  onChange={(event) => setSelectedWarehouse(event.target.value || null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
                  <option value="">
                    {warehousesLoading ? "Laster lagre..." : "Alle lager"}
                  </option>
                  {warehouses.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Status
                <select
                  value={selectedStatusCode ?? ""}
                  onChange={(event) => setSelectedStatusCode(event.target.value || null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
                  <option value="">Alle statuskoder</option>
                  {statusCodes.map((value) => (
                    <option key={value} value={value}>
                      Kode {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {!hasLoaded && !loading ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Tabellen viser én rad per ordrenummer, og detaljene kan åpnes ved behov. Hent ordre
              for å starte visningen.
            </div>
          ) : null}

          {hasLoaded ? (
            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
              <p>
                Viser {visibleOrders.length.toLocaleString("no-NO")} av{" "}
                {orders.length.toLocaleString("no-NO")} ordre på denne siden
              </p>
              <p>
                Side {page} av {Math.max(totalPages, 1)} · totalt{" "}
                {totalItems.toLocaleString("no-NO")} ordre
              </p>
            </div>
          ) : null}

          {loading && !hasLoaded ? (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
              <div className="space-y-3">
                <p>Henter sporingsdata...</p>
                <div className="mx-auto h-2 w-56 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-600 transition-[width] duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{loadingProgress}%</p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          ) : null}

          {hasLoaded && visibleOrders.length === 0 && !loading ? (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
              Ingen ordre matcher gjeldende søk eller filter.
            </div>
          ) : null}

          {hasLoaded && visibleOrders.length > 0 ? (
            <div className="mt-6 space-y-4">
              {visibleOrders.map((order) => {
                const isOpen = expandedOrderId === order.orderId;

                return (
                  <article
                    key={order.orderId}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            Ordre {order.orderNumber}
                          </h3>
                          <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                            {order.statusLabel}
                          </span>
                        </div>

                        <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                          <p>
                            <span className="font-medium text-gray-800">Siste kjente lokasjon:</span>{" "}
                            {order.currentLocationLabel}
                          </p>
                          <p>
                            <span className="font-medium text-gray-800">Siste registrering:</span>{" "}
                            {formatDateTime(order.lastUpdatedAt)}
                          </p>
                          <p>
                            <span className="font-medium text-gray-800">Ordredato:</span>{" "}
                            {formatDate(order.date)}
                          </p>
                          <p>
                            <span className="font-medium text-gray-800">Kundereferanse:</span>{" "}
                            {order.customerRef} / {order.customerOrderRef}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 md:text-right">
                        <p>{order.lineCount} ordrelinje(r)</p>
                        <p>{formatCurrency(order.totalSum)}</p>
                        <button
                          onClick={() => setExpandedOrderId(isOpen ? null : order.orderId)}
                          className="mt-2 font-semibold text-green-700 transition hover:text-green-900"
                        >
                          {isOpen ? "Skjul detaljer" : "Vis detaljer"}
                        </button>
                      </div>
                    </div>

                    {isOpen ? (
                      <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                        {order.orderLines.map((line) => (
                          <div
                            key={`${order.orderId}-${line.orderLineNumber}`}
                            className="rounded-lg border border-gray-200 px-4 py-3"
                          >
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Linje {line.orderLineNumber}: {line.itemName}
                                </p>
                                <p className="mt-1 font-mono text-sm text-gray-600">
                                  {line.itemNumber}
                                </p>
                              </div>
                              <div className="text-sm text-gray-700 md:text-right">
                                <p>
                                  {line.quantity} {line.unit}
                                </p>
                                <p>Statuskode {line.lineStatus}</p>
                                <p>Sist oppdatert {formatDateTime(line.orderLineAmendedDate ?? null)}</p>
                                <p>{formatCurrency(line.lineSum)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })}

              {loading ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
                  <div className="space-y-3">
                    <p>Laster ordre...</p>
                    <div className="mx-auto h-2 w-56 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-green-600 transition-[width] duration-300"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{loadingProgress}%</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {hasLoaded ? (
            <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-6 md:flex-row md:items-center md:justify-between">
              <button
                onClick={() => {
                  if (page > 1) {
                    void loadTrackingData(page - 1, pageSize);
                  }
                }}
                disabled={loading || page <= 1}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Forrige side
              </button>

              <button
                onClick={() => {
                  if (page < totalPages) {
                    void loadTrackingData(page + 1, pageSize);
                  }
                }}
                disabled={loading || page >= totalPages}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Neste side
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
