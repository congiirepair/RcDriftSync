export type AppRoute =
  | { name: "home" | "garage" | "cars" | "tunes" | "builder" | "community" | "library" | "sessions" | "admin" | "settings" | "login" | "signup" | "profile" }
  | { name: "pdfMapper" }
  | { name: "tune"; tuneId: string }
  | { name: "share"; shareId: string }
  | { name: "track"; trackSlug: string }
  | { name: "driverProfile"; username: string };

const staticRoutes = ["home", "garage", "cars", "tunes", "builder", "community", "library", "sessions", "admin", "settings", "login", "signup", "profile"] as const;
type StaticRouteName = (typeof staticRoutes)[number];

export function parseRoute(pathname = window.location.pathname): AppRoute {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "home" };
  if (parts[0] === "admin" && parts[1] === "pdf-mapper") return { name: "pdfMapper" };
  if (staticRoutes.includes(parts[0] as StaticRouteName)) return { name: parts[0] as StaticRouteName };
  if (parts[0] === "t" && parts[1]) return { name: "share", shareId: parts[1] };
  if (parts[0] === "tune" && parts[1] === "share" && parts[2]) return { name: "share", shareId: parts[2] };
  if (parts[0] === "tune" && parts[1]) return { name: "tune", tuneId: parts[1] };
  if (parts[0] === "u" && parts[1]) return { name: "driverProfile", username: parts[1] };
  if (parts[0] === "track" && parts[1]) return { name: "track", trackSlug: parts[1] };
  return { name: "home" };
}

export function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
