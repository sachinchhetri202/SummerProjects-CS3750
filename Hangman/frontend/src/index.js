import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css"
import App from "./App"
import { BrowserRouter } from "react-router-dom";

//this file triggers when index.html used
//change root to App.js component
const root = createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>       
    </React.StrictMode>
)