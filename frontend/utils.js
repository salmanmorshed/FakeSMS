import { format, parseISO } from "date-fns";

export function getHost() {
    if (import.meta.env.PROD) return location.host;
    const host = import.meta.env["VITE_BACKEND"];
    if (!host) throw new Error("VITE_BACKEND environment variable must be set");
    return host;
}

export function formatDateTime(textValue) {
    try {
        return format(parseISO(textValue), "PP p");
    } catch (e) {
        return "";
    }
}
