import type { FieldType } from "../types";
import mc3FieldMap from "./pdfMaps/mc3FieldMap.json";
import rdxFieldMap from "./pdfMaps/rdxFieldMap.json";

export type PdfFieldKind = FieldType | "checkboxGroup" | "holeSelect";

export interface FormFieldDef {
  id: string;
  label: string;
  type: PdfFieldKind;
  section: string;
  options?: string[];
  placeholder?: string;
  suffix?: string;
}

export interface PdfTextMap {
  fieldId: string;
  label: string;
  page: number;
  pdfX: number;
  pdfY: number;
  fontSize?: number;
  maxWidth?: number;
  align?: "left" | "center";
  suffix?: string;
}

export interface PdfCheckboxMap {
  id: string;
  fieldId: string;
  value: string | boolean;
  page: number;
  pdfX: number;
  pdfY: number;
  size?: number;
}

export interface PdfHole {
  id: string;
  label: string;
  pdfX: number;
  pdfY: number;
}

export interface PdfHoleGroup {
  id: string;
  fieldId: string;
  label: string;
  page: number;
  holes: PdfHole[];
}

export interface PdfTemplate {
  id: string;
  name: string;
  chassis: string;
  pdfAsset: string;
  previewImageAsset: string;
  pageWidth: number;
  pageHeight: number;
  sections: string[];
  formFields: FormFieldDef[];
  text: PdfTextMap[];
  checkboxes: PdfCheckboxMap[];
  holeGroups: PdfHoleGroup[];
}

type PdfTemplateMap = Omit<PdfTemplate, "sections" | "formFields"> & { sourcePdf?: string };

const page = { width: 595.276, height: 841.89 };

const generalFields: FormFieldDef[] = [
  { id: "date", label: "Date", type: "text", section: "General" },
  { id: "driver", label: "Driver", type: "text", section: "General" },
  { id: "drivingPlace", label: "Driving Place", type: "text", section: "General" },
  { id: "surface", label: "Surface", type: "checkboxGroup", section: "General", options: ["Plastic Tile", "Carpet", "Asphalt", "Colored Concrete"] },
  { id: "body", label: "Body", type: "text", section: "General" },
  { id: "wing", label: "Wing", type: "text", section: "General" },
  { id: "tires", label: "Tires", type: "text", section: "General" }
];

const frontFields: FormFieldDef[] = [
  { id: "bellCrank", label: "Bell Crank", type: "select", section: "Front", options: ["Normal", "Aluminum", "Graphite"] },
  { id: "frontBallCaps", label: "Ball Caps", type: "select", section: "Front", options: ["S", "M", "L"] },
  { id: "frontSpacer1", label: "Front Spacer 1", type: "number", section: "Front", suffix: "mm" },
  { id: "frontSpacer2", label: "Front Spacer 2", type: "number", section: "Front", suffix: "mm" },
  { id: "frontBallStud1", label: "Front Ball Stud 1", type: "number", section: "Front", suffix: "mm" },
  { id: "frontUpperArm", label: "Upper Arm", type: "select", section: "Front", options: ["Normal", "Graphite"] },
  { id: "frontLowerSusMount", label: "Lower Sus-Mount", type: "select", section: "Front", options: ["Positive side", "Negative side"] },
  { id: "frontWheelHubs", label: "Wheel Hubs", type: "select", section: "Front", options: ["Normal", "Aluminum"] },
  { id: "frontKnuckle", label: "Knuckle", type: "select", section: "Front", options: ["Normal", "Graphite", "Aluminum", "Multi knuckle"] },
  { id: "frontKnuckleStopper", label: "Knuckle Stopper", type: "text", section: "Front" },
  { id: "frontShockPosition", label: "Front Shock Hole", type: "holeSelect", section: "Front", options: ["inner-high", "middle-high", "outer-high", "inner-low", "middle-low", "outer-low"] },
  { id: "frontRideHeight", label: "Front Ride Height", type: "number", section: "Front", suffix: "mm" },
  { id: "frontCamber", label: "Front Camber Angle", type: "number", section: "Front" },
  { id: "frontToe", label: "Front Toe Angle", type: "number", section: "Front" },
  { id: "frontShockShaft", label: "Front Shock Shaft", type: "text", section: "Front" },
  { id: "frontSpring", label: "Front Spring", type: "text", section: "Front" },
  { id: "frontPiston", label: "Front Piston", type: "text", section: "Front" },
  { id: "frontHoles", label: "Front Holes", type: "text", section: "Front" },
  { id: "frontOil", label: "Front Oil", type: "text", section: "Front" },
  { id: "frontOring", label: "Front O-ring", type: "text", section: "Front" },
  { id: "frontRetainer", label: "Front Retainer", type: "select", section: "Front", options: ["Normal", "Aluminum"] },
  { id: "frontMemo", label: "Front Memo", type: "textarea", section: "Front" }
];

