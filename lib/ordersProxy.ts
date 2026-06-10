import axios from "axios";
import { NextRequest } from "next/server";
import {
  ensureTessOrdersApiConfigured,
  getTessCookieHeader,
  tessOrdersClient,
} from "@/lib/tessClient";

export function getOrdersAccessTokens(request: NextRequest) {
  const cookieAccessToken = request.cookies.get("accessToken")?.value;
  // Env fallback only in development — avoids masking auth failures in production.
  const envAccessToken =
    process.env.NODE_ENV !== "production" ? process.env.TESS_ACCESS_TOKEN : undefined;

  return Array.from(
    new Set([cookieAccessToken, envAccessToken].filter((value): value is string => Boolean(value)))
  );
}

export async function fetchOrdersUpstream<T>(request: NextRequest, upstreamPath: string) {
  const accessTokens = getOrdersAccessTokens(request);

  if (accessTokens.length === 0) {
    return {
      ok: false as const,
      status: 401,
      data: {
        message: "Missing access token. Log in or set TESS_ACCESS_TOKEN in .env.local for testing.",
      },
    };
  }

  ensureTessOrdersApiConfigured();

  let lastError: unknown = null;

  for (const accessToken of accessTokens) {
    try {
      const response = await tessOrdersClient.get<T>(upstreamPath, {
        headers: getTessCookieHeader(accessToken),
      });

      return {
        ok: true as const,
        status: response.status,
        data: response.data,
      };
    } catch (error: unknown) {
      lastError = error;

      const shouldTryNextToken =
        axios.isAxiosError(error) &&
        error.response?.status === 403 &&
        accessToken !== accessTokens[accessTokens.length - 1];

      if (!shouldTryNextToken) {
        break;
      }
    }
  }

  return {
    ok: false as const,
    status: axios.isAxiosError(lastError) ? (lastError.response?.status ?? 500) : 500,
    data: axios.isAxiosError(lastError)
      ? (lastError.response?.data ?? { message: "Failed to fetch orders upstream" })
      : { message: "Failed to fetch orders upstream" },
  };
}
