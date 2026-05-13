import type { ElectronicsCategory } from "../types";

export type ElectronicsFieldType = "number" | "select" | "text" | "slider" | "toggle" | "unit-number";

export interface ElectronicsSchemaField {
  key: string;
  label: string;
  type: ElectronicsFieldType;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  defaultValue?: string | number | boolean;
  description?: string;
  appliesTo?: string[];
  sourceNote?: string;
  advanced?: boolean;
  safetyWarning?: string;
  verified?: boolean;
}

export interface ElectronicsSchemaGroup {
  groupId: string;
  label: string;
  helper?: string;
  fields: ElectronicsSchemaField[];
}

export interface ElectronicsSchema {
  slug: string;
  brand: string;
  model: string;
  category: ElectronicsCategory;
  sourceLabel: string;
  sourceUrl?: string;
  notes?: string;
  groups: ElectronicsSchemaGroup[];
}

const commonEscSafety = "More boost or turbo timing can increase RPM and heat. Check motor and ESC temperature after changes.";
const pwmHelper = "PWM settings affect throttle/brake feel and temperature; use your ESC manual as the final reference.";

const yokomoEscGroups: ElectronicsSchemaGroup[] = [
  {
    groupId: "general",
    label: "General",
    fields: [
      { key: "runningMode", label: "Running mode", type: "select", options: ["F/B", "F/B/R"], sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "batteryType", label: "Battery type", type: "select", options: ["LiPo", "LiFe", "NiMH"], sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "cutoffVoltage", label: "Cutoff voltage", type: "text", unit: "V/cell", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "becVoltage", label: "BEC voltage", type: "select", options: ["6.0V", "7.4V"], sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "motorDirection", label: "Motor direction", type: "select", options: ["Normal", "Reverse"], sourceNote: "Yokomo R100/R160 setting sheet", verified: true }
    ]
  },
  {
    groupId: "throttle",
    label: "Throttle",
    helper: pwmHelper,
    fields: [
      { key: "pwmFrequency", label: "PWM frequency", type: "text", unit: "kHz", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "punch", label: "Punch", type: "text", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "compress", label: "Compress", type: "text", sourceNote: "Yokomo R100/R160 setting sheet", verified: true, advanced: true },
      { key: "throttleFeel", label: "Throttle feel", type: "text", sourceNote: "Yokomo R100/R160 setting sheet", verified: true, advanced: true },
      { key: "maxReverseForce", label: "Max reverse force", type: "text", unit: "%", sourceNote: "Yokomo R100/R160 setting sheet", verified: true, advanced: true }
    ]
  },
  {
    groupId: "brake",
    label: "Brake",
    fields: [
      { key: "dragBrake", label: "Drag brake", type: "text", unit: "%", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "brakePunch", label: "Brake punch", type: "text", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "initialBrake", label: "Initial brake", type: "text", unit: "%", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "brakeFrequency", label: "Brake frequency", type: "text", unit: "kHz", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "maxBrakeForce", label: "Max brake force", type: "text", unit: "%", sourceNote: "Yokomo R100/R160 setting sheet", verified: true, advanced: true }
    ]
  },
  {
    groupId: "boost-turbo",
    label: "Boost / Turbo",
    helper: commonEscSafety,
    fields: [
      { key: "boostTiming", label: "Boost timing", type: "unit-number", unit: "deg", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "boostStartRpm", label: "Boost start RPM", type: "number", unit: "RPM", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "boostEndRpm", label: "Boost end RPM", type: "number", unit: "RPM", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "turboTiming", label: "Turbo timing", type: "unit-number", unit: "deg", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "turboStart", label: "Turbo start", type: "text", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "turboDelay", label: "Turbo delay", type: "text", sourceNote: "Yokomo R100/R160 setting sheet", verified: true },
      { key: "turboUpRate", label: "Turbo up rate", type: "text", sourceNote: "Yokomo R100/R160 setting sheet", verified: true, advanced: true },
      { key: "turboDownRate", label: "Turbo down rate", type: "text", sourceNote: "Yokomo R100/R160 setting sheet", verified: true, advanced: true }
    ]
  }
];

