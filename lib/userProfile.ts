export const USER_PROFILE_STORAGE_KEY = "user-profile";

type ApiUser = {
    name?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    userName?: string;
    email?: string;
    defaultCustomerNumber?: string | number | null;
    customerNumbers?: Array<string | number> | null;
}

export type UserProfile = {
    employeeId: string;
    name: string;
    defaultCustomerNumber: string | null;
    customerNumbers: string[];
}

function normalizeCustomerNumbers(value: ApiUser["customerNumbers"]): string[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map((entry) => String(entry).trim())
        .filter(Boolean);
}

function resolveEmployeeId(user: ApiUser): string {
    return user.email || resolveEmployeeName(user);
}

function resolveEmployeeName(user: ApiUser): string {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

    return (
        fullName ||
        user.name ||
        user.username ||
        user.userName || "TESS-bruker"
    );
}

export function extractUserProfile(data: unknown): UserProfile | null {
    const source = Array.isArray(data) ? data[0] : data;

    if (!source || typeof source !== "object") {
        return null;
    }

    const user = source as ApiUser;
    const customerNumbers = normalizeCustomerNumbers(user.customerNumbers);

    const rawDefault =
        user.defaultCustomerNumber !== null &&
            user.defaultCustomerNumber !== undefined
            ? String(user.defaultCustomerNumber).trim()
            : "";

    const defaultCustomerNumber = rawDefault || customerNumbers[0] || null;

    const mergedCustomerNumbers =
        defaultCustomerNumber && !customerNumbers.includes(defaultCustomerNumber)
            ? [defaultCustomerNumber, ...customerNumbers] : customerNumbers;

    return {
        employeeId: resolveEmployeeId(user),
        name: resolveEmployeeName(user),
        defaultCustomerNumber,
        customerNumbers: mergedCustomerNumbers
    };
}

export function saveUserProfile(profile: UserProfile) {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));

    // Midlertidig kompatibilitet med eksisterende kode.
    localStorage.setItem("employeeId", String(profile.employeeId));
}

export function getStoredUserProfile(): UserProfile | null {
    try {

        const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as Partial<UserProfile>;

        if (!parsed || typeof parsed !== "object") {
            return null;
        }

        const employeeId =
            typeof parsed.employeeId === "string" && parsed.employeeId.trim()
                ? parsed.employeeId.trim()
                : "TESS-bruker";

        const name =
            typeof parsed.name === "string" && parsed.name.trim()
                ? parsed.name.trim()
                : "TESS-bruker";

        const customerNumbers = Array.isArray(parsed.customerNumbers)
            ? parsed.customerNumbers.map((value) => String(value).trim()).filter(Boolean)
            : [];

        const defaultCustomerNumber =
            typeof parsed.defaultCustomerNumber === "string" && parsed.defaultCustomerNumber.trim()
                ? parsed.defaultCustomerNumber.trim()
                : customerNumbers[0] || null;

        return {
            name,
            employeeId,
            defaultCustomerNumber,
            customerNumbers
        };
    } catch {
        return null;
    }
}

export function clearStoredUserProfile() {
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
    localStorage.removeItem("employeeId");
}