import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

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
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);
