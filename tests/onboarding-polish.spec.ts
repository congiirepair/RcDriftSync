import { expect, test } from "@playwright/test";

test("first-time onboarding is skippable and normal screens use friendly wording", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    localStorage.removeItem("rc-onboarding-complete");
    const request = indexedDB.deleteDatabase("rc-tune-pwa");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  }));

  await page.goto("/");
  await expect(page.getByRole("dialog", { name: "Welcome to RC Drift Sync" })).toBeVisible();
  await expect(page.getByText("Welcome to your setup hub")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).tap();
  await expect(page.getByText("Create your first car")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).tap();
  await expect(page.getByRole("button", { name: "RDX", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Next" }).tap();
  await expect(page.getByRole("button", { name: "Save my own tunes" })).toBeVisible();
  await page.getByRole("button", { name: "Skip" }).tap();
  await expect(page.getByRole("dialog", { name: "Welcome to RC Drift Sync" })).toBeHidden();

  await expect(page.getByPlaceholder("Search cars, tunes, tracks...")).toBeVisible();
  await page.getByPlaceholder("Search cars, tunes, tracks...").fill("RDX");
  await expect(page.locator(".searchResults").getByText("No matches yet. Try chassis, track, tire, or tune name.")).toBeVisible();

  await page.goto("/settings");
  await expect(page.getByText("Add RC Drift Sync to your phone")).toBeVisible();
  await expect(page.getByText("Keep your tunes backed up")).toBeVisible();
  await expect(page.getByText("Ready collections")).toHaveCount(0);
});
