import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resetDb, seedExampleGarage } from "./helpers";

test("universal PDF export works for custom chassis with skipped fields, electronics, and photos", async ({ page }) => {
  await resetDb(page);
  await page.goto("/garage");

  await page.getByRole("button", { name: "Add car" }).first().tap();
  await page.getByLabel("Car name").fill("Custom SD");
  await page.getByLabel("Brand / chassis suggestion").selectOption("Yokomo");
  await page.getByLabel("Chassis model").fill("SD 2.0");
  await page.getByRole("button", { name: "Save car" }).click({ force: true });
  await expect(page.getByText("Universal Setup Sheet Mode")).toBeVisible();

  await page.goto("/builder");
  await page.getByLabel("Choose car").selectOption({ label: "Custom SD - SD 2.0" });
  await expect(page.getByLabel("Setup mode")).toContainText("Universal RC Drift Sync setup sheet");
  await page.getByRole("button", { name: "Create tune" }).tap();

  await page.getByLabel("Tune name").fill("Universal asphalt test");
  await page.getByLabel("Track / location").fill("Outdoor asphalt");
  await page.getByRole("button", { name: /^ESC Tune/i }).tap();
  await page.getByLabel("ESC brand").fill("Hobbywing");
  await page.getByLabel("ESC model").fill("XR10 Pro");
  await page.getByLabel("Boost timing").fill("8");
  await page.getByRole("button", { name: /^Gyro Tune/i }).tap();
  await page.getByLabel("Gyro gain").fill("62");
  await page.getByRole("button", { name: /^Photos/i }).tap();
  await page.locator("input[type=file]").setInputFiles({
    name: "custom-car.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      "base64"
    )
  });
  await expect(page.getByAltText("Full car")).toBeVisible();

  await page.getByRole("button", { name: "Preview PDF" }).click({ force: true });
  await expect(page.getByLabel("Universal PDF preview")).toBeVisible();
  await expect(page.locator('iframe[title="Universal RC Drift Sync setup PDF preview"]')).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF" }).click({ force: true });
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("rc-drift-sync-universal.pdf");
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const header = readFileSync(String(filePath)).subarray(0, 4).toString();
  expect(header).toBe("%PDF");
});

test("official RDX and MC-3 PDF exports use their own templates", async ({ page }) => {
  await seedExampleGarage(page);
  await page.goto("/builder");

  await page.getByRole("button", { name: "Fixture RDX asphalt setup" }).first().click();
  await page.getByRole("button", { name: "Preview PDF" }).click({ force: true });
  await expect(page.getByLabel("Official PDF preview")).toBeVisible();
  await expect(page.locator('iframe[title="Official setup PDF preview"]')).toBeVisible();

  const rdxDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF" }).click({ force: true });
  const rdxDownload = await rdxDownloadPromise;
  expect(rdxDownload.suggestedFilename()).toContain("rdx-template-official-setup-sheet.pdf");
  const rdxPath = await rdxDownload.path();
  expect(readFileSync(String(rdxPath)).subarray(0, 4).toString()).toBe("%PDF");

  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Fixture MC-3 carpet setup" }).first().click();
  await page.getByRole("button", { name: "Preview PDF" }).click({ force: true });
  await expect(page.getByRole("heading", { name: "Reve D MC-3" })).toBeVisible();

  const mc3DownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PDF" }).click({ force: true });
  const mc3Download = await mc3DownloadPromise;
  expect(mc3Download.suggestedFilename()).toContain("mc3-template-official-setup-sheet.pdf");
  const mc3Path = await mc3Download.path();
  expect(readFileSync(String(mc3Path)).subarray(0, 4).toString()).toBe("%PDF");
});