const acuvanceEscGroups: ElectronicsSchemaGroup[] = [
  {
    groupId: "general",
    label: "General",
    fields: [
      { key: "loadProgram", label: "Load program / profile", type: "text", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "operationMode", label: "Operation mode", type: "select", options: ["Forward/Brake", "Forward/Brake/Reverse"], sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "cutoffVoltage", label: "Cutoff voltage", type: "text", unit: "V", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "becOutputVoltage", label: "BEC output voltage", type: "text", unit: "V", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "revLimit", label: "Rev limit", type: "text", unit: "RPM", sourceNote: "Acuvance TAO III function list", verified: true, advanced: true },
      { key: "freeZoneAdjust", label: "Free zone adjust", type: "text", sourceNote: "Acuvance TAO III function list", verified: true, advanced: true }
    ]
  },
  {
    groupId: "frequency",
    label: "Frequency / Feel",
    helper: pwmHelper,
    fields: [
      { key: "driveFrequency", label: "Drive frequency", type: "text", unit: "kHz", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "neutralBrakeFrequency", label: "Neutral brake frequency", type: "text", unit: "kHz", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "brakeFrequency", label: "Brake frequency", type: "text", unit: "kHz", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "initialSpeed", label: "Initial speed", type: "text", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "forwardSpeed", label: "Forward speed", type: "text", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "reverseSpeed", label: "Reverse speed", type: "text", sourceNote: "Acuvance TAO III function list", verified: true, advanced: true }
    ]
  },
  {
    groupId: "brake",
    label: "Brake",
    fields: [
      { key: "neutralBrakePower", label: "Neutral brake power", type: "text", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "initialBrakePower", label: "Initial brake power", type: "text", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "fullBrakePower", label: "Full brake power", type: "text", sourceNote: "Acuvance TAO III function list", verified: true }
    ]
  },
  {
    groupId: "torque-power",
    label: "Torque / Power Change",
    fields: [
      { key: "torqueLevel", label: "Torque level", type: "text", sourceNote: "Acuvance TAO III function list; conditional by ESC/motor combo", verified: true, advanced: true },
      { key: "torqueEndpoint", label: "Torque endpoint", type: "text", sourceNote: "Acuvance TAO III function list; conditional by ESC/motor combo", verified: true, advanced: true },
      { key: "powerChangeLevel", label: "Power change level", type: "text", sourceNote: "Acuvance TAO III function list; conditional by ESC/motor combo", verified: true, advanced: true },
      { key: "powerChangeRpm", label: "Power change RPM", type: "number", unit: "RPM", sourceNote: "Acuvance TAO III function list; conditional by ESC/motor combo", verified: true, advanced: true },
      { key: "powerChangeSlope", label: "Power change slope", type: "text", sourceNote: "Acuvance TAO III function list; conditional by ESC/motor combo", verified: true, advanced: true }
    ]
  },
  {
    groupId: "boost-turbo",
    label: "Boost / Turbo",
    helper: commonEscSafety,
    fields: [
      { key: "boostTiming", label: "Boost timing", type: "unit-number", unit: "deg", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "boostStartRpm", label: "Boost start RPM", type: "number", unit: "RPM", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "boostEndRpm", label: "Boost end RPM", type: "number", unit: "RPM", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "thBoostControl", label: "TH boost control", type: "text", sourceNote: "Acuvance TAO III function list", verified: true, advanced: true },
      { key: "turboActivation", label: "Turbo activation", type: "select", options: ["Full throttle", "RPM", "Full throttle & RPM"], sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "turboTiming", label: "Turbo timing", type: "unit-number", unit: "deg", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "turboStartRpm", label: "Turbo start RPM", type: "number", unit: "RPM", sourceNote: "Acuvance TAO III function list", verified: true },
      { key: "turboOnSlope", label: "Turbo on slope", type: "text", sourceNote: "Acuvance TAO III function list", verified: true, advanced: true },
      { key: "turboOffSlope", label: "Turbo off slope", type: "text", sourceNote: "Acuvance TAO III function list", verified: true, advanced: true },
      { key: "turboStartTime", label: "Turbo start time", type: "text", sourceNote: "Acuvance TAO III function list", verified: true, advanced: true },
      { key: "turboOffTime", label: "Turbo off time", type: "text", sourceNote: "Acuvance TAO III function list", verified: true, advanced: true }
    ]
  }
];

const reveDEscGroups: ElectronicsSchemaGroup[] = [
  {
    groupId: "general",
    label: "General",
    fields: [
      { key: "motorDirection", label: "Motor direction", type: "select", options: ["Normal", "Reverse"], sourceNote: "Reve D BREVE manual", verified: true },
      { key: "operationMode", label: "Operation mode", type: "select", options: ["Forward/Brake", "Forward/Brake/Reverse"], sourceNote: "Reve D BREVE manual", verified: true },
      { key: "reverseDelay", label: "Reverse delay", type: "text", sourceNote: "Reve D BREVE manual", verified: true, advanced: true },
      { key: "becVoltage", label: "BEC voltage", type: "select", options: ["6.0V", "7.4V"], sourceNote: "Reve D BREVE manual", verified: true },
      { key: "cutoffVoltage", label: "Cutoff voltage", type: "text", unit: "V/cell", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "thermalProtection", label: "Thermal protection", type: "toggle", sourceNote: "Reve D BREVE manual", verified: true, advanced: true }
    ]
  },
  {
    groupId: "throttle",
    label: "Throttle",
    helper: pwmHelper,
    fields: [
      { key: "throttleResponse", label: "Throttle response", type: "text", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "pwmDriveFrequency", label: "PWM drive frequency", type: "text", unit: "kHz", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "startPower", label: "Start power", type: "text", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "smoothStartRate", label: "Smooth start rate", type: "text", sourceNote: "Reve D BREVE manual", verified: true, advanced: true },
      { key: "smoothStartRange", label: "Smooth start range", type: "text", sourceNote: "Reve D BREVE manual", verified: true, advanced: true },
      { key: "neutralRange", label: "Neutral range", type: "text", sourceNote: "Reve D BREVE manual", verified: true, advanced: true }
    ]
  },
  {
    groupId: "brake",
    label: "Brake",
    fields: [
      { key: "startBrakePower", label: "Start brake power", type: "text", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "maxBrakePower", label: "Max brake power", type: "text", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "brakeResponse", label: "Brake response", type: "text", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "dragBrake", label: "Drag brake", type: "text", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "initialBrakePower", label: "Initial brake power", type: "text", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "pwmBrakeFrequency", label: "PWM brake frequency", type: "text", unit: "kHz", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "autoBrake", label: "Auto brake", type: "text", sourceNote: "Reve D BREVE manual", verified: true, advanced: true }
    ]
  },
  {
    groupId: "boost-turbo",
    label: "Boost / Turbo",
    helper: commonEscSafety,
    fields: [
      { key: "boostTiming", label: "Boost timing", type: "unit-number", unit: "deg", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "boostStartRpm", label: "Boost start RPM", type: "number", unit: "RPM", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "boostEndRpm", label: "Boost end RPM", type: "number", unit: "RPM", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "boostBehavior", label: "Boost curve / behavior", type: "text", sourceNote: "Reve D BREVE manual", verified: true, advanced: true },
      { key: "turboTiming", label: "Turbo timing", type: "unit-number", unit: "deg", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "turboDelay", label: "Turbo delay", type: "text", sourceNote: "Reve D BREVE manual", verified: true },
      { key: "turboRamp", label: "Turbo ramp / up rate", type: "text", sourceNote: "Reve D BREVE manual", verified: true, advanced: true },
      { key: "turboDownRate", label: "Turbo down rate", type: "text", sourceNote: "Reve D BREVE manual; where supported", verified: true, advanced: true },
      { key: "turboActivationBehavior", label: "Turbo activation behavior", type: "text", sourceNote: "Reve D BREVE manual", verified: true, advanced: true }
    ]
  }
];

