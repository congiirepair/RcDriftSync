import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
let captureAppException: (error: unknown, info: ErrorInfo) => void = () => undefined;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 0
    }
  }
});

if (sentryDsn) {
  void import("@sentry/react").then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: import.meta.env.DEV ? 1 : 0.1,
      environment: import.meta.env.MODE
    });
    captureAppException = (error, info) => {
      Sentry.captureException(error, { contexts: { react: { componentStack: info.componentStack } } });
    };
  });
}

async function recoverCachedApp() {
  try {
    const cacheKeys = typeof caches !== "undefined" && caches.keys ? await caches.keys() : [];
    await Promise.all(cacheKeys.filter((key) => key.startsWith("rc-drift-sync")).map((key) => caches.delete(key)));
    const registrations = navigator.serviceWorker?.getRegistrations ? await navigator.serviceWorker.getRegistrations() : [];
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch {
    // Best-effort recovery only.
  }
}

function reloadCleanApp() {
  recoverCachedApp().finally(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("rcds_refresh", String(Date.now()));
    window.location.replace(url.toString());
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => undefined);
  });
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("RC Drift Sync render failed", error, info);
    captureAppException(error, info);
    void recoverCachedApp();
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="authLandingPage appRestorePage">
        <section className="authPanel appRestorePanel" role="alert">
          <img className="authPanelLogo" src="/brand/rc-drift-sync-logo-transparent.png" alt="RC Drift Sync" />
          <h1>Refresh RC Drift Sync</h1>
          <p className="authMessage">Your phone is holding onto an older app shell. This clears the cached shell and reloads the latest garage screen.</p>
          <button className="primaryAction fullWidth" type="button" onClick={reloadCleanApp}>
            Refresh app
          </button>
        </section>
      </main>
    );
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </QueryClientProvider>
  </StrictMode>
);
