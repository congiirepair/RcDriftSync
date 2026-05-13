import { productCatalogSeed, type ProductCatalogCategory, type ProductCatalogItem, type ProductCatalogVariant } from "../data/productCatalog";
import { productImageOverrides } from "../data/productImageOverrides";

const USER_CATALOG_KEY = "rc-drift-sync:product-catalog:user-items";
const PRODUCT_SUGGESTIONS_KEY = "rc-drift-sync:product-catalog:suggestions";

export interface ProductCatalogFilters {
  category?: ProductCatalogCategory;
  brand?: string;
  query?: string;
  compatibleChassis?: string;
  verifiedOnly?: boolean;
  tuneSelectableOnly?: boolean;
  includeNeedsReview?: boolean;
  includeLowConfidence?: boolean;
  includeHiddenFromTuneBuilder?: boolean;
}

export interface ProductSuggestion {
  id: string;
  category: ProductCatalogItem["category"];
  brand: string;
  productName: string;
  modelNumber: string;
  notes: string;
  sourceUrl?: string;
  submittedBy?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface CatalogValidationIssue {
  itemId: string;
  severity: "high" | "medium" | "low";
  message: string;
}

const standaloneCategoryRules: Partial<Record<ProductCatalogCategory, { productType: string; required: RegExp[]; blocked: RegExp[]; excluded: string[]; reason: string }>> = {
  gyros: {
    productType: "standalone gyro",
    required: [/\b(gyro|gyd|dp-?302|yg-?302|revox|sgs-?02)\b/i],
    blocked: [/\b(rtr|readyset|ready set|kit|chassis|car kit|combo|bundle|mount|compatible|with gyro)\b/i],
    excluded: ["chassis", "esc", "motor", "servo"],
    reason: "Gyro dropdowns only accept standalone steering gyro products."
  },
  escs: {
    productType: "standalone ESC",
    required: [/\b(esc|speed controller|breve|xarvis|rad|rpx|bl-?r|bl-?pro|bl-?sp|mdp)\b/i],
    blocked: [/\b(rtr|readyset|kit|combo|bundle|mount|plate|fan cover|fan|wire|capacitor|program card|programmer)\b/i],
    excluded: ["chassis", "electronicsBundle", "escAccessories", "capacitors"],
    reason: "ESC dropdowns only accept standalone speed controllers."
  },
  motors: {
    productType: "standalone motor",
    required: [/\b(motor|10\.5t|11\.5t|13\.5t|15\.5t|17\.5t|fledge|luxon|dx1|dx2|zero-s)\b/i],
    blocked: [/\b(rtr|readyset|kit|combo|bundle|mount|plate|fan|rotor|stator|connector|screw)\b/i],
    excluded: ["chassis", "electronicsBundle", "motorMounts", "motorAccessories"],
    reason: "Motor dropdowns only accept standalone motors."
  },
  servos: {
    productType: "standalone servo",
    required: [/\b(servo|rs-st|sp-02|sp-03|ct700|ct701|cd700|bls571|s9571|pgs|agfrc|savox|power hd)\b/i],
    blocked: [/\b(rtr|readyset|kit|combo|bundle|horn|mount|saver|accessory|screws?|gears?|case set|grommet|bushing)\b/i],
    excluded: ["chassis", "servoHorns", "servoMounts", "servoAccessories"],
    reason: "Servo dropdowns only accept standalone steering servos."
  },
  frontWheels: {
    productType: "standalone wheel",
    required: [/\b(wheel|rim|spoke|offset)\b/i],
    blocked: [/\b(rtr|readyset|kit|chassis|mounted|pre-mounted|tire set|tyre set)\b/i],
    excluded: ["chassis", "tires", "mountedWheelTireSet"],
    reason: "Wheel dropdowns only accept standalone wheels/rims."
  },
  rearWheels: {
    productType: "standalone wheel",
    required: [/\b(wheel|rim|spoke|offset)\b/i],
    blocked: [/\b(rtr|readyset|kit|chassis|mounted|pre-mounted|tire set|tyre set)\b/i],
    excluded: ["chassis", "tires", "mountedWheelTireSet"],
    reason: "Wheel dropdowns only accept standalone wheels/rims."
  },
  tires: {
    productType: "standalone tire",
    required: [/\b(tire|tyre|lf-|as-01|dra|drc|drp|csr)\b/i],
    blocked: [/\b(rtr|readyset|kit|chassis|mounted|pre-mounted|wheel set|rim set)\b/i],
    excluded: ["chassis", "frontWheels", "rearWheels", "mountedWheelTireSet"],
    reason: "Tire dropdowns only accept standalone tires."
  },
  frontKnuckles: {
    productType: "front steering knuckle",
    required: [/\b(knuckle|steering block|upright)\b/i],
    blocked: [/\b(rear hub|hub carrier|rack|bell crank|link|wheel hub)\b/i],
    excluded: ["rearHubCarriers", "frontAxles"],
    reason: "Knuckle dropdowns only accept front steering knuckles/uprights."
  },
  rearHubCarriers: {
    productType: "rear hub carrier",
    required: [/\b(rear hub|hub carrier|rear upright)\b/i],
    blocked: [/\b(front knuckle|steering block|axle|wheel hub|lower arm)\b/i],
    excluded: ["frontKnuckles", "rearAxles"],
    reason: "Rear hub carrier dropdowns only accept rear uprights/hub carriers."
  },
  frontAxles: {
    productType: "axle shaft",
    required: [/\b(axle|shaft|cva|universal)\b/i],
    blocked: [/\b(wheel hub|bearing|wheel|rim|hub carrier)\b/i],
    excluded: ["frontWheels", "rearHubCarriers"],
    reason: "Axle dropdowns only accept axle shafts, universals, or CVA parts."
  },
  rearAxles: {
    productType: "axle shaft",
    required: [/\b(axle|shaft|cva|universal)\b/i],
    blocked: [/\b(wheel hub|bearing|wheel|rim|hub carrier)\b/i],
    excluded: ["rearWheels", "rearHubCarriers"],
    reason: "Axle dropdowns only accept axle shafts, universals, or CVA parts."
  },
  frontLowerArms: {
    productType: "lower suspension arm",
    required: [/\b(lower arm|h arm|a arm)\b/i],
    blocked: [/\b(mount|toe block|hinge pin|shim|spacer|suspension kit)\b/i],
    excluded: ["frontToeBlocks", "frontLowerArmShims"],
    reason: "Lower arm dropdowns only accept actual lower suspension arms."
  },
  rearLowerArms: {
    productType: "lower suspension arm",
    required: [/\b(lower arm|h arm|a arm)\b/i],
    blocked: [/\b(mount|toe block|hinge pin|shim|spacer|suspension kit)\b/i],
    excluded: ["rearToeBlocks", "rearLowerArmShims"],
    reason: "Lower arm dropdowns only accept actual lower suspension arms."
  },
  frontUpperArms: {
    productType: "upper arm",
    required: [/\b(upper arm|upper link)\b/i],
    blocked: [/\b(mount|shaft|shim|spacer|suspension kit)\b/i],
    excluded: ["frontLowerArms", "frontLowerArmShims"],
    reason: "Upper arm dropdowns only accept actual upper arms or upper arm sets."
  },
  rearUpperArms: {
    productType: "upper arm",
    required: [/\b(upper arm|upper link)\b/i],
    blocked: [/\b(mount|shaft|shim|spacer|suspension kit)\b/i],
    excluded: ["rearLowerArms", "rearLowerArmShims"],
    reason: "Upper arm dropdowns only accept actual upper arms or upper arm sets."
  },
  frontToeBlocks: {
    productType: "toe block / suspension mount",
    required: [/\b(toe block|sus-?mount|suspension mount|arm mount|lower sus)\b/i],
    blocked: [/\b(lower arm|hinge pin|shim set)\b/i],
    excluded: ["frontLowerArms", "frontLowerArmShims"],
    reason: "Toe block dropdowns only accept suspension mounts or toe blocks."
  },
  rearToeBlocks: {
    productType: "toe block / suspension mount",
    required: [/\b(toe block|sus-?mount|suspension mount|arm mount|lower sus)\b/i],
    blocked: [/\b(lower arm|hinge pin|shim set)\b/i],
    excluded: ["rearLowerArms", "rearLowerArmShims"],
    reason: "Toe block dropdowns only accept suspension mounts or toe blocks."
  },
  frontLowerArmShims: {
    productType: "shim / spacer set",
    required: [/\b(shim|spacer)\b/i],
    blocked: [/\b(lower arm|upper arm|kit)\b/i],
    excluded: ["frontLowerArms"],
    reason: "Shim dropdowns only accept standalone shim or spacer sets."
  },
  rearLowerArmShims: {
    productType: "shim / spacer set",
    required: [/\b(shim|spacer)\b/i],
    blocked: [/\b(lower arm|upper arm|kit)\b/i],
    excluded: ["rearLowerArms"],
    reason: "Shim dropdowns only accept standalone shim or spacer sets."
  },
  dampers: {
    productType: "damper / shock part",
    required: [/\b(damper|shock|piston|shaft|rebuild)\b/i],
    blocked: [/\b(spring set|chassis kit|complete kit)\b/i],
    excluded: ["springs", "chassis"],
    reason: "Damper dropdowns only accept shocks, dampers, and shock rebuild parts."
  },
  springs: {
    productType: "spring set",
    required: [/\b(spring)\b/i],
    blocked: [/\b(damper|shock|chassis kit|complete kit)\b/i],
    excluded: ["dampers", "chassis"],
    reason: "Spring dropdowns only accept standalone spring sets."
  },
  decks: {
    productType: "deck / chassis plate",
    required: [/\b(deck|chassis plate|main chassis|upper deck|lower deck|side deck|conversion plate)\b/i],
    blocked: [/\b(complete kit|rtr|readyset)\b/i],
    excluded: ["chassis"],
    reason: "Deck dropdowns only accept plates, decks, and conversion plates."
  }
};

const accessoryCategoryHints: Array<{ category: ProductCatalogCategory; pattern: RegExp; productType: string; excluded: string[] }> = [
  { category: "motorMounts", pattern: /\bmotor mount|motor plate\b/i, productType: "motor mount", excluded: ["motors"] },
  { category: "escMounts", pattern: /\besc mount|esc plate\b/i, productType: "ESC mount", excluded: ["escs"] },
  { category: "fanCovers", pattern: /\bfan cover\b/i, productType: "fan cover", excluded: ["escs", "motors"] },
  { category: "motorAccessories", pattern: /\bmotor fan|cooling fan\b/i, productType: "motor accessory", excluded: ["motors"] },
  { category: "servoHorns", pattern: /\bservo horn\b/i, productType: "servo horn", excluded: ["servos"] },
  { category: "servoMounts", pattern: /\bservo mount\b/i, productType: "servo mount", excluded: ["servos"] },
  { category: "gyroAccessories", pattern: /\bgyro mount|gyro tape\b/i, productType: "gyro accessory", excluded: ["gyros"] },
  { category: "wheelHexes", pattern: /\bwheel hex|hex hub\b/i, productType: "wheel hex", excluded: ["frontWheels", "rearWheels"] },
  { category: "electronicsBundles", pattern: /\b(combo|bundle|set with esc|esc\s*(?:and|\+|\/)\s*motor|motor\s*(?:and|\+|\/)\s*esc)\b/i, productType: "electronics bundle", excluded: ["escs", "motors", "servos", "gyros"] },
  { category: "mountedWheelTireSets", pattern: /\bmounted|pre-mounted|tire.*wheel|wheel.*tire\b/i, productType: "mounted wheel/tire set", excluded: ["frontWheels", "rearWheels", "tires"] },
  { category: "suspensionKits", pattern: /\bsuspension kit\b/i, productType: "suspension kit", excluded: ["frontLowerArms", "rearLowerArms", "frontUpperArms", "rearUpperArms"] }
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function normalizeProductValue(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function slugPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function titleCase(value: string) {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase()).replace(/\bEsc\b/g, "ESC").replace(/\bRpm\b/g, "RPM").replace(/\bKv\b/g, "KV");
}

function cleanBrandFromName(value: string, brand: string) {
  const cleanBrand = brand.trim();
  if (!cleanBrand) return value;
  return value.replace(new RegExp(`\\b${cleanBrand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"), "").replace(/\s+/g, " ").trim();
}

function cleanSideAgnosticName(value: string) {
  return value
    .replace(/\(\s*(?:left|right)\s+(?:or|\/)\s+(?:left|right)\s*\)/gi, " ")
    .replace(/\(\s*(?:left|right)\s+side\s*\)/gi, " ")
    .replace(/\b(?:left|right)\s+(?:or|\/)\s+(?:left|right)\b/gi, " ")
    .replace(/\b(?:left|right)\s+side\b/gi, " ")
    .replace(/\b(?:lh|rh|l\/h|r\/h)\b/gi, " ")
    .replace(/\s*[-â€“â€”]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripPartNumber(value: string, partNumber: string) {
  if (!partNumber) return value;
  return value.replace(new RegExp(`\\(?\\b${partNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b\\)?`, "gi"), "").replace(/\s+/g, " ").trim();
}

function cleanKnownProductName(value: string, brand: string, partNumber: string, category?: ProductCatalogCategory) {
  const name = normalizeProductValue(value);
  const cleanBrand = normalizeProductValue(brand);
  const cleanPart = partNumber.trim().toUpperCase();
  if (cleanBrand === "overdose" && category === "dampers" && /\bhg4\b/.test(name)) {
    const detectedPart = cleanPart.match(/\bOD39(?:00|01|02)\b/i)?.[0]?.toUpperCase() ?? value.match(/\bOD39(?:00|01|02)\b/i)?.[0]?.toUpperCase() ?? "";
    const color = /\bblack\b/.test(name) || detectedPart === "OD3902" ? "Black" : /\bred\b/.test(name) || detectedPart === "OD3901" ? "Red" : /\bpurple\b/.test(name) || detectedPart === "OD3900" ? "Purple" : "";
    return ["HG4 Shock", color].filter(Boolean).join(" ");
  }
  if (cleanBrand === "reve d" && category === "escs") {
    if (/\bbreve\b/.test(name) && /\brd spec\b/.test(name)) return "BREVE RD Spec ESC";
    if (/\belite\b/.test(name) && (/\brd spec\b/.test(name) || /\besc\b/.test(name))) return "ELITE ESC";
  }
  if (cleanBrand === "reve d" && (category === "frontToeBlocks" || category === "rearToeBlocks")) {
    if (/RF\s*TYPE\s*3/i.test(value) || /^RD-301RF3/i.test(cleanPart)) return "RF Sus-Mount #3";
    const number = value.match(/#\s*(\d+)/)?.[1] ?? cleanPart.match(/RD-30[01]-(\d)T?$/i)?.[1];
    const type = /\btk\b/i.test(value) || /T$/i.test(cleanPart) ? "TK Type " : "";
    const series = /^RD-301/i.test(cleanPart) ? "SE " : "";
    if (number) return `${series}${type}Toe Block #${number}`;
  }
  if (cleanBrand === "reve d" && (category === "frontLowerArms" || category === "rearLowerArms")) {
    if (/^RD-020-26$/i.test(cleanPart)) return "HT Rear Lower Arm 42mm 2.6deg";
    if (/^RD-020-0$/i.test(cleanPart)) return "HT Rear Lower Arm 42mm";
    if (/^RD-021-0$/i.test(cleanPart)) return "HT Rear Lower Arm 45mm RDX";
    if (/^RD-009-45$/i.test(cleanPart)) return "HT Rear Lower Arm 45mm YD-2";
    if (/^RD-009-48$/i.test(cleanPart)) return "HT Rear Lower Arm 48mm YD-2";
    if (/^RD-009-51$/i.test(cleanPart)) return "HT Rear Lower Arm 51mm YD-2";
    if (/^RD-022-26$/i.test(cleanPart)) return "HT Rear Lower Arm 42mm Sway 2.6deg";
    if (/^RD-002$/i.test(cleanPart)) return "ASL Lower Arms";
  }
  if (cleanBrand === "yokomo" && category === "servos") {
    if (/\bSP-?02BTS\b/i.test(cleanPart) || /\bsp\s*02bts\b/i.test(name)) return "SP-02BTS Servo";
    if (/\bSP-?02D\s*V?2\b/i.test(cleanPart) || /\bsp\s*02d\s*v?2\b/i.test(name) || /\bsp02dv2\b/i.test(name)) return "SP-02D V2 Servo";
    if (/\bSP-?03D\s*V?2\b/i.test(cleanPart) || /\bsp\s*03d\s*v?2\b/i.test(name) || /\bsp03d\s*v?2\b/i.test(name)) return "SP-03D V2 Servo";
  }
  return "";
}

function cleanWheelDisplayName(value: string) {
  return value
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\b[A-Z]{1,4}-?\d{2,}[A-Z0-9.-]*\b/gi, "")
    .replace(/\b\d+(?:\.\d+)?\s*mm(?:\s*[-/]\s*\d+(?:\.\d+)?\s*mm)?\b/gi, "")
    .replace(/\b\d+(?:\.\d+)?\s*mm\s+OFFSET\b/gi, "")
    .replace(/\bOFF(?:SET)?\s*[+/-]?\s*\d+(?:\.\d+)?\b/gi, "")
    .replace(/\b1[-/ ]?10\b|\b1\/10\b/gi, "")
    .replace(/\bOUTLET:\s*/gi, "")
    .replace(/\bDRIFT\s+(RIMS?|WHEELS?)\b/gi, "Drift Wheel")
    .replace(/\bRIMS?\b/gi, "Wheel")
    .replace(/\bWHEELS?\s+WHEEL\b/gi, "Wheel")
    .replace(/\bWHEEL\s+WHEEL\b/gi, "Wheel")
    .replace(/\s*[-–—]\s*$/g, "")
    .replace(/^\s*[-–—]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const wheelColorWords = [
  "black candy red",
  "black candy purple",
  "bronze gun metal",
  "bronze gray metallic",
  "gold metal",
  "high gloss black",
  "matte black",
  "matte silver",
  "matte white",
  "pure white",
  "candy gold",
  "candy red",
  "black chrome",
  "gunmetal",
  "gun metal",
  "bronze",
  "chrome",
  "silver",
  "white",
  "yellow",
  "purple",
  "green",
  "gold",
  "black",
  "red"
];

function colorFromWheelName(value: string) {
  const normalized = normalizeProductValue(value);
  const found = wheelColorWords.find((color) => new RegExp(`\\b${color.replace(/\s+/g, "\\s+")}\\b`, "i").test(normalized));
  return found ? titleCase(found) : "";
}

function offsetsFromWheelName(value: string) {
  const found = Array.from(value.matchAll(/\b(?:off(?:set)?\s*)?([+-]?\d+(?:\.\d+)?)\s*mm\b|\b([+-]?\d+(?:\.\d+)?)\s*offset\b/gi))
    .map((match) => match[1] || match[2])
    .filter(Boolean)
    .map((offset) => `${offset.replace(/^\+/, "")}mm`);
  return Array.from(new Set(found));
}

function skusFromModelNumber(value: string) {
  return Array.from(new Set(value.replace(/\s+\/\s+/g, " ").split(/\s+/).filter(looksLikePartNumber)));
}

function packCountFromName(value: string) {
  const match = value.match(/\b([24])\s*(?:pack|pc|pcs|pieces)\b/i);
  return match ? `${match[1]}-pack` : "";
}

function wheelBaseName(value: string) {
  let label = cleanWheelDisplayName(value);
  wheelColorWords.forEach((color) => {
    label = label.replace(new RegExp(`\\b${color.replace(/\s+/g, "\\s+")}\\b`, "gi"), " ");
  });
  return label
    .replace(/\b(black|white|red|blue|purple|yellow|green|gold|silver|chrome|bronze|gunmetal)\b/gi, " ")
    .replace(/\b(color|colour)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanElectronicsDisplayName(value: string, category?: ProductCatalogCategory) {
  let label = value
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/\([^)]*?(?:low profile|low-profile|size|kg|coreless|brushless|digital|programmable|cls motor|drift spec|rwd drift|high torque)[^)]*?\)/gi, " ")
    .replace(/\b(?:BLUE|RED|BLACK|PURPLE|WHITE|SILVER|GOLD|GREEN|ORANGE)\b/gi, " ")
    .replace(/\b(?:low profile|low-profile|coreless|brushless|digital|programmable|high torque|drift spec|rwd drift|aluminum|titanium|for drift)\b/gi, " ")
    .replace(/\b\d+(?:\.\d+)?\s*@\s*\d+(?:\.\d+)?\s*kg\b/gi, " ")
    .replace(/\b\d+(?:\.\d+)?\s*kg\b/gi, " ")
    .replace(/\bservo\s*[-–—]\s*/gi, " ")
    .replace(/\s*[-â€“â€”]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const normalized = normalizeProductValue(label);
  if (category === "servos") {
    if (/\brs st pro\b/.test(normalized)) label = "RS-ST PRO Servo";
    else if (/\brs stm\b|\brs st\b/.test(normalized)) label = "RS-ST Servo";
    else if (/\bsp 02d v2\b|\bsp02dv2\b/.test(normalized)) label = "SP-02D V2 Servo";
    else if (/\bsp 02bts\b/.test(normalized)) label = "SP-02BTS Servo";
    else if (/\bsp 03d v2\b|\bsp03d v2\b|\bsp 03dv2\b|\bsp03dv2\b/.test(normalized)) label = "SP-03D V2 Servo";
    else if (/\bpgs cl ii\b/.test(normalized)) label = "PGS-CL II Servo";
    else if (/\bhps ct701\b|\bct701\b/.test(normalized)) label = "HPS-CT701 Servo";
    else if (/\bhps ct700\b|\bct700\b/.test(normalized)) label = "HPS-CT700 Servo";
    else if (/\bhps cd700\b|\bcd700\b/.test(normalized)) label = "HPS-CD700 Servo";
    else if (/\bbls571sv\b|\bbls571\b/.test(normalized)) label = "BLS571SV Servo";
    else if (/\bs9571sv\b|\bs9571\b/.test(normalized)) label = "S9571SV Servo";
  }
  if (category === "escs") {
    if (/\bxarvis xx\b/.test(normalized)) label = "XARVIS XX ESC";
    else if (/\bxarvis\b/.test(normalized)) label = "XARVIS ESC";
    else if (/\brad\b/.test(normalized)) label = "RAD ESC";
  }
  if (category === "capacitors") {
    if (/\bchev(?:a|e)lier blaze\b/.test(normalized)) label = "Chevalier Blaze Capacitor";
    else if (/\btrace bector\b/.test(normalized)) label = "Trace Bector Capacitor";
    else if (/\bchev(?:a|e)lier trace\b|\btrace\b/.test(normalized)) label = "Chevalier Trace Capacitor";
    else if (/\bpulse master\b/.test(normalized)) label = "Pulse Master";
    else if (/\bsurge killer\b/.test(normalized)) label = "Surge Killer Capacitor";
  }

  return titleCase(label || value);
}

export function generateSimplifiedName(input: Pick<ProductCatalogItem, "brand" | "productName" | "modelNumber" | "partNumber" | "category">) {
  const partNumber = (input.partNumber || input.modelNumber || "").trim().toUpperCase();
  const known = cleanKnownProductName(input.productName, input.brand, partNumber, input.category);
  if (known) return known;

  let label = stripPartNumber(input.productName, partNumber);
  label = cleanBrandFromName(label, input.brand)
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\([^)]*?(pcs?|pieces|set of|for 1\/10|rc drift car|rwd drift|plastic model)[^)]*?\)/gi, "")
    .replace(/\b(for|fit|fits|compatible with)\s+.+$/gi, "")
    .replace(/\b1[-/ ]?10\b|\b1\/10\b/gi, "")
    .replace(/\bRC\b|\bR\/C\b/gi, "")
    .replace(/\bDrift Car\b|\bRWD Drift\b/gi, "")
    .replace(/\bReplacement Option Part(s)?\b|\bOption Part(s)?\b|\bUpgrade Part(s)?\b|\bHigh Performance\b|\bGenuine\b|\bPlastic Model\b/gi, "")
    .replace(/\bElectronic Speed Control\b|\bSpeed Controller\b/gi, "ESC")
    .replace(/\bBrushless ESC ESC\b/gi, "Brushless ESC")
    .replace(/\bRims?\b/gi, "Wheels")
    .replace(/\bTyres?\b/gi, "Tires")
    .replace(/\bW\/\s*/gi, "with ")
    .replace(/\bwith\s+12mm\s+hex\b/gi, "")
    .replace(/\bBLACK PURPLE RED\b/gi, "")
    .replace(/\s*[-–]\s*$/g, "")
    .replace(/^\s*[-–]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (input.category === "frontWheels" || input.category === "rearWheels") {
    label = cleanWheelDisplayName(label);
  }
  if (sideAgnosticCategories.has(input.category)) {
    label = cleanSideAgnosticName(label);
  }
  if (input.category === "servos" || input.category === "escs" || input.category === "capacitors") {
    label = cleanElectronicsDisplayName(label, input.category);
  }
  if (input.category === "gyros" && !/\bgyro\b/i.test(label)) label = `${label} Gyro`;
  if (input.category === "escs" && !/\besc\b/i.test(label)) label = `${label} ESC`;
  if (input.category === "motors" && !/\bmotor\b/i.test(label)) label = `${label} Motor`;
  if ((input.category === "frontWheels" || input.category === "rearWheels") && !/\bwheel/i.test(label)) label = `${label} Wheel`;
  if (input.category === "tires" && !/\btire/i.test(label)) label = `${label} Tire`;

  return titleCase(label || input.productName);
}

export function catalogDisplayName(simplifiedName: string, partNumber?: string) {
  const cleanName = simplifiedName.trim();
  const cleanPart = (partNumber ?? "").trim().toUpperCase();
  if (!cleanPart || normalizeProductValue(cleanName).includes(normalizeProductValue(cleanPart))) return cleanName;
  return `${cleanName} (${cleanPart})`;
}

function cleanCatalogDescription(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\bSourced wheel\/rim product\.\s*/i, "Wheel catalog item. ")
    .replace(/\bVerify fitment and offset before ordering\./i, "Check fitment, offset, and body clearance.")
    .trim();
}

function hasAny(patterns: RegExp[], value: string) {
  return patterns.some((pattern) => pattern.test(value));
}

function tuneSelectorHiddenReason(item: ProductCatalogItem) {
  const name = normalizeProductValue(`${item.productName} ${item.simplifiedName ?? ""}`);
  const rawName = `${item.productName} ${item.simplifiedName ?? ""}`;

  const hardwarePattern = /\b(pin set|pins?|screws?|nuts?|washers?|bearings?|bushings?|ball cups?|rod ends?|o rings?|o-rings?|x rings?|x-rings?|hardware|tool|decal|tape)\b/i;
  if (hardwarePattern.test(rawName)) return "Replacement hardware/support item, not a main installed setup part.";

  const supportPattern = /\b(adapter|connector|post|posts|bracket|protector|cover|cap|retainer|spring end)\b/i;
  const mountPattern = /\bmount|mounts|mounting\b/i;
  const shaftPattern = /\bshaft|shafts\b/i;
  const shimPattern = /\bshim|shims|spacer|spacers\b/i;

  if ((item.category === "frontUpperArms" || item.category === "rearUpperArms") && (!/\bupper arm|upper link\b/i.test(rawName) || hasAny([shaftPattern, mountPattern, shimPattern], rawName))) {
    return "Not a complete upper arm/upper link selectable setup part.";
  }
  if ((item.category === "frontLowerArms" || item.category === "rearLowerArms") && (!/\blower arm|h arm|a arm\b/i.test(rawName) || hasAny([shimPattern], rawName))) {
    return "Not a complete lower arm selectable setup part.";
  }
  if (item.category === "frontKnuckles" && !/\bknuckle|steering block|upright\b/i.test(rawName)) return "Not a front steering knuckle/upright.";
  if (item.category === "rearHubCarriers" && !/\brear hub|hub carrier|rear upright|rear knuckle|upright\b/i.test(rawName)) return "Not a rear hub carrier/upright.";
  if ((item.category === "frontToeBlocks" || item.category === "rearToeBlocks") && /\b(upper arm mount|motor mount|esc mount|servo mount|battery mount|body mount|brace support|connector|post|adapter)\b/i.test(rawName)) {
    return "Mount/support hardware, not a toe block or suspension mount used for setup.";
  }
  if (item.category === "frontToeBlocks" || item.category === "rearToeBlocks") return "";

  if (item.category === "dampers" && hasAny([shaftPattern, /\bpiston|pistons|oil|fluid\b/i, supportPattern], rawName)) {
    return "Shock service/accessory item, not a complete damper/shock.";
  }
  if (item.category === "decks" && (supportPattern.test(rawName) || mountPattern.test(rawName)) && !/\bmain chassis|chassis plate|upper deck set|deck set|carbon upper deck|graphite upper deck\b/i.test(rawName)) {
    return "Deck support/mount hardware, not a main chassis deck.";
  }
  if ((item.category === "frontWheels" || item.category === "rearWheels") && /\bmounted|pre mounted|pre-mounted|tire set|tyre set|wheel hub|axle|hex hub\b/i.test(rawName)) {
    return "Not a standalone wheel/rim.";
  }
  if (item.category === "tires" && /\bmounted|pre mounted|pre-mounted|wheel set|rim set\b/i.test(rawName)) return "Not a standalone tire.";
  if (item.category === "escs" && /\bmicro\b|\brc28\b/i.test(rawName)) return "Micro/RTR-scale ESC hidden from 1/10 drift tune selectors.";
  if (item.category === "escs" && /\bmount|plate|fan|cover|capacitor|program card|programmer\b/i.test(rawName)) return "ESC accessory, not a standalone ESC.";
  if (item.category === "servos" && /\bmicro\b|\brc28\b/i.test(rawName)) return "Micro/RTR-scale servo hidden from 1/10 drift tune selectors.";
  if (item.category === "servos" && /\b(screws?|horn|mount|saver|gears?|case|case set|grommet|bushing|bulkhead|steering kit|direct drive steering)\b/i.test(rawName)) return "Servo support hardware/accessory, not a standalone steering servo.";
  if (item.category === "motors" && /\bmicro\b|\brc28\b|\b1-28\b/i.test(rawName)) return "Micro/RTR-scale motor hidden from 1/10 drift tune selectors.";
  if (item.category === "motors" && /\bconversion|spare motor|motor mount|mount|plate|fan|rotor|stator|screw\b/i.test(rawName)) return "Motor accessory or conversion hardware, not a standalone motor.";
  if (item.category === "gyros" && /\bmount|tape|plate\b/i.test(rawName)) return "Gyro accessory, not a standalone gyro.";
  if (shimPattern.test(rawName) && item.category !== "frontLowerArmShims" && item.category !== "rearLowerArmShims") {
    return "Shim/spacer item belongs in a shim/spacer category.";
  }
  if (supportPattern.test(rawName) && !["motorMounts", "escMounts", "servoMounts", "bodyMounts", "batteryMounts", "shockAccessories", "motorAccessories", "escAccessories", "servoAccessories", "gyroAccessories"].includes(item.category)) {
    return "Support/replacement item hidden from main tune selectors.";
  }
  if (name.includes("rtr") || name.includes("readyset") || name.includes("ready set")) {
    return "RTR/readyset item hidden from standalone part selectors.";
  }
  return "";
}

function looksLikePartNumber(value: string) {
  const clean = value.trim();
  if (!clean) return false;
  if (/^(and|or|set|pair|for|with)$/i.test(clean)) return false;
  return /^(?=.*\d)[A-Z0-9][A-Z0-9.-]*[A-Z0-9]$/i.test(clean);
}

const optionWords = ["black", "blue", "red", "purple", "silver", "gold", "white", "bronze", "gunmetal", "chrome", "green", "orange", "matte black", "gloss black", "soft", "medium", "hard", "6mm", "7mm", "8mm", "9mm"];

function optionsFromName(productName: string, count: number) {
  const found: string[] = [];
  const lowerName = productName.toLowerCase();
  optionWords.forEach((word) => {
    if (new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(lowerName) && !found.some((item) => normalize(item) === normalize(word))) {
      found.push(titleCase(word));
    }
  });
  return found.length === count ? found : [];
}

function splitModelNumbers(modelNumber: string) {
  const parts = modelNumber.replace(/\s+\/\s+/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (parts.length < 2 || !parts.every(looksLikePartNumber)) return [];
  return Array.from(new Set(parts));
}

function expandBundledCatalogOptions(item: ProductCatalogItem): ProductCatalogItem[] {
  const cleanBrand = normalizeProductValue(item.brand);
  if (cleanBrand === "reve d" && (item.category === "frontToeBlocks" || item.category === "rearToeBlocks")) {
    const numbers = Array.from(new Set(Array.from(item.productName.matchAll(/#\s*(\d+)/g)).map((match) => match[1])));
    if (numbers.length > 1) {
      const baseModel = item.modelNumber.trim().toUpperCase();
      return numbers.map((number) => {
        const partNumber = baseModel.includes("RD-301")
          ? `RD-301-${number}${/\bTK\b/i.test(item.productName) ? "T" : ""}`
          : baseModel.includes("RD-300")
            ? `RD-300-${number}`
            : `${baseModel}-${number}`;
        return {
          ...item,
          id: `${item.id}-${number}`,
          productName: item.productName.replace(/#\s*\d+(?:\s*#\s*\d+)*/g, `#${number}`),
          modelNumber: partNumber,
          partNumber,
          notes: [item.notes, `Split from bundled toe block option #${number}.`].filter(Boolean).join(" ")
        };
      });
    }
  }

  if ((item.category === "frontWheels" || item.category === "rearWheels") && /\b\d+(?:\.\d+)?\s*mm\b.*\b\d+(?:\.\d+)?\s*mm\b/i.test(item.productName)) {
    return [item];
  }

  const partNumbers = splitModelNumbers(item.modelNumber);
  if (partNumbers.length < 2) return [item];
  const optionLabels = optionsFromName(item.productName, partNumbers.length);
  return partNumbers.map((partNumber, index) => ({
    ...item,
    id: `${item.id}-${slugPart(partNumber)}`,
    productName: optionLabels[index] ? `${item.productName} - ${optionLabels[index]} (${partNumber})` : `${item.productName} - ${partNumber}`,
    modelNumber: partNumber,
    partNumber,
    notes: [item.notes, optionLabels[index] ? `Split from bundled retailer option: ${optionLabels[index]}.` : "Split from bundled retailer option."].filter(Boolean).join(" ")
  }));
}

export function validateCatalogItemCategory(item: ProductCatalogItem): ProductCatalogItem {
  const name = `${item.productName} ${item.modelNumber} ${item.notes}`;
  const excludedCategories = new Set(item.excludedCategories ?? []);
  let category = item.category;
  let productType = item.productType || "";
  let needsReview = Boolean(item.needsReview);
  let confidence: ProductCatalogItem["confidence"] = item.confidence ?? (item.sourceUrl ? "medium" : "low");
  let categorizationReason = item.categorizationReason || "";

  if (/\b(rtr|readyset|ready set|complete kit|chassis kit|car kit|roller kit)\b/i.test(name)) {
    if (["gyros", "escs", "motors", "servos", "frontWheels", "rearWheels", "tires"].includes(category)) {
      category = "chassis";
      excludedCategories.add("gyros");
      excludedCategories.add("escs");
      excludedCategories.add("motors");
      excludedCategories.add("servos");
      excludedCategories.add("frontWheels");
      excludedCategories.add("rearWheels");
      excludedCategories.add("tires");
      productType = "RTR / chassis kit";
      categorizationReason = "This is a complete car/chassis kit. Included electronics, wheels, or tires do not make it a standalone part.";
      confidence = item.sourceUrl ? "high" : "medium";
    }
  }

  accessoryCategoryHints.forEach((hint) => {
    if (hint.pattern.test(name) && category !== hint.category) {
      if (hint.excluded.includes(category)) {
        category = hint.category;
        productType = hint.productType;
        hint.excluded.forEach((excluded) => excludedCategories.add(excluded));
        categorizationReason = `${titleCase(hint.productType)} is an accessory/bundle category, not a standalone ${item.category} product.`;
        confidence = item.sourceUrl ? "high" : "medium";
      }
    }
  });

  const rule = standaloneCategoryRules[category];
  if (rule) {
    const blocked = rule.blocked.some((pattern) => pattern.test(name));
    const matchesRequired = rule.required.some((pattern) => pattern.test(name));
    productType ||= rule.productType;
    if (blocked || !matchesRequired) {
      needsReview = true;
      confidence = "low";
      rule.excluded.forEach((excluded) => excludedCategories.add(excluded));
      categorizationReason ||= blocked
        ? `${rule.reason} This item contains terms that usually indicate a kit, bundle, mount, accessory, or wrong category.`
        : `${rule.reason} This item does not clearly match the standalone product type.`;
    } else {
      categorizationReason ||= rule.reason;
      confidence = item.sourceUrl ? "high" : confidence;
    }
  }

  const verified = Boolean(item.verified && item.sourceUrl && confidence !== "low" && !needsReview);
  return {
    ...item,
    category,
    productType,
    confidence,
    needsReview,
    verified,
    categorizationReason,
    excludedCategories: Array.from(excludedCategories)
  };
}

export function normalizeCatalogItem(item: ProductCatalogItem): ProductCatalogItem {
  const partNumber = (item.partNumber || item.modelNumber || "").trim().toUpperCase();
  const simplifiedName = item.simplifiedName?.trim() || generateSimplifiedName({ ...item, partNumber });
  const displayName = catalogDisplayName(simplifiedName, partNumber);
  const imageOverride = item.sourceUrl ? productImageOverrides[item.sourceUrl] : undefined;
  const validated = validateCatalogItemCategory({
    ...item,
    partNumber,
    modelNumber: item.modelNumber || partNumber,
    simplifiedName,
    displayName,
    sourceName: item.sourceName || (item.sourceUrl ? new URL(item.sourceUrl, "https://example.com").hostname.replace(/^www\./, "") : ""),
    imageUrl: item.imageUrl || imageOverride?.imageUrl,
    imageSourceUrl: item.imageSourceUrl || imageOverride?.imageSourceUrl,
    imageSourceKind: item.imageSourceKind || imageOverride?.imageSourceKind,
    imageLastCheckedAt: item.imageLastCheckedAt || imageOverride?.imageLastCheckedAt,
    imageNeedsReview: item.imageNeedsReview ?? Boolean(imageOverride),
    notes: cleanCatalogDescription(item.notes ?? ""),
    excludedCategories: item.excludedCategories ?? [],
    confidence: item.confidence ?? (item.sourceUrl ? "medium" : "low"),
    needsReview: item.needsReview ?? false,
    verified: Boolean(item.verified && item.sourceUrl)
  });
  const reasonHidden = item.reasonHidden || tuneSelectorHiddenReason(validated);
  return {
    ...validated,
    hiddenFromTuneBuilder: item.hiddenFromTuneBuilder ?? Boolean(reasonHidden),
    tuneSelectable: item.tuneSelectable ?? !reasonHidden,
    reasonHidden
  };
}

function catalogIdentity(item: ProductCatalogItem) {
  const brand = normalizeProductValue(item.brand);
  const part = normalizeProductValue(item.partNumber || item.modelNumber || "");
  const cleanName = normalizeProductValue(catalogOptionLabel(item));
  return part ? `${item.category}|${brand}|part:${part}` : `${item.category}|${brand}|name:${cleanName}`;
}

const sideAgnosticCategories = new Set<ProductCatalogCategory>(["frontUpperArms", "rearUpperArms", "frontLowerArms", "rearLowerArms"]);
const wheelCategories = new Set<ProductCatalogCategory>(["frontWheels", "rearWheels"]);
const electronicsCanonicalCategories = new Set<ProductCatalogCategory>(["servos", "escs", "capacitors"]);

function sideAgnosticCatalogIdentity(item: ProductCatalogItem) {
  if (!sideAgnosticCategories.has(item.category)) return "";
  const label = normalizeProductValue(item.simplifiedName || item.productName)
    .replace(/\b(left|right|lh|rh|l h|r h|l side|r side|left side|right side)\b/g, " ")
    .replace(/\b(left or right|right or left|left right|right left)\b/g, " ")
    .replace(/\b(l\/r|r\/l)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!label) return "";
  return `${item.category}|${normalizeProductValue(item.brand)}|side-agnostic:${label}|${item.compatibleChassis.map(normalizeProductValue).sort().join(",")}`;
}

function wheelCatalogIdentity(item: ProductCatalogItem) {
  if (!wheelCategories.has(item.category)) return "";
  const label = normalizeProductValue(wheelBaseName(item.simplifiedName || item.productName))
    .replace(/\b(front|rear)\b/g, " ")
    .replace(/\b(offset|off)\b/g, " ")
    .replace(/\bwheel|wheels|rim|rims\b/g, " wheel ")
    .replace(/\s+/g, " ")
    .trim();
  if (!label) return "";
  return `${item.category}|${normalizeProductValue(item.brand)}|wheel:${label}|${item.compatibleChassis.map(normalizeProductValue).sort().join(",")}`;
}

function preferredCatalogItem(current: ProductCatalogItem, next: ProductCatalogItem) {
  if (current.needsReview && !next.needsReview) return next;
  if (!current.needsReview && next.needsReview) return current;
  if (!current.verified && next.verified) return next;
  if (current.verified && !next.verified) return current;
  if ((next.displayName ?? "").length + 12 < (current.displayName ?? "").length) return next;
  if (!current.sourceUrl && next.sourceUrl) return next;
  if ((next.notes?.length ?? 0) > (current.notes?.length ?? 0) && current.userAdded === next.userAdded) return next;
  return current;
}

function wheelVariantFromItem(item: ProductCatalogItem): ProductCatalogVariant {
  const color = colorFromWheelName(item.productName);
  const offsets = offsetsFromWheelName(item.productName);
  const skus = skusFromModelNumber(item.partNumber || item.modelNumber || "");
  const packCount = packCountFromName(item.productName);
  const displayBits = [color, offsets.join(" / "), packCount].filter(Boolean);
  return {
    id: slugPart([color || "standard", offsets.join("-") || "", packCount || "", skus.join("-") || item.id].filter(Boolean).join("-")),
    color: color || undefined,
    offset: offsets.join(" / ") || undefined,
    packCount: packCount || undefined,
    sku: skus.join(" / ") || (item.partNumber || item.modelNumber || undefined),
    displayName: displayBits.join(" / ") || "Standard",
    sourceProductName: item.productName,
    sourceUrl: item.sourceUrl
  };
}

function mergeVariants(existing: ProductCatalogVariant[] = [], next: ProductCatalogVariant[] = []) {
  const variants = new Map<string, ProductCatalogVariant>();
  [...existing, ...next].forEach((variant) => {
    const key = [normalizeProductValue(variant.color ?? ""), normalizeProductValue(variant.offset ?? ""), normalizeProductValue(variant.packCount ?? ""), normalizeProductValue(variant.sku ?? "")].join("|");
    variants.set(key, { ...variants.get(key), ...variant });
  });
  return Array.from(variants.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function withMergedCatalogMetadata(current: ProductCatalogItem, next: ProductCatalogItem) {
  const preferred = preferredCatalogItem(current, next);
  const other = preferred === current ? next : current;
  return {
    ...preferred,
    aliases: Array.from(new Set([...(preferred.aliases ?? []), ...(other.aliases ?? []), other.productName, other.displayName, other.simplifiedName].filter((value): value is string => Boolean(value)))),
    legacyIds: Array.from(new Set([...(preferred.legacyIds ?? []), ...(other.legacyIds ?? []), other.id].filter(Boolean))),
    variants: mergeVariants(preferred.variants, other.variants)
  };
}

function canonicalizeWheelItem(item: ProductCatalogItem) {
  if (!wheelCategories.has(item.category)) return item;
  const baseName = wheelBaseName(item.simplifiedName || item.productName);
  const variant = wheelVariantFromItem(item);
  const canonicalId = `${item.category}-${slugPart(item.brand)}-${slugPart(baseName || item.simplifiedName || item.productName)}`;
  const partNumber = variant.sku || item.partNumber || item.modelNumber || "";
  return {
    ...item,
    id: canonicalId,
    canonicalProductId: canonicalId,
    canonicalVariantId: variant.id,
    simplifiedName: baseName || item.simplifiedName,
    displayName: baseName || item.displayName,
    productName: baseName || item.productName,
    partNumber,
    modelNumber: partNumber,
    variants: mergeVariants(item.variants, [variant]),
    aliases: Array.from(new Set([...(item.aliases ?? []), item.productName, item.displayName, item.simplifiedName].filter((value): value is string => Boolean(value)))),
    legacyIds: Array.from(new Set([...(item.legacyIds ?? []), item.id].filter(Boolean)))
  };
}

function canonicalizeSideAgnosticItem(item: ProductCatalogItem) {
  if (!sideAgnosticCategories.has(item.category)) return item;
  const cleanName = cleanSideAgnosticName(item.simplifiedName || item.productName);
  if (!cleanName) return item;
  const canonicalId = `${item.category}-${slugPart(item.brand)}-${slugPart(cleanName)}-${slugPart(item.compatibleChassis.join("-"))}`;
  return {
    ...item,
    id: canonicalId,
    canonicalProductId: canonicalId,
    simplifiedName: cleanName,
    displayName: catalogDisplayName(cleanName, item.partNumber || item.modelNumber),
    productName: cleanName,
    aliases: Array.from(new Set([...(item.aliases ?? []), item.productName, item.displayName, item.simplifiedName].filter((value): value is string => Boolean(value)))),
    legacyIds: Array.from(new Set([...(item.legacyIds ?? []), item.id].filter(Boolean)))
  };
}

function canonicalizeElectronicsItem(item: ProductCatalogItem) {
  if (!electronicsCanonicalCategories.has(item.category)) return item;
  const cleanName = cleanElectronicsDisplayName(item.simplifiedName || item.productName, item.category);
  if (!cleanName) return item;
  const canonicalId = `${item.category}-${slugPart(item.brand)}-${slugPart(cleanName)}`;
  return {
    ...item,
    id: canonicalId,
    canonicalProductId: canonicalId,
    simplifiedName: cleanName,
    displayName: catalogDisplayName(cleanName, item.partNumber || item.modelNumber),
    productName: cleanName,
    aliases: Array.from(new Set([...(item.aliases ?? []), item.productName, item.displayName, item.simplifiedName].filter((value): value is string => Boolean(value)))),
    legacyIds: Array.from(new Set([...(item.legacyIds ?? []), item.id].filter(Boolean)))
  };
}

function uniqueCatalogItems(items: ProductCatalogItem[]) {
  const byId = new Map<string, ProductCatalogItem>();
  items.map(canonicalizeWheelItem).map(canonicalizeSideAgnosticItem).map(canonicalizeElectronicsItem).forEach((item) => {
    const existing = byId.get(item.id);
    byId.set(item.id, existing ? withMergedCatalogMetadata(existing, item) : item);
  });
  const byIdentity = new Map<string, ProductCatalogItem>();
  Array.from(byId.values()).forEach((item) => {
    const identity = catalogIdentity(item);
    const existing = byIdentity.get(identity);
    byIdentity.set(identity, existing ? withMergedCatalogMetadata(existing, item) : item);
  });
  const bySideAgnosticIdentity = new Map<string, ProductCatalogItem>();
  Array.from(byIdentity.values()).forEach((item) => {
    const identity = wheelCatalogIdentity(item) || sideAgnosticCatalogIdentity(item) || catalogIdentity(item);
    const existing = bySideAgnosticIdentity.get(identity);
    bySideAgnosticIdentity.set(identity, existing ? withMergedCatalogMetadata(existing, item) : item);
  });
  return Array.from(bySideAgnosticIdentity.values()).sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    if (a.needsReview !== b.needsReview) return a.needsReview ? 1 : -1;
    return catalogOptionLabel(a).localeCompare(catalogOptionLabel(b));
  });
}

function localStorageAvailable() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function loadUserCatalogItems(): ProductCatalogItem[] {
  if (!localStorageAvailable()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(USER_CATALOG_KEY) || "[]") as ProductCatalogItem[];
    return Array.isArray(parsed) ? parsed.filter(isCatalogItem).map(normalizeCatalogItem) : [];
  } catch {
    return [];
  }
}

export function saveUserCatalogItems(items: ProductCatalogItem[]) {
  if (!localStorageAvailable()) return;
  window.localStorage.setItem(USER_CATALOG_KEY, JSON.stringify(items.filter((item) => item.userAdded).map(normalizeCatalogItem)));
}

export function deleteUserCatalogItem(itemId: string) {
  saveUserCatalogItems(loadUserCatalogItems().filter((item) => item.id !== itemId));
}

export function getProductCatalog(extraItems: ProductCatalogItem[] = []) {
  return uniqueCatalogItems([...productCatalogSeed, ...loadUserCatalogItems(), ...extraItems].flatMap(expandBundledCatalogOptions).map(normalizeCatalogItem));
}

export function filterProductCatalog(items: ProductCatalogItem[], filters: ProductCatalogFilters = {}) {
  const brand = normalize(filters.brand ?? "");
  const query = normalize(filters.query ?? "");
  const compatibleChassis = normalize(filters.compatibleChassis ?? "");

  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (!filters.includeNeedsReview && item.needsReview) return false;
    if (!filters.includeLowConfidence && item.confidence === "low") return false;
    if (filters.tuneSelectableOnly && item.tuneSelectable === false) return false;
    if (!filters.includeHiddenFromTuneBuilder && item.hiddenFromTuneBuilder) return false;
    if (brand && normalize(item.brand) !== brand) return false;
    if (filters.verifiedOnly && !item.verified) return false;
    if (compatibleChassis && !item.compatibleChassis.some((chassis) => normalize(chassis).includes(compatibleChassis))) return false;
    if (!query) return true;
    return [item.brand, item.productName, item.simplifiedName, item.displayName, item.partNumber, item.modelNumber, item.notes, item.category, item.productType, ...item.compatibleChassis]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

export function productsByCategory(category: ProductCatalogCategory, items = getProductCatalog()) {
  return filterProductCatalog(items, { category });
}

export function productsByBrand(brand: string, items = getProductCatalog()) {
  return filterProductCatalog(items, { brand });
}

export function productsByBrandAndCategory(brand: string, category: ProductCatalogCategory, items = getProductCatalog()) {
  return filterProductCatalog(items, { brand, category });
}

export function catalogOptionLabel(item: ProductCatalogItem) {
  return item.displayName || catalogDisplayName(item.simplifiedName || generateSimplifiedName(item), item.partNumber || item.modelNumber);
}

export function catalogOptionDescription(item: ProductCatalogItem) {
  return cleanCatalogDescription(item.notes);
}

export function catalogCompatibilityMap(items = getProductCatalog()) {
  const map = new Map<string, ProductCatalogItem>();
  items.forEach((item) => {
    [item.id, item.canonicalProductId, ...(item.legacyIds ?? []), ...(item.aliases ?? [])]
      .filter((value): value is string => Boolean(value))
      .forEach((value) => {
        map.set(normalizeProductValue(value), item);
      });
  });
  return map;
}

export function resolveCatalogCompatibility(value: string, items = getProductCatalog()) {
  const key = normalizeProductValue(value);
  if (!key) return undefined;
  return catalogCompatibilityMap(items).get(key);
}

export function catalogBrands(items = getProductCatalog()) {
  return Array.from(new Set(items.map((item) => item.brand).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function catalogBrandsByCategory(category: ProductCatalogCategory, items = getProductCatalog()) {
  return catalogBrands(productsByCategory(category, items));
}

export function createUserCatalogItem(input: Omit<ProductCatalogItem, "id" | "userAdded" | "verified"> & { id?: string; sourceUrl?: string; verified?: boolean }): ProductCatalogItem {
  const id = input.id || `${input.category}-${input.brand}-${input.productName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return normalizeCatalogItem({
    ...input,
    id,
    userAdded: true,
    verified: Boolean(input.verified && input.sourceUrl)
  });
}

export function upsertUserCatalogItem(item: ProductCatalogItem) {
  const normalized = normalizeCatalogItem({ ...item, userAdded: true, verified: Boolean(item.verified && item.sourceUrl) });
  const existing = loadUserCatalogItems().filter((stored) => stored.id !== normalized.id);
  const next = [...existing, normalized];
  saveUserCatalogItems(next);
  return next;
}

export function loadProductSuggestions(): ProductSuggestion[] {
  if (!localStorageAvailable()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PRODUCT_SUGGESTIONS_KEY) || "[]") as ProductSuggestion[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.id && item.category && item.productName) : [];
  } catch {
    return [];
  }
}

export function saveProductSuggestions(suggestions: ProductSuggestion[]) {
  if (!localStorageAvailable()) return;
  window.localStorage.setItem(PRODUCT_SUGGESTIONS_KEY, JSON.stringify(suggestions));
}

export function submitProductSuggestion(input: Omit<ProductSuggestion, "id" | "status" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const suggestion: ProductSuggestion = { ...input, id: `suggestion-${Date.now()}`, status: "pending", createdAt: now, updatedAt: now };
  saveProductSuggestions([suggestion, ...loadProductSuggestions()]);
  return suggestion;
}

export function updateProductSuggestionStatus(id: string, status: ProductSuggestion["status"]) {
  const now = new Date().toISOString();
  const suggestions = loadProductSuggestions().map((item) => (item.id === id ? { ...item, status, updatedAt: now } : item));
  saveProductSuggestions(suggestions);
  return suggestions;
}

export function exportProductCatalog(items = getProductCatalog()) {
  return JSON.stringify(items.map(normalizeCatalogItem), null, 2);
}

export function importProductCatalog(json: string) {
  const parsed = JSON.parse(json) as ProductCatalogItem[];
  if (!Array.isArray(parsed)) throw new Error("Catalog import must be an array.");
  return parsed.filter(isCatalogItem).map((item) => normalizeCatalogItem({ ...item, userAdded: true }));
}

export function validateCatalogImport(items: ProductCatalogItem[]) {
  const normalized = items.map(normalizeCatalogItem);
  const seen = new Map<string, ProductCatalogItem>();
  const issues: CatalogValidationIssue[] = [];
  normalized.forEach((item) => {
    if (item.needsReview) issues.push({ itemId: item.id, severity: "high", message: item.categorizationReason || "Needs category review." });
    const identity = catalogIdentity(item);
    if (seen.has(identity)) issues.push({ itemId: item.id, severity: "medium", message: `Possible duplicate of ${seen.get(identity)?.id}.` });
    seen.set(identity, item);
  });
  return { items: normalized, issues };
}

export function isCatalogItem(item: unknown): item is ProductCatalogItem {
  const value = item as Partial<ProductCatalogItem>;
  return Boolean(
    value &&
      typeof value.id === "string" &&
      typeof value.category === "string" &&
      typeof value.brand === "string" &&
      typeof value.productName === "string" &&
      Array.isArray(value.compatibleChassis) &&
      Array.isArray(value.tunableParameters) &&
      typeof value.userAdded === "boolean" &&
      typeof value.verified === "boolean"
  );
}
