export const MOCK_ACCESS_TOKEN = "mock-access-token";

export function isMockApiMode() {
    const serverFlag = process.env.USE_MOCK_API?.toLowerCase() === "true";
    const publicFlag = process.env.NEXT_PUBLIC_USE_MOCK_API?.toLowerCase() === "true";
    return serverFlag || publicFlag;
}

export function getMockMeResponse() {
    return {
        userName: "mock.user@tess.no",
        name: "Mock TESS User",
        email: "mock.user@tess.no",
        customerNumber: "169999",
    };
}