const maclanMdpGroups: ElectronicsSchemaGroup[] = [
  {
    groupId: "general",
    label: "General",
    fields: [
      { key: "profile", label: "Profile", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "runningMode", label: "Running mode", type: "select", options: ["Forward/Brake", "Forward/Brake/Reverse"], sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "batteryType", label: "Battery type", type: "select", options: ["LiPo", "LiHV"], sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "lowVoltageCutoff", label: "Low voltage cutoff", type: "text", unit: "V/cell", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "escTemperatureCutoff", label: "ESC temperature cutoff", type: "text", unit: "deg", sourceNote: "Maclan MDP 160 manual", verified: true, advanced: true },
      { key: "becVoltage", label: "BEC voltage", type: "text", unit: "V", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "motorRotation", label: "Motor rotation", type: "select", options: ["Normal", "Reverse"], sourceNote: "Maclan MDP 160 manual", verified: true }
    ]
  },
  {
    groupId: "brake",
    label: "Brake",
    helper: pwmHelper,
    fields: [
      { key: "brakeStrength", label: "Brake strength", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "brakePwm", label: "Brake PWM", type: "text", unit: "kHz", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "brakeCurve", label: "Brake curve", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "dragBrake", label: "Drag brake", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true }
    ]
  },
  {
    groupId: "throttle",
    label: "Throttle",
    helper: pwmHelper,
    fields: [
      { key: "throttlePwm", label: "Throttle PWM", type: "text", unit: "kHz", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "throttlePunch", label: "Throttle punch", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "throttleCurve", label: "Throttle curve", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "throttleSmoothRange", label: "Throttle smooth range", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true, advanced: true },
      { key: "throttleSmoothValue", label: "Throttle smooth value", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true, advanced: true },
      { key: "deadBand", label: "Dead band", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true, advanced: true }
    ]
  },
  {
    groupId: "boost-turbo",
    label: "Boost / Turbo",
    helper: commonEscSafety,
    fields: [
      { key: "accelerationBoost", label: "Acceleration boost", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "boostStartRpm", label: "Boost start RPM", type: "number", unit: "RPM", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "boostFinishRpm", label: "Boost finish RPM", type: "number", unit: "RPM", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "turboPosition", label: "Turbo position", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "topSpeedTurbo", label: "Top speed turbo", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "upSlewRate", label: "Up slew rate", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true, advanced: true },
      { key: "downSlewRate", label: "Down slew rate", type: "text", sourceNote: "Maclan MDP 160 manual; where supported", verified: true, advanced: true },
      { key: "turboDelay", label: "Turbo delay", type: "text", sourceNote: "Maclan MDP 160 manual; where supported", verified: true, advanced: true }
    ]
  },
  {
    groupId: "rev-limiter",
    label: "Rev Limiter",
    fields: [
      { key: "revLimitEnabled", label: "Rev limit enabled", type: "toggle", sourceNote: "Maclan MDP 160 manual", verified: true },
      { key: "revLimitTriggerRpm", label: "Rev limit trigger RPM", type: "number", unit: "RPM", sourceNote: "Maclan MDP 160 manual", verified: true, advanced: true },
      { key: "revLimitValue", label: "Rev limit value", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true, advanced: true },
      { key: "revLimitSensitivity", label: "Rev limit sensitivity", type: "text", sourceNote: "Maclan MDP 160 manual", verified: true, advanced: true }
    ]
  }
];

const reveDServoGroups: ElectronicsSchemaGroup[] = [
  {
    groupId: "servo-feel",
    label: "Servo Feel",
    helper: "Servo dead band and damper settings can help reduce hunting.",
    fields: [
      { key: "mode", label: "Mode", type: "select", options: ["Standard", "REVOX", "Basic", "Futaba", "Sanwa"], sourceNote: "Reve D RS-ST / RS-ST PRO setup sheets", verified: true },
      { key: "direction", label: "Direction", type: "select", options: ["Normal", "Reverse"], sourceNote: "Reve D RS-ST setup sheet", verified: true },
      { key: "torque", label: "Torque", type: "text", sourceNote: "Reve D RS-ST setup sheet", verified: true },
      { key: "torqueCurve", label: "Torque curve", type: "text", sourceNote: "Reve D RS-ST setup sheet", verified: true },
      { key: "initialTorque", label: "Initial torque", type: "text", sourceNote: "Reve D RS-ST PRO setup sheet", verified: true, advanced: true },
      { key: "speedCurve", label: "Speed curve", type: "text", sourceNote: "Reve D RS-ST setup sheet", verified: true },
      { key: "damper", label: "Damper", type: "text", sourceNote: "Reve D RS-ST setup sheet", verified: true },
      { key: "damperPoint", label: "Damper point", type: "text", sourceNote: "Reve D RS-ST setup sheet", verified: true, advanced: true },
      { key: "maxPower", label: "Max power", type: "text", sourceNote: "Reve D RS-ST setup sheet", verified: true },
      { key: "frequency", label: "Frequency", type: "text", unit: "Hz", sourceNote: "Reve D RS-ST setup sheet", verified: true },
      { key: "deadBand", label: "Dead band", type: "text", sourceNote: "Reve D RS-ST setup sheet", verified: true },
      { key: "servoTrim", label: "Servo trim", type: "text", sourceNote: "Reve D RS-ST setup sheet", verified: true, advanced: true }
    ]
  }
];