const rearFields: FormFieldDef[] = [
  { id: "motorPosition", label: "Motor Position", type: "select", section: "Rear", options: ["High Mount", "Low Mount"] },
  { id: "rearShockPosition", label: "Rear Shock Hole", type: "holeSelect", section: "Rear", options: ["inner-high", "middle-high", "outer-high", "inner-low", "middle-low", "outer-low"] },
  { id: "rearHubCarrier", label: "Rear Hub Carrier", type: "select", section: "Rear", options: ["Normal", "Aluminum", "A-Arm"] },
  { id: "rearWheelHubs", label: "Wheel Hubs", type: "select", section: "Rear", options: ["Normal", "Aluminum"] },
  { id: "swayBar", label: "Sway Bar", type: "text", section: "Rear" },
  { id: "diff", label: "Diff", type: "select", section: "Rear", options: ["Spool", "Gear Diff", "Ball Diff", "LSD"] },
  { id: "diffOil", label: "Diff Oil Number", type: "text", section: "Rear" },
  { id: "susMountRF", label: "Sus Mount RF", type: "select", section: "Rear", options: ["Normal", "Aluminum"] },
  { id: "susMountRR", label: "Sus Mount RR", type: "select", section: "Rear", options: ["Normal", "Aluminum"] },
  { id: "susArm", label: "Sus Arm", type: "select", section: "Rear", options: ["Straight", "Gull Arm", "A-Arm", "42mm", "42mm 2.6deg", "45mm", "Others"] },
  { id: "spacerUnderSusMountRF", label: "Spacer under Sus-mount RF", type: "number", section: "Rear", suffix: "mm" },
  { id: "spacerUnderSusMountRR", label: "Spacer under Sus-mount RR", type: "number", section: "Rear", suffix: "mm" },
  { id: "lowerSusHolePosition", label: "Lower Sus Hole Position", type: "select", section: "Rear", options: ["Upper Hole", "Lower Hole"] },
  { id: "rearRideHeight", label: "Rear Ride Height", type: "number", section: "Rear", suffix: "mm" },
  { id: "rearSkidAngle", label: "Rear Skid Angle", type: "number", section: "Rear" },
  { id: "rearCamber", label: "Rear Camber Angle", type: "number", section: "Rear" },
  { id: "rearToe", label: "Rear Toe Angle", type: "number", section: "Rear" },
  { id: "rearShockShaft", label: "Rear Shock Shaft", type: "text", section: "Rear" },
  { id: "rearSpring", label: "Rear Spring", type: "text", section: "Rear" },
  { id: "rearPiston", label: "Rear Piston", type: "text", section: "Rear" },
  { id: "rearHoles", label: "Rear Holes", type: "text", section: "Rear" },
  { id: "rearOil", label: "Rear Oil", type: "text", section: "Rear" },
  { id: "rearOring", label: "Rear O-ring", type: "text", section: "Rear" },
  { id: "rearRetainer", label: "Rear Retainer", type: "select", section: "Rear", options: ["Normal", "Aluminum"] },
  { id: "rearMemo", label: "Rear Memo", type: "textarea", section: "Rear" }
];

