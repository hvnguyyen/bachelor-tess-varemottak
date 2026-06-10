import { Order } from "@/lib/orders";

export type TrackingOrder = {
  orderId: number;
  orderNumber: string;
  date: string;
  customerNumber: string;
  customerRef: string;
  customerOrderRef: string;
  companyName: string;
  warehouseName: string;
  currentLocationLabel: string;
  lineCount: number;
  totalSum: number;
  statusValues: number[];
  statusLabel: string;
  primaryStatusCode: number | null;
  lastUpdatedAt: string | null;
  lastUpdatedTimestamp: number | null;
  orderLines: Order["orderLines"];
};

function toTimestamp(value?: string) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function resolveLastUpdatedAt(order: Order) {
  const timestamps = [
    toTimestamp(order.orderAmendedDate),
    ...order.orderLines.map((line) => toTimestamp(line.orderLineAmendedDate)),
  ].filter((value): value is number => value !== null);

  if (timestamps.length === 0) {
    return {
      iso: null,
      timestamp: null,
    };
  }

  const latest = Math.max(...timestamps);

  return {
    iso: new Date(latest).toISOString(),
    timestamp: latest,
  };
}

function resolveStatusLabel(statusValues: number[]) {
  if (statusValues.length === 0) {
    return "Kode ukjent";
  }

  if (statusValues.length === 1) {
    return `Kode ${statusValues[0]}`;
  }

  return `Koder ${statusValues.join(" / ")}`;
}

function resolveLocation(order: Order) {
  const parts = [order.companyName, order.warehouseName]
    .map((value) => value?.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Ingen lokasjon oppgitt";
}

export function mapOrderToTrackingOrder(order: Order): TrackingOrder {
  const statusValues = Array.from(
    new Set(order.orderLines.map((line) => line.lineStatus))
  ).sort((a, b) => a - b);

  const lastUpdated = resolveLastUpdatedAt(order);

  return {
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    date: order.date,
    customerNumber: order.customerNumber,
    customerRef: order.customerRef || "-",
    customerOrderRef: order.customerOrderRef || "-",
    companyName: order.companyName || "-",
    warehouseName: order.warehouseName || "-",
    currentLocationLabel: resolveLocation(order),
    lineCount: order.orderLines.length,
    totalSum: order.sum || 0,
    statusValues,
    statusLabel: resolveStatusLabel(statusValues),
    primaryStatusCode: statusValues[0] ?? null,
    lastUpdatedAt: lastUpdated.iso,
    lastUpdatedTimestamp: lastUpdated.timestamp,
    orderLines: order.orderLines,
  };
}