const reveDRsStProServoGroups: ElectronicsSchemaGroup[] = [
  {
    groupId: "transmitter",
    label: "Transmitter / Setup",
    helper: "RS-ST PRO has separate transmitter modes and a wider programmable setup than the regular RS-ST.",
    fields: [
      { key: "transmitterMode", label: "Transmitter mode", type: "select", options: ["Basic mode", "Futaba mode", "Sanwa mode"], sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true },
      { key: "direction", label: "Direction", type: "select", options: ["CW", "CCW"], sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true },
      { key: "servoTrim", label: "Servo trim", type: "number", min: -20, max: 20, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true, advanced: true },
      { key: "servoTrimSide", label: "Servo trim side", type: "select", options: ["Left", "Right"], sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true, advanced: true },
      { key: "servoHorn", label: "Servo horn", type: "text", sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true, advanced: true }
    ]
  },
  {
    groupId: "torque",
    label: "Torque",
    helper: "These are the RS-ST PRO torque fields from the official setup sheet.",
    fields: [
      { key: "torque", label: "Torque", type: "number", min: 1, max: 35, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true },
      { key: "initialTorque", label: "Initial torque", type: "number", min: 1, max: 60, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true },
      { key: "midTorque", label: "Mid torque", type: "number", min: 1, max: 60, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true },
      { key: "maxTorque", label: "Max torque", type: "number", min: 1, max: 60, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true },
      { key: "torqueCurve", label: "Torque curve", type: "number", min: 1, max: 250, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true }
    ]
  },
  {
    groupId: "feel",
    label: "Speed / Damper / Feel",
    helper: "Damper and dead band can help reduce servo hunting. Watch servo temperature after big changes.",
    fields: [
      { key: "damper", label: "Damper", type: "number", min: 1, max: 600, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true },
      { key: "damperPoint", label: "Damper point", type: "number", min: 1, max: 200, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true },
      { key: "speedCurve", label: "Speed curve", type: "number", min: 1, max: 200, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true },
      { key: "counterAssist", label: "Counter assist", type: "number", min: 1, max: 50, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true },
      { key: "maxPower", label: "Max power", type: "number", min: 1, max: 120, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true },
      { key: "frequency", label: "Frequency", type: "number", min: 1, max: 7, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true },
      { key: "deadBand", label: "Dead band", type: "number", min: 1, max: 20, step: 1, sourceNote: "Reve D RS-ST PRO programmable setup sheet", verified: true }
    ]
  }
];

const reveDGyroGroups: ElectronicsSchemaGroup[] = [
  {
    groupId: "gyro-feel",
    label: "Gyro Feel",
    helper: "Too much gyro gain can cause steering shake.",
    fields: [
      { key: "gain", label: "Gain", type: "slider", min: 0, max: 100, step: 1, unit: "%", sourceNote: "Reve D REVOX product/manual notes", verified: true },
      { key: "curve", label: "Curve", type: "text", sourceNote: "Reve D REVOX product/manual notes", verified: true },
      { key: "channelSetup", label: "Channel / 3ch setup", type: "text", sourceNote: "Reve D REVOX product/manual notes", verified: true },
      { key: "direction", label: "Direction", type: "select", options: ["Normal", "Reverse"], sourceNote: "Reve D REVOX product/manual notes", verified: true },
      { key: "endpoint", label: "Endpoint / EPA notes", type: "text", sourceNote: "Reve D REVOX product/manual notes", verified: true },
      { key: "modeNotes", label: "Mode notes", type: "text", sourceNote: "Reve D REVOX product/manual notes", verified: true, advanced: true }
    ]
  }
];

const futabaGyd550GyroGroups: ElectronicsSchemaGroup[] = [
  {
    groupId: "gyd550-settings",
    label: "GYD550 Settings",
    helper: "Use only the GYD550 fields drivers actually adjust for this app.",
    fields: [
      { key: "gainMode", label: "Gain mode", type: "select", options: ["High", "Medium", "Low"], sourceNote: "Futaba GYD550 driver tuning fields", verified: true },
      { key: "damper", label: "Damper", type: "text", sourceNote: "Futaba GYD550 driver tuning fields", verified: true },
      { key: "damperPoint", label: "Damper point", type: "text", sourceNote: "Futaba GYD550 driver tuning fields", verified: true },
      { key: "steeringControlGain", label: "Steering control gain", type: "text", sourceNote: "Futaba GYD550 driver tuning fields", verified: true },
      { key: "tailSlideSpeed", label: "Tail slide speed", type: "text", sourceNote: "Futaba GYD550 driver tuning fields", verified: true }
    ]
  }
];

