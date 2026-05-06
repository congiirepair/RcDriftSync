import { Check, ChevronDown, ClipboardCheck, CopyPlus, Download, Eye, FileText, Lightbulb, Plus, Save, Share2, SlidersHorizontal, Trash2, Wrench } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { Car, ElectronicsProfile, ElectronicsProfileType, SetupAssistantEntry, Tune, TunePhoto } from "../types";
import { absoluteShareUrl } from "../config/domain";
import { getPdfTemplate } from "../data/pdfTemplates";
import { snapshotTune } from "../utils/changes";
import { downloadPdf, generateFilledPdf } from "../utils/pdfExport";
import { downloadUniversalTunePdf, generateUniversalTunePdf } from "../utils/universalPdfExport";
import { PhotosTab } from "./PhotosTab";
import { FeelEditor, TuneCategoryTabs, TuneTimeline, TuneVisualSummary, VisualChassisMap } from "./TuneVisuals";
import { EmptyState, SelectField, TextAreaField, TextField } from "./UiPrimitives";

type SetupMode = "official" | "universal" | "custom";
type StartingPoint = "blank" | "duplicate" | "baseline" | "import";
type BuilderValue = string | number | boolean | string[];

function tuneDisplayName(tune: Pick<Tune, "name">) {
  return tune.name.trim() || "Untitled tune";
}

function tuneFileSlug(tune: Pick<Tune, "name">) {
  return tune.name.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "untitled-tune";
}

interface UniversalTuneBuilderProps {
  cars: Car[];
  tunes: Tune[];
  activeTune: Tune | null;
  electronicsProfiles: ElectronicsProfile[];
  onCreateTune: (options: { carId: string; setupMode: SetupMode; startingPoint: StartingPoint; sourceTuneId?: string }) => void;
  onUpdateTune: (tune: Tune) => void;
  onSaveTune: () => void;
  onSaveElectronicsProfile: (profile: ElectronicsProfile) => void;
  onDeleteTune: (tuneId: string) => void;
  onDuplicateTune: (tune: Tune) => void;
  onSelectTune: (tuneId: string) => void;
  dirty: boolean;
}

interface UniversalField {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "rating" | "tags";
  options?: string[];
  placeholder?: string;
  suffix?: string;
  meta?: keyof Tune;
  notSure?: boolean;
}

interface UniversalSection {
  id: string;
  title: string;
  profileType?: ElectronicsProfileType;
  helper?: string;
  fields: UniversalField[];
}

