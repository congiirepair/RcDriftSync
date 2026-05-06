import type { Car, Tune, TuneFeelProfile } from "../types";

export const defaultFeelProfile: TuneFeelProfile = {
  forwardBite: 3,
  rotation: 3,
  stability: 3,
  steeringResponse: 3,
  transitionSpeed: 3,
  rearGrip: 3,
  throttleAggression: 3,
  gyroStrength: 3
};

export const feelLabels: Array<{ key: keyof TuneFeelProfile; label: string; low: string; high: string }> = [
  { key: "forwardBite", label: "Forward bite", low: "soft", high: "drive" },
  { key: "rotation", label: "Rotation", low: "locked", high: "free" },
  { key: "stability", label: "Stability", low: "loose", high: "calm" },
  { key: "steeringResponse", label: "Steering", low: "calm", high: "sharp" },
  { key: "transitionSpeed", label: "Transition", low: "lazy", high: "fast" },
  { key: "rearGrip", label: "Rear grip", low: "low", high: "high" },
  { key: "throttleAggression", label: "Throttle", low: "smooth", high: "punchy" },
  { key: "gyroStrength", label: "Gyro", low: "low", high: "high" }
];

export function tuneDisplayName(tune: Pick<Tune, "name">) {
  return tune.name.trim() || "Untitled tune";
}

export function feelForTune(tune: Tune): TuneFeelProfile {
  const source = tune.expectedFeel ?? {};
  return { ...defaultFeelProfile, ...source };
}

export function valueText(tune: Tune, fieldId: string) {
  const value = tune.values[fieldId] ?? tune.selections[fieldId] ?? "";
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
    tune.surface,
    valueText(tune, "tires"),
    valueText(tune, "frontCamber") ? `F camber ${valueText(tune, "frontCamber")}` : "",
    valueText(tune, "rearToe") ? `R toe ${valueText(tune, "rearToe")}` : "",
    valueText(tune, "motorPosition") ? `Motor ${valueText(tune, "motorPosition")}` : "",
    valueText(tune, "gyroGain") ? `Gyro ${valueText(tune, "gyroGain")}` : "",
    valueText(tune, "escProfileName") || valueText(tune, "escModel")
  ];
  return Array.from(new Set(chips.filter(Boolean).map((chip) => String(chip)))).slice(0, 8);
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

