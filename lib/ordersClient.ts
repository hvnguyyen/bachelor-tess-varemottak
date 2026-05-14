import { GetOrdersApiResponse } from "@/lib/orders";

<<<<<<< HEAD
=======
const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

>>>>>>> fase3-sporing
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

<<<<<<< HEAD
export async function fetchOrders(params: GetOrdersParams): Promise<GetOrdersApiResponse> {
  const externalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

  if (!externalApiBase) {
    throw new Error("Mangler NEXT_PUBLIC_API_BASE_URL i miljøvariabler");
  }

=======
type ErrorPayload = {
  message?: string;
};

function buildUpstreamQuery(params: GetOrdersParams) {
>>>>>>> fase3-sporing
  const query = new URLSearchParams();

  if (params.ordernumber) query.set("ordernumber", params.ordernumber);
  if (params.invoicenumber) query.set("invoicenumber", params.invoicenumber);
  if (params.fromDate) query.set("fromDate", params.fromDate);
  if (params.toDate) query.set("toDate", params.toDate);
  if (params.status) query.set("status", params.status);
  if (params.excludedStatus) query.set("excludedStatus", params.excludedStatus);
  if (params.page) query.set("page", params.page.toString());
  if (params.pageSize) query.set("pageSize", params.pageSize.toString());

<<<<<<< HEAD
  const response = await fetch(
    `${externalApiBase}/order/${encodeURIComponent(params.customerNumber)}?${query.toString()}`,
    {
=======
  return query;
}

function getErrorMessage(payload: GetOrdersApiResponse | ErrorPayload | null, fallback: string) {
  return payload && typeof payload === "object" && "message" in payload
    ? payload.message || fallback
    : fallback;
}

function ensureOrdersPayload(payload: GetOrdersApiResponse | ErrorPayload | null): asserts payload is GetOrdersApiResponse {
  if (!payload || !("data" in payload) || !Array.isArray(payload.data) || !("meta" in payload)) {
    throw new Error("Ugyldig svar fra ordre-endepunktet");
  }
}

export async function fetchOrders(params: GetOrdersParams): Promise<GetOrdersApiResponse> {
  if (!EXTERNAL_API_BASE_URL) {
    throw new Error("Mangler NEXT_PUBLIC_API_BASE_URL i miljøvariabler");
  }

  const query = buildUpstreamQuery(params);
  const path = `${EXTERNAL_API_BASE_URL}/order/${encodeURIComponent(params.customerNumber)}`;
  const url = query.size > 0 ? `${path}?${query.toString()}` : path;

  const response = await fetch(url, {
>>>>>>> fase3-sporing
    method: "GET",
    credentials: "include",
    cache: "no-store",
    }
  );

  const result = (await response.json().catch(() => null)) as
    | GetOrdersApiResponse
    | ErrorPayload
    | null;

  if (!response.ok) {
    throw new Error(getErrorMessage(result, "Kunne ikke hente ordredata"));
  }

  ensureOrdersPayload(result);
  return result;
}
