import { GetWarehousesApiResponse } from "@/lib/warehouses";

export async function fetchWarehouses(customerNumber?: string): Promise<GetWarehousesApiResponse> {
  const externalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

  if (!externalApiBase) {
    throw new Error("Mangler NEXT_PUBLIC_API_BASE_URL i miljøvariabler");
  }

  const url = customerNumber
    ? `${externalApiBase}/warehouse/getAllCustomerWarehouse?customerNumber=${encodeURIComponent(customerNumber)}`
    : `${externalApiBase}/warehouse`;

  const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

  const result = (await response.json().catch(() => null)) as
    | GetWarehousesApiResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      result && typeof result === "object" && "message" in result
        ? result.message || "Kunne ikke hente lagre"
        : "Kunne ikke hente lagre"
    );
  }

  const normalizedData =
    result && typeof result === "object" && "data" in result && Array.isArray(result.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : null;

  if (!normalizedData) {
    throw new Error("Ugyldig svar fra warehouse-endepunktet");
  }

  return { data: normalizedData };
}
