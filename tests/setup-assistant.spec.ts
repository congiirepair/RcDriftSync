import { expect, test } from "@playwright/test";
import { seedExampleGarage } from "./helpers";

test("setup assistant suggests changes and saves them to the tune log", async ({ page }) => {
  await seedExampleGarage(page);

  await page.goto("/builder");
  await expect(page.getByRole("heading", { name: "Build a setup" })).toBeVisible();

  await page.getByRole("button", { name: /Setup Assistant/i }).tap();
  await expect(page.getByText("Pick what the car is doing.")).toBeVisible();

  await page.getByRole("button", { name: "Asphalt", exact: true }).tap();
  await page.getByLabel("Tire").fill("DS LF-5");
  await page.getByRole("button", { name: "Low to medium", exact: true }).tap();
  await page.getByRole("button", { name: "Gyro wobble", exact: true }).tap();

  await expect(page.getByLabel("Setup Assistant suggestions")).toContainText("Gyro gain");
  await expect(page.getByLabel("Setup Assistant suggestions")).toContainText("Servo speed");

  await page.getByLabel("Create test change").fill("Lower gyro gain two clicks and check steering binding.");
  await page.getByLabel("Before rating").selectOption("2");
  await page.getByLabel("After rating").selectOption("4");
  await page.getByRole("button", { name: "Felt better" }).tap();
  await page.getByRole("button", { name: "Save recommendation to tune notes" }).tap();

  await expect(page.getByText("Recommendation saved to this tune.")).toBeVisible();

  await page.getByRole("button", { name: /^Basics/i }).tap();
  await expect(page.getByRole("textbox", { name: "Notes" })).toHaveValue(/Setup Assistant - Gyro wobble/);
  await expect(page.getByRole("textbox", { name: "Notes" })).toHaveValue(/Lower gyro gain two clicks/);

  await page.reload();
  await expect(page.getByRole("textbox", { name: "Notes" })).toHaveValue(/Setup Assistant - Gyro wobble/);
});
