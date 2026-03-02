import { NextResponse } from "next/server";
import { tessClient, getTessCookieHeader } from "@/lib/tessClient";

export async function GET() {
    try {
        const response = await tessClient.get("/user", {
            headers: getTessCookieHeader(),
        });

        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        const status = error?.response?.status ?? 500;
        const data = error?.response?.data ?? { message: "Failed to fetch /user" };
        return NextResponse.json(data, { status });
    }
}