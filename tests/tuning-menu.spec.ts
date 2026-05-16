import { expect, test } from "@playwright/test";
import { resetDb, seedDb } from "./helpers";

test("Quick tuning menu separates geometry, tires, and body weight fields without diagrams", async ({ page }) => {
  const now = "2026-05-15T12:00:00.000Z";

  await resetDb(page);
  await seedDb(page, {
    cars: [{
      id: "car-rdx-tuning-menu-fixture",
      name: "Trackside RDX fixture car",
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
      id: "tune-rdx-tuning-menu-fixture",
      name: "Trackside tuning menu fixture",
      carId: "car-rdx-tuning-menu-fixture",
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

  await expect(page.getByRole("button", { name: /Body \/ Weight/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Geometry/ })).toContainText(/Spacer and alignment descriptions|values filled/);

  await page.getByRole("button", { name: /Geometry/ }).first().click();
  await expect(page.getByRole("heading", { name: "Geometry" })).toBeVisible();
  await expect(page.getByText("RDX geometry snapshot")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Apply Chuck RDX P-tile baseline" })).toHaveCount(0);
  await expect(page.getByText("Top-down setup callouts")).toHaveCount(0);
  await expect(page.getByText("Lower-arm and underside callouts")).toHaveCount(0);
  await expect(page.locator(".setupDiagramMap, .setupDiagramKonvaLayer, .rdxCalloutDiagram")).toHaveCount(0);
  await expect(page.getByRole("img", { name: /schematic|diagram|mounting hole/i })).toHaveCount(0);

  await page.getByLabel("Bell crank position").selectOption("Outer");
  await expect(page.getByLabel("Bell crank position").locator("option")).toHaveText(["Select", "Inner", "Outer"]);
  await page.getByLabel("Caster").fill("8 deg");
  await page.getByLabel("KPI").fill("8 deg");
  await page.getByLabel("Front track width (mm)").fill("198");
  await page.getByLabel("Front upper arm outer spacer (mm)").fill("3");
  await page.getByLabel("Front upper arm inner front spacer (mm)").fill("1");
  await page.getByLabel("Front droop").fill("1mm gap");
  await page.getByLabel("Front rebound").fill("0mm");
  await page.getByLabel("RF sus mount number").fill("#7");
  await page.getByLabel("RF spacer under sus mount (mm)").fill("6");
  await page.getByLabel("Rear roll center").fill("Low");
  await page.getByLabel("Rear axle height / hole notes").fill("Lower axle hole");
  await page.getByLabel("Rear anti-squat / skid notes").fill("RF 6mm shim, RR 6.5mm shim");
  await page.getByLabel("Rear rebound").fill("5mm");

  await page.getByRole("button", { name: "Back to Tune Builder menu" }).click();
  await page.getByRole("button", { name: /Tires\s*\/\s*Wheels/ }).first().click();
  await page.getByLabel("Front tire diameter").fill("62.5mm");
  await page.getByLabel("Rear tire diameter").fill("63mm");
  await page.getByLabel("Tire prep notes").fill("Wiped clean, two break-in laps");
  await page.getByLabel("Tire wear notes").fill("Rear tires lightly coned");
  await page.getByLabel("Front wheel width").fill("26mm");
  await page.getByLabel("Rear wheel width").fill("26mm");

  await page.getByRole("button", { name: "Back to Tune Builder menu" }).click();
  await page.getByRole("button", { name: /Body \/ Weight/ }).first().click();
  await page.getByLabel("Body shell").fill("Pandora S15");
  await page.getByLabel("Body height").fill("Low, no rub");
  await page.getByLabel("Wing position").fill("High and rearward");
  await page.getByLabel("Battery position").selectOption("Rear");
  await page.getByLabel("Added weight").fill("20g");
  await page.getByLabel("Weight location").fill("Behind servo");
  await page.getByLabel("Front weight notes").fill("38%");
  await page.getByLabel("Rear weight notes").fill("62%");

  await page.getByRole("button", { name: "Back to Tune Builder menu" }).click();
  await page.getByRole("button", { name: /Save Tune/ }).click();
  await expect(page.getByRole("heading", { name: "Tune saved" })).toBeVisible();
  await page.getByRole("button", { name: "Continue editing" }).click();

  await page.reload();

  await page.getByRole("button", { name: /Geometry/ }).first().click();
  await expect(page.getByLabel("Bell crank position")).toHaveValue("Outer");
  await expect(page.getByLabel("Caster")).toHaveValue("8 deg");
  await expect(page.getByLabel("Front upper arm outer spacer (mm)")).toHaveValue("3");
  await expect(page.getByLabel("Rear axle height / hole notes")).toHaveValue("Lower axle hole");
  await expect(page.getByLabel("Rear anti-squat / skid notes")).toHaveValue("RF 6mm shim, RR 6.5mm shim");
  await expect(page.locator(".setupDiagramMap, .setupDiagramKonvaLayer, .rdxCalloutDiagram")).toHaveCount(0);

  await page.getByRole("button", { name: "Back to Tune Builder menu" }).click();
  await page.getByRole("button", { name: /Tires\s*\/\s*Wheels/ }).first().click();
  await expect(page.getByLabel("Front tire diameter")).toHaveValue("62.5mm");
  await expect(page.getByLabel("Rear tire diameter")).toHaveValue("63mm");
  await expect(page.getByLabel("Tire prep notes")).toHaveValue("Wiped clean, two break-in laps");

  await page.getByRole("button", { name: "Back to Tune Builder menu" }).click();
  await page.getByRole("button", { name: /Body \/ Weight/ }).first().click();
  await expect(page.getByLabel("Body shell")).toHaveValue("Pandora S15");
  await expect(page.getByLabel("Body height")).toHaveValue("Low, no rub");
  await expect(page.getByLabel("Battery position")).toHaveValue("Rear");
  await expect(page.getByLabel("Added weight")).toHaveValue("20g");
});
