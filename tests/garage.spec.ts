import { expect, test } from "@playwright/test";

test("garage system: add, edit, photo, tune actions, delete, empty state", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => new Promise<void>((resolve, reject) => { const request = indexedDB.deleteDatabase("rc-tune-pwa"); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); request.onblocked = () => resolve(); }));
  await page.goto("/garage");

  await expect(page.getByRole("heading", { name: "Garage", level: 1 })).toBeVisible();
  await expect(page.getByText("Add your first RC drift car to start saving tunes.")).toBeVisible();

  await page.getByRole("button", { name: "Add car" }).first().tap();
  await expect(page.getByRole("dialog", { name: "Add car" })).toBeVisible();
  await page.getByLabel("Car name").fill("Friday RDX");
  await page.getByLabel("Brand / chassis suggestion").selectOption("Reve D RDX");
  await page.getByLabel("Chassis model").fill("RDX");
  await page.getByRole("textbox", { name: "Motor" }).fill("Acuvance 10.5T");
  await page.getByLabel("ESC").fill("RAD");
  await page.getByLabel("Home track").fill("Friday night drift");
  await page.locator(".carForm input[type=file]").setInputFiles({
    name: "rdx-car.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      "base64"
    )
  });
  await expect(page.getByAltText("Full car")).toBeVisible();
  await page.getByRole("button", { name: "Save car" }).click({ force: true });
  await expect(page.getByRole("dialog", { name: "Add car" })).toBeHidden();

  await expect(page.getByText("Friday RDX").first()).toBeVisible();
  await expect(page.getByText("Official PDF eligible")).toBeVisible();
  await expect(page.getByText("Acuvance 10.5T / RAD")).toBeVisible();

  await page.getByRole("button", { name: /Edit Friday RDX/i }).tap();
  await page.getByLabel("Body").fill("GR86");
  await page.getByLabel("Default tire").fill("DS Racing LF-5");
  await page.getByRole("button", { name: "Save car" }).click({ force: true });
  await expect(page.getByRole("dialog", { name: "Edit car" })).toBeHidden();
  await expect(page.getByText("GR86 / DS Racing LF-5")).toBeVisible();

  await page.getByRole("button", { name: "Create tune" }).tap();
  await expect(page.getByRole("heading", { name: "Build a setup" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Untitled tune" })).toBeVisible();

  await page.goto("/garage");
  await page.getByText("Friday RDX").first().tap();
  await page.getByRole("button", { name: "Duplicate last tune" }).tap();
  await expect(page.getByRole("heading", { name: "Untitled tune" })).toBeVisible();

  await page.goto("/garage");
  await page.getByText("Friday RDX").first().tap();
  await page.getByRole("button", { name: "Delete" }).tap();
  await page.getByRole("button", { name: "Delete car" }).tap();
  await expect(page.getByRole("heading", { name: "Garage", level: 2 })).toBeVisible();
  await expect(page.getByText("Add your first RC drift car to start saving tunes.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add first car" })).toBeVisible();
});

test("garage defaults non-official chassis to universal setup sheet mode", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => new Promise<void>((resolve, reject) => { const request = indexedDB.deleteDatabase("rc-tune-pwa"); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); request.onblocked = () => resolve(); }));
  await page.goto("/garage");

  await page.getByRole("button", { name: "Add car" }).first().tap();
  await page.getByLabel("Car name").fill("Yokomo SD");
  await page.getByLabel("Brand / chassis suggestion").selectOption("Yokomo");
  await page.getByLabel("Chassis model").fill("SD 2.0");
  await expect(page.getByText("This car will use Universal Setup Sheet Mode.")).toBeVisible();
  await page.getByRole("button", { name: "Save car" }).click({ force: true });
  await expect(page.getByText("Universal Setup Sheet Mode")).toBeVisible();
});

