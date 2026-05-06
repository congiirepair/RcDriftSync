import { expect, test } from "@playwright/test";
import { seedCarOnly } from "./helpers";

test("mobile form workflow: create, fill, save, preview, photos, compare, history, pwa", async ({ page }) => {
  await seedCarOnly(page);
  await page.goto("/");
  await expect(page.getByRole("img", { name: "RC Drift Sync" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Home", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Garage", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tune Builder", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Community", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Profile", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Skip" }).tap();

  await page.getByRole("button", { name: /Create new tune/i }).tap();
  await expect(page.getByRole("heading", { name: "Build a setup" })).toBeVisible();
  await expect(page.getByText("Create or continue a setup")).toBeVisible();

  await page.getByLabel("Tune name").fill("Trackside tester tune");
  await page.getByLabel("Driver").fill("Trackside Tester");
  await page.getByLabel("Track / location").fill("Friday night drift");
  await page.getByRole("button", { name: /Front setup/i }).tap();
  await page.getByLabel("Front ride height").fill("6.2");
  await page.getByLabel("Front camber").fill("-7");
  await page.getByLabel("Front shock position").fill("inner-low");
  await expect(page.getByRole("button", { name: /Save tune|Saved/ })).toBeVisible();

  await page.getByRole("button", { name: "Preview tune" }).tap();
  await expect(page.getByLabel("Tune summary preview")).toBeVisible();
  await expect(page.getByLabel("Tune summary preview").getByRole("heading", { name: "Trackside tester tune" })).toBeVisible();
  await page.reload();
  await expect(page.locator('input[value="Trackside tester tune"]')).toBeVisible();

  await page.getByRole("button", { name: /ESC Tune/i }).tap();
  await page.getByLabel("ESC brand").fill("Hobbywing");
  await page.getByLabel("ESC model").fill("XR10 Pro");
  await page.getByLabel("ESC profile name").fill("Low Grip ESC Tune");
  await page.getByLabel("Throttle punch").fill("2");
  await page.getByLabel("Boost timing").fill("8");
  await page.getByRole("button", { name: "Save these settings as profile" }).tap();
  await page.getByRole("button", { name: "Create tune" }).tap();
  await page.getByLabel("Tune name").fill("ESC profile tester tune");
  await page.getByRole("button", { name: /^ESC Tune/i }).tap();
  await page.getByLabel("Apply saved esc tune profile").selectOption({ label: "Low Grip ESC Tune" });
  await expect(page.getByLabel("ESC brand")).toHaveValue("Hobbywing");
  await expect(page.getByLabel("Throttle punch")).toHaveValue("2");

  await page.getByRole("button", { name: /Photos/i }).tap();
  await page.locator("input[type=file]").setInputFiles({
    name: "front-suspension.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      "base64"
    )
  });
  await expect(page.getByAltText("Full car").or(page.getByAltText("Front suspension"))).toBeVisible();
  await page.getByRole("button", { name: /Save tune|Saved/ }).click({ force: true });

  await page.getByRole("button", { name: "Duplicate current" }).tap();
  await expect(page.getByRole("heading", { name: "ESC profile tester tune copy" })).toBeVisible();
  await page.getByRole("button", { name: /Delete .*copy/i }).tap();
  await page.getByRole("button", { name: "Delete tune" }).tap();
  await expect(page.getByRole("button", { name: "Trackside tester tune" }).first()).toBeVisible();

  await page.getByRole("button", { name: "Compare tunes" }).tap();
  await expect(page.getByRole("heading", { name: "Compare" })).toBeVisible();
  await expect(page.locator(".miniSheet").first()).toBeVisible();

  const manifest = await page.evaluate(async () => {
    const response = await fetch("/manifest.webmanifest");
    return response.json();
  });
  expect(manifest.display).toBe("standalone");
  expect(manifest.orientation).toBe("portrait");
});
