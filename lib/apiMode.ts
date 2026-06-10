import { randomUUID } from "crypto";

// Generated once per server process — not guessable unlike a fixed string.
export const MOCK_ACCESS_TOKEN = randomUUID();

export function isMockApiMode() {
    // Allow mock/demo mode in production only when explicitly opted in via ALLOW_DEMO_IN_PROD.
    if (process.env.NODE_ENV === "production") {
        return process.env.ALLOW_DEMO_IN_PROD?.toLowerCase() === "true"
            && process.env.USE_MOCK_API?.toLowerCase() === "true";
    }
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
