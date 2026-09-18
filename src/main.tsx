import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress harmless third-party browser extension / performance observer errors
if (typeof window !== 'undefined') {
  const shouldSuppress = (msg: string, filename?: string, stack?: string) => {
    const combined = (msg + " " + (filename || "") + " " + (stack || "")).toLowerCase();
    return (
      combined.includes("starttime") ||
      combined.includes("reportallchanges") ||
      combined.includes("message port closed") ||
      combined.includes("resizeobserver loop") ||
      combined.includes("chrome-extension://") ||
      combined.includes("moz-extension://")
    );
  };

  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const combined = args.map(a => String(a)).join(' ');
    if (shouldSuppress(combined)) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  window.addEventListener(
    'error',
    (event) => {
      const msg = event.message || event.error?.message || String(event.error || '');
      const stack = event.error?.stack || '';
      const filename = event.filename || '';
      if (shouldSuppress(msg, filename, stack)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reasonMsg = event.reason?.message || String(event.reason || '');
      const stack = event.reason?.stack || '';
      if (shouldSuppress(reasonMsg, '', stack)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

