import type { AppData, Car, ElectronicsProfile, Tune, TuneAdvancedSetup, TuneChassisSetup, TuneElectronicsItem, TunePhoto, TuneShareSettings, TuneVisualSetup, TuneVisualSetupSelection } from "../types";

type TuneValue = string | number | boolean | string[];

const textValue = (value: unknown) => (value === undefined || value === null ? "" : String(value));
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const safeArray = <T>(value: unknown): T[] => (Array.isArray(value) ? value as T[] : []);
const safeRecord = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});
const safeText = (value: unknown, fallback = "") => (value === undefined || value === null ? fallback : String(value));
const safeNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const safeBoolean = (value: unknown, fallback = false) => (typeof value === "boolean" ? value : fallback);
const safeTextArray = (value: unknown) => safeArray<unknown>(value).map((item) => safeText(item)).filter(Boolean);
const safeTuneValue = (value: unknown): TuneValue | undefined => {
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (Array.isArray(value)) return value.map((item) => safeText(item)).filter(Boolean);
  return undefined;
};
const safeTuneValues = (value: unknown): Record<string, TuneValue> =>
  Object.fromEntries(
    Object.entries(safeRecord(value))
      .map(([key, item]) => [key, safeTuneValue(item)] as const)
      .filter((entry): entry is [string, TuneValue] => entry[1] !== undefined)
  );
const safeStringRecord = (value: unknown): Record<string, string> =>
  Object.fromEntries(Object.entries(safeRecord(value)).map(([key, item]) => [key, safeText(item)]));
const safeSettingsRecord = (value: unknown): Record<string, TuneValue> => safeTuneValues(value);