const futabaSurfaceServoGroups: ElectronicsSchemaGroup[] = [
  {
    groupId: "futaba-servo-link",
    label: "S.Bus / Transmitter Mode",
    helper: "Futaba surface servos can be tuned through S.Bus/S.Bus2 capable transmitters or a compatible setup adapter. Exact menu support depends on transmitter, receiver, and servo firmware.",
    fields: [
      { key: "responseMode", label: "Response mode", type: "select", options: ["Normal", "SR", "UR", "S.Bus/S.Bus2"], sourceNote: "Futaba S.Bus/S.Bus2 surface servo setup options; CT701 supports SR with T4PM/T7PX/T10PX.", verified: true },
      { key: "sbusSetupMethod", label: "Setup method", type: "select", options: ["Transmitter", "CIU adapter / PC", "Not sure"], sourceNote: "Futaba programmable servo setup workflow", verified: true },
      { key: "receiverMode", label: "Receiver mode", type: "text", sourceNote: "Futaba transmitter/receiver mode used with this servo.", verified: false, advanced: true }
    ]
  },
  {
    groupId: "futaba-servo-feel",
    label: "Servo Feel",
    helper: "Use small changes and watch for servo heat or steering shake after raising response or boost-style settings.",
    fields: [
      { key: "direction", label: "Direction", type: "select", options: ["Normal", "Reverse"], sourceNote: "Common Futaba programmable servo parameter", verified: true },
      { key: "deadBand", label: "Dead band", type: "text", sourceNote: "Common Futaba programmable servo parameter", verified: true },
      { key: "damper", label: "Damper", type: "text", sourceNote: "Common Futaba programmable servo parameter", verified: true },
      { key: "smoother", label: "Smoother", type: "text", sourceNote: "Common Futaba programmable servo parameter", verified: true },
      { key: "stretcher", label: "Stretcher", type: "text", sourceNote: "Common Futaba programmable servo parameter", verified: true },
      { key: "boost", label: "Boost", type: "text", sourceNote: "Common Futaba programmable servo parameter", verified: true },
      { key: "neutral", label: "Neutral / trim", type: "text", sourceNote: "Common Futaba programmable servo parameter", verified: true, advanced: true }
    ]
  },
  {
    groupId: "futaba-servo-endpoints",
    label: "Endpoints",
    fields: [
      { key: "endpointLeft", label: "Endpoint left", type: "text", sourceNote: "Track-side steering endpoint note for Futaba servo/gyro setup.", verified: false },
      { key: "endpointRight", label: "Endpoint right", type: "text", sourceNote: "Track-side steering endpoint note for Futaba servo/gyro setup.", verified: false },
      { key: "speed", label: "Speed feel", type: "text", sourceNote: "Driver-facing speed feel note; exact programmable range depends on servo.", verified: false, advanced: true },
      { key: "torque", label: "Torque feel", type: "text", sourceNote: "Driver-facing torque feel note; exact programmable range depends on servo.", verified: false, advanced: true }
    ]
  }
];

const yokomoServoGroups: ElectronicsSchemaGroup[] = [
  {
    groupId: "servo-feel",
    label: "Servo Feel",
    helper: "Servo dead band and hunting suppression can help reduce front-wheel shake.",
    fields: [
      { key: "direction", label: "Direction", type: "select", options: ["Normal", "Reverse"], sourceNote: "Yokomo SP-series servo programming options; exact model ranges kept freeform", verified: true },
      { key: "speed", label: "Speed", type: "text", sourceNote: "Yokomo SP-series servo programming options; exact model ranges kept freeform", verified: true },
      { key: "torque", label: "Torque", type: "text", sourceNote: "Yokomo SP-series servo programming options; exact model ranges kept freeform", verified: true },
      { key: "holdingPower", label: "Holding power", type: "text", sourceNote: "Yokomo SP-series servo programming options; exact model ranges kept freeform", verified: true, advanced: true },
      { key: "huntingSuppression", label: "Hunting suppression / anti-shake", type: "text", sourceNote: "Yokomo SP-series servo programming options; exact model ranges kept freeform", verified: true },
      { key: "deadBand", label: "Dead band", type: "text", sourceNote: "Yokomo SP-series servo programming options; exact model ranges kept freeform", verified: true },
      { key: "frequency", label: "Frequency", type: "text", unit: "Hz", sourceNote: "Yokomo SP-series servo programming options; model support varies", verified: true, advanced: true },
      { key: "neutralNotes", label: "Neutral / trim notes", type: "text", sourceNote: "Yokomo SP-series servo setup notes", verified: false, advanced: true }
    ]
  }
];

const yokomoGyroGroups: ElectronicsSchemaGroup[] = [
  {
    groupId: "gyro-feel",
    label: "Gyro Feel",
    helper: "Too much gyro gain can cause steering shake.",
    fields: [
      { key: "gain", label: "Gain", type: "slider", min: 0, max: 100, step: 1, unit: "%", sourceNote: "Yokomo DP-302 V4 gyro setup notes", verified: true },
      { key: "mode", label: "Mode", type: "select", options: ["Normal", "Assist", "Soft", "Hard", "Other"], sourceNote: "Yokomo DP-302 V4 gyro setup notes; mode naming depends on transmitter setup", verified: true },
      { key: "endpoint", label: "Endpoint / servo stroke", type: "text", sourceNote: "Yokomo DP-302 V4 gyro setup notes", verified: true },
      { key: "direction", label: "Direction / reverse", type: "select", options: ["Normal", "Reverse"], sourceNote: "Yokomo DP-302 V4 gyro setup notes", verified: true },
      { key: "channelControl", label: "Channel control method", type: "text", sourceNote: "Yokomo DP-302 V4 gyro setup notes", verified: true, advanced: true }
    ]
  }
];

