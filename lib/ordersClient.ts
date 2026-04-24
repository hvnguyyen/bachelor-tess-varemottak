import { GetOrdersApiResponse } from "@/lib/orders";

// const ORDERS_BASE_URL =
// process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "https://api.tessix.no";

type GetOrdersParams = {
  customerNumber: string;
  ordernumber?: string;
  invoicenumber?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  excludedStatus?: string;
  page?: number;
  pageSize?: number;
};

export async function fetchOrders(params: GetOrdersParams): Promise<GetOrdersApiResponse> {
  //const path = `${ORDERS_BASE_URL}/order/${params.customerNumber}`;
  const query = new URLSearchParams();

  query.set("customerNumber", params.customerNumber);

  if (params.ordernumber) query.set("ordernumber", params.ordernumber);
  if (params.invoicenumber) query.set("invoicenumber", params.invoicenumber);
  if (params.fromDate) query.set("fromDate", params.fromDate);
  if (params.toDate) query.set("toDate", params.toDate);
  if (params.status) query.set("status", params.status);
  if (params.excludedStatus) query.set("excludedStatus", params.excludedStatus);
  if (params.page) query.set("page", params.page.toString());
  if (params.pageSize) query.set("pageSize", params.pageSize.toString());

  // const url = query.toString() ? `${path}?${query.toString()}` : path;

  const response = await fetch(`/api/orders?${query.toString()}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as
    | GetOrdersApiResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      result && typeof result === "object" && "message" in result
        ? result.message || "Kunne ikke hente ordredata"
        : "Kunne ikke hente ordredata"
    );
  }

  if (!result || !("data" in result) || !Array.isArray(result.data) || !("meta" in result)) {
    throw new Error("Ugyldig svar fra ordre-endepunktet");
  }

  return result;
}