function safeVisualSetup(value: unknown): TuneVisualSetup | undefined {
  const source = safeRecord(value);
  const entries = Object.entries(source)
    .map(([key, item]) => {
      const record = safeRecord(item);
      if (!Object.keys(record).length) return null;
      const visual: TuneVisualSetupSelection = {
        helperId: safeText(record.helperId, key),
        brand: safeText(record.brand),
        partCategory: safeText(record.partCategory),
        definitionVersion: safeNumber(record.definitionVersion, 1),
        source: record.source === "brand-specific" || record.source === "generic" || record.source === "user-provided" ? record.source : "generic",
        label: safeText(record.label, key),
        positions: safeStringRecord(record.positions),
        updatedAt: record.updatedAt ? safeText(record.updatedAt) : undefined
      };
      return [key, visual] as const;
    })
    .filter((entry): entry is readonly [string, TuneVisualSetupSelection] => Boolean(entry));
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function safePhoto(value: unknown, index: number): TunePhoto {
  const source = safeRecord(value);
  const dataUrl = safeText(source.dataUrl ?? source.cloudUrl);
  const provider = source.provider === "cloudinary" || source.provider === "firebase" || source.provider === "local" ? source.provider : undefined;
  return {
    id: safeText(source.id, `photo-${index}`),
    label: safeText(source.label, `Photo ${index + 1}`),
    dataUrl,
    cloudUrl: source.cloudUrl ? safeText(source.cloudUrl) : undefined,
    publicId: source.publicId ? safeText(source.publicId) : undefined,
    provider,
    createdAt: safeText(source.createdAt, new Date(0).toISOString())
  };
}

function safeElectronicsItem(value: unknown): TuneElectronicsItem | undefined {
  if (!isRecord(value)) return undefined;
  return {
    ...value,
    brand: safeText(value.brand),
    model: safeText(value.model ?? value.customName),
    slug: value.slug ? safeText(value.slug) : undefined,
    customName: value.customName ? safeText(value.customName) : undefined,
    settings: safeSettingsRecord(value.settings),
    notes: value.notes ? safeText(value.notes) : "",
    tunePhotos: safeArray<unknown>(value.tunePhotos).map(safePhoto),
    selectedProfileId: value.selectedProfileId ? safeText(value.selectedProfileId) : "",
    profileSnapshot: isRecord(value.profileSnapshot) ? safeSettingsRecord(value.profileSnapshot) : safeText(value.profileSnapshot),
    turns: value.turns ? safeText(value.turns) : "",
    timing: value.timing ? safeText(value.timing) : "",
    rotor: value.rotor ? safeText(value.rotor) : "",
    firmware: value.firmware ? safeText(value.firmware) : "",
    gain: value.gain ? safeText(value.gain) : "",
    mode: value.mode ? safeText(value.mode) : ""
  };
}

function safeCar(value: unknown, index: number): Car {
  const car = safeRecord(value) as Partial<Car> & Record<string, unknown>;
  return {
    ...(car as Partial<Car>),
    id: safeText(car.id, `car-${index}`),
    name: safeText(car.name, "Untitled car"),
    brand: car.brand ? safeText(car.brand) : undefined,
    chassis: safeText(car.chassis, "Custom chassis"),
    chassisBrand: car.chassisBrand ? safeText(car.chassisBrand) : undefined,
    chassisBrandSlug: car.chassisBrandSlug ? safeText(car.chassisBrandSlug) : undefined,
    chassisModel: car.chassisModel ? safeText(car.chassisModel) : undefined,
    chassisModelSlug: car.chassisModelSlug ? safeText(car.chassisModelSlug) : undefined,
    photos: safeArray<unknown>(car.photos).map(safePhoto),
    sheetId: safeText(car.sheetId, "universal-template"),
    createdAt: safeText(car.createdAt, new Date(0).toISOString()),
    updatedAt: car.updatedAt ? safeText(car.updatedAt) : undefined
  };
}

function safeTune(value: unknown, index: number): Tune {
  const tune = safeRecord(value) as Partial<Tune> & Record<string, unknown>;
  const electronics = safeRecord(tune.electronics);
  const visibility = tune.visibility === "public" || tune.visibility === "unlisted" ? tune.visibility : "private";
  return {
    ...(tune as Partial<Tune>),
    id: safeText(tune.id ?? tune.tuneId, `tune-${index}`),
    name: safeText(tune.name ?? tune.tuneName),
    carId: safeText(tune.carId),
    sheetId: safeText(tune.sheetId, "universal-template"),
    chassisBrand: tune.chassisBrand ? safeText(tune.chassisBrand) : undefined,
    chassisBrandSlug: tune.chassisBrandSlug ? safeText(tune.chassisBrandSlug) : undefined,
    chassisModel: tune.chassisModel ? safeText(tune.chassisModel) : undefined,
    chassisModelSlug: tune.chassisModelSlug ? safeText(tune.chassisModelSlug) : undefined,
    date: safeText(tune.date),
    track: safeText(tune.track),
    surface: safeText(tune.surface),
    grip: safeText(tune.grip),
    rating: safeNumber(tune.rating),
    tags: safeTextArray(tune.tags),
    values: safeTuneValues(tune.values),
    selections: safeStringRecord(tune.selections),
    notes: safeText(tune.notes),
    setupIntent: safeTextArray(tune.setupIntent),
    bestForTags: safeTextArray(tune.bestForTags),
    trackConditionPreset: safeText(tune.trackConditionPreset),
    confidenceRating: safeNumber(tune.confidenceRating ?? tune.rating),
    summaryChips: safeTextArray(tune.summaryChips),
    electronics: {
      esc: safeElectronicsItem(electronics.esc),
      motor: safeElectronicsItem(electronics.motor),
      servo: safeElectronicsItem(electronics.servo),
      gyro: safeElectronicsItem(electronics.gyro),
      receiver: safeElectronicsItem(electronics.receiver),
      battery: safeElectronicsItem(electronics.battery),
      other: safeElectronicsItem(electronics.other)
    },
    visualSetup: safeVisualSetup(tune.visualSetup),
    chassisSetup: isRecord(tune.chassisSetup) ? tune.chassisSetup as Tune["chassisSetup"] : undefined,
    advancedSetup: isRecord(tune.advancedSetup) ? tune.advancedSetup as Tune["advancedSetup"] : undefined,
    cloneInfo: isRecord(tune.cloneInfo) ? tune.cloneInfo as Tune["cloneInfo"] : undefined,
    shareSettings: isRecord(tune.shareSettings) ? tune.shareSettings as Tune["shareSettings"] : undefined,
    photos: safeArray<unknown>(tune.photos).map(safePhoto),
    history: safeArray<unknown>(tune.history) as Tune["history"],
    ownerId: tune.ownerId ? safeText(tune.ownerId) : undefined,
    ownerUsername: tune.ownerUsername ? safeText(tune.ownerUsername) : undefined,
    ownerDisplayName: tune.ownerDisplayName ? safeText(tune.ownerDisplayName) : undefined,
    shareId: tune.shareId ? safeText(tune.shareId) : undefined,
    visibility,
    cloneEnabled: safeBoolean(tune.cloneEnabled),
    sharedPhotosEnabled: safeBoolean(tune.sharedPhotosEnabled),
    sharedNotesEnabled: safeBoolean(tune.sharedNotesEnabled),
    sharedBasicTuneEnabled: tune.sharedBasicTuneEnabled !== false,
    sharedChassisSetupEnabled: tune.sharedChassisSetupEnabled !== false,
    sharedEscTuneEnabled: safeBoolean(tune.sharedEscTuneEnabled),
    sharedServoTuneEnabled: safeBoolean(tune.sharedServoTuneEnabled),
    sharedGyroTuneEnabled: safeBoolean(tune.sharedGyroTuneEnabled),
    sharedRadioTuneEnabled: safeBoolean(tune.sharedRadioTuneEnabled),
    sharedHistoryEnabled: safeBoolean(tune.sharedHistoryEnabled),
    sharedOwnerNameEnabled: tune.sharedOwnerNameEnabled !== false,
    pdfDownloadEnabled: tune.pdfDownloadEnabled !== false,
    setupAssistantLog: safeArray<unknown>(tune.setupAssistantLog) as Tune["setupAssistantLog"],
    viewCount: safeNumber(tune.viewCount),
    cloneCount: safeNumber(tune.cloneCount),
    likeCount: safeNumber(tune.likeCount),
    shareCount: safeNumber(tune.shareCount),
    favoriteCount: safeNumber(tune.favoriteCount),
    createdAt: safeText(tune.createdAt, new Date(0).toISOString()),
    updatedAt: safeText(tune.updatedAt, new Date(0).toISOString())
  } as Tune;
}

function safeElectronicsProfile(value: unknown, index: number): ElectronicsProfile {
  const profile = safeRecord(value);
  const type = profile.type === "servo" || profile.type === "gyro" || profile.type === "radio" ? profile.type : "esc";
  return {
    id: safeText(profile.id, `electronics-profile-${index}`),
    ownerId: profile.ownerId ? safeText(profile.ownerId) : undefined,
    type,
    name: safeText(profile.name, "Electronics profile"),
    description: profile.description ? safeText(profile.description) : undefined,
    values: safeTuneValues(profile.values),
    createdAt: safeText(profile.createdAt, new Date(0).toISOString()),
    updatedAt: safeText(profile.updatedAt, new Date(0).toISOString())
  };
}
const hasOwn = (source: Record<string, TuneValue>, key: string) => Object.prototype.hasOwnProperty.call(source, key);
const fillMissingValue = (target: Record<string, TuneValue>, key: string, value: unknown) => {
  if (hasOwn(target, key) || value === undefined || value === null) return;
  if (typeof value === "string" && value.trim() === "") return;
  if (typeof value === "number" || typeof value === "boolean" || Array.isArray(value) || typeof value === "string") {
    target[key] = value as TuneValue;
  }
};

function partFromElectronics(item?: TuneElectronicsItem, fallbackModel = "") {
  return {
    brand: item?.brand ?? "",
    model: item?.model || item?.customName || fallbackModel,
    notes: item?.notes ?? ""
  };
}

function syncedElectronicsItem(item: TuneElectronicsItem | undefined, values: Record<string, TuneValue>, keys: { brand?: string; model?: string; profile?: string; timing?: string; gain?: string; mode?: string; firmware?: string; turns?: string; rotor?: string; notes?: string }) {
  const profileValue = keys.profile ? textValue(values[keys.profile] ?? item?.selectedProfileId) : item?.selectedProfileId;
  const profileSnapshot = item?.profileSnapshot ?? profileValue;
  const modelValue = keys.model ? textValue(values[keys.model] ?? values.motor ?? item?.model ?? item?.customName) : item?.model ?? item?.customName ?? "";
  return {
    ...partFromElectronics(item, keys.model ? textValue(values[keys.model]) : ""),
    ...item,
    brand: keys.brand ? textValue(values[keys.brand] ?? item?.brand) : item?.brand ?? "",
    model: modelValue,
    customName: item?.customName,
    slug: item?.slug,
    settings: item?.settings ?? {},
    selectedProfileId: profileValue,
    profileSnapshot,
    timing: keys.timing ? textValue(values[keys.timing] ?? item?.timing) : item?.timing,
    gain: keys.gain ? textValue(values[keys.gain] ?? item?.gain) : item?.gain,
    mode: keys.mode ? textValue(values[keys.mode] ?? item?.mode) : item?.mode,
    firmware: keys.firmware ? textValue(values[keys.firmware] ?? item?.firmware) : item?.firmware,
    turns: keys.turns ? textValue(values[keys.turns] ?? item?.turns) : item?.turns,
    rotor: keys.rotor ? textValue(values[keys.rotor] ?? item?.rotor) : item?.rotor,
    notes: keys.notes ? textValue(values[keys.notes] ?? item?.notes) : item?.notes ?? ""
  };
}

function compactRecord(source: Record<string, TuneValue>, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, source[key]]).filter(([, value]) => value !== undefined && textValue(value).trim() !== ""));
}

