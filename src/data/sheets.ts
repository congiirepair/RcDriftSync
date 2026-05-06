import type { Hotspot, SetupSheetTemplate } from "../types";
import { commonFields } from "./sheetFields";

const holeGroup = (
  id: string,
  fieldId: string,
  label: string,
  x: number,
  y: number,
  options: Array<[string, string, number, number]>
): Hotspot => ({
  id,
  fieldId,
  label,
  type: "holeGroup",
  x,
  y,
  width: 145,
  height: 90,
  options: options.map(([optionId, optionLabel, ox, oy]) => ({ id: optionId, label: optionLabel, x: ox, y: oy }))
});

const valueHotspot = (id: string, fieldId: string, label: string, x: number, y: number, width = 118, height = 42): Hotspot => ({
  id,
  fieldId,
  label,
  type: "field",
  x,
  y,
  width,
  height
});

const COORDINATE_SOURCE_SIZE = { width: 1786, height: 2526 };

const normalizeHotspot = (hotspot: Hotspot): Hotspot => ({
  ...hotspot,
  x: hotspot.x / COORDINATE_SOURCE_SIZE.width,
  y: hotspot.y / COORDINATE_SOURCE_SIZE.height,
  width: hotspot.width / COORDINATE_SOURCE_SIZE.width,
  height: hotspot.height / COORDINATE_SOURCE_SIZE.height,
  options: hotspot.options?.map((option) => ({
    ...option,
    x: option.x / COORDINATE_SOURCE_SIZE.width,
    y: option.y / COORDINATE_SOURCE_SIZE.height
  }))
});

const normalizeHotspots = (hotspots: Hotspot[]) => hotspots.map(normalizeHotspot);

const rdxHotspots: Hotspot[] = [
  holeGroup("rdx-front-shock", "frontShockPosition", "Front shock position", 116, 336, [
    ["inner-low", "Inner low", 146, 382],
    ["inner-high", "Inner high", 146, 356],
    ["middle-low", "Middle low", 190, 382],
    ["middle-high", "Middle high", 190, 356],
    ["outer-low", "Outer low", 235, 382],
    ["outer-high", "Outer high", 235, 356]
  ]),
  holeGroup("rdx-rear-shock", "rearShockPosition", "Rear shock position", 650, 336, [
    ["inner-low", "Inner low", 682, 382],
    ["inner-high", "Inner high", 682, 356],
    ["middle-low", "Middle low", 726, 382],
    ["middle-high", "Middle high", 726, 356],
    ["outer-low", "Outer low", 770, 382],
    ["outer-high", "Outer high", 770, 356]
  ]),
  holeGroup("rdx-front-upper", "frontUpperLink", "Front upper link", 138, 488, [
    ["a", "A", 166, 526],
    ["b", "B", 203, 526],
    ["c", "C", 241, 526]
  ]),
  holeGroup("rdx-rear-upper", "rearUpperLink", "Rear upper link", 672, 488, [
    ["a", "A", 700, 526],
    ["b", "B", 738, 526],
    ["c", "C", 776, 526]
  ]),
  holeGroup("rdx-arm-mount", "armMount", "Arm mount holes", 384, 488, [
    ["front-in", "Front inner", 423, 526],
    ["front-out", "Front outer", 466, 526],
    ["rear-in", "Rear inner", 423, 562],
    ["rear-out", "Rear outer", 466, 562]
  ]),
  valueHotspot("rdx-front-camber", "frontCamber", "Front camber", 95, 635),
  valueHotspot("rdx-rear-camber", "rearCamber", "Rear camber", 640, 635),
  valueHotspot("rdx-ride-height", "frontRideHeight", "Front ride height", 274, 695),
  valueHotspot("rdx-rear-ride-height", "rearRideHeight", "Rear ride height", 458, 695),
  valueHotspot("rdx-gyro", "gyro", "Gyro", 90, 850, 155),
  valueHotspot("rdx-motor", "motor", "Motor", 268, 850, 155),
  valueHotspot("rdx-esc", "esc", "ESC", 446, 850, 155),
  valueHotspot("rdx-body", "body", "Body", 624, 850, 155)
];