const chassisFields: FormFieldDef[] = [
  { id: "chassis", label: "Chassis", type: "select", section: "Chassis", options: ["Normal", "FRP", "Carbon"] },
  { id: "sideDeck", label: "Side Deck", type: "select", section: "Chassis", options: ["FRP", "Carbon"] },
  { id: "frontUpperBrace", label: "Front Upper Brace", type: "select", section: "Chassis", options: ["Normal", "Aluminum"] },
  { id: "chassisBracesFront", label: "Chassis Braces Front", type: "select", section: "Chassis", options: ["Normal", "Aluminum"] },
  { id: "chassisBracesRear", label: "Chassis Braces Rear", type: "select", section: "Chassis", options: ["Normal", "Aluminum"] },
  { id: "weight", label: "Weight", type: "number", section: "Chassis", suffix: "g" },
  { id: "weightNotes", label: "Weight Location Notes", type: "textarea", section: "Chassis" }
];

const wheelFields: FormFieldDef[] = [
  { id: "frontWheel", label: "Front Wheel", type: "text", section: "Wheel" },
  { id: "frontOffset", label: "Front Offset", type: "number", section: "Wheel", suffix: "mm" },
  { id: "rearWheel", label: "Rear Wheel", type: "text", section: "Wheel" },
  { id: "rearOffset", label: "Rear Offset", type: "number", section: "Wheel", suffix: "mm" }
];

const electricalFields: FormFieldDef[] = [
  { id: "servo", label: "Servo", type: "text", section: "Electrical" },
  { id: "servoHorn", label: "Servo Horn", type: "text", section: "Electrical" },
  { id: "servoPosition", label: "Servo Position", type: "select", section: "Electrical", options: ["F", "M", "R"] },
  { id: "gyro", label: "Gyro", type: "text", section: "Electrical" },
  { id: "gain", label: "Gain", type: "number", section: "Electrical" },
  { id: "curve", label: "Curve / Carve", type: "number", section: "Electrical" },
  { id: "motor", label: "Motor", type: "text", section: "Electrical" },
  { id: "timing", label: "Timing", type: "number", section: "Electrical" },
  { id: "battery", label: "Battery", type: "text", section: "Electrical" },
  { id: "pinionGear", label: "Pinion Gear", type: "number", section: "Electrical" },
  { id: "spurGear", label: "Spur Gear", type: "number", section: "Electrical" },
  { id: "esc", label: "ESC", type: "text", section: "Electrical" },
  { id: "boost", label: "Boost", type: "number", section: "Electrical" },
  { id: "turbo", label: "Turbo", type: "number", section: "Electrical" }
];

const allFields = [...generalFields, ...frontFields, ...rearFields, ...chassisFields, ...wheelFields, ...electricalFields];
const sections = ["General", "Front", "Rear", "Chassis", "Wheel", "Electrical"];

const text = (fieldId: string, label: string, pdfX: number, pdfY: number, maxWidth = 70, fontSize = 8, suffix?: string): PdfTextMap => ({
  fieldId,
  label,
  page: 0,
  pdfX,
  pdfY,
  fontSize,
  maxWidth,
  suffix
});

const checkbox = (id: string, fieldId: string, value: string | boolean, pdfX: number, pdfY: number): PdfCheckboxMap => ({
  id,
  fieldId,
  value,
  page: 0,
  pdfX,
  pdfY,
  size: 7
});

