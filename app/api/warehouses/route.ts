import { NextRequest, NextResponse } from "next/server";
import { fetchOrdersUpstream } from "@/lib/ordersProxy";
import { GetWarehousesApiResponse, Warehouse } from "@/lib/warehouses";

function normalizeWarehouses(payload: unknown): Warehouse[] {
  const source =
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
      ? (payload as { data: unknown[] }).data
      : Array.isArray(payload)
        ? payload
        : [];

  return source
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
    .filter((warehouse) => warehouse.warehouseName.toUpperCase() !== "BRUKES IKKE");
}

const CUSTOMER_NUMBER_RE = /^\d{1,20}$/;

export async function GET(request: NextRequest) {
  const customerNumber = request.nextUrl.searchParams.get("customerNumber")?.trim();

  if (customerNumber && !CUSTOMER_NUMBER_RE.test(customerNumber)) {
    return NextResponse.json({ message: "Ugyldig kundenummer" }, { status: 400 });
  }

  const upstreamPath = customerNumber
    ? `/warehouse/getAllCustomerWarehouse?customerNumber=${encodeURIComponent(customerNumber)}`
    : "/warehouse";

  const upstreamResponse = await fetchOrdersUpstream<unknown>(request, upstreamPath);

  if (!upstreamResponse.ok) {
    return NextResponse.json(upstreamResponse.data, { status: upstreamResponse.status });
  }

  const response: GetWarehousesApiResponse = {
    data: normalizeWarehouses(upstreamResponse.data),
  };

  return NextResponse.json(response, { status: 200 });
}
