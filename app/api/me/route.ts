import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getMockMeResponse, isMockApiMode, MOCK_ACCESS_TOKEN } from "@/lib/apiMode";
import { ensureTessApiConfigured, getTessCookieHeader, tessClient } from "@/lib/tessClient";

export async function GET(request: NextRequest) {
    try {
        const accessToken = request.cookies.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }

        if (isMockApiMode()) {
            if (accessToken !== MOCK_ACCESS_TOKEN) {
                return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
            }

            return NextResponse.json(getMockMeResponse(), { status: 200 });
        }

        ensureTessApiConfigured();

        const response = await tessClient.get("/user", {
            headers: getTessCookieHeader(accessToken),
        });

        return NextResponse.json(response.data, { status: 200 });
    } catch (error: unknown) {
        const status = axios.isAxiosError(error) ? (error.response?.status ?? 500) : 500;
        const data = axios.isAxiosError(error)
            ? (error.response?.data ?? { message: "Failed to fetch /user" })
            : { message: "Failed to fetch /user" };
        return NextResponse.json(data, { status });
    }
}
