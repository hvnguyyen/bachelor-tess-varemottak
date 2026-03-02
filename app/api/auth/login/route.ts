import { NextResponse } from "next/server";
import { tessClient } from "@/lib/tessClient";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const response = await tessClient.post("/login/cookie", {
            username, password,
        });

        const accessToken = response.data?.accessToken ??
            response.data?.token ??
            response.data?.data?.accessToken;

        if (!accessToken) {
            return NextResponse.json(
                { message: "Login succeeded, but no access token in response" },
                { status: 502 });
        }

        const res = NextResponse.json({ ok: true }, { status: 200 });
        res.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return res;

    } catch (error: any) {
        const status = error?.response?.status ?? 500;
        const data = error?.response?.data ?? { message: "Login failed" };
        return NextResponse.json(data, { status });
    }
}; 