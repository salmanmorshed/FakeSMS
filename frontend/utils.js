import { format, parseISO } from "date-fns";

export function formatDateTime(textValue) {
    try {
        return format(parseISO(textValue), "PP p");
    } catch (e) {
        return "";
    }
}
