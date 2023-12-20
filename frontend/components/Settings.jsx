import { useEffect, useState } from "react";
import { fetchRegisteredNumbers, updateRegisteredNumber, fetchWebhookURL, updateWebhookURL } from "../api.js";

export default function Settings() {
    const [numbers, setNumbers] = useState([]);
    const [webhook, setWebhook] = useState("");

    useEffect(() => {
        fetchRegisteredNumbers().then(data => setNumbers(data));
        fetchWebhookURL().then(data => setWebhook(data));
    }, []);

    async function addNumberHandler() {
        const num = prompt("Enter phone number");
        if (num) {
            setNumbers(await updateRegisteredNumber([...numbers, num]));
        }
    }

    async function deleteNumberHandler(targetValue) {
        if (confirm("Are you sure?")) {
            setNumbers(await updateRegisteredNumber(numbers.filter(num => num !== targetValue)));
        }
    }

    async function webhookFormSubmitHandler(event) {
        event.preventDefault();
        if (confirm("Are you sure?")) {
            setWebhook(await updateWebhookURL(webhook));
        }
    }

    return (
        <>
            <div className="px-5">
                <h5 className="mb-2">Webhook URL</h5>
                <form onSubmit={webhookFormSubmitHandler} className="flex">
                    <input
                        type="url"
                        className="w-full rounded text-sm border border-gray-400 px-2 me-1"
                        name="webhook_url"
                        value={webhook}
                        onChange={e => setWebhook(e.target.value)}
                        placeholder="Webhook URL"
                        required
                    />
                    <button
                        type="submit"
                        className="
                            border border-blue-500 hover:bg-blue-500 hover:text-white text-blue-500
                            text-sm py-2 px-3 rounded
                        "
                    >
                        Save
                    </button>
                </form>
                <br />
                <h5 className="mb-2">Registered numbers</h5>
                <table className="w-full border mb-2">
                    <tbody>
                        {numbers.map(num => (
                            <tr key={num} className="border-b">
                                <td className="py-2 px-4 w-4/5">{num}</td>
                                <td className="py-2 px-4 w-1/5">
                                    <button
                                        className="
                                            w-full border border-red-500 hover:bg-red-500 hover:text-white text-red-500
                                            py-1 rounded text-sm
                                        "
                                        onClick={() => deleteNumberHandler(num)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    className="
                        border border-blue-500 hover:bg-blue-500 hover:text-white text-blue-500
                        text-sm py-2 px-2 rounded
                    "
                    onClick={addNumberHandler}
                >
                    Register a new number
                </button>
            </div>
        </>
    );
}
