// Polyfill for setImmediate
if (typeof setImmediate === "undefined") {
  // Typing the polyfill as a function
  (window as any).setImmediate = (fn: Function) => {
    return setTimeout(fn, 0);
  };
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  //<StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  //</StrictMode>
);
