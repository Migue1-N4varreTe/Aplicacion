import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/sentry"; // Initialize Sentry

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // If it's a module loading error, provide more context
  if (event.reason?.message?.includes('Failed to fetch') ||
      event.reason?.message?.includes('Loading chunk')) {
    console.error('Possible module loading issue detected');

    // You could show a user-friendly message here
    if (process.env.NODE_ENV === 'development') {
      console.warn('Try refreshing the page or check your network connection');
    }
  }
});

// Global error handling for JavaScript errors
window.addEventListener('error', (event) => {
  console.error('Global JavaScript error:', event.error);

  // Log additional context for script loading errors
  if (event.filename) {
    console.error('Error in file:', event.filename, 'at line:', event.lineno);
  }
});

// Enhanced console logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Application starting in development mode');
  console.log('🔧 Enhanced error tracking enabled');
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Make sure there's a div with id 'root' in your HTML.");
}

createRoot(rootElement).render(<App />);
