import { expect, test } from "@playwright/test";

const launchRoutes = ["/home", "/garage", "/builder", "/community", "/profile", "/settings", "/sessions", "/t/share-rdx-baseline"];

const viewports = [
  { name: "small mobile", width: 320, height: 740 },
  { name: "iPhone size", width: 390, height: 844 },
  { name: "Android size", width: 430, height: 932 },
  { name: "desktop", width: 1280, height: 900 }
];

test("launch QA: key screens fit small mobile, iPhone, Android, and desktop widths", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("rc-onboarding-complete", "yes"));

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of launchRoutes) {
      await page.goto(route);
      await expect(page.locator(".bottomNav").or(page.locator(".publicPage"))).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${viewport.name} ${route} horizontal overflow`).toBeLessThanOrEqual(2);
      const tinyButtons = await page.evaluate(() =>
        Array.from(document.querySelectorAll("button"))
          .filter((button) => button.getClientRects().length > 0)
          .map((button) => button.getBoundingClientRect())
          .filter((rect) => rect.width > 0 && rect.height > 0 && rect.height < 34)
          .length
      );
      expect(tinyButtons, `${viewport.name} ${route} tiny touch targets`).toBe(0);
    }
  }
});

test("launch QA: onboarding, auth screens, theme toggle, and offline banner are friendly", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("rc-onboarding-complete"));
  await page.reload();
  await expect(page.getByRole("dialog", { name: "Welcome to RC Drift Sync" })).toBeVisible();
  await page.getByRole("button", { name: "Skip" }).tap();
  await expect(page.getByRole("dialog", { name: "Welcome to RC Drift Sync" })).toBeHidden();

  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByLabel("Display name")).toBeVisible();

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Login", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send password reset" })).toBeVisible();

  await page.goto("/settings");
  await page.getByRole("button", { name: "Toggle" }).tap();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Toggle" }).tap();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByText("Offline mode. Your garage still saves on this phone.")).toBeVisible();
  await context.setOffline(false);
});
