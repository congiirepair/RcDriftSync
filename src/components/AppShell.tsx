import { Bell, Bookmark, Boxes, CarFront, ChevronDown, CirclePlus, Home, Radio, Search, UserRound, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { navigate } from "../utils/routing";

interface AppShellProps {
  active: "home" | "garage" | "builder" | "community" | "profile";
  children: ReactNode;
}

const navItems = [
  { id: "home", label: "Home", href: "/home", icon: Home },
  { id: "garage", label: "Garage", href: "/garage", icon: CarFront },
  { id: "builder", label: "Tune Builder", href: "/builder", icon: Radio },
  { id: "community", label: "Community", href: "/community", icon: UsersRound },
  { id: "profile", label: "Profile", href: "/profile", icon: UserRound }
] as const;

export function AppShell({ active, children }: AppShellProps) {
  const activeLabel = navItems.find((item) => item.id === active)?.label ?? "Dashboard";
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
                <span>{item.label === "Tune Builder" ? "My Tunes" : item.label}</span>
              </button>
            );
          })}
          <button type="button" onClick={() => navigate("/tunes")}><Bookmark size={18} /><span>Favorites</span></button>
          <button type="button" onClick={() => navigate("/garage")}><Boxes size={18} /><span>Garage</span></button>
          <button type="button" onClick={() => navigate("/settings")}><Bell size={18} /><span>Notifications</span></button>
        </nav>
      </aside>
      <div className="desktopMain">
        <button className="desktopCenterLogo" type="button" onClick={() => navigate("/home")} aria-label="RC Drift Sync home">
          <img src="/brand/rc-drift-sync-logo-transparent.png" alt="RC Drift Sync" />
        </button>
        <header className="desktopTopBar">
          <label className="desktopSearch">
            <Search size={18} />
            <input placeholder="Search tunes, drivers, chassis, tags..." />
            <kbd>Ctrl K</kbd>
          </label>
          <button className="desktopCreate" type="button" onClick={() => navigate("/builder")}><CirclePlus size={18} /> Create Tune</button>
          <button className="desktopBell" type="button" aria-label="Notifications"><Bell size={20} /></button>
          <button className="desktopUser" type="button" onClick={() => navigate("/profile")}>
            <span>RC</span>
            <strong>congiirepair</strong>
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