const universalSections: UniversalSection[] = [
  {
    id: "basics",
    title: "Basics",
    fields: [
      { id: "name", label: "Tune name", type: "text", meta: "name", placeholder: "Enter tune name" },
      { id: "date", label: "Date", type: "text", meta: "date" },
      { id: "driver", label: "Driver", type: "text" },
      { id: "track", label: "Track / location", type: "text", meta: "track" },
      { id: "surface", label: "Surface", type: "select", meta: "surface", options: ["Not sure", "Plastic tile", "Carpet", "Asphalt", "Colored concrete", "Concrete", "P tile", "Other"], notSure: true },
      { id: "grip", label: "Grip level", type: "select", meta: "grip", options: ["Not sure", "Low", "Low to medium", "Medium", "High", "Very high"], notSure: true },
      { id: "tires", label: "Tire", type: "text", placeholder: "DS LF-5, LF-4..." },
      { id: "body", label: "Body", type: "text" },
      { id: "wing", label: "Wing", type: "text" },
      { id: "rating", label: "Rating", type: "rating", meta: "rating" },
      { id: "confidenceRating", label: "Confidence rating", type: "rating", meta: "confidenceRating" },
      { id: "trackConditionPreset", label: "Track condition preset", type: "select", meta: "trackConditionPreset", options: ["Not sure", "Low grip practice", "High grip comp", "Carpet flow", "P-tile technical", "Asphalt street", "Wet / dusty", "Fresh tire test"], notSure: true },
      { id: "setupIntent", label: "Tune goal", type: "tags", meta: "setupIntent", placeholder: "more angle, stable, forward bite" },
      { id: "bestForTags", label: "Best for", type: "tags", meta: "bestForTags", placeholder: "P-tile, comp, low grip" },
      { id: "tags", label: "Tags", type: "tags", meta: "tags", placeholder: "baseline, carpet, high grip" },
      { id: "notes", label: "Notes", type: "textarea", meta: "notes" }
    ]
  },
  {
    id: "front",
    title: "Front setup",
    fields: [
      { id: "frontRideHeight", label: "Front ride height", type: "number", suffix: "mm" },
      { id: "frontCamber", label: "Front camber", type: "number", suffix: "deg" },
      { id: "frontToe", label: "Front toe", type: "number", suffix: "deg" },
      { id: "caster", label: "Caster", type: "text", placeholder: "Not sure", notSure: true },
      { id: "kpi", label: "KPI", type: "text", placeholder: "Not sure", notSure: true },
      { id: "ackerman", label: "Ackerman", type: "text", placeholder: "Not sure", notSure: true },
      { id: "frontTrackWidth", label: "Front track width", type: "number", suffix: "mm" },
      { id: "frontWheelOffset", label: "Front wheel offset", type: "text" },
      { id: "frontSpring", label: "Front spring", type: "text" },
      { id: "frontShockOil", label: "Front shock oil", type: "text" },
      { id: "frontPiston", label: "Front piston", type: "text" },
      { id: "frontShockShaft", label: "Front shock shaft", type: "text" },
      { id: "frontShockPosition", label: "Front shock position", type: "text" },
      { id: "frontUpperLink", label: "Front upper arm / link position", type: "text" },
      { id: "frontLowerArm", label: "Front lower arm position", type: "text" },
      { id: "frontKnuckle", label: "Front knuckle", type: "text" },
      { id: "frontHub", label: "Front hub", type: "text" },
      { id: "frontSpacerNotes", label: "Front spacer notes", type: "textarea" },
      { id: "frontMemo", label: "Front memo", type: "textarea" }
    ]
  },
  {
    id: "rear",
    title: "Rear setup",
    fields: [
      { id: "rearRideHeight", label: "Rear ride height", type: "number", suffix: "mm" },
      { id: "rearCamber", label: "Rear camber", type: "number", suffix: "deg" },
      { id: "rearToe", label: "Rear toe", type: "number", suffix: "deg" },
      { id: "skidAngle", label: "Skid angle", type: "text", placeholder: "Not sure", notSure: true },
      { id: "rearTrackWidth", label: "Rear track width", type: "number", suffix: "mm" },
      { id: "rearWheelOffset", label: "Rear wheel offset", type: "text" },
      { id: "rearSpring", label: "Rear spring", type: "text" },
      { id: "rearShockOil", label: "Rear shock oil", type: "text" },
      { id: "rearPiston", label: "Rear piston", type: "text" },
      { id: "rearShockShaft", label: "Rear shock shaft", type: "text" },
      { id: "rearShockPosition", label: "Rear shock position", type: "text" },
      { id: "rearUpperLink", label: "Rear upper arm / link position", type: "text" },
      { id: "rearLowerArm", label: "Rear lower arm position", type: "text" },
      { id: "rearHubCarrier", label: "Rear hub carrier", type: "text" },
      { id: "rearSpacerNotes", label: "Rear spacer notes", type: "textarea" },
      { id: "rearMemo", label: "Rear memo", type: "textarea" }
    ]
  },
  {
    id: "drivetrain",
    title: "Drivetrain",
    fields: [
      { id: "motorPosition", label: "Motor position", type: "select", options: ["Not sure", "High", "Low", "Mid", "Rear"], notSure: true },
      { id: "ballDiffSetting", label: "Ball diff setting", type: "text" },
      { id: "gearDiffOil", label: "Gear diff oil", type: "text" },
      { id: "lsdSetting", label: "LSD setting", type: "text" },
      { id: "spurGear", label: "Spur gear", type: "number" },
      { id: "pinionGear", label: "Pinion gear", type: "number" },
      { id: "finalDriveRatio", label: "Final drive ratio", type: "text" },
      { id: "beltShaftNotes", label: "Belt / shaft notes", type: "textarea" },
      { id: "drivetrainMemo", label: "Drivetrain memo", type: "textarea" }
    ]
  },
  {
    id: "weight-body",
    title: "Weight and body",
    fields: [
      { id: "batteryPosition", label: "Battery position", type: "text" },
      { id: "addedWeight", label: "Added weight", type: "text" },
      { id: "weightLocation", label: "Weight location", type: "text" },
      { id: "chassisBrace", label: "Chassis brace", type: "text" },
      { id: "bodyShell", label: "Body shell", type: "text" },
      { id: "aeroWing", label: "Wing", type: "text" },
      { id: "aeroNotes", label: "Aero notes", type: "textarea" },
      { id: "weightBalanceNotes", label: "Weight balance notes", type: "textarea" }
    ]
  },
  {
    id: "esc-tune",
    title: "ESC Tune",
    profileType: "esc",
    helper: "Save different ESC profiles for high grip, low grip, carpet, asphalt, and tire changes.",
    fields: [
      { id: "escBrand", label: "ESC brand", type: "text", placeholder: "Acuvance, Hobbywing..." },
      { id: "escModel", label: "ESC model", type: "text" },
      { id: "escProfileName", label: "ESC profile name", type: "text", placeholder: "High Grip ESC Tune" },
      { id: "throttleCurve", label: "Throttle curve", type: "text", placeholder: "Not sure", notSure: true },
      { id: "throttlePunch", label: "Throttle punch", type: "text" },
      { id: "brakeStrength", label: "Brake strength", type: "text" },
      { id: "dragBrake", label: "Drag brake", type: "text" },
      { id: "neutralBrake", label: "Neutral brake", type: "text" },
      { id: "initialBrake", label: "Initial brake", type: "text" },
      { id: "boostTiming", label: "Boost timing", type: "text" },
      { id: "boostStartRpm", label: "Boost start RPM", type: "number" },
      { id: "boostEndRpm", label: "Boost end RPM", type: "number" },
      { id: "turboTiming", label: "Turbo timing", type: "text" },
      { id: "turboDelay", label: "Turbo delay", type: "text" },
      { id: "turboSlope", label: "Turbo slope", type: "text" },
      { id: "motorTiming", label: "Motor timing", type: "text" },
      { id: "pwmFrequency", label: "PWM frequency", type: "text" },
      { id: "driveFrequency", label: "Drive frequency", type: "text" },
      { id: "brakeFrequency", label: "Brake frequency", type: "text" },
      { id: "becVoltage", label: "BEC voltage", type: "text" },
      { id: "currentLimit", label: "Current limit", type: "text" },
      { id: "reverseStrength", label: "Reverse strength", type: "text" },
      { id: "motorRotation", label: "Motor rotation", type: "select", options: ["Not sure", "Normal", "Reverse"], notSure: true },
      { id: "escFirmwareVersion", label: "Firmware version", type: "text" },
      { id: "escNotes", label: "ESC notes", type: "textarea" },
      { id: "escProgrammerPhotoNote", label: "Photo of ESC programmer screen", type: "text", placeholder: "Attach in Photos, add note here" },
      { id: "escWiringPhotoNote", label: "Photo of ESC wiring", type: "text", placeholder: "Attach in Photos, add note here" }
    ]
  },
  {
    id: "servo-tune",
    title: "Servo Tune",
    profileType: "servo",
    helper: "Servo settings are saved on each tune so you can change speed, endpoints, and trim by track.",
    fields: [
      { id: "servoBrand", label: "Servo brand", type: "text" },
      { id: "servoModel", label: "Servo model", type: "text" },
      { id: "servoHornLength", label: "Servo horn length", type: "text" },
      { id: "servoSpline", label: "Servo spline", type: "text" },
      { id: "servoSpeedSetting", label: "Servo speed setting", type: "text" },
      { id: "servoTorqueSetting", label: "Servo torque setting", type: "text" },
      { id: "endpointLeft", label: "Endpoint left", type: "text" },
      { id: "endpointRight", label: "Endpoint right", type: "text" },
      { id: "centerTrim", label: "Center trim", type: "text" },
      { id: "subtrim", label: "Subtrim", type: "text" },
      { id: "deadband", label: "Deadband", type: "text" },
      { id: "servoFrequency", label: "Frequency", type: "text" },
      { id: "servoVoltage", label: "Voltage", type: "text" },
      { id: "directMode", label: "Direct / SR / SSR mode", type: "select", options: ["Not sure", "Direct mode", "SR mode", "SSR mode", "Normal"], notSure: true },
      { id: "servoSaver", label: "Servo saver or solid horn", type: "select", options: ["Not sure", "Servo saver", "Solid horn"], notSure: true },
      { id: "servoNotes", label: "Servo notes", type: "textarea" },
      { id: "servoSetupPhotoNote", label: "Photo of servo setup", type: "text", placeholder: "Attach in Photos, add note here" }
    ]
  },
  {
    id: "gyro-tune",
    title: "Gyro Tune",
    profileType: "gyro",
    helper: "Gyro gain and mode often change with tire, surface, and track speed.",
    fields: [
      { id: "gyroBrand", label: "Gyro brand", type: "text" },
      { id: "gyroModel", label: "Gyro model", type: "text" },
      { id: "gyroGain", label: "Gyro gain", type: "text" },
      { id: "gyroMode", label: "Gyro mode", type: "select", options: ["Not sure", "Normal", "Assist", "AVCS", "Soft", "Hard"], notSure: true },
      { id: "gyroEndpointSetting", label: "Endpoint setting", type: "text" },
      { id: "gyroCurveSetting", label: "Curve setting", type: "text" },
      { id: "gainFromTransmitter", label: "Gain from transmitter", type: "select", options: ["Not sure", "Yes", "No"], notSure: true },
      { id: "gyroDirection", label: "Gyro direction", type: "select", options: ["Not sure", "Normal", "Reverse"], notSure: true },
      { id: "gyroNotes", label: "Gyro notes", type: "textarea" }
    ]
  },
  {
    id: "radio-tune",
    title: "Radio Tune",
    profileType: "radio",
    helper: "Radio settings are tune-specific because expo, endpoints, and curves can change by surface.",
    fields: [
      { id: "radioBrand", label: "Radio brand", type: "text" },
      { id: "radioModel", label: "Radio model", type: "text" },
      { id: "steeringDualRate", label: "Steering dual rate", type: "text" },
      { id: "steeringExpo", label: "Steering expo", type: "text" },
      { id: "throttleExpo", label: "Throttle expo", type: "text" },
      { id: "radioThrottleCurve", label: "Throttle curve", type: "text" },
      { id: "brakeCurve", label: "Brake curve", type: "text" },
      { id: "channelMixingNotes", label: "Channel mixing notes", type: "textarea" },
      { id: "steeringEndpointLeft", label: "Steering endpoint left", type: "text" },
      { id: "steeringEndpointRight", label: "Steering endpoint right", type: "text" },
      { id: "throttleEndpoint", label: "Throttle endpoint", type: "text" },
      { id: "brakeEndpoint", label: "Brake endpoint", type: "text" },
      { id: "radioNotes", label: "Radio notes", type: "textarea" }
    ]
  },
  {
    id: "notes-section",
    title: "Notes",
    fields: [
      { id: "generalNotes", label: "General notes", type: "textarea" },
      { id: "trackNotes", label: "Track notes", type: "textarea" },
      { id: "whatChanged", label: "What changed", type: "textarea" },
      { id: "changeReason", label: "Why I changed it", type: "textarea", meta: "changeReason" },
      { id: "howItFelt", label: "How it felt", type: "textarea" },
      { id: "testResult", label: "Test result", type: "select", meta: "testResult", options: ["", "better", "worse", "no-change"] },
      { id: "nextChanges", label: "Next changes to try", type: "textarea" }
    ]
  }
];