const mc3Hotspots: Hotspot[] = [
  holeGroup("mc3-front-shock", "frontShockPosition", "Front shock tower", 110, 315, [
    ["1", "Hole 1", 142, 352],
    ["2", "Hole 2", 178, 352],
    ["3", "Hole 3", 214, 352],
    ["4", "Hole 4", 250, 352]
  ]),
  holeGroup("mc3-rear-shock", "rearShockPosition", "Rear shock tower", 645, 315, [
    ["1", "Hole 1", 676, 352],
    ["2", "Hole 2", 712, 352],
    ["3", "Hole 3", 748, 352],
    ["4", "Hole 4", 784, 352]
  ]),
  holeGroup("mc3-servo", "servoPosition", "Servo / steering position", 346, 306, [
    ["forward", "Forward", 391, 344],
    ["middle", "Middle", 438, 344],
    ["rear", "Rear", 485, 344]
  ]),
  holeGroup("mc3-front-link", "frontUpperLink", "Front upper link", 132, 486, [
    ["low", "Low", 162, 526],
    ["mid", "Mid", 202, 526],
    ["high", "High", 242, 526]
  ]),
  holeGroup("mc3-rear-link", "rearUpperLink", "Rear upper link", 668, 486, [
    ["low", "Low", 698, 526],
    ["mid", "Mid", 738, 526],
    ["high", "High", 778, 526]
  ]),
  valueHotspot("mc3-caster", "caster", "Caster", 94, 622),
  valueHotspot("mc3-front-toe", "frontToe", "Front toe", 272, 622),
  valueHotspot("mc3-rear-toe", "rearToe", "Rear toe", 456, 622),
  valueHotspot("mc3-diff", "diff", "Diff", 634, 622),
  valueHotspot("mc3-tires-front", "frontTires", "Front tires", 92, 812, 160),
  valueHotspot("mc3-tires-rear", "rearTires", "Rear tires", 272, 812, 160),
  valueHotspot("mc3-oil", "shockOil", "Shock oil", 452, 812, 160),
  valueHotspot("mc3-weight", "weightPlacement", "Weight", 632, 812, 160)
];

// Kept as a coordinate reference for the generated placeholder sheets.
// The active app templates below use the official PDF-derived hotspots.
void rdxHotspots;
void mc3Hotspots;

const officialRdxHotspots: Hotspot[] = [
  holeGroup("rdx-front-shock", "frontShockPosition", "Front shock position", 162, 1538, [
    ["inner-high", "Inner high", 194, 1585],
    ["middle-high", "Middle high", 214, 1585],
    ["outer-high", "Outer high", 246, 1585],
    ["inner-low", "Inner low", 194, 1622],
    ["middle-low", "Middle low", 214, 1622],
    ["outer-low", "Outer low", 246, 1622]
  ]),
  holeGroup("rdx-rear-shock", "rearShockPosition", "Rear shock position", 1100, 1732, [
    ["inner-high", "Inner high", 1136, 1760],
    ["middle-high", "Middle high", 1166, 1760],
    ["outer-high", "Outer high", 1198, 1760],
    ["inner-low", "Inner low", 1136, 1796],
    ["middle-low", "Middle low", 1166, 1796],
    ["outer-low", "Outer low", 1198, 1796]
  ]),
  holeGroup("rdx-front-upper", "frontUpperLink", "Front upper link", 280, 1658, [
    ["a", "A", 292, 1720],
    ["b", "B", 318, 1720],
    ["c", "C", 346, 1720]
  ]),
  holeGroup("rdx-rear-upper", "rearUpperLink", "Rear upper link", 1186, 1818, [
    ["a", "A", 1198, 1928],
    ["b", "B", 1206, 1952],
    ["c", "C", 1214, 1978]
  ]),
  holeGroup("rdx-arm-mount", "armMount", "Arm mount holes", 320, 1538, [
    ["front-in", "Front inner", 322, 1584],
    ["front-out", "Front outer", 354, 1584],
    ["rear-in", "Rear inner", 324, 1622],
    ["rear-out", "Rear outer", 386, 1622]
  ]),
  valueHotspot("rdx-front-camber", "frontCamber", "Front camber", 1348, 394, 174, 44),
  valueHotspot("rdx-rear-camber", "rearCamber", "Rear camber", 1522, 394, 174, 44),
  valueHotspot("rdx-front-toe", "frontToe", "Front toe", 1284, 450, 284, 44),
  valueHotspot("rdx-rear-toe", "rearToe", "Rear toe", 1284, 716, 284, 44),
  valueHotspot("rdx-caster", "caster", "Caster", 1284, 790, 284, 44),
  valueHotspot("rdx-ride-height", "frontRideHeight", "Front ride height", 1284, 498, 284, 44),
  valueHotspot("rdx-rear-ride-height", "rearRideHeight", "Rear ride height", 1284, 574, 284, 44),
  valueHotspot("rdx-front-droop", "frontDroop", "Front droop", 1284, 1030, 284, 44),
  valueHotspot("rdx-rear-droop", "rearDroop", "Rear droop", 1454, 1030, 220, 44),
  valueHotspot("rdx-front-spring", "frontSpring", "Front spring", 1284, 1290, 284, 44),
  valueHotspot("rdx-rear-spring", "rearSpring", "Rear spring", 1284, 1368, 284, 44),
  valueHotspot("rdx-shock-oil", "shockOil", "Shock oil", 1284, 1444, 284, 44),
  valueHotspot("rdx-diff", "diff", "Diff", 1284, 1520, 284, 44),
  valueHotspot("rdx-front-tires", "frontTires", "Front tires", 1284, 1772, 284, 44),
  valueHotspot("rdx-rear-tires", "rearTires", "Rear tires", 1284, 1848, 284, 44),
  valueHotspot("rdx-gyro", "gyro", "Gyro", 1284, 865, 138, 44),
  valueHotspot("rdx-motor", "motor", "Motor", 1428, 865, 138, 44),
  valueHotspot("rdx-esc", "esc", "ESC", 1284, 944, 138, 44),
  valueHotspot("rdx-body", "body", "Body", 1452, 944, 138, 44),
  valueHotspot("rdx-electronics", "electronics", "Electronics", 1100, 2145, 280, 54),
  valueHotspot("rdx-weight", "weightPlacement", "Weight placement", 1420, 2145, 260, 54)
];