function hydrateValuesFromStructuredTune(tune: Tune, car?: Car) {
  const values = { ...(tune.values ?? {}) };
  Object.values(tune.visualSetup ?? {}).forEach((selection) => {
    Object.entries(selection.positions ?? {}).forEach(([fieldId, value]) => fillMissingValue(values, fieldId, value));
  });
  const chassis = tune.chassisSetup;
  fillMissingValue(values, "chassisBrand", tune.chassisBrand || car?.chassisBrand || car?.brand || chassis?.chassis?.brand);
  fillMissingValue(values, "chassisModel", tune.chassisModel || car?.chassisModel || car?.chassis || chassis?.chassis?.model);
  fillMissingValue(values, "chassisDeck", chassis?.chassis?.deck);
  fillMissingValue(values, "chassisCustomizations", chassis?.chassis?.customizations);
  fillMissingValue(values, "frontDamperBrand", chassis?.front?.dampers?.brand);
  fillMissingValue(values, "frontDamper", chassis?.front?.dampers?.model);
  fillMissingValue(values, "frontSpringBrand", chassis?.front?.spring?.brand);
  fillMissingValue(values, "frontSpring", chassis?.front?.spring?.model);
  fillMissingValue(values, "frontSpringRate", chassis?.front?.spring?.rate);
  fillMissingValue(values, "frontSpringLength", chassis?.front?.spring?.length);
  fillMissingValue(values, "frontKnuckleBrand", chassis?.front?.knuckle?.brand);
  fillMissingValue(values, "frontKnuckle", chassis?.front?.knuckle?.model);
  fillMissingValue(values, "frontAxleBrand", chassis?.front?.axle?.brand);
  fillMissingValue(values, "frontAxle", chassis?.front?.axle?.model);
  fillMissingValue(values, "frontAxleLength", chassis?.front?.axle?.length);
  fillMissingValue(values, "frontWheelBrand", chassis?.front?.wheel?.brand);
  fillMissingValue(values, "frontWheel", chassis?.front?.wheel?.model);
  fillMissingValue(values, "frontWheelOffset", chassis?.front?.wheel?.offset);
  fillMissingValue(values, "frontWheelWidth", chassis?.front?.wheel?.width);
  fillMissingValue(values, "frontUpperArmBrand", chassis?.front?.upperArm?.brand);
  fillMissingValue(values, "frontUpperArm", chassis?.front?.upperArm?.model);
  fillMissingValue(values, "frontUpperArmShims", chassis?.front?.upperArm?.shims);
  fillMissingValue(values, "frontLowerArmBrand", chassis?.front?.lowerArm?.brand);
  fillMissingValue(values, "frontLowerArm", chassis?.front?.lowerArm?.model);
  fillMissingValue(values, "frontLowerArmShims", chassis?.front?.lowerArm?.shims);
  fillMissingValue(values, "frontToeBlockBrand", chassis?.front?.toeBlock?.brand);
  fillMissingValue(values, "frontToeBlock", chassis?.front?.toeBlock?.model);
  fillMissingValue(values, "ffToeBlockBrand", values.frontToeBlockBrand ?? chassis?.front?.toeBlock?.brand);
  fillMissingValue(values, "ffToeBlock", values.frontToeBlock ?? chassis?.front?.toeBlock?.model);
  fillMissingValue(values, "frToeBlockBrand", values.frontToeBlockBrand ?? chassis?.front?.toeBlock?.brand);
  fillMissingValue(values, "frToeBlock", values.frontToeBlock ?? chassis?.front?.toeBlock?.model);
  fillMissingValue(values, "frontToe", chassis?.front?.toeBlock?.toeAngle);
  fillMissingValue(values, "frontToeBlockShims", chassis?.front?.toeBlock?.shims);
  fillMissingValue(values, "rearDamperBrand", chassis?.rear?.dampers?.brand);
  fillMissingValue(values, "rearDamper", chassis?.rear?.dampers?.model);
  fillMissingValue(values, "rearUpperArmBrand", chassis?.rear?.upperArm?.brand);
  fillMissingValue(values, "rearUpperArm", chassis?.rear?.upperArm?.model);
  fillMissingValue(values, "rearUpperArmShims", chassis?.rear?.upperArm?.shims);
  fillMissingValue(values, "rearLowerArmBrand", chassis?.rear?.lowerArm?.brand);
  fillMissingValue(values, "rearLowerArm", chassis?.rear?.lowerArm?.model);
  fillMissingValue(values, "rearLowerArmShims", chassis?.rear?.lowerArm?.shims);
  fillMissingValue(values, "rearHubCarrierBrand", chassis?.rear?.hubCarrier?.brand);
  fillMissingValue(values, "rearHubCarrier", chassis?.rear?.hubCarrier?.model);
  fillMissingValue(values, "activeToe", chassis?.rear?.hubCarrier?.tunableSettings?.activeToe);
  fillMissingValue(values, "rearAxleBrand", chassis?.rear?.axle?.brand);
  fillMissingValue(values, "rearAxle", chassis?.rear?.axle?.model);
  fillMissingValue(values, "rearAxleLength", chassis?.rear?.axle?.length);
  fillMissingValue(values, "rearWheelBrand", chassis?.rear?.wheel?.brand);
  fillMissingValue(values, "rearWheel", chassis?.rear?.wheel?.model);
  fillMissingValue(values, "rearWheelOffset", chassis?.rear?.wheel?.offset);
  fillMissingValue(values, "rearWheelWidth", chassis?.rear?.wheel?.width);
  fillMissingValue(values, "rearToeBlockBrand", chassis?.rear?.toeBlock?.brand);
  fillMissingValue(values, "rearToeBlock", chassis?.rear?.toeBlock?.model);
  fillMissingValue(values, "rfToeBlockBrand", values.rearToeBlockBrand ?? chassis?.rear?.toeBlock?.brand);
  fillMissingValue(values, "rfToeBlock", values.toeBlockSuspensionMount ?? values.rearToeBlock ?? chassis?.rear?.toeBlock?.model);
  fillMissingValue(values, "rrToeBlockBrand", values.rearToeBlockBrand ?? chassis?.rear?.toeBlock?.brand);
  fillMissingValue(values, "rrToeBlock", values.toeBlockSuspensionMount ?? values.rearToeBlock ?? chassis?.rear?.toeBlock?.model);
  fillMissingValue(values, "rearToe", chassis?.rear?.toeBlock?.toeAngle);
  fillMissingValue(values, "rearToeBlockShims", chassis?.rear?.toeBlock?.shims);
  fillMissingValue(values, "escBrand", tune.electronics?.esc?.brand);
  fillMissingValue(values, "escModel", tune.electronics?.esc?.customName || tune.electronics?.esc?.model);
  fillMissingValue(values, "escProfileId", tune.electronics?.esc?.selectedProfileId);
  fillMissingValue(values, "escFirmwareVersion", tune.electronics?.esc?.firmware);
  fillMissingValue(values, "servoBrand", tune.electronics?.servo?.brand);
  fillMissingValue(values, "servoModel", tune.electronics?.servo?.customName || tune.electronics?.servo?.model);
  fillMissingValue(values, "servoProfileId", tune.electronics?.servo?.selectedProfileId);
  fillMissingValue(values, "gyroBrand", tune.electronics?.gyro?.brand);
  fillMissingValue(values, "gyroModel", tune.electronics?.gyro?.customName || tune.electronics?.gyro?.model);
  fillMissingValue(values, "gyroProfileId", tune.electronics?.gyro?.selectedProfileId);
  fillMissingValue(values, "gyroGain", tune.electronics?.gyro?.gain ?? tune.electronics?.gyro?.settings?.gain);
  fillMissingValue(values, "gyroMode", tune.electronics?.gyro?.mode ?? tune.electronics?.gyro?.settings?.mode);
  fillMissingValue(values, "motorBrand", tune.electronics?.motor?.brand);
  fillMissingValue(values, "motorModel", tune.electronics?.motor?.customName || tune.electronics?.motor?.model);
  fillMissingValue(values, "motor", tune.electronics?.motor?.customName || tune.electronics?.motor?.model);
  fillMissingValue(values, "motorTurns", tune.electronics?.motor?.turns);
  fillMissingValue(values, "motorTiming", tune.electronics?.motor?.timing);
  fillMissingValue(values, "motorRotor", tune.electronics?.motor?.rotor);
  return values;
}

