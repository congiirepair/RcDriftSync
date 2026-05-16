import { expect, test } from "@playwright/test";
import { resetDb, seedDb } from "./helpers";

test("Geometry tab records descriptive RDX fields without diagrams", async ({ page }) => {
  const now = "2026-05-15T12:00:00.000Z";

  await resetDb(page);
  await seedDb(page, {
    cars: [{
      id: "car-rdx-geometry-fixture",
      name: "RDX geometry fixture car",
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
      sheetId: "rdx-template",
      createdAt: now,
      updatedAt: now
    }],
    tunes: [{
      id: "tune-rdx-geometry-fixture",
      name: "RDX geometry fixture tune",
      carId: "car-rdx-geometry-fixture",
      sheetId: "rdx-template",
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
  await expect(page.getByText("RDX geometry snapshot")).toBeVisible();
  await expect(page.getByText("Top-down setup callouts")).toHaveCount(0);
  await expect(page.getByText("Lower-arm and underside callouts")).toHaveCount(0);
  await expect(page.locator(".setupDiagramMap, .setupDiagramKonvaLayer, .rdxCalloutDiagram")).toHaveCount(0);
  await expect(page.getByRole("img", { name: /schematic|diagram|mounting hole/i })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Wheels and electrical" })).toHaveCount(0);

  await page.getByRole("button", { name: "Apply Chuck RDX P-tile baseline" }).click();
  await expect(page.getByLabel("Bell crank position")).toHaveValue("Outer");
  await expect(page.getByLabel("Bell crank position").locator("option")).toHaveText(["Select", "Inner", "Outer"]);

  await page.getByLabel("Driver").fill("Charles Ong");
  await page.getByLabel("Driving place").fill("Prodigy RC");
  await page.getByLabel("Front upper arm outer spacer (mm)").fill("3");
  await page.getByLabel("Front upper arm inner front spacer (mm)").fill("1");
  await page.getByLabel("Front upper arm inner rear spacer (mm)").fill("0");
  await page.getByLabel("Front shock upper spacer (mm)").fill("2");
  await page.getByLabel("Front shock / shaft").fill("Overdose HG4 full extension stroke");
  await page.getByLabel("Front spring").fill("Yokomo Hard");
  await page.getByLabel("RF sus mount number").fill("#7");
  await page.getByLabel("RF sus mount flipped").selectOption("Flipped");
  await page.getByLabel("RF spacer under sus mount (mm)").fill("6");
  await page.getByLabel("RF insert / dot position").selectOption("D");
  await page.getByLabel("Rear lower arm").selectOption("42mm 0.0d");
  await page.getByLabel("Rear shock / shaft").fill("Overdose HG4 5mm rebound");
  await page.getByLabel("Rear hub and damper notes").fill("RD-012 upper link in upper row, lower axle hole low, spacer stack described in notes.");

  await page.getByRole("button", { name: "Back to Tune Builder menu" }).click();
  await page.getByRole("button", { name: /Save Tune/ }).click();
  await expect(page.getByRole("heading", { name: "Tune saved" })).toBeVisible();
  await page.getByRole("button", { name: "Continue editing" }).click();

  await page.reload();
  await page.getByRole("button", { name: /Geometry/ }).first().click();
  await expect(page.getByLabel("Driving place")).toHaveValue("Prodigy RC");
  await expect(page.getByLabel("Front upper arm outer spacer (mm)")).toHaveValue("3");
  await expect(page.getByLabel("Front upper arm inner front spacer (mm)")).toHaveValue("1");
  await expect(page.getByLabel("Front shock upper spacer (mm)")).toHaveValue("2");
  await expect(page.getByLabel("RF sus mount number")).toHaveValue("#7");
  await expect(page.getByLabel("RF sus mount flipped")).toHaveValue("Flipped");
  await expect(page.getByLabel("Rear lower arm")).toHaveValue("42mm 0.0d");
  await expect(page.getByLabel("Rear hub and damper notes")).toHaveValue("RD-012 upper link in upper row, lower axle hole low, spacer stack described in notes.");
  await expect(page.locator(".setupDiagramMap, .setupDiagramKonvaLayer, .rdxCalloutDiagram")).toHaveCount(0);
});
