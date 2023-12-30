import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Settings from "./Settings.jsx";

export default function Home() {
    const [inboxId, setInboxId] = useState("");
    const navigate = useNavigate();

    async function setInboxIdFormSubmitHandler(event) {
        event.preventDefault();
        navigate(`/${inboxId}`);
    }

    return (
        <>
            <div className="flex bg-gray-300 p-4 justify-between">
                <h1 className="text-xl py-1">FakeSMS</h1>
            </div>
            <form onSubmit={setInboxIdFormSubmitHandler} className="px-5">
                <div className="mt-5">
                    <label htmlFor="inboxIdInput" className="block text-sm font-medium leading-6 text-gray-900 ">
                        Phone number of inbox
                    </label>
                    <input
                        className="w-full rounded px-3 py-3 text-lg border border-gray-400 mt-1"
                        id="inboxIdInput"
                        type="tel"
                        name="inboxId"
                        value={inboxId}
                        onChange={e => setInboxId(e.target.value)}
                        placeholder="Phone number"
                        required
                    />
                </div>
                <div className="mt-3">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">
                        Login to inbox
                    </button>
                </div>
            </form>
            <hr className="my-5" />
            <Settings />
        </>
    );
}