function buildChassisSetup(tune: Tune, car?: Car): TuneChassisSetup {
  const values = tune.values ?? {};
  const existing = tune.chassisSetup ?? {};
  return {
    ...existing,
    chassis: {
      ...existing.chassis,
      brand: tune.chassisBrand || car?.chassisBrand || car?.brand || existing.chassis?.brand || "",
      model: tune.chassisModel || car?.chassisModel || car?.chassis || existing.chassis?.model || "",
      deck: textValue(values.chassisDeck ?? values.chassisBrace ?? existing.chassis?.deck),
      customizations: textValue(values.chassisCustomizations ?? values.conversionKit ?? values.chassisVariant ?? existing.chassis?.customizations)
    },
    front: {
      ...existing.front,
      dampers: {
        ...existing.front?.dampers,
        brand: textValue(values.frontDamperBrand ?? existing.front?.dampers?.brand),
        model: textValue(values.frontDamper ?? values.frontDamperModel ?? values.frontShockStyle ?? existing.front?.dampers?.model),
        notes: textValue(values.frontShockTower ?? values.frontShockPiston ?? values.frontPiston ?? values.frontShockShaft ?? values.frontShockOil ?? values.frontShockPosition ?? existing.front?.dampers?.notes)
      },
      spring: {
        ...existing.front?.spring,
        brand: textValue(values.frontSpringBrand ?? values.frontSpringBrandRate ?? existing.front?.spring?.brand),
        model: textValue(values.frontSpring ?? values.frontSpringBrandRate ?? existing.front?.spring?.model),
        rate: textValue(values.frontSpringRate ?? values.frontSpringBrandRate ?? existing.front?.spring?.rate),
        length: textValue(values.frontSpringLength ?? existing.front?.spring?.length),
        notes: textValue(values.frontSpringNotes ?? existing.front?.spring?.notes)
      },
      knuckle: {
        ...existing.front?.knuckle,
        brand: textValue(values.frontKnuckleBrand ?? existing.front?.knuckle?.brand),
        model: textValue(values.frontKnuckle ?? existing.front?.knuckle?.model),
        tunableSettings: { ...(existing.front?.knuckle?.tunableSettings ?? {}), steeringAngle: values.steeringAngle, ackerman: values.ackerman, knucklePlate: values.frontKnucklePlate },
        notes: textValue(values.frontKnucklePlate ?? values.bumpSteerNotes ?? existing.front?.knuckle?.notes)
      },
      axle: {
        ...existing.front?.axle,
        brand: textValue(values.frontAxleBrand ?? existing.front?.axle?.brand),
        model: textValue(values.frontAxle ?? existing.front?.axle?.model),
        length: textValue(values.frontAxleLength ?? existing.front?.axle?.length),
        notes: textValue(values.frontAxleNotes ?? existing.front?.axle?.notes)
      },
      wheel: {
        ...existing.front?.wheel,
        brand: textValue(values.frontWheelBrand ?? existing.front?.wheel?.brand),
        model: textValue(values.frontWheel ?? values.wheelModel ?? existing.front?.wheel?.model),
        offset: textValue(values.frontWheelOffset ?? existing.front?.wheel?.offset),
        width: textValue(values.frontWheelWidth ?? existing.front?.wheel?.width),
        notes: textValue(values.frontWheelNotes ?? existing.front?.wheel?.notes)
      },
      upperArm: {
        ...existing.front?.upperArm,
        brand: textValue(values.frontUpperArmBrand ?? existing.front?.upperArm?.brand),
        model: textValue(values.frontUpperArm ?? values.frontUpperLink ?? existing.front?.upperArm?.model),
        shims: textValue(values.frontUpperArmShims ?? existing.front?.upperArm?.shims),
        notes: textValue(values.frontUpperArmNotes ?? values.frontUpperLink ?? existing.front?.upperArm?.notes)
      },
      lowerArm: {
        ...existing.front?.lowerArm,
        brand: textValue(values.frontLowerArmBrand ?? existing.front?.lowerArm?.brand),
        model: textValue(values.frontLowerArm ?? existing.front?.lowerArm?.model),
        shims: textValue(values.frontLowerArmShims ?? values.frontSpacerNotes ?? existing.front?.lowerArm?.shims),
        notes: textValue(values.frontSpacerNotes ?? existing.front?.lowerArm?.notes)
      },
      toeBlock: {
        ...existing.front?.toeBlock,
        brand: textValue(values.frontToeBlockBrand ?? values.ffToeBlockBrand ?? values.frToeBlockBrand ?? existing.front?.toeBlock?.brand),
        model: textValue(values.frontToeBlock ?? values.ffToeBlock ?? values.frToeBlock ?? existing.front?.toeBlock?.model),
        toeAngle: textValue(values.frontToe ?? existing.front?.toeBlock?.toeAngle),
        shims: textValue(values.frontToeBlockShims ?? values.ffToeBlockShim ?? values.frToeBlockShim ?? existing.front?.toeBlock?.shims),
        notes: textValue(values.frontAntiDiveNotes ?? values.frontToeBlockNotes ?? existing.front?.toeBlock?.notes)
      }
    },
    rear: {
      ...existing.rear,
      dampers: {
        ...existing.rear?.dampers,
        brand: textValue(values.rearDamperBrand ?? existing.rear?.dampers?.brand),
        model: textValue(values.rearDamper ?? values.rearDamperModel ?? values.rearShockStyle ?? existing.rear?.dampers?.model),
        notes: textValue(values.rearShockTower ?? values.rearShockPiston ?? values.rearPiston ?? values.rearShockShaft ?? values.rearShockOil ?? values.rearShockPosition ?? existing.rear?.dampers?.notes)
      },
      upperArm: {
        ...existing.rear?.upperArm,
        brand: textValue(values.rearUpperArmBrand ?? existing.rear?.upperArm?.brand),
        model: textValue(values.rearUpperArm ?? values.rearUpperLink ?? existing.rear?.upperArm?.model),
        shims: textValue(values.rearUpperArmShims ?? existing.rear?.upperArm?.shims),
        notes: textValue(values.rearUpperArmNotes ?? values.rearUpperLink ?? existing.rear?.upperArm?.notes)
      },
      lowerArm: {
        ...existing.rear?.lowerArm,
        brand: textValue(values.rearLowerArmBrand ?? existing.rear?.lowerArm?.brand),
        model: textValue(values.rearLowerArm ?? existing.rear?.lowerArm?.model),
        shims: textValue(values.rearLowerArmShims ?? values.rearSpacerNotes ?? existing.rear?.lowerArm?.shims),
        notes: textValue(values.rearSpacerNotes ?? existing.rear?.lowerArm?.notes)
      },
      hubCarrier: {
        ...existing.rear?.hubCarrier,
        brand: textValue(values.rearHubCarrierBrand ?? existing.rear?.hubCarrier?.brand),
        model: textValue(values.rearHubCarrier ?? existing.rear?.hubCarrier?.model),
        tunableSettings: { ...(existing.rear?.hubCarrier?.tunableSettings ?? {}), rollCenter: values.rearRollCenter, activeToe: values.activeToe },
        notes: textValue(values.rearHubCarrierNotes ?? existing.rear?.hubCarrier?.notes)
      },
      axle: {
        ...existing.rear?.axle,
        brand: textValue(values.rearAxleBrand ?? existing.rear?.axle?.brand),
        model: textValue(values.rearAxleType ?? values.rearAxle ?? existing.rear?.axle?.model),
        length: textValue(values.rearAxleLength ?? existing.rear?.axle?.length),
        notes: textValue(values.rearAxleHexHub ?? values.rearAxleNotes ?? existing.rear?.axle?.notes)
      },
      wheel: {
        ...existing.rear?.wheel,
        brand: textValue(values.rearWheelBrand ?? existing.rear?.wheel?.brand),
        model: textValue(values.rearWheel ?? values.wheelModel ?? existing.rear?.wheel?.model),
        offset: textValue(values.rearWheelOffset ?? existing.rear?.wheel?.offset),
        width: textValue(values.rearWheelWidth ?? existing.rear?.wheel?.width),
        notes: textValue(values.rearWheelNotes ?? existing.rear?.wheel?.notes)
      },
      toeBlock: {
        ...existing.rear?.toeBlock,
        brand: textValue(values.rearToeBlockBrand ?? values.rfToeBlockBrand ?? values.rrToeBlockBrand ?? existing.rear?.toeBlock?.brand),
        model: textValue(values.toeBlockSuspensionMount ?? values.rearToeBlock ?? values.rfToeBlock ?? values.rrToeBlock ?? existing.rear?.toeBlock?.model),
        toeAngle: textValue(values.rearToe ?? existing.rear?.toeBlock?.toeAngle),
        shims: textValue(values.rearToeBlockShims ?? values.rfToeBlockShim ?? values.rrToeBlockShim ?? values.rearSpacerNotes ?? existing.rear?.toeBlock?.shims),
        notes: textValue(values.rearSquatNotes ?? values.rearSpacerNotes ?? existing.rear?.toeBlock?.notes)
      }
    }
  };
}

