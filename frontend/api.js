import { getHost } from "./utils.js";

export async function fetchConversationPreviews(inboxId) {
    const response = await fetch(`//${getHost()}/api/${inboxId}/previews`);
    return await response.json();
}

export async function deleteConversation(inboxId, targetId) {
    const res = await fetch(`//${getHost()}/api/${inboxId}/messages/${targetId}`, { method: "DELETE" });
    return res.status === 204;
}

export async function fetchMessages(inboxId, targetId) {
    const response = await fetch(`//${getHost()}/api/${inboxId}/messages/${targetId}`);
    return await response.json();
}

export async function createMessage(inboxId, targetId, message) {
    const response = await fetch(`//${getHost()}/api/${inboxId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: targetId, message }),
    });
    return await response.json();
}

export async function fetchConfig() {
    const response = await fetch(`//${getHost()}/api/config`);
    return await response.json();
}

export async function partialUpdateConfig(configData) {
    const response = await fetch(`//${getHost()}/api/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configData),
    });
    return await response.json();
}
