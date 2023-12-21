import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Settings from "./Settings.jsx";

export default function Home() {
    const [number, setNumber] = useState("");
    const navigate = useNavigate();

    async function setIdentityFormSubmitHandler(event) {
        event.preventDefault();
        navigate(`/${number}`);
    }

    return (
        <>
            <div className="flex bg-gray-300 p-4 justify-between">
                <h1 className="text-xl py-1">FakeSMS</h1>
            </div>
            <form onSubmit={setIdentityFormSubmitHandler} className="px-5">
                <div className="mt-5">
                    <label htmlFor="identityInput" className="block text-sm font-medium leading-6 text-gray-900 ">
                        Phone number of inbox
                    </label>
                    <input
                        className="w-full rounded px-3 py-3 text-lg border border-gray-400 mt-1"
                        id="identityInput"
                        type="tel"
                        name="identity"
                        value={number}
                        onChange={e => setNumber(e.target.value)}
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