const allBuilderFields = universalSections.flatMap((section) => section.fields);

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
  return tune.values[field.id] ?? "";
}

function completedFieldCount(tune: Tune | null) {
  if (!tune) return 0;
  return allBuilderFields.filter((field) => {
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
  dirty
}: UniversalTuneBuilderProps) {
  const [carId, setCarId] = useState(cars[0]?.id ?? "");
  const selectedCar = cars.find((car) => car.id === carId) ?? cars[0];
  const officialSupported = Boolean(selectedCar?.officialTemplateEligible || selectedCar?.templateMode === "official" || selectedCar?.sheetId === "rdx-template" || selectedCar?.sheetId === "mc3-template");
  const [setupMode, setSetupMode] = useState<SetupMode>(officialSupported ? "official" : "universal");
  const [startingPoint, setStartingPoint] = useState<StartingPoint>("blank");
  const [sourceTuneId, setSourceTuneId] = useState("");
  const [openSection, setOpenSection] = useState(universalSections[0].id);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const carTunes = tunes.filter((tune) => tune.carId === carId);
  const completion = activeTune ? Math.round((completedFieldCount(activeTune) / allBuilderFields.length) * 100) : 0;
  const activeTemplate = activeTune ? getPdfTemplate(activeTune.sheetId) : null;
  const isOfficialPdf = activeTemplate?.id === "rdx-template" || activeTemplate?.id === "mc3-template";

  useEffect(() => {
    if (!selectedCar) return;
    const handle = window.setTimeout(() => setSetupMode(officialSupported ? "official" : "universal"), 0);
    return () => window.clearTimeout(handle);
  }, [officialSupported, selectedCar]);

  useEffect(() => {
    if (!activeTune) return;
    const handle = window.setTimeout(() => onSaveTune(), 900);
    return () => window.clearTimeout(handle);
  }, [activeTune, onSaveTune]);

  useEffect(() => {
    const handle = window.setTimeout(() => setOpenSection(universalSections[0].id), 0);
    return () => window.clearTimeout(handle);
  }, [activeTune?.id]);

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
      if (typeof value === "string") next.selections = { ...next.selections, [field.id]: value };
    }

    onUpdateTune(next);
  }

  function applyElectronicsProfile(profileId: string) {
    if (!activeTune || !profileId) return;
    const profile = electronicsProfiles.find((item) => item.id === profileId);
    if (!profile) return;
    onUpdateTune({
      ...activeTune,
      values: { ...activeTune.values, ...profile.values, [`${profile.type}ProfileId`]: profile.id, [`${profile.type}ProfileName`]: profile.name },
      updatedAt: new Date().toISOString()
    });
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
    setDeleteConfirmOpen(true);
  }

  function updateShareSettings(patch: Partial<Tune>) {
    if (!activeTune) return;
    onUpdateTune({ ...activeTune, ...patch, updatedAt: new Date().toISOString() });
  }

  async function previewPdf() {
    if (!activeTune || !selectedCar) return;
    setPdfBusy(true);
    try {
      const template = getPdfTemplate(activeTune.sheetId);
      const official = template.id === "rdx-template" || template.id === "mc3-template";
      const bytes = official ? await generateFilledPdf(template, activeTune) : await generateUniversalTunePdf(activeTune, selectedCar);
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
      await onSaveTune();
      const template = getPdfTemplate(activeTune.sheetId);
      const official = template.id === "rdx-template" || template.id === "mc3-template";
      if (official) {
        const bytes = await generateFilledPdf(template, activeTune);
        downloadPdf(bytes, `${tuneFileSlug(activeTune)}-${template.id}-official-setup-sheet.pdf`);
      } else {
        await downloadUniversalTunePdf(activeTune, selectedCar);
      }
    } finally {
      setPdfBusy(false);
    }
  }

  if (!cars.length) {
    return <EmptyState title="Add a car first" body="The Tune Builder needs a garage car before it can create a setup." />;
  }

  return (
    <main className="universalBuilder">
      <section className="builderStart appCard">
        <div className="builderStartHeader">
          <div>
            <p>Start tune</p>
            <h2>Create or continue a setup</h2>
          </div>
          <span>{completion}% complete</span>
        </div>
        <div className="progressTrack" aria-label="Tune completion progress">
          <i style={{ width: `${completion}%` }} />
        </div>
        <TuneCategoryTabs />
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
            <option value="custom" disabled>Custom sheet later</option>
          </SelectField>
          <SelectField label="Starting point" value={startingPoint} onChange={(event) => setStartingPoint(event.target.value as StartingPoint)}>
            <option value="blank">Blank tune</option>
            <option value="duplicate">Duplicate previous tune</option>
            <option value="baseline">Use baseline</option>
            <option value="import" disabled>Import shared tune later</option>
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
      </section>

      <div className="tunePicker" aria-label="Select tune">
        {tunes.slice(0, 8).map((item) => (
          <button key={item.id} className={item.id === activeTune?.id ? "active" : ""} type="button" onClick={() => onSelectTune(item.id)}>
            {tuneDisplayName(item)}
          </button>
        ))}
      </div>

      {!activeTune ? (
        <EmptyState title="No tune selected" body="Create a blank tune, duplicate an existing tune, or use a baseline to start." />
      ) : (
        <>
          <section className="activeTuneBanner">
            <div>
              <p>{selectedCar?.chassisModel || selectedCar?.chassis || "RC drift car"}</p>
              <h2>{tuneDisplayName(activeTune)}</h2>
              <span>{dirty ? "Unsaved edits" : "Autosaved locally"}</span>
            </div>
            <button className="iconButton" type="button" onClick={deleteActiveTune} aria-label={`Delete ${tuneDisplayName(activeTune)}`}>
              <Trash2 size={19} />
            </button>
          </section>

          <div className="builderVisualGrid">
            <TuneVisualSummary tune={activeTune} car={selectedCar} />
            <VisualChassisMap tune={activeTune} />
          </div>

          <FeelEditor tune={activeTune} onChange={(expectedFeel) => onUpdateTune({ ...activeTune, expectedFeel, updatedAt: new Date().toISOString() })} />

          {deleteConfirmOpen ? (
            <div className="modalShade" role="presentation">
              <section className="confirmModal" role="dialog" aria-modal="true" aria-labelledby="builder-delete-title">
                <h2 id="builder-delete-title">Delete tune?</h2>
                <p>This removes “{tuneDisplayName(activeTune)}” from your saved tunes. It will also be removed from your account if you are signed in.</p>
                <div className="buttonRow">
                  <button className="smallPill" type="button" onClick={() => setDeleteConfirmOpen(false)}>Cancel</button>
                  <button
                    className="primaryAction destructive"
                    type="button"
                    onClick={() => {
                      setDeleteConfirmOpen(false);
                      onDeleteTune(activeTune.id);
                    }}
                  >
                    <Trash2 size={17} />
                    Delete tune
                  </button>
                </div>
              </section>
            </div>
          ) : null}

          <section className="builderSections">
            {universalSections.map((section) => {
              const isOpen = openSection === section.id;
              const sectionDone = section.fields.filter((field) => String(fieldValue(activeTune, field) ?? "").trim()).length;
              return (
                <article className="builderSectionCard" key={section.id}>
                  <button className="sectionToggle" type="button" onClick={() => setOpenSection(isOpen ? "" : section.id)} aria-expanded={isOpen}>
                    <span>
                      <strong>{section.title}</strong>
                      <em>{sectionDone}/{section.fields.length} filled</em>
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
                      {section.id === "photos" ? null : section.fields.map((field) => (
                        <BuilderField
                          key={field.id}
                          field={field}
                          tune={activeTune}
                          tunes={tunes}
                          onChange={(value) => updateField(field, value)}
                        />
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}

            <article className="builderSectionCard">
              <button className="sectionToggle" type="button" onClick={() => setOpenSection(openSection === "photos" ? "" : "photos")} aria-expanded={openSection === "photos"}>
                <span>
                  <strong>Photos</strong>
                  <em>{activeTune.photos.length} attached</em>
                </span>
                <ChevronDown size={19} />
              </button>
              {openSection === "photos" ? <PhotosTab tune={activeTune} onPhotos={(photos: TunePhoto[]) => onUpdateTune({ ...activeTune, photos, updatedAt: new Date().toISOString() })} /> : null}
            </article>

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

            <SharingSettings tune={activeTune} onChange={updateShareSettings} />
          </section>

          {previewOpen ? <TuneSummary tune={activeTune} car={selectedCar} onClose={() => setPreviewOpen(false)} /> : null}
          {pdfPreviewUrl ? <PdfPreviewPanel official={isOfficialPdf} templateName={activeTemplate?.name} url={pdfPreviewUrl} onClose={() => setPdfPreviewUrl("")} /> : null}

          <div className="builderStickyActions">
            <button className="smallPill" type="button" onClick={() => setPreviewOpen(true)}>
              <Eye size={17} />
              Preview tune
            </button>
            <button className="smallPill" type="button" onClick={previewPdf} disabled={pdfBusy}>
              <FileText size={17} />
              {pdfBusy ? "Building..." : "Preview PDF"}
            </button>
            <button className="smallPill" type="button" onClick={exportPdf} disabled={pdfBusy}>
              <Download size={17} />
              Export PDF
            </button>
            <button className="primaryAction" type="button" onClick={onSaveTune}>
              {dirty ? <Save size={18} /> : <Check size={18} />}
              {dirty ? "Save tune" : "Saved"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}

function SharingSettings({ tune, onChange }: { tune: Tune; onChange: (patch: Partial<Tune>) => void }) {
  const shareId = tune.shareId || tune.id;
  const shareUrl = absoluteShareUrl(shareId);
  const shareEnabled = tune.visibility === "public" || tune.visibility === "unlisted";
  const toggle = (key: keyof Tune) => (event: ChangeEvent<HTMLInputElement>) => onChange({ [key]: event.target.checked } as Partial<Tune>);

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
        <div className="shareToggleGrid">
          <ShareToggle label="Allow cloning" checked={Boolean(tune.cloneEnabled)} onChange={toggle("cloneEnabled")} />
          <ShareToggle label="Show photos" checked={Boolean(tune.sharedPhotosEnabled)} onChange={toggle("sharedPhotosEnabled")} />
          <ShareToggle label="Show notes" checked={Boolean(tune.sharedNotesEnabled)} onChange={toggle("sharedNotesEnabled")} />
          <ShareToggle label="Show chassis setup" checked={tune.sharedChassisSetupEnabled !== false} onChange={toggle("sharedChassisSetupEnabled")} />
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

function PdfPreviewPanel({ official, templateName, url, onClose }: { official: boolean; templateName?: string; url: string; onClose: () => void }) {
  return (
    <section className="universalPdfPanel" aria-label={official ? "Official PDF preview" : "Universal PDF preview"}>
      <header>
        <div>
          <p>{official ? "Official PDF" : "Universal PDF"}</p>
          <h2>{official ? templateName ?? "Official setup sheet" : "RC Drift Sync setup sheet"}</h2>
        </div>
        <button className="smallPill" type="button" onClick={onClose}>Close</button>
      </header>
      <iframe title={official ? "Official setup PDF preview" : "Universal RC Drift Sync setup PDF preview"} src={url} />
      <button className="smallPill" type="button" disabled>
        <Share2 size={16} />
        Share PDF later
      </button>
    </section>
  );
}

function BuilderField({ field, tune, tunes, onChange }: { field: UniversalField; tune: Tune; tunes: Tune[]; onChange: (value: BuilderValue) => void }) {
  const value = fieldValue(tune, field);
  const suggestions = field.meta ? [] : recentlyUsedValues(tunes, field.id);
  const commonProps = { label: field.label };

  if (field.type === "textarea") {
    return (
      <div className="builderField fieldWide">
        <TextAreaField {...commonProps} value={String(value)} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
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
      </div>
    );
  }

  if (field.type === "rating") {
    return (
      <div className="builderField">
        <SelectField {...commonProps} value={String(value || 3)} onChange={(event) => onChange(Number(event.target.value))}>
          {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
        </SelectField>
      </div>
    );
  }

  if (field.type === "tags") {
    return (
      <div className="builderField fieldWide">
        <TextField {...commonProps} value={String(value)} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }

  return (
    <div className="builderField">
      <label className="formField">
        <span>{field.label}</span>
        <div className="inputWithUnit">
          <input
            type={field.type === "number" ? "number" : "text"}
            inputMode={field.type === "number" ? "decimal" : "text"}
            value={String(value)}
            placeholder={field.placeholder || "Skip for now"}
            onChange={(event) => onChange(field.type === "number" ? Number(event.target.value) : event.target.value)}
          />
          {field.suffix ? <em>{field.suffix}</em> : null}
        </div>
      </label>
      <SuggestionRow values={suggestions} onPick={onChange} showNotSure={field.notSure} />
    </div>
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

function TuneSummary({ tune, car, onClose }: { tune: Tune; car?: Car; onClose: () => void }) {
  const filled = allBuilderFields
    .map((field) => [field.label, fieldValue(tune, field)] as const)
    .filter(([, value]) => String(value ?? "").trim())
    .slice(0, 16);

  return (
    <section className="summaryPanel" aria-label="Tune summary preview">
      <header>
        <div>
          <p>Tune summary</p>
          <h2>{tuneDisplayName(tune)}</h2>
          <span>{car?.name ?? "Garage car"} · {tune.track || "Track not set"}</span>
        </div>
        <button className="smallPill" type="button" onClick={onClose}>Close</button>
      </header>
      <TuneVisualSummary tune={tune} car={car} compact />
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
