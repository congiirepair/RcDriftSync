import { chassisInfoFromCar } from "../data/chassisBrands";
import { setupSheets } from "../data/sheets";
import type { AppData, Car, Tune, UserAccount } from "../types";
import { syncTuneSharedModel } from "../utils/sharedTuneModel";
import type { AppRoute } from "./routing";

export const SEEDED_CAR_IDS = new Set(["car-rdx", "car-mc3"]);
export const SEEDED_TUNE_IDS = new Set(["tune-rdx-baseline", "tune-mc3-carpet"]);
export const SEEDED_PROFILE_IDS = new Set(["demo-driver"]);
export const SEEDED_TUNE_NAMES = new Set(["rdx baseline asphalt", "mc-3 carpet quick steer"]);
const HIDDEN_COMMUNITY_TUNE_NAMES = new Set(["rdx baseline asphalt", "qa share qr tune"]);
export const FIREBASE_SAVE_TIMEOUT_MS = 15000;

export function withTimeout<T>(promise: Promise<T>, milliseconds: number, failureMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(failureMessage)), milliseconds);
    promise
      .then((value) => {
        window.clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeout);
        reject(error);
      });
  });
}

export function tuneDisplayName(tune: Pick<Tune, "name">) {
  return tune.name.trim() || "Untitled tune";
}

export function isHiddenCommunityTune(tune: Pick<Tune, "name">) {
  return HIDDEN_COMMUNITY_TUNE_NAMES.has(tune.name.trim().toLowerCase());
}

export function createTune(car: Car, source?: Partial<Tune>): Tune {
  const sheet = setupSheets.find((item) => item.id === car.sheetId) ?? setupSheets[0];
  const values = { ...sheet.defaultValues, ...(source?.values ?? {}) };
  const chassisInfo = chassisInfoFromCar(car);
  return syncTuneSharedModel({
    id: `tune-${Date.now()}`,
    name: source?.name ?? "",
    carId: car.id,
    sheetId: car.sheetId,
    chassisBrand: source?.chassisBrand ?? chassisInfo.brand,
    chassisBrandSlug: source?.chassisBrandSlug ?? chassisInfo.brandSlug,
    chassisModel: source?.chassisModel ?? chassisInfo.model,
    chassisModelSlug: source?.chassisModelSlug ?? chassisInfo.modelSlug,
    chassisVariant: source?.chassisVariant ?? car.chassisVariant ?? "",
    customChassisBrand: source?.customChassisBrand ?? car.customChassisBrand ?? "",
    customChassisModel: source?.customChassisModel ?? car.customChassisModel ?? "",
    date: source?.date ?? new Date().toISOString().slice(0, 10),
    track: source?.track ?? car.homeTrack ?? "",
    surface: source?.surface ?? "",
    grip: source?.grip ?? "Medium",
    rating: source?.rating ?? 3,
    tags: source?.tags ?? [chassisInfo.brandSlug, chassisInfo.modelSlug].filter(Boolean),
    values,
    selections: { ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)])), ...(source?.selections ?? {}) },
    notes: source?.notes ?? "",
    setupIntent: source?.setupIntent ?? [],
    bestForTags: source?.bestForTags ?? [],
    trackConditionPreset: source?.trackConditionPreset ?? "",
    expectedFeel: source?.expectedFeel,
    actualFeel: source?.actualFeel,
    changeReason: source?.changeReason ?? "",
    testResult: source?.testResult ?? "",
    confidenceRating: source?.confidenceRating ?? 3,
    summaryChips: source?.summaryChips ?? [],
    electronics: source?.electronics,
    chassisSetup: source?.chassisSetup,
    advancedSetup: source?.advancedSetup,
    visualSetup: source?.visualSetup,
    cloneInfo: source?.cloneInfo,
    shareSettings: source?.shareSettings,
    photos: source?.photos ? [...source.photos] : [],
    history: source?.history ? [...source.history] : [],
    ownerId: source?.ownerId ?? "local-user",
    ownerUsername: source?.ownerUsername ?? "my-garage",
    ownerDisplayName: source?.ownerDisplayName ?? "My Garage",
    shareId: source?.shareId ?? `share-${Date.now()}`,
    visibility: source?.visibility ?? "private",
    cloneEnabled: source?.cloneEnabled ?? false,
    sharedPhotosEnabled: source?.sharedPhotosEnabled ?? false,
    sharedNotesEnabled: source?.sharedNotesEnabled ?? false,
    sharedBasicTuneEnabled: source?.sharedBasicTuneEnabled ?? true,
    sharedChassisSetupEnabled: source?.sharedChassisSetupEnabled ?? true,
    sharedEscTuneEnabled: source?.sharedEscTuneEnabled ?? false,
    sharedServoTuneEnabled: source?.sharedServoTuneEnabled ?? false,
    sharedGyroTuneEnabled: source?.sharedGyroTuneEnabled ?? false,
    sharedRadioTuneEnabled: source?.sharedRadioTuneEnabled ?? false,
    sharedHistoryEnabled: source?.sharedHistoryEnabled ?? false,
    sharedOwnerNameEnabled: source?.sharedOwnerNameEnabled ?? true,
    pdfDownloadEnabled: source?.pdfDownloadEnabled ?? true,
    viewCount: source?.viewCount ?? 0,
    cloneCount: source?.cloneCount ?? 0,
    likeCount: source?.likeCount ?? 0,
    shareCount: source?.shareCount ?? 0,
    setupAssistantLog: source?.setupAssistantLog ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, car);
}

