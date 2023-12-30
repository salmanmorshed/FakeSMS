import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { fetchMessages, createMessage, deleteConversation } from "../api.js";
import { formatDateTime, getHost } from "../utils.js";
import Linkify from "linkify-react";

export default function Thread() {
    const { inboxId, targetId } = useParams();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [wsActive, setWsActive] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        fetchMessages(inboxId, targetId).then(data => setMessages(data));
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }, [messages]);

    const { sendJsonMessage } = useWebSocket(`ws://${getHost()}/ws/${inboxId}`, {
        shouldReconnect: () => true,
        onOpen() {
            if (import.meta.env.DEV) console.log("WS opened");
            setWsActive(true);
        },
        onClose() {
            if (import.meta.env.DEV) console.log("WS closed");
            setWsActive(false);
        },
        onMessage(event) {
            const wsMessage = JSON.parse(event.data);
            if (import.meta.env.DEV) console.log("WS message", wsMessage);
            if (wsMessage["type"] === "event:message_sent") {
                setMessages(messages => [...messages, wsMessage["payload"]]);
            }
            if (wsMessage["type"] === "event:message_received") {
                if (wsMessage["payload"]["sender"] !== wsMessage["payload"]["recipient"])
                    setMessages(messages => [...messages, wsMessage["payload"]]);
            }
            if (wsMessage["type"] === "event:deleted_conversation" && wsMessage["phone_number"] === targetId) {
                navigate(`/${inboxId}`);
            }
        },
    });

    async function messageSubmitHandler(message) {
        if (wsActive) {
            sendJsonMessage({
                type: "action:send_message",
                payload: { recipient: targetId, message },
            });
        } else {
            const newMessage = await createMessage(inboxId, targetId, message);
            if (newMessage) setMessages(messages => [...messages, newMessage]);
        }
    }

    async function deleteThreadHandler(event) {
        event.preventDefault();
        if (confirm("Are you sure?")) {
            if (wsActive) {
                sendJsonMessage({
                    type: "action:delete_conversation",
                    payload: { target: targetId },
                });
            } else {
                if (await deleteConversation(inboxId, targetId)) navigate(`/${inboxId}`);
            }
        }
    }

    return (
        <>
            <div className="flex bg-gray-300 p-4 justify-between">
                <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    onClick={() => navigate(`/${inboxId}`)}
                >
                    &lt; Back
                </button>
                <h1 className="text-xl py-1 font-bold">{targetId}</h1>
                <button
                    className="border border-red-500 hover:bg-red-500 hover:text-white text-red-500 py-2 px-4 rounded"
                    onClick={deleteThreadHandler}
                >
                    Delete
                </button>
            </div>

            {!wsActive && (
                <div className="text-center text-sm text-gray-600 py-2">
                    Websocket disconnected. Live updates are unavailable.
                </div>
            )}

            <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
                {messages.map((message, i) =>
                    message["sender"] === inboxId ? (
                        <Outgoing message={message} key={i} />
                    ) : (
                        <Incoming message={message} key={i} />
                    ),
                )}
                <div className="mt-5" ref={bottomRef} />
            </div>
            <div className="bg-gray-300 p-4">
                <Sender sendHandler={messageSubmitHandler} />
            </div>
        </>
    );
}

function Incoming({ message }) {
    return (
        <div className="flex w-full mt-2 space-x-3 max-w-xs">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
            <div>
                <div className="bg-gray-200 p-3 rounded-r-lg rounded-bl-lg">
                    <p className="text-sm incomingMessageContainer">
                        <Linkify options={{ target: "_blank" }}>{message["message"]}</Linkify>
                    </p>
                </div>
                <span className="text-xs text-gray-500 leading-none">{formatDateTime(message["sent_at"])}</span>
            </div>
        </div>
    );
}

function Outgoing({ message }) {
    return (
        <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
            <div>
                <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
                    <p className="text-sm outgoingMessageContainer">
                        <Linkify options={{ target: "_blank" }}>{message["message"]}</Linkify>
                    </p>
                </div>
                <span className="text-xs text-gray-500 leading-none">
                    {formatDateTime(message["sent_at"])}
                    {message["webhook_success"] === null || message["webhook_success"] ? null : (
                        <span className="text-red-500 ml-1">Failed</span>
                    )}
                </span>
            </div>
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600"></div>
        </div>
    );
}

function Sender({ sendHandler }) {
    const [newMessage, setNewMessage] = useState("");

    async function messageSubmitHandler(event) {
        event.preventDefault();
        if (newMessage) {
            await sendHandler(newMessage);
            setNewMessage("");
        }
    }

    return (
        <form onSubmit={messageSubmitHandler} className="flex">
            <input
                type="text"
                className="h-10 w-full rounded px-3 text-sm"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message"
                autoComplete="off"
                required
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 ml-2 rounded">
                Send
            </button>
        </form>
    );
}
