import { NextRequest, NextResponse } from "next/server";
import { GetOrdersApiResponse } from "@/lib/orders";
import { fetchOrdersUpstream } from "@/lib/ordersProxy";
import { isMockApiMode } from "@/lib/apiMode";
import { MOCK_ORDERS } from "@/lib/mockData";

const ALLOWED_QUERY_PARAMS = [
  "ordernumber",
  "invoicenumber",
  "fromDate",
  "toDate",
  "status",
  "excludedStatus",
  "page",
  "pageSize",
] as const;

const CUSTOMER_NUMBER_RE = /^\d{1,20}$/;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const customerNumber = searchParams.get("customerNumber")?.trim();

  if (!customerNumber) {
    return NextResponse.json(
      { message: "Missing required query param: customerNumber" },
      { status: 400 }
    );
  }

  if (!CUSTOMER_NUMBER_RE.test(customerNumber)) {
    return NextResponse.json(
      { message: "Ugyldig kundenummer" },
      { status: 400 }
    );
  }

  if (isMockApiMode()) {
    return NextResponse.json(MOCK_ORDERS, { status: 200 });
  }

  const upstreamParams = new URLSearchParams();

  for (const key of ALLOWED_QUERY_PARAMS) {
    const value = searchParams.get(key);
    if (value) {
      upstreamParams.set(key, value);
    }
  }

  const upstreamPath =
    upstreamParams.size > 0
      ? `/order/${encodeURIComponent(customerNumber)}?${upstreamParams.toString()}`
      : `/order/${encodeURIComponent(customerNumber)}`;

  const upstreamResponse = await fetchOrdersUpstream<GetOrdersApiResponse>(request, upstreamPath);

  return NextResponse.json(upstreamResponse.data, { status: upstreamResponse.status });
}
