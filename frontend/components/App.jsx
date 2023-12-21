import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home.jsx";
import Previews from "./Previews.jsx";
import Thread from "./Thread.jsx";

export default function App() {
    return (
        <>
            <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-gray-200 text-gray-800 p-10">
                <div className="flex flex-col flex-grow w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Home />}></Route>
                            <Route path="/:identity" element={<Previews />}></Route>
                            <Route path="/:identity/:target" element={<Thread />}></Route>
                        </Routes>
                    </BrowserRouter>
                </div>
            </div>
        </>
    );
}