const motorGroups = (sourceNote: string): ElectronicsSchemaGroup[] => [
  {
    groupId: "motor",
    label: "Motor",
    fields: [
      { key: "turnRating", label: "Turn rating", type: "text", sourceNote, verified: true },
      { key: "motorTiming", label: "Motor timing", type: "text", unit: "deg", sourceNote, verified: true },
      { key: "rotor", label: "Rotor", type: "text", sourceNote, verified: true },
      { key: "sensorWire", label: "Sensor wire", type: "text", sourceNote, verified: false, advanced: true },
      { key: "fan", label: "Fan", type: "text", sourceNote, verified: false, advanced: true }
    ]
  }
];

const customGroups: ElectronicsSchemaGroup[] = [
  {
    groupId: "custom",
    label: "Custom Settings",
    fields: [
      { key: "setting1", label: "Custom setting 1", type: "text", verified: false },
      { key: "setting2", label: "Custom setting 2", type: "text", verified: false },
      { key: "setting3", label: "Custom setting 3", type: "text", verified: false, advanced: true },
      { key: "notes", label: "Notes", type: "text", verified: false }
    ]
  }
];

export const electronicsSchemas: ElectronicsSchema[] = [
  { slug: "yokomo-bl-r100", brand: "Yokomo", model: "BL-R100", category: "esc", sourceLabel: "Yokomo R100/R160 manual and blank setting sheet", groups: yokomoEscGroups },
  { slug: "yokomo-bl-r160", brand: "Yokomo", model: "BL-R160", category: "esc", sourceLabel: "Yokomo R100/R160 manual and blank setting sheet", groups: yokomoEscGroups },
  { slug: "yokomo-bl-pro4", brand: "Yokomo", model: "BL-PRO4", category: "esc", sourceLabel: "Yokomo BL-PRO4 ESC family; exact model ranges kept freeform", groups: yokomoEscGroups },
  { slug: "yokomo-bl-sp4", brand: "Yokomo", model: "BL-SP4", category: "esc", sourceLabel: "Yokomo BL-SP4 ESC family; exact model ranges kept freeform", groups: yokomoEscGroups },
  { slug: "yokomo-rpx-ii", brand: "Yokomo", model: "RPX II", category: "esc", sourceLabel: "Yokomo ESC setting-sheet family; unverified RPX-specific ranges kept freeform", groups: yokomoEscGroups },
  { slug: "acuvance-xarvis", brand: "Acuvance", model: "XARVIS", category: "esc", sourceLabel: "Acuvance TAO III function list; XARVIS support varies by firmware", groups: acuvanceEscGroups },
  { slug: "acuvance-xarvis-xx", brand: "Acuvance", model: "XARVIS XX", category: "esc", sourceLabel: "Acuvance TAO III function list", groups: acuvanceEscGroups },
  { slug: "acuvance-rad", brand: "Acuvance", model: "RAD", category: "esc", sourceLabel: "Acuvance TAO III function list", groups: acuvanceEscGroups },
  { slug: "reve-d-breve-rd-spec", brand: "Reve D", model: "BREVE RD Spec", category: "esc", sourceLabel: "Reve D BREVE RD Spec manual", groups: reveDEscGroups },
  { slug: "reve-d-elite", brand: "Reve D", model: "ELITE", category: "esc", sourceLabel: "Reve D ESC setting family; model-specific ranges kept freeform", groups: reveDEscGroups },
  { slug: "maclan-mdp-160", brand: "Maclan", model: "MDP 160", category: "esc", sourceLabel: "Maclan MDP 160 user manual", groups: maclanMdpGroups },
  { slug: "maclan-mdp-160-flow-edition", brand: "Maclan", model: "MDP 160 Flow Edition", category: "esc", sourceLabel: "Maclan MDP 160 user manual / Flow Edition family", groups: maclanMdpGroups },
  { slug: "yokomo-sp-02d", brand: "Yokomo", model: "SP-02D", category: "servo", sourceLabel: "Yokomo SP-series servo programming options", groups: yokomoServoGroups },
  { slug: "yokomo-sp-03d", brand: "Yokomo", model: "SP-03D", category: "servo", sourceLabel: "Yokomo SP-series servo programming options", groups: yokomoServoGroups },
  { slug: "yokomo-sp-03d-v2", brand: "Yokomo", model: "SP-03D V2", category: "servo", sourceLabel: "Yokomo SP-series servo programming options", groups: yokomoServoGroups },
  { slug: "reve-d-rs-st", brand: "Reve D", model: "RS-ST", category: "servo", sourceLabel: "Reve D RS-ST setup sheet / programmer docs", groups: reveDServoGroups },
  { slug: "reve-d-rs-st-pro", brand: "Reve D", model: "RS-ST PRO", category: "servo", sourceLabel: "Reve D RS-ST PRO programmable setup sheet", sourceUrl: "https://teamreved.com/wp-content/uploads/2025/07/RS-ST-PRO_20250718.pdf", groups: reveDRsStProServoGroups },
  { slug: "futaba-hps-ct701", brand: "Futaba", model: "HPS-CT701", category: "servo", sourceLabel: "Futaba HPS-CT701 S.Bus2 / SR mode surface servo product notes", sourceUrl: "https://futabausa.com/product/hps-ct701/", groups: futabaSurfaceServoGroups },
  { slug: "futaba-hps-ct700", brand: "Futaba", model: "HPS-CT700", category: "servo", sourceLabel: "Futaba HPS-CT700 programmable surface servo product notes", sourceUrl: "https://www.rc.futaba.co.jp/products/detail/I00000090", groups: futabaSurfaceServoGroups },
  { slug: "futaba-hps-cd700", brand: "Futaba", model: "HPS-CD700", category: "servo", sourceLabel: "Futaba HPS-CD700 drift/surface servo setup notes", groups: futabaSurfaceServoGroups },
  { slug: "futaba-bls571sv", brand: "Futaba", model: "BLS571SV", category: "servo", sourceLabel: "Futaba BLS571SV S.Bus2 low-profile surface servo comparison data", sourceUrl: "https://futabausa.com/product-support/servochart/", groups: futabaSurfaceServoGroups },
  { slug: "futaba-s9571sv", brand: "Futaba", model: "S9571SV", category: "servo", sourceLabel: "Futaba S9571SV surface servo comparison data", sourceUrl: "https://futabausa.com/product-support/servochart/", groups: futabaSurfaceServoGroups },
  { slug: "yokomo-dp-302-v4", brand: "Yokomo", model: "DP-302 V4", category: "gyro", sourceLabel: "Yokomo DP-302 V4 gyro setup notes", groups: yokomoGyroGroups },
  { slug: "yokomo-yg-302v2", brand: "Yokomo", model: "YG-302V2", category: "gyro", sourceLabel: "Yokomo YG-302V2 steering gyro product/manual notes", sourceUrl: "https://teamyokomo.com/parts/YG-302V2/", groups: yokomoGyroGroups },
  { slug: "reve-d-revox", brand: "Reve D", model: "REVOX", category: "gyro", sourceLabel: "Reve D REVOX product/manual notes", groups: reveDGyroGroups },
  { slug: "futaba-gyd550", brand: "Futaba", model: "GYD550", category: "gyro", sourceLabel: "Futaba GYD550 instruction manual", sourceUrl: "https://futabausa.com/wp-content/uploads/manuals/GYD550_ENG_0306.pdf", groups: futabaGyd550GyroGroups },
  { slug: "futaba-gyd560", brand: "Futaba", model: "GYD560", category: "gyro", sourceLabel: "Futaba GYD560 uses the same RC Drift Sync editable fields as GYD550", groups: futabaGyd550GyroGroups },
  { slug: "yokomo-dx1-type-r", brand: "Yokomo", model: "DX1 Type-R", category: "motor", sourceLabel: "Yokomo motor specs; tuning values stored freeform", groups: motorGroups("Yokomo motor specs") },
  { slug: "yokomo-dx1-type-t", brand: "Yokomo", model: "DX1 Type-T", category: "motor", sourceLabel: "Yokomo motor specs; tuning values stored freeform", groups: motorGroups("Yokomo motor specs") },
  { slug: "yokomo-dx1-type-r-titanium-10-5t", brand: "Yokomo", model: "DX1 Type-R Titanium Shaft 10.5T", category: "motor", sourceLabel: "Yokomo DX1 Type-R titanium shaft motor specs; tuning values stored freeform", sourceUrl: "https://teamyokomo.com/parts/RPM-DX105RTA/", groups: motorGroups("Yokomo DX1 Type-R titanium shaft motor specs") },
  { slug: "yokomo-dx2-type-r-11-5t", brand: "Yokomo", model: "DX2 Type-R 11.5T", category: "motor", sourceLabel: "Yokomo DX2 Type-R motor specs; tuning values stored freeform", sourceUrl: "https://teamyokomo.com/parts/RPM-D2115RR/", groups: motorGroups("Yokomo DX2 Type-R motor specs") },
  { slug: "yokomo-dx2-type-r-13-5t", brand: "Yokomo", model: "DX2 Type-R 13.5T", category: "motor", sourceLabel: "Yokomo DX2 Type-R motor specs; tuning values stored freeform", groups: motorGroups("Yokomo DX2 Type-R motor specs") },
  { slug: "yokomo-dx2-type-r-15-5t", brand: "Yokomo", model: "DX2 Type-R 15.5T", category: "motor", sourceLabel: "Yokomo DX2 Type-R motor specs; tuning values stored freeform", sourceUrl: "https://teamyokomo.com/parts/RPM-D2155RR/", groups: motorGroups("Yokomo DX2 Type-R motor specs") },
  { slug: "yokomo-racing-performer-motor", brand: "Yokomo", model: "Racing Performer", category: "motor", sourceLabel: "Yokomo Racing Performer motor specs; tuning values stored freeform", groups: motorGroups("Yokomo Racing Performer motor specs") },
  { slug: "yokomo-zero-s-drift-10-5t", brand: "Yokomo", model: "ZERO-S Drift 10.5T", category: "motor", sourceLabel: "Yokomo ZERO-S drift motor specs; tuning values stored freeform", groups: motorGroups("Yokomo ZERO-S drift motor specs") },
  { slug: "yokomo-zero-s-drift-13-5t", brand: "Yokomo", model: "ZERO-S Drift 13.5T", category: "motor", sourceLabel: "Yokomo ZERO-S drift motor specs; tuning values stored freeform", sourceUrl: "https://teamyokomo.com/parts/YM-S135DBA/", groups: motorGroups("Yokomo ZERO-S drift motor specs") },
  { slug: "reve-d-absolute1", brand: "Reve D", model: "Absolute1", category: "motor", sourceLabel: "Reve D Absolute1 specs; tuning values stored freeform", groups: motorGroups("Reve D Absolute1 specs") },
  { slug: "acuvance-fledge", brand: "Acuvance", model: "Fledge", category: "motor", sourceLabel: "Acuvance Fledge specs; tuning values stored freeform", groups: motorGroups("Acuvance Fledge specs") },
  { slug: "acuvance-luxon-agile", brand: "Acuvance", model: "Luxon Agile", category: "motor", sourceLabel: "Acuvance Luxon Agile specs; tuning values stored freeform", groups: motorGroups("Acuvance Luxon Agile specs") },
  { slug: "maclan-mdp-drift-performance-motor", brand: "Maclan", model: "MDP Drift Performance Motor", category: "motor", sourceLabel: "Maclan motor specs", groups: motorGroups("Maclan motor specs") },
  { slug: "maclan-mrr-motor", brand: "Maclan", model: "MRR Motor", category: "motor", sourceLabel: "Maclan MRR motor specs; tuning values stored freeform", groups: motorGroups("Maclan MRR motor specs") },
  { slug: "overdose-acuvance-od-factory-tuned-spec", brand: "Overdose x Acuvance", model: "OD Factory Tuned Spec", category: "motor", sourceLabel: "Verified retailer listings for Overdose x Acuvance motor; no Overdose ESC/servo/gyro schema added", notes: "Overdose electronics support is motor-only until official ESC/servo/gyro manuals are verified.", groups: motorGroups("Overdose x Acuvance motor listing") },
  { slug: "custom-esc", brand: "Other / Custom", model: "Custom ESC", category: "esc", sourceLabel: "Custom user entry", groups: customGroups },
  { slug: "custom-motor", brand: "Other / Custom", model: "Custom Motor", category: "motor", sourceLabel: "Custom user entry", groups: customGroups },
  { slug: "custom-servo", brand: "Other / Custom", model: "Custom Servo", category: "servo", sourceLabel: "Custom user entry", groups: customGroups },
  { slug: "custom-gyro", brand: "Other / Custom", model: "Custom Gyro", category: "gyro", sourceLabel: "Custom user entry", groups: customGroups }
];

