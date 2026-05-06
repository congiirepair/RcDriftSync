import { expect, test } from "@playwright/test";
import { seedExampleGarage } from "./helpers";

test("production routes survive direct loads", async ({ page }) => {
  await seedExampleGarage(page);

  await page.goto("/t/share-rdx-baseline");
  await expect(page.getByRole("heading", { name: "Fixture RDX asphalt setup" })).toBeVisible();
  await expect(page.getByText("https://rcdriftsync.com/t/share-rdx-baseline")).toBeVisible();
  await expect(page.locator("svg").filter({ hasText: "" }).first()).toBeVisible();

  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Public tune library" })).toBeVisible();
  await expect(page.getByText("Fixture RDX asphalt setup")).toBeVisible();

  await page.goto("/home");
  await expect(page.getByRole("img", { name: "RC Drift Sync" })).toBeVisible();

  await page.goto("/garage");
  await expect(page.getByRole("heading", { name: "Garage" })).toBeVisible();

  await page.goto("/cars");
  await expect(page.getByRole("heading", { name: "Cars", exact: true })).toBeVisible();

  await page.goto("/tunes");
  await expect(page.getByRole("heading", { name: "Tunes", exact: true })).toBeVisible();

  await page.goto("/builder");
  await expect(page.getByRole("heading", { name: "Build a setup" })).toBeVisible();

  await page.goto("/tune/tune-fixture-rdx");
  await expect(page.getByRole("heading", { name: "Build a setup" })).toBeVisible();

  await page.goto("/community");
  await expect(page.getByRole("heading", { name: "Community", level: 1 })).toBeVisible();

  await page.goto("/sessions");
  await expect(page.getByRole("heading", { name: "Log a track day" })).toBeVisible();

  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Fixture Driver" })).toBeVisible();

  await page.goto("/u/fixture-driver");
  await expect(page.getByRole("heading", { name: "Fixture Driver" })).toBeVisible();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Sign in required" })).toBeVisible();
  await expect(page.getByText("Master admin tools are protected")).toBeVisible();

  await page.goto("/admin/pdf-mapper");
  await expect(page.getByRole("heading", { name: "Official PDF mapper" })).toBeVisible();
  await expect(page.getByText("RDX_Setting-Sheet_A4_20260325.pdf", { exact: true })).toBeVisible();

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Login", exact: true })).toBeVisible();

  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

  await page.goto("/settings");
  await expect(page.getByText("Add RC Drift Sync to your phone")).toBeVisible();
});

test("pwa manifest and service worker are production-ready", async ({ page }) => {
  await page.goto("/");
  const manifest = await page.evaluate(async () => {
    const response = await fetch("/manifest.webmanifest");
    return response.json();
  });
  expect(manifest.name).toBe("RC Drift Sync");
  expect(manifest.start_url).toBe("/");
  expect(manifest.scope).toBe("/");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.some((icon: { src: string; sizes: string }) => icon.src === "/icons/icon-192.png" && icon.sizes === "192x192")).toBeTruthy();
  expect(manifest.icons.some((icon: { src: string; sizes: string }) => icon.src === "/icons/icon-512.png" && icon.sizes === "512x512")).toBeTruthy();
  expect(manifest.shortcuts.some((shortcut: { url: string }) => shortcut.url === "/sessions")).toBeTruthy();

  const sw = await page.evaluate(async () => {
    const response = await fetch("/sw.js");
    return response.text();
  });
  expect(sw).toContain("rc-drift-sync-v2");
  expect(sw).toContain('event.request.mode === "navigate"');
  expect(sw).toContain("/icons/icon-512.png");
});

test("builder supports official and universal setup modes", async ({ page }) => {
  await seedExampleGarage(page);
  await page.goto("/builder");

  await expect(page.getByLabel("Setup mode")).toContainText("Official template");
  await page.getByLabel("Starting point").selectOption("baseline");
  await page.getByRole("button", { name: "Create tune" }).tap();
  await expect(page.getByRole("heading", { name: "Untitled tune" })).toBeVisible();

  await page.goto("/garage");
  await page.getByRole("button", { name: "Add car" }).first().tap();
  await page.getByLabel("Car name").fill("Universal Yokomo");
  await page.getByLabel("Brand / chassis suggestion").selectOption("Yokomo");
  await page.getByRole("button", { name: "Save car" }).click({ force: true });
  await expect(page.getByRole("dialog", { name: "Add car" })).toBeHidden();
  await page.goto("/builder");
  await page.getByLabel("Choose car").selectOption({ label: "Universal Yokomo - Yokomo" });
  await expect(page.getByLabel("Setup mode")).toContainText("Universal RC Drift Sync setup sheet");
});
