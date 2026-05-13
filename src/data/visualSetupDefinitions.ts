import type { Tune, TuneVisualSetupSource } from "../types";

export type VisualSetupPartCategory = "frontToeBlocks" | "rearToeBlocks";

export interface VisualSetupOption {
  id: string;
  label: string;
  x: number;
  y: number;
  helper?: string;
}

export interface VisualSetupSlot {
  id: string;
  label: string;
  fieldId: string;
}

export interface VisualSetupDefinition {
  id: string;
  version: number;
  brand: string;
  brandSlug: string;
  partCategory: VisualSetupPartCategory;
  displayName: string;
  source: TuneVisualSetupSource;
  sourceLabel: string;
  verified: boolean;
  helper: string;
  options: VisualSetupOption[];
  slots: VisualSetupSlot[];
}

export interface SuspensionMountVisualRequest {
  helperId: "ffToeBlock" | "frToeBlock" | "rfToeBlock" | "rrToeBlock";
  label: string;
  partCategory: VisualSetupPartCategory;
  partBrand?: string;
  chassisBrand?: string;
  tune?: Tune;
}

const slotLabelsByHelper: Record<SuspensionMountVisualRequest["helperId"], [string, string]> = {
  ffToeBlock: ["FF left insert", "FF right insert"],
  frToeBlock: ["FR left insert", "FR right insert"],
  rfToeBlock: ["RF left insert", "RF right insert"],
  rrToeBlock: ["RR left insert", "RR right insert"]
};

const yokomoOptions: VisualSetupOption[] = [1, 2, 3, 4, 5].flatMap((position, index) => [
  { id: `${position}-in`, label: `${position} In`, x: 34, y: 23 + index * 12, helper: "Moves the insert toward the inside reference." },
  { id: `${position}-out`, label: `${position} Out`, x: 66, y: 23 + index * 12, helper: "Moves the insert toward the outside reference." }
]);

const reveDOptions: VisualSetupOption[] = ["A", "B", "C", "D", "E"].flatMap((position, index) => [
  { id: `${position.toLowerCase()}-in`, label: `${position} In`, x: 34, y: 23 + index * 12, helper: "Reve D-style insert orientation, user-provided convention." },
  { id: `${position.toLowerCase()}-out`, label: `${position} Out`, x: 66, y: 23 + index * 12, helper: "Reve D-style insert orientation, user-provided convention." }
]);

const genericOptions: VisualSetupOption[] = ["Inner", "Center", "Outer"].flatMap((position, index) => [
  { id: `${position.toLowerCase()}-in`, label: `${position} In`, x: 34, y: 29 + index * 18, helper: "Generic fallback until the exact mount diagram is mapped." },
  { id: `${position.toLowerCase()}-out`, label: `${position} Out`, x: 66, y: 29 + index * 18, helper: "Generic fallback until the exact mount diagram is mapped." }
]);

function slotsFor(helperId: SuspensionMountVisualRequest["helperId"]): VisualSetupSlot[] {
  const labels = slotLabelsByHelper[helperId];
  return [
    { id: "left", label: labels[0], fieldId: `${helperId}LeftInsert` },
    { id: "right", label: labels[1], fieldId: `${helperId}RightInsert` }
  ];
}

function definitionFor(
  request: SuspensionMountVisualRequest,
  brand: string,
  brandSlug: string,
  source: TuneVisualSetupSource,
  sourceLabel: string,
  verified: boolean,
  options: VisualSetupOption[]
): VisualSetupDefinition {
  return {
    id: `${request.helperId}-${brandSlug}-suspension-mount`,
    version: 1,
    brand,
    brandSlug,
    partCategory: request.partCategory,
    displayName: `${request.label} visual setup`,
    source,
    sourceLabel,
    verified,
    helper: source === "generic"
      ? "Exact mount visual is not mapped yet. Use this fallback to save a clear insert position."
      : "Tap each insert position. The visual highlight and saved text stay synchronized.",
    options,
    slots: slotsFor(request.helperId)
  };
}

function normalizedBrand(...values: Array<unknown>) {
  return values
    .map((value) => String(value ?? "").toLowerCase())
    .find(Boolean) ?? "";
}

export function resolveSuspensionMountVisualDefinition(request: SuspensionMountVisualRequest): VisualSetupDefinition {
  const tune = request.tune;
  const brandText = normalizedBrand(
    request.partBrand,
    request.chassisBrand,
    tune?.values[`${request.helperId}Brand`],
    tune?.chassisBrand,
    tune?.customChassisBrand,
    tune?.chassisSetup?.chassis?.brand
  );

  if (brandText.includes("yokomo")) {
    return definitionFor(
      request,
      "Yokomo",
      "yokomo",
      "brand-specific",
      "Yokomo toe/suspension mount chart convention",
      true,
      yokomoOptions
    );
  }

  if (brandText.includes("reve") || brandText.includes("reved")) {
    return definitionFor(
      request,
      "Reve D",
      "reve-d",
      "user-provided",
      "A-E In/Out convention supplied for RC Drift Sync Phase 1",
      false,
      reveDOptions
    );
  }

  return definitionFor(
    request,
    request.partBrand || request.chassisBrand || "Generic",
    "generic",
    "generic",
    "Generic suspension mount fallback",
    false,
    genericOptions
  );
}

export function visualSetupSummaryValues(tune: Pick<Tune, "values">) {
  return [
    tune.values.ffToeBlockLeftInsert,
    tune.values.ffToeBlockRightInsert,
    tune.values.frToeBlockLeftInsert,
    tune.values.frToeBlockRightInsert,
    tune.values.rfToeBlockLeftInsert,
    tune.values.rfToeBlockRightInsert,
    tune.values.rrToeBlockLeftInsert,
    tune.values.rrToeBlockRightInsert
  ]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
}
