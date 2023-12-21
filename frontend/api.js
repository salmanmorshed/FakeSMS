export function getBackendHost() {
    return import.meta.env["VITE_BACKEND_HOST"] || "127.0.0.1:8104";
}

export async function fetchConversationPreviews(identity) {
    const response = await fetch(`//${getBackendHost()}/api/${identity}/previews`);
    return await response.json();
}

export async function deleteConversation(identity, phoneNumber) {
    const res = await fetch(`///${getBackendHost()}/api/${identity}/messages/${phoneNumber}`, { method: "DELETE" });
    return res.status === 204;
}

export async function fetchMessages(identity, phoneNumber) {
    const response = await fetch(`//${getBackendHost()}/api/${identity}/messages/${phoneNumber}`);
    return await response.json();
}

export async function createMessage(identity, phoneNumber, message) {
    const response = await fetch(`//${getBackendHost()}/api/${identity}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: phoneNumber, message }),
    });
    return await response.json();
}

export async function fetchRegisteredNumbers() {
    const response = await fetch(`//${getBackendHost()}/api/config/registered_numbers`);
    return await response.json();
}

export async function updateRegisteredNumber(numbers) {
    const response = await fetch(`//${getBackendHost()}/api/config/registered_numbers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(numbers),
    });
    return await response.json();
}

export async function fetchWebhookURL() {
    const response = await fetch(`//${getBackendHost()}/api/config/webhook_url`);
    return await response.json();
}

export async function updateWebhookURL(url) {
    const response = await fetch(`//${getBackendHost()}/api/config/webhook_url`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(url),
    });
    return await response.json();
}
