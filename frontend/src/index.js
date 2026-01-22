import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Fix ResizeObserver loop error - patch before anything else runs
if (typeof window !== 'undefined' && window.ResizeObserver) {
  const RO = window.ResizeObserver;
  window.ResizeObserver = class extends RO {
    constructor(cb) {
      super((entries, observer) => {
        requestAnimationFrame(() => {
          cb(entries, observer);
        });
      });
    }
  };
}

// Suppress ResizeObserver console errors
const origError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('ResizeObserver')) return;
  origError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
