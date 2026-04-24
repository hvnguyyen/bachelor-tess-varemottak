import { GetWarehousesApiResponse } from "@/lib/warehouses";

export async function fetchWarehouses(customerNumber?: string): Promise<GetWarehousesApiResponse> {
  const query = new URLSearchParams();

  if (customerNumber) {
    query.set("customerNumber", customerNumber);
  }

  const response = await fetch(
    query.size > 0 ? `/api/warehouses?${query.toString()}` : "/api/warehouses",
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

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

  if (!result || !("data" in result) || !Array.isArray(result.data)) {
    throw new Error("Ugyldig svar fra warehouse-endepunktet");
  }

  return result;
}
