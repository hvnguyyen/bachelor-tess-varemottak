import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ensureTessApiConfigured, getTessCookieHeader, tessClient } from "@/lib/tessClient";
import { GetOrdersApiResponse } from "@/lib/orders";

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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const customerNumber = searchParams.get("customerNumber")?.trim();

  if (!customerNumber) {
    return NextResponse.json(
      { message: "Missing required query param: customerNumber" },
      { status: 400 }
    );
  }

  const accessToken =
    request.cookies.get("accessToken")?.value ?? process.env.TESS_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Missing access token. Log in or set TESS_ACCESS_TOKEN in .env.local for testing." },
      { status: 401 }
    );
  }

  ensureTessApiConfigured();

  const upstreamParams = new URLSearchParams();

  for (const key of ALLOWED_QUERY_PARAMS) {
    const value = searchParams.get(key);
    if (value) {
      upstreamParams.set(key, value);
    }
  }

  const upstreamPath =
    upstreamParams.size > 0
      ? `/order/${customerNumber}?${upstreamParams.toString()}`
      : `/order/${customerNumber}`;

  try {
    const response = await tessClient.get<GetOrdersApiResponse>(upstreamPath, {
      headers: getTessCookieHeader(accessToken),
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    const status = axios.isAxiosError(error)
      ? (error.response?.status ?? 500)
      : 500;
    const data = axios.isAxiosError(error)
      ? (error.response?.data ?? { message: "Failed to fetch /order/{customerNumber}" })
      : { message: "Failed to fetch /order/{customerNumber}" };

    return NextResponse.json(data, { status });
  }
}
