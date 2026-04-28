import { randomUUID } from "crypto";

// Generated once per server process — not guessable unlike a fixed string.
export const MOCK_ACCESS_TOKEN = randomUUID();

export function isMockApiMode() {
    // Never allow mock mode in production, regardless of env vars.
    if (process.env.NODE_ENV === "production") return false;
    return process.env.USE_MOCK_API?.toLowerCase() === "true";
}

export function getMockMeResponse() {
    return {
        userName: "mock.user@tess.no",
        name: "Mock TESS User",
        email: "mock.user@tess.no",
        customerNumber: "169999",
    };
}
