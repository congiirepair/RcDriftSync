import { expect, test } from "@playwright/test";
import { seedExampleGarage } from "./helpers";

test("track session logging, badges, home engagement, and notification settings work on mobile", async ({ page }) => {
  await seedExampleGarage(page);

  await page.goto("/sessions");
  await expect(page.getByRole("heading", { name: "Log a track day" })).toBeVisible();
  await page.getByLabel("Track / location").fill("Friday shakedown");
  await page.getByRole("textbox", { name: "Tire" }).fill("DS LF-5");
  await page.getByLabel("Battery").fill("2S shorty");
  await page.getByRole("button", { name: "Felt better", exact: true }).tap();
  await page.getByRole("button", { name: "More forward drive", exact: true }).tap();
  await page.getByRole("button", { name: "slow transition", exact: true }).tap();
  await page.getByLabel("What changed").fill("Lowered gyro gain and added rear grip.");
  await page.getByLabel("How the car felt").fill("More stable off throttle and better on exit.");
  await page.getByLabel("Notes").fill("Try the same tire next week.");
  await page.locator("input[type=file]").setInputFiles({
    name: "session-photo.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      "base64"
    )
  });
  await expect(page.getByAltText("session-photo")).toBeVisible();
  await page.getByRole("button", { name: "Save session log" }).tap();
  await expect(page.getByText("Track session saved.")).toBeVisible();
  await expect(page.getByText("Friday shakedown")).toBeVisible();

  await page.goto("/home");
  await expect(page.getByText(/Last tune used/)).toBeVisible();
  await expect(page.getByText("Log today's track session")).toBeVisible();
  await expect(page.getByText("Trending tunes this week")).toBeVisible();

  await page.goto("/profile");
  await expect(page.getByText("Track Day Logger")).toBeVisible();
  await expect(page.getByText("First Tune Saved")).toBeVisible();

  await page.goto("/settings");
  await expect(page.getByText("Optional trackside updates")).toBeVisible();
  await page.getByLabel("Tune liked").check();
  await page.getByLabel("Weekly trending tunes").check();
  await expect(page.getByLabel("Tune liked")).toBeChecked();
  await expect(page.getByLabel("Weekly trending tunes")).toBeChecked();
});
