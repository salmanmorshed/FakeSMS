import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { fetchConversationPreviews } from "../api.js";
import { formatDateTime, getHost } from "../utils.js";

export default function Previews() {
    const { inboxId } = useParams();
    const navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [updateCount, setUpdateCount] = useState(0);
    const [wsActive, setWsActive] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        fetchConversationPreviews(inboxId).then(data => setContacts(data));
    }, [updateCount]);

    useWebSocket(`ws://${getHost()}/ws/${inboxId}`, {
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
            setUpdateCount(updateCount => updateCount + 1);
        },
    });

    return (
        <>
            <div className="flex bg-gray-300 p-4 justify-between">
                <h1 className="text-xl py-1">Inbox of {inboxId}</h1>
                <button
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                    onClick={() => navigate("/")}
                >
                    Logout
                </button>
            </div>

            {!wsActive && (
                <div className="text-center text-sm text-gray-600 py-2">
                    Websocket disconnected. Live updates are unavailable.
                </div>
            )}

            {contacts.map((contact, i) => (
                <Preview inboxId={inboxId} preview={contact} key={i} />
            ))}

            {showCreate ? (
                <div className="flex justify-center mt-5">
                    <Create inboxId={inboxId} onClose={() => setShowCreate(false)} />
                </div>
            ) : (
                <div className="flex justify-center mt-5">
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        onClick={() => setShowCreate(true)}
                    >
                        + Start a new thread
                    </button>
                </div>
            )}
        </>
    );
}

function Preview({ inboxId, preview }) {
    const navigate = useNavigate();

    return (
        <>
            <a
                className="px-3 flex items-center bg-grey-light hover:bg-gray-100 cursor-pointer"
                onClick={() => navigate(`/${inboxId}/${preview["phone_number"]}`)}
            >
                <div>
                    {preview["direction"] === "incoming" ? (
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
                    ) : (
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600"></div>
                    )}
                </div>
                <div className="ml-4 flex-1 border-b border-grey-lighter py-4">
                    <div className="flex items-bottom justify-between">
                        <p className="text-grey-darkest">{preview["phone_number"]}</p>
                        <p className="text-xs text-grey-darkest">{formatDateTime(preview["sent_at"])}</p>
                    </div>
                    <p className="text-grey-dark mt-1 text-sm">{preview["last_message"]}</p>
                </div>
            </a>
        </>
    );
}

function Create({ inboxId, onClose }) {
    const navigate = useNavigate();
    const [newTarget, setNewTarget] = useState("");

    function createNewHandler(event) {
        event.preventDefault();
        navigate(`/${inboxId}/${newTarget}`);
    }

    return (
        <>
            <form onSubmit={createNewHandler} className="flex">
                <input
                    type="tel"
                    className="border border-gray-400 rounded px-3"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    name="target"
                    placeholder="Phone number"
                    required
                />
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 ml-2 rounded">
                    Start thread
                </button>
                <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 ml-1 rounded"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </form>
        </>
    );
}
