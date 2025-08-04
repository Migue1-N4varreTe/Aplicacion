import * as Sentry from "@sentry/react";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const environment = import.meta.env.NODE_ENV || "development";

// Initialize Sentry only if DSN is provided
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment,
    integrations: [Sentry.browserTracingIntegration()],

    // Performance monitoring
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,

    // Error sampling
    sampleRate: 1.0,

    // Release tracking
    release: import.meta.env.VITE_APP_VERSION,

    // User context
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (environment === "development" && !import.meta.env.VITE_SENTRY_DEBUG) {
        return null;
      }

      // Filter out non-critical errors
      if (event.exception) {
        const error = hint.originalException;

        // Ignore network errors that are likely user-related
        if (error?.message?.includes("Network Error")) {
          return null;
        }

        // Ignore cancelled requests
        if (error?.name === "AbortError") {
          return null;
        }
      }

      return event;
    },

    // Additional configuration
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === "console" && breadcrumb.level !== "error") {
        return null;
      }

      return breadcrumb;
    },
  });

  console.log("✅ Sentry initialized for error monitoring");
} else {
  console.warn("⚠️ Sentry DSN not configured - error monitoring disabled");
}

// Helper functions for manual error reporting
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (sentryDsn) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach((key) => {
          scope.setContext(key, context[key]);
        });
      }
      Sentry.captureException(error);
    });
  } else {
    console.error("Error captured:", error, context);
  }
};

export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, any>,
) => {
  if (sentryDsn) {
    Sentry.withScope((scope) => {
      scope.setLevel(level);
      if (context) {
        Object.keys(context).forEach((key) => {
          scope.setContext(key, context[key]);
        });
      }
      Sentry.captureMessage(message);
    });
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
};

export const setUser = (user: {
  id: string;
  email?: string;
  username?: string;
}) => {
  if (sentryDsn) {
    Sentry.setUser(user);
  }
};

export const clearUser = () => {
  if (sentryDsn) {
    Sentry.setUser(null);
  }
};

export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: Sentry.SeverityLevel,
) => {
  if (sentryDsn) {
    Sentry.addBreadcrumb({
      message,
      category: category || "user-action",
      level: level || "info",
      timestamp: Date.now() / 1000,
    });
  }
};

// Performance monitoring helpers
export const startTransaction = (name: string, op?: string) => {
  if (sentryDsn) {
    return Sentry.startSpan({ name, op: op || "navigation" }, () => {});
  }
  return null;
};

export default Sentry;