export function carTemplatePatch(car: Car): Partial<Car> {
  const text = `${car.brand ?? ""} ${car.chassis ?? ""} ${car.chassisModel ?? ""}`.toLowerCase();
  if (text.includes("rdx")) return { sheetId: "rdx-template", templateMode: "official", officialTemplateEligible: true };
  if (text.includes("mc-3") || text.includes("mc3")) return { sheetId: "mc3-template", templateMode: "official", officialTemplateEligible: true };
  return { sheetId: "universal-template", templateMode: "universal", officialTemplateEligible: false };
}

export function userTunePatch(account: UserAccount | null): Partial<Tune> {
  return account
    ? {
        ownerId: account.uid,
        ownerUsername: account.username ?? account.email?.split("@")[0] ?? "driver",
        ownerDisplayName: account.displayName ?? account.email ?? "RC Drift Sync Driver"
      }
    : {
        ownerId: "local-user",
        ownerUsername: "my-garage",
        ownerDisplayName: "My Garage"
      };
}

export function canManageTune(account: UserAccount | null, tune: Tune | null | undefined) {
  if (!tune) return false;
  if (!account) return true;
  return Boolean(account.isAdmin) || !tune.ownerId || tune.ownerId === "local-user" || tune.ownerId === account.uid;
}

const BASIC_TUNE_VALUE_KEYS = [
  "chassisDeck",
  "upperDeck",
  "upperDeckBrand",
  "lowerDeck",
  "lowerDeckBrand",
  "chassisCustomizations",
  "conversionKit",
  "frontDamperBrand",
  "frontSpringBrand",
  "frontSpring",
  "frontKnuckleBrand",
  "frontKnuckle",
  "frontAxle",
  "frontWheelBrand",
  "frontWheel",
  "frontLowerArmBrand",
  "frontLowerArm",
  "frontLowerArmShims",
  "frontToeBlockBrand",
  "frontToeBlock",
  "rearLowerArmBrand",
  "rearLowerArm",
  "rearLowerArmShims",
  "rearLowerArmSide",
  "rearShockMountingNotes",
  "rearSwayBar",
  "rearSwayBarThickness",
  "rearHubCarrierBrand",
  "rearHubCarrier",
  "rearAxleLength",
  "rearWheelBrand",
  "rearWheel",
  "rearToeBlockBrand",
  "rearToeBlock",
  "basicCustomNotes"
] as const;

