import { NextResponse } from "next/server";
import axios from "axios";
import { isMockApiMode } from "@/lib/apiMode";
import { ensureTessApiConfigured, tessClient } from "@/lib/tessClient";

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null);
        const idToken = body?.idToken;
        const accessToken = body?.accessToken;

        if (isMockApiMode()) {
            if (!idToken || !accessToken) {
                return NextResponse.json(
                    { message: "Missing idToken or accessToken" },
                    { status: 400 }
                );
            }

            const res = NextResponse.json({ ok: true, mock: true }, { status: 200 });
            res.cookies.set("accessToken", accessToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 60 * 24,
            });
            return res;
        }

        ensureTessApiConfigured();

        if (!idToken || !accessToken) {
            return NextResponse.json(
                { message: "Missing idToken or accessToken" },
                { status: 400 }
            );
        }

        await tessClient.post("/login/cookie", {
            idToken, accessToken,
        });

        const res = NextResponse.json({ ok: true }, { status: 200 });
        res.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return res;

    } catch (error: unknown) {
        const status = axios.isAxiosError(error) ? (error.response?.status ?? 500) : 500;
        const data = axios.isAxiosError(error) ? (error.response?.data ?? { message: "Login failed" }) : { message: "Login failed" };
        return NextResponse.json(data, { status });
    }
}; 