function buildAdvancedSetup(tune: Tune): TuneAdvancedSetup {
  const values = tune.values ?? {};
  return {
    ...(tune.advancedSetup ?? {}),
    frontAlignment: { ...(tune.advancedSetup?.frontAlignment ?? {}), ...compactRecord(values, ["frontCamber", "frontToe", "caster", "kpi", "ackerman", "steeringAngle", "steeringRackPosition", "tieRodPosition", "frontTrackWidth", "frontKnucklePlate", "trail", "ffToeBlockBrand", "ffToeBlock", "ffToeBlockPartNumber", "ffToeBlockLeftInsert", "ffToeBlockRightInsert", "frToeBlockBrand", "frToeBlock", "frToeBlockPartNumber", "frToeBlockLeftInsert", "frToeBlockRightInsert", "ffToeBlockShim", "frToeBlockShim", "frontAntiDiveNotes", "bumpSteerNotes"]) },
    rearAlignment: { ...(tune.advancedSetup?.rearAlignment ?? {}), ...compactRecord(values, ["rearCamber", "rearToe", "skidAngle", "rearRollCenter", "rearTrackWidth", "toeBlockSuspensionMount", "rfToeBlockBrand", "rfToeBlock", "rfToeBlockPartNumber", "rfToeBlockLeftInsert", "rfToeBlockRightInsert", "rrToeBlockBrand", "rrToeBlock", "rrToeBlockPartNumber", "rrToeBlockLeftInsert", "rrToeBlockRightInsert", "activeToe", "rfToeBlockShim", "rrToeBlockShim", "rearSquatNotes"]) },
    shocks: { ...(tune.advancedSetup?.shocks ?? {}), ...compactRecord(values, ["frontRideHeight", "rearRideHeight", "frontDamper", "rearDamper", "frontShockTower", "rearShockTower", "frontShockOil", "rearShockOil", "frontPiston", "rearPiston", "frontShockPiston", "rearShockPiston", "frontShockShaft", "rearShockShaft", "frontShockPosition", "rearShockPosition", "frontDroop", "rearDroop", "frontPreload", "rearPreload", "frontSwayBar", "rearSwayBar"]) },
    drivetrain: { ...(tune.advancedSetup?.drivetrain ?? {}), ...compactRecord(values, ["driveType", "motorPosition", "diffType", "ballDiffSetting", "gearDiffOil", "lsdSetting", "spurGear", "pinionGear", "finalDriveRatio", "gearPitch", "diffOil", "diffGrease", "diffShimSetup", "rearAxleType", "beltShaftNotes"]) },
    weightBalance: { ...(tune.advancedSetup?.weightBalance ?? {}), ...compactRecord(values, ["batteryPosition", "addedWeight", "weightLocation", "weightBias", "frontWeight", "rearWeight", "sideWeight", "weightBalanceNotes"]) },
    bodyAero: { ...(tune.advancedSetup?.bodyAero ?? {}), ...compactRecord(values, ["body", "bodyShell", "bodyWeight", "wing", "aeroWing", "wingPosition", "bodyMountPosition", "aeroNotes"]) },
    officialPdfFields: tune.advancedSetup?.officialPdfFields ?? {}
  };
}