const officialMc3Hotspots: Hotspot[] = [
  holeGroup("mc3-front-shock", "frontShockPosition", "Front shock tower", 154, 1536, [
    ["1", "Hole 1", 194, 1582],
    ["2", "Hole 2", 214, 1582],
    ["3", "Hole 3", 246, 1582],
    ["4", "Hole 4", 194, 1620]
  ]),
  holeGroup("mc3-rear-shock", "rearShockPosition", "Rear shock tower", 1104, 1732, [
    ["1", "Hole 1", 1136, 1760],
    ["2", "Hole 2", 1166, 1760],
    ["3", "Hole 3", 1198, 1760],
    ["4", "Hole 4", 1206, 1832]
  ]),
  holeGroup("mc3-servo", "servoPosition", "Servo / steering position", 474, 1642, [
    ["forward", "Forward", 294, 1720],
    ["middle", "Middle", 344, 1720],
    ["rear", "Rear", 392, 1720]
  ]),
  holeGroup("mc3-front-link", "frontUpperLink", "Front upper link", 176, 1572, [
    ["low", "Low", 192, 1620],
    ["mid", "Mid", 214, 1620],
    ["high", "High", 246, 1620]
  ]),
  holeGroup("mc3-rear-link", "rearUpperLink", "Rear upper link", 1186, 1816, [
    ["low", "Low", 1198, 1928],
    ["mid", "Mid", 1206, 1952],
    ["high", "High", 1214, 1978]
  ]),
  valueHotspot("mc3-caster", "caster", "Caster", 1348, 394, 174, 44),
  valueHotspot("mc3-front-camber", "frontCamber", "Front camber", 1522, 394, 174, 44),
  valueHotspot("mc3-front-toe", "frontToe", "Front toe", 1284, 498, 284, 44),
  valueHotspot("mc3-rear-toe", "rearToe", "Rear toe", 1284, 574, 284, 44),
  valueHotspot("mc3-rear-camber", "rearCamber", "Rear camber", 1284, 716, 284, 44),
  valueHotspot("mc3-front-ride-height", "frontRideHeight", "Front ride height", 1284, 790, 284, 44),
  valueHotspot("mc3-rear-ride-height", "rearRideHeight", "Rear ride height", 1284, 1030, 284, 44),
  valueHotspot("mc3-front-droop", "frontDroop", "Front droop", 1454, 1030, 220, 44),
  valueHotspot("mc3-rear-droop", "rearDroop", "Rear droop", 1284, 1290, 284, 44),
  valueHotspot("mc3-diff", "diff", "Diff", 1284, 644, 284, 44),
  valueHotspot("mc3-tires-front", "frontTires", "Front tires", 1284, 1448, 284, 44),
  valueHotspot("mc3-tires-rear", "rearTires", "Rear tires", 1284, 1522, 284, 44),
  valueHotspot("mc3-front-spring", "frontSpring", "Front spring", 1284, 1602, 284, 44),
  valueHotspot("mc3-oil", "shockOil", "Shock oil", 1284, 1680, 284, 44),
  valueHotspot("mc3-rear-spring", "rearSpring", "Rear spring", 1284, 1760, 284, 44),
  valueHotspot("mc3-weight", "weightPlacement", "Weight", 1284, 1840, 284, 44),
  valueHotspot("mc3-gyro", "gyro", "Gyro", 1100, 2145, 220, 54),
  valueHotspot("mc3-motor", "motor", "Motor", 1340, 2145, 180, 54),
  valueHotspot("mc3-esc", "esc", "ESC", 1530, 2145, 150, 54),
  valueHotspot("mc3-body", "body", "Body", 1100, 2288, 260, 54),
  valueHotspot("mc3-electronics", "electronics", "Electronics", 1380, 2288, 300, 54)
];

