import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ 
        message: "Hello from TESS Varemottak API!",
        timestamp: new Date().toISOString(),
        status: "online", 
    });
}