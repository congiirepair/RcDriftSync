import { expect, test } from "@playwright/test";
import { resetDb, seedDb } from "./helpers";

test("release routes render current empty/authless states in e2e mode", async ({ page }) => {
  await resetDb(page);

  await page.goto("/home");
  await expect(page.getByRole("img", { name: "RC Drift Sync" })).toBeVisible();
  await expect(page.getByText("Create Quick Tune")).toBeVisible();

  await page.goto("/garage");
  await expect(page.getByRole("heading", { name: "Garage", level: 1 })).toBeVisible();
  await expect(page.getByText("Add your first RC drift car to start saving tunes.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add first car" })).toBeVisible();

  await page.goto("/builder");
  await expect(page.getByRole("heading", { name: "No tune selected" })).toBeVisible();
  await expect(page.getByText("Add a car first")).toBeVisible();

  await page.goto("/community");
  await expect(page.getByRole("heading", { name: "Community", level: 1 })).toBeVisible();
  await expect(page.getByText("Public tunes will appear here once drivers start sharing.")).toBeVisible();

  await page.goto("/sessions");
  await expect(page.getByRole("heading", { name: "Log a session" })).toBeVisible();
  await expect(page.getByText("Create a tune first")).toBeVisible();

  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByText("Account storage is not connected")).toBeVisible();

  await page.goto("/login");
  await expect(page.getByRole("region", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Sign in to continue|Login/ })).toBeVisible();

  await page.goto("/signup");
  await expect(page.getByRole("region", { name: "Create account" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Create your RC Drift Sync account|Create account/ })).toBeVisible();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Sign in required" })).toBeVisible();

  await page.goto("/admin/pdf-mapper");
  await expect(page.getByRole("heading", { name: "Official PDF mapper" })).toBeVisible();

  await page.goto("/does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "That garage bay is empty" })).toBeVisible();
});

test("pwa manifest and service worker match the current release assets", async ({ page }) => {
  await page.goto("/");
  const manifest = await page.evaluate(async () => {
    const response = await fetch("/manifest.webmanifest");
    return response.json();
  });

  expect(manifest.name).toBe("RC Drift Sync");
  expect(manifest.start_url).toBe("/");
  expect(manifest.scope).toBe("/");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.some((icon: { src: string; sizes: string }) => icon.src === "/icons/rcds-icon-192-v3.png" && icon.sizes === "192x192")).toBeTruthy();
  expect(manifest.icons.some((icon: { src: string; sizes: string }) => icon.src === "/icons/rcds-icon-512-v3.png" && icon.sizes === "512x512")).toBeTruthy();
  expect(manifest.shortcuts.some((shortcut: { url: string }) => shortcut.url === "/sessions")).toBeTruthy();

  const sw = await page.evaluate(async () => {
    const response = await fetch("/sw.js");
    return response.text();
  });
  expect(sw).toContain("clearRcDriftSyncCaches");
  expect(sw).toContain("cache: \"no-store\"");
  expect(sw).toContain("registration.unregister");
});

test("home route tolerates legacy missing photo entries", async ({ page }) => {
  const now = "2026-05-16T12:00:00.000Z";

  await resetDb(page);
  await seedDb(page, {
    cars: [{
      id: "car-legacy-photo",
      name: "Legacy photo car",
      brand: "Reve D",
      chassisBrand: "Reve D",
      chassisBrandSlug: "reve-d",
      chassis: "Reve D RDX",
      chassisModel: "RDX",
      chassisModelSlug: "rdx",
      chassisType: "RWD drift",
      drivetrainType: "RWD",
      scale: "1/10",
      photos: [null],
      sheetId: "rdx-template",
      createdAt: now,
      updatedAt: now
    }],
    tunes: [{
      id: "tune-legacy-photo",
      name: "Legacy photo tune",
      carId: "car-legacy-photo",
      sheetId: "rdx-template",
      date: "2026-05-16",
      track: "Local P-tile",
      surface: "P-tile",
      grip: "Medium",
      rating: 4,
      tags: [],
      values: { tires: "DS LF-5" },
      selections: {},
      notes: "",
      photos: [null],
      history: [],
      ownerId: "local-user",
      visibility: "private",
      createdAt: now,
      updatedAt: now
    }],
    electronicsProfiles: [],
    profiles: [],
    comments: [],
    favorites: [],
    follows: [],
    trackSessions: [],
    notificationSettings: {
      tuneCloned: false,
      tuneLiked: false,
      tuneCommented: false,
      followedDriverSharedTune: false,
      weeklyTrendingTunes: false,
      backupReminder: true
    }
  });

  await page.goto("/home");
  await expect(page.getByRole("heading", { name: "Trackside setup, saved fast." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Refresh RC Drift Sync" })).toHaveCount(0);
});