const ESC_VALUE_KEYS = ["escBrand", "escModel", "escProfileName", "escFirmwareVersion", "escNotes"] as const;
const SERVO_VALUE_KEYS = ["servoBrand", "servoModel", "servoProfileName", "servoNotes"] as const;
const GYRO_VALUE_KEYS = ["gyroBrand", "gyroModel", "gyroProfileName", "gyroGain", "gyroMode", "gyroNotes"] as const;
const MOTOR_VALUE_KEYS = ["motor", "motorTiming", "motorTurns", "motorRotor", "motorNotes"] as const;
const VISUAL_SETUP_VALUE_KEYS = [
  "ffToeBlockLeftInsert",
  "ffToeBlockRightInsert",
  "frToeBlockLeftInsert",
  "frToeBlockRightInsert",
  "rfToeBlockLeftInsert",
  "rfToeBlockRightInsert",
  "rrToeBlockLeftInsert",
  "rrToeBlockRightInsert"
] as const;

function withoutKeys<T extends Record<string, unknown>>(source: T, keys: readonly string[]) {
  const next = { ...source };
  keys.forEach((key) => {
    delete next[key];
  });
  return next;
}

export function cloneableTuneSource(source: Tune, includeAll: boolean): Tune {
  if (includeAll) return source;
  let values = { ...source.values };
  let selections = { ...source.selections };
  let electronics = source.electronics ? { ...source.electronics } : undefined;
  let chassisSetup = source.chassisSetup;
  let advancedSetup = source.advancedSetup;
  let visualSetup = source.visualSetup;
  let notes = source.notes;
  let photos = source.photos;
  const showBasic = source.sharedBasicTuneEnabled !== false;
  const showAdvanced = source.sharedChassisSetupEnabled !== false;

  if (!showBasic) {
    values = withoutKeys(values, BASIC_TUNE_VALUE_KEYS);
    selections = withoutKeys(selections, BASIC_TUNE_VALUE_KEYS);
    chassisSetup = showAdvanced ? chassisSetup : undefined;
  }
  if (!showAdvanced) {
    advancedSetup = undefined;
    visualSetup = undefined;
    values = withoutKeys(values, VISUAL_SETUP_VALUE_KEYS);
    selections = withoutKeys(selections, VISUAL_SETUP_VALUE_KEYS);
  }
  if (!source.sharedEscTuneEnabled) {
    values = withoutKeys(values, [...ESC_VALUE_KEYS, ...MOTOR_VALUE_KEYS]);
    selections = withoutKeys(selections, [...ESC_VALUE_KEYS, ...MOTOR_VALUE_KEYS]);
    if (electronics) electronics = { ...electronics, esc: undefined, motor: undefined };
  }
  if (!source.sharedServoTuneEnabled) {
    values = withoutKeys(values, SERVO_VALUE_KEYS);
    selections = withoutKeys(selections, SERVO_VALUE_KEYS);
    if (electronics) electronics = { ...electronics, servo: undefined };
  }
  if (!source.sharedGyroTuneEnabled) {
    values = withoutKeys(values, GYRO_VALUE_KEYS);
    selections = withoutKeys(selections, GYRO_VALUE_KEYS);
    if (electronics) electronics = { ...electronics, gyro: undefined };
  }
  if (!source.sharedNotesEnabled) {
    notes = "";
    values = withoutKeys(values, ["basicCustomNotes"]);
    selections = withoutKeys(selections, ["basicCustomNotes"]);
  }
  if (!source.sharedPhotosEnabled) {
    photos = [];
  }
  return { ...source, values, selections, electronics, chassisSetup, advancedSetup, visualSetup, notes, photos };
}

