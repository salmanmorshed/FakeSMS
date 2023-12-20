import { createElement } from "react";
import { format, parseISO } from "date-fns";

const URL_RE = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.?[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;

export function linkifyTextNode(textNode) {
    if (typeof textNode === "string")
        return createElement(
            "span",
            {},
            ...textNode
                .split(" ")
                .reduce(
                    (acc, el) => [
                        ...acc,
                        URL_RE.test(el) ? createElement("a", { href: el, target: "_blank" }, el) : el,
                        " ",
                    ],
                    [],
                ),
        );
}

export function formatDateTime(textValue) {
    try {
        return format(parseISO(textValue), "PP p");
    } catch (e) {
        return "";
    }
}
