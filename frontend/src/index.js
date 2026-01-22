import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import ErrorBoundary from "@/components/ErrorBoundary";

// ============================================================
// CRITICAL FIX: ResizeObserver loop error suppression
// This error is benign and caused by Radix UI components
// ============================================================

// 1. Patch ResizeObserver to debounce callbacks
if (typeof window !== 'undefined') {
  const OriginalResizeObserver = window.ResizeObserver;
  
  window.ResizeObserver = class PatchedResizeObserver extends OriginalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        // Use requestAnimationFrame to prevent loop errors
        window.requestAnimationFrame(() => {
          if (document.hidden) return; // Skip if page is hidden
          try {
            callback(entries, observer);
          } catch (e) {
            // Silently ignore ResizeObserver errors
          }
        });
      });
    }
  };

  // 2. Override console.error to filter ResizeObserver messages
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args[0]?.toString?.() || '';
    if (message.includes('ResizeObserver')) {
      return; // Suppress
    }
    originalConsoleError.apply(console, args);
  };

  // 3. Global error handler to catch and suppress ResizeObserver errors
  window.addEventListener('error', function(event) {
    if (event.message?.includes?.('ResizeObserver')) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      return true;
    }
  }, true);

  // 4. Unhandled rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason?.message?.includes?.('ResizeObserver')) {
      event.preventDefault();
      return true;
    }
  }, true);

  // 5. Override error reporting for React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    const originalOnCommitFiberRoot = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot;
    if (originalOnCommitFiberRoot) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = function(...args) {
        try {
          return originalOnCommitFiberRoot.apply(this, args);
        } catch (e) {
          if (e?.message?.includes?.('ResizeObserver')) {
            return;
          }
          throw e;
        }
      };
    }
  }
}

// ============================================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
