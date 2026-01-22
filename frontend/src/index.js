import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// PATCH: Fix ResizeObserver loop error by debouncing the callback
// This is the proper fix for Radix UI components
const OriginalResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends OriginalResizeObserver {
  constructor(callback) {
    super((entries, observer) => {
      requestAnimationFrame(() => {
        callback(entries, observer);
      });
    });
  }
};

// Also suppress any remaining console errors about ResizeObserver
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.toString?.().includes?.('ResizeObserver') || 
      (typeof args[0] === 'string' && args[0].includes('ResizeObserver'))) {
    return;
  }
  originalError.apply(console, args);
};

// Suppress at window level
window.addEventListener('error', (e) => {
  if (e.message?.includes?.('ResizeObserver')) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
}, true);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
