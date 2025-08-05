import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/sentry"; // Initialize Sentry
import "./utils/mobileDebug"; // Initialize mobile debugging

// Mobile-specific error handling
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
}

// Show user-friendly error on mobile
function showMobileError(message: string) {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 1rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f9fafb;
        color: #374151;
      ">
        <div style="text-align: center; max-width: 400px;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
          <h1 style="font-size: 1.5rem; margin-bottom: 1rem; color: #1f2937;">
            Error de carga
          </h1>
          <p style="margin-bottom: 2rem; color: #6b7280;">
            ${message}
          </p>
          <button
            onclick="window.location.reload()"
            style="
              background: #16a34a;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
              width: 100%;
              max-width: 200px;
            "
          >
            Reintentar
          </button>
        </div>
      </div>
    `;
  }
}

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // If it's a module loading error, provide more context
  if (event.reason?.message?.includes('Failed to fetch') ||
      event.reason?.message?.includes('Loading chunk') ||
      event.reason?.message?.includes('Loading CSS chunk')) {
    console.error('Module loading issue detected');

    if (isMobileDevice()) {
      showMobileError('Error cargando la aplicación. Verifica tu conexión a internet.');
      return;
    }

    // You could show a user-friendly message here
    if (process.env.NODE_ENV === 'development') {
      console.warn('Try refreshing the page or check your network connection');
    }
  }

  // Prevent default error handling on mobile for better UX
  if (isMobileDevice()) {
    event.preventDefault();
  }
});

// Global error handling for JavaScript errors
window.addEventListener('error', (event) => {
  console.error('Global JavaScript error:', event.error);

  // Log additional context for script loading errors
  if (event.filename) {
    console.error('Error in file:', event.filename, 'at line:', event.lineno);
  }

  // Handle script loading errors on mobile
  if (event.message?.includes('Loading failed for the <script>') ||
      event.message?.includes('Script error')) {
    if (isMobileDevice()) {
      showMobileError('Error cargando recursos. Intenta recargar la página.');
      return;
    }
  }

  // Handle other critical errors on mobile
  if (isMobileDevice() && event.error) {
    console.error('Critical error on mobile device:', event.error);
  }
});

// Enhanced console logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Application starting in development mode');
  console.log('🔧 Enhanced error tracking enabled');
  console.log('📱 Mobile device:', isMobileDevice());
}

// Mobile-specific checks
if (isMobileDevice()) {
  console.log('📱 Mobile device detected, enabling mobile optimizations');

  // Disable zoom on input focus (prevents layout shifts)
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  if (isMobileDevice()) {
    showMobileError('Error: No se pudo inicializar la aplicación.');
  } else {
    throw new Error("Root element not found. Make sure there's a div with id 'root' in your HTML.");
  }
}

try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error('Failed to render app:', error);
  if (isMobileDevice()) {
    showMobileError('Error iniciando la aplicación. Intenta recargar.');
  } else {
    throw error;
  }
}