const schemaCategoriesWithTunableMenus: ElectronicsCategory[] = ["esc", "servo", "gyro"];

function normalizeSchemaText(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function modelLooksLikeMatch(candidate: string, schemaModel: string) {
  const cleanCandidate = normalizeSchemaText(candidate);
  const cleanSchemaModel = normalizeSchemaText(schemaModel);
  if (!cleanCandidate || !cleanSchemaModel) return false;
  if (cleanCandidate.includes(cleanSchemaModel) || cleanSchemaModel.includes(cleanCandidate)) return true;
  const compactCandidate = cleanCandidate.replace(/\s+/g, "");
  const compactSchemaModel = cleanSchemaModel.replace(/\s+/g, "");
  if (compactCandidate.includes(compactSchemaModel) || compactSchemaModel.includes(compactCandidate)) return true;

  const schemaTokens = cleanSchemaModel.split(" ").filter((token) => token.length > 1);
  if (!schemaTokens.length) return false;
  return schemaTokens.every((token) => cleanCandidate.includes(token));
}

function schemaMatchScore(candidate: string, schemaModel: string) {
  const cleanCandidate = normalizeSchemaText(candidate);
  const cleanSchemaModel = normalizeSchemaText(schemaModel);
  if (!cleanCandidate || !cleanSchemaModel || !modelLooksLikeMatch(cleanCandidate, cleanSchemaModel)) return 0;
  const compactCandidate = cleanCandidate.replace(/\s+/g, "");
  const compactSchema = cleanSchemaModel.replace(/\s+/g, "");
  if (cleanCandidate === cleanSchemaModel || compactCandidate === compactSchema) return 1000 + compactSchema.length;
  if (cleanCandidate.includes(cleanSchemaModel) || compactCandidate.includes(compactSchema)) return 500 + compactSchema.length;
  return 100 + compactSchema.length;
}

export function findElectronicsSchema(slug?: string, category?: ElectronicsCategory) {
  if (category && !schemaCategoriesWithTunableMenus.includes(category)) return undefined;
  if (slug) {
    const exact = electronicsSchemas.find((schema) => schema.slug === slug);
    if (exact) return exact;

    const cleanSlug = normalizeSchemaText(slug);
    const slugMatch = electronicsSchemas
      .filter((schema) => !category || schema.category === category)
      .map((schema) => ({
        schema,
        score: Math.max(
          cleanSlug.includes(normalizeSchemaText(schema.slug)) ? 700 + normalizeSchemaText(schema.slug).length : 0,
          schemaMatchScore(cleanSlug, schema.model)
        )
      }))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.schema;
    if (slugMatch) return slugMatch;
  }
  if (!category) return undefined;
  return electronicsSchemas.find((schema) => schema.slug === `custom-${category}`);
}

export function findElectronicsSchemaForProduct(category: ElectronicsCategory, brand?: string, model?: string, slug?: string) {
  if (!schemaCategoriesWithTunableMenus.includes(category)) return undefined;
  const slugMatch = findElectronicsSchema(slug, category);
  if (slugMatch && !slugMatch.slug.startsWith("custom-")) return slugMatch;

  const cleanBrand = normalizeSchemaText(brand);
  const cleanModel = normalizeSchemaText(model);
  if (!cleanBrand && !cleanModel) return undefined;

  const productMatch = electronicsSchemas
    .filter((schema) => {
      if (schema.category !== category || schema.slug.startsWith("custom-")) return false;
      const schemaBrand = normalizeSchemaText(schema.brand);
      return cleanBrand
        ? cleanBrand.includes(schemaBrand) || schemaBrand.includes(cleanBrand) || (cleanBrand.includes("reve") && schemaBrand.includes("reve"))
        : true;
    })
    .map((schema) => ({ schema, score: schemaMatchScore(cleanModel || normalizeSchemaText(slug), schema.model) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.schema;

  if (productMatch) return productMatch;
  if (cleanBrand.includes("custom") || cleanBrand.includes("other") || cleanModel.includes("custom") || cleanModel.includes("other")) {
    return electronicsSchemas.find((schema) => schema.slug === `custom-${category}`);
  }
  return undefined;
}


