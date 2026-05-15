import { CarFront, Check, ChevronDown, CircleDot, CircuitBoard, ClipboardCheck, CopyPlus, Download, Eye, FileText, ImagePlus, Lightbulb, MapPinned, MoreHorizontal, Plus, Save, Share2, SlidersHorizontal, Trash2, Wrench } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { BASIC_CUSTOM_OPTION, basicTuneOptions } from "../data/basicTuneOptions";
import { chassisBrands, chassisInfoFromTune, findChassisBrand, modelsForBrand, slugifyChassis } from "../data/chassisBrands";
import { findElectronicsSchema, findElectronicsSchemaForProduct, type ElectronicsSchemaField } from "../data/electronicsSchemas";
import { catalogOptionDescription, catalogOptionLabel, filterProductCatalog, getProductCatalog, type ProductCatalogCategory, type ProductCatalogItem } from "../features/catalog";
import { electronicsItemFromPart, findPartBySlug, matchKnownPart, partLabel, partsByCategory, type RcPart } from "../data/rcParts";
import { resolveSuspensionMountVisualDefinition, type SuspensionMountVisualRequest, type VisualSetupDefinition, type VisualSetupOption, type VisualSetupSlot } from "../data/visualSetupDefinitions";
import type { Car, ElectronicsCategory, ElectronicsProfile, SetupAssistantEntry, Tune, TuneElectronicsItem, TunePhoto } from "../types";
import { absoluteShareUrl } from "../config/domain";
import { snapshotTune } from "../utils/changes";
import { displayPhotoUrl, photoFromFile, photoStorageStatusLabel } from "../utils/photoStorage";
import { syncTuneSharedModel } from "../utils/sharedTuneModel";
import { downloadUniversalTunePdf, generateUniversalTunePdf } from "../utils/universalPdfExport";
import { formatFormLabel } from "../utils/formLabels";
import { PhotosTab } from "./PhotosTab";
import { BrandBadge, BrandLogo } from "./BrandIdentity";
import { PhotoLightbox } from "./PhotoLightbox";
import { PartSelector, type PartSelectorValue } from "./PartSelector";
import { BasicTuneSummary, FeelEditor, TuneTimeline, TuneVisualSummary } from "./TuneVisuals";
import { ConfirmDialog, EmptyState, SelectField, TextAreaField, TextField } from "./UiPrimitives";
import { VisualSetupHelper } from "./VisualSetupHelper";

import {
  allBuilderFields,
  armDamperHoleOptions,
  basicFieldIds,
  builderTabs,
  calculateFinalDriveRatio,
  ddssHoleOptions,
  guidedSteps,
  ifsMountOptions,
  quickStepIds,
  quickTuneTabIds,
  rearHubCarrierHoleOptions,
  shockTowerHoleOptions,
  slideRackPositionOptions,
  steeringMountHoleOptions,
  suggestedInternalRatio,
  tuneDisplayName,
  universalSections,
  type BuilderTabId,
  type BuilderValue,
  type ElectronicsSettingValue,
  type PitlanePage,
  type PitlaneProductTab,
  type ProfiledElectronicsCategory,
  type SetupMode,
  type StartingPoint,
  type UniversalField,
  type UniversalSection,
  type UniversalTuneBuilderProps
} from "../features/tune-builder/builderConfig";

const assistantSurfaces = ["Not sure", "Plastic tile", "Carpet", "Asphalt", "Colored concrete", "Concrete", "Other"];
const assistantGripLevels = ["Not sure", "Low", "Low to medium", "Medium", "High", "Very high"];
const assistantResults: Array<{ id: NonNullable<SetupAssistantEntry["result"]>; label: string }> = [
  { id: "better", label: "Felt better" },
  { id: "worse", label: "Felt worse" },
  { id: "no-change", label: "No change" }
];

const assistantSuggestions: Record<string, { label: string; areas: string[]; explanation: string; starterChange: string }> = {
  spinsOut: {
    label: "Spins out",
    areas: ["Rear grip", "Gyro gain", "Throttle curve", "Rear toe", "Diff setting", "Weight balance"],
    explanation: "The rear may be letting go before the car settles. Try one small rear-grip or throttle change first, then drive a few laps before changing anything else.",
    starterChange: "Try a small rear grip or throttle smoothing change."
  },
  pushesWide: {
    label: "Pushes wide",
    areas: ["Front tire", "Front camber", "Caster", "Ackerman", "Front shock / spring", "Steering endpoints"],
    explanation: "The front may not be giving enough steering bite. Start by checking tire, steering travel, and front geometry before making big rear changes.",
    starterChange: "Check front tire and steering endpoint, then test one front setup change."
  },
  tooTwitchy: {
    label: "Too twitchy",
    areas: ["Gyro gain", "Steering expo", "Servo speed", "Front grip", "Caster", "Ackerman"],
    explanation: "The steering may be reacting faster than the car can settle. A calmer gyro, radio expo, or servo setting can make the car easier to catch.",
    starterChange: "Soften steering feel with a small gyro, expo, or servo speed change."
  },
  slowTransition: {
    label: "Slow transition",
    areas: ["Servo speed", "Gyro gain", "Front grip", "Rear grip", "Weight balance", "Radio steering rate"],
    explanation: "The car may need a little more steering response or a little less rear hold. Try a small steering response change before moving weight around.",
    starterChange: "Try a small steering response change and note if transitions wake up."
  },
  notEnoughAngle: {
    label: "Not enough angle",
    areas: ["Steering endpoints", "Knuckle / stopper", "Gyro endpoint", "Front tire grip", "Ackerman", "Caster"],
    explanation: "Start by checking that the steering can physically reach enough lock without binding. Then tune front grip and steering geometry.",
    starterChange: "Check steering lock and binding before changing geometry."
  },
  notEnoughForwardDrive: {
    label: "Not enough forward drive",
    areas: ["Rear tire", "Diff setting", "ESC throttle curve", "Boost / turbo", "Rear toe", "Weight balance"],
    explanation: "The car may not be converting throttle into drive. Try one rear grip, diff, or ESC throttle change and compare exit speed.",
    starterChange: "Try a small rear grip, diff, or throttle curve change."
  },
  tooMuchRearGrip: {
    label: "Too much rear grip",
    areas: ["Rear tire", "Rear toe", "Rear spring / shock", "Weight location", "Diff setting", "ESC punch"],
    explanation: "Too much rear hold can make the car lazy or hard to rotate. Try one small change that frees the rear without making it snappy.",
    starterChange: "Try one change to free up the rear and log whether rotation improves."
  },
  notEnoughRearGrip: {
    label: "Not enough rear grip",
    areas: ["Rear tire", "Rear toe", "Rear camber", "Rear shock / spring", "Diff setting", "Battery / weight position"],
    explanation: "The rear may need more support or contact patch. Start with tire, toe, camber, or a small weight balance check.",
    starterChange: "Try one rear grip change and watch if exits become easier."
  },
  gyroWobble: {
    label: "Gyro wobble",
    areas: ["Gyro gain", "Servo speed", "Steering endpoints", "Steering binding", "Front tire grip"],
    explanation: "Wobble often comes from the steering system fighting itself. Check for binding first, then try a small gyro or servo setting change.",
    starterChange: "Check steering binding, then lower gyro gain slightly if needed."
  },
  inconsistentFeel: {
    label: "Inconsistent feel",
    areas: ["Tire wear", "Battery voltage", "Steering trim", "Diff consistency", "Loose hardware", "Track grip changes"],
    explanation: "If the car changes lap to lap, check the simple repeatability items first: tires, battery, trim, loose parts, and surface changes.",
    starterChange: "Check repeatability items before changing setup."
  },
  snapsTransition: {
    label: "Car snaps during transition",
    areas: ["Gyro gain", "Rear grip", "Throttle curve", "Servo speed", "Weight balance", "Rear shock"],
    explanation: "The car may be rotating too abruptly as weight moves side to side. Try a smoother steering, gyro, throttle, or rear grip change.",
    starterChange: "Try one smoothing change and test several transitions."
  },
  feelsLazy: {
    label: "Car feels lazy",
    areas: ["Servo speed", "Gyro gain", "Front tire", "Rear grip", "Weight placement", "ESC punch"],
    explanation: "Lazy feel can come from slow steering response or too much rear stability. Try one response change and avoid stacking changes.",
    starterChange: "Try a small response change and log whether the car wakes up."
  },
  lacksSteering: {
    label: "Car lacks steering",
    areas: ["Front tire", "Steering endpoints", "Front camber", "Caster", "Ackerman", "Front shock / spring"],
    explanation: "The front may need more usable bite or travel. Check steering lock and front tire first, then tune front geometry.",
    starterChange: "Check front tire and steering travel, then test one front change."
  },
  overRotates: {
    label: "Car over-rotates",
    areas: ["Rear grip", "Gyro gain", "Throttle curve", "Rear toe", "Weight balance", "Diff setting"],
    explanation: "The car may be rotating faster than you can catch it. Try a small stability or throttle smoothing change.",
    starterChange: "Try one stabilizing change and compare entry control."
  }
};

function fieldValue(tune: Tune, field: UniversalField) {
  if (field.meta) {
    const value = tune[field.meta];
    return Array.isArray(value) ? value.join(", ") : value ?? "";
  }
  const sharedValues: Record<string, unknown> = {
    frontDamperBrand: tune.chassisSetup?.front?.dampers?.brand,
    frontDamper: tune.chassisSetup?.front?.dampers?.model,
    frontSpringBrand: tune.chassisSetup?.front?.spring?.brand,
    frontSpring: tune.chassisSetup?.front?.spring?.model,
    frontKnuckle: tune.chassisSetup?.front?.knuckle?.model,
    frontAxle: tune.chassisSetup?.front?.axle?.model,
    frontWheelBrand: tune.chassisSetup?.front?.wheel?.brand,
    frontLowerArm: tune.chassisSetup?.front?.lowerArm?.model,
    frontLowerArmShims: tune.chassisSetup?.front?.lowerArm?.shims,
    frontToeBlock: tune.chassisSetup?.front?.toeBlock?.model,
    ffToeBlock: tune.chassisSetup?.front?.toeBlock?.model,
    frToeBlock: tune.chassisSetup?.front?.toeBlock?.model,
    rearDamperBrand: tune.chassisSetup?.rear?.dampers?.brand,
    rearDamper: tune.chassisSetup?.rear?.dampers?.model,
    rearLowerArm: tune.chassisSetup?.rear?.lowerArm?.model,
    rearLowerArmShims: tune.chassisSetup?.rear?.lowerArm?.shims,
    rearLowerArmSide: tune.chassisSetup?.rear?.lowerArm?.side,
    rearShockMountingNotes: tune.chassisSetup?.rear?.dampers?.notes,
    rearHubCarrier: tune.chassisSetup?.rear?.hubCarrier?.model,
    rearAxleLength: tune.chassisSetup?.rear?.axle?.length,
    rearWheelBrand: tune.chassisSetup?.rear?.wheel?.brand,
    rearToeBlock: tune.chassisSetup?.rear?.toeBlock?.model,
    rfToeBlock: tune.chassisSetup?.rear?.toeBlock?.model,
    rrToeBlock: tune.chassisSetup?.rear?.toeBlock?.model,
    escBrand: tune.electronics?.esc?.brand,
    escModel: tune.electronics?.esc?.model || tune.electronics?.esc?.customName,
    escProfileName: tune.electronics?.esc?.selectedProfileId,
    servoBrand: tune.electronics?.servo?.brand,
    servoModel: tune.electronics?.servo?.model || tune.electronics?.servo?.customName,
    servoProfileName: tune.electronics?.servo?.selectedProfileId,
    gyroBrand: tune.electronics?.gyro?.brand,
    gyroModel: tune.electronics?.gyro?.model || tune.electronics?.gyro?.customName,
    gyroProfileName: tune.electronics?.gyro?.selectedProfileId,
    motorBrand: tune.electronics?.motor?.brand,
    motorModel: tune.electronics?.motor?.model || tune.electronics?.motor?.customName,
    gyroGain: tune.electronics?.gyro?.gain ?? tune.electronics?.gyro?.settings?.gain,
    gyroMode: tune.electronics?.gyro?.mode ?? tune.electronics?.gyro?.settings?.mode,
    motor: tune.electronics?.motor?.model || tune.electronics?.motor?.customName,
    motorTiming: tune.electronics?.motor?.timing
  };
  const directValue = tune.values[field.id];
  if (directValue !== undefined) return Array.isArray(directValue) ? directValue.join(", ") : directValue;
  const sharedValue = sharedValues[field.id];
  if (sharedValue !== undefined && sharedValue !== "") return Array.isArray(sharedValue) ? sharedValue.join(", ") : sharedValue;
  return "";
}

function patchSharedSetupValue(tune: Tune, fieldId: string, value: BuilderValue): Tune {
  const stringValue = String(value ?? "");
  const chassisSetup = {
    ...(tune.chassisSetup ?? {}),
    chassis: { ...(tune.chassisSetup?.chassis ?? {}) },
    front: {
      ...(tune.chassisSetup?.front ?? {}),
      dampers: { ...(tune.chassisSetup?.front?.dampers ?? {}) },
      spring: { ...(tune.chassisSetup?.front?.spring ?? {}) },
      knuckle: { ...(tune.chassisSetup?.front?.knuckle ?? {}) },
      axle: { ...(tune.chassisSetup?.front?.axle ?? {}) },
      wheel: { ...(tune.chassisSetup?.front?.wheel ?? {}) },
      lowerArm: { ...(tune.chassisSetup?.front?.lowerArm ?? {}) },
      toeBlock: { ...(tune.chassisSetup?.front?.toeBlock ?? {}) }
    },
    rear: {
      ...(tune.chassisSetup?.rear ?? {}),
      dampers: { ...(tune.chassisSetup?.rear?.dampers ?? {}) },
      lowerArm: { ...(tune.chassisSetup?.rear?.lowerArm ?? {}) },
      hubCarrier: { ...(tune.chassisSetup?.rear?.hubCarrier ?? {}) },
      axle: { ...(tune.chassisSetup?.rear?.axle ?? {}) },
      wheel: { ...(tune.chassisSetup?.rear?.wheel ?? {}) },
      toeBlock: { ...(tune.chassisSetup?.rear?.toeBlock ?? {}) }
    }
  };

  switch (fieldId) {
    case "chassisDeck":
    case "lowerDeck":
    case "chassisBrace":
      chassisSetup.chassis.deck = stringValue;
      break;
    case "frontDamperBrand":
      chassisSetup.front.dampers.brand = stringValue;
      break;
    case "frontShockStyle":
    case "frontDamper":
    case "frontDamperModel":
      chassisSetup.front.dampers.model = stringValue;
      break;
    case "frontShockOil":
      chassisSetup.front.dampers.notes = stringValue;
      break;
    case "frontShockPiston":
    case "frontPiston":
      chassisSetup.front.dampers.notes = stringValue;
      break;
    case "frontShockShaft":
      chassisSetup.front.dampers.notes = stringValue;
      break;
    case "frontSpringBrand":
      chassisSetup.front.spring.brand = stringValue;
      break;
    case "frontSpring":
      chassisSetup.front.spring.model = stringValue;
      break;
    case "frontSpringRate":
      chassisSetup.front.spring.rate = stringValue;
      break;
    case "frontSpringLength":
      chassisSetup.front.spring.length = stringValue;
      break;
    case "frontKnuckleBrand":
      chassisSetup.front.knuckle.brand = stringValue;
      break;
    case "frontKnuckle":
      chassisSetup.front.knuckle.model = stringValue;
      break;
    case "frontAxleBrand":
      chassisSetup.front.axle.brand = stringValue;
      break;
    case "frontAxle":
      chassisSetup.front.axle.model = stringValue;
      break;
    case "frontAxleLength":
      chassisSetup.front.axle.length = stringValue;
      break;
    case "frontWheelBrand":
      chassisSetup.front.wheel.brand = stringValue;
      break;
    case "frontWheel":
    case "wheelModel":
      chassisSetup.front.wheel.model = stringValue;
      break;
    case "frontWheelOffset":
      chassisSetup.front.wheel.offset = stringValue;
      break;
    case "frontWheelWidth":
      chassisSetup.front.wheel.width = stringValue;
      break;
    case "frontLowerArmBrand":
      chassisSetup.front.lowerArm.brand = stringValue;
      break;
    case "frontLowerArm":
      chassisSetup.front.lowerArm.model = stringValue;
      break;
    case "frontLowerArmShims":
    case "frontSpacerNotes":
      chassisSetup.front.lowerArm.shims = stringValue;
      break;
    case "frontToeBlockBrand":
    case "ffToeBlockBrand":
    case "frToeBlockBrand":
      chassisSetup.front.toeBlock.brand = stringValue;
      break;
    case "frontToeBlock":
    case "ffToeBlock":
    case "frToeBlock":
      chassisSetup.front.toeBlock.model = stringValue;
      break;
    case "frontToe":
      chassisSetup.front.toeBlock.toeAngle = stringValue;
      break;
    case "rearDamperBrand":
      chassisSetup.rear.dampers.brand = stringValue;
      break;
    case "rearShockStyle":
    case "rearDamper":
    case "rearDamperModel":
      chassisSetup.rear.dampers.model = stringValue;
      break;
    case "rearShockOil":
      chassisSetup.rear.dampers.notes = stringValue;
      break;
    case "rearShockPiston":
    case "rearPiston":
      chassisSetup.rear.dampers.notes = stringValue;
      break;
    case "rearShockShaft":
    case "rearShockMountingNotes":
      chassisSetup.rear.dampers.notes = stringValue;
      break;
    case "rearLowerArmBrand":
      chassisSetup.rear.lowerArm.brand = stringValue;
      break;
    case "rearLowerArm":
      chassisSetup.rear.lowerArm.model = stringValue;
      break;
    case "rearLowerArmShims":
    case "rearSpacerNotes":
      chassisSetup.rear.lowerArm.shims = stringValue;
      break;
    case "rearLowerArmSide":
      chassisSetup.rear.lowerArm.side = stringValue;
      break;
    case "rearHubCarrierBrand":
      chassisSetup.rear.hubCarrier.brand = stringValue;
      break;
    case "rearHubCarrier":
      chassisSetup.rear.hubCarrier.model = stringValue;
      break;
    case "rearAxleBrand":
      chassisSetup.rear.axle.brand = stringValue;
      break;
    case "rearAxle":
    case "rearAxleType":
      chassisSetup.rear.axle.model = stringValue;
      break;
    case "rearAxleLength":
      chassisSetup.rear.axle.length = stringValue;
      break;
    case "rearWheelBrand":
      chassisSetup.rear.wheel.brand = stringValue;
      break;
    case "rearWheel":
      chassisSetup.rear.wheel.model = stringValue;
      break;
    case "rearWheelOffset":
      chassisSetup.rear.wheel.offset = stringValue;
      break;
    case "rearWheelWidth":
      chassisSetup.rear.wheel.width = stringValue;
      break;
    case "rearToeBlockBrand":
    case "rfToeBlockBrand":
    case "rrToeBlockBrand":
      chassisSetup.rear.toeBlock.brand = stringValue;
      break;
    case "rearToeBlock":
    case "toeBlockSuspensionMount":
    case "rfToeBlock":
    case "rrToeBlock":
      chassisSetup.rear.toeBlock.model = stringValue;
      break;
    case "rearToe":
      chassisSetup.rear.toeBlock.toeAngle = stringValue;
      break;
    default:
      return tune;
  }

  return { ...tune, chassisSetup };
}

function completedFieldCount(tune: Tune | null, fields = allBuilderFields) {
  if (!tune) return 0;
  return fields.filter((field) => {
    const value = fieldValue(tune, field);
    if (Array.isArray(value)) return value.length > 0;
    return String(value ?? "").trim().length > 0;
  }).length;
}

function recentlyUsedValues(tunes: Tune[], fieldId: string) {
  return Array.from(
    new Set(
      tunes
        .map((tune) => tune.values[fieldId])
        .filter((value): value is string | number => typeof value === "string" || typeof value === "number")
        .map(String)
        .filter(Boolean)
    )
  ).slice(0, 4);
}

