import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress ResizeObserver loop errors globally (benign error from UI libraries)
// This error occurs with Radix UI components and is safe to ignore
const resizeObserverErr = window.console.error;
window.console.error = (...args) => {
  if (args[0]?.includes?.('ResizeObserver loop') || 
      (typeof args[0] === 'string' && args[0].includes('ResizeObserver'))) {
    return;
  }
  resizeObserverErr(...args);
};

// Also suppress at window error level to prevent React error overlay
window.addEventListener('error', (e) => {
  if (e.message?.includes?.('ResizeObserver loop')) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }
});

// Suppress unhandled promise rejections related to ResizeObserver
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes?.('ResizeObserver loop')) {
    e.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
