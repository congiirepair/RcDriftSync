import { openDB } from "idb";
import type { AppData } from "../types";
import { emptyAppData } from "../data/sampleData";
import { syncAppDataSharedModel } from "../utils/sharedTuneModel";

const DB_NAME = "rc-tune-pwa";
const STORE = "app";
const KEY = "state";
const SEEDED_CAR_IDS = new Set(["car-rdx", "car-mc3"]);
const SEEDED_TUNE_IDS = new Set(["tune-rdx-baseline", "tune-mc3-carpet"]);
const SEEDED_PROFILE_IDS = new Set(["demo-driver"]);
const SEEDED_TUNE_NAMES = new Set(["rdx baseline asphalt", "mc-3 carpet quick steer"]);

function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE);
    }
  });
}

function normalizeAppData(data: AppData): AppData {
  const cars = (data.cars ?? []).filter((car) => !SEEDED_CAR_IDS.has(car.id));
  const carIds = new Set(cars.map((car) => car.id));
  const tunes = (data.tunes ?? []).filter((tune) => {
    const isSeededTune =
      SEEDED_TUNE_IDS.has(tune.id) ||
      SEEDED_TUNE_NAMES.has(tune.name.trim().toLowerCase()) ||
      SEEDED_CAR_IDS.has(tune.carId) ||
      SEEDED_PROFILE_IDS.has(tune.ownerId ?? "");
    const isPersonalOrLocal = !tune.ownerId || tune.ownerId === "local-user";
    return !isSeededTune && (carIds.has(tune.carId) || !isPersonalOrLocal);
  });
  const tuneIds = new Set(tunes.map((tune) => tune.id));
  return syncAppDataSharedModel({
    ...data,
    cars,
    tunes,
    electronicsProfiles: data.electronicsProfiles ?? [],
    profiles: (data.profiles ?? []).filter((profile) => !SEEDED_PROFILE_IDS.has(profile.uid)),
    comments: (data.comments ?? []).filter((comment) => tuneIds.has(comment.tuneId)),
    favorites: (data.favorites ?? []).filter((favorite) => tuneIds.has(favorite.tuneId)),
    follows: data.follows ?? [],
    trackSessions: (data.trackSessions ?? []).filter((session) => tuneIds.has(session.tuneId) || carIds.has(session.carId)),
    notificationSettings: data.notificationSettings ?? {
      tuneCloned: false,
      tuneLiked: false,
      tuneCommented: false,
      followedDriverSharedTune: false,
      weeklyTrendingTunes: false,
      backupReminder: true
    }
  });
}

export async function loadAppData(): Promise<AppData> {
  const db = await getDb();
  const stored = await db.get(STORE, KEY);
  if (stored) {
    const normalized = normalizeAppData(stored as AppData);
    await saveAppData(normalized);
    return normalized;
  }
  await saveAppData(emptyAppData);
  return normalizeAppData(emptyAppData);
}

export async function saveAppData(data: AppData): Promise<void> {
  const db = await getDb();
  await db.put(STORE, normalizeAppData(data), KEY);
}

export async function clearAppData(): Promise<void> {
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}

export async function resetAppData(): Promise<AppData> {
  await saveAppData(emptyAppData);
  return normalizeAppData(emptyAppData);
}
