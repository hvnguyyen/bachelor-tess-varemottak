import { GetWarehousesApiResponse } from "@/lib/warehouses";

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

type ErrorPayload = {
  message?: string;
};

function buildQuery(customerNumber?: string) {
  const query = new URLSearchParams();

  if (customerNumber) {
    query.set("customerNumber", customerNumber);
  }

  return query;
}

function normalizeWarehouses(payload: unknown): GetWarehousesApiResponse {
  const source =
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
      ? (payload as { data: unknown[] }).data
      : Array.isArray(payload)
        ? payload
        : [];

  return {
    data: source
      .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
      .map((entry) => ({
        warehouseNumber: String(entry.warehouseNumber ?? "").trim(),
        warehouseName: String(entry.warehouseName ?? "").trim(),
        warehouseId:
          entry.warehouseId !== null && entry.warehouseId !== undefined
            ? String(entry.warehouseId).trim()
            : undefined,
      }))
      .filter((warehouse) => warehouse.warehouseName)
      .filter((warehouse) => warehouse.warehouseName.toUpperCase() !== "BRUKES IKKE"),
  };
}

function getErrorMessage(payload: GetWarehousesApiResponse | ErrorPayload | null, fallback: string) {
  return payload && typeof payload === "object" && "message" in payload
    ? payload.message || fallback
    : fallback;
}

async function fetchWarehousesDirect(customerNumber?: string) {
  if (!EXTERNAL_API_BASE_URL) {
    throw new Error("Mangler NEXT_PUBLIC_API_BASE_URL i miljøvariabler");
  }

  const query = buildQuery(customerNumber);
  const path = customerNumber
    ? `${EXTERNAL_API_BASE_URL}/warehouse/getAllCustomerWarehouse`
    : `${EXTERNAL_API_BASE_URL}/warehouse`;
  const url = query.size > 0 ? `${path}?${query.toString()}` : path;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const payload = result as GetWarehousesApiResponse | ErrorPayload | null;
    throw new Error(getErrorMessage(payload, "Kunne ikke hente lagre"));
  }

  return normalizeWarehouses(result);
}

export async function fetchWarehouses(customerNumber?: string): Promise<GetWarehousesApiResponse> {
  return fetchWarehousesDirect(customerNumber);
}