function buildShareSettings(tune: Tune): TuneShareSettings {
  return {
    ...(tune.shareSettings ?? {}),
    visibility: tune.visibility ?? tune.shareSettings?.visibility ?? "private",
    allowCloning: tune.cloneEnabled ?? tune.shareSettings?.allowCloning ?? false,
    showPhotos: tune.sharedPhotosEnabled ?? tune.shareSettings?.showPhotos ?? false,
    showNotes: tune.sharedNotesEnabled ?? tune.shareSettings?.showNotes ?? false,
    showBasicTune: tune.sharedBasicTuneEnabled ?? tune.shareSettings?.showBasicTune ?? true,
    showChassisSetup: tune.sharedChassisSetupEnabled ?? tune.shareSettings?.showChassisSetup ?? true,
    showEscTune: tune.sharedEscTuneEnabled ?? tune.shareSettings?.showEscTune ?? false,
    showServoTune: tune.sharedServoTuneEnabled ?? tune.shareSettings?.showServoTune ?? false,
    showGyroTune: tune.sharedGyroTuneEnabled ?? tune.shareSettings?.showGyroTune ?? false,
    showRadioTune: tune.sharedRadioTuneEnabled ?? tune.shareSettings?.showRadioTune ?? false,
    showChangeHistory: tune.sharedHistoryEnabled ?? tune.shareSettings?.showChangeHistory ?? false,
    showOwnerName: tune.sharedOwnerNameEnabled ?? tune.shareSettings?.showOwnerName ?? true,
    allowPdfDownload: tune.pdfDownloadEnabled ?? tune.shareSettings?.allowPdfDownload ?? true
  };
}