export function UniversalTuneBuilder({
  cars,
  tunes,
  activeTune,
  electronicsProfiles,
  onCreateTune,
  onUpdateTune,
  onSaveTune,
  onSaveElectronicsProfile,
  onDeleteTune,
  onDuplicateTune,
  onSelectTune,
  onViewTune,
  dirty
}: UniversalTuneBuilderProps) {
  const [carId, setCarId] = useState(cars[0]?.id ?? "");
  const selectedCar = cars.find((car) => car.id === carId) ?? cars[0];
  const officialSupported = false;
  const [setupMode, setSetupMode] = useState<SetupMode>("universal");
  const [startingPoint, setStartingPoint] = useState<StartingPoint>("blank");
  const [sourceTuneId, setSourceTuneId] = useState("");
  const [openSection, setOpenSection] = useState(universalSections[0].id);
  const [activeStepId, setActiveStepId] = useState(guidedSteps[0].id);
  const [activeTabId, setActiveTabId] = useState<BuilderTabId>("chassis");
  const [builderMode, setBuilderMode] = useState<"basic" | "advanced">("basic");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [manualSaveBusy, setManualSaveBusy] = useState(false);
  const [pitlaneBrowser, setPitlaneBrowser] = useState<{ tab: PitlaneProductTab; source: "electronics" | "tires" } | null>(null);
  const [pitlanePage, setPitlanePage] = useState<PitlanePage>("menu");
  const [pitlanePhotoManagerOpen, setPitlanePhotoManagerOpen] = useState(false);
  const [pitlanePhotoToRemove, setPitlanePhotoToRemove] = useState<TunePhoto | null>(null);
  const carTunes = tunes.filter((tune) => tune.carId === carId);
  const modeFields = builderMode === "advanced" ? allBuilderFields : allBuilderFields.filter((field) => basicFieldIds.has(field.id));
  const completion = activeTune ? Math.round((completedFieldCount(activeTune, modeFields) / Math.max(1, modeFields.length)) * 100) : 0;
  const displayedSteps = builderMode === "advanced" ? guidedSteps : guidedSteps.filter((step) => quickStepIds.has(step.id));
  const visibleBuilderTabs = builderMode === "advanced" ? builderTabs : builderTabs.filter((tab) => quickTuneTabIds.has(tab.id));
  const activeStep = displayedSteps.find((step) => step.id === activeStepId) ?? displayedSteps[0] ?? guidedSteps[0];
  const activeTab = builderTabs.find((tab) => tab.id === activeTabId) ?? builderTabs[0];
  const activeSections = universalSections.filter((section) => {
    if (!activeTab.sectionIds.includes(section.id)) return false;
    if (builderMode === "advanced" || !activeTune) return true;
    return section.fields.some((field) => {
      const existing = fieldValue(activeTune, field);
      return basicFieldIds.has(field.id) || (existing !== undefined && String(existing).trim() !== "");
    });
  });

  useEffect(() => {
    if (!selectedCar) return;
    const handle = window.setTimeout(() => setSetupMode("universal"), 0);
    return () => window.clearTimeout(handle);
  }, [officialSupported, selectedCar]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setActiveStepId(guidedSteps[0].id);
      setActiveTabId("chassis");
      setOpenSection(universalSections[0].id);
      setPitlanePage("menu");
      setPitlanePhotoManagerOpen(false);
      setPitlanePhotoToRemove(null);
    }, 0);
    return () => window.clearTimeout(handle);
  }, [activeTune?.id]);

  useEffect(() => {
    if (displayedSteps.some((step) => step.id === activeStepId)) return;
    const fallback = displayedSteps[0] ?? guidedSteps[0];
    const handle = window.setTimeout(() => {
      setActiveStepId(fallback.id);
      setOpenSection(fallback.sectionIds[0] ?? fallback.id);
    }, 0);
    return () => window.clearTimeout(handle);
  }, [activeStepId, displayedSteps]);

  useEffect(() => {
    if (visibleBuilderTabs.some((tab) => tab.id === activeTabId)) return;
    const fallback = activeTabId === "electronics" || activeTabId === "tires" || activeTabId === "track" || activeTabId === "feel" ? "chassis" : "notes";
    const handle = window.setTimeout(() => goToTab(fallback), 0);
    return () => window.clearTimeout(handle);
  }, [activeTabId, visibleBuilderTabs]);

  async function saveWithConfirmation() {
    if (!activeTune || manualSaveBusy) return;
    setManualSaveBusy(true);
    setSaveError("");
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      setSaveError("Saving is taking longer than expected. Your edits are still on this screen. Check your connection and tap Finish again.");
      setManualSaveBusy(false);
    }, 12000);
    try {
      const saved = await Promise.resolve(onSaveTune());
      if (saved === false) {
        setSaveError("Save failed. Your edits are still on this screen. Check the account sync message and try again.");
        return;
      }
      if (!timedOut) setSaveConfirmOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Save failed. Please try again.";
      setSaveError(message);
    } finally {
      window.clearTimeout(timeoutId);
      if (!timedOut) setManualSaveBusy(false);
    }
  }

  useEffect(() => () => {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
  }, [pdfPreviewUrl]);

  function updateField(field: UniversalField, value: BuilderValue) {
    if (!activeTune) return;
    const next: Tune = {
      ...activeTune,
      updatedAt: new Date().toISOString()
    };

    if (field.meta === "tags" || field.meta === "setupIntent" || field.meta === "bestForTags") {
      const list = String(value)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      if (field.meta === "tags") next.tags = list;
      else (next as unknown as Record<string, BuilderValue>)[field.meta] = list;
    } else if (field.meta) {
      (next as unknown as Record<string, BuilderValue>)[field.meta] = value;
    } else {
      next.values = { ...next.values, [field.id]: value };
      Object.assign(next, patchSharedSetupValue(next, field.id, value));
      if (typeof value === "string") next.selections = { ...next.selections, [field.id]: value };
    }

    onUpdateTune(syncTuneSharedModel(next, selectedCar));
  }

  function updatePartField(field: UniversalField, part: RcPart | null, customName = "") {
    if (!activeTune) return;
    const brand = part?.brand ?? "";
    const model = part?.model ?? customName;
    const existingElectronics = field.electronicsKey ? activeTune.electronics?.[field.electronicsKey] : undefined;
    const electronicsPatch = field.electronicsKey ? electronicsCarryoverFor(field.electronicsKey, activeTune, existingElectronics) : {};
    const nextValues = {
      ...activeTune.values,
      [field.id]: model,
      [`${field.id}Slug`]: part?.slug ?? (model ? slugifyChassis(model) : ""),
      [`${field.id}CatalogItemId`]: part?.slug ?? "",
      [`${field.id}PartNumber`]: "",
      [`${field.id}CustomName`]: customName,
      [`${field.id}IsCustom`]: Boolean(customName && !part),
      ...(field.brandFieldId ? { [field.brandFieldId]: brand } : {}),
      ...(field.brandFieldId ? { [`${field.brandFieldId}Slug`]: brand ? slugifyChassis(brand) : "" } : {}),
      ...(field.modelFieldId ? { [field.modelFieldId]: model } : {})
    };
    const nextSelections = { ...activeTune.selections, [field.id]: part?.slug ?? customName };
    const next = {
      ...activeTune,
      values: nextValues,
      selections: nextSelections,
      electronics: field.electronicsKey
        ? {
            ...(activeTune.electronics ?? {}),
            [field.electronicsKey]: part
              ? { ...electronicsItemFromPart(part, existingElectronics), ...electronicsPatch }
              : {
                  brand,
                  model,
                  slug: "",
                  customName,
                  settings: existingElectronics?.settings ?? {},
                  notes: existingElectronics?.notes ?? "",
                  ...electronicsPatch
                }
          }
        : activeTune.electronics,
      updatedAt: new Date().toISOString()
    };
    onUpdateTune(syncTuneSharedModel(next, selectedCar));
  }

  function updateElectronicsSetting(category: ElectronicsCategory, key: string, value: ElectronicsSettingValue) {
    if (!activeTune) return;
    const current = activeTune.electronics?.[category] ?? {
      brand: "",
      model: "",
      slug: "",
      settings: {},
      notes: ""
    };
    const next = {
      ...activeTune,
      electronics: {
        ...(activeTune.electronics ?? {}),
        [category]: {
          ...current,
          settings: {
            ...(current.settings ?? {}),
            [key]: value
          }
        }
      },
      values: {
        ...activeTune.values,
        [`${category}_${key}`]: value
      },
      updatedAt: new Date().toISOString()
    };
    onUpdateTune(syncTuneSharedModel(next, selectedCar));
  }

  function applyElectronicsProfile(profileId: string) {
    if (!activeTune || !profileId) return;
    const profile = electronicsProfiles.find((item) => item.id === profileId);
    if (!profile) return;
    const category = profile.type as ProfiledElectronicsCategory;
    const current = activeTune.electronics?.[category] ?? { brand: "", model: "", settings: {}, notes: "" };
    onUpdateTune(syncTuneSharedModel({
      ...activeTune,
      values: { ...activeTune.values, ...profile.values, [`${profile.type}ProfileId`]: profile.id, [`${profile.type}ProfileName`]: profile.name },
      electronics: {
        ...(activeTune.electronics ?? {}),
        [category]: {
          ...current,
          selectedProfileId: profile.id,
          profileSnapshot: electronicsProfileSnapshot(profile),
          settings: { ...(current.settings ?? {}), ...profile.values }
        }
      },
      updatedAt: new Date().toISOString()
    }, selectedCar));
  }

  function saveElectronicsProfile(section: UniversalSection) {
    if (!activeTune || !section.profileType) return;
    const profileNameField = `${section.profileType}ProfileName`;
    const fallbackName = `${section.title} Profile`;
    const name = String(activeTune.values[profileNameField] || activeTune.values[section.fields.find((field) => field.id.endsWith("ProfileName"))?.id ?? ""] || fallbackName);
    const values = Object.fromEntries(section.fields.map((field) => [field.id, activeTune.values[field.id]]).filter(([, value]) => value !== undefined && String(value).trim() !== ""));
    onSaveElectronicsProfile({
      id: `electronics-${section.profileType}-${activeTune.id}-${section.id}`,
      type: section.profileType,
      name,
      values,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  function deleteActiveTune() {
    if (!activeTune) return;
    setDeleteError("");
    setDeleteConfirmOpen(true);
  }

  function updateShareSettings(patch: Partial<Tune>) {
    if (!activeTune) return;
    onUpdateTune({ ...activeTune, ...patch, updatedAt: new Date().toISOString() });
  }

  function updateChassisPatch(patch: Partial<Tune>) {
    if (!activeTune) return;
    onUpdateTune({ ...activeTune, ...patch, updatedAt: new Date().toISOString() });
  }

  function goToTab(tabId: BuilderTabId) {
    const tab = builderTabs.find((item) => item.id === tabId) ?? builderTabs[0];
    setActiveTabId(tab.id);
    setActiveStepId(tab.stepId);
    setOpenSection(tab.sectionIds[0] ?? tab.id);
    if (tab.id === "pdf") setPreviewOpen(true);
  }

  function switchBuilderMode(mode: "basic" | "advanced") {
    setBuilderMode(mode);
    if (mode === "basic" && !quickTuneTabIds.has(activeTabId)) {
      goToTab(activeTabId === "electronics" || activeTabId === "tires" || activeTabId === "track" || activeTabId === "feel" ? "chassis" : "notes");
    }
  }

  function openPitlanePage(page: Exclude<PitlanePage, "menu">) {
    setPitlanePage(page);
    setPitlanePhotoManagerOpen(false);
    const firstTabByPage: Record<Exclude<PitlanePage, "menu">, BuilderTabId> = {
      chassis: "chassis",
      surface: "track",
      parts: "front",
      geometry: "geometry",
      electronics: "electronics",
      tires: "tires"
    };
    goToTab(firstTabByPage[page]);
  }

  function removePitlanePhoto(photoId: string) {
    if (!activeTune) return;
    onUpdateTune({
      ...activeTune,
      photos: activeTune.photos.filter((photo) => photo.id !== photoId),
      updatedAt: new Date().toISOString()
    });
  }

  function applyPitlaneProduct(item: ProductCatalogItem) {
    if (!activeTune) return;
    const productName = catalogOptionLabel(item);
    const next: Tune = {
      ...activeTune,
      values: { ...activeTune.values },
      selections: { ...activeTune.selections },
      electronics: { ...(activeTune.electronics ?? {}) },
      updatedAt: new Date().toISOString()
    };
    const productPatch = {
      brand: item.brand,
      model: productName,
      slug: item.id,
      partNumber: item.partNumber || item.modelNumber,
      imageUrl: item.imageUrl,
      settings: {},
      notes: ""
    };
    if (item.category === "motors") {
      next.electronics = { ...(next.electronics ?? {}), motor: { ...productPatch, turns: productName.match(/\d+(?:\.\d+)?T/i)?.[0] ?? "" } };
      next.values = { ...next.values, motorBrand: item.brand, motor: productName, motorModel: productName };
    } else if (item.category === "escs") {
      next.electronics = { ...(next.electronics ?? {}), esc: productPatch };
      next.values = { ...next.values, escBrand: item.brand, escModel: productName };
    } else if (item.category === "servos") {
      next.electronics = { ...(next.electronics ?? {}), servo: productPatch };
      next.values = { ...next.values, servoBrand: item.brand, servoModel: productName };
    } else if (item.category === "gyros") {
      next.electronics = { ...(next.electronics ?? {}), gyro: productPatch };
      next.values = { ...next.values, gyroBrand: item.brand, gyroModel: productName };
    } else if (item.category === "tires") {
      next.values = { ...next.values, tires: productName, tireBrand: item.brand, frontTire: productName, rearTire: productName };
      next.selections = { ...next.selections, tires: item.id };
    } else if (item.category === "frontWheels" || item.category === "rearWheels") {
      next.values = { ...next.values, frontWheelBrand: item.brand, rearWheelBrand: item.brand, frontWheel: productName, rearWheel: productName };
      next.selections = { ...next.selections, frontWheel: item.id, rearWheel: item.id };
    }
    onUpdateTune(syncTuneSharedModel(next, selectedCar));
    setPitlaneBrowser(null);
  }

  const quickTabIndex = visibleBuilderTabs.findIndex((tab) => tab.id === activeTabId);
  const previousQuickTab = quickTabIndex > 0 ? visibleBuilderTabs[quickTabIndex - 1] : undefined;
  const nextQuickTab = quickTabIndex >= 0 && quickTabIndex < visibleBuilderTabs.length - 1 ? visibleBuilderTabs[quickTabIndex + 1] : undefined;

  function fieldsForBuilderMode(section: UniversalSection) {
    if (!activeTune) return section.fields;
    if (builderMode === "advanced") return section.fields;
    return section.fields.filter((field) => {
      const existing = fieldValue(activeTune, field);
      return basicFieldIds.has(field.id) || (existing !== undefined && String(existing).trim() !== "");
    });
  }

  async function previewPdf() {
    if (!activeTune || !selectedCar) return;
    setPdfBusy(true);
    try {
      const bytes = await generateUniversalTunePdf(activeTune, selectedCar, { shareUrl: absoluteShareUrl(activeTune.shareId || activeTune.id) });
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
      const blob = new Blob([bytes.slice().buffer], { type: "application/pdf" });
      setPdfPreviewUrl(URL.createObjectURL(blob));
      setPreviewOpen(false);
    } finally {
      setPdfBusy(false);
    }
  }

  async function exportPdf() {
    if (!activeTune || !selectedCar) return;
    setPdfBusy(true);
    try {
      const saved = await Promise.resolve(onSaveTune());
      if (saved === false) return;
      await downloadUniversalTunePdf(activeTune, selectedCar, { shareUrl: absoluteShareUrl(activeTune.shareId || activeTune.id) });
    } finally {
      setPdfBusy(false);
    }
  }

  if (!cars.length) {
    return <EmptyState title="Add a car first" body="The Tune Builder needs a garage car before it can create a setup." />;
  }

  const shouldRenderPitlane = Boolean(activeTune);
  if (shouldRenderPitlane) {
    const pitlaneTune = activeTune as Tune;
    const pitlanePreviewPhotos = pitlaneTune.photos.slice(0, 10);
    const electronicsCount = [pitlaneTune.electronics?.motor?.model, pitlaneTune.electronics?.esc?.model, pitlaneTune.electronics?.servo?.model, pitlaneTune.electronics?.gyro?.model].filter(Boolean).length;
    const surfaceSummary = [pitlaneTune.track, pitlaneTune.surface].filter(Boolean).join(" / ") || "Set track and surface";
    const pitlanePageTitle: Record<PitlanePage, string> = {
      menu: builderMode === "basic" ? "Quick" : "Advanced",
      chassis: "Chassis",
      surface: "Surface",
      parts: "Parts",
      geometry: "Geometry",
      electronics: "Electronics",
      tires: "Tires / Wheels"
    };
    const pitlaneSectionOptions: Record<Exclude<PitlanePage, "menu">, Array<{ id: BuilderTabId; label: string }>> = {
      chassis: [
        { id: "chassis", label: "Identity" },
        { id: "photos", label: "Photos" },
        { id: "notes", label: "Notes / Share" }
      ],
      parts: [
        { id: "front", label: "Front" },
        { id: "rear", label: "Rear" },
        { id: "drivetrain", label: "Drivetrain" }
      ],
      surface: [{ id: "track", label: "Track" }],
      geometry: [{ id: "geometry", label: "Geometry" }],
      electronics: [
        { id: "electronics", label: "Motor" },
        { id: "esc", label: "ESC" },
        { id: "servo", label: "Servo" },
        { id: "gyro", label: "Gyro" },
        { id: "radio", label: "Radio" }
      ],
      tires: [{ id: "tires", label: "Tires / Wheels" }]
    };
    const currentPitlaneSections = pitlanePage === "menu" ? [] : pitlaneSectionOptions[pitlanePage];
    const bodyWeightSections = universalSections.filter((section) => section.id === "weight-body");
    const surfaceConditionOptions = ["", "Not sure", "Dusty", "Clean", "Cold", "Warm", "Fresh layout", "Grooved-in", "Competition day", "Practice day"];

    function renderSurfacePage() {
      return (
        <section className="pitlaneSubPageBody" aria-label="Surface setup">
          <article className="builderSectionCard basicTuneCard">
            <header><strong>Track and surface</strong><span>Save where this tune works, including the track name.</span></header>
            <div className="builderFieldGrid">
              <TextField label="Track name / location" value={pitlaneTune.track} placeholder="Track or location name" onChange={(event) => onUpdateTune({ ...pitlaneTune, track: event.target.value, values: { ...pitlaneTune.values, track: event.target.value }, updatedAt: new Date().toISOString() })} />
              <SelectField label="Surface" value={pitlaneTune.surface} onChange={(event) => onUpdateTune({ ...pitlaneTune, surface: event.target.value, values: { ...pitlaneTune.values, surface: event.target.value }, updatedAt: new Date().toISOString() })}>
                {["", BEGINNER_NOT_SURE_OPTION, "P-tile", "Carpet", "Asphalt", "Polished concrete", "Epoxy", "Painted concrete", "Smooth concrete", "Other / Custom"].map((surface) => <option key={surface} value={surface}>{surface || "Skip for now"}</option>)}
              </SelectField>
              <SelectField label="Grip level" value={pitlaneTune.grip} onChange={(event) => onUpdateTune({ ...pitlaneTune, grip: event.target.value, values: { ...pitlaneTune.values, grip: event.target.value }, updatedAt: new Date().toISOString() })}>
                {["", "Not sure", "Low", "Low-medium", "Medium", "High", "Very high"].map((grip) => <option key={grip} value={grip}>{grip || "Skip for now"}</option>)}
              </SelectField>
              <SelectField label="Track condition" value={pitlaneTune.trackConditionPreset ?? ""} onChange={(event) => onUpdateTune({ ...pitlaneTune, trackConditionPreset: event.target.value, values: { ...pitlaneTune.values, trackConditionPreset: event.target.value }, updatedAt: new Date().toISOString() })}>
                {surfaceConditionOptions.map((condition) => <option key={condition} value={condition}>{condition || "Skip for now"}</option>)}
              </SelectField>
              <TextField
                label="Best-for tags"
                value={(pitlaneTune.bestForTags ?? []).join(", ")}
                placeholder="P-tile, comp, low grip"
                onChange={(event) => onUpdateTune({ ...pitlaneTune, bestForTags: event.target.value.split(",").map((item) => item.trim()).filter(Boolean), updatedAt: new Date().toISOString() })}
              />
              <SelectField label="Rating" value={String(pitlaneTune.rating || "")} onChange={(event) => onUpdateTune({ ...pitlaneTune, rating: Number(event.target.value || 0), updatedAt: new Date().toISOString() })}>
                <option value="">No rating yet</option>
                {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
              </SelectField>
              <TextAreaField label="Surface notes" value={String(pitlaneTune.values.trackNotes ?? "")} placeholder="Track temp, dust, layout speed, tire notes..." onChange={(event) => onUpdateTune({ ...pitlaneTune, values: { ...pitlaneTune.values, trackNotes: event.target.value }, updatedAt: new Date().toISOString() })} />
            </div>
          </article>
        </section>
      );
    }

    function renderPitlaneSubPage() {
      if (pitlanePage === "surface") return renderSurfacePage();
      if (pitlanePage === "menu") return null;
      return (
        <section className={`pitlaneSubPageBody pitlaneSubPageBody-${pitlanePage}`} aria-label={`${pitlanePageTitle[pitlanePage]} setup`}>
          <div className="pitlaneSectionPicker" role="tablist" aria-label={`${pitlanePageTitle[pitlanePage]} sections`}>
            {currentPitlaneSections.map((section) => (
              <button key={section.id} className={activeTabId === section.id ? "active" : ""} type="button" role="tab" aria-selected={activeTabId === section.id} onClick={() => goToTab(section.id)}>
                {section.label}
              </button>
            ))}
          </div>
          <BasicTuneForm
            tune={pitlaneTune}
            car={selectedCar}
            activeTabId={activeTabId}
            electronicsProfiles={electronicsProfiles}
            onSaveElectronicsProfile={onSaveElectronicsProfile}
            onChange={(nextTune) => onUpdateTune(syncTuneSharedModel(nextTune, selectedCar))}
          />
          {builderMode === "advanced" ? (
            <>
              <AdvancedTuneDetails
                activeSections={activeSections}
                activeTune={pitlaneTune}
                tunes={tunes}
                electronicsProfiles={electronicsProfiles}
                openSection={openSection}
                onOpenSection={setOpenSection}
                onFieldChange={updateField}
                onPartChange={updatePartField}
                onElectronicsSettingChange={updateElectronicsSetting}
                onApplyElectronicsProfile={applyElectronicsProfile}
                onSaveElectronicsProfile={saveElectronicsProfile}
              />
              {pitlanePage === "chassis" ? (
                <AdvancedTuneDetails
                  activeSections={bodyWeightSections}
                  activeTune={pitlaneTune}
                  tunes={tunes}
                  electronicsProfiles={electronicsProfiles}
                  openSection={openSection}
                  onOpenSection={setOpenSection}
                  onFieldChange={updateField}
                  onPartChange={updatePartField}
                  onElectronicsSettingChange={updateElectronicsSetting}
                  onApplyElectronicsProfile={applyElectronicsProfile}
                  onSaveElectronicsProfile={saveElectronicsProfile}
                />
              ) : null}
            </>
          ) : null}
        </section>
      );
    }
    return (
      <main className={`pitlaneTuneExperience pitlanePage-${pitlanePage}`}>
        <header className="pitlaneTuneTopbar" aria-label="Tune Builder mode">
          <button className="pitlaneBackButton" type="button" onClick={() => pitlanePage === "menu" ? window.history.back() : setPitlanePage("menu")} aria-label={pitlanePage === "menu" ? "Back" : "Back to Tune Builder menu"}>
            <ChevronDown size={23} />
          </button>
          <div className="pitlaneTuneModeSwitch" role="tablist" aria-label="Tune mode">
            <button className={builderMode === "basic" ? "active" : ""} type="button" onClick={() => switchBuilderMode("basic")} role="tab" aria-selected={builderMode === "basic"}>
              Quick
            </button>
            <button className={builderMode === "advanced" ? "active" : ""} type="button" onClick={() => switchBuilderMode("advanced")} role="tab" aria-selected={builderMode === "advanced"}>
              Advanced
            </button>
          </div>
          <button className="pitlaneMoreButton" type="button" onClick={() => setDeleteConfirmOpen(true)} aria-label="Tune options">
            <MoreHorizontal size={23} />
          </button>
        </header>

        <div className="pitlanePageTitle" aria-live="polite">
          <h1>{pitlanePageTitle[pitlanePage]}</h1>
          <span>{pitlanePage === "menu" ? "Pick a setup area" : "Tap back to return to the setup area menu"}</span>
        </div>

        {pitlanePage === "menu" ? (
          <>
        <section className="pitlaneSetupCard" aria-label="Tune setup">
          <button className="pitlaneSetupRow" type="button" onClick={() => openPitlanePage("chassis")}>
            <span className="pitlaneRowIcon pitlaneRowIconChassis"><CarFront size={24} /></span>
            <span><small>Chassis</small><strong>{selectedCar?.chassisModel || selectedCar?.chassis || "Select chassis"}</strong></span>
            <ChevronDown size={25} />
          </button>
          <button className="pitlaneSetupRow" type="button" onClick={() => openPitlanePage("surface")}>
            <span className="pitlaneRowIcon pitlaneRowIconSurface"><MapPinned size={24} /></span>
            <span><small>Surface</small><strong>{surfaceSummary}</strong></span>
            <ChevronDown size={25} />
          </button>
          <button className="pitlaneSetupRow" type="button" onClick={() => openPitlanePage("parts")}>
            <span className="pitlaneRowIcon pitlaneRowIconParts"><Wrench size={24} /></span>
            <span><small>Parts</small><strong>Arms, towers, drivetrain</strong></span>
            <ChevronDown size={25} />
          </button>
          <button className="pitlaneSetupRow" type="button" onClick={() => openPitlanePage("geometry")}>
            <span className="pitlaneRowIcon pitlaneRowIconGeometry"><SlidersHorizontal size={24} /></span>
            <span><small>Geometry</small><strong>Alignment, holes, mounts</strong></span>
            <ChevronDown size={25} />
          </button>
          <button className="pitlaneSetupRow" type="button" onClick={() => openPitlanePage("electronics")}>
            <span className="pitlaneRowIcon pitlaneRowIconElectronics"><CircuitBoard size={24} /></span>
            <span><small>Electronics</small><strong>{electronicsCount || 0} Items Selected</strong></span>
            <ChevronDown size={25} />
          </button>
          <button className="pitlaneSetupRow" type="button" onClick={() => openPitlanePage("tires")}>
            <span className="pitlaneRowIcon pitlaneRowIconTires"><CircleDot size={24} /></span>
            <span><small>Tires / Wheels</small><strong>{String(pitlaneTune.values.tires || pitlaneTune.values.frontWheel || "Select tires / wheels")}</strong></span>
            <ChevronDown size={25} />
          </button>
        </section>

        <section className="pitlanePhotoSection" aria-label="Photos">
          <div className="pitlaneSectionTitle">
            <h2>Photos</h2>
            <span>{pitlaneTune.photos.length} / 10</span>
          </div>
          <div className="pitlanePhotoGrid">
            <button className="pitlaneAddPhoto" type="button" onClick={() => setPitlanePhotoManagerOpen(true)}>
              <ImagePlus size={30} />
              Add Photo
            </button>
            {pitlanePreviewPhotos.map((photo) => (
              <div className="pitlanePhotoTile" key={photo.id}>
                <img src={displayPhotoUrl(photo)} alt={photo.label || "Tune photo"} />
                <button type="button" aria-label="Remove photo" onClick={() => setPitlanePhotoToRemove(photo)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="pitlaneNotesSection" aria-label="Notes">
          <h2>Notes</h2>
          <textarea
            value={pitlaneTune.notes}
            placeholder="Track temp ~28C. High bite today. Front more grip on entry."
            maxLength={200}
            onChange={(event) => onUpdateTune({ ...pitlaneTune, notes: event.target.value, updatedAt: new Date().toISOString() })}
          />
          <span>{pitlaneTune.notes.length} / 200</span>
        </section>
          </>
        ) : renderPitlaneSubPage()}

        <button className="pitlaneSaveBar" type="button" onClick={saveWithConfirmation} disabled={manualSaveBusy}>
          <span><Save size={30} /></span>
          <strong>{manualSaveBusy ? "Saving..." : "Save Tune"}<em>Trackside Save</em></strong>
          <span><Check size={32} /></span>
        </button>

        {pitlaneBrowser ? (
          <PitlaneProductBrowser
            activeTab={pitlaneBrowser.tab}
            source={pitlaneBrowser.source}
            onTabChange={(tab) => setPitlaneBrowser({ ...pitlaneBrowser, tab })}
            onClose={() => setPitlaneBrowser(null)}
            onSelect={applyPitlaneProduct}
          />
        ) : null}

        {pitlanePhotoManagerOpen ? (
          <div className="pitlanePhotoManagerOverlay" role="presentation">
            <section className="pitlanePhotoManagerSheet" role="dialog" aria-modal="true" aria-label="Tune photos">
              <div className="pitlaneBrowserHeader">
                <h2>Photos</h2>
                <button type="button" onClick={() => setPitlanePhotoManagerOpen(false)} aria-label="Close photos">x</button>
              </div>
              <PhotosTab tune={pitlaneTune} onPhotos={(photos: TunePhoto[]) => onUpdateTune({ ...pitlaneTune, photos, updatedAt: new Date().toISOString() })} />
            </section>
          </div>
        ) : null}

        {pitlanePhotoToRemove ? (
          <ConfirmDialog
            title="Remove photo?"
            body="This removes the photo from this tune."
            confirmLabel="Remove photo"
            destructive
            onCancel={() => setPitlanePhotoToRemove(null)}
            onConfirm={() => {
              removePitlanePhoto(pitlanePhotoToRemove.id);
              setPitlanePhotoToRemove(null);
            }}
          />
        ) : null}

        {deleteConfirmOpen ? (
          <ConfirmDialog
            title="Delete tune?"
            body={deleteError || `This removes "${tuneDisplayName(pitlaneTune)}" from your saved tunes.`}
            confirmLabel="Delete tune"
            destructive
            busy={deleteBusy}
            onCancel={() => {
              if (!deleteBusy) {
                setDeleteError("");
                setDeleteConfirmOpen(false);
              }
            }}
            onConfirm={async () => {
              const id = pitlaneTune.id;
              setDeleteError("");
              setDeleteBusy(true);
              try {
                const deleted = await onDeleteTune(id);
                if (deleted !== false) setDeleteConfirmOpen(false);
                else setDeleteError("Delete did not complete. You may need owner/admin permission for this tune.");
              } catch (error) {
                setDeleteError(error instanceof Error ? error.message : "Delete failed. Please try again.");
              } finally {
                setDeleteBusy(false);
              }
            }}
          />
        ) : null}

        {saveConfirmOpen ? (
          <div className="modalShade" role="presentation">
            <section className="confirmModal saveConfirmModal" role="dialog" aria-modal="true" aria-labelledby="save-confirm-title">
              <div className="saveConfirmIcon"><Check size={24} /></div>
              <h2 id="save-confirm-title">Tune saved</h2>
              <p>{tuneDisplayName(pitlaneTune)} is saved to your RC Drift Sync account.</p>
              <div className="buttonRow">
                <button className="primaryAction" type="button" onClick={() => setSaveConfirmOpen(false)}>Continue editing</button>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    );
  }

  return (
    <main className="universalBuilder pitlaneBuilder">
      <header className="pitlaneBuilderTopbar" aria-label="Tune Builder mode">
        <button className="pitlaneBackButton" type="button" onClick={() => window.history.back()} aria-label="Back">
          <ChevronDown size={22} />
        </button>
        <div className="pitlaneModeTitle" role="tablist" aria-label="Tune mode">
          <button className={builderMode === "basic" ? "active" : ""} type="button" onClick={() => switchBuilderMode("basic")} role="tab" aria-selected={builderMode === "basic"}>
            Quick
          </button>
          <button className={builderMode === "advanced" ? "active" : ""} type="button" onClick={() => switchBuilderMode("advanced")} role="tab" aria-selected={builderMode === "advanced"}>
            Advanced
          </button>
        </div>
        <button className="pitlaneMoreButton" type="button" onClick={() => setPreviewOpen(true)} aria-label="Open tune summary">
          <MoreHorizontal size={23} />
        </button>
      </header>

      {activeTune ? (
        <section className="activeTuneBanner">
          <div>
            <BrandBadge brandSlug={chassisInfoFromTune(activeTune, selectedCar).brandSlug} />
            <p>{selectedCar?.chassisModel || selectedCar?.chassis || "RC drift car"}</p>
            <h2>{tuneDisplayName(activeTune)}</h2>
            <span>{dirty ? "Unsaved edits" : "Saved to account"}</span>
          </div>
          <button className="iconButton" type="button" onClick={deleteActiveTune} aria-label={`Delete ${tuneDisplayName(activeTune)}`}>
            <Trash2 size={19} />
          </button>
        </section>
      ) : null}

      {activeTune ? (
        <section className="pitlaneQuickRows" aria-label="Quick tune overview">
          <button type="button" onClick={() => goToTab("chassis")}>
            <span><CarFront size={21} /></span>
            <em>Chassis</em>
            <strong>{selectedCar?.chassisModel || selectedCar?.chassis || "Choose chassis"}</strong>
            <ChevronDown size={20} />
          </button>
          <button type="button" onClick={() => goToTab("track")}>
            <span><MapPinned size={21} /></span>
            <em>Surface</em>
            <strong>{activeTune.surface || activeTune.track || "Track surface"}</strong>
            <ChevronDown size={20} />
          </button>
          <button type="button" onClick={() => goToTab("front")}>
            <span><Wrench size={21} /></span>
            <em>Parts</em>
            <strong>{String(activeTune.values.frontKnuckle || activeTune.values.rearHubCarrier || "Arms, towers, drivetrain")}</strong>
            <ChevronDown size={20} />
          </button>
          <button type="button" onClick={() => goToTab("geometry")}>
            <span><SlidersHorizontal size={21} /></span>
            <em>Geometry</em>
            <strong>{String(activeTune.values.frontShockTowerUpperHole || activeTune.values.rearHubCarrierUpperLinkHole || "Alignment and holes")}</strong>
            <ChevronDown size={20} />
          </button>
          <button type="button" onClick={() => goToTab("electronics")}>
            <span><CircuitBoard size={21} /></span>
            <em>Electronics</em>
            <strong>{[activeTune.electronics?.esc?.model, activeTune.electronics?.servo?.model, activeTune.electronics?.gyro?.model].filter(Boolean).length || 0} items selected</strong>
            <ChevronDown size={20} />
          </button>
          <button type="button" onClick={() => goToTab("tires")}>
            <span><CircleDot size={21} /></span>
            <em>Tires / Wheels</em>
            <strong>{String(activeTune.values.tires || activeTune.values.frontWheel || "Select tires and wheels")}</strong>
            <ChevronDown size={20} />
          </button>
        </section>
      ) : null}

      <section className={`builderStart appCard ${activeTune ? "quickBuilderTop" : ""}`}>
        {!activeTune ? (
        <>
        <div className="builderStartHeader">
          <div>
            <p>Start tune</p>
            <h2>{builderMode === "basic" ? "Quick" : "Advanced"}</h2>
            <em>{builderMode === "basic" ? "Simple sections for trackside setup notes." : "All detailed setup sheet fields and PDF tools."}</em>
          </div>
          <span>{completion}% complete</span>
        </div>
        <div className="progressTrack" aria-label="Tune completion progress">
          <i style={{ width: `${completion}%` }} />
        </div>
        </>
        ) : null}
        <div className="guidedBuilderControls" aria-label="Guided tune builder controls">
          <div className="builderModeSwitch" aria-label="Builder mode">
            <button className={builderMode === "basic" ? "active" : ""} type="button" onClick={() => switchBuilderMode("basic")}>Quick</button>
            <button className={builderMode === "advanced" ? "active" : ""} type="button" onClick={() => switchBuilderMode("advanced")}>Advanced</button>
          </div>
          <section className="builderCategorySelect" aria-label="Tune category">
            <SelectField label="Tuning category" value={activeTabId} onChange={(event) => goToTab(event.target.value as BuilderTabId)}>
              {visibleBuilderTabs.map((tab, index) => (
                <option key={tab.id} value={tab.id}>
                  {index + 1}. {tab.label}
                </option>
              ))}
            </SelectField>
          </section>
          {!activeTune ? <p className="modeHelpText">{builderMode === "basic" ? "Quick shows the fields most drivers use at the track." : "Advanced shows detailed settings, PDF tools, photos, and deeper electronics fields."}</p> : null}
        </div>
        {!activeTune ? (
        <>
        <div className="builderStartGrid">
          <SelectField label="Choose car" value={carId} onChange={(event) => setCarId(event.target.value)}>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.name} - {car.chassisModel || car.chassis}
              </option>
            ))}
          </SelectField>
          <SelectField label="Setup mode" value={setupMode} onChange={(event) => setSetupMode(event.target.value as SetupMode)}>
            {officialSupported ? <option value="official">Official template</option> : null}
            <option value="universal">Universal RC Drift Sync setup sheet</option>
          </SelectField>
          <SelectField label="Starting point" value={startingPoint} onChange={(event) => setStartingPoint(event.target.value as StartingPoint)}>
            <option value="blank">Blank tune</option>
            <option value="duplicate">Duplicate previous tune</option>
            <option value="baseline">Use baseline</option>
          </SelectField>
          {startingPoint === "duplicate" ? (
            <SelectField label="Previous tune" value={sourceTuneId} onChange={(event) => setSourceTuneId(event.target.value)}>
              <option value="">Last tune for this car</option>
              {carTunes.map((tune) => (
                <option key={tune.id} value={tune.id}>{tuneDisplayName(tune)}</option>
              ))}
            </SelectField>
          ) : null}
        </div>
        <div className="buttonRow">
          <button className="primaryAction" type="button" onClick={() => onCreateTune({ carId, setupMode, startingPoint, sourceTuneId })}>
            <Plus size={18} />
            Create tune
          </button>
          {activeTune ? (
            <button className="smallPill" type="button" onClick={() => onDuplicateTune(activeTune)}>
              <CopyPlus size={16} />
              Duplicate current
            </button>
          ) : null}
        </div>
        </>
        ) : null}
      </section>

      {tunes.length > 1 ? <div className="tunePicker" aria-label="Select tune">
        {tunes.slice(0, 8).map((item) => (
          <button key={item.id} className={item.id === activeTune?.id ? "active" : ""} type="button" onClick={() => onSelectTune(item.id)}>
            {tuneDisplayName(item)}
          </button>
        ))}
      </div> : null}

      {!activeTune ? (
        <EmptyState title="No tune selected" body="Create a blank tune, duplicate an existing tune, or use a baseline to start." />
      ) : (
        <>
          {deleteConfirmOpen ? (
            <ConfirmDialog
              title="Delete tune?"
              body={deleteError || `This removes "${tuneDisplayName(activeTune)}" from your saved tunes. It will also be removed from your account if you are signed in.`}
              confirmLabel="Delete tune"
              destructive
              busy={deleteBusy}
              onCancel={() => {
                if (!deleteBusy) {
                  setDeleteError("");
                  setDeleteConfirmOpen(false);
                }
              }}
              onConfirm={async () => {
                const id = activeTune.id;
                setDeleteError("");
                setDeleteBusy(true);
                try {
                  const deleted = await onDeleteTune(id);
                  if (deleted !== false) setDeleteConfirmOpen(false);
                  else setDeleteError("Delete did not complete. You may need owner/admin permission for this tune.");
                } catch (error) {
                  setDeleteError(error instanceof Error ? error.message : "Delete failed. Please try again.");
                } finally {
                  setDeleteBusy(false);
                }
              }}
            />
          ) : null}

          {builderMode === "basic" || builderMode === "advanced" ? (
            <>
            <BasicTuneForm
              tune={activeTune}
              car={selectedCar}
              activeTabId={activeTabId}
              electronicsProfiles={electronicsProfiles}
              onSaveElectronicsProfile={onSaveElectronicsProfile}
              onChange={(nextTune) => onUpdateTune(syncTuneSharedModel(nextTune, selectedCar))}
            />
            {builderMode === "advanced" ? (
              <AdvancedTuneDetails
                activeSections={activeSections}
                activeTune={activeTune}
                tunes={tunes}
                electronicsProfiles={electronicsProfiles}
                openSection={openSection}
                onOpenSection={setOpenSection}
                onFieldChange={updateField}
                onPartChange={updatePartField}
                onElectronicsSettingChange={updateElectronicsSetting}
                onApplyElectronicsProfile={applyElectronicsProfile}
                onSaveElectronicsProfile={saveElectronicsProfile}
              />
            ) : null}
            {activeTab.id === "notes" ? <SharingSettings tune={activeTune} onChange={updateShareSettings} /> : null}
            {activeTab.id === "pdf" ? <TuneSummary tune={activeTune} car={selectedCar} onClose={() => setPreviewOpen(false)} /> : null}
            </>
          ) : (
            <>
          <section className="guidedStepIntro appCard">
            <div>
              <p>{builderMode === "advanced" ? `Step ${displayedSteps.findIndex((step) => step.id === activeStep.id) + 1} of ${displayedSteps.length}` : "Selected section"}</p>
              <h2>{activeTab.label}</h2>
              <span>{activeTab.helper}</span>
            </div>
            <strong>{activeSections.length ? "Section fields" : activeTab.label}</strong>
            {activeTab.id === "chassis" && selectedCar ? (
              <div className="guidedContextGrid">
                <span>
                  <em>Car</em>
                  {selectedCar.name}
                </span>
                <span>
                  <em>Chassis</em>
                  {selectedCar.chassisModel || selectedCar.chassis || "Not set"}
                </span>
                <span>
                  <em>Template</em>
                  {officialSupported ? "Official PDF eligible" : "Universal setup sheet"}
                </span>
              </div>
            ) : null}
          </section>

          {activeTab.id === "chassis" ? (
            <ChassisTuneFields tune={activeTune} car={selectedCar} onChange={updateChassisPatch} />
          ) : null}

          <section className="builderSections">
            {activeTab.id === "feel" ? (
              <>
                <section className="builderSectionCard">
                  <header>
                    <div>
                      <p>Feel category</p>
                      <h3>Intended Use</h3>
                    </div>
                  </header>
                  <BuilderField
                    field={{ id: "setupIntent", label: "Intended use", type: "combo", meta: "setupIntent", options: ["Team tandems", "Trains", "Style", "Competition"], placeholder: "Choose or type your own use" }}
                    tune={activeTune}
                    tunes={tunes}
                    builderMode={builderMode}
                    onChange={(value) => updateField({ id: "setupIntent", label: "Intended use", type: "combo", meta: "setupIntent" }, value)}
                    onElectronicsSettingChange={updateElectronicsSetting}
                  />
                </section>
                <FeelEditor tune={activeTune} onChange={(expectedFeel) => onUpdateTune({ ...activeTune, expectedFeel, updatedAt: new Date().toISOString() })} />
              </>
            ) : null}

            {activeSections.map((section) => {
              const isOpen = openSection === section.id;
              const visibleFields = fieldsForBuilderMode(section);
              const sectionDone = visibleFields.filter((field) => String(fieldValue(activeTune, field) ?? "").trim()).length;
              return (
                <article className="builderSectionCard" key={section.id}>
                  <button className="sectionToggle" type="button" onClick={() => setOpenSection(isOpen ? "" : section.id)} aria-expanded={isOpen} aria-label={`Open ${section.title} section`}>
                    <span>
                      <strong>{section.title}</strong>
                      <em>{sectionDone}/{visibleFields.length} filled</em>
                    </span>
                    <ChevronDown size={19} />
                  </button>
                  {isOpen ? (
                    <div className="builderFieldGrid">
                      {section.profileType ? (
                        <ElectronicsProfileTools
                          section={section}
                          profiles={electronicsProfiles.filter((profile) => profile.type === section.profileType)}
                          onApply={applyElectronicsProfile}
                          onSave={() => saveElectronicsProfile(section)}
                        />
                      ) : null}
                      {visibleFields.map((field) => (
                        <BuilderField
                          key={field.id}
                          field={field}
                          tune={activeTune}
                          tunes={tunes}
                          builderMode={builderMode}
                          onChange={(value) => updateField(field, value)}
                          onPartChange={(part, customName) => updatePartField(field, part, customName)}
                          onElectronicsSettingChange={updateElectronicsSetting}
                        />
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}

            {activeTab.id === "photos" ? (
              <article className="builderSectionCard">
                <button className="sectionToggle" type="button" aria-expanded="true" aria-label="Photos section">
                  <span>
                    <strong>Photos</strong>
                    <em>{activeTune.photos.length} attached</em>
                  </span>
                  <ChevronDown size={19} />
                </button>
                <PhotosTab tune={activeTune} onPhotos={(photos: TunePhoto[]) => onUpdateTune({ ...activeTune, photos, updatedAt: new Date().toISOString() })} />
              </article>
            ) : null}

            {activeTab.id === "notes" ? (
              <>
                <SetupAssistant
                  key={activeTune.id}
                  cars={cars}
                  tune={activeTune}
                  tunes={tunes}
                  isOpen={openSection === "setup-assistant"}
                  onToggle={() => setOpenSection(openSection === "setup-assistant" ? "" : "setup-assistant")}
                  onSelectTune={onSelectTune}
                  onUpdateTune={onUpdateTune}
                />

                <TuneTimeline tune={activeTune} />
              </>
            ) : null}

            {activeTab.id === "notes" ? <SharingSettings tune={activeTune} onChange={updateShareSettings} /> : null}
            {activeTab.id === "pdf" ? <TuneSummary tune={activeTune} car={selectedCar} onClose={() => setPreviewOpen(false)} /> : null}
          </section>
            </>
          )}

          {previewOpen ? <TuneSummary tune={activeTune} car={selectedCar} onClose={() => setPreviewOpen(false)} /> : null}
          {pdfPreviewUrl ? <PdfPreviewPanel url={pdfPreviewUrl} onClose={() => setPdfPreviewUrl("")} /> : null}
          {saveConfirmOpen ? (
            <div className="modalShade" role="presentation">
              <section className="confirmModal saveConfirmModal" role="dialog" aria-modal="true" aria-labelledby="save-confirm-title">
                <div className="saveConfirmIcon"><Check size={24} /></div>
                <h2 id="save-confirm-title">Tune saved</h2>
                <p>{tuneDisplayName(activeTune)} is saved to your RC Drift Sync account.</p>
                <div className="buttonRow">
                  {onViewTune ? (
                    <button className="smallPill" type="button" onClick={() => onViewTune(activeTune.id)}>
                      <Eye size={17} />
                      View tune
                    </button>
                  ) : null}
                  <button
                    className="smallPill"
                    type="button"
                    onClick={() => {
                      updateShareSettings({ visibility: activeTune.visibility === "private" ? "unlisted" : activeTune.visibility });
                      setSaveConfirmOpen(false);
                      goToTab("notes");
                    }}
                  >
                    <Share2 size={17} />
                    Create share QR
                  </button>
                  <button className="primaryAction" type="button" onClick={() => setSaveConfirmOpen(false)}>
                    Continue editing
                  </button>
                </div>
              </section>
            </div>
          ) : null}

          {builderMode === "basic" || builderMode === "advanced" ? (
            <div className="builderStickyActions basicStickyActions">
              <span className={`stickyActionHint ${saveError ? "errorText" : ""}`}>{saveError || (dirty ? "You have unsaved changes." : "Saved to your account.")}</span>
              <button className="smallPill" type="button" onClick={() => previousQuickTab && goToTab(previousQuickTab.id)} disabled={!previousQuickTab}>
                Back
              </button>
              <button className="smallPill nextStepButton" type="button" onClick={() => nextQuickTab ? goToTab(nextQuickTab.id) : saveWithConfirmation()} disabled={manualSaveBusy}>
                {nextQuickTab ? `Next: ${nextQuickTab.label}` : manualSaveBusy ? "Saving..." : "Finish"}
              </button>
              <button className="smallPill pdfAction" type="button" onClick={previewPdf} disabled={pdfBusy}>
                <FileText size={17} />
                {pdfBusy ? "Building..." : "Preview PDF"}
              </button>
              <button className="primaryAction" type="button" onClick={saveWithConfirmation} disabled={manualSaveBusy}>
                <Save size={18} />
                {manualSaveBusy ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
          <div className="builderStickyActions basicStickyActions fullTuneSlimActions">
            <span className={`stickyActionHint ${saveError ? "errorText" : ""}`}>{saveError || (dirty ? "Save before sharing or exporting." : "Saved and ready for preview or export.")}</span>
            <button className="smallPill" type="button" onClick={() => setPreviewOpen(true)}>
              <Eye size={17} />
              Summary
            </button>
            <button className="smallPill" type="button" onClick={previewPdf} disabled={pdfBusy}>
              <FileText size={17} />
              {pdfBusy ? "Building..." : "PDF"}
            </button>
            <button className="primaryAction" type="button" onClick={saveWithConfirmation} disabled={manualSaveBusy}>
              <Save size={18} />
              {manualSaveBusy ? "Saving..." : "Save"}
            </button>
            <button className="smallPill" type="button" onClick={exportPdf} disabled={pdfBusy}>
              <Download size={17} />
              Export
            </button>
          </div>
          )}
        </>
      )}
    </main>
  );
}

function pitlaneProductName(item: ProductCatalogItem) {
  const partNumber = item.partNumber || item.modelNumber;
  let label = item.simplifiedName || item.displayName || catalogOptionLabel(item);
  if (partNumber) label = label.replace(new RegExp(`\\s*\\(?${partNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)?\\s*`, "gi"), " ");
  return label.replace(/\s+/g, " ").trim();
}

function pitlaneCategoriesForTab(tab: PitlaneProductTab, source: "electronics" | "tires"): ProductCatalogCategory[] {
  if (source === "tires") {
    if (tab === "tires") return ["tires"];
    if (tab === "frontWheels") return ["frontWheels"];
    if (tab === "rearWheels") return ["rearWheels"];
    return ["tires", "frontWheels", "rearWheels"];
  }
  if (tab === "motor") return ["motors"];
  if (tab === "esc") return ["escs"];
  if (tab === "gyro") return ["gyros"];
  if (tab === "servo") return ["servos"];
  if (tab === "other") return ["capacitors"];
  return ["motors", "escs", "gyros", "servos"];
}

function PitlaneProductBrowser({
  activeTab,
  source,
  onTabChange,
  onClose,
  onSelect
}: {
  activeTab: PitlaneProductTab;
  source: "electronics" | "tires";
  onTabChange: (tab: PitlaneProductTab) => void;
  onClose: () => void;
  onSelect: (item: ProductCatalogItem) => void;
}) {
  const [brand, setBrand] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const categories = pitlaneCategoriesForTab(activeTab, source);
  const allItems = getProductCatalog();
  const categoryItems = categories.flatMap((category) => filterProductCatalog(allItems, {
    category,
    tuneSelectableOnly: true
  }));
  const items = categories
    .flatMap((category) => filterProductCatalog(allItems, {
      category,
      brand: brand === "All" ? undefined : brand,
      tuneSelectableOnly: true
    }))
    .slice(0, source === "tires" ? 48 : 24);
  const brands = ["All", ...Array.from(new Set(categoryItems.map((item) => item.brand))).filter(Boolean).slice(0, source === "tires" ? 24 : 8)];
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const tabs: Array<{ id: PitlaneProductTab; label: string }> = source === "tires"
    ? [
        { id: "all", label: "All" },
        { id: "tires", label: "Tires" },
        { id: "frontWheels", label: "Front Wheels" },
        { id: "rearWheels", label: "Rear Wheels" }
      ]
    : [
        { id: "all", label: "All" },
        { id: "motor", label: "Motor" },
        { id: "esc", label: "ESC" },
        { id: "gyro", label: "Gyro" },
        { id: "servo", label: "Servo" },
        { id: "other", label: "Other" }
      ];

  return (
    <div className="pitlaneBrowserOverlay" role="presentation">
      <section className="pitlaneBrowserSheet" role="dialog" aria-modal="true" aria-label="Product Browser">
        <span className="pitlaneGrabber" aria-hidden="true" />
        <div className="pitlaneBrowserHeader">
          <h2>Product Browser</h2>
          <button type="button" onClick={onClose} aria-label="Close Product Browser">×</button>
        </div>

        <div className="pitlaneChipRow" aria-label="Product type filters">
          {tabs.map((tab) => (
            <button key={tab.id} className={activeTab === tab.id ? "active" : ""} type="button" onClick={() => {
              setSelectedId("");
              setBrand("All");
              onTabChange(tab.id);
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        <h3 className="pitlaneBrowserLabel">Brand</h3>
        <div className="pitlaneChipRow" aria-label="Brand filters">
          {brands.map((itemBrand) => (
            <button key={itemBrand} className={brand === itemBrand ? "active" : ""} type="button" onClick={() => {
              setSelectedId("");
              setBrand(itemBrand);
            }}>
              {itemBrand}
            </button>
          ))}
        </div>

        <div className="pitlaneProductGrid">
          {items.map((item, index) => {
            const isSelected = (selectedId || selected?.id) === item.id;
            return (
              <button key={item.id} className={isSelected ? "selected" : ""} type="button" onClick={() => setSelectedId(item.id)}>
                <span className="pitlaneSelectedMark">✓</span>
                <span className="pitlaneRadioDot" />
                <img src={item.imageUrl || "/icons/icon.svg"} alt="" loading="lazy" />
                <strong><span>{item.brand}</span>{pitlaneProductName(item)}</strong>
                {index === 0 ? <em>Popular</em> : null}
              </button>
            );
          })}
        </div>

        <button className="pitlaneCustomProduct" type="button" onClick={onClose}>
          <span>+</span>
          <strong>Custom / Other<em>Add a custom product</em></strong>
        </button>

        <button className="pitlaneSelectProduct" type="button" disabled={!selected} onClick={() => selected && onSelect(selected)}>
          {selected ? "Confirm selection" : "No products available"}
        </button>
      </section>
    </div>
  );
}

const beginnerHelpers: Record<string, string> = {
  chassisCatalogProduct: "The main chassis kit or platform this tune is for.",
  deckBrand: "Choose Stock if the deck is the original kit deck.",
  chassisDeck: "The main chassis plate or deck installed on the car.",
  upperDeckBrand: "Choose Stock if the upper deck is the original kit upper deck.",
  upperDeck: "The upper deck or top chassis brace installed on the car.",
  lowerDeckBrand: "Choose Stock if the lower deck is the original kit lower deck.",
  lowerDeck: "The lower deck or main chassis plate installed on the car.",
  transmissionGear: "Most drivers only need to know whether the gearbox is 3-gear or 4-gear.",
  frontShockTower: "The tower that holds the upper front shock positions.",
  rearShockTower: "The tower that holds the upper rear shock positions.",
  frontDamper: "The front shock absorber/damper body installed on the car.",
  rearDamper: "The rear shock absorber/damper body installed on the car.",
  frontShockOil: "The oil weight used in the front dampers.",
  rearShockOil: "The oil weight used in the rear dampers.",
  rearShockMountingNotes: "Describe the exact lower-arm hole, tower hole, spacers, and orientation so the rear shock setup is easy to repeat.",
  frontLowerArm: "The lower suspension arm used on the front suspension.",
  rearLowerArm: "The lower suspension arm used on the rear suspension.",
  rearLowerArmSide: "Choose which side of the Reve D rear lower arm is being used for the shock mount.",
  frontUpperArm: "The upper arm or upper link used on the front suspension.",
  rearUpperArm: "The upper arm or upper link used on the rear suspension.",
  frontKnuckle: "The steering knuckle/upright used on the front suspension.",
  frontKnucklePlate: "An optional plate or insert used with adjustable front knuckles.",
  frontAxle: "The front axle or front wheel shaft installed in the knuckle.",
  rearHubCarrier: "The rear upright/hub carrier that holds the rear axle.",
  frontOffsetSpacer: "Spacer added at the front hub/hex to fine-tune track width or wheel clearance.",
  rearOffsetSpacer: "Spacer added at the rear hub/hex to fine-tune track width or wheel clearance.",
  frontToeBlock: "The suspension mount/block that affects toe angle.",
  rearToeBlock: "The suspension mount/block that affects toe angle.",
  toeBlockSuspensionMount: "The suspension mount/block that affects toe angle.",
  frontLowerArmShims: "Small spacers used to raise, lower, or move suspension arms.",
  rearLowerArmShims: "Small spacers used to raise, lower, or move suspension arms.",
  differentialBrand: "The brand of diff, spool, or LSD unit used in the rear drivetrain.",
  diffType: "The rear differential style: gear diff, ball diff, spool, solid axle, or LSD.",
  differentialProduct: "The specific differential, spool, solid axle, or LSD product.",
  motorTurns: "Motor turn rating. Lower turn numbers usually mean more RPM and power.",
  motorRotor: "The replaceable rotor inside the motor, if changed from stock.",
  powerCapacitor: "An optional ESC capacitor or power capacitor upgrade.",
  servoHorn: "The arm mounted on the servo output spline.",
  frontWheelOffset: "Wheel offset changes how far the wheel sits in or out from the hub.",
  rearWheelOffset: "Wheel offset changes how far the wheel sits in or out from the hub.",
  activeToe: "Rear suspension linkage that changes toe as the suspension moves.",
  escProfileName: "Your saved speed controller settings for this tune.",
  servoProfileName: "Your saved steering servo settings for this tune.",
  gyroProfileName: "Your saved gyro settings for this tune."
};

const BEGINNER_NOT_SURE_OPTION = "Not sure";
const BEGINNER_STOCK_OPTION = "Stock";
const BEGINNER_NOT_APPLICABLE_OPTION = "Not applicable";

const electronicsProfileLabels: Record<ProfiledElectronicsCategory, string> = {
  esc: "ESC",
  servo: "Servo",
  gyro: "Gyro"
};

function electronicsProfileSnapshot(profile: ElectronicsProfile) {
  return {
    profileId: profile.id,
    profileName: profile.name,
    profileType: profile.type,
    capturedAt: new Date().toISOString(),
    ...profile.values
  };
}

function profileValuesForCategory(tune: Tune, category: ProfiledElectronicsCategory) {
  const prefix = `${category}_`;
  const profileNameKey = `${category}ProfileName`;
  return Object.fromEntries(
    Object.entries(tune.values).filter(([key, value]) => {
      if (value === undefined || value === null || String(value).trim() === "") return false;
      return key === profileNameKey || key.startsWith(prefix);
    })
  );
}

function electronicsCarryoverFor(category: ElectronicsCategory, tune: Tune, existing?: TuneElectronicsItem) {
  if (category === "motor") {
    return {
      turns: String(tune.values.motorTurns ?? existing?.turns ?? ""),
      timing: String(tune.values.motorTiming ?? existing?.timing ?? ""),
      rotor: String(tune.values.motorRotor ?? existing?.rotor ?? "")
    };
  }
  if (category === "esc") {
    return {
      firmware: String(tune.values.escFirmwareVersion ?? existing?.firmware ?? "")
    };
  }
  if (category === "gyro") {
    return {
      gain: String(tune.values.gyroGain ?? existing?.gain ?? ""),
      mode: String(tune.values.gyroMode ?? existing?.mode ?? "")
    };
  }
  return {};
}

const basicRecentKey = (ownerId: string | undefined, fieldId: string) => `rc-drift-sync:basic-recents:${ownerId || "local"}:${fieldId}`;

function loadBasicRecents(ownerId: string | undefined, fieldId: string) {
  try {
    return JSON.parse(window.localStorage.getItem(basicRecentKey(ownerId, fieldId)) || "[]") as string[];
  } catch {
    return [];
  }
}

function saveBasicRecent(ownerId: string | undefined, fieldId: string, value: string, baseOptions: string[]) {
  const clean = value.trim();
  if (!clean || clean === BASIC_CUSTOM_OPTION) return;
  if (clean === BEGINNER_NOT_SURE_OPTION || clean === BEGINNER_STOCK_OPTION) return;
  if (baseOptions.some((option) => option.toLowerCase() === clean.toLowerCase())) return;
  const existing = loadBasicRecents(ownerId, fieldId).filter((item) => item.toLowerCase() !== clean.toLowerCase());
  window.localStorage.setItem(basicRecentKey(ownerId, fieldId), JSON.stringify([clean, ...existing].slice(0, 6)));
}

function BasicTuneForm({
  tune,
  car,
  activeTabId,
  electronicsProfiles,
  onSaveElectronicsProfile,
  onChange
}: {
  tune: Tune;
  car?: Car;
  activeTabId: BuilderTabId;
  electronicsProfiles: ElectronicsProfile[];
  onSaveElectronicsProfile: (profile: ElectronicsProfile) => void;
  onChange: (tune: Tune) => void;
}) {
  const chassisInfo = chassisInfoFromTune(tune, car);
  const selectedBrand = findChassisBrand(tune.chassisBrandSlug || chassisInfo.brandSlug);
  const brandSlug = selectedBrand?.slug ?? "other";
  const models = modelsForBrand(brandSlug);
  const selectedModel = tune.chassisModel || (models.includes(chassisInfo.model) ? chassisInfo.model : models[0] ?? "Custom");
  const isReveDMultiKnuckleChassis = brandSlug === "reve-d" && /rdx|mc-?iii|mc-?3/i.test(`${selectedModel} ${chassisInfo.model}`);
  const rearLowerArmBrandText = String(tune.values.rearLowerArmBrand ?? tune.chassisSetup?.rear?.lowerArm?.brand ?? "");
  const isReveDRearLowerArm = /\breve\s*d\b|\breved\b/i.test(rearLowerArmBrandText);
  const frontSuspensionIdentity = [
    tune.values.frontShockTowerBrand,
    tune.values.frontShockTower,
    tune.values.frontDamperBrand,
    tune.values.frontDamper,
    tune.values.frontLowerArmBrand,
    tune.values.frontLowerArm,
    tune.chassisBrand,
    tune.customChassisBrand,
    tune.chassisModel,
    selectedModel,
    chassisInfo.brand,
    chassisInfo.model
  ].join(" ");
  const usesOverdoseIfs = /\boverdose\b|\bgalm\b|\bvacula\b|\bifs\b/i.test(frontSuspensionIdentity);
  const internalRatioPreset = suggestedInternalRatio(brandSlug);
  const internalDriveRatioValue = String(tune.values.internalDriveRatio ?? internalRatioPreset?.internalRatio ?? "");
  const autoFdrValue = calculateFinalDriveRatio(tune.values.spurGear, tune.values.pinionGear, internalDriveRatioValue);
  const fdrAutoEnabled = tune.values.fdrAuto !== false;
  function patchValues(values: Record<string, BuilderValue>, patch: Partial<Tune> = {}, extraSelections: Record<string, string> = {}) {
    onChange({
      ...tune,
      ...patch,
      values: { ...tune.values, ...values },
      selections: { ...tune.selections, ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)])), ...extraSelections },
      updatedAt: new Date().toISOString()
    });
  }

  function patchGearing(values: Record<string, BuilderValue>) {
    const mergedValues: Record<string, BuilderValue> = {
      ...tune.values,
      internalDriveRatio: internalDriveRatioValue,
      ...values
    };
    const nextValues = { ...values };
    if (internalRatioPreset && !tune.values.internalDriveRatio && !("internalDriveRatio" in values)) {
      nextValues.internalDriveRatio = String(internalRatioPreset.internalRatio);
    }
    if (mergedValues.fdrAuto !== false) {
      const nextFdr = calculateFinalDriveRatio(mergedValues.spurGear, mergedValues.pinionGear, mergedValues.internalDriveRatio);
      if (nextFdr) nextValues.finalDriveRatio = nextFdr;
    }
    patchValues(nextValues);
  }

  function selectorValueFromFields(fieldId: string, brandFieldId: string, category: ProductCatalogCategory, fallbackBrand = "", fallbackModel = ""): PartSelectorValue {
    const brand = String(tune.values[brandFieldId] ?? fallbackBrand ?? "");
    const model = String(tune.values[fieldId] ?? fallbackModel ?? "");
    const partNumber = String(tune.values[`${fieldId}PartNumber`] ?? "");
    const notes = String(tune.values[`${fieldId}Notes`] ?? "");
    const catalogItemId = String(tune.selections[fieldId] ?? "");
    const canonicalProductId = String(tune.values[`${fieldId}CanonicalProductId`] ?? "");
    const canonicalVariantId = String(tune.values[`${fieldId}CanonicalVariantId`] ?? "");
    const variantLabel = String(tune.values[`${fieldId}VariantLabel`] ?? "");
    const isCustom = Boolean(tune.values[`${fieldId}CustomName`] || tune.values[`${fieldId}IsCustom`] === true);
    return {
      brand,
      brandSlug: brand ? slugifyChassis(brand) : "",
      model,
      modelSlug: model ? slugifyChassis(model) : "",
      partNumber,
      customName: String(tune.values[`${fieldId}CustomName`] ?? ""),
      notes,
      catalogItemId,
      canonicalProductId,
      canonicalVariantId,
      variantLabel,
      category,
      isCustom
    };
  }

  function patchPartSelector(fieldId: string, brandFieldId: string, category: ProductCatalogCategory, part: PartSelectorValue, extraValues: Record<string, BuilderValue> = {}) {
    const nextPart = { ...part, category: part.category ?? category };
    const brand = part.brand ?? "";
    const model = part.model || part.customName || "";
    patchValues(
      {
        [brandFieldId]: brand,
        [fieldId]: model,
        [`${brandFieldId}Slug`]: brand ? slugifyChassis(brand) : "",
        [`${fieldId}Slug`]: part.modelSlug || (model ? slugifyChassis(model) : ""),
        [`${fieldId}CatalogItemId`]: nextPart.catalogItemId ?? "",
        [`${fieldId}CanonicalProductId`]: nextPart.canonicalProductId ?? "",
        [`${fieldId}CanonicalVariantId`]: nextPart.canonicalVariantId ?? "",
        [`${fieldId}VariantLabel`]: nextPart.variantLabel ?? "",
        [`${fieldId}PartNumber`]: part.partNumber ?? "",
        [`${fieldId}CustomName`]: part.customName ?? "",
        [`${fieldId}Notes`]: part.notes ?? "",
        [`${fieldId}IsCustom`]: Boolean(nextPart.isCustom),
        ...extraValues
      },
      {},
      nextPart.catalogItemId ? { [fieldId]: nextPart.catalogItemId } : { [fieldId]: model }
    );
  }

  function visualValuesFor(definition: VisualSetupDefinition, helperId: SuspensionMountVisualRequest["helperId"]) {
    const acceptedLabels = new Set(definition.options.map((option) => option.label));
    const storedPositions = tune.visualSetup?.[helperId]?.positions ?? {};
    return Object.fromEntries(
      definition.slots.map((slot) => {
        const value = String(tune.values[slot.fieldId] ?? storedPositions[slot.fieldId] ?? "");
        return [slot.fieldId, acceptedLabels.has(value) ? value : ""];
      })
    );
  }

  function patchVisualSetupSelection(
    request: SuspensionMountVisualRequest,
    definition: VisualSetupDefinition,
    slot: VisualSetupSlot,
    option: VisualSetupOption
  ) {
    const now = new Date().toISOString();
    const previous = tune.visualSetup?.[request.helperId];
    const positions = {
      ...(previous?.positions ?? {}),
      [slot.fieldId]: option.label
    };
    patchValues(
      { [slot.fieldId]: option.label },
      {
        visualSetup: {
          ...(tune.visualSetup ?? {}),
          [request.helperId]: {
            helperId: request.helperId,
            brand: definition.brand,
            partCategory: definition.partCategory,
            definitionVersion: definition.version,
            source: definition.source,
            label: request.label,
            positions,
            updatedAt: now
          }
        }
      },
      { [slot.fieldId]: option.label }
    );
  }

  function renderSuspensionMountVisual(request: SuspensionMountVisualRequest) {
    const definition = resolveSuspensionMountVisualDefinition({
      ...request,
      partBrand: request.partBrand ?? String(tune.values[`${request.helperId}Brand`] ?? ""),
      chassisBrand: request.chassisBrand ?? String(tune.chassisBrand ?? tune.customChassisBrand ?? chassisInfo.brand ?? ""),
      tune
    });
    return (
      <VisualSetupHelper
        definition={definition}
        values={visualValuesFor(definition, request.helperId)}
        onSelect={(slot, option) => patchVisualSetupSelection(request, definition, slot, option)}
      />
    );
  }

  function patchElectronics(category: "servo" | "gyro" | "motor" | "esc", values: Record<string, BuilderValue>, patch: Partial<Tune> = {}) {
    const current = tune.electronics?.[category] ?? { brand: "", model: "", settings: {} };
    const brand = String(values[`${category}Brand`] ?? current.brand ?? "");
    const modelKey = category === "motor" ? "motorModel" : `${category}Model`;
    const model = String(values[modelKey] ?? (category === "motor" ? values.motor : undefined) ?? current.model ?? "");
    const slug = String(values[`${category}Slug`] ?? current.slug ?? "");
    const cleanBrand = brand === BEGINNER_NOT_SURE_OPTION ? "" : brand;
    const cleanModel = model === BEGINNER_NOT_SURE_OPTION ? "" : model;
    const profileNameKey = `${category}ProfileName`;
    const profileIdKey = `${category}ProfileId`;
    const hasProfileNamePatch = Object.prototype.hasOwnProperty.call(values, profileNameKey);
    const hasProfileIdPatch = Object.prototype.hasOwnProperty.call(values, profileIdKey);
    const nextProfileName = hasProfileNamePatch ? String(values[profileNameKey] ?? "") : String(current.profileSnapshot && typeof current.profileSnapshot === "object" ? current.profileSnapshot.profileName ?? "" : "");
    const nextProfileId = hasProfileIdPatch ? String(values[profileIdKey] ?? "") : current.selectedProfileId;
    const ignoredKeys = [`${category}Brand`, `${category}Model`, `${category}Slug`, `${category}PartNumber`, `${category}CustomName`, `${category}Notes`, profileNameKey, profileIdKey, "motor", "motorBrand", "motorModel", "motorSlug"];
    const settingsPatch = Object.fromEntries(
      Object.entries(values).filter(([key]) => !ignoredKeys.includes(key))
    );
    onChange({
      ...tune,
      ...patch,
      values: { ...tune.values, ...values },
      selections: { ...tune.selections, ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)])) },
      electronics: {
        ...(tune.electronics ?? {}),
        [category]: {
          ...current,
          brand: cleanBrand,
          model: cleanModel,
          slug,
          settings: { ...(current.settings ?? {}), ...settingsPatch },
          customName: String(values[`${category}CustomName`] ?? current.customName ?? ""),
          selectedProfileId: nextProfileId,
          profileSnapshot: hasProfileNamePatch || hasProfileIdPatch
            ? (typeof current.profileSnapshot === "object" && current.profileSnapshot
                ? { ...current.profileSnapshot, profileId: nextProfileId ?? "", profileName: nextProfileName }
                : { profileId: nextProfileId ?? "", profileName: nextProfileName })
            : current.profileSnapshot,
          notes: String(values[`${category}Notes`] ?? current.notes ?? "")
        }
      },
      updatedAt: new Date().toISOString()
    });
  }

  function patchElectronicsPartSelector(category: "servo" | "gyro" | "motor" | "esc", part: PartSelectorValue) {
    const modelKey = category === "motor" ? "motorModel" : `${category}Model`;
    const slugKey = category === "motor" ? "motorSlug" : `${category}Slug`;
    const model = part.model || part.customName || "";
    patchElectronics(category, {
      [`${category}Brand`]: part.brand ?? "",
      [modelKey]: model,
      [slugKey]: part.catalogItemId ?? "",
      [`${category}PartNumber`]: part.partNumber ?? "",
      [`${category}CanonicalProductId`]: part.canonicalProductId ?? "",
      [`${category}CanonicalVariantId`]: part.canonicalVariantId ?? "",
      [`${category}VariantLabel`]: part.variantLabel ?? "",
      [`${category}CustomName`]: part.customName ?? "",
      [`${category}Notes`]: part.notes ?? "",
      ...(category === "motor" ? { motor: model } : {})
    });
  }

  function applyBasicProfile(category: ProfiledElectronicsCategory, profileId: string) {
    const profile = electronicsProfiles.find((item) => item.id === profileId);
    if (!profile) return;
    const current = tune.electronics?.[category] ?? { brand: "", model: "", settings: {}, notes: "" };
    onChange({
      ...tune,
      values: { ...tune.values, ...profile.values, [`${category}ProfileId`]: profile.id, [`${category}ProfileName`]: profile.name },
      electronics: {
        ...(tune.electronics ?? {}),
        [category]: {
          ...current,
          selectedProfileId: profile.id,
          profileSnapshot: electronicsProfileSnapshot(profile),
          settings: { ...(current.settings ?? {}), ...profile.values }
        }
      },
      updatedAt: new Date().toISOString()
    });
  }

  function saveBasicProfile(category: ProfiledElectronicsCategory, name: string) {
    const profileName = name.trim() || `${electronicsProfileLabels[category]} Tune Profile`;
    const values = { ...profileValuesForCategory(tune, category), [`${category}ProfileName`]: profileName };
    onSaveElectronicsProfile({
      id: `electronics-${category}-${profileName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`,
      type: category,
      name: profileName,
      values,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    patchElectronics(category, { [`${category}ProfileName`]: profileName });
  }

  function updateBasicElectronicsSetting(category: ElectronicsCategory, key: string, value: ElectronicsSettingValue) {
    const current = tune.electronics?.[category] ?? { brand: "", model: "", slug: "", settings: {}, notes: "" };
    onChange({
      ...tune,
      values: { ...tune.values, [`${category}_${key}`]: value },
      electronics: {
        ...(tune.electronics ?? {}),
        [category]: {
          ...current,
          settings: {
            ...(current.settings ?? {}),
            [key]: value
          }
        }
      },
      updatedAt: new Date().toISOString()
    });
  }

  function patchElectronicsEntryMode(category: ProfiledElectronicsCategory, mode: "manual" | "photo") {
    const current = tune.electronics?.[category] ?? { brand: "", model: "", slug: "", settings: {}, notes: "" };
    onChange({
      ...tune,
      values: { ...tune.values, [`${category}TuneEntryMode`]: mode },
      electronics: {
        ...(tune.electronics ?? {}),
        [category]: {
          ...current,
          tuneEntryMode: mode
        }
      },
      updatedAt: new Date().toISOString()
    });
  }

  function patchElectronicsTunePhotos(category: ProfiledElectronicsCategory, photos: TunePhoto[]) {
    const current = tune.electronics?.[category] ?? { brand: "", model: "", slug: "", settings: {}, notes: "" };
    onChange({
      ...tune,
      electronics: {
        ...(tune.electronics ?? {}),
        [category]: {
          ...current,
          tunePhotos: photos
        }
      },
      updatedAt: new Date().toISOString()
    });
  }

  return (
    <section className="basicTuneStack wizardTuneStack" aria-label="Guided Basic Tune wizard">
      {activeTabId === "chassis" ? (
      <>
      <article className="builderSectionCard basicTuneCard wizardIntroCard">
        <header>
          <strong>Chassis</strong>
          <span>Pick the platform first. Every product field still supports Custom / Other.</span>
        </header>
        <BufferedTextField
          label="Tune title"
          value={tune.name}
          placeholder="Name this setup"
          onCommit={(value) => onChange({ ...tune, name: value, tuneName: value, values: { ...tune.values, name: value, tuneName: value }, updatedAt: new Date().toISOString() })}
        />
      </article>

      <article className="builderSectionCard basicTuneCard">
        <header><strong>1. Chassis</strong><span>Start with the platform, deck, and transmission.</span></header>
        <div className="builderFieldGrid">
          <div className="chassisBrandPreview"><BrandLogo brandSlug={brandSlug} size="large" /><span>{car?.name ?? "Selected car"}</span></div>
          <div className="formSplit">
            <SelectField label="Chassis brand" value={brandSlug} onChange={(event) => {
              const brand = findChassisBrand(event.target.value);
              const model = brand?.models[0] ?? "Custom";
              onChange({ ...tune, chassisBrand: brand?.name ?? "Other / Custom", chassisBrandSlug: event.target.value, chassisModel: model, chassisModelSlug: slugifyChassis(model), updatedAt: new Date().toISOString() });
            }}>{chassisBrands.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}</SelectField>
            <SelectField label="Chassis model" value={selectedModel} onChange={(event) => onChange({ ...tune, chassisModel: event.target.value, chassisModelSlug: slugifyChassis(event.target.value), updatedAt: new Date().toISOString() })}>{[...models, "Custom / Other"].map((model) => <option key={model}>{model}</option>)}</SelectField>
          </div>
          {brandSlug === "other" || selectedModel === "Custom" || selectedModel === "Custom / Other" ? <div className="formSplit"><TextField label="Custom chassis brand" value={tune.customChassisBrand ?? ""} placeholder="Type brand" onChange={(event) => onChange({ ...tune, customChassisBrand: event.target.value, updatedAt: new Date().toISOString() })} /><TextField label="Custom chassis model" value={tune.customChassisModel ?? ""} placeholder="Type model" onChange={(event) => onChange({ ...tune, customChassisModel: event.target.value, chassisModel: event.target.value || selectedModel, chassisModelSlug: slugifyChassis(event.target.value || selectedModel), updatedAt: new Date().toISOString() })} /></div> : null}
          <PartSelector
            label="Chassis catalog product"
            category="chassis"
            value={selectorValueFromFields("chassisCatalogProduct", "chassisBrand", "chassis", chassisInfo.brand, String(tune.values.chassisCatalogProduct ?? tune.chassisModel ?? ""))}
            emptyLabel="Select chassis product"
            allowStock={false}
            onChange={(part) => {
              const model = part.model || part.customName || "";
              patchPartSelector("chassisCatalogProduct", "chassisBrand", "chassis", part);
              if (model && model !== BASIC_CUSTOM_OPTION) {
                onChange({ ...tune, chassisModel: model, chassisModelSlug: slugifyChassis(model), values: { ...tune.values, chassisCatalogProduct: model, chassisBrand: part.brand ?? chassisInfo.brand }, selections: { ...tune.selections, chassisCatalogProduct: part.catalogItemId ?? model }, updatedAt: new Date().toISOString() });
              }
            }}
          />
          <PartSelector
            label="Upper deck"
            category="upperDecks"
            value={selectorValueFromFields("upperDeck", "upperDeckBrand", "upperDecks", String(tune.values.upperDeckBrand ?? tune.values.deckBrand ?? tune.chassisBrand ?? chassisInfo.brand ?? ""), String(tune.values.upperDeck ?? ""))}
            emptyLabel="Select upper deck"
            onChange={(part) => patchPartSelector("upperDeck", "upperDeckBrand", "upperDecks", part)}
          />
          <PartSelector
            label="Lower deck / main chassis plate"
            category="lowerDecks"
            value={selectorValueFromFields("lowerDeck", "lowerDeckBrand", "lowerDecks", String(tune.values.lowerDeckBrand ?? tune.values.deckBrand ?? tune.chassisBrand ?? chassisInfo.brand ?? ""), String(tune.values.lowerDeck ?? tune.values.chassisDeck ?? tune.chassisSetup?.chassis?.deck ?? ""))}
            emptyLabel="Select lower deck"
            onChange={(part) => {
              const brand = part.brand ?? "";
              const model = part.model || part.customName || "";
              patchPartSelector("lowerDeck", "lowerDeckBrand", "lowerDecks", part, { chassisDeck: model, deckBrand: brand });
            }}
          />
          <fieldset className="wizardChoiceGroup"><legend>Transmission</legend>{[BEGINNER_NOT_SURE_OPTION, "3 gear", "4 gear"].map((option) => <label key={option}><input type="radio" name={`transmission-${tune.id}`} checked={tune.values.transmissionGear === option} onChange={() => patchValues({ transmissionGear: option })} /><span>{option}</span></label>)}</fieldset>
          <div className="formSplit">
            <SelectField label="Battery mount position" value={String(tune.values.batteryPosition ?? "")} onChange={(event) => patchValues({ batteryPosition: event.target.value })}>
              <option value="">Skip for now</option>
              {["Not sure", "Front", "Middle", "Rear", "Left side", "Right side", "Transverse", "Longitudinal", "Stock"].map((option) => <option key={option}>{option}</option>)}
            </SelectField>
            <SelectField label="Servo mount position" value={String(tune.values.servoPosition ?? "")} onChange={(event) => patchValues({ servoPosition: event.target.value })}>
              <option value="">Skip for now</option>
              {["Not sure", "Front", "Middle", "Rear", "Stock"].map((option) => <option key={option}>{option}</option>)}
            </SelectField>
          </div>
          <TextAreaField label="Other chassis customizations" value={String(tune.values.chassisCustomizations ?? tune.values.conversionKit ?? "")} placeholder="Conversion kits, option parts, special notes..." onChange={(event) => patchValues({ chassisCustomizations: event.target.value, conversionKit: event.target.value })} />
        </div>
      </article>
      </>
      ) : null}

      {activeTabId === "track" ? (
      <BasicTuneSection title="Track" helper="Save where this setup is meant to run. You can leave either field blank and finish it later.">
        <TextField label="Track name" value={tune.track} placeholder="Track or location name" onChange={(event) => onChange({ ...tune, track: event.target.value, values: { ...tune.values, track: event.target.value }, updatedAt: new Date().toISOString() })} />
        <SelectField label="Surface" value={tune.surface} onChange={(event) => onChange({ ...tune, surface: event.target.value, values: { ...tune.values, surface: event.target.value }, updatedAt: new Date().toISOString() })}>
          {["", BEGINNER_NOT_SURE_OPTION, "P-tile", "Carpet", "Asphalt", "Polished concrete", "Epoxy", "Painted concrete", "Other / Custom"].map((surface) => <option key={surface} value={surface}>{surface || "Skip for now"}</option>)}
        </SelectField>
      </BasicTuneSection>
      ) : null}

      {activeTabId === "tires" ? (
      <>
      <BasicTuneSection title="Tires">
        <PartSelector
          label="Front tire"
          category="tires"
          value={selectorValueFromFields("frontTire", "frontTireBrand", "tires", String(tune.values.frontTireBrand ?? ""), String(tune.values.frontTire ?? ""))}
          emptyLabel="Select front tire"
          onChange={(part) => patchPartSelector("frontTire", "frontTireBrand", "tires", part)}
        />
        <TextField label="Front Tire Compound" value={String(tune.values.frontTireCompound ?? "")} placeholder="ex. LF-4, LF-5, hard, soft" onChange={(event) => patchValues({ frontTireCompound: event.target.value })} />
        <PartSelector
          label="Rear tire"
          category="tires"
          value={selectorValueFromFields("rearTire", "rearTireBrand", "tires", String(tune.values.rearTireBrand ?? ""), String(tune.values.rearTire ?? ""))}
          emptyLabel="Select rear tire"
          onChange={(part) => patchPartSelector("rearTire", "rearTireBrand", "tires", part)}
        />
        <TextField label="Rear Tire Compound" value={String(tune.values.rearTireCompound ?? "")} placeholder="ex. LF-4, LF-5, hard, soft" onChange={(event) => patchValues({ rearTireCompound: event.target.value })} />
      </BasicTuneSection>
      <BasicTuneSection title="Wheels">
        <PartSelector
          label="Front wheel"
          category="frontWheels"
          value={selectorValueFromFields("frontWheel", "frontWheelBrand", "frontWheels", String(tune.chassisSetup?.front?.wheel?.brand ?? tune.values.frontWheelBrand ?? ""), String(tune.chassisSetup?.front?.wheel?.model ?? tune.values.frontWheel ?? ""))}
          emptyLabel="Select front wheel"
          onChange={(part) => patchPartSelector("frontWheel", "frontWheelBrand", "frontWheels", part)}
        />
        <div className="formSplit">
          <BasicChoice fieldId="frontWheelOffset" ownerId={tune.ownerId} label="Front wheel offset" value={String(tune.values.frontWheelOffset ?? tune.chassisSetup?.front?.wheel?.offset ?? "")} options={basicTuneOptions.wheelOffset} onChange={(value) => patchValues({ frontWheelOffset: value })} />
          <TextField label="Front Wheel Width" value={String(tune.values.frontWheelWidth ?? tune.chassisSetup?.front?.wheel?.width ?? "")} placeholder="ex. 26mm" onChange={(event) => patchValues({ frontWheelWidth: event.target.value })} />
        </div>
        <PartSelector
          label="Rear wheel"
          category="rearWheels"
          value={selectorValueFromFields("rearWheel", "rearWheelBrand", "rearWheels", String(tune.chassisSetup?.rear?.wheel?.brand ?? tune.values.rearWheelBrand ?? ""), String(tune.chassisSetup?.rear?.wheel?.model ?? tune.values.rearWheel ?? ""))}
          emptyLabel="Select rear wheel"
          onChange={(part) => patchPartSelector("rearWheel", "rearWheelBrand", "rearWheels", part)}
        />
        <div className="formSplit">
          <BasicChoice fieldId="rearWheelOffset" ownerId={tune.ownerId} label="Rear wheel offset" value={String(tune.values.rearWheelOffset ?? tune.chassisSetup?.rear?.wheel?.offset ?? "")} options={basicTuneOptions.wheelOffset} onChange={(value) => patchValues({ rearWheelOffset: value })} />
          <TextField label="Rear Wheel Width" value={String(tune.values.rearWheelWidth ?? tune.chassisSetup?.rear?.wheel?.width ?? "")} placeholder="ex. 26mm" onChange={(event) => patchValues({ rearWheelWidth: event.target.value })} />
        </div>
      </BasicTuneSection>
      </>
      ) : null}

      {activeTabId === "front" || activeTabId === "rear" ? (
      <BasicTuneSection title={activeTabId === "front" ? "Front setup" : "Rear setup"} helper={activeTabId === "front" ? "Front suspension, steering, shock, and wheel parts only." : "Rear suspension, toe, hub, shock, and wheel parts only."}>
        {activeTabId === "front" ? (
        <>
        <TuneSubcategory title="Core front parts" helper="The main pieces most drivers check first.">
        <PartSelector
          label="Front shock tower"
          category="frontShockTowers"
          value={selectorValueFromFields("frontShockTower", "frontShockTowerBrand", "frontShockTowers")}
          emptyLabel="Select front shock tower"
          helper={beginnerHelpers.frontShockTower}
          onChange={(part) => patchPartSelector("frontShockTower", "frontShockTowerBrand", "frontShockTowers", part)}
        />
        <PartSelector
          label="Front damper"
          category="dampers"
          value={selectorValueFromFields("frontDamper", "frontDamperBrand", "dampers", String(tune.chassisSetup?.front?.dampers?.brand ?? ""), String(tune.chassisSetup?.front?.dampers?.model ?? ""))}
          emptyLabel="Select front damper"
          helper={beginnerHelpers.frontDamper}
          onChange={(part) => patchPartSelector("frontDamper", "frontDamperBrand", "dampers", part)}
        />
        <PartSelector
          label="Front lower arm"
          category="frontLowerArms"
          value={selectorValueFromFields("frontLowerArm", "frontLowerArmBrand", "frontLowerArms", String(tune.chassisSetup?.front?.lowerArm?.brand ?? ""), String(tune.chassisSetup?.front?.lowerArm?.model ?? ""))}
          emptyLabel="Select front lower arm"
          helper={beginnerHelpers.frontLowerArm}
          onChange={(part) => patchPartSelector("frontLowerArm", "frontLowerArmBrand", "frontLowerArms", part)}
        />
        <PartSelector
          label="Front upper arm"
          category="frontUpperArms"
          value={selectorValueFromFields("frontUpperArm", "frontUpperArmBrand", "frontUpperArms", String(tune.chassisSetup?.front?.upperArm?.brand ?? ""), String(tune.values.frontUpperLink ?? tune.chassisSetup?.front?.upperArm?.model ?? ""))}
          emptyLabel="Select front upper arm"
          helper={beginnerHelpers.frontUpperArm}
          onChange={(part) => patchPartSelector("frontUpperArm", "frontUpperArmBrand", "frontUpperArms", part, { frontUpperLink: part.model || part.customName || "" })}
        />
        </TuneSubcategory>
        <TuneSubcategory title="Front shock details" helper="Piston, shaft, and oil details for deeper shock notes." defaultOpen={false}>
        <PartSelector
          label="Front piston"
          category="shockPistons"
          value={selectorValueFromFields("frontShockPiston", "frontShockPistonBrand", "shockPistons", String(tune.values.shockPistonBrand ?? ""), String(tune.values.frontPiston ?? ""))}
          emptyLabel="Select front piston"
          onChange={(part) => patchPartSelector("frontShockPiston", "frontShockPistonBrand", "shockPistons", part, { frontPiston: part.model || part.customName || "" })}
        />
        <PartSelector
          label="Front shock shaft"
          category="shockShafts"
          value={selectorValueFromFields("frontShockShaft", "frontShockShaftBrand", "shockShafts", String(tune.values.shockShaftBrand ?? ""))}
          emptyLabel="Select front shock shaft"
          onChange={(part) => patchPartSelector("frontShockShaft", "frontShockShaftBrand", "shockShafts", part)}
        />
        <PartSelector
          label="Front damper oil"
          category="damperOils"
          value={selectorValueFromFields("frontShockOil", "frontDamperOilBrand", "damperOils", String(tune.values.damperOilBrand ?? ""))}
          emptyLabel="Select front damper oil"
          onChange={(part) => patchPartSelector("frontShockOil", "frontDamperOilBrand", "damperOils", part)}
        />
        </TuneSubcategory>
        <TuneSubcategory title="Front suspension mounts" helper="FF/FR mount choices and visual insert helper." defaultOpen={false}>
        <PartSelector
          label="FF suspension mount"
          category="frontToeBlocks"
          value={selectorValueFromFields("ffToeBlock", "ffToeBlockBrand", "frontToeBlocks", String(tune.values.frontToeBlockBrand ?? tune.chassisSetup?.front?.toeBlock?.brand ?? ""), String(tune.values.frontToeBlock ?? tune.chassisSetup?.front?.toeBlock?.model ?? ""))}
          emptyLabel="Select FF mount"
          helper="Front-front suspension mount / toe block."
          onChange={(part) => patchPartSelector("ffToeBlock", "ffToeBlockBrand", "frontToeBlocks", part, {
            ...(tune.values.frontToeBlock ? {} : { frontToeBlock: part.model || part.customName || "" }),
            ...(tune.values.frontToeBlockBrand ? {} : { frontToeBlockBrand: part.brand || "" })
          })}
        />
        {renderSuspensionMountVisual({
          helperId: "ffToeBlock",
          label: "FF suspension mount",
          partCategory: "frontToeBlocks",
          partBrand: String(tune.values.ffToeBlockBrand ?? tune.values.frontToeBlockBrand ?? "")
        })}
        <PartSelector
          label="FR suspension mount"
          category="frontToeBlocks"
          value={selectorValueFromFields("frToeBlock", "frToeBlockBrand", "frontToeBlocks", String(tune.values.frontToeBlockBrand ?? tune.chassisSetup?.front?.toeBlock?.brand ?? ""), String(tune.values.frontToeBlock ?? tune.chassisSetup?.front?.toeBlock?.model ?? ""))}
          emptyLabel="Select FR mount"
          helper="Front-rear suspension mount / toe block."
          onChange={(part) => patchPartSelector("frToeBlock", "frToeBlockBrand", "frontToeBlocks", part, {
            ...(tune.values.frontToeBlock ? {} : { frontToeBlock: part.model || part.customName || "" }),
            ...(tune.values.frontToeBlockBrand ? {} : { frontToeBlockBrand: part.brand || "" })
          })}
        />
        {renderSuspensionMountVisual({
          helperId: "frToeBlock",
          label: "FR suspension mount",
          partCategory: "frontToeBlocks",
          partBrand: String(tune.values.frToeBlockBrand ?? tune.values.frontToeBlockBrand ?? "")
        })}
        </TuneSubcategory>
        </>
        ) : (
        <>
        <TuneSubcategory title="Core rear parts" helper="Rear shocks, arms, and hub carrier essentials.">
        <PartSelector
          label="Rear shock tower"
          category="rearShockTowers"
          value={selectorValueFromFields("rearShockTower", "rearShockTowerBrand", "rearShockTowers")}
          emptyLabel="Select rear shock tower"
          helper={beginnerHelpers.rearShockTower}
          onChange={(part) => patchPartSelector("rearShockTower", "rearShockTowerBrand", "rearShockTowers", part)}
        />
        <PartSelector
          label="Rear damper"
          category="dampers"
          value={selectorValueFromFields("rearDamper", "rearDamperBrand", "dampers", String(tune.chassisSetup?.rear?.dampers?.brand ?? ""), String(tune.chassisSetup?.rear?.dampers?.model ?? ""))}
          emptyLabel="Select rear damper"
          helper={beginnerHelpers.rearDamper}
          onChange={(part) => patchPartSelector("rearDamper", "rearDamperBrand", "dampers", part)}
        />
        <PartSelector
          label="Rear lower arm"
          category="rearLowerArms"
          value={selectorValueFromFields("rearLowerArm", "rearLowerArmBrand", "rearLowerArms", String(tune.chassisSetup?.rear?.lowerArm?.brand ?? ""), String(tune.chassisSetup?.rear?.lowerArm?.model ?? ""))}
          emptyLabel="Select rear lower arm"
          helper={beginnerHelpers.rearLowerArm}
          onChange={(part) => patchPartSelector("rearLowerArm", "rearLowerArmBrand", "rearLowerArms", part)}
        />
        {isReveDRearLowerArm ? (
          <fieldset className="wizardChoiceGroup fieldWide">
            <legend>Reve D rear lower arm side</legend>
            {["Straight", "Curved"].map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name={`rear-lower-arm-side-${tune.id}`}
                  checked={String(tune.values.rearLowerArmSide ?? tune.chassisSetup?.rear?.lowerArm?.side ?? "") === option}
                  onChange={() => patchValues({ rearLowerArmSide: option })}
                />
                <span>{option}</span>
              </label>
            ))}
            <small className="fieldHelper">{beginnerHelpers.rearLowerArmSide}</small>
          </fieldset>
        ) : null}
        <PartSelector
          label="Rear upper arm"
          category="rearUpperArms"
          value={selectorValueFromFields("rearUpperArm", "rearUpperArmBrand", "rearUpperArms", String(tune.chassisSetup?.rear?.upperArm?.brand ?? ""), String(tune.values.rearUpperLink ?? tune.chassisSetup?.rear?.upperArm?.model ?? ""))}
          emptyLabel="Select rear upper arm"
          helper={beginnerHelpers.rearUpperArm}
          onChange={(part) => patchPartSelector("rearUpperArm", "rearUpperArmBrand", "rearUpperArms", part, { rearUpperLink: part.model || part.customName || "" })}
        />
        </TuneSubcategory>
        <TuneSubcategory title="Rear shock details" helper="Mounting note, piston, shaft, and oil details." defaultOpen={false}>
        <PartSelector
          label="Rear piston"
          category="shockPistons"
          value={selectorValueFromFields("rearShockPiston", "rearShockPistonBrand", "shockPistons", String(tune.values.shockPistonBrand ?? ""), String(tune.values.rearPiston ?? ""))}
          emptyLabel="Select rear piston"
          onChange={(part) => patchPartSelector("rearShockPiston", "rearShockPistonBrand", "shockPistons", part, { rearPiston: part.model || part.customName || "" })}
        />
        <PartSelector
          label="Rear shock shaft"
          category="shockShafts"
          value={selectorValueFromFields("rearShockShaft", "rearShockShaftBrand", "shockShafts", String(tune.values.shockShaftBrand ?? ""))}
          emptyLabel="Select rear shock shaft"
          onChange={(part) => patchPartSelector("rearShockShaft", "rearShockShaftBrand", "shockShafts", part)}
        />
        <PartSelector
          label="Rear damper oil"
          category="damperOils"
          value={selectorValueFromFields("rearShockOil", "rearDamperOilBrand", "damperOils", String(tune.values.damperOilBrand ?? ""))}
          emptyLabel="Select rear damper oil"
          onChange={(part) => patchPartSelector("rearShockOil", "rearDamperOilBrand", "damperOils", part)}
        />
        <div className="builderField fieldWide">
          <TextAreaField
            label="Rear shock mounting location"
            value={String(tune.values.rearShockMountingNotes ?? "")}
            placeholder="ex. Lower arm 3rd hole from outside; top spaced 6mm from the shock tower"
            rows={3}
            onChange={(event) => patchValues({ rearShockMountingNotes: event.target.value })}
          />
          <small className="fieldHelper">{beginnerHelpers.rearShockMountingNotes}</small>
        </div>
        </TuneSubcategory>
        <TuneSubcategory title="Rear suspension mounts" helper="RF/RR mount choices and visual insert helper." defaultOpen={false}>
        <PartSelector
          label="RF suspension mount"
          category="rearToeBlocks"
          value={selectorValueFromFields("rfToeBlock", "rfToeBlockBrand", "rearToeBlocks", String(tune.values.rearToeBlockBrand ?? tune.chassisSetup?.rear?.toeBlock?.brand ?? ""), String(tune.values.toeBlockSuspensionMount ?? tune.values.rearToeBlock ?? tune.chassisSetup?.rear?.toeBlock?.model ?? ""))}
          emptyLabel="Select RF mount"
          helper="Rear-front suspension mount / toe block."
          onChange={(part) => patchPartSelector("rfToeBlock", "rfToeBlockBrand", "rearToeBlocks", part, {
            ...(tune.values.rearToeBlock || tune.values.toeBlockSuspensionMount ? {} : { rearToeBlock: part.model || part.customName || "", toeBlockSuspensionMount: part.model || part.customName || "" }),
            ...(tune.values.rearToeBlockBrand ? {} : { rearToeBlockBrand: part.brand || "" })
          })}
        />
        {renderSuspensionMountVisual({
          helperId: "rfToeBlock",
          label: "RF suspension mount",
          partCategory: "rearToeBlocks",
          partBrand: String(tune.values.rfToeBlockBrand ?? tune.values.rearToeBlockBrand ?? "")
        })}
        <PartSelector
          label="RR suspension mount"
          category="rearToeBlocks"
          value={selectorValueFromFields("rrToeBlock", "rrToeBlockBrand", "rearToeBlocks", String(tune.values.rearToeBlockBrand ?? tune.chassisSetup?.rear?.toeBlock?.brand ?? ""), String(tune.values.toeBlockSuspensionMount ?? tune.values.rearToeBlock ?? tune.chassisSetup?.rear?.toeBlock?.model ?? ""))}
          emptyLabel="Select RR mount"
          helper="Rear-rear suspension mount / toe block."
          onChange={(part) => patchPartSelector("rrToeBlock", "rrToeBlockBrand", "rearToeBlocks", part, {
            ...(tune.values.rearToeBlock || tune.values.toeBlockSuspensionMount ? {} : { rearToeBlock: part.model || part.customName || "", toeBlockSuspensionMount: part.model || part.customName || "" }),
            ...(tune.values.rearToeBlockBrand ? {} : { rearToeBlockBrand: part.brand || "" })
          })}
        />
        {renderSuspensionMountVisual({
          helperId: "rrToeBlock",
          label: "RR suspension mount",
          partCategory: "rearToeBlocks",
          partBrand: String(tune.values.rrToeBlockBrand ?? tune.values.rearToeBlockBrand ?? "")
        })}
        </TuneSubcategory>
        <TuneSubcategory title="Miscellaneous" helper="Optional rear sway bar notes." defaultOpen={false}>
          <div className="formSplit">
            <TextField
              label="Sway Bar"
              value={String(tune.values.rearSwayBar ?? "")}
              placeholder="ex. Yokomo rear sway bar, soft, none"
              onChange={(event) => patchValues({ rearSwayBar: event.target.value })}
            />
            <TextField
              label="Sway bar thickness"
              value={String(tune.values.rearSwayBarThickness ?? "")}
              placeholder="ex. 1.2mm"
              onChange={(event) => patchValues({ rearSwayBarThickness: event.target.value })}
            />
          </div>
        </TuneSubcategory>
        </>
        )}
      </BasicTuneSection>
      ) : null}

      {activeTabId === "electronics" ? (
      <BasicTuneSection title="Motor" defaultOpen>
        <TuneSubcategory title="Motor product" helper="Choose the main motor first. Upgrades and notes stay nested underneath it.">
        <PartSelector
          label="Motor"
          category="motors"
          value={selectorValueFromFields("motorModel", "motorBrand", "motors", String(tune.electronics?.motor?.brand ?? ""), String(tune.values.motor ?? tune.electronics?.motor?.model ?? ""))}
          emptyLabel="Select motor"
          allowStock={false}
          onChange={(part) => patchElectronicsPartSelector("motor", part)}
        />
        <BasicChoice fieldId="motorTurns" ownerId={tune.ownerId} label="Motor turn" value={String(tune.values.motorTurns ?? tune.electronics?.motor?.turns ?? "")} options={basicTuneOptions.motorTurn} helper="Common drift motors are often 10.5T, 11.5T, 13.5T, 15.5T, or 17.5T. Use Custom / Other if your motor is different." onChange={(value) => patchElectronics("motor", { motorTurns: value, motorBrand: tune.values.motorBrand ?? tune.electronics?.motor?.brand ?? "", motorModel: tune.values.motorModel ?? tune.values.motor ?? tune.electronics?.motor?.model ?? "" })} />
        </TuneSubcategory>
        <TuneSubcategory title="Motor upgrades" helper="Optional rotor and stator changes. Leave blank if the motor is stock.">
        <PartSelector
          label="Rotor upgrade"
          category="motorRotors"
          value={selectorValueFromFields("motorRotor", "motorBrand", "motorRotors", String(tune.electronics?.motor?.brand ?? ""), String(tune.electronics?.motor?.rotor ?? ""))}
          emptyLabel="Select rotor upgrade"
          onChange={(part) => {
            patchPartSelector("motorRotor", "motorBrand", "motorRotors", part);
            patchElectronics("motor", { motorRotor: part.model || part.customName || "", motorBrand: part.brand ?? tune.values.motorBrand ?? tune.electronics?.motor?.brand ?? "", motorModel: tune.values.motorModel ?? tune.values.motor ?? tune.electronics?.motor?.model ?? "" });
          }}
        />
        <PartSelector
          label="Stator upgrade"
          category="motorStators"
          value={selectorValueFromFields("motorStator", "motorBrand", "motorStators")}
          emptyLabel="Select stator upgrade"
          onChange={(part) => patchPartSelector("motorStator", "motorBrand", "motorStators", part)}
        />
        </TuneSubcategory>
        <TuneSubcategory title="Motor notes" helper="Freeform notes for timing, fan, feel, or anything not in the catalog.">
        <TextAreaField label="Motor notes" value={String(tune.values.motorTuneNotes ?? tune.electronics?.motor?.notes ?? "")} placeholder="Timing, rotor notes, fan, motor feel..." onChange={(event) => patchElectronics("motor", { motorNotes: event.target.value, motorBrand: tune.values.motorBrand ?? tune.electronics?.motor?.brand ?? "", motorModel: tune.values.motorModel ?? tune.values.motor ?? tune.electronics?.motor?.model ?? "" })} />
        </TuneSubcategory>
      </BasicTuneSection>
      ) : null}

      {activeTabId === "drivetrain" ? (
      <BasicTuneSection title="Gearing">
        <div className="formSplit">
          <TextField label="Pinion size" value={String(tune.values.pinionGear ?? "")} placeholder="ex. 25" inputMode="numeric" onChange={(event) => patchGearing({ pinionGear: event.target.value })} />
          <TextField label="Spur size" value={String(tune.values.spurGear ?? "")} placeholder="ex. 78" inputMode="numeric" onChange={(event) => patchGearing({ spurGear: event.target.value })} />
        </div>
        <div className="formSplit">
          <TextField label="Internal ratio" value={internalDriveRatioValue} placeholder={internalRatioPreset ? String(internalRatioPreset.internalRatio) : "ex. 2.6"} inputMode="decimal" onChange={(event) => patchGearing({ internalDriveRatio: event.target.value })} />
          <TextField label="Final drive ratio / FDR" value={String(tune.values.finalDriveRatio ?? "")} placeholder="Auto calculated" inputMode="decimal" onChange={(event) => patchValues({ finalDriveRatio: event.target.value, fdrAuto: false })} />
        </div>
        <small className="fieldHelper">
          FDR auto-calculates as spur teeth ÷ pinion teeth × internal ratio. {internalRatioPreset ? `${internalRatioPreset.label} defaults to ${internalRatioPreset.internalRatio} (${internalRatioPreset.sourceNote}).` : "No verified brand-specific internal ratio is set for this chassis yet, so enter the internal ratio from the manual if you know it."}
        </small>
        <div className="buttonRow">
          <button
            type="button"
            className="smallPill"
            disabled={!autoFdrValue}
            onClick={() => patchValues({ finalDriveRatio: autoFdrValue, internalDriveRatio: internalDriveRatioValue, fdrAuto: true })}
          >
            Use auto FDR{autoFdrValue ? ` ${autoFdrValue}` : ""}
          </button>
          <span className="fieldHelper">{fdrAutoEnabled ? "Auto FDR is on." : "Manual FDR override is on."}</span>
        </div>
        <TextField label="Gear pitch" value={String(tune.values.gearPitch ?? "")} placeholder="48P, 64P, MOD" onChange={(event) => patchValues({ gearPitch: event.target.value })} />
      </BasicTuneSection>
      ) : null}

      {activeTabId === "drivetrain" ? (
      <BasicTuneSection title="Differential">
        <BasicChoice fieldId="diffType" ownerId={tune.ownerId} label="Differential type" value={String(tune.values.diffType ?? "")} options={["Gear diff", "Ball diff", "Spool / solid axle", "LSD", "Not sure", BASIC_CUSTOM_OPTION]} onChange={(value) => patchValues({ diffType: value })} />
        <PartSelector
          label="Differential product"
          category="differentials"
          value={selectorValueFromFields("differentialProduct", "differentialBrand", "differentials")}
          emptyLabel="Select differential product"
          helper={beginnerHelpers.differentialProduct}
          onChange={(part) => patchPartSelector("differentialProduct", "differentialBrand", "differentials", part, { diffType: part.model || part.customName || tune.values.diffType || "" })}
        />
        <div className="formSplit">
          <TextField label="Diff oil" value={String(tune.values.diffOil ?? tune.values.gearDiffOil ?? "")} placeholder="ex. 5000, 10000" onChange={(event) => patchValues({ diffOil: event.target.value, gearDiffOil: event.target.value })} />
          <TextField label="Diff grease" value={String(tune.values.diffGrease ?? "")} placeholder="Grease / lube notes" onChange={(event) => patchValues({ diffGrease: event.target.value })} />
        </div>
        <TextAreaField label="Differential notes" value={String(tune.values.diffShimSetup ?? tune.values.lsdSetting ?? "")} placeholder="Shim setup, tightness, LSD plates, spool notes..." onChange={(event) => patchValues({ diffShimSetup: event.target.value, lsdSetting: event.target.value })} />
      </BasicTuneSection>
      ) : null}

      {activeTabId === "esc" ? (
      <BasicTuneSection title="ESC" defaultOpen>
        <TuneSubcategory title="ESC product" helper="Main speed controller brand and product.">
        <PartSelector
          label="ESC"
          category="escs"
          value={selectorValueFromFields("escModel", "escBrand", "escs", String(tune.electronics?.esc?.brand ?? ""), String(tune.electronics?.esc?.model ?? ""))}
          emptyLabel="Select ESC"
          allowStock={false}
          onChange={(part) => patchElectronicsPartSelector("esc", part)}
        />
        </TuneSubcategory>
        <TuneSubcategory title="ESC add-ons" helper="Optional parts that support the ESC, like capacitors.">
        <PartSelector
          label="Capacitor upgrade"
          category="capacitors"
          value={selectorValueFromFields("powerCapacitor", "capacitorBrand", "capacitors")}
          emptyLabel="Select capacitor upgrade"
          onChange={(part) => patchPartSelector("powerCapacitor", "capacitorBrand", "capacitors", part)}
        />
        {String(tune.values.capacitorBrand ?? "").toLowerCase().includes("acuvance") ? (
          <AcuvancePowerDeviceSettings tune={tune} onChange={patchValues} />
        ) : null}
        </TuneSubcategory>
        <TuneSubcategory title="ESC tune" helper="Manual tune parameters or uploaded programmer screenshots.">
        <ElectronicsTuneEntryChoice category="esc" tune={tune} onModeChange={patchElectronicsEntryMode} onPhotosChange={patchElectronicsTunePhotos} />
        {(tune.electronics?.esc?.tuneEntryMode ?? tune.values.escTuneEntryMode ?? "manual") === "manual" ? (
          <>
            <BasicElectronicsProfilePicker category="esc" tune={tune} profiles={electronicsProfiles.filter((profile) => profile.type === "esc")} value={String(tune.electronics?.esc?.selectedProfileId ?? tune.values.escProfileId ?? "")} nameValue={String(tune.values.escProfileName ?? "")} onApply={applyBasicProfile} onSave={saveBasicProfile} onCreate={(name) => patchElectronics("esc", { escProfileName: name, escBrand: tune.values.escBrand ?? tune.electronics?.esc?.brand ?? "", escModel: tune.values.escModel ?? tune.electronics?.esc?.model ?? "" })} />
            <BasicElectronicsSettingsDisclosure category="esc" tune={tune} onChange={updateBasicElectronicsSetting} />
          </>
        ) : null}
        </TuneSubcategory>
      </BasicTuneSection>
      ) : null}

      {activeTabId === "servo" ? (
      <BasicTuneSection title="Servo" defaultOpen>
        <TuneSubcategory title="Servo product" helper="Main steering servo brand and product.">
        <PartSelector
          label="Servo"
          category="servos"
          value={selectorValueFromFields("servoModel", "servoBrand", "servos", String(tune.electronics?.servo?.brand ?? ""), String(tune.electronics?.servo?.model ?? ""))}
          emptyLabel="Select servo"
          allowStock={false}
          onChange={(part) => patchElectronicsPartSelector("servo", part)}
        />
        </TuneSubcategory>
        <TuneSubcategory title="Servo add-ons" helper="Optional servo horn or steering hardware.">
        <PartSelector
          label="Servo horn"
          category="servoHorns"
          value={selectorValueFromFields("servoHorn", "servoHornBrand", "servoHorns")}
          emptyLabel="Select servo horn"
          onChange={(part) => patchPartSelector("servoHorn", "servoHornBrand", "servoHorns", part)}
        />
        </TuneSubcategory>
        <TuneSubcategory title="Servo tune" helper="Manual tune parameters or uploaded setup screenshots.">
        <ElectronicsTuneEntryChoice category="servo" tune={tune} onModeChange={patchElectronicsEntryMode} onPhotosChange={patchElectronicsTunePhotos} />
        {(tune.electronics?.servo?.tuneEntryMode ?? tune.values.servoTuneEntryMode ?? "manual") === "manual" ? (
          <>
            <BasicElectronicsProfilePicker category="servo" tune={tune} profiles={electronicsProfiles.filter((profile) => profile.type === "servo")} value={String(tune.electronics?.servo?.selectedProfileId ?? tune.values.servoProfileId ?? "")} nameValue={String(tune.values.servoProfileName ?? "")} onApply={applyBasicProfile} onSave={saveBasicProfile} onCreate={(name) => patchElectronics("servo", { servoProfileName: name, servoBrand: tune.values.servoBrand ?? tune.electronics?.servo?.brand ?? "", servoModel: tune.values.servoModel ?? tune.electronics?.servo?.model ?? "" })} />
            <BasicElectronicsSettingsDisclosure category="servo" tune={tune} onChange={updateBasicElectronicsSetting} />
          </>
        ) : null}
        </TuneSubcategory>
      </BasicTuneSection>
      ) : null}

      {activeTabId === "gyro" ? (
      <BasicTuneSection title="Gyro" defaultOpen>
        <TuneSubcategory title="Gyro product" helper="Main gyro brand and product.">
        <PartSelector
          label="Gyro"
          category="gyros"
          value={selectorValueFromFields("gyroModel", "gyroBrand", "gyros", String(tune.electronics?.gyro?.brand ?? ""), String(tune.electronics?.gyro?.model ?? ""))}
          emptyLabel="Select gyro"
          allowStock={false}
          onChange={(part) => patchElectronicsPartSelector("gyro", part)}
        />
        </TuneSubcategory>
        <TuneSubcategory title="Gyro tune" helper="Saved profile and brand-specific editable settings.">
        <BasicElectronicsProfilePicker category="gyro" tune={tune} profiles={electronicsProfiles.filter((profile) => profile.type === "gyro")} value={String(tune.electronics?.gyro?.selectedProfileId ?? tune.values.gyroProfileId ?? "")} nameValue={String(tune.values.gyroProfileName ?? "")} onApply={applyBasicProfile} onSave={saveBasicProfile} onCreate={(name) => patchElectronics("gyro", { gyroProfileName: name, gyroBrand: tune.values.gyroBrand ?? tune.electronics?.gyro?.brand ?? "", gyroModel: tune.values.gyroModel ?? tune.electronics?.gyro?.model ?? "" })} />
        <BasicElectronicsSettingsDisclosure category="gyro" tune={tune} onChange={updateBasicElectronicsSetting} />
        </TuneSubcategory>
      </BasicTuneSection>
      ) : null}

      {activeTabId === "geometry" ? (
      <>
      <BasicTuneSection title="Front geometry" helper="Alignment, shim stack notes, shock holes, steering holes, and front mounting points.">
        <TuneSubcategory title="Front alignment" helper="Core front measurements and shim notes." defaultOpen>
          <div className="formSplit"><TextField label="Front camber (deg)" value={String(tune.values.frontCamber ?? "")} placeholder="ex. -6" onChange={(event) => patchValues({ frontCamber: event.target.value })} /><TextField label="Front toe (deg)" value={String(tune.values.frontToe ?? "")} placeholder="ex. out 1" onChange={(event) => patchValues({ frontToe: event.target.value })} /></div>
          <TextField label="Trail" value={String(tune.values.trail ?? "")} placeholder="Trail / spacer notes" onChange={(event) => patchValues({ trail: event.target.value })} />
          <div className="formSplit"><TextField label="FF toe block shim (mm)" value={String(tune.values.ffToeBlockShim ?? "")} placeholder="ex. 0.5" onChange={(event) => patchValues({ ffToeBlockShim: event.target.value })} /><TextField label="FR toe block shim (mm)" value={String(tune.values.frToeBlockShim ?? "")} placeholder="ex. 1.0" onChange={(event) => patchValues({ frToeBlockShim: event.target.value })} /></div>
          <TextField label="Front anti-dive / kick-up notes" value={String(tune.values.frontAntiDiveNotes ?? "")} placeholder="What the FF/FR shim stack creates" onChange={(event) => patchValues({ frontAntiDiveNotes: event.target.value })} />
        </TuneSubcategory>
        <TuneSubcategory title="Front shock and steering holes" helper="Record the actual holes and steering positions used on the car." defaultOpen={false}>
          {usesOverdoseIfs ? (
            <>
              <GeometryPointPicker label="Overdose IFS damper / rocker position" value={String(tune.values.frontIfsDamperPosition ?? "")} options={ifsMountOptions} helper="Use this instead of a normal front shock tower hole for GALM / Overdose-style inboard front suspension." onChange={(value) => patchValues({ frontIfsDamperPosition: value })} />
              <TextAreaField label="IFS mounting notes" value={String(tune.values.frontIfsMountingNotes ?? "")} placeholder="ex. Front rocker outer hole, damper side inner hole, 2mm spacer" rows={3} onChange={(event) => patchValues({ frontIfsMountingNotes: event.target.value })} />
            </>
          ) : (
            <>
              <GeometryPointPicker label="Front shock tower upper hole" value={String(tune.values.frontShockTowerUpperHole ?? "")} options={shockTowerHoleOptions} helper="Choose the tower hole used by the top of the front damper." onChange={(value) => patchValues({ frontShockTowerUpperHole: value })} />
              <GeometryPointPicker label="Front lower arm damper hole" value={String(tune.values.frontDamperLowerArmHole ?? "")} options={armDamperHoleOptions} helper="Choose the lower arm hole used by the bottom of the front damper." onChange={(value) => patchValues({ frontDamperLowerArmHole: value })} />
              <TextAreaField label="Front damper mounting notes" value={String(tune.values.frontDamperMountingNotes ?? "")} placeholder="ex. Top hole 3, lower arm outer hole, 2mm spacer behind ball end" rows={3} onChange={(event) => patchValues({ frontDamperMountingNotes: event.target.value })} />
            </>
          )}
          <GeometryPointPicker label="Knuckle steering link hole" value={String(tune.values.frontKnuckleSteeringLinkHole ?? "")} options={steeringMountHoleOptions} helper="Record the steering link position on the knuckle or knuckle plate." onChange={(value) => patchValues({ frontKnuckleSteeringLinkHole: value })} />
          <GeometryPointPicker label="Knuckle upper link / kingpin hole" value={String(tune.values.frontKnuckleUpperLinkHole ?? "")} options={steeringMountHoleOptions} helper="Use for multi-hole knuckles or upper-link plates." onChange={(value) => patchValues({ frontKnuckleUpperLinkHole: value })} />
          <GeometryPointPicker label="Bellcrank Ackerman hole" value={String(tune.values.bellcrankAckermanHole ?? "")} options={steeringMountHoleOptions} helper="Record the bellcrank hole used by the steering link." onChange={(value) => patchValues({ bellcrankAckermanHole: value })} />
          <GeometryPointPicker label="Sliding rack position" value={String(tune.values.slideRackPosition ?? "")} options={slideRackPositionOptions} helper="For slide-rack cars, record the rack or link position." onChange={(value) => patchValues({ slideRackPosition: value })} />
          <GeometryPointPicker label="DDSS hole" value={String(tune.values.ddssHole ?? "")} options={ddssHoleOptions} helper="For DDSS / direct steering systems, record the active steering hole." onChange={(value) => patchValues({ ddssHole: value })} />
        </TuneSubcategory>
      </BasicTuneSection>
      <BasicTuneSection title="Rear geometry" helper="Rear alignment, suspension mount shims, shock holes, hub holes, and damper mounting notes.">
        <TuneSubcategory title="Rear alignment" helper="Core rear measurements and shim notes." defaultOpen>
          <div className="formSplit"><TextField label="Rear camber (deg)" value={String(tune.values.rearCamber ?? "")} placeholder="ex. -3" onChange={(event) => patchValues({ rearCamber: event.target.value })} /><TextField label="Rear toe (deg)" value={String(tune.values.rearToe ?? "")} placeholder="ex. in 3" onChange={(event) => patchValues({ rearToe: event.target.value })} /></div>
          <div className="formSplit"><TextField label="RF toe block shim (mm)" value={String(tune.values.rfToeBlockShim ?? "")} placeholder="ex. 1.0" onChange={(event) => patchValues({ rfToeBlockShim: event.target.value })} /><TextField label="RR toe block shim (mm)" value={String(tune.values.rrToeBlockShim ?? "")} placeholder="ex. 0.0" onChange={(event) => patchValues({ rrToeBlockShim: event.target.value })} /></div>
          <TextField label="Rear pro-squat / anti-squat notes" value={String(tune.values.rearSquatNotes ?? "")} placeholder="What the RF/RR shim stack creates" onChange={(event) => patchValues({ rearSquatNotes: event.target.value })} />
        </TuneSubcategory>
        <TuneSubcategory title="Rear holes and hub positions" helper="Record the holes, hub positions, and damper mounting points used on the rear of the car." defaultOpen={false}>
          <GeometryPointPicker label="Rear shock tower upper hole" value={String(tune.values.rearShockTowerUpperHole ?? "")} options={shockTowerHoleOptions} helper="Choose the tower hole used by the top of the rear damper." onChange={(value) => patchValues({ rearShockTowerUpperHole: value })} />
          <GeometryPointPicker label="Rear lower arm damper hole" value={String(tune.values.rearDamperLowerArmHole ?? "")} options={armDamperHoleOptions} helper="Choose the lower arm hole used by the bottom of the rear damper." onChange={(value) => patchValues({ rearDamperLowerArmHole: value })} />
          <GeometryPointPicker label="Rear hub upper link hole" value={String(tune.values.rearHubCarrierUpperLinkHole ?? "")} options={rearHubCarrierHoleOptions} helper="Record the rear hub carrier hole used by the upper turnbuckle." onChange={(value) => patchValues({ rearHubCarrierUpperLinkHole: value })} />
          <GeometryPointPicker label="Rear hub lower link / axle height" value={String(tune.values.rearHubCarrierLowerLinkHole ?? "")} options={rearHubCarrierHoleOptions} helper="Use when the hub carrier has lower link or axle-height choices." onChange={(value) => patchValues({ rearHubCarrierLowerLinkHole: value })} />
          <TextAreaField label="Rear hub and damper geometry notes" value={String(tune.values.rearGeometryNotes ?? "")} placeholder="ex. Upper link outer middle hole, axle center position, 1mm spacer outside ball stud" rows={3} onChange={(event) => patchValues({ rearGeometryNotes: event.target.value })} />
        </TuneSubcategory>
      </BasicTuneSection>
      </>
      ) : null}

      {activeTabId === "front" || activeTabId === "rear" ? (
      <BasicTuneSection title={activeTabId === "front" ? "Front wheels" : "Rear wheels"}>
        {activeTabId === "front" ? (
        <>
        <PartSelector
          label="Front tire"
          category="tires"
          value={selectorValueFromFields("frontTire", "frontTireBrand", "tires", "", String(tune.values.frontTire ?? tune.values.tires ?? ""))}
          emptyLabel="Select front tire"
          onChange={(part) => patchPartSelector("frontTire", "frontTireBrand", "tires", part, { tires: part.model || part.customName || tune.values.tires || "" })}
        />
        <TextField label="Front tire compound" value={String(tune.values.frontTireCompound ?? "")} placeholder="ex. LF-4, LF-5, hard, soft" onChange={(event) => patchValues({ frontTireCompound: event.target.value })} />
        <PartSelector
          label="Front wheel"
          category="frontWheels"
          value={selectorValueFromFields("frontWheel", "frontWheelBrand", "frontWheels", String(tune.chassisSetup?.front?.wheel?.brand ?? ""), String(tune.chassisSetup?.front?.wheel?.model ?? ""))}
          emptyLabel="Select front wheel"
          onChange={(part) => patchPartSelector("frontWheel", "frontWheelBrand", "frontWheels", part)}
        />
        <div className="formSplit">
          <BasicChoice fieldId="frontWheelOffset" ownerId={tune.ownerId} label="Front wheel offset" value={String(tune.values.frontWheelOffset ?? tune.chassisSetup?.front?.wheel?.offset ?? "")} options={basicTuneOptions.wheelOffset} onChange={(value) => patchValues({ frontWheelOffset: value })} />
          <TextField label="Front wheel width" value={String(tune.values.frontWheelWidth ?? tune.chassisSetup?.front?.wheel?.width ?? "")} placeholder="ex. 26mm" onChange={(event) => patchValues({ frontWheelWidth: event.target.value })} />
        </div>
        <TextAreaField label="Front wheel notes" value={String(tune.values.frontWheelNotes ?? tune.chassisSetup?.front?.wheel?.notes ?? "")} placeholder="Dish, spoke style, clearance notes..." onChange={(event) => patchValues({ frontWheelNotes: event.target.value })} />
        </>
        ) : (
        <>
        <PartSelector
          label="Rear tire"
          category="tires"
          value={selectorValueFromFields("rearTire", "rearTireBrand", "tires", "", String(tune.values.rearTire ?? tune.values.tires ?? ""))}
          emptyLabel="Select rear tire"
          onChange={(part) => patchPartSelector("rearTire", "rearTireBrand", "tires", part, { tires: part.model || part.customName || tune.values.tires || "" })}
        />
        <TextField label="Rear tire compound" value={String(tune.values.rearTireCompound ?? "")} placeholder="ex. LF-4, LF-5, hard, soft" onChange={(event) => patchValues({ rearTireCompound: event.target.value })} />
        <PartSelector
          label="Rear wheel"
          category="rearWheels"
          value={selectorValueFromFields("rearWheel", "rearWheelBrand", "rearWheels", String(tune.chassisSetup?.rear?.wheel?.brand ?? ""), String(tune.chassisSetup?.rear?.wheel?.model ?? ""))}
          emptyLabel="Select rear wheel"
          onChange={(part) => patchPartSelector("rearWheel", "rearWheelBrand", "rearWheels", part)}
        />
        <div className="formSplit">
          <BasicChoice fieldId="rearWheelOffset" ownerId={tune.ownerId} label="Rear wheel offset" value={String(tune.values.rearWheelOffset ?? tune.chassisSetup?.rear?.wheel?.offset ?? "")} options={basicTuneOptions.wheelOffset} onChange={(value) => patchValues({ rearWheelOffset: value })} />
          <TextField label="Rear wheel width" value={String(tune.values.rearWheelWidth ?? tune.chassisSetup?.rear?.wheel?.width ?? "")} placeholder="ex. 26mm" onChange={(event) => patchValues({ rearWheelWidth: event.target.value })} />
        </div>
        <TextAreaField label="Rear wheel notes" value={String(tune.values.rearWheelNotes ?? tune.chassisSetup?.rear?.wheel?.notes ?? "")} placeholder="Fitment, tire stretch, body clearance..." onChange={(event) => patchValues({ rearWheelNotes: event.target.value })} />
        </>
        )}
      </BasicTuneSection>
      ) : null}

      {activeTabId === "front" || activeTabId === "rear" || activeTabId === "notes" ? (
      <BasicTuneSection title={activeTabId === "notes" ? "Notes" : activeTabId === "front" ? "Front hubs and axles" : "Rear hubs and axles"}>
        {activeTabId === "front" ? (
        <>
        <PartSelector
          label="Front knuckle"
          category="frontKnuckles"
          value={selectorValueFromFields("frontKnuckle", "frontKnuckleBrand", "frontKnuckles", String(tune.chassisSetup?.front?.knuckle?.brand ?? (isReveDMultiKnuckleChassis ? "Reve D" : "")), String(tune.chassisSetup?.front?.knuckle?.model ?? ""))}
          emptyLabel="Select front knuckle"
          helper={beginnerHelpers.frontKnuckle}
          onChange={(part) => patchPartSelector("frontKnuckle", "frontKnuckleBrand", "frontKnuckles", part)}
        />
        {isReveDMultiKnuckleChassis ? (
          <PartSelector
            label="Knuckle plate"
            category="knucklePlates"
            value={selectorValueFromFields("frontKnucklePlate", "frontKnucklePlateBrand", "knucklePlates", "Reve D")}
            emptyLabel="Select knuckle plate"
            helper="For Reve D RDX / MC-III multi-select front knuckles. Choose the plate separately from the knuckle base."
            onChange={(part) => patchPartSelector("frontKnucklePlate", "frontKnucklePlateBrand", "knucklePlates", { ...part, brand: part.brand || "Reve D" })}
          />
        ) : (
          <>
          <PartSelector
            label="Knuckle plate"
            category="knucklePlates"
            value={selectorValueFromFields("frontKnucklePlate", "frontKnucklePlateBrand", "knucklePlates")}
            emptyLabel="Select knuckle plate"
            helper="Optional plate or insert used with adjustable front knuckles."
            onChange={(part) => patchPartSelector("frontKnucklePlate", "frontKnucklePlateBrand", "knucklePlates", part)}
          />
          </>
        )}
        <PartSelector
          label="Front axle"
          category="frontAxles"
          value={selectorValueFromFields("frontAxle", "frontAxleBrand", "frontAxles", String(tune.chassisSetup?.front?.axle?.brand ?? ""), String(tune.chassisSetup?.front?.axle?.model ?? ""))}
          emptyLabel="Select front axle"
          onChange={(part) => patchPartSelector("frontAxle", "frontAxleBrand", "frontAxles", part)}
        />
        <div className="formSplit">
          <TextField label="Front hex hub size (mm)" value={String(tune.values.frontHexHubSize ?? tune.values.frontHubSpacers ?? "")} placeholder="ex. 4.5" onChange={(event) => patchValues({ frontHexHubSize: event.target.value, frontHubSpacers: event.target.value })} />
          <TextField label="Offset spacer" value={String(tune.values.frontOffsetSpacer ?? "")} placeholder="ex. 0.5mm" helper={beginnerHelpers.frontOffsetSpacer} onChange={(event) => patchValues({ frontOffsetSpacer: event.target.value })} />
        </div>
        </>
        ) : activeTabId === "rear" ? (
        <>
        <PartSelector
          label="Rear hub carrier"
          category="rearHubCarriers"
          value={selectorValueFromFields("rearHubCarrier", "rearHubCarrierBrand", "rearHubCarriers", String(tune.chassisSetup?.rear?.hubCarrier?.brand ?? ""), String(tune.chassisSetup?.rear?.hubCarrier?.model ?? ""))}
          emptyLabel="Select rear hub carrier"
          helper="The rear upright/hub carrier that holds the rear axle and sets rear roll-center options."
          onChange={(part) => patchPartSelector("rearHubCarrier", "rearHubCarrierBrand", "rearHubCarriers", part)}
        />
        <fieldset className="wizardChoiceGroup">
          <legend>Active Toe</legend>
          <label>
            <input type="checkbox" checked={Boolean(tune.values.activeToe)} onChange={(event) => patchValues({ activeToe: event.target.checked })} />
            <span>Active Toe installed / enabled</span>
          </label>
        </fieldset>
        <TextField label="Rear axle length (mm)" value={String(tune.values.rearAxleLength ?? tune.chassisSetup?.rear?.axle?.length ?? "")} placeholder="ex. 47" onChange={(event) => patchValues({ rearAxleLength: event.target.value })} />
        <div className="formSplit">
          <TextField label="Rear axle hex hub (mm)" value={String(tune.values.rearAxleHexHub ?? "")} placeholder="ex. 5.5" onChange={(event) => patchValues({ rearAxleHexHub: event.target.value })} />
          <TextField label="Offset spacer" value={String(tune.values.rearOffsetSpacer ?? "")} placeholder="ex. 1mm" helper={beginnerHelpers.rearOffsetSpacer} onChange={(event) => patchValues({ rearOffsetSpacer: event.target.value })} />
        </div>
        </>
        ) : null}
        <TextAreaField label="Any other customizations / notes" value={String(tune.values.basicCustomNotes ?? tune.notes ?? "")} placeholder="Trackside notes, option parts, why this setup works..." onChange={(event) => onChange({ ...tune, notes: event.target.value, values: { ...tune.values, basicCustomNotes: event.target.value }, updatedAt: new Date().toISOString() })} />
      </BasicTuneSection>
      ) : null}

      {activeTabId === "photos" ? (
        <BasicTuneSection title="Photos">
          <PhotosTab tune={tune} onPhotos={(photos: TunePhoto[]) => onChange({ ...tune, photos, updatedAt: new Date().toISOString() })} />
        </BasicTuneSection>
      ) : null}

      {activeTabId === "radio" ? (
        <BasicTuneSection title="Radio" defaultOpen>
          <TextField label="Radio brand" value={String(tune.values.radioBrand ?? "")} placeholder="Futaba, Sanwa, Flysky..." onChange={(event) => patchValues({ radioBrand: event.target.value })} />
          <TextField label="Radio model" value={String(tune.values.radioModel ?? "")} placeholder="Transmitter model" onChange={(event) => patchValues({ radioModel: event.target.value })} />
          <TextAreaField label="Radio notes" value={String(tune.values.radioNotes ?? "")} placeholder="Expo, endpoints, channel mixing, and transmitter notes..." onChange={(event) => patchValues({ radioNotes: event.target.value })} />
        </BasicTuneSection>
      ) : null}

      {activeTabId === "feel" ? (
        <BasicTuneSection title="Feel" helper="Pick what this tune is meant for, then rate how the car feels.">
          <TextField
            label="Intended Use"
            list={`intended-use-${tune.id}`}
            value={(tune.setupIntent ?? []).join(", ")}
            placeholder="Team tandems, trains, style, competition, or type your own"
            onChange={(event) => onChange({ ...tune, setupIntent: event.target.value.split(",").map((item) => item.trim()).filter(Boolean), updatedAt: new Date().toISOString() })}
          />
          <datalist id={`intended-use-${tune.id}`}>
            {["Team tandems", "Trains", "Style", "Competition"].map((option) => <option key={option} value={option} />)}
          </datalist>
          <FeelEditor tune={tune} onChange={(expectedFeel) => onChange({ ...tune, expectedFeel, updatedAt: new Date().toISOString() })} />
        </BasicTuneSection>
      ) : null}

      {activeTabId === "pdf" ? (
        <BasicTuneSection title="Preview / PDF">
          <BasicTuneSummary tune={tune} car={car} />
          <p className="mutedText">Use the sticky Preview PDF and Export PDF buttons to generate a filled setup sheet when you are ready.</p>
        </BasicTuneSection>
      ) : null}
    </section>
  );
}

function AdvancedTuneDetails({
  activeSections,
  activeTune,
  tunes,
  electronicsProfiles,
  openSection,
  onOpenSection,
  onFieldChange,
  onPartChange,
  onElectronicsSettingChange,
  onApplyElectronicsProfile,
  onSaveElectronicsProfile
}: {
  activeSections: UniversalSection[];
  activeTune: Tune;
  tunes: Tune[];
  electronicsProfiles: ElectronicsProfile[];
  openSection: string;
  onOpenSection: (sectionId: string) => void;
  onFieldChange: (field: UniversalField, value: BuilderValue) => void;
  onPartChange: (field: UniversalField, part: RcPart | null, customName: string) => void;
  onElectronicsSettingChange: (category: ElectronicsCategory, key: string, value: ElectronicsSettingValue) => void;
  onApplyElectronicsProfile: (profileId: string) => void;
  onSaveElectronicsProfile: (section: UniversalSection) => void;
}) {
  const advancedSections = activeSections
    .map((section) => ({
      ...section,
      fields: section.fields.filter((field) => !basicFieldIds.has(field.id))
    }))
    .filter((section) => section.fields.length > 0 || section.profileType);

  if (!advancedSections.length) return null;

  return (
    <section className="advancedTuneDetails" aria-label="Advanced tune details">
      <header>
        <div>
          <p>Advanced details</p>
          <h3>Advanced fields for this section</h3>
        </div>
        <span>Optional</span>
      </header>
      {advancedSections.map((section) => {
        const isOpen = openSection === `advanced-${section.id}`;
        const filled = section.fields.filter((field) => String(fieldValue(activeTune, field) ?? "").trim()).length;
        return (
          <article className="builderSectionCard basicTuneCard collapsibleTuneSection" key={section.id}>
            <button
              className="basicTuneSectionToggle"
              type="button"
              aria-expanded={isOpen}
              onClick={() => onOpenSection(isOpen ? "" : `advanced-${section.id}`)}
            >
              <span>
                <strong>{section.title} details</strong>
                <em>{filled}/{section.fields.length} advanced fields filled</em>
              </span>
              <ChevronDown size={18} aria-hidden="true" />
            </button>
            {isOpen ? (
              <div className="builderFieldGrid">
                {section.profileType ? (
                  <ElectronicsProfileTools
                    section={section}
                    profiles={electronicsProfiles.filter((profile) => profile.type === section.profileType)}
                    onApply={onApplyElectronicsProfile}
                    onSave={() => onSaveElectronicsProfile(section)}
                  />
                ) : null}
                {section.fields.map((field) => (
                  <BuilderField
                    key={field.id}
                    field={field}
                    tune={activeTune}
                    tunes={tunes}
                    builderMode="advanced"
                    onChange={(value) => onFieldChange(field, value)}
                    onPartChange={(part, customName) => onPartChange(field, part, customName)}
                    onElectronicsSettingChange={onElectronicsSettingChange}
                  />
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}

function BasicTuneSection({ title, helper = "Skip anything you do not know yet.", defaultOpen = false, children }: { title: string; helper?: string; defaultOpen?: boolean; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = defaultOpen || isOpen;

  return (
    <article className={`builderSectionCard basicTuneCard collapsibleTuneSection ${open ? "isOpen" : ""}`}>
      <button
        type="button"
        className="basicTuneSectionToggle"
        aria-expanded={open}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>
          <strong>{title}</strong>
          <em>{helper}</em>
        </span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      {open ? <div className="builderFieldGrid">{children}</div> : null}
    </article>
  );
}

function TuneSubcategory({ title, helper, children, defaultOpen = true }: { title: string; helper?: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`tuneSubcategory ${open ? "isOpen" : ""}`}>
      <button className="tuneSubcategoryHeader" type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <span>
          <strong>{title}</strong>
          {helper ? <em>{helper}</em> : null}
        </span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>
      {open ? <div className="tuneSubcategoryBody">{children}</div> : null}
    </section>
  );
}

function GeometryPointPicker({
  label,
  value,
  options,
  helper,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  helper?: string;
  onChange: (value: string) => void;
}) {
  const selectedIndex = options.findIndex((option) => option === value);
  return (
    <fieldset className="geometryPointPicker fieldWide">
      <legend>{label}</legend>
      <div className="geometryPointRail" aria-hidden="true">
        {options.slice(0, -1).map((option, index) => (
          <span key={option} className={index === selectedIndex ? "selected" : ""}>
            {index + 1}
          </span>
        ))}
      </div>
      <div className="geometryPointOptions" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={value === option ? "selected" : ""}
            aria-pressed={value === option}
            onClick={() => onChange(value === option ? "" : option)}
          >
            {option}
          </button>
        ))}
      </div>
      {value ? <strong className="geometryPointValue">Selected: {value}</strong> : null}
      {helper ? <small className="fieldHelper">{helper}</small> : null}
    </fieldset>
  );
}

function BufferedTextField({
  label,
  value,
  placeholder,
  onCommit,
  delay = 320
}: {
  label: string;
  value: string;
  placeholder?: string;
  onCommit: (value: string) => void;
  delay?: number;
}) {
  const [draftValue, setDraftValue] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (focused) return;
    const handle = window.setTimeout(() => setDraftValue(value), 0);
    return () => window.clearTimeout(handle);
  }, [focused, value]);

  useEffect(() => {
    if (!focused || draftValue === value) return;
    const handle = window.setTimeout(() => onCommit(draftValue), delay);
    return () => window.clearTimeout(handle);
  }, [delay, draftValue, focused, onCommit, value]);

  return (
    <label className="formField">
      <span>{label}</span>
      <input
        value={draftValue}
        placeholder={placeholder}
        onBlur={() => {
          setFocused(false);
          if (draftValue !== value) onCommit(draftValue);
        }}
        onChange={(event) => setDraftValue(event.target.value)}
        onFocus={() => setFocused(true)}
      />
    </label>
  );
}

function NotApplicableToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="notApplicableToggle" onMouseDown={(event) => event.preventDefault()} onTouchStart={(event) => event.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>Not applicable</span>
    </label>
  );
}

function BasicElectronicsSettingsDisclosure({
  category,
  tune,
  onChange
}: {
  category: ProfiledElectronicsCategory;
  tune: Tune;
  onChange: (category: ElectronicsCategory, key: string, value: ElectronicsSettingValue) => void;
}) {
  const item = tune.electronics?.[category];
  const brand = String(tune.values[`${category}Brand`] ?? item?.brand ?? "");
  const model = String(tune.values[`${category}Model`] ?? item?.model ?? "");
  const slug = String(item?.slug ?? tune.selections[`${category}Model`] ?? "");
  const schema = findElectronicsSchemaForProduct(category, brand, model, slug);

  if (!schema) return null;
  return (
    <ElectronicsSettingsDisclosure
      category={category}
      schema={schema}
      settings={item?.settings ?? {}}
      builderMode="basic"
      onChange={onChange}
    />
  );
}

function ElectronicsTuneEntryChoice({
  category,
  tune,
  onModeChange,
  onPhotosChange
}: {
  category: ProfiledElectronicsCategory;
  tune: Tune;
  onModeChange: (category: ProfiledElectronicsCategory, mode: "manual" | "photo") => void;
  onPhotosChange: (category: ProfiledElectronicsCategory, photos: TunePhoto[]) => void;
}) {
  const label = electronicsProfileLabels[category];
  const item = tune.electronics?.[category];
  const mode = (item?.tuneEntryMode ?? tune.values[`${category}TuneEntryMode`] ?? "manual") === "photo" ? "photo" : "manual";
  const photos = item?.tunePhotos ?? [];
  const [viewerPhoto, setViewerPhoto] = useState<TunePhoto | null>(null);
  const [deletePhotoTarget, setDeletePhotoTarget] = useState<TunePhoto | null>(null);

  async function addTunePhotos(files: FileList | null) {
    if (!files?.length) return;
    const newPhotos = await Promise.all(
      Array.from(files).map((file, index) =>
        photoFromFile(file, {
          id: `${category}-tune-photo-${Date.now()}-${index}`,
          label: `${label} tune ${photos.length + index + 1}`,
          ownerId: tune.ownerId,
          entityId: tune.id,
          firebaseFolder: `${category}TunePhotos`
        })
      )
    );
    onPhotosChange(category, [...newPhotos, ...photos]);
  }

  function removePhoto(photoId: string) {
    onPhotosChange(category, photos.filter((itemPhoto) => itemPhoto.id !== photoId));
    setDeletePhotoTarget(null);
  }

  return (
    <div className="electronicsTuneEntryCard">
      <div className="entryModeHeader">
        <strong>{label} tune entry</strong>
        <span>Choose how you want to save this {label.toLowerCase()} tune.</span>
      </div>
      <div className="entryModeButtons" role="group" aria-label={`${label} tune entry method`}>
        <button className={mode === "manual" ? "active" : ""} type="button" onClick={() => onModeChange(category, "manual")}>
          Manual
        </button>
        <button className={mode === "photo" ? "active" : ""} type="button" onClick={() => onModeChange(category, "photo")}>
          Upload Tune Photo
        </button>
      </div>

      {mode === "photo" ? (
        <div className="electronicsTunePhotoPanel">
          <label className="compactPhotoUploader">
            <ImagePlus size={20} />
            <span>Add {label} tune screenshots</span>
            <small>{photoStorageStatusLabel()}</small>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                void addTunePhotos(event.target.files);
                event.currentTarget.value = "";
              }}
            />
          </label>
          {photos.length ? (
            <div className="electronicsTunePhotoGrid">
              {photos.map((photo) => (
                <figure key={photo.id}>
                  <button className="photoPreviewButton" type="button" onClick={() => setViewerPhoto(photo)} aria-label={`Open ${photo.label}`}>
                    <img src={displayPhotoUrl(photo)} alt={photo.label} />
                  </button>
                  <button className="photoDeleteX" type="button" aria-label={`Remove ${photo.label}`} title="Remove photo" onClick={() => setDeletePhotoTarget(photo)}>
                    <Trash2 size={15} />
                  </button>
                  <figcaption>
                    <input value={photo.label} onChange={(event) => onPhotosChange(category, photos.map((itemPhoto) => (itemPhoto.id === photo.id ? { ...itemPhoto, label: event.target.value } : itemPhoto)))} />
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="mutedText">No {label.toLowerCase()} tune photos yet.</p>
          )}
        </div>
      ) : null}
      {deletePhotoTarget ? (
        <div className="modalShade" role="presentation">
          <section className="confirmModal" role="dialog" aria-modal="true" aria-labelledby={`${category}-delete-photo-title`}>
            <h2 id={`${category}-delete-photo-title`}>Remove photo?</h2>
            <p>This removes "{deletePhotoTarget.label}" from this {label.toLowerCase()} tune. This cannot be undone.</p>
            <div className="buttonRow">
              <button className="smallPill" type="button" onClick={() => setDeletePhotoTarget(null)}>Cancel</button>
              <button className="primaryAction destructive" type="button" onClick={() => removePhoto(deletePhotoTarget.id)}>
                <Trash2 size={17} />
                Remove photo
              </button>
            </div>
          </section>
        </div>
      ) : null}
      <PhotoLightbox photo={viewerPhoto} onClose={() => setViewerPhoto(null)} />
    </div>
  );
}

function BasicElectronicsProfilePicker({
  category,
  tune,
  profiles,
  value,
  nameValue,
  onApply,
  onCreate,
  onSave
}: {
  category: ProfiledElectronicsCategory;
  tune: Tune;
  profiles: ElectronicsProfile[];
  value: string;
  nameValue: string;
  onApply: (category: ProfiledElectronicsCategory, profileId: string) => void;
  onCreate: (name: string) => void;
  onSave: (category: ProfiledElectronicsCategory, name: string) => void;
}) {
  const [draftName, setDraftName] = useState("");
  const label = electronicsProfileLabels[category];
  const selectedSnapshot = tune.electronics?.[category]?.profileSnapshot;
  const snapshotName = typeof selectedSnapshot === "object" && selectedSnapshot ? String(selectedSnapshot.profileName ?? "") : "";
  const displayName = nameValue || snapshotName;

  return (
    <div className="basicProfilePicker">
      <SelectField label={`${label} tune profile`} value={value} onChange={(event) => onApply(category, event.target.value)}>
        <option value="">No saved profile</option>
        {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
      </SelectField>
      <small className="fieldHelper">
        {beginnerHelpers[`${category}ProfileName`] ?? "Profiles are saved electronics settings you can reuse. This tune keeps its own snapshot when you apply one."}
        {displayName ? ` Snapshot on this tune: ${displayName}.` : ""}
      </small>
      <div className="basicProfileActions">
        <TextField label={`New ${label} profile name`} value={draftName} placeholder={`${label} baseline`} onChange={(event) => setDraftName(event.target.value)} />
        <div className="buttonRow">
          <button className="smallPill" type="button" onClick={() => {
            const name = draftName.trim() || `${label} Profile`;
            onCreate(name);
            setDraftName(name);
          }}>
            Create profile
          </button>
          <button className="smallPill" type="button" onClick={() => {
            const name = draftName.trim() || displayName || `${label} Profile`;
            onSave(category, name);
            setDraftName("");
          }}>
            Save current as profile
          </button>
        </div>
      </div>
    </div>
  );
}

function BasicChoice({
  fieldId,
  ownerId,
  label,
  value,
  options,
  helper,
  onChange
}: {
  fieldId: string;
  ownerId?: string;
  label: string;
  value: string;
  options: string[];
  helper?: string;
  onChange: (value: string) => void;
}) {
  const [recentOptions, setRecentOptions] = useState<string[]>(() => loadBasicRecents(ownerId, fieldId));
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const specialChoiceRef = useRef(false);
  const isNotApplicable = value === BEGINNER_NOT_APPLICABLE_OPTION;
  const baseOptions = Array.from(new Set([BEGINNER_NOT_SURE_OPTION, BEGINNER_STOCK_OPTION, BEGINNER_NOT_APPLICABLE_OPTION, ...options.filter(Boolean), BASIC_CUSTOM_OPTION]));
  const normalizedOptions = Array.from(new Set(["", ...baseOptions, ...recentOptions]));
  const cleanQuery = localValue.trim().toLowerCase();
  const suggestions = normalizedOptions
    .filter(Boolean)
    .filter((option) => !cleanQuery || option.toLowerCase().includes(cleanQuery))
    .slice(0, 18);
  const exactMatch = suggestions.some((option) => option.toLowerCase() === cleanQuery);
  useEffect(() => {
    if (isFocused) return;
    const handle = window.setTimeout(() => setLocalValue(value), 0);
    return () => window.clearTimeout(handle);
  }, [isFocused, value]);

  useEffect(() => {
    if (!isFocused || localValue === value) return;
    const handle = window.setTimeout(() => onChange(localValue), 280);
    return () => window.clearTimeout(handle);
  }, [isFocused, localValue, onChange, value]);

  const remember = (customValue: string) => {
    const cleanValue = customValue.trim();
    if (!cleanValue || cleanValue === BASIC_CUSTOM_OPTION) return;
    saveBasicRecent(ownerId, fieldId, cleanValue, baseOptions);
    setRecentOptions(loadBasicRecents(ownerId, fieldId));
  };
  const markSpecialChoice = () => {
    specialChoiceRef.current = true;
    window.setTimeout(() => {
      specialChoiceRef.current = false;
    }, 180);
  };
  const choose = (option: string) => {
    setLocalValue(option);
    onChange(option);
    remember(option);
    setIsOpen(false);
    setIsFocused(false);
  };
  const toggleNotApplicable = (checked: boolean) => {
    markSpecialChoice();
    const nextValue = checked ? BEGINNER_NOT_APPLICABLE_OPTION : "";
    setLocalValue(nextValue);
    onChange(nextValue);
    setIsOpen(false);
    setIsFocused(false);
  };
  return (
    <div className="basicChoice">
      <label className="formField basicComboField">
        <span>{label}</span>
        <input
          value={localValue}
          disabled={isNotApplicable}
          placeholder="Search, type, or choose Not sure"
          role="combobox"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-autocomplete="list"
          onBlur={(event) => {
            window.setTimeout(() => setIsOpen(false), 120);
            setIsFocused(false);
            if (specialChoiceRef.current) return;
            if (event.target.value !== value) onChange(event.target.value);
            remember(event.target.value);
          }}
          onChange={(event) => {
            setLocalValue(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
        />
      </label>
      {isOpen && suggestions.length ? (
        <div className="basicComboList" role="listbox" aria-label={`${label} suggestions`}>
          {suggestions.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === localValue}
              onMouseDown={(event) => event.preventDefault()}
              onPointerDown={(event) => event.pointerType === "mouse" ? undefined : event.currentTarget.focus()}
              onClick={() => choose(option)}
            >
              {option}
            </button>
          ))}
          {localValue.trim() && !exactMatch ? <span className="comboCustomHint">Press Save or leave the field to keep "{localValue.trim()}".</span> : null}
        </div>
      ) : null}
      {helper ? <small className="fieldHelper">{helper}</small> : null}
      <NotApplicableToggle checked={isNotApplicable} onChange={toggleNotApplicable} />
      <div className="quickFieldHints" aria-label={`${label} field options`}>
        <span>Not sure</span>
        <span>Stock</span>
        <span>N/A</span>
        <span>Type custom</span>
        {recentOptions.length ? <span>Recent saved</span> : null}
      </div>
    </div>
  );
}

function SharingSettings({ tune, onChange }: { tune: Tune; onChange: (patch: Partial<Tune>) => void }) {
  const shareId = tune.shareId || tune.id;
  const shareUrl = absoluteShareUrl(shareId);
  const shareEnabled = tune.visibility === "public" || tune.visibility === "unlisted";
  const toggle = (key: keyof Tune) => (event: ChangeEvent<HTMLInputElement>) => onChange({ [key]: event.target.checked } as Partial<Tune>);
  const visibleItems = [
    tune.sharedBasicTuneEnabled !== false ? "Quick setup" : "",
    tune.sharedChassisSetupEnabled !== false ? "Advanced setup" : "",
    tune.sharedPhotosEnabled ? "Photos and tune screenshots" : "",
    tune.sharedNotesEnabled ? "Notes" : "",
    tune.sharedEscTuneEnabled ? "ESC tune" : "",
    tune.sharedServoTuneEnabled ? "Servo tune" : "",
    tune.sharedGyroTuneEnabled ? "Gyro tune" : "",
    tune.sharedRadioTuneEnabled ? "Radio tune" : "",
    tune.sharedHistoryEnabled ? "Change history" : "",
    tune.pdfDownloadEnabled !== false ? "Generated PDF download" : ""
  ].filter(Boolean);
  const hiddenItems = [
    tune.sharedBasicTuneEnabled === false ? "Quick setup" : "",
    tune.sharedChassisSetupEnabled === false ? "Advanced setup" : "",
    !tune.sharedPhotosEnabled ? "Photos and tune screenshots" : "",
    !tune.sharedNotesEnabled ? "Notes" : "",
    !tune.sharedEscTuneEnabled ? "ESC tune" : "",
    !tune.sharedServoTuneEnabled ? "Servo tune" : "",
    !tune.sharedGyroTuneEnabled ? "Gyro tune" : "",
    !tune.sharedRadioTuneEnabled ? "Radio tune" : "",
    !tune.sharedHistoryEnabled ? "Change history" : ""
  ].filter(Boolean);

  async function copyShareLink() {
    await navigator.clipboard?.writeText(shareUrl);
    onChange({ shareCount: (tune.shareCount ?? 0) + 1 });
  }

  return (
    <article className="builderSectionCard shareSettingsCard">
      <button className="sectionToggle" type="button" aria-expanded="true">
        <span>
          <strong>Share tune</strong>
          <em>{shareEnabled ? shareUrl : "Private by default"}</em>
        </span>
        <Share2 size={19} />
      </button>
      <div className="shareSettingsBody">
        <SelectField label="Visibility" value={tune.visibility ?? "private"} onChange={(event) => onChange({ visibility: event.target.value as Tune["visibility"] })}>
          <option value="private">Private</option>
          <option value="unlisted">Unlisted link</option>
          <option value="public">Public</option>
        </SelectField>
        {shareEnabled ? (
          <div className="shareLinkBox">
            <QRCodeSVG value={shareUrl} size={112} bgColor="transparent" fgColor="currentColor" />
            <div>
              <strong>Friend link</strong>
              <span>{shareUrl}</span>
              <button className="smallPill" type="button" onClick={copyShareLink}>
                <Share2 size={16} />
                Copy share link
              </button>
            </div>
          </div>
        ) : (
          <p className="shareHint">Only you can see this tune. Switch to Unlisted or Public when you are ready to share it.</p>
        )}
        <section className="sharePreviewCard" aria-label="Shared tune preview">
          <div>
            <strong>Friends will see</strong>
            <span>{shareEnabled ? "This is what the share link exposes." : "Preview what will be visible before turning on sharing."}</span>
          </div>
          <div className="sharePreviewColumns">
            <div>
              <em>Visible</em>
              {visibleItems.length ? visibleItems.map((item) => <span key={item}>{item}</span>) : <span>Nothing selected yet</span>}
            </div>
            <div>
              <em>Hidden</em>
              {hiddenItems.slice(0, 8).map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
        </section>
        <div className="shareToggleGrid">
          <ShareToggle label="Allow cloning" checked={Boolean(tune.cloneEnabled)} onChange={toggle("cloneEnabled")} />
          <ShareToggle label="Show photos" checked={Boolean(tune.sharedPhotosEnabled)} onChange={toggle("sharedPhotosEnabled")} />
          <ShareToggle label="Show notes" checked={Boolean(tune.sharedNotesEnabled)} onChange={toggle("sharedNotesEnabled")} />
          <ShareToggle label="Show Basic Tune" checked={tune.sharedBasicTuneEnabled !== false} onChange={toggle("sharedBasicTuneEnabled")} />
          <ShareToggle label="Show Advanced Tune" checked={tune.sharedChassisSetupEnabled !== false} onChange={toggle("sharedChassisSetupEnabled")} />
          <ShareToggle label="Show ESC tune" checked={Boolean(tune.sharedEscTuneEnabled)} onChange={toggle("sharedEscTuneEnabled")} />
          <ShareToggle label="Show servo tune" checked={Boolean(tune.sharedServoTuneEnabled)} onChange={toggle("sharedServoTuneEnabled")} />
          <ShareToggle label="Show gyro tune" checked={Boolean(tune.sharedGyroTuneEnabled)} onChange={toggle("sharedGyroTuneEnabled")} />
          <ShareToggle label="Show radio tune" checked={Boolean(tune.sharedRadioTuneEnabled)} onChange={toggle("sharedRadioTuneEnabled")} />
          <ShareToggle label="Show change history" checked={Boolean(tune.sharedHistoryEnabled)} onChange={toggle("sharedHistoryEnabled")} />
          <ShareToggle label="Show owner name" checked={tune.sharedOwnerNameEnabled !== false} onChange={toggle("sharedOwnerNameEnabled")} />
          <ShareToggle label="Allow PDF download" checked={tune.pdfDownloadEnabled !== false} onChange={toggle("pdfDownloadEnabled")} />
        </div>
      </div>
    </article>
  );
}

function ShareToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="shareToggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function SetupAssistant({
  cars,
  tunes,
  tune,
  isOpen,
  onToggle,
  onSelectTune,
  onUpdateTune
}: {
  cars: Car[];
  tunes: Tune[];
  tune: Tune;
  isOpen: boolean;
  onToggle: () => void;
  onSelectTune: (tuneId: string) => void;
  onUpdateTune: (tune: Tune) => void;
}) {
  const [surface, setSurface] = useState(tune.surface || String(tune.values.surface || "Not sure"));
  const [tire, setTire] = useState(String(tune.values.tires || tune.values.tire || ""));
  const [grip, setGrip] = useState(tune.grip || "Not sure");
  const [symptomId, setSymptomId] = useState("gyroWobble");
  const [testChange, setTestChange] = useState("");
  const [result, setResult] = useState<NonNullable<SetupAssistantEntry["result"]>>("");
  const [beforeRating, setBeforeRating] = useState(tune.rating || 3);
  const [afterRating, setAfterRating] = useState(tune.rating || 3);
  const [savedMessage, setSavedMessage] = useState("");
  const selectedCar = cars.find((car) => car.id === tune.carId);
  const suggestion = assistantSuggestions[symptomId];
  const logCount = tune.setupAssistantLog?.length ?? 0;

  function saveRecommendation() {
    const createdAt = new Date().toISOString();
    const entry: SetupAssistantEntry = {
      id: `setup-assistant-${Date.now()}`,
      tuneId: tune.id,
      createdAt,
      surface,
      tire: tire || "Not set",
      grip,
      symptom: suggestion.label,
      checkAreas: suggestion.areas,
      plainLanguage: suggestion.explanation,
      testChange: testChange.trim() || suggestion.starterChange,
      result,
      beforeRating,
      afterRating,
      notes: result ? `Result after driving: ${assistantResults.find((item) => item.id === result)?.label}` : ""
    };
    const noteBlock = [
      `Setup Assistant - ${entry.symptom}`,
      `Surface: ${entry.surface} | Tire: ${entry.tire} | Grip: ${entry.grip}`,
      `Try checking: ${entry.checkAreas.join(", ")}`,
      `Why: ${entry.plainLanguage}`,
      `Test change: ${entry.testChange}`,
      result ? `Result: ${assistantResults.find((item) => item.id === result)?.label} (${beforeRating} -> ${afterRating})` : `Before rating: ${beforeRating}`
    ].join("\n");
    const nextNotes = [tune.notes?.trim(), noteBlock].filter(Boolean).join("\n\n");
    const next: Tune = {
      ...tune,
      notes: nextNotes,
      surface: surface === "Not sure" ? tune.surface : surface,
      grip: grip === "Not sure" ? tune.grip : grip,
      rating: afterRating || tune.rating,
      values: {
        ...tune.values,
        tires: tire || tune.values.tires,
        setupAssistantLastSymptom: suggestion.label,
        setupAssistantLastChange: entry.testChange ?? "",
        setupAssistantLastResult: result
      },
      setupAssistantLog: [entry, ...(tune.setupAssistantLog ?? [])],
      updatedAt: createdAt
    };
    next.history = [
      {
        id: `rev-setup-assistant-${Date.now()}`,
        date: createdAt,
        summary: `Setup Assistant: ${suggestion.label}`,
        changes: [
          `Suggested checking ${suggestion.areas.join(", ")}`,
          `Saved test change: ${entry.testChange}`,
          result ? `Logged result: ${assistantResults.find((item) => item.id === result)?.label}` : "Result not logged yet"
        ],
        snapshot: snapshotTune(tune)
      },
      ...tune.history
    ];
    onUpdateTune(next);
    setSavedMessage("Recommendation saved to this tune.");
  }

  return (
    <article className="builderSectionCard setupAssistantCard">
      <button className="sectionToggle" type="button" onClick={onToggle} aria-expanded={isOpen}>
        <span>
          <strong>Setup Assistant</strong>
          <em>{logCount ? `${logCount} saved suggestions` : "Beginner-friendly next-change ideas"}</em>
        </span>
        <Lightbulb size={19} />
      </button>
      {isOpen ? (
        <div className="assistantBody">
          <div className="assistantIntro">
            <Lightbulb size={22} />
            <div>
              <strong>Pick what the car is doing.</strong>
              <span>These are starting points, not guarantees. Change one thing, test it, then log how it felt.</span>
            </div>
          </div>

          <SelectField label="Tune to help with" value={tune.id} onChange={(event) => onSelectTune(event.target.value)}>
            {tunes.map((item) => (
              <option key={item.id} value={item.id}>{tuneDisplayName(item)}</option>
            ))}
          </SelectField>

          <div className="assistantContext">
            <span>Car</span>
            <strong>{selectedCar?.name ?? "Current tune car"}</strong>
            <em>{selectedCar?.chassisModel || selectedCar?.chassis || "Universal setup"}</em>
          </div>

          <div>
            <span className="assistantLabel">Track surface</span>
            <div className="assistantChoiceGrid">
              {assistantSurfaces.map((item) => (
                <button key={item} className={surface === item ? "selected" : ""} type="button" onClick={() => setSurface(item)}>{item}</button>
              ))}
            </div>
          </div>

          <TextField label="Tire" value={tire} placeholder="DS LF-5, LF-4, MST, Yokomo..." onChange={(event) => setTire(event.target.value)} />

          <div>
            <span className="assistantLabel">Grip level</span>
            <div className="assistantChoiceGrid">
              {assistantGripLevels.map((item) => (
                <button key={item} className={grip === item ? "selected" : ""} type="button" onClick={() => setGrip(item)}>{item}</button>
              ))}
            </div>
          </div>

          <div>
            <span className="assistantLabel">What is the car doing?</span>
            <div className="assistantSymptomGrid">
              {Object.entries(assistantSuggestions).map(([id, item]) => (
                <button key={id} className={symptomId === id ? "selected" : ""} type="button" onClick={() => setSymptomId(id)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <section className="assistantSuggestionCard" aria-label="Setup Assistant suggestions">
            <header>
              <Wrench size={20} />
              <div>
                <p>Possible areas to check</p>
                <h3>{suggestion.label}</h3>
              </div>
            </header>
            <p>{suggestion.explanation}</p>
            <div className="assistantChipGrid">
              {suggestion.areas.map((area) => <span key={area}>{area}</span>)}
            </div>
          </section>

          <TextAreaField
            label="Create test change"
            value={testChange}
            placeholder={suggestion.starterChange}
            onChange={(event) => setTestChange(event.target.value)}
          />

          <div className="assistantRatings">
            <SelectField label="Before rating" value={String(beforeRating)} onChange={(event) => setBeforeRating(Number(event.target.value))}>
              {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
            </SelectField>
            <SelectField label="After rating" value={String(afterRating)} onChange={(event) => setAfterRating(Number(event.target.value))}>
              {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
            </SelectField>
          </div>

          <div>
            <span className="assistantLabel">Log result after driving</span>
            <div className="assistantResultGrid">
              {assistantResults.map((item) => (
                <button key={item.id} className={result === item.id ? "selected" : ""} type="button" onClick={() => setResult(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {savedMessage ? (
            <div className="assistantSaved">
              <ClipboardCheck size={18} />
              {savedMessage}
            </div>
          ) : null}

          <button className="primaryAction fullWidth" type="button" onClick={saveRecommendation}>
            <ClipboardCheck size={18} />
            Save recommendation to tune notes
          </button>
        </div>
      ) : null}
    </article>
  );
}

function PdfPreviewPanel({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <section className="universalPdfPanel" aria-label="RC Drift Sync setup PDF preview">
      <header>
        <div>
          <p>Generated PDF</p>
          <h2>RC Drift Sync setup sheet</h2>
        </div>
        <button className="smallPill" type="button" onClick={onClose}>Close</button>
      </header>
      <iframe title="RC Drift Sync setup PDF preview" src={url} />
      <p className="mutedText"><Share2 size={16} /> PDF sharing will use the tune share link once the tune is published.</p>
    </section>
  );
}

function BuilderField({
  field,
  tune,
  tunes,
  builderMode,
  onChange,
  onPartChange,
  onElectronicsSettingChange
}: {
  field: UniversalField;
  tune: Tune;
  tunes: Tune[];
  builderMode: "basic" | "advanced";
  onChange: (value: BuilderValue) => void;
  onPartChange?: (part: RcPart | null, customName: string) => void;
  onElectronicsSettingChange: (category: ElectronicsCategory, key: string, value: ElectronicsSettingValue) => void;
}) {
  const value = fieldValue(tune, field);
  const suggestions = field.meta ? [] : recentlyUsedValues(tunes, field.id);
  const commonProps = { label: field.label };
  const helper = field.helper || beginnerHelpers[field.id];
  const isNotApplicable = value === BEGINNER_NOT_APPLICABLE_OPTION;
  const toggleNotApplicable = (checked: boolean) => onChange(checked ? BEGINNER_NOT_APPLICABLE_OPTION : "");

  if (field.type === "part") {
    return <PartPickerField field={field} tune={tune} builderMode={builderMode} onPartChange={onPartChange} onElectronicsSettingChange={onElectronicsSettingChange} onNotApplicable={() => onChange(BEGINNER_NOT_APPLICABLE_OPTION)} isNotApplicable={isNotApplicable} onClearNotApplicable={() => onChange("")} />;
  }

  if (field.type === "textarea") {
    return (
      <div className="builderField fieldWide">
        <TextAreaField {...commonProps} value={String(value)} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
        {helper ? <small className="fieldHelper">{helper}</small> : null}
        <NotApplicableToggle checked={isNotApplicable} onChange={toggleNotApplicable} />
        <SuggestionRow values={suggestions} onPick={onChange} showNotSure={field.notSure} />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="builderField">
        <SelectField {...commonProps} value={String(value)} onChange={(event) => onChange(event.target.value)}>
          <option value="">Skip for now</option>
          {field.options?.map((option) => <option key={option}>{option}</option>)}
        </SelectField>
        {helper ? <small className="fieldHelper">{helper}</small> : null}
        <NotApplicableToggle checked={isNotApplicable} onChange={toggleNotApplicable} />
      </div>
    );
  }

  if (field.type === "combo") {
    const listId = `builder-options-${field.id}`;
    return (
      <div className="builderField">
        <label className="formField">
          <span>{formatFormLabel(field.label)}</span>
          <input
            list={listId}
            type="text"
            inputMode="text"
            value={String(value)}
            disabled={isNotApplicable}
            placeholder={field.placeholder || "Choose or type your own"}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
        <datalist id={listId}>
          {field.options?.map((option) => <option key={option} value={option} />)}
        </datalist>
        {helper ? <small className="fieldHelper">{helper}</small> : null}
        <NotApplicableToggle checked={isNotApplicable} onChange={toggleNotApplicable} />
      </div>
    );
  }

  if (field.type === "rating") {
    return (
      <div className="builderField">
        <SelectField {...commonProps} value={String(value || 3)} onChange={(event) => onChange(Number(event.target.value))}>
          {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
        </SelectField>
        <NotApplicableToggle checked={isNotApplicable} onChange={toggleNotApplicable} />
      </div>
    );
  }

  if (field.type === "tags") {
    return (
      <div className="builderField fieldWide">
        <TextField {...commonProps} value={String(value)} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
        {helper ? <small className="fieldHelper">{helper}</small> : null}
        <NotApplicableToggle checked={isNotApplicable} onChange={toggleNotApplicable} />
      </div>
    );
  }

  return (
    <div className="builderField">
      <label className="formField">
        <span>{formatFormLabel(field.label)}</span>
        <div className="inputWithUnit">
          <input
            type="text"
            inputMode={field.type === "number" ? "decimal" : "text"}
            value={String(value)}
            disabled={isNotApplicable}
            placeholder={field.placeholder || "Skip for now"}
            onChange={(event) => onChange(event.target.value)}
          />
          {field.suffix ? <em>{field.suffix}</em> : null}
        </div>
      </label>
      {helper ? <small className="fieldHelper">{helper}</small> : null}
      <NotApplicableToggle checked={isNotApplicable} onChange={toggleNotApplicable} />
      <SuggestionRow values={suggestions} onPick={onChange} showNotSure={field.notSure} />
    </div>
  );
}

function PartPickerField({
  field,
  tune,
  builderMode,
  onPartChange,
  onElectronicsSettingChange,
  isNotApplicable,
  onNotApplicable,
  onClearNotApplicable
}: {
  field: UniversalField;
  tune: Tune;
  builderMode: "basic" | "advanced";
  onPartChange?: (part: RcPart | null, customName: string) => void;
  onElectronicsSettingChange: (category: ElectronicsCategory, key: string, value: ElectronicsSettingValue) => void;
  isNotApplicable?: boolean;
  onNotApplicable: () => void;
  onClearNotApplicable: () => void;
}) {
  const [query, setQuery] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const parts = partsByCategory(field.partCategory ?? "accessory", field.partSubcategory);
  const legacyText = [field.brandFieldId ? tune.values[field.brandFieldId] : "", field.modelFieldId ? tune.values[field.modelFieldId] : tune.values[field.id]]
    .filter((value) => value !== undefined && value !== null && String(value).trim() && String(value).trim().toLowerCase() !== "undefined")
    .map(String)
    .join(" ");
  const structured = field.electronicsKey ? tune.electronics?.[field.electronicsKey] : undefined;
  const selectedPart = findPartBySlug(structured?.slug || tune.selections[field.id]) ?? matchKnownPart(field.partCategory ?? "accessory", legacyText);
  const selectedLabel = [structured?.customName, selectedPart ? partLabel(selectedPart) : "", legacyText]
    .find((value) => value && value.trim() && value.trim().toLowerCase() !== "undefined") ?? "";
  const schemaCategory = field.electronicsKey && ["esc", "servo", "gyro"].includes(field.electronicsKey) ? field.electronicsKey : undefined;
  const schema = schemaCategory
    ? findElectronicsSchemaForProduct(
        schemaCategory,
        structured?.brand ?? selectedPart?.brand ?? "",
        structured?.model ?? selectedPart?.model ?? legacyText,
        structured?.slug || selectedPart?.slug
      )
    : undefined;
  const filtered = parts.filter((part) => `${part.brand} ${part.model} ${part.notes ?? ""}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  function saveCustom() {
    const name = customName.trim() || legacyText.trim();
    if (!name) return;
    onPartChange?.(null, name);
    setCustomOpen(false);
    setQuery("");
  }

  return (
    <div className="builderField partPicker fieldWide">
      <label>
        <span>{formatFormLabel(field.label)}</span>
        <input value={query} disabled={isNotApplicable} placeholder={field.placeholder || `Search ${field.label.toLowerCase()}...`} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {selectedLabel ? (
        <section className="selectedPartSummary">
          <strong>{selectedLabel}</strong>
          <span>{selectedPart ? catalogOptionDescription({ id: selectedPart.slug, category: "frontWheels", brand: selectedPart.brand, productName: selectedPart.model, modelNumber: "", compatibleChassis: [], notes: selectedPart.notes ?? "", tunableParameters: [], userAdded: false, verified: false }) : structured?.notes || "Saved to this tune. You can change it or use Other / Custom."}</span>
        </section>
      ) : null}
      <div className="partOptionGrid">
        {filtered.map((part) => (
          <button key={part.slug} type="button" onClick={() => onPartChange?.(part, "")}>
            <strong>{part.brand}</strong>
            <span>{part.model}</span>
          </button>
        ))}
        <button className="customPartOption" type="button" onClick={() => {
          setCustomOpen((open) => !open);
          setCustomName(selectedLabel || "");
        }}>
          Other / Custom
        </button>
      </div>
      {customOpen ? (
        <div className="customPartEntry">
          <TextField label={`Custom ${field.label}`} value={customName} placeholder="Type the exact part you use" onChange={(event) => setCustomName(event.target.value)} />
          <button className="smallPill" type="button" onClick={saveCustom}>Use custom part</button>
        </div>
      ) : null}
      {schema && schemaCategory ? (
        <ElectronicsSettingsDisclosure
          category={schemaCategory}
          schema={schema}
          settings={structured?.settings ?? {}}
          builderMode={builderMode}
          onChange={onElectronicsSettingChange}
        />
      ) : null}
      <NotApplicableToggle checked={Boolean(isNotApplicable)} onChange={(checked) => (checked ? onNotApplicable() : onClearNotApplicable())} />
    </div>
  );
}

function AcuvancePowerDeviceSettings({
  tune,
  onChange
}: {
  tune: Tune;
  onChange: (values: Record<string, BuilderValue>) => void;
}) {
  const selected = String(tune.values.powerCapacitor ?? "");
  return (
    <div className="electronicsSchemaPanel compactSchemaPanel">
      <header>
        <div>
          <p>Acuvance capacitor / power-device setup</p>
          <h4>{selected || "Acuvance power device"} settings</h4>
        </div>
        <span>ESC add-on</span>
      </header>
      <p className="schemaNote">Save how this Acuvance device is installed so the ESC setup sheet matches the actual wiring on the car.</p>
      <div className="schemaFieldGrid">
        <label className="formField schemaField">
          <span>Connection point</span>
          <select value={String(tune.values.acuvancePowerConnection ?? "")} onChange={(event) => onChange({ acuvancePowerConnection: event.target.value })}>
            <option value="">Skip for now</option>
            <option>ESC battery terminal</option>
            <option>Device Station</option>
            <option>Receiver / RX port</option>
            <option>Other / Custom</option>
          </select>
          <small className="schemaFieldMeta">Acuvance recommends direct ESC/battery-terminal connection for maximum effect on capacitor products where applicable.</small>
        </label>
        <label className="formField schemaField">
          <span>Install method</span>
          <select value={String(tune.values.acuvancePowerInstallMethod ?? "")} onChange={(event) => onChange({ acuvancePowerInstallMethod: event.target.value })}>
            <option value="">Skip for now</option>
            <option>Soldered</option>
            <option>Plug connector</option>
            <option>Device Station terminal</option>
            <option>Not sure</option>
          </select>
        </label>
        <TextField label="Mount location" value={String(tune.values.acuvancePowerMountLocation ?? "")} placeholder="ex. beside ESC, rear deck" onChange={(event) => onChange({ acuvancePowerMountLocation: event.target.value })} />
        <TextField label="Wiring notes" value={String(tune.values.acuvancePowerWiringNotes ?? "")} placeholder="Lead length, polarity, extra devices..." onChange={(event) => onChange({ acuvancePowerWiringNotes: event.target.value })} />
      </div>
    </div>
  );
}

function ElectronicsSettingsDisclosure({
  category,
  schema,
  settings,
  builderMode,
  onChange
}: {
  category: ElectronicsCategory;
  schema: NonNullable<ReturnType<typeof findElectronicsSchema>>;
  settings: Record<string, ElectronicsSettingValue>;
  builderMode: "basic" | "advanced";
  onChange: (category: ElectronicsCategory, key: string, value: ElectronicsSettingValue) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="electronicsSettingsDisclosure fieldWide">
      <button className="smallPill" type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Hide settings" : `Edit ${schema.brand} ${schema.model} settings`}
      </button>
      {open ? (
        <ElectronicsSchemaPanel
          category={category}
          schema={schema}
          settings={settings}
          builderMode={builderMode}
          onChange={onChange}
        />
      ) : null}
    </section>
  );
}

function ElectronicsSchemaPanel({
  category,
  schema,
  settings,
  builderMode,
  onChange
}: {
  category: ElectronicsCategory;
  schema: NonNullable<ReturnType<typeof findElectronicsSchema>>;
  settings: Record<string, ElectronicsSettingValue>;
  builderMode: "basic" | "advanced";
  onChange: (category: ElectronicsCategory, key: string, value: ElectronicsSettingValue) => void;
}) {
  return (
    <section className="electronicsSchemaPanel">
      <header>
        <div>
          <p>{schema.sourceLabel}</p>
          <h4>{schema.brand} {schema.model} settings</h4>
        </div>
        <span>{builderMode === "advanced" ? "Advanced" : "Basic"}</span>
      </header>
      {schema.notes ? <p className="schemaNote">{schema.notes}</p> : null}
      {schema.groups.map((group) => {
        const fields = group.fields.filter((schemaField) => builderMode === "advanced" || !schemaField.advanced);
        if (!fields.length) return null;
        return (
          <div className="schemaGroup" key={group.groupId}>
            <div>
              <strong>{group.label}</strong>
              {group.helper ? <small>{group.helper}</small> : null}
            </div>
            <div className="schemaFieldGrid">
              {fields.map((schemaField) => (
                <ElectronicsSchemaInput
                  key={schemaField.key}
                  field={schemaField}
                  value={settings[schemaField.key] ?? schemaField.defaultValue ?? ""}
                  onChange={(value) => onChange(category, schemaField.key, value)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ElectronicsSchemaInput({ field, value, onChange }: { field: ElectronicsSchemaField; value: ElectronicsSettingValue; onChange: (value: ElectronicsSettingValue) => void }) {
  const id = `electronics-${field.key}`;
  const isNotApplicable = value === BEGINNER_NOT_APPLICABLE_OPTION;
  const notApplicable = <NotApplicableToggle checked={isNotApplicable} onChange={(checked) => onChange(checked ? BEGINNER_NOT_APPLICABLE_OPTION : "")} />;
  if (field.type === "toggle") {
    return (
      <div className="schemaFieldWrap">
        <label className="schemaToggle" htmlFor={id}>
          <input id={id} type="checkbox" checked={Boolean(value) && !isNotApplicable} disabled={isNotApplicable} onChange={(event) => onChange(event.target.checked)} />
          <span>{field.label}</span>
        </label>
        {notApplicable}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="schemaFieldWrap">
        <label className="formField schemaField">
          <span>{field.label}</span>
          <select value={String(value)} disabled={isNotApplicable} onChange={(event) => onChange(event.target.value)}>
            <option value="">Skip for now</option>
            {field.options?.map((option) => <option key={option}>{option}</option>)}
          </select>
          <SchemaFieldMeta field={field} />
        </label>
        {notApplicable}
      </div>
    );
  }

  if (field.type === "slider") {
    const numeric = Number(value || field.defaultValue || field.min || 0);
    return (
      <div className="schemaFieldWrap">
        <label className="formField schemaField">
          <span>{field.label}: {numeric}{field.unit ?? ""}</span>
          <input type="range" min={field.min ?? 0} max={field.max ?? 100} step={field.step ?? 1} value={numeric} disabled={isNotApplicable} onChange={(event) => onChange(Number(event.target.value))} />
          <SchemaFieldMeta field={field} />
        </label>
        {notApplicable}
      </div>
    );
  }

  const numeric = field.type === "number" || field.type === "unit-number";
  return (
    <div className="schemaFieldWrap">
      <label className="formField schemaField">
        <span>{field.label}</span>
        <div className="inputWithUnit">
          <input
            type={numeric ? "number" : "text"}
            inputMode={numeric ? "decimal" : "text"}
            min={field.min}
            max={field.max}
            step={field.step}
            value={String(value)}
            disabled={isNotApplicable}
            placeholder="Skip for now"
            onChange={(event) => onChange(numeric ? Number(event.target.value) : event.target.value)}
          />
          {field.unit ? <em>{field.unit}</em> : null}
        </div>
        <SchemaFieldMeta field={field} />
      </label>
      {notApplicable}
    </div>
  );
}

function SchemaFieldMeta({ field }: { field: ElectronicsSchemaField }) {
  if (!field.description && !field.safetyWarning && !field.sourceNote) return null;
  return (
    <small className="schemaFieldMeta">
      {field.safetyWarning || field.description || field.sourceNote}
      {field.verified === false ? " Unverified; stored as custom/freeform." : ""}
    </small>
  );
}

function ElectronicsProfileTools({
  section,
  profiles,
  onApply,
  onSave
}: {
  section: UniversalSection;
  profiles: ElectronicsProfile[];
  onApply: (profileId: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="electronicsProfileTools fieldWide">
      <div>
        <SlidersHorizontal size={19} />
        <span>{section.helper}</span>
      </div>
      <label>
        <span>Apply saved {section.title.toLowerCase()} profile</span>
        <select defaultValue="" onChange={(event) => onApply(event.target.value)}>
          <option value="">Choose saved profile</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
      </label>
      <button className="smallPill" type="button" onClick={onSave}>
        <Save size={16} />
        Save these settings as profile
      </button>
    </div>
  );
}

function SuggestionRow({ values, showNotSure, onPick }: { values: string[]; showNotSure?: boolean; onPick: (value: string) => void }) {
  const options = [...(showNotSure ? ["Not sure"] : []), ...values];
  if (!options.length) return null;
  return (
    <div className="suggestionRow">
      {options.map((value) => (
        <button key={value} type="button" onClick={() => onPick(value)}>{value}</button>
      ))}
    </div>
  );
}

function ChassisTuneFields({ tune, car, onChange }: { tune: Tune; car?: Car; onChange: (patch: Partial<Tune>) => void }) {
  const chassisInfo = chassisInfoFromTune(tune, car);
  const selectedBrand = findChassisBrand(tune.chassisBrandSlug || chassisInfo.brandSlug);
  const brandSlug = selectedBrand?.slug ?? "other";
  const models = modelsForBrand(brandSlug);
  const selectedModel = tune.chassisModel || (models.includes(chassisInfo.model) ? chassisInfo.model : models[0] ?? "Custom");

  return (
    <section className="builderSectionCard chassisBuilderCard">
      <div className="builderFieldGrid">
        <div className="chassisBrandPreview">
          <BrandLogo brandSlug={brandSlug} size="large" />
          <span>{brandSlug === "other" ? "Custom chassis" : "Selected chassis brand"}</span>
        </div>
        <div className="formSplit">
          <SelectField label="Chassis brand" value={brandSlug} onChange={(event) => {
            const brand = findChassisBrand(event.target.value);
            const model = brand?.models[0] ?? "Custom";
            onChange({
              chassisBrand: brand?.name ?? "Other / Custom",
              chassisBrandSlug: event.target.value,
              chassisModel: model,
              chassisModelSlug: slugifyChassis(model),
              customChassisBrand: event.target.value === "other" ? tune.customChassisBrand ?? "" : "",
              customChassisModel: event.target.value === "other" ? tune.customChassisModel ?? "" : ""
            });
          }}>
            {chassisBrands.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}
          </SelectField>
          <SelectField label="Chassis model" value={selectedModel} onChange={(event) => onChange({ chassisModel: event.target.value, chassisModelSlug: slugifyChassis(event.target.value) })}>
            {models.map((model) => <option key={model}>{model}</option>)}
          </SelectField>
        </div>
        {brandSlug === "other" ? (
          <div className="formSplit">
            <TextField label="Custom chassis brand" value={tune.customChassisBrand ?? ""} placeholder="Your brand" onChange={(event) => onChange({ customChassisBrand: event.target.value, chassisBrand: event.target.value || "Other / Custom", chassisBrandSlug: "other" })} />
            <TextField label="Custom chassis model" value={tune.customChassisModel ?? ""} placeholder="Your model" onChange={(event) => onChange({ customChassisModel: event.target.value, chassisModel: event.target.value || "Custom", chassisModelSlug: slugifyChassis(event.target.value || "Custom") })} />
          </div>
        ) : null}
        <TextField label="Chassis variant" value={tune.chassisVariant ?? ""} placeholder="Conversion, version, option package..." onChange={(event) => onChange({ chassisVariant: event.target.value })} />
      </div>
    </section>
  );
}

function TuneSummary({ tune, car, onClose }: { tune: Tune; car?: Car; onClose: () => void }) {
  const filled = allBuilderFields
    .map((field) => [field.label, fieldValue(tune, field)] as const)
    .filter(([, value]) => String(value ?? "").trim())
    .slice(0, 16);
  const latestChange = tune.history?.[0];

  return (
    <section className="summaryPanel" aria-label="Tune summary preview">
      <header>
        <div>
          <p>Tune summary</p>
          <h2>{tuneDisplayName(tune)}</h2>
          <span>{car?.name ?? "Garage car"} / {tune.track || "Track not set"}</span>
        </div>
        <button className="smallPill" type="button" onClick={onClose}>Close</button>
      </header>
      <TuneVisualSummary tune={tune} car={car} compact />
      <BasicTuneSummary tune={tune} car={car} compact />
      <section className="changeSnapshot">
        <p>Changed Since Last Tune</p>
        {latestChange ? (
          <>
            <strong>{latestChange.summary}</strong>
            <span>{[latestChange.reason, latestChange.result, latestChange.trackCondition].filter(Boolean).join(" · ") || new Date(latestChange.date).toLocaleDateString()}</span>
            {latestChange.changes?.length ? <em>{latestChange.changes.slice(0, 3).join(" / ")}</em> : null}
          </>
        ) : (
          <span>No change log yet. Duplicate a tune or save test notes to track what changed.</span>
        )}
      </section>
      <dl>
        {filled.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{String(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}