const extraRdxFields = [
  { id: "frontShockPosition", label: "Front shock holes", type: "select" as const, section: "Sheet positions", options: ["inner-low", "inner-high", "middle-low", "middle-high", "outer-low", "outer-high"] },
  { id: "rearShockPosition", label: "Rear shock holes", type: "select" as const, section: "Sheet positions", options: ["inner-low", "inner-high", "middle-low", "middle-high", "outer-low", "outer-high"] },
  { id: "frontUpperLink", label: "Front upper link", type: "select" as const, section: "Sheet positions", options: ["a", "b", "c"] },
  { id: "rearUpperLink", label: "Rear upper link", type: "select" as const, section: "Sheet positions", options: ["a", "b", "c"] },
  { id: "armMount", label: "Arm mount", type: "select" as const, section: "Sheet positions", options: ["front-in", "front-out", "rear-in", "rear-out"] }
];

const extraMc3Fields = [
  { id: "frontShockPosition", label: "Front shock holes", type: "select" as const, section: "Sheet positions", options: ["1", "2", "3", "4"] },
  { id: "rearShockPosition", label: "Rear shock holes", type: "select" as const, section: "Sheet positions", options: ["1", "2", "3", "4"] },
  { id: "servoPosition", label: "Servo position", type: "select" as const, section: "Sheet positions", options: ["forward", "middle", "rear"] },
  { id: "frontUpperLink", label: "Front upper link", type: "select" as const, section: "Sheet positions", options: ["low", "mid", "high"] },
  { id: "rearUpperLink", label: "Rear upper link", type: "select" as const, section: "Sheet positions", options: ["low", "mid", "high"] }
];

export const setupSheets: SetupSheetTemplate[] = [
  {
    id: "universal-template",
    name: "RC Drift Sync Universal setup sheet",
    chassis: "Universal Setup Sheet",
    pdfAsset: "/sheets/universal-setup-sheet.pdf",
    renderedImageAsset: "/sheets/universal-setup-sheet.svg",
    image: "/sheets/universal-setup-sheet.svg",
    imageWidth: 595,
    imageHeight: 842,
    fields: commonFields,
    hotspots: [],
    holeGroups: [],
    defaultValues: {
      frontCamber: -6,
      rearCamber: -3,
      frontRideHeight: 6,
      rearRideHeight: 6.5,
      shockOil: "350 cSt"
    }
  },
  {
    id: "rdx-template",
    name: "Reve D RDX setting sheet",
    chassis: "Reve D RDX",
    pdfAsset: "/sheets/RDX_Setting-Sheet_A4_20260325.pdf",
    renderedImageAsset: "/sheets/rdx-template-20260325.png",
    image: "/sheets/rdx-template-20260325.png",
    imageWidth: 2382,
    imageHeight: 3368,
    fields: [...extraRdxFields, ...commonFields],
    hotspots: normalizeHotspots(officialRdxHotspots),
    holeGroups: normalizeHotspots(officialRdxHotspots.filter((hotspot) => hotspot.options?.length)),
    defaultValues: {
      frontShockPosition: "middle-high",
      rearShockPosition: "middle-low",
      frontUpperLink: "b",
      rearUpperLink: "b",
      armMount: "rear-in",
      frontCamber: -6,
      rearCamber: -3,
      caster: "8 deg",
      frontRideHeight: 6,
      rearRideHeight: 6.5,
      shockOil: "350 cSt"
    }
  },
  {
    id: "mc3-template",
    name: "MC-3 setting sheet",
    chassis: "MC-3",
    pdfAsset: "/sheets/MC-3_Setting-Sheet_A4_20260325.pdf",
    renderedImageAsset: "/sheets/mc3-template-20260325.png",
    image: "/sheets/mc3-template-20260325.png",
    imageWidth: 2382,
    imageHeight: 3368,
    fields: [...extraMc3Fields, ...commonFields],
    hotspots: normalizeHotspots(officialMc3Hotspots),
    holeGroups: normalizeHotspots(officialMc3Hotspots.filter((hotspot) => hotspot.options?.length)),
    defaultValues: {
      frontShockPosition: "2",
      rearShockPosition: "3",
      servoPosition: "middle",
      frontUpperLink: "mid",
      rearUpperLink: "mid",
      frontToe: 0,
      rearToe: 3,
      caster: "6 deg",
      shockOil: "400 cSt"
    }
  }
];

const sheetAliases: Record<string, string> = {
  "reve-d-rdx": "rdx-template",
  "mc-3": "mc3-template",
  universal: "universal-template"
};

export const getSheet = (sheetId: string) => setupSheets.find((sheet) => sheet.id === (sheetAliases[sheetId] ?? sheetId)) ?? setupSheets[0];