export function syncTuneSharedModel(tune: Tune, car?: Car): Tune {
  const values = hydrateValuesFromStructuredTune(tune, car);
  const electronics = {
    ...(tune.electronics ?? {}),
    esc: syncedElectronicsItem(tune.electronics?.esc, values, { brand: "escBrand", model: "escModel", profile: "escProfileId", firmware: "escFirmwareVersion", notes: "escNotes" }),
    motor: syncedElectronicsItem(tune.electronics?.motor, values, { brand: "motorBrand", model: "motorModel", timing: "motorTiming", turns: "motorTurns", rotor: "motorRotor", notes: "motorNotes" }),
    servo: syncedElectronicsItem(tune.electronics?.servo, values, { brand: "servoBrand", model: "servoModel", profile: "servoProfileId", notes: "servoNotes" }),
    gyro: syncedElectronicsItem(tune.electronics?.gyro, values, { brand: "gyroBrand", model: "gyroModel", profile: "gyroProfileId", gain: "gyroGain", mode: "gyroMode", notes: "gyroNotes" })
  };
  return {
    ...tune,
    values,
    tuneName: tune.name || tune.tuneName,
    electronics,
    chassisSetup: buildChassisSetup({ ...tune, electronics }, car),
    advancedSetup: buildAdvancedSetup(tune),
    cloneInfo: {
      ...(tune.cloneInfo ?? {}),
      clonedFromTuneId: tune.clonedFromTuneId,
      clonedFromOwnerId: tune.clonedFromOwnerId,
      clonedFromShareId: tune.clonedFromShareId,
      sourceTuneId: tune.sourceTuneId,
      sourceOwnerId: tune.sourceOwnerId,
      sourceBrand: tune.sourceBrand,
      sourceModel: tune.sourceModel,
      forkedAt: tune.forkedAt
    },
    shareSettings: buildShareSettings(tune)
  };
}

export function serializeTuneForSave(tune: Tune, car?: Car): Tune {
  return syncTuneSharedModel(tune, car);
}

export function syncAppDataSharedModel(data: AppData): AppData {
  const cars = safeArray<unknown>(data.cars).map(safeCar);
  const tunes = safeArray<unknown>(data.tunes).map(safeTune);
  return {
    ...data,
    cars,
    tunes: tunes.map((tune) => syncTuneSharedModel(tune, cars.find((car) => car.id === tune.carId))),
    electronicsProfiles: safeArray<unknown>(data.electronicsProfiles).map(safeElectronicsProfile),
    trackSessions: safeArray(data.trackSessions),
    profiles: safeArray(data.profiles),
    comments: safeArray(data.comments),
    favorites: safeArray(data.favorites),
    follows: safeArray(data.follows)
  };
}
