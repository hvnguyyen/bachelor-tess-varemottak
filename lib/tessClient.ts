import axios from "axios";

const baseURL = process.env.TESS_API_BASE_URL;

if (!baseURL) {
    throw new Error("Missing TESS_API_BASE_URL in environment");
}

export const tessClient = axios.create({
    baseURL,
    timeout: 10000,
})

export function getTessCookieHeader(token = process.env.TESS_ACCESS_TOKEN) {
    if (!token) {
        throw new Error("Missing TESS_ACCESS_TOKEN in environment");
    }

    return { Cookie: `accessToken=${token}` };
}