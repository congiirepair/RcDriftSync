import { expect, test } from "@playwright/test";
import { resetDb, seedDb } from "./helpers";

test("geometry tab exposes D3 mounting hole diagrams and saves selections", async ({ page }) => {
  const now = "2026-05-15T12:00:00.000Z";

  await resetDb(page);
  await seedDb(page, {
    cars: [{
      id: "car-geometry-fixture",
      name: "Geometry fixture car",
      brand: "Reve D",
      chassisBrand: "Reve D",
      chassisBrandSlug: "reve-d",
      chassis: "Reve D RDX",
      chassisModel: "RDX",
      chassisModelSlug: "rdx",
      chassisType: "RWD drift",
      drivetrainType: "RWD",
      scale: "1/10",
      photos: [],
      createdAt: now,
      updatedAt: now
    }],
    tunes: [{
      id: "tune-geometry-fixture",
      name: "Geometry fixture tune",
      carId: "car-geometry-fixture",
      date: "2026-05-15",
      track: "QA track",
      surface: "P-tile",
      grip: "Medium",
      rating: 3,
      tags: [],
      values: {},
      selections: {},
      notes: "",
      photos: [],
      history: [],
      ownerId: "local-user",
      createdAt: now,
      updatedAt: now
    }],
    electronicsProfiles: [],
    profiles: [],
    comments: [],
    favorites: [],
    follows: [],
    trackSessions: [],
    notificationSettings: {
      tuneCloned: false,
      tuneLiked: false,
      tuneCommented: false,
      followedDriverSharedTune: false,
      weeklyTrendingTunes: false,
      backupReminder: true
    }
  });
  await page.goto("/builder");

  await page.getByRole("button", { name: /Geometry/ }).first().click();
  await expect(page.getByRole("heading", { name: "Geometry" })).toBeVisible();
  await page.getByRole("button", { name: "Front geometry" }).click();
  await page.getByRole("button", { name: /Front shock and steering holes/ }).click();

  const picker = page.getByRole("group", { name: "Front shock tower upper hole" });
  await expect(picker.getByRole("img", { name: "Front shock tower upper hole mounting hole diagram" })).toBeVisible();
  await picker.getByRole("button", { name: "Front shock tower upper hole: Hole 3" }).click();
  await expect(picker.getByText("Hole 3").first()).toBeVisible();
  await expect(picker.getByRole("button", { name: "Hole 3", exact: true })).toHaveAttribute("aria-pressed", "true");
});
