import { expect, test } from "@playwright/test";
import { seedExampleGarage } from "./helpers";

test("community browsing, filters, likes, favorites, comments, follows, profiles, tracks, and cloning work", async ({ page }) => {
  await seedExampleGarage(page);

  await page.goto("/community");
  await expect(page.getByRole("heading", { name: "Community", level: 1 })).toBeVisible();
  await expect(page.getByText("Featured tunes")).toBeVisible();
  await page.getByRole("button", { name: "RDX" }).click();
  await expect(page.getByRole("heading", { name: "Fixture RDX asphalt setup" })).toBeVisible();
  await page.getByPlaceholder("Search chassis, ESC, tire, track...").fill("asphalt");
  await expect(page.getByRole("heading", { name: "Fixture RDX asphalt setup" })).toBeVisible();

  await page.getByRole("button", { name: "Like" }).first().click();
  await page.getByRole("button", { name: "Favorite" }).first().click();
  await expect(page.getByRole("button", { name: "Saved" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Comment" }).first().click();
  await page.getByPlaceholder("Add a helpful track note...").fill("Great starting setup for asphalt.");
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.getByText("Great starting setup for asphalt.")).toBeVisible();
  await page.getByRole("button", { name: "Follow" }).first().click();
  await expect(page.getByRole("button", { name: "Following" }).first()).toBeVisible();

  await page.getByRole("button", { name: "Clone", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: /copy/i })).toBeVisible();

  await page.goto("/u/fixture-driver");
  await expect(page.getByRole("heading", { name: "Fixture Driver" })).toBeVisible();
  await expect(page.getByText("Likes received")).toBeVisible();
  await expect(page.getByText("Favorite chassis")).toBeVisible();
  await expect(page.getByText("Recent activity")).toBeVisible();

  await page.goto("/track/super-g-style-layout");
  await expect(page.getByRole("heading", { name: "Super-G style layout" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Common tires" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Drivers tuning here" })).toBeVisible();
});
