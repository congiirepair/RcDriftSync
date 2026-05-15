import { BASIC_CUSTOM_OPTION } from "../../data/basicTuneOptions";
import type { RcPartCategory } from "../../data/rcParts";
import type { Car, ElectronicsProfile, ElectronicsProfileType, Tune } from "../../types";

export type SetupMode = "official" | "universal" | "custom";
export type StartingPoint = "blank" | "duplicate" | "baseline" | "import";
export type BuilderValue = string | number | boolean | string[];
export type ElectronicsSettingValue = string | number | boolean | string[];

export function tuneDisplayName(tune: Pick<Tune, "name">) {
  return tune.name.trim() || "Untitled tune";
}

export const verifiedInternalRatioDefaults = [
  {
    brandSlug: "yokomo",
    label: "Yokomo drift chassis",
    internalRatio: 2.6,
    sourceNote: "Yokomo YD-2 gear-ratio chart"
  }
] as const;

export function numericGearValue(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : null;
  if (typeof value !== "string") return null;
  const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function suggestedInternalRatio(brandSlug: string) {
  return verifiedInternalRatioDefaults.find((preset) => preset.brandSlug === brandSlug);
}

export function calculateFinalDriveRatio(spur: unknown, pinion: unknown, internalRatio: unknown) {
  const spurTeeth = numericGearValue(spur);
  const pinionTeeth = numericGearValue(pinion);
  const internal = numericGearValue(internalRatio);
  if (!spurTeeth || !pinionTeeth || !internal) return "";
  return ((spurTeeth / pinionTeeth) * internal).toFixed(2);
}

export const shockTowerHoleOptions = ["Hole 1 top", "Hole 2", "Hole 3", "Hole 4", "Hole 5 lower", BASIC_CUSTOM_OPTION];
export const armDamperHoleOptions = ["Inner", "2nd from inside", "Center", "2nd from outside", "Outer", BASIC_CUSTOM_OPTION];
export const rearHubCarrierHoleOptions = ["Upper inner", "Upper middle", "Upper outer", "Lower inner", "Lower middle", "Lower outer", BASIC_CUSTOM_OPTION];
export const steeringMountHoleOptions = ["Inner", "Middle", "Outer", "Forward", "Rearward", BASIC_CUSTOM_OPTION];
export const slideRackPositionOptions = ["Position 1", "Position 2", "Position 3", "Position 4", "Custom / Other"];
export const ddssHoleOptions = ["Inner hole", "Middle hole", "Outer hole", "Upper hole", "Lower hole", BASIC_CUSTOM_OPTION];
export const ifsMountOptions = ["Bellcrank inner", "Bellcrank middle", "Bellcrank outer", "Rocker inner", "Rocker middle", "Rocker outer", BASIC_CUSTOM_OPTION];

export interface UniversalTuneBuilderProps {
  cars: Car[];
  tunes: Tune[];
  activeTune: Tune | null;
  electronicsProfiles: ElectronicsProfile[];
  onCreateTune: (options: { carId: string; setupMode: SetupMode; startingPoint: StartingPoint; sourceTuneId?: string }) => void;
  onUpdateTune: (tune: Tune) => void;
  onSaveTune: () => boolean | void | Promise<boolean | void>;
  onSaveElectronicsProfile: (profile: ElectronicsProfile) => void;
  onDeleteTune: (tuneId: string) => boolean | void | Promise<boolean | void>;
  onDuplicateTune: (tune: Tune) => void;
  onSelectTune: (tuneId: string) => void;
  onViewTune?: (tuneId: string) => void;
  dirty: boolean;
}

export type ProfiledElectronicsCategory = "esc" | "servo" | "gyro";
export type BuilderTabId = "chassis" | "track" | "front" | "rear" | "drivetrain" | "tires" | "electronics" | "esc" | "servo" | "gyro" | "radio" | "feel" | "photos" | "notes" | "pdf";
export type PitlaneProductTab = "all" | "motor" | "esc" | "gyro" | "servo" | "tires" | "frontWheels" | "rearWheels" | "other";
export type PitlanePage = "menu" | "chassis" | "surface" | "electronics" | "tires";

export interface UniversalField {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "combo" | "textarea" | "rating" | "tags" | "part";
  options?: string[];
  placeholder?: string;
  suffix?: string;
  meta?: keyof Tune;
  notSure?: boolean;
  helper?: string;
  partCategory?: RcPartCategory;
  partSubcategory?: string;
  electronicsKey?: "esc" | "motor" | "servo" | "gyro" | "receiver" | "battery";
  brandFieldId?: string;
  modelFieldId?: string;
}

export interface UniversalSection {
  id: string;
  title: string;
  profileType?: ElectronicsProfileType;
  helper?: string;
  fields: UniversalField[];
}

export interface GuidedStep {
  id: string;
  label: string;
  helper: string;
  sectionIds: string[];
}

export const universalSections: UniversalSection[] = [
  {
    id: "basics",
    title: "Basics",
    fields: [
      { id: "name", label: "Tune name", type: "text", meta: "name", placeholder: "Enter tune name" },
      { id: "date", label: "Date", type: "text", meta: "date" },
      { id: "driver", label: "Driver", type: "text" },
      { id: "chassisVariant", label: "Chassis variant", type: "text", meta: "chassisVariant", placeholder: "S, ZX, conversion, custom" },
      { id: "conversionKit", label: "Conversion kit", type: "text", placeholder: "Not sure", notSure: true },
      { id: "wheelbase", label: "Wheelbase", type: "number", suffix: "mm" },
      { id: "overallTrackWidth", label: "Track width", type: "number", suffix: "mm" },
      { id: "weightBias", label: "Weight bias", type: "text", placeholder: "50/50, rear bias..." },
      { id: "batteryPosition", label: "Battery mount position", type: "select", options: ["Not sure", "Front", "Middle", "Rear", "Left side", "Right side", "Transverse", "Longitudinal", "Stock"], notSure: true },
      { id: "motorPosition", label: "Motor position", type: "select", options: ["Not sure", "High", "Low", "Mid", "Rear"], notSure: true },
      { id: "servoPosition", label: "Servo mount position", type: "select", options: ["Not sure", "Front", "Middle", "Rear", "Stock"], notSure: true },
      { id: "track", label: "Track / location", type: "text", meta: "track" },
      { id: "surface", label: "Track surface", type: "select", meta: "surface", options: ["Not sure", "P-tile", "Carpet", "Asphalt", "Polished concrete", "Epoxy", "Painted concrete", "Other / Custom"], notSure: true },
      { id: "grip", label: "Grip level", type: "select", meta: "grip", options: ["Not sure", "Low", "Medium", "High", "Very High"], notSure: true },
      { id: "tires", label: "Tire", type: "part", partCategory: "tire", placeholder: "DS LF-5, LF-4..." },
      { id: "body", label: "Body", type: "text" },
      { id: "wing", label: "Wing", type: "text" },
      { id: "rating", label: "Rating", type: "rating", meta: "rating" },
      { id: "confidenceRating", label: "Confidence rating", type: "rating", meta: "confidenceRating" },
      { id: "trackConditionPreset", label: "Track condition", type: "select", meta: "trackConditionPreset", options: ["Not sure", "Dusty", "Clean", "Cold", "Warm", "Fresh layout", "Grooved-in", "Competition day", "Practice day"], notSure: true },
      { id: "bestForTags", label: "Best for", type: "tags", meta: "bestForTags", placeholder: "P-tile, comp, low grip" },
      { id: "tags", label: "Tags", type: "tags", meta: "tags", placeholder: "baseline, carpet, high grip" },
      { id: "notes", label: "Notes", type: "textarea", meta: "notes" }
    ]
  },
  {
    id: "tires-wheels",
    title: "Tires and wheels",
    fields: [
      { id: "frontTire", label: "Front tire", type: "part", partCategory: "tire", placeholder: "Search front tire..." },
      { id: "frontTireCompound", label: "Front tire compound", type: "text" },
      { id: "rearTire", label: "Rear tire", type: "part", partCategory: "tire", placeholder: "Search rear tire..." },
      { id: "rearTireCompound", label: "Rear tire compound", type: "text" },
      { id: "tireDiameter", label: "Tire diameter", type: "text" },
      { id: "wheelModel", label: "Wheel brand / model", type: "part", partCategory: "wheel", placeholder: "Search wheel..." },
      { id: "frontWheelOffset", label: "Front wheel offset", type: "text" },
      { id: "rearWheelOffset", label: "Rear wheel offset", type: "text" },
      { id: "frontWheelWidth", label: "Front wheel width", type: "text" },
      { id: "rearWheelWidth", label: "Rear wheel width", type: "text" },
      { id: "tirePrepNotes", label: "Tire prep notes", type: "textarea" },
      { id: "tireWearNotes", label: "Tire wear notes", type: "textarea" }
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
      { id: "steeringAngle", label: "Steering angle", type: "text", placeholder: "Not sure", notSure: true },
      { id: "ackerman", label: "Ackerman", type: "text", placeholder: "Not sure", notSure: true },
      { id: "steeringRackPosition", label: "Steering rack position", type: "text" },
      { id: "tieRodPosition", label: "Tie rod position", type: "text" },
      { id: "frontTrackWidth", label: "Front track width", type: "number", suffix: "mm" },
      { id: "frontWheelOffset", label: "Front wheel offset", type: "text" },
      { id: "frontWheel", label: "Front wheel", type: "part", partCategory: "wheel", placeholder: "Search wheel..." },
      { id: "frontSpringBrand", label: "Front spring brand", type: "text" },
      { id: "frontSpring", label: "Front spring", type: "text" },
      { id: "frontShockOil", label: "Front shock oil", type: "text" },
      { id: "frontPiston", label: "Front piston holes / diameter", type: "text" },
      { id: "frontShockShaft", label: "Front shock shaft", type: "text" },
      { id: "frontShockPosition", label: "Front shock position upper / lower", type: "text" },
      { id: "frontDroop", label: "Front droop", type: "text" },
      { id: "frontPreload", label: "Front preload", type: "text" },
      { id: "frontSwayBar", label: "Front sway bar", type: "text" },
      { id: "frontShockStyle", label: "Front shock style", type: "text" },
      { id: "frontUpperLink", label: "Front upper arm / link position", type: "text" },
      { id: "frontLowerArm", label: "Front lower arm position", type: "text" },
      { id: "frontKnuckle", label: "Front knuckle", type: "text", helper: "The steering knuckle/upright used on the front suspension." },
      { id: "frontHub", label: "Front hub", type: "text" },
      { id: "frontOffsetSpacer", label: "Front offset spacer", type: "text", helper: "Spacer added at the front wheel hub/hex to fine-tune track width or wheel clearance." },
      { id: "frontHubSpacers", label: "Front hub spacers", type: "text" },
      { id: "ffToeBlock", label: "FF suspension mount", type: "text", helper: "Front-front suspension mount / toe block." },
      { id: "frToeBlock", label: "FR suspension mount", type: "text", helper: "Front-rear suspension mount / toe block." },
      { id: "bumpSteerNotes", label: "Bump steer notes", type: "textarea" },
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
      { id: "rearRollCenter", label: "Rear roll center", type: "text", placeholder: "Not sure", notSure: true },
      { id: "rearTrackWidth", label: "Rear track width", type: "number", suffix: "mm" },
      { id: "rearWheelOffset", label: "Rear wheel offset", type: "text" },
      { id: "rearWheel", label: "Rear wheel", type: "part", partCategory: "wheel", placeholder: "Search wheel..." },
      { id: "rearSpringBrand", label: "Rear spring brand", type: "text" },
      { id: "rearSpring", label: "Rear spring", type: "text" },
      { id: "rearShockOil", label: "Rear shock oil", type: "text" },
      { id: "rearPiston", label: "Rear piston holes / diameter", type: "text" },
      { id: "rearShockShaft", label: "Rear shock shaft", type: "text" },
      { id: "rearShockPosition", label: "Rear shock position upper / lower", type: "text" },
      { id: "rearShockMountingNotes", label: "Rear shock mounting location", type: "textarea" },
      { id: "rearDroop", label: "Rear droop", type: "text" },
      { id: "rearPreload", label: "Rear preload", type: "text" },
      { id: "rearSwayBar", label: "Rear sway bar", type: "text" },
      { id: "rearSwayBarThickness", label: "Rear sway bar thickness", type: "text" },
      { id: "rearShockStyle", label: "Rear shock style", type: "text" },
      { id: "rearUpperLink", label: "Rear upper arm / link position", type: "text" },
      { id: "rearLowerArm", label: "Rear lower arm position", type: "text" },
      { id: "rearLowerArmSide", label: "Reve D lower arm side", type: "text" },
      { id: "rearHubCarrier", label: "Rear hub carrier", type: "text" },
      { id: "rearOffsetSpacer", label: "Rear offset spacer", type: "text", helper: "Spacer added at the rear wheel hub/hex to fine-tune track width or wheel clearance." },
      { id: "rearHubSpacers", label: "Rear hub spacers", type: "text" },
      { id: "rfToeBlock", label: "RF suspension mount", type: "text", helper: "Rear-front suspension mount / toe block." },
      { id: "rrToeBlock", label: "RR suspension mount", type: "text", helper: "Rear-rear suspension mount / toe block." },
      { id: "rearSpacerNotes", label: "Rear spacer notes", type: "textarea" },
      { id: "rearMemo", label: "Rear memo", type: "textarea" }
    ]
  },
  {
    id: "drivetrain",
    title: "Drivetrain",
    fields: [
      { id: "driveType", label: "Drive type", type: "select", options: ["Not sure", "RWD", "AWD", "CS"], notSure: true },
      { id: "motorPosition", label: "Motor position", type: "select", options: ["Not sure", "High", "Low", "Mid", "Rear"], notSure: true },
      { id: "differentialProduct", label: "Differential product", type: "select", options: ["Not sure", "Gear differential", "Ball differential", "Spool / solid axle", "LSD differential", "Custom / Other"], notSure: true },
      { id: "diffType", label: "Differential type", type: "select", options: ["Not sure", "Gear diff", "Ball diff", "Spool", "Solid axle", "LSD"], notSure: true },
      { id: "ballDiffSetting", label: "Ball diff setting", type: "text" },
      { id: "gearDiffOil", label: "Gear diff oil", type: "text" },
      { id: "lsdSetting", label: "LSD setting", type: "text" },
      { id: "spurGear", label: "Spur gear", type: "number" },
      { id: "pinionGear", label: "Pinion gear", type: "number" },
      { id: "finalDriveRatio", label: "Final drive ratio", type: "text" },
      { id: "gearPitch", label: "Gear pitch", type: "select", options: ["Not sure", "48P", "64P", "Mod 0.6", "Mod 0.8"], notSure: true },
      { id: "diffOil", label: "Diff oil", type: "text" },
      { id: "diffGrease", label: "Diff grease", type: "text" },
      { id: "diffShimSetup", label: "Diff shim setup", type: "textarea" },
      { id: "rearAxleType", label: "Rear axle type", type: "text" },
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
      { id: "battery", label: "Battery", type: "part", partCategory: "battery", electronicsKey: "battery", modelFieldId: "battery", placeholder: "Search battery..." },
      { id: "bodyShell", label: "Body shell", type: "text" },
      { id: "bodyWeight", label: "Body weight", type: "text" },
      { id: "aeroWing", label: "Wing", type: "text" },
      { id: "wingPosition", label: "Wing position", type: "text" },
      { id: "bodyMountPosition", label: "Body mount position", type: "text" },
      { id: "frontWeight", label: "Front weight", type: "text" },
      { id: "rearWeight", label: "Rear weight", type: "text" },
      { id: "sideWeight", label: "Side weight", type: "text" },
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
      { id: "escModel", label: "ESC", type: "part", partCategory: "esc", electronicsKey: "esc", brandFieldId: "escBrand", modelFieldId: "escModel", placeholder: "Search ESC model..." },
      { id: "escBrand", label: "ESC brand", type: "text", placeholder: "Acuvance, Hobbywing..." },
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
      { id: "motor", label: "Motor", type: "part", partCategory: "motor", electronicsKey: "motor", modelFieldId: "motor", placeholder: "Search motor..." },
      { id: "motorTiming", label: "Motor timing", type: "text" },
      { id: "motorFan", label: "Motor fan", type: "part", partCategory: "accessory", partSubcategory: "motor-fan", placeholder: "Search motor fan..." },
      { id: "escFan", label: "ESC fan", type: "part", partCategory: "accessory", partSubcategory: "esc-fan", placeholder: "Search ESC fan..." },
      { id: "powerCapacitor", label: "Power capacitor", type: "part", partCategory: "accessory", partSubcategory: "capacitor", placeholder: "Search capacitor..." },
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
      { id: "servoModel", label: "Servo", type: "part", partCategory: "servo", electronicsKey: "servo", brandFieldId: "servoBrand", modelFieldId: "servoModel", placeholder: "Search servo model..." },
      { id: "servoBrand", label: "Servo brand", type: "text" },
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
      { id: "gyroModel", label: "Gyro", type: "part", partCategory: "gyro", electronicsKey: "gyro", brandFieldId: "gyroBrand", modelFieldId: "gyroModel", placeholder: "Search gyro model..." },
      { id: "gyroBrand", label: "Gyro brand", type: "text" },
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
      { id: "radioModel", label: "Radio", type: "part", partCategory: "radio", electronicsKey: "receiver", brandFieldId: "radioBrand", modelFieldId: "radioModel", placeholder: "Search radio..." },
      { id: "radioBrand", label: "Radio brand", type: "text" },
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
      { id: "previousTuneVersion", label: "Previous tune version", type: "text" },
      { id: "changeSummary", label: "Change summary", type: "textarea" },
      { id: "changeReason", label: "Why I changed it", type: "textarea", meta: "changeReason" },
      { id: "howItFelt", label: "How it felt", type: "textarea" },
      { id: "testResult", label: "Test result", type: "select", meta: "testResult", options: ["", "better", "worse", "no-change"] },
      { id: "trackConditionDuringTest", label: "Track condition during test", type: "select", options: ["", "Dusty", "Clean", "Cold", "Warm", "Fresh layout", "Grooved-in", "Competition day", "Practice day"] },
      { id: "dateTested", label: "Date tested", type: "text" },
      { id: "sessionNotes", label: "Session notes", type: "textarea" },
      { id: "nextChanges", label: "Next changes to try", type: "textarea" }
    ]
  }
];

export const allBuilderFields = universalSections.flatMap((section) => section.fields);

export const guidedSteps: GuidedStep[] = [
  {
    id: "chassis",
    label: "Chassis",
    helper: "Confirm the car, setup mode, tune name, driver, and template before adding details.",
    sectionIds: ["basics"]
  },
  {
    id: "surface-track",
    label: "Surface / Track",
    helper: "Capture where this tune works: track, surface, grip, tire, condition, and goal.",
    sectionIds: ["basics"]
  },
  {
    id: "electronics",
    label: "Electronics",
    helper: "Save ESC, servo, gyro, and radio settings that change by track or tire.",
    sectionIds: ["esc-tune", "servo-tune", "gyro-tune", "radio-tune"]
  },
  {
    id: "steering",
    label: "Steering Geometry",
    helper: "Focus on steering angle, toe, caster, Ackerman, hubs, knuckles, and front link notes.",
    sectionIds: ["front"]
  },
  {
    id: "suspension",
    label: "Suspension",
    helper: "Tune ride height, camber, springs, shock oils, pistons, shafts, and mount positions.",
    sectionIds: ["front", "rear"]
  },
  {
    id: "drivetrain",
    label: "Drivetrain / Differential",
    helper: "Track motor position, diff behavior, gearing, belts, shafts, and drive notes.",
    sectionIds: ["drivetrain"]
  },
  {
    id: "tires-wheels",
    label: "Tires / Wheels",
    helper: "Keep tire, wheel offset, track width, and tire-related notes together.",
    sectionIds: ["tires-wheels"]
  },
  {
    id: "body-weight",
    label: "Body / Weight",
    helper: "Record battery position, added weight, body, wing, braces, and balance notes.",
    sectionIds: ["weight-body", "basics"]
  },
  {
    id: "driver-feel",
    label: "Driver Feel",
    helper: "Describe how the car should feel so the tune is readable without decoding every number.",
    sectionIds: []
  },
  {
    id: "notes-publish",
    label: "Notes / Photos / Publish",
    helper: "Attach photos, log changes, save recommendations, and choose private or shared visibility.",
    sectionIds: ["notes-section"]
  }
];

export const quickStepIds = new Set(["chassis", "electronics", "steering", "suspension", "drivetrain", "driver-feel", "notes-publish"]);

export const basicFieldIds = new Set([
  "name",
  "track",
  "surface",
  "grip",
  "trackConditionPreset",
  "setupIntent",
  "tires",
  "frontTire",
  "rearTire",
  "rating",
  "bestForTags",
  "tags",
  "notes",
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
  "servoBrand",
  "servoModel",
  "servoProfileName",
  "gyroBrand",
  "gyroModel",
  "gyroProfileName",
  "motor",
  "motorBrand",
  "motorModel",
  "escBrand",
  "escModel",
  "escProfileName",
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
  "basicCustomNotes",
  "rearSpring",
  "diffType",
  "spurGear",
  "pinionGear",
  "internalDriveRatio",
  "finalDriveRatio",
  "batteryPosition",
  "servoPosition",
  "battery",
  "gyroGain",
  "gyroMode",
  "generalNotes",
  "whatChanged",
  "changeSummary",
  "howItFelt",
  "testResult",
  "nextChanges"
]);

export const builderTabs: Array<{ id: BuilderTabId; label: string; stepId: string; sectionIds: string[]; helper: string }> = [
  { id: "chassis", label: "Basic", stepId: "chassis", sectionIds: ["basics"], helper: "Tune identity, chassis, deck, track, and simple setup context." },
  { id: "track", label: "Track", stepId: "chassis", sectionIds: ["basics"], helper: "Track name and surface for this setup." },
  { id: "front", label: "Front", stepId: "steering", sectionIds: ["front"], helper: "Front arms, knuckles, axle, spring, toe block, damper, and wheel setup." },
  { id: "rear", label: "Rear", stepId: "suspension", sectionIds: ["rear"], helper: "Rear arms, hub carrier, axle length, toe block, spring, damper, and wheel setup." },
  { id: "drivetrain", label: "Drivetrain", stepId: "drivetrain", sectionIds: ["drivetrain"], helper: "Motor, gearing, differential, shafts, belts, and drive notes." },
  { id: "tires", label: "Tires/Wheels", stepId: "tires-wheels", sectionIds: ["tires-wheels"], helper: "Front and rear tire, wheel, offset, and fitment setup." },
  { id: "electronics", label: "Electronics", stepId: "electronics", sectionIds: ["esc-tune", "servo-tune", "gyro-tune", "radio-tune"], helper: "ESC, servo, gyro, motor, and radio settings in one place." },
  { id: "esc", label: "ESC", stepId: "electronics", sectionIds: ["esc-tune"], helper: "ESC product, profile, throttle, brake, boost, turbo, and capacitor." },
  { id: "servo", label: "Servo", stepId: "electronics", sectionIds: ["servo-tune"], helper: "Servo product, horn, profile, endpoints, speed, torque, and notes." },
  { id: "gyro", label: "Gyro", stepId: "electronics", sectionIds: ["gyro-tune"], helper: "Gyro product, gain, mode, curve, direction, endpoint, and notes." },
  { id: "radio", label: "Radio", stepId: "electronics", sectionIds: ["radio-tune"], helper: "Radio model, expo, endpoints, curves, and transmitter notes." },
  { id: "feel", label: "Feel", stepId: "driver-feel", sectionIds: [], helper: "Use sliders to describe how the car drives at a glance." },
  { id: "photos", label: "Photos", stepId: "notes-publish", sectionIds: [], helper: "Attach photos for the car, electronics, suspension, tires, and body." },
  { id: "notes", label: "Notes", stepId: "notes-publish", sectionIds: ["notes-section"], helper: "Change notes, test result, setup assistant, history, and sharing settings." },
  { id: "pdf", label: "Preview/PDF", stepId: "notes-publish", sectionIds: [], helper: "Preview the setup summary and export the filled setup sheet PDF." }
];

export const quickTuneTabIds = new Set<BuilderTabId>(["chassis", "track", "front", "rear", "drivetrain", "tires", "electronics", "esc", "servo", "gyro", "radio", "photos", "notes", "pdf"]);
