import { expect, test } from "@playwright/test";
import { resetDb, seedExampleGarage } from "./helpers";

const viewports = [
  { name: "iPhone SE", width: 320, height: 740 },
  { name: "standard phone", width: 390, height: 844 },
  { name: "large phone", width: 430, height: 932 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1280, height: 900 }
];

const routes = ["/home", "/garage", "/builder", "/community", "/profile", "/settings"];

test("release screens avoid horizontal overflow across core viewports", async ({ page }) => {
  await resetDb(page);

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("main").first()).toBeVisible();
      const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));
      expect(overflow, `${viewport.name} ${route} horizontal overflow`).toBeLessThanOrEqual(2);
    }
  }
});

test("sticky mobile navigation remains visible on garage and builder", async ({ page }) => {
  await resetDb(page);
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/garage");
  await expect(page.locator(".bottomNav")).toBeVisible();
  await page.mouse.wheel(0, 700);
  await expect(page.locator(".bottomNav")).toBeVisible();

  await page.goto("/builder");
  await expect(page.locator(".bottomNav")).toBeVisible();
  await expect(page.getByRole("heading", { name: "No tune selected", level: 1 })).toBeVisible();
  await page.mouse.wheel(0, 900);
  await expect(page.locator(".bottomNav")).toBeVisible();
  await expect(page.getByRole("heading", { name: "No tune selected", level: 1 })).toBeVisible();
});

test("tunes more menu stays inside the tune card on mobile", async ({ page }) => {
  await seedExampleGarage(page);
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/tunes");
  await page.getByRole("button", { name: /More actions for/ }).first().click();
  await expect(page.locator(".myTuneMoreMenu")).toBeVisible();

  const bounds = await page.evaluate(() => {
    const menu = document.querySelector(".myTuneMoreMenu")?.getBoundingClientRect();
    const card = document.querySelector(".myTuneCard")?.getBoundingClientRect();
    return menu && card
      ? {
          menuLeft: menu.left,
          menuRight: menu.right,
          cardLeft: card.left,
          cardRight: card.right,
          viewportWidth: window.innerWidth
        }
      : null;
  });

  expect(bounds).not.toBeNull();
  expect(bounds!.menuLeft).toBeGreaterThanOrEqual(bounds!.cardLeft - 1);
  expect(bounds!.menuRight).toBeLessThanOrEqual(bounds!.cardRight + 1);
  expect(bounds!.menuRight).toBeLessThanOrEqual(bounds!.viewportWidth);
});
