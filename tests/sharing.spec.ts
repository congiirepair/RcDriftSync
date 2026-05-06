import { expect, test } from "@playwright/test";
import { seedExampleGarage } from "./helpers";

test("shared tune links, privacy toggles, likes, and cloning work", async ({ page }) => {
  await seedExampleGarage(page);

  await page.goto("/t/share-rdx-baseline");
  await expect(page.getByRole("heading", { name: "Fixture RDX asphalt setup" })).toBeVisible();
  await expect(page.getByText("https://rcdriftsync.com/t/share-rdx-baseline")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chassis setup" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Filled setup PDF" })).toBeVisible();

  await page.getByRole("button", { name: "Like" }).click();
  await expect(page.getByRole("button", { name: "Liked" })).toBeVisible();
  await page.getByRole("button", { name: "Clone to My Garage" }).click();
  await expect(page.getByRole("heading", { name: /copy/i })).toBeVisible();
  await expect(page.getByText("Autosaved locally")).toBeVisible();

  await page.goto("/builder");
  await page.locator(".builderPage > .tunePicker").getByRole("button", { name: "Fixture RDX asphalt setup", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Fixture RDX asphalt setup" })).toBeVisible();
  await page.getByLabel("Visibility").selectOption("private");
  await expect(page.getByText("Private by default")).toBeVisible();
  const privateShareId = await page.evaluate(() => {
    const dbRequest = indexedDB.open("rc-tune-pwa");
    return new Promise<string>((resolve, reject) => {
      dbRequest.onerror = () => reject(dbRequest.error);
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const tx = db.transaction("app", "readonly");
        const get = tx.objectStore("app").get("state");
        get.onsuccess = () => resolve(get.result.tunes.find((tune: { name: string }) => tune.name === "Fixture RDX asphalt setup").shareId);
        get.onerror = () => reject(get.error);
      };
    });
  });
  await page.goto(`/t/${privateShareId}`);
  await expect(page.getByRole("heading", { name: "Shared tune not available" })).toBeVisible();

  await page.goto("/builder");
  await page.locator(".builderPage > .tunePicker").getByRole("button", { name: "Fixture RDX asphalt setup", exact: true }).click();
  await page.getByLabel("Visibility").selectOption("unlisted");
  await page.getByLabel("Show notes").uncheck();
  await page.getByLabel("Show ESC tune").check();
  await page.getByLabel("Allow cloning").check();
  await expect(page.locator(".shareLinkBox").getByText(`https://rcdriftsync.com/t/${privateShareId}`, { exact: true })).toBeVisible();
  await page.goto(`/t/${privateShareId}`);
  await expect(page.getByRole("heading", { name: "Fixture RDX asphalt setup" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Notes" })).toBeHidden();
});
