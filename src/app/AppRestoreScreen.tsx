import { LoadingState } from "../components/UiPrimitives";

export function AppRestoreScreen({ label }: { label: string }) {
  return (
    <main className="authLandingPage appRestorePage">
      <section className="authPanel appRestorePanel" aria-live="polite">
        <img className="authPanelLogo" src="/brand/rc-drift-sync-logo-transparent.png" alt="RC Drift Sync" />
        <LoadingState label={label} />
        <p className="authMessage">Restoring your garage. If this screen stays here, refresh once to pick up the latest app shell.</p>
      </section>
    </main>
  );
}