const baseTextMaps: PdfTextMap[] = [
  text("date", "Date", 200, 798, 70),
  text("driver", "Driver", 200, 776, 80),
  text("drivingPlace", "Driving Place", 200, 752, 100),
  text("body", "Body", 443, 798, 80),
  text("wing", "Wing", 443, 776, 80),
  text("tires", "Tires", 443, 750, 80),
  text("frontRideHeight", "Front Ride Height", 467, 698, 42, 8, "mm"),
  text("frontCamber", "Front Camber", 467, 676, 32, 8, "deg"),
  text("frontToe", "Front Toe", 529, 676, 32, 8, "deg"),
  text("frontShockShaft", "Front Shock Shaft", 431, 640, 105),
  text("frontSpring", "Front Spring", 431, 606, 105),
  text("frontPiston", "Front Piston", 431, 573, 78),
  text("frontHoles", "Front Holes", 461, 559, 30),
  text("frontOil", "Front Oil", 431, 535, 47),
  text("frontOring", "Front O-ring", 488, 535, 36),
  text("frontRetainer", "Front Retainer", 431, 491, 86),
  text("frontMemo", "Front Memo", 431, 465, 112),
  text("rearRideHeight", "Rear Ride Height", 467, 388, 42, 8, "mm"),
  text("rearSkidAngle", "Rear Skid Angle", 540, 388, 30, 8, "deg"),
  text("rearCamber", "Rear Camber", 467, 367, 32, 8, "deg"),
  text("rearToe", "Rear Toe", 529, 367, 32, 8, "deg"),
  text("rearShockShaft", "Rear Shock Shaft", 431, 329, 105),
  text("rearSpring", "Rear Spring", 431, 294, 105),
  text("rearPiston", "Rear Piston", 431, 260, 78),
  text("rearHoles", "Rear Holes", 461, 246, 30),
  text("rearOil", "Rear Oil", 431, 223, 47),
  text("rearOring", "Rear O-ring", 488, 223, 36),
  text("rearRetainer", "Rear Retainer", 431, 178, 86),
  text("rearMemo", "Rear Memo", 431, 151, 112),
  text("frontWheel", "Front Wheel", 158, 96, 94),
  text("frontOffset", "Front Offset", 184, 70, 35, 8, "mm"),
  text("rearWheel", "Rear Wheel", 158, 49, 94),
  text("rearOffset", "Rear Offset", 184, 23, 35, 8, "mm"),
  text("weight", "Weight", 220, 12, 38, 8, "g"),
  text("servo", "Servo", 263, 96, 82),
  text("servoHorn", "Servo Horn", 282, 70, 38, 8, "mm"),
  text("gyro", "Gyro", 263, 27, 80),
  text("gain", "Gain", 287, 12, 32),
  text("curve", "Curve / Carve", 328, 12, 32),
  text("motor", "Motor", 369, 96, 86),
  text("timing", "Timing", 397, 70, 32, 8, "deg"),
  text("battery", "Battery", 369, 36, 90),
  text("pinionGear", "Pinion Gear", 515, 84, 22, 8, "T"),
  text("spurGear", "Spur Gear", 515, 62, 22, 8, "T"),
  text("esc", "ESC", 472, 36, 86),
  text("boost", "Boost", 515, 13, 24),
  text("turbo", "Turbo", 515, -8, 24)
];

const baseCheckboxes: PdfCheckboxMap[] = [
  checkbox("surface-plastic", "surface", "Plastic Tile", 318, 790),
  checkbox("surface-carpet", "surface", "Carpet", 318, 776),
  checkbox("surface-asphalt", "surface", "Asphalt", 318, 762),
  checkbox("surface-concrete", "surface", "Colored Concrete", 318, 748),
  checkbox("bell-normal", "bellCrank", "Normal", 31, 697),
  checkbox("bell-aluminum", "bellCrank", "Aluminum", 94, 697),
  checkbox("bell-graphite", "bellCrank", "Graphite", 31, 683),
  checkbox("front-ball-s", "frontBallCaps", "S", 66, 646),
  checkbox("front-ball-m", "frontBallCaps", "M", 66, 633),
  checkbox("front-ball-l", "frontBallCaps", "L", 66, 620),
  checkbox("front-lower-positive", "frontLowerSusMount", "Positive side", 34, 421),
  checkbox("front-lower-negative", "frontLowerSusMount", "Negative side", 34, 406),
  checkbox("front-hub-normal", "frontWheelHubs", "Normal", 212, 413),
  checkbox("front-hub-aluminum", "frontWheelHubs", "Aluminum", 212, 399),
  checkbox("front-knuckle-normal", "frontKnuckle", "Normal", 225, 506),
  checkbox("front-knuckle-graphite", "frontKnuckle", "Graphite", 225, 493),
  checkbox("front-knuckle-aluminum", "frontKnuckle", "Aluminum", 225, 480),
  checkbox("front-retainer-normal", "frontRetainer", "Normal", 431, 475),
  checkbox("front-retainer-aluminum", "frontRetainer", "Aluminum", 431, 454),
  checkbox("motor-high", "motorPosition", "High Mount", 55, 378),
  checkbox("motor-low", "motorPosition", "Low Mount", 55, 363),
  checkbox("rear-hub-normal", "rearHubCarrier", "Normal", 143, 305),
  checkbox("rear-hub-aluminum", "rearHubCarrier", "Aluminum", 143, 291),
  checkbox("rear-hub-a", "rearHubCarrier", "A-Arm", 143, 277),
  checkbox("diff-spool", "diff", "Spool", 96, 193),
  checkbox("diff-gear", "diff", "Gear Diff", 96, 178),
  checkbox("diff-ball", "diff", "Ball Diff", 96, 164),
  checkbox("rear-retainer-normal", "rearRetainer", "Normal", 431, 162),
  checkbox("rear-retainer-aluminum", "rearRetainer", "Aluminum", 431, 141),
  checkbox("servo-f", "servoPosition", "F", 264, 54),
  checkbox("servo-m", "servoPosition", "M", 296, 54),
  checkbox("servo-r", "servoPosition", "R", 330, 54)
];

