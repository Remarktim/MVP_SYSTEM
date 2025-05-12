import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Use createRoot API without StrictMode in production for better performance
const root = createRoot(document.getElementById("root"));

// Conditionally use StrictMode only in development
if (import.meta.env) {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Performance optimized render in production
  root.render(<App />);
}
