import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";   // ✅ правильний шлях
import App from "./App"; // ✅ правильний шлях

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