const rdxHoles: PdfHoleGroup[] = [
  {
    id: "frontShockTower",
    fieldId: "frontShockPosition",
    label: "Front Shock Tower",
    page: 0,
    holes: [
      { id: "inner-high", label: "Inner high", pdfX: 48, pdfY: 321 },
      { id: "middle-high", label: "Middle high", pdfX: 54, pdfY: 321 },
      { id: "outer-high", label: "Outer high", pdfX: 62, pdfY: 321 },
      { id: "inner-low", label: "Inner low", pdfX: 48, pdfY: 312 },
      { id: "middle-low", label: "Middle low", pdfX: 54, pdfY: 312 },
      { id: "outer-low", label: "Outer low", pdfX: 62, pdfY: 312 }
    ]
  },
  {
    id: "rearShockTower",
    fieldId: "rearShockPosition",
    label: "Rear Shock Tower",
    page: 0,
    holes: [
      { id: "inner-high", label: "Inner high", pdfX: 284, pdfY: 255 },
      { id: "middle-high", label: "Middle high", pdfX: 292, pdfY: 255 },
      { id: "outer-high", label: "Outer high", pdfX: 300, pdfY: 255 },
      { id: "inner-low", label: "Inner low", pdfX: 284, pdfY: 246 },
      { id: "middle-low", label: "Middle low", pdfX: 292, pdfY: 246 },
      { id: "outer-low", label: "Outer low", pdfX: 300, pdfY: 246 }
    ]
  }
];

const mapToTemplate = (map: PdfTemplateMap): PdfTemplate => ({
  id: map.id,
  name: map.name,
  chassis: map.chassis,
  pdfAsset: map.pdfAsset,
  previewImageAsset: map.previewImageAsset,
  pageWidth: map.pageWidth,
  pageHeight: map.pageHeight,
  sections,
  formFields: allFields,
  text: map.text,
  checkboxes: map.checkboxes,
  holeGroups: map.holeGroups
});

export const pdfTemplates: PdfTemplate[] = [
  {
    id: "universal-template",
    name: "RC Drift Sync Universal",
    chassis: "Universal Setup Sheet",
    pdfAsset: "/sheets/universal-setup-sheet.pdf",
    previewImageAsset: "/sheets/universal-setup-sheet.svg",
    pageWidth: page.width,
    pageHeight: page.height,
    sections,
    formFields: allFields,
    text: baseTextMaps,
    checkboxes: baseCheckboxes,
    holeGroups: rdxHoles
  },
  mapToTemplate(rdxFieldMap as PdfTemplateMap),
  mapToTemplate(mc3FieldMap as PdfTemplateMap)
];

const aliases: Record<string, string> = {
  "reve-d-rdx": "rdx-template",
  "mc-3": "mc3-template",
  universal: "universal-template"
};

export const getPdfTemplate = (id: string) => pdfTemplates.find((template) => template.id === (aliases[id] ?? id)) ?? pdfTemplates[0];
