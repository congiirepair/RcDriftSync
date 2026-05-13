import { BookOpenText, CarFront, ChevronDown, Gauge, Home, ListChecks, LogOut, UserRound, UsersRound, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import type { UserAccount } from "../types";
import { navigate } from "../utils/routing";

interface AppShellProps {
  active: "home" | "garage" | "tunes" | "builder" | "community" | "profile" | "tips";
  children: ReactNode;
  account?: UserAccount | null;
  onLogout?: () => void;
}

const navItems = [
  { id: "home", label: "Home", href: "/home", icon: Home },
  { id: "tunes", label: "Tunes", href: "/tunes", icon: ListChecks },
  { id: "garage", label: "Garage", href: "/garage", icon: CarFront },
  { id: "profile", label: "Profile", href: "/profile", icon: UserRound }
] as const;

const utilityItems = [
  { id: "builder", label: "Quick Tune", href: "/builder", icon: Wrench },
  { id: "community", label: "Community", href: "/community", icon: UsersRound },
  { id: "tips", label: "Tuning Tips", href: "/tips", icon: BookOpenText }
] as const;

export function AppShell({ active, children, account, onLogout }: AppShellProps) {
  const activeLabel = navItems.find((item) => item.id === active)?.label ?? utilityItems.find((item) => item.id === active)?.label ?? "Dashboard";
  const displayName = account?.displayName || account?.username || account?.email?.split("@")[0] || "RC Driver";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "RC";
  return (
    <div className="mobileShell">
      <aside className="desktopSideRail" aria-label="RC Drift Sync desktop navigation">
        <button className="brandMark" type="button" onClick={() => navigate("/home")} aria-label="RC Drift Sync home">
          <img src="/brand/rc-drift-sync-logo-transparent.png" alt="RC Drift Sync" />
        </button>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={active === item.id ? "active" : ""} type="button" onClick={() => navigate(item.href)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="sideRailDivider" />
          {utilityItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={active === item.id ? "active" : ""} type="button" onClick={() => navigate(item.href)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        {onLogout ? (
          <button className="sideRailSignOut" type="button" onClick={onLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        ) : null}
      </aside>
      <div className="desktopMain">
        <button className="desktopCenterLogo" type="button" onClick={() => navigate("/home")} aria-label="RC Drift Sync home">
          <img src="/brand/rc-drift-sync-logo-transparent.png" alt="RC Drift Sync" />
        </button>
        <header className="desktopTopBar">
          <div className="desktopPitStatus">
            <strong>Trackside Garage</strong>
            <span>{activeLabel}</span>
          </div>
          <button className="desktopCreate quickTuneButton" type="button" onClick={() => navigate("/builder")}>
            <Gauge size={27} />
            <span>
              <strong>Quick Tune</strong>
              <em>Create &amp; save fast</em>
            </span>
          </button>
          <button className="desktopUser" type="button" onClick={() => navigate("/profile")}>
            <span>
              {account?.photoURL ? <img src={account.photoURL} alt="" referrerPolicy="no-referrer" /> : initials}
            </span>
            <strong>{displayName}</strong>
            <em>{activeLabel}</em>
            <ChevronDown size={17} />
          </button>
        </header>
        <div className="shellContent">{children}</div>
      </div>
      <nav className="bottomNav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={active === item.id ? "active" : ""}
              onClick={() => navigate(item.href)}
              aria-label={item.label}
            >
              <Icon size={21} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
