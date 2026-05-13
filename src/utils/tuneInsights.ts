import type { Car, Tune, TuneFeelProfile } from "../types";
import { partDisplayForTune } from "../data/rcParts";

export const defaultFeelProfile: TuneFeelProfile = {
  forwardBite: 5,
  sideBite: 5,
  rotation: 5,
  steeringResponse: 5,
  stability: 5,
  transitionSpeed: 5,
  cornerSpeed: 5,
  cornerExitDrive: 5,
  angleCapability: 5,
  smoothness: 5,
  aggressiveness: 5,
  forgiveness: 5,
  twitchiness: 5,
  rearGrip: 5,
  frontGrip: 5
};

export const feelLabels: Array<{ key: keyof TuneFeelProfile; label: string; low: string; high: string }> = [
  { key: "forwardBite", label: "Forward bite", low: "soft", high: "drive" },
  { key: "sideBite", label: "Side bite", low: "loose", high: "gripped" },
  { key: "rotation", label: "Rotation", low: "locked", high: "free" },
  { key: "steeringResponse", label: "Steering response", low: "calm", high: "sharp" },
  { key: "stability", label: "Stability", low: "loose", high: "calm" },
  { key: "transitionSpeed", label: "Transition speed", low: "lazy", high: "fast" },
  { key: "cornerSpeed", label: "Corner speed", low: "slow", high: "fast" },
  { key: "cornerExitDrive", label: "Corner exit drive", low: "soft", high: "drive" },
  { key: "angleCapability", label: "Angle capability", low: "safe", high: "big angle" },
  { key: "smoothness", label: "Smoothness", low: "rough", high: "smooth" },
  { key: "aggressiveness", label: "Aggressiveness", low: "mild", high: "attack" },
  { key: "forgiveness", label: "Forgiveness", low: "precise", high: "easy" },
  { key: "twitchiness", label: "Twitchiness", low: "calm", high: "twitchy" },
  { key: "rearGrip", label: "Rear grip", low: "low", high: "high" },
  { key: "frontGrip", label: "Front grip", low: "low", high: "high" }
];

export const primaryFeelLabels = feelLabels.filter((item) =>
  ["forwardBite", "sideBite", "angleCapability", "stability", "steeringResponse"].includes(item.key)
).map((item) => item.key === "angleCapability" ? { ...item, label: "Angle" } : item);

export function tuneDisplayName(tune: Pick<Tune, "name">) {
  return tune.name.trim() || "Untitled tune";
}

export function feelForTune(tune: Tune): TuneFeelProfile {
  const source = tune.expectedFeel ?? defaultFeelProfile;
  return {
    ...defaultFeelProfile,
    ...source,
    aggressiveness: source.aggressiveness ?? source.throttleAggression ?? defaultFeelProfile.aggressiveness,
    stability: source.stability ?? source.gyroStrength ?? defaultFeelProfile.stability
  };
}

export function valueText(tune: Tune, fieldId: string) {
  const electronicsMap: Record<string, unknown> = {
    escModel: tune.electronics?.esc?.customName || [tune.electronics?.esc?.brand, tune.electronics?.esc?.model].filter(Boolean).join(" "),
    motor: tune.electronics?.motor?.customName || [tune.electronics?.motor?.brand, tune.electronics?.motor?.model].filter(Boolean).join(" "),
    servoModel: tune.electronics?.servo?.customName || [tune.electronics?.servo?.brand, tune.electronics?.servo?.model].filter(Boolean).join(" "),
    gyroModel: tune.electronics?.gyro?.customName || [tune.electronics?.gyro?.brand, tune.electronics?.gyro?.model].filter(Boolean).join(" "),
    gyroGain: tune.electronics?.gyro?.gain ?? tune.electronics?.gyro?.settings?.gain,
    motorTurns: tune.electronics?.motor?.turns ?? tune.electronics?.motor?.settings?.motorTurns,
    motorTiming: tune.electronics?.motor?.timing ?? tune.electronics?.motor?.settings?.motorTiming,
    boostTiming: tune.electronics?.esc?.settings?.boostTiming,
    turboTiming: tune.electronics?.esc?.settings?.turboTiming
  };
  const electronicsValue = electronicsMap[fieldId];
  const value = electronicsValue || (tune.values[fieldId] ?? tune.selections[fieldId] ?? "");
  return Array.isArray(value) ? value.join(", ") : String(value ?? "");
}

export function bestForTags(tune: Tune): string[] {
  const explicit = [...(tune.bestForTags ?? []), ...(tune.setupIntent ?? [])].filter(Boolean);
  const inferred = [tune.surface, tune.grip, valueText(tune, "tires"), ...(tune.tags ?? [])]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter((item) => item && item.toLowerCase() !== "not sure");
  return Array.from(new Set([...explicit, ...inferred])).slice(0, 6);
}

export function keySetupChips(tune: Tune, car?: Car): string[] {
  const chips = [
    car?.chassisModel || car?.chassis,
    tune.chassisModel,
    tune.surface,
    tune.trackConditionPreset,
    partDisplayForTune(tune, "tire", ["tires"]),
    partDisplayForTune(tune, "motor", ["motorBrand", "motorModel", "motor"], tune.electronics?.motor),
    partDisplayForTune(tune, "esc", ["escBrand", "escModel"], tune.electronics?.esc),
    partDisplayForTune(tune, "gyro", ["gyroBrand", "gyroModel"], tune.electronics?.gyro),
    partDisplayForTune(tune, "servo", ["servoBrand", "servoModel"], tune.electronics?.servo),
    valueText(tune, "finalDriveRatio") ? `FDR ${valueText(tune, "finalDriveRatio")}` : "",
    valueText(tune, "frontCamber") ? `F camber ${valueText(tune, "frontCamber")}` : "",
    valueText(tune, "frontToe") ? `F toe ${valueText(tune, "frontToe")}` : "",
    valueText(tune, "frontRideHeight") ? `F ride ${valueText(tune, "frontRideHeight")}` : "",
    valueText(tune, "rearToe") ? `R toe ${valueText(tune, "rearToe")}` : "",
    valueText(tune, "rearRideHeight") ? `R ride ${valueText(tune, "rearRideHeight")}` : "",
    valueText(tune, "frontShockOil") ? `F oil ${valueText(tune, "frontShockOil")}` : "",
    valueText(tune, "rearShockOil") ? `R oil ${valueText(tune, "rearShockOil")}` : "",
    valueText(tune, "motorPosition") ? `Motor ${valueText(tune, "motorPosition")}` : "",
    valueText(tune, "gyroGain") ? `Gyro ${valueText(tune, "gyroGain")}` : "",
    valueText(tune, "escProfileName") || partDisplayForTune(tune, "esc", ["escBrand", "escModel"], tune.electronics?.esc)
  ];
  return Array.from(new Set(chips.filter(Boolean).map((chip) => String(chip)))).slice(0, 14);
}

export function shortChangeSummary(tune: Tune) {
  if (tune.changeReason) return tune.changeReason;
  const latest = tune.history?.[0];
  if (latest) return latest.summary;
  const whatChanged = valueText(tune, "whatChanged");
  return whatChanged || "No change notes yet";
}

export function tuneConfidence(tune: Tune) {
  return Math.max(1, Math.min(5, Number(tune.confidenceRating ?? tune.rating ?? 3) || 3));
}