export function mergeAppData(base: AppData, incoming: Partial<AppData>): AppData {
  const incomingCars = incoming.cars?.filter((car) => !SEEDED_CAR_IDS.has(car.id));
  const isSeededTune = (tune: Tune) =>
    SEEDED_TUNE_IDS.has(tune.id) ||
    SEEDED_TUNE_NAMES.has(tune.name.trim().toLowerCase()) ||
    SEEDED_CAR_IDS.has(tune.carId) ||
    SEEDED_PROFILE_IDS.has(tune.ownerId ?? "");
  const cleanBaseCars = base.cars.filter((car) => !SEEDED_CAR_IDS.has(car.id));
  const cleanBaseCarIds = new Set(cleanBaseCars.map((car) => car.id));
  const cleanBaseTunes = base.tunes.filter((tune) => !isSeededTune(tune) && (cleanBaseCarIds.has(tune.carId) || (tune.ownerId && tune.ownerId !== "local-user")));
  const incomingTunes = incoming.tunes?.filter((tune) => !isSeededTune(tune));
  const incomingProfiles = incoming.profiles?.filter((profile) => !SEEDED_PROFILE_IDS.has(profile.uid));
  const byId = <T extends { id?: string }>(current: T[] = [], next: T[] = []) => {
    const map = new Map<string, T>();
    current.forEach((item, index) => map.set(item.id ?? `current-${index}`, item));
    next.forEach((item, index) => map.set(item.id ?? `next-${index}`, item));
    return Array.from(map.values());
  };
  const tuneCompletenessScore = (tune: Tune) =>
    JSON.stringify({
      values: tune.values,
      selections: tune.selections,
      electronics: tune.electronics,
      chassisSetup: tune.chassisSetup,
      advancedSetup: tune.advancedSetup,
      visualSetup: tune.visualSetup,
      photos: tune.photos,
      history: tune.history,
      notes: tune.notes
    }).length;
  const byTuneId = (current: Tune[] = [], next: Tune[] = []) => {
    const map = new Map<string, Tune>();
    current.forEach((item, index) => map.set(item.id ?? `current-${index}`, item));
    next.forEach((item, index) => {
      const key = item.id ?? `next-${index}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, item);
        return;
      }
      const sameOwner = existing.ownerId && item.ownerId && existing.ownerId === item.ownerId;
      const existingScore = tuneCompletenessScore(existing);
      const nextScore = tuneCompletenessScore(item);
      const nextIsNewer = Date.parse(item.updatedAt || "") > Date.parse(existing.updatedAt || "");
      map.set(key, sameOwner && existingScore > nextScore ? existing : nextIsNewer || nextScore >= existingScore ? item : existing);
    });
    return Array.from(map.values());
  };
  const byUsername = (current = base.profiles ?? [], next = incoming.profiles ?? []) => {
    const map = new Map<string, (typeof current)[number]>();
    current.forEach((item) => map.set(item.username, item));
    next.forEach((item) => map.set(item.username, item));
    return Array.from(map.values());
  };
  return {
    ...base,
    cars: byId(cleanBaseCars, incomingCars),
    tunes: byTuneId(cleanBaseTunes, incomingTunes),
    electronicsProfiles: byId(base.electronicsProfiles, incoming.electronicsProfiles),
    trackSessions: byId(base.trackSessions, incoming.trackSessions),
    profiles: byUsername(base.profiles ?? [], incomingProfiles ?? []),
    comments: byId(base.comments ?? [], incoming.comments ?? []),
    favorites: byId(base.favorites ?? [], incoming.favorites ?? []),
    follows: byId(base.follows ?? [], incoming.follows ?? [])
  };
}

export function routeToNav(route: AppRoute): "home" | "garage" | "tunes" | "builder" | "community" | "profile" | "tips" {
  if (route.name === "garage" || route.name === "cars") return "garage";
  if (route.name === "builder") return "builder";
  if (route.name === "tunes" || route.name === "tune") return "tunes";
  if (route.name === "community" || route.name === "library") return "community";
  if (route.name === "tips") return "tips";
  if (route.name === "profile" || route.name === "driverProfile" || route.name === "settings") return "profile";
  if (route.name === "track" || route.name === "brand") return "community";
  if (route.name === "sessions") return "home";
  if (route.name === "notFound") return "home";
  return "home";
}
