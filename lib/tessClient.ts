import axios from "axios";

const apiBaseURL = process.env.TESS_API_BASE_URL;
const ordersBaseURL = process.env.TESS_ORDERS_API_BASE_URL || apiBaseURL;

export const tessClient = axios.create({
    baseURL: apiBaseURL,
    timeout: 10000,
})

export const tessOrdersClient = axios.create({
    baseURL: ordersBaseURL,
    timeout: 10000,
})

export function ensureTessApiConfigured() {
    if (!apiBaseURL) {
        throw new Error("Missing TESS_API_BASE_URL in environment");
    }
}

export function ensureTessOrdersApiConfigured() {
    if (!ordersBaseURL) {
        throw new Error("Missing TESS_ORDERS_API_BASE_URL (or TESS_API_BASE_URL) in environment");
    }
}

export function getTessCookieHeader(token = process.env.TESS_ACCESS_TOKEN) {
    if (!token) {
        throw new Error("Missing TESS_ACCESS_TOKEN in environment");
    }

    return { Cookie: `accessToken=${token}` };
}