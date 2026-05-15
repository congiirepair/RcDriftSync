import type { Page } from "@playwright/test";

const now = "2026-05-05T12:00:00.000Z";

export async function resetDb(page: Page) {
  await page.goto("/manifest.webmanifest");
  await page.evaluate(() => new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase("rc-tune-pwa");
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  }));
  await seedDb(page, emptyData);
}

export async function seedDb(page: Page, data: Record<string, unknown>) {
  await page.evaluate((seed) => {
    const request = indexedDB.open("rc-tune-pwa", 1);
    return new Promise<void>((resolve, reject) => {
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("app")) db.createObjectStore("app");
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("app", "readwrite");
        tx.objectStore("app").put(seed, "state");
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      };
    });
  }, data);
}

export async function seedExampleGarage(page: Page) {
  await resetDb(page);
  await seedDb(page, exampleData);
}

export async function seedCarOnly(page: Page) {
  await resetDb(page);
  await seedDb(page, {
    ...emptyData,
    cars: [exampleData.cars[0]]
  });
}

const emptyData = {
  cars: [],
  tunes: [],
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
};

const baseValues = {
  frontRideHeight: 6,
  rearRideHeight: 6.5,
  frontCamber: -7,
  rearCamber: -3,
  frontToe: 1,
  rearToe: 3,
  frontSpring: "Soft",
  rearSpring: "Medium",
  tires: "DS LF-5",
  body: "GR86",
  escBrand: "Hobbywing",
  escModel: "XR10 Pro",
  gyroGain: "67"
};

export const exampleData = {
  ...emptyData,
  cars: [
    {
      id: "car-fixture-rdx",
      name: "RDX test car",
      brand: "Reve D",
      chassisBrand: "Reve D",
      chassisBrandSlug: "reve-d",
      chassis: "Reve D RDX",
      chassisModel: "RDX",
      chassisModelSlug: "rdx",
      chassisType: "RWD drift",
      drivetrainType: "RWD",
      scale: "1/10",
      sheetId: "rdx-template",
      templateMode: "official",
      officialTemplateEligible: true,
      photos: [],
      createdAt: now,
      updatedAt: now
    },
    {
      id: "car-fixture-mc3",
      name: "MC-3 test car",
      brand: "Reve D",
      chassisBrand: "Reve D",
      chassisBrandSlug: "reve-d",
      chassis: "Reve D MC-3",
      chassisModel: "MC-3",
      chassisModelSlug: "mc-3",
      chassisType: "RWD drift",
      drivetrainType: "RWD",
      scale: "1/10",
      sheetId: "mc3-template",
      templateMode: "official",
      officialTemplateEligible: true,
      photos: [],
      createdAt: now,
      updatedAt: now
    }
  ],
  tunes: [
    {
      id: "tune-fixture-rdx",
      name: "Fixture RDX asphalt setup",
      carId: "car-fixture-rdx",
      sheetId: "rdx-template",
      date: "2026-05-05",
      track: "Super-G style layout",
      surface: "Asphalt tile",
      grip: "High",
      rating: 5,
      tags: ["rdx", "asphalt", "stable"],
      values: baseValues,
      selections: {},
      notes: "Test fixture tune.",
      photos: [],
      history: [],
      ownerId: "fixture-driver",
      ownerUsername: "fixture-driver",
      ownerDisplayName: "Fixture Driver",
      shareId: "share-rdx-baseline",
      visibility: "public",
      cloneEnabled: true,
      sharedPhotosEnabled: true,
      sharedNotesEnabled: true,
      sharedChassisSetupEnabled: true,
      sharedEscTuneEnabled: true,
      sharedServoTuneEnabled: true,
      sharedGyroTuneEnabled: true,
      sharedRadioTuneEnabled: true,
      sharedHistoryEnabled: false,
      sharedOwnerNameEnabled: true,
      pdfDownloadEnabled: true,
      viewCount: 128,
      cloneCount: 23,
      likeCount: 41,
      shareCount: 12,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "tune-fixture-mc3",
      name: "Fixture MC-3 carpet setup",
      carId: "car-fixture-mc3",
      sheetId: "mc3-template",
      date: "2026-05-05",
      track: "Indoor carpet",
      surface: "Low pile carpet",
      grip: "Low to medium",
      rating: 4,
      tags: ["mc-3", "carpet", "rotation"],
      values: { ...baseValues, frontShockPosition: "1", rearShockPosition: "3" },
      selections: {},
      notes: "Test fixture tune.",
      photos: [],
      history: [],
      ownerId: "fixture-driver",
      ownerUsername: "fixture-driver",
      ownerDisplayName: "Fixture Driver",
      shareId: "share-mc3-carpet",
      visibility: "public",
      cloneEnabled: true,
      sharedPhotosEnabled: true,
      sharedNotesEnabled: true,
      sharedChassisSetupEnabled: true,
      sharedEscTuneEnabled: true,
      sharedServoTuneEnabled: true,
      sharedGyroTuneEnabled: true,
      sharedRadioTuneEnabled: true,
      sharedHistoryEnabled: false,
      sharedOwnerNameEnabled: true,
      pdfDownloadEnabled: true,
      viewCount: 74,
      cloneCount: 9,
      likeCount: 18,
      shareCount: 7,
      createdAt: now,
      updatedAt: now
    }
  ],
  profiles: [
    {
      uid: "fixture-driver",
      username: "fixture-driver",
      displayName: "Fixture Driver",
      favoriteChassis: "Reve D RDX",
      homeTrack: "Super-G style layout",
      isPublic: true,
      followerCount: 18,
      tuneLikesReceived: 59,
      recentActivity: ["Shared Fixture RDX asphalt setup"],
      sharedTuneCount: 2,
      cloneCount: 32
    }
  ],
  trackSessions: [
    {
      id: "session-rdx",
      ownerId: "fixture-driver",
      tuneId: "tune-fixture-rdx",
      carId: "car-fixture-rdx",
      track: "Super-G style layout",
      date: "2026-05-05",
      surface: "Asphalt tile",
      grip: "High",
      tire: "DS LF-5",
      battery: "Shorty pack",
      ratingBefore: 4,
      ratingAfter: 5,
      whatChanged: "Test fixture session.",
      howFelt: "Better.",
      symptoms: ["slow transition"],
      quickSignals: ["Felt better"],
      notes: "",
      photos: [],
      createdAt: now,
      updatedAt: now
    }
  ]
};
