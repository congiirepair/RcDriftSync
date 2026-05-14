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
    blocked: [/\b(rtr|readyset|kit|chassis|mounted|pre-mounted|tire set|tyre set|stickers?|decals?|die-?cut|letters?)\b/i],
    excluded: ["chassis", "tires", "mountedWheelTireSet"],
    reason: "Wheel dropdowns only accept standalone wheels/rims."
  },
  rearWheels: {
    productType: "standalone wheel",
    required: [/\b(wheel|rim|spoke|offset)\b/i],
    blocked: [/\b(rtr|readyset|kit|chassis|mounted|pre-mounted|tire set|tyre set|stickers?|decals?|die-?cut|letters?)\b/i],
    excluded: ["chassis", "tires", "mountedWheelTireSet"],
    reason: "Wheel dropdowns only accept standalone wheels/rims."
  },
  tires: {
    productType: "standalone tire",
    required: [/\b(tires?|tyres?|lf-|as-01|dra|drc|drp|csr|bb-rt|pergea|hdpe|pst|pe26rs|tsg|proxes|potenza|valino|rolling dancer|greeva|tapered|constant grip|super high traction|drift star)\b/i],
    blocked: [/\b(rtr|readyset|kit|chassis|mounted|pre-mounted|pre-assembled|wheel set|rim set)\b/i],
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
    required: [/\b(rear hubs?|hub carrier|rear upright|rear knuckle)\b/i],
    blocked: [/\b(front knuckle|steering block|axle shaft|wheel axle|drive axle|universal axle|wheel hub|lower arm|plate)\b/i],
    excluded: ["frontKnuckles", "rearAxles"],
    reason: "Rear hub carrier dropdowns only accept rear uprights/hub carriers."
  },
  frontShockTowers: {
    productType: "front shock tower",
    required: [/\bfront\b.{0,40}\b(shock|damper)\s+tower\b/i, /\bft\s+.*(shock|damper)\s+tower\b/i],
    blocked: [/\brear\s+(shock|damper)\s+tower|body mount|tower brace|post|adapter|screw|spacer|shim\b/i],
    excluded: ["rearShockTowers", "shockAccessories"],
    reason: "Front shock tower dropdowns only accept front shock/damper towers."
  },
  rearShockTowers: {
    productType: "rear shock tower",
    required: [/\brear\b.{0,40}\b(shock|damper)\s+tower\b/i, /\brt\s+.*(shock|damper)\s+tower\b/i],
    blocked: [/\bfront\s+(shock|damper)\s+tower|body mount|tower brace|post|adapter|screw|spacer|shim\b/i],
    excluded: ["frontShockTowers", "shockAccessories"],
    reason: "Rear shock tower dropdowns only accept rear shock/damper towers."
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
    required: [/\b(lower\s+(?:front|rear)?\s*arms?|front\s+lower\s+arms?|rear\s+lower\s+arms?|lower\s+wishbones?|h arm|a arm|suspension arm)\b/i],
    blocked: [/\b(upper arm|upper link|mount|toe block|hinge pin|shim|spacer|suspension kit)\b/i],
    excluded: ["frontToeBlocks", "frontLowerArmShims"],
    reason: "Lower arm dropdowns only accept actual lower suspension arms."
  },
  rearLowerArms: {
    productType: "lower suspension arm",
    required: [/\b(lower\s+(?:front|rear)?\s*arms?|front\s+lower\s+arms?|rear\s+lower\s+arms?|lower\s+wishbones?|h arm|a arm|suspension arm)\b/i],
    blocked: [/\b(upper arm|upper link|mount|toe block|hinge pin|shim|spacer|suspension kit)\b/i],
    excluded: ["rearToeBlocks", "rearLowerArmShims"],
    reason: "Lower arm dropdowns only accept actual lower suspension arms."
  },
  frontUpperArms: {
    productType: "upper arm",
    required: [/\b(upper\b.{0,40}\barms?|front\s+upper\s+arms?|rear\s+upper\s+arms?|upper\s+wishbones?|upper a arm|upper i arm|upper link)\b/i],
    blocked: [/\b(mount|shaft|shim|spacer|suspension kit)\b/i],
    excluded: ["frontLowerArms", "frontLowerArmShims"],
    reason: "Upper arm dropdowns only accept actual upper arms or upper arm sets."
  },
  rearUpperArms: {
    productType: "upper arm",
    required: [/\b(upper\b.{0,40}\barms?|front\s+upper\s+arms?|rear\s+upper\s+arms?|upper\s+wishbones?|upper a arm|upper i arm|upper link)\b/i],
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
    productType: "complete damper / shock",
    required: [/\b(damper|shock|absorber)\b/i],
    blocked: [/\b(combo|piston|shaft|rebuild|o-?ring|x-?ring|cap|spring retainer|spring cup|spring end|spring set|oil|fluid|chassis kit|complete kit|connector|spacer|shim|screw)\b/i],
    excluded: ["springs", "chassis", "shockPistons", "shockShafts", "damperOils", "shockAccessories"],
    reason: "Damper dropdowns only accept complete shocks/dampers, not service parts."
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
  },
  upperDecks: {
    productType: "upper deck",
    required: [/\bupper\s+deck|rear\s+upper\s+deck|carbon\s+upper\s+deck|graphite\s+upper\s+deck\b/i],
    blocked: [/\blower\s+deck|main\s+chassis|chassis\s+plate|side\s+deck|complete kit|rtr|readyset|connector|post|adapter|support|mount\b/i],
    excluded: ["lowerDecks", "chassis"],
    reason: "Upper deck dropdowns only accept standalone upper deck plates."
  },
  lowerDecks: {
    productType: "lower deck / main chassis plate",
    required: [/\blower\s+deck|main\s+chassis|chassis\s+plate|carbon\s+chassis|graphite\s+chassis|side\s+deck|conversion\s+plate\b/i],
    blocked: [/\bupper\s+deck|complete kit|rtr|readyset|connector|post|adapter|support|mount\b/i],
    excluded: ["upperDecks", "chassis"],
    reason: "Lower deck dropdowns only accept main chassis/lower deck plates."
  },
  differentials: {
    productType: "differential / axle assembly",
    required: [/\b(diff|differential|solid axle|spool|c-?lsd|limited slip)\b/i],
    blocked: [/\b(outdrive|joint|shaft|gear set|bevel gear set|washer|screw|shim)\b/i],
    excluded: ["drivetrainAccessories"],
    reason: "Differential dropdowns only accept complete differential or axle assemblies."
  },
  gearDiffs: {
    productType: "gear differential",
    required: [/\bgear\s+diff|gear\s+differential|bevel\s+gear\s+diff\b/i],
    blocked: [/\b(outdrive|joint|shaft|gear set|washer|screw|shim)\b/i],
    excluded: ["drivetrainAccessories", "ballDiffs", "solidAxles"],
    reason: "Gear diff dropdowns only accept complete gear differentials."
  },
  ballDiffs: {
    productType: "ball differential",
    required: [/\bball\s+diff|ball\s+differential\b/i],
    blocked: [/\b(outdrive|joint|shaft|washer|screw|shim|rebuild)\b/i],
    excluded: ["drivetrainAccessories", "gearDiffs", "solidAxles"],
    reason: "Ball diff dropdowns only accept complete ball differentials."
  },
  solidAxles: {
    productType: "solid axle / spool",
    required: [/\bsolid\s+axle|spool|locked\s+axle\b/i],
    blocked: [/\b(outdrive|joint|shaft|washer|screw|shim)\b/i],
    excluded: ["drivetrainAccessories", "gearDiffs", "ballDiffs"],
    reason: "Solid axle dropdowns only accept complete solid axle/spool assemblies."
  },
  bellcranks: {
    productType: "bellcrank",
    required: [/\bbell\s*crank|bellcrank\b/i],
    blocked: [/\bpost|screw|bearing|washer|spacer|shim|servo horn\b/i],
    excluded: ["steeringRacks", "slideRacks", "servoHorns"],
    reason: "Bellcrank dropdowns only accept steering bellcranks."
  },
  slideRacks: {
    productType: "slide rack",
    required: [/\bslide\s*rack|sliding\s*rack\b/i],
    blocked: [/\bpost|screw|bearing|washer|spacer|shim|servo horn\b/i],
    excluded: ["bellcranks", "steeringRacks", "servoHorns"],
    reason: "Slide rack dropdowns only accept steering slide racks."
  },
  steeringRacks: {
    productType: "steering rack",
    required: [/\bsteering\s*rack|rack\s*unit|slide\s*rack|sliding\s*rack|steering\s*wiper|dual\s*wiper|steering\s*kit|direct\s*drive\s*servo\s*steering|ddss\b/i],
    blocked: [/\bpost|screw|bearing|washer|spacer|shim|servo horn\b/i],
    excluded: ["bellcranks", "servoHorns"],
    reason: "Steering rack dropdowns only accept steering rack assemblies."
  },
  motorMounts: {
    productType: "motor mount",
    required: [/\bmotor\s+mount|motor\s+plate|motor\s+mounting\b/i],
    blocked: [/\bscrew|washer|shim|spacer|fan|cover|protector\b/i],
    excluded: ["motors", "motorAccessories"],
    reason: "Motor mount dropdowns only accept motor mount assemblies."
  },
  spurGears: {
    productType: "spur gear",
    required: [/\bspur\s+gear|spur\b/i],
    blocked: [/\bpinion|shaft|holder|adapter|screw|washer|shim\b/i],
    excluded: ["pinionGears", "drivetrainAccessories"],
    reason: "Spur gear dropdowns only accept standalone spur gears."
  },
  pinionGears: {
    productType: "pinion gear",
    required: [/\bpinion\s+gear|pinion\b/i],
    blocked: [/\bspur|shaft|holder|adapter|screw|washer|shim\b/i],
    excluded: ["spurGears", "drivetrainAccessories"],
    reason: "Pinion gear dropdowns only accept standalone pinion gears."
  },
  batteries: {
    productType: "battery",
    required: [/\bbattery|lipo|li-po|shorty|stick pack\b/i],
    blocked: [/\bmount|strap|holder|wire|connector|charger|balance\b/i],
    excluded: ["batteryMounts"],
    reason: "Battery dropdowns only accept standalone LiPo batteries."
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
    .replace(/\b(?:left|right)\b/gi, " ")
    .replace(/\b(?:l\/r|r\/l)\b/gi, " ")
    .replace(/\s*[-â€“â€”]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTuneSelectorName(value: string) {
  return value
    .replace(/\b(?:left|right)\s+(?:or|\/)\s+(?:left|right)\b/gi, " ")
    .replace(/\b(?:left|right)\s+side\b/gi, " ")
    .replace(/\b(?:left|right|lh|rh|l\/h|r\/h|l\/r|r\/l)\b/gi, " ")
    .replace(/\bpre[-\s]?order:?\b/gi, " ")
    .replace(/\bnew\s+arrival:?\b/gi, " ")
    .replace(/\b(?:replacement|spare|optional?|option|upgrade)\s+parts?\b/gi, " ")
    .replace(/\b(?:replacement|spare)\b/gi, " ")
    .replace(/\b(?:set|kit)\b/gi, " ")
    .replace(/\[\s*\]/g, " ")
    .replace(/\(\s*\)/g, " ")
    .replace(/^\s*[:/-]\s*/g, "")
    .replace(/\s*[-â€“â€”]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const clutterNormalizedCategories = new Set<ProductCatalogCategory>([
  "frontUpperArms",
  "rearUpperArms",
  "frontLowerArms",
  "rearLowerArms",
  "frontKnuckles",
  "knucklePlates",
  "frontAxles",
  "rearAxles",
  "rearHubCarriers",
  "frontToeBlocks",
  "rearToeBlocks",
  "frontShockTowers",
  "rearShockTowers",
  "dampers",
  "springs",
  "upperDecks",
  "lowerDecks",
  "differentials",
  "gearDiffs",
  "ballDiffs",
  "solidAxles",
  "motorMounts",
  "bellcranks",
  "slideRacks",
  "steeringRacks"
]);

function stripPartNumber(value: string, partNumber: string) {
  if (!partNumber) return value;
  return value.replace(new RegExp(`\\(?\\b${partNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b\\)?`, "gi"), "").replace(/\s+/g, " ").trim();
}

function cleanKnownProductName(value: string, brand: string, partNumber: string, category?: ProductCatalogCategory) {
  const name = normalizeProductValue(value);
  const cleanBrand = normalizeProductValue(brand);
  const cleanPart = partNumber.trim().toUpperCase();
  const isWheelCategory = category === "frontWheels" || category === "rearWheels";
  if (isWheelCategory) {
    const effectiveWheelBrand = cleanBrand === "buzz break" || /\bbuzz\s*break\b|\bBB-RW-/i.test(value) ? "buzz break" : cleanBrand;
    if (effectiveWheelBrand === "buzz break") {
      if (/\bwork\s+emotion\s+zr7\b/.test(name)) {
        return /\b9\s*offset\b|\b9offset\b|\bwide\b|BB-RW-03[57]/i.test(value) ? "WORK EMOTION ZR7 9 Wheel" : "WORK EMOTION ZR7 7 Wheel";
      }
      if (/\bgokutan\b.*\bvalino\b|\bvalino\b.*\bgokutan\b/.test(name)) {
        return /\b9\s*offset\b|\b9offset\b|\bwide\b|BB-RW-00(?:8|10)/i.test(value) ? "Gokutan VALINO R-Spec 9 Wheel" : "Gokutan VALINO R-Spec 7 Wheel";
      }
      if (/\bn560s\b/.test(name)) return /\bwide\b|\b9\s*offset\b|\b9offset\b|BB-RW-03[02]/i.test(value) ? "N560S R-Spec 9 Wheel" : "N560S ABS Wheel";
      if (/\bn820s\b/.test(name) && /\bul\s*spec|ultra\s+light\s+weight\b/.test(name)) return "N820S VALINO UL-Spec Aluminum Wheel";
      if (/\bn820s\b/.test(name) && /\baluminum|aluminium\b/.test(name)) return "N820S VALINO Aluminum Wheel";
      if (/\bn820s\b/.test(name)) return /\bwide\b|\b9\s*offset\b|\b9offset\b|BB-RW-02[46]/i.test(value) ? "N820S R-Spec 9 Wheel" : "N820S R-Spec 7 Wheel";
      if (/\babs\b/.test(name)) return "ABS Wheel";
      if (/\bvalino\b/.test(name) && /\bul\s*spec|ultra\s+light\s+weight\b/.test(name)) return "VALINO UL-Spec Aluminum Wheel";
      if (/\bvalino\b/.test(name)) return "VALINO Aluminum Wheel";
    }
    if (cleanBrand === "d-like" || cleanBrand === "d like") {
      if (/\bms\s*7\b|\bMS-7\b|\bDL102\b/i.test(value)) return "MS-7 Wheel";
      if (/\bte\s*37sl\b|\bms\s*37sl\b|\bTE-37SL\b|\bMS-37SL\b/i.test(value)) return "TE-37SL / MS-37SL Wheel";
    }
    if (cleanBrand === "ds racing") {
      if (/\bdrift\s+element\s+ii\b/.test(name)) return "Drift Element II 6-Spoke Wheel";
      if (/\bdrift\s+element\s+mesh\b/.test(name)) return "Drift Element Mesh Wheel";
      if (/\bfeathery\b.*\bsplit\b.*\b5y\b|\bDF-5Y/i.test(value)) return "Feathery Split 5Y Wheel";
      if (/\bdrift\s+element\b/.test(name) && /\b5\s*spoke\b/i.test(value)) return "Drift Element 5-Spoke Wheel";
      if (/\bdrift\s+element\b/.test(name)) return "Drift Element Wheel";
    }
    if (cleanBrand === "reve d") {
      if (/\brw[-\s]*ga18\b|\bga18\b/.test(name)) return "GA18 Dish Wheel";
      if (/\brw[-\s]*jd7\b|\bjd7\b/.test(name)) return "JD7 7-Spoke Concave Wheel";
      if (/\brw[-\s]*vr10\b|\bvr10\b/.test(name)) return "VR10 Multi-Spoke Wheel";
      if (/\brw[-\s]*dp5\b|\bdp5\b/.test(name)) return "DP5 Drift Wheel";
      if (/\brw[-\s]*ul12\b|\bul12\b/.test(name)) return "UL12 57Xtreme Drift Wheel";
    }
    if (cleanBrand === "shibata") {
      if (/\b37\s*kai\b|\b37kai\b|R31W242|R31W427|R31G052/i.test(value)) return "37Kai Wheel";
      if (/\b57\s*kai\b|\b57kai\b|R31W260/i.test(value)) return "57Kai Wheel";
      if (/\bf23\b|DR-SW(?:05|07)F/i.test(value)) return "F23 5-Spoke Wheel";
      if (/\bg23\b|DR-SW(?:05|07)G/i.test(value)) return "G23 Split 5-Spoke Wheel";
    }
    if (cleanBrand === "tetsujin") {
      if (/\bdaisy\b/i.test(value)) return /disc/i.test(value) ? "Daisy Mesh Disc Wheel" : "Daisy RIM02 Wheel";
      if (/\bdhalia\b/i.test(value)) return "Dhalia RIM02 Wheel";
      if (/\bgran\s+seeker\b.*\bdisc\b/i.test(value)) return "Gran Seeker Mesh Disc Wheel";
      if (/\bgran\s+seeker\b/i.test(value)) return "Gran Seeker Mesh RIM02 Wheel";
      if (/\bjasmime\b|\bjasmine\b/i.test(value)) return "Jasmine RIM02 Wheel";
      if (/\blycoris\b.*\bdisc\b/i.test(value)) return "Lycoris Mesh Disc Wheel";
      if (/\blycoris\b/i.test(value)) return "Lycoris RIM02 Wheel";
      if (/\bmarguerite\b/i.test(value)) return "Marguerite Wheel";
      if (/\brim02\s+x\s+daisy\b/i.test(value)) return "RIM02 X Daisy Wheel";
      if (/\bsouthern\s+cross\b/i.test(value)) return "Southern Cross RIM02 Wheel";
      if (/\bspider\b/i.test(value)) return "Spider Wheel";
      if (/\bsunflower\b/i.test(value)) return "Sunflower RIM02 Wheel";
      if (/\bsuper\s+bowler\b/i.test(value)) return "Super Bowler Wheel";
    }
    if (cleanBrand === "topline") {
      if (/\badvan\s+avs\s+t7\b|\byokohama\s+avs\s+model\s+t7\b/i.test(value)) return "Advan AVS T7 Wheel";
      if (/\bdrs\b/i.test(value)) return "DRS Wheel";
      if (/\bfx\s+sport\b/i.test(value)) return "FX Sport Wheel";
      if (/\bm5\s+spoke\b/i.test(value)) return "M5 Spoke Wheel";
      if (/\bnf\s+mesh\b/i.test(value)) return "NF Mesh Ver. 71 Wheel";
      if (/\bnf\s+multi\s+spoke\b/i.test(value)) return "NF Multi-Spoke Wheel";
      if (/\bn\s*model\b|\bnmodel\b/i.test(value)) return "N Model Ver. III Wheel";
      if (/\bssr\s+agle\s+minerva\b/i.test(value)) return "SSR Agle Minerva Wheel";
      if (/\bssr\s+minerva\b/i.test(value)) return "SSR Minerva Wheel";
      if (/\bwatanabe\s+f8\b/i.test(value)) return "Watanabe F8 Wheel";
      if (/\bwork\s+emotion\s+cr3p\b/i.test(value)) return "Work Emotion CR3P Wheel";
      if (/\bwork\s+equip\b/i.test(value)) return "Work Equip Wheel";
    }
    if (cleanBrand === "yokomo") {
      if (/\bracing\s+performer\b.*\b6\s*spoke\b/i.test(value)) return "Racing Performer 6-Spoke Wheel";
      if (/\bracing\s+performer\b/i.test(value)) return "Racing Performer Drift Wheel";
      if (/\bte37\b/i.test(value)) return "TE37 Style 6-Spoke Wheel";
    }
    if (cleanBrand === "spice") {
      if (/\bte37\b/i.test(value)) return "TE37 / TE37SL Drift Wheel";
    }
  }
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
    .replace(/\*/g, " ")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\bPREORDER:\s*/gi, "")
    .replace(/\bDISPLAY\b/gi, " ")
    .replace(/\b(?:set|pair)\b/gi, " ")
    .replace(/\b(?:2|4)\s*[- ]?\s*pack\b/gi, " ")
    .replace(/\b(?:26|30)\s*mm\b/gi, "")
    .replace(/\b\d+(?:\.\d+)?\s*mm\s+OFFSET\b/gi, "")
    .replace(/\bOFF(?:SET)?\s*[+/-]?\s*\d+(?:\.\d+)?\b/gi, "")
    .replace(/\b[+-]\s*\d+(?:\.\d+)?\b/g, "")
    .replace(/\b1[-/ ]?10\b|\b1\/10\b/gi, "")
    .replace(/\b(?:2|4)\s*(?:pack|pc|pcs|pieces)\b/gi, "")
    .replace(/\bOUTLET:\s*/gi, "")
    .replace(/\bDRIFT\s+(RIMS?|WHEELS?)\b/gi, "Drift Wheel")
    .replace(/\bRIMS?\b/gi, "Wheel")
    .replace(/\bWHEELS?\s+WHEEL\b/gi, "Wheel")
    .replace(/\bWHEEL\s+WHEELS?\b/gi, "Wheel")
    .replace(/\bWHEELS?\s+WHEELS?\b/gi, "Wheel")
    .replace(/\bRIMS?\s+WHEEL\b/gi, "Wheel")
    .replace(/\bWHEEL\s+RIMS?\b/gi, "Wheel")
    .replace(/\bWHEELS?\b/gi, "Wheel")
    .replace(/\bBB(?:\s+BB)+\b/gi, "BB")
    .replace(/\s*,\s*(?=,|$)/g, " ")
    .replace(/^\s*,\s*/g, "")
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
  "chrome purple",
  "chrome chrome purple",
  "silver chrome",
  "silver green lip",
  "brown gold",
  "gold chrome lip",
  "matte black chrome lip",
  "black black",
  "black chrome chrome",
  "gun metal grey",
  "titan silver",
  "gold metal",
  "bronze metal",
  "high gloss black",
  "matte black",
  "matte silver",
  "matte white",
  "pure white",
  "candy gold",
  "candy red",
  "black chrome",
  "lime yellow",
  "lime green",
  "flo green",
  "flo pink",
  "neon pink",
  "neon yellow",
  "hot pink",
  "gloss black",
  "light gold",
  "matte white",
  "gunmetal",
  "gun metal",
  "bronze",
  "chrome",
  "silver",
  "white",
  "yellow",
  "purple",
  "pink",
  "lime",
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

function wheelOffsetValues(value: string) {
  const values = new Set<string>();
  const offsetSource = value.replace(/\b1[-/ ]?10\b|\b1\/10\b/gi, " ");
  const pushOffsets = (text: string) => {
    Array.from(text.matchAll(/[+-]?\d+(?:\.\d+)?/g)).forEach((match) => {
      const numeric = Number(match[0].replace(/^\+/, ""));
      if (Number.isFinite(numeric) && Math.abs(numeric) <= 15) values.add(`${String(numeric).replace(/\.0$/, "")}mm`);
    });
  };

  Array.from(offsetSource.matchAll(/\b(?:off(?:set)?|offset)\s*[:+-]?\s*((?:[+-]?\d+(?:\.\d+)?\s*(?:mm)?\s*(?:\/|,|-|and)?\s*)+)/gi)).forEach((match) => pushOffsets(match[1]));
  Array.from(offsetSource.matchAll(/\b((?:[+-]?\d+(?:\.\d+)?\s*(?:mm)?\s*(?:\/|,|-|and)?\s*)+)\s*(?:offset|off)\b/gi)).forEach((match) => pushOffsets(match[1]));
  Array.from(offsetSource.matchAll(/\b([+-]\s*\d+(?:\.\d+)?)\b/g)).forEach((match) => pushOffsets(match[1]));
  Array.from(offsetSource.matchAll(/\b(\d+(?:\.\d+)?)\s*mm\b/gi)).forEach((match) => pushOffsets(match[1]));

  return Array.from(values);
}

function offsetsFromWheelName(value: string) {
  return wheelOffsetValues(value);
}

function skusFromModelNumber(value: string) {
  return Array.from(new Set(value.replace(/\s+\/\s+/g, " ").split(/\s+/).filter(looksLikePartNumber)));
}

function packCountFromName(value: string) {
  const match = value.match(/\b([24])\s*(?:pack|pc|pcs|pieces)\b/i);
  return match ? `${match[1]}-pack` : "";
}

function wheelTractionFromName(value: string) {
  const normalized = normalizeProductValue(value);
  if (/\bsuper\s+high\s+traction\b/.test(normalized)) return "Super High Traction";
  if (/\bsuper\s+traction\b/.test(normalized)) return "Super Traction";
  if (/\bhigh\s+traction\b/.test(normalized)) return "High Traction";
  if (/\bstandard\s+traction\b/.test(normalized)) return "Standard Traction";
  if (/\bnormal\s+traction\b/.test(normalized)) return "Normal Traction";
  if (/\btraction\s+type\b/.test(normalized)) return "Traction Type";
  return "";
}

function wheelProfileFromName(value: string) {
  const normalized = normalizeProductValue(value);
  const labels = [
    /\bul\s*spec|ultra\s+light\s+weight\b/.test(normalized) ? "UL Spec" : "",
    /\br\s*spec\b/.test(normalized) ? "R-Spec" : "",
    /\badjustable\s+offset\b/.test(normalized) ? "Adjustable Offset" : "",
    /\bdeep\s+dish\b/.test(normalized) ? "Deep Dish" : "",
    /\bchrome\s+lip\b/.test(normalized) ? "Chrome Lip" : "",
    /\bwith\s+lip\b/.test(normalized) ? "With Lip" : "",
    /\bwide\b/.test(normalized) ? "Wide" : "",
    /\binch\s*down|inchdown|smaller\s+diameter\s+face\b/.test(normalized) ? "Inchdown" : ""
  ].filter(Boolean);
  return labels.join(" / ");
}

function wheelBaseName(value: string) {
  if (/^MS-7 Wheel$/i.test(value)) return "MS-7 Wheel";
  if (/^TE-37SL \/ MS-37SL Wheel$/i.test(value)) return "TE-37SL / MS-37SL Wheel";
  if (/^UL12\s+Drift\s+Wheel$/i.test(value)) return "UL12 57Xtreme Drift Wheel";
  if (/^Shiba\s+Wheel\s+F23$/i.test(value)) return "F23 5-Spoke Wheel";
  if (/^Shiba\s+Wheel\s+G23$/i.test(value)) return "G23 Split 5-Spoke Wheel";
  let label = cleanWheelDisplayName(value);
  wheelColorWords.forEach((color) => {
    label = label.replace(new RegExp(`\\b${color.replace(/\s+/g, "\\s+")}\\b`, "gi"), " ");
  });
  return label
    .replace(/\b(?:GD|DW|OD|ART|ARTW|WW|TDW|IW|PA|TT|DE|DF|SAK|DL|BB-RW|RW-DP5|RW-UL12|RW-GA18|RW-JD7|RW-VR10|DR-SW|R31W|R31G)-?[A-Z0-9.-]*\d[A-Z0-9.-]*\b/gi, " ")
    .replace(/\b(?:ASC)?\d{4,6}[A-Z]*\b/gi, " ")
    .replace(/\b(?:LW|LWT|LWH|LWS|OW|OWH|PAB|PAC|EW|SPKV|SPA)\b/gi, " ")
    .replace(/\b(?:S-SBK|T5R2P|VSKF)\b/gi, " ")
    .replace(/\b(?:AdjustableOffset|adjustable\s+offsets?)\b/gi, " ")
    .replace(/\b(?:super[-\s]*wheel|rim02|alumi|alum)\b/gi, " ")
    .replace(/\b(?:face|flat|deep)\b(?=.*\bwheel\b)/gi, " ")
    .replace(/\b(?:or|reved?|reve-d)\b(?=.*\bwheel\b)/gi, " ")
    .replace(/\bsmaller\s+diameter\b/gi, " ")
    .replace(/\s+\+\s+(?:gun|w\s+lip)\b/gi, " ")
    .replace(/\bcopy\b/gi, " ")
    .replace(/^\s*:\s*/g, " ")
    .replace(/\bpolished\b/gi, " ")
    .replace(/\bhigh\b(?=\s+wheel\b)/gi, " ")
    .replace(/\bmatte\b(?=\s+wheel\b)/gi, " ")
    .replace(/\b(black|white|red|blue|purple|pink|lime|yellow|green|gold|silver|chrome|bronze|gunmetal|grey|gray|orange|candy|metal|metallic)\b/gi, " ")
    .replace(/\b(color|colour)\b/gi, " ")
    .replace(/\b(?:super\s+high|super|high|standard|normal)?\s*traction(?:\s+type)?\b/gi, " ")
    .replace(/\b(?:ul\s*spec|ultra\s+light\s+weight|r\s*spec|deep\s+dish|with\s+lip|chrome\s+lip|wide|adjustable\s+offset|inch\s*down|inchdown|smaller\s+diameter\s+face)\b/gi, " ")
    .replace(/\b[+-]?\d+(?:\.\d+)?\s*mm(?:\s*[-/]\s*[+-]?\d+(?:\.\d+)?\s*mm)*\b/gi, " ")
    .replace(/\b\d+(?:\s*[-/]\s*\d+)+\b/g, " ")
    .replace(/\b(?:off(?:set)?|offset)\b/gi, " ")
    .replace(/\b(?:2|4)\s*(?:pack|pc|pcs|pieces)\b/gi, " ")
    .replace(/\s+[+]\s*\d+(?:\.\d+)?\b/g, " ")
    .replace(/[()]/g, " ")
    .replace(/\s*[-/]\s*(?=\s|$)/g, " ")
    .replace(/\bdrift\s+wheel\s+wheel\b/gi, "Drift Wheel")
    .replace(/\bwheel\s+drift\s+wheel\b/gi, "Drift Wheel")
    .replace(/\bwheel\s+width\s+wheel\b/gi, "Wheel")
    .replace(/\bwheel\s+m\s+mesh\s+wheel\b/gi, "M Mesh Wheel")
    .replace(/\bwheel\s+rwb[-\s]*s1\s+5\s+spoke\s+wheel\b/gi, "RWB-S1 5 Spoke Wheel")
    .replace(/\brwb\s+m\s+mesh\s+wheel\b/gi, "RWB M Mesh Wheel")
    .replace(/\b19\s+2\s+Wheel\b/gi, "19 Wheel")
    .replace(/\b(GT\s+[FX]01)\s+2\s+Wheel\b/gi, "$1 Wheel")
    .replace(/^Wheel\s+(.+?)\s+Wheel$/i, "$1 Wheel")
    .replace(/\bWheel\s+Wheel\b/gi, "Wheel")
    .replace(/\bWHEELS?\b/gi, "Wheel")
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
    .replace(/\b(?:Spare|Replacement)\b/gi, "")
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
  if (clutterNormalizedCategories.has(input.category)) {
    label = cleanTuneSelectorName(label);
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

  const supportSpecificCategories = new Set<ProductCatalogCategory>([
    "frontAxles",
    "rearAxles",
    "frontLowerArmShims",
    "rearLowerArmShims",
    "shockPistons",
    "shockShafts",
    "damperOils",
    "motorRotors",
    "motorStators",
    "capacitors",
    "servoHorns",
    "motorMounts",
    "escMounts",
    "servoMounts",
    "bodyMounts",
    "batteryMounts",
    "shockAccessories",
    "motorAccessories",
    "escAccessories",
    "servoAccessories",
    "gyroAccessories",
    "wheelHexes",
    "drivetrainAccessories",
    "spurGears",
    "pinionGears"
  ]);

  const hardwarePattern = /\b(pin set|screw set|screws?|nuts?|washers?|bushings?|ball cups?|rod ends?|o rings?|o-rings?|x rings?|x-rings?|hardware|tool|decal|tape)\b/i;
  if (!supportSpecificCategories.has(item.category) && hardwarePattern.test(rawName)) return "Replacement hardware/support item, not a main installed setup part.";

  const supportPattern = /\b(adapter|connector|post|posts|bracket|protector|cover|cap|retainer|spring end)\b/i;
  const mountPattern = /\bmount|mounts|mounting\b/i;
  const shaftPattern = /\bshaft|shafts\b/i;
  const shimPattern = /\bshim|shims|spacer|spacers\b/i;

  if ((item.category === "frontUpperArms" || item.category === "rearUpperArms") && /\b(1\/24|rts|tc4|micro)\b/i.test(rawName)) {
    return "Micro-scale upper arm parts are hidden from the 1/10 drift upper arm selector.";
  }
  if ((item.category === "frontUpperArms" || item.category === "rearUpperArms") && (!/\bupper\b.{0,40}\barms?|front\s+upper\s+arms?|rear\s+upper\s+arms?|upper\s+wishbones?|upper a arm|upper i arm|upper link\b/i.test(rawName) || hasAny([shaftPattern, mountPattern, shimPattern], rawName))) {
    return "Not a complete upper arm/upper link selectable setup part.";
  }
  if ((item.category === "frontLowerArms" || item.category === "rearLowerArms") && (/\b1\/24\b|\brts\b/i.test(rawName) || !/\blower\b.{0,40}\barms?|front\s+lower\s+arms?|rear\s+lower\s+arms?|lower\s+wishbones?|h arm|a arm|suspension arm\b/i.test(rawName) || /\bupper arm|upper link|upper wishbone|upright set|suspension arm\s*&\s*upright|pin|shaft|rod end|ball stud|bearing\s+(?:kit|set)|bearings?\s+\(|weight\b/i.test(rawName) || hasAny([shimPattern], rawName))) {
    return "Not a complete lower arm selectable setup part.";
  }
  if ((item.category === "frontLowerArms" || item.category === "rearLowerArms") && /\bwheel hub\b/i.test(rawName)) {
    return "Bundled lower arm and hub rows are hidden from the lower-arm-only selector.";
  }
  if (item.category === "frontKnuckles" && /\b(rc28|sr27|1-28|micro)\b/i.test(rawName)) return "Micro-scale steering parts are hidden from the 1/10 drift knuckle selector.";
  if (item.category === "frontKnuckles" && !/\bknuckle|steering block|upright\b/i.test(rawName)) return "Not a front steering knuckle/upright.";
  if (item.category === "rearHubCarriers" && /\b(?:and|&)\s+suspension\s+mount\b/i.test(rawName)) {
    return "Bundled rear upright and suspension mount rows are hidden from the rear-hub-only selector.";
  }
  if (item.category === "rearHubCarriers" && (!/\brear hub|hub carrier|rear upright|rear knuckle|upright\b/i.test(rawName) || /\bplate\b/i.test(rawName))) return "Not a rear hub carrier/upright.";
  if ((item.category === "frontToeBlocks" || item.category === "rearToeBlocks") && /\b(upper arm mount|motor mount|esc mount|servo mount|battery mount|body mount|brace support|connector|post|adapter)\b/i.test(rawName)) {
    return "Mount/support hardware, not a toe block or suspension mount used for setup.";
  }
  if (item.category === "frontToeBlocks" || item.category === "rearToeBlocks") return "";

  if ((item.category === "frontShockTowers" || item.category === "rearShockTowers") && !/\bshock tower|damper tower\b/i.test(rawName)) {
    return "Not a shock/damper tower selectable setup part.";
  }

  if (item.category === "dampers" && !/\boil\s+absorber\b/i.test(rawName) && hasAny([shaftPattern, /\bcombo|piston|pistons|oil|fluid|spring retainer|spring cup|spring end\b/i, supportPattern], rawName)) {
    return "Shock service/accessory item, not a complete damper/shock.";
  }
  if (item.category === "dampers" && /\b(rc28|1-28|micro)\b/i.test(rawName)) {
    return "Micro-scale RC28 shock parts are hidden from the 1/10 drift damper selector.";
  }
  if ((item.category === "gearDiffs" || item.category === "ballDiffs" || item.category === "solidAxles") && /\b(outdrive|joint|shaft|gear set|washer|screw|shim|rebuild)\b/i.test(rawName)) {
    return "Drivetrain service/support part, not a complete differential or axle assembly.";
  }
  if ((item.category === "decks" || item.category === "upperDecks" || item.category === "lowerDecks") && (supportPattern.test(rawName) || mountPattern.test(rawName)) && !/\bmain chassis|chassis plate|upper deck set|deck set|carbon upper deck|graphite upper deck\b/i.test(rawName)) {
    return "Deck support/mount hardware, not a main chassis deck.";
  }
  if ((item.category === "frontWheels" || item.category === "rearWheels") && /\bmounted|pre mounted|pre-mounted|tire set|tyre set|wheel hub|axle|hex hub\b/i.test(rawName)) {
    return "Not a standalone wheel/rim.";
  }
  if (item.category === "tires" && /\bmounted|pre mounted|pre-mounted|wheel set|rim set\b/i.test(rawName)) return "Not a standalone tire.";
  if (item.category === "springs" && /\b(rc28|sr27|1-28|micro)\b/i.test(rawName)) return "Micro-scale spring parts are hidden from the 1/10 drift spring selector.";
  if (item.category === "springs" && item.brand === "Reve D" && /\brdx\s+r-?tune\s+spring\s+(?:soft|medium\s+hard|hard)\b/i.test(rawName)) {
    return "Collapsed into the grouped RDX R-Tune Spring variant family.";
  }
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
  if (supportPattern.test(rawName) && !["motorMounts", "escMounts", "servoMounts", "bodyMounts", "batteryMounts", "shockAccessories", "motorAccessories", "escAccessories", "servoAccessories", "gyroAccessories", "drivetrainAccessories"].includes(item.category)) {
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
  const found: Array<{ label: string; index: number }> = [];
  const lowerName = productName.toLowerCase();
  optionWords.forEach((word) => {
    const match = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").exec(lowerName);
    if (match && !found.some((item) => normalize(item.label) === normalize(word))) {
      found.push({ label: titleCase(word), index: match.index });
    }
  });
  const labels = found.sort((a, b) => a.index - b.index).map((item) => item.label);
  return labels.length === count ? labels : [];
}

function splitModelNumbers(modelNumber: string) {
  const parts = modelNumber.replace(/\s+\/\s+/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (parts.length < 2 || !parts.every(looksLikePartNumber)) return [];
  return Array.from(new Set(parts));
}

function splitLegacyDeckCategory(item: ProductCatalogItem): ProductCatalogCategory {
  if (item.category !== "decks") return item.category;
  const text = `${item.productName} ${item.simplifiedName ?? ""} ${item.displayName ?? ""} ${item.productType ?? ""} ${item.notes ?? ""}`;
  if (/\bupper\s+deck|rear\s+upper\s+deck|carbon\s+upper\s+deck|graphite\s+upper\s+deck\b/i.test(text)) return "upperDecks";
  if (/\blower\s+deck|main\s+chassis|chassis\s+plate|carbon\s+chassis|graphite\s+chassis|side\s+deck|conversion\s+plate\b/i.test(text)) return "lowerDecks";
  return item.category;
}

const shockTowerColorWords = ["Blue", "Red", "Purple", "Black"];

function shockTowerColorOptions(productName: string) {
  const normalized = normalizeProductValue(productName);
  const colors = shockTowerColorWords.filter((color) => new RegExp(`\\b${color.toLowerCase()}\\b`).test(normalized));
  return colors.length >= 2 ? colors : [];
}

function variantFromBundledOption(partNumber: string, label: string, index: number): ProductCatalogVariant {
  const displayName = label || partNumber;
  const variant: ProductCatalogVariant = {
    id: slugPart([displayName, partNumber || String(index + 1)].filter(Boolean).join("-")),
    displayName,
    sku: partNumber || undefined
  };
  const sizeMatch = displayName.match(/\b\d+(?:\.\d+)?\s*mm\b/i);
  const colorMatch = displayName.match(/\b(black|blue|red|purple|silver|gold|white|bronze|gunmetal|chrome|green|orange)\b/i);
  if (sizeMatch) variant.size = sizeMatch[0];
  if (colorMatch) variant.color = titleCase(colorMatch[0]);
  return variant;
}

function catalogItemWithBundledVariants(item: ProductCatalogItem, variants: ProductCatalogVariant[], reason: string): ProductCatalogItem {
  return {
    ...item,
    variants,
    aliases: Array.from(new Set([...(item.aliases ?? []), item.productName, item.displayName, item.simplifiedName].filter((value): value is string => Boolean(value)))),
    notes: [item.notes, reason].filter(Boolean).join(" ")
  };
}

const toeBlockCategories = new Set<ProductCatalogCategory>(["frontToeBlocks", "rearToeBlocks"]);

function isTrueInterchangeableSuspensionMount(item: ProductCatalogItem) {
  if (!toeBlockCategories.has(item.category)) return false;
  const text = `${item.productName} ${item.simplifiedName ?? ""} ${item.displayName ?? ""} ${item.productType ?? ""} ${item.notes ?? ""}`;
  if (!/\b(suspension\s+mount|sus-?mount|toe\s+block|toe\s+blocks|arm\s+mount)\b/i.test(text)) return false;
  if (/\b(pivot\s+ball|servo\s+horn|hex\s+hubs?|spring\s+retainers?|brace|conversion\s+set|a-?arm\s+conversion|rear\s+arms?|upper\s+arms?|lower\s+arms?|uprights?|upper\s+arm\s+mount|hardware|screws?|pins?|spacers?|shims?)\b/i.test(text)) {
    return false;
  }
  return true;
}

function cloneInterchangeableToeBlock(item: ProductCatalogItem, category: ProductCatalogCategory): ProductCatalogItem {
  const sourceCategory = item.category;
  const prefix = category.toLowerCase();
  const id = item.id
    ? `${prefix}-${item.id.replace(/^(fronttoeblocks|reartoeblocks|frontToeBlocks|rearToeBlocks)[-_]?/i, "")}`
    : `${prefix}-${slugPart(item.brand)}-${slugPart(item.productName)}`;
  return {
    ...item,
    id,
    category,
    productType: item.productType || "toe block / suspension mount",
    notes: [
      item.notes,
      `Shown in both front and rear suspension mount selectors because suspension mounts/toe blocks can be used interchangeably by position in RC drift setup notation. Original catalog category: ${sourceCategory}.`
    ].filter(Boolean).join(" "),
    aliases: Array.from(new Set([...(item.aliases ?? []), item.id, item.productName, item.displayName, item.simplifiedName].filter((value): value is string => Boolean(value)))),
    legacyIds: Array.from(new Set([...(item.legacyIds ?? []), item.id].filter(Boolean)))
  };
}

function expandInterchangeableToeBlockCatalogOptions(item: ProductCatalogItem): ProductCatalogItem[] {
  if (!isTrueInterchangeableSuspensionMount(item)) return [item];
  const pairedCategory: ProductCatalogCategory = item.category === "frontToeBlocks" ? "rearToeBlocks" : "frontToeBlocks";
  return [item, cloneInterchangeableToeBlock(item, pairedCategory)];
}

function expandBundledCatalogOptions(item: ProductCatalogItem): ProductCatalogItem[] {
  const cleanBrand = normalizeProductValue(item.brand);
  if (item.variants?.length) return [item];

  if (cleanBrand === "reve d" && (item.category === "frontToeBlocks" || item.category === "rearToeBlocks")) {
    const numbers = Array.from(new Set(Array.from(item.productName.matchAll(/#\s*(\d+)/g)).map((match) => match[1])));
    if (numbers.length > 1) {
      const baseModel = item.modelNumber.trim().toUpperCase();
      const variants = numbers.map((number, index) => {
        const partNumber = baseModel.includes("RD-301")
          ? `RD-301-${number}${/\bTK\b/i.test(item.productName) ? "T" : ""}`
          : baseModel.includes("RD-300")
            ? `RD-300-${number}`
            : `${baseModel}-${number}`;
        return variantFromBundledOption(partNumber, `#${number}`, index);
      });
      return [catalogItemWithBundledVariants(item, variants, "Grouped bundled toe block numbers as selectable variants.")];
    }
  }

  if (cleanBrand === "yokomo" && (item.category === "frontShockTowers" || item.category === "rearShockTowers")) {
    const colors = shockTowerColorOptions(item.productName);
    if (colors.length > 1) {
      const partNumbers = splitModelNumbers(item.modelNumber);
      const variants = colors.map((color, index) => variantFromBundledOption(partNumbers[index] ?? "", color, index));
      const baseName = item.productName
        .replace(/\((?:\s*(?:RED|BLUE|BLACK|PURPLE)\s*)+\)/gi, "")
        .replace(/\((?:\s*(?:BLUE|RED|PURPLE|BLACK)\s*[-–—]?\s*)+\)/gi, "")
        .replace(/\s+/g, " ")
        .trim();
      return [catalogItemWithBundledVariants({ ...item, productName: baseName }, variants, "Grouped bundled Yokomo shock tower colors as selectable variants.")];
    }
  }

  const partNumbers = splitModelNumbers(item.modelNumber);
  if (partNumbers.length < 2) return [item];
  const optionLabels = optionsFromName(item.productName, partNumbers.length);
  const variants = partNumbers.map((partNumber, index) => variantFromBundledOption(partNumber, optionLabels[index] ?? partNumber, index));
  return [catalogItemWithBundledVariants(item, variants, optionLabels.length ? "Grouped bundled retailer options as selectable variants." : "Grouped bundled retailer SKUs as selectable variants.")];
}

export function validateCatalogItemCategory(item: ProductCatalogItem): ProductCatalogItem {
  const name = `${item.productName} ${item.modelNumber} ${item.notes}`;
  const excludedCategories = new Set(item.excludedCategories ?? []);
  let category = splitLegacyDeckCategory(item);
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
  const baseItem = { ...item, category: splitLegacyDeckCategory(item) };
  const partNumber = (baseItem.partNumber || baseItem.modelNumber || "").trim().toUpperCase();
  const simplifiedName = baseItem.simplifiedName?.trim() || generateSimplifiedName({ ...baseItem, partNumber });
  const displayName = catalogDisplayName(simplifiedName, partNumber);
  const imageOverride = baseItem.sourceUrl ? productImageOverrides[baseItem.sourceUrl] : undefined;
  const wheelBrandText = `${baseItem.productName} ${simplifiedName} ${displayName} ${baseItem.modelNumber} ${partNumber} ${baseItem.notes ?? ""}`;
  const brand = (baseItem.category === "frontWheels" || baseItem.category === "rearWheels") && (/\bbuzz\s*break\b/i.test(wheelBrandText) || /\bBB-RW-/i.test(wheelBrandText))
    ? "Buzz Break"
    : baseItem.brand;
  const validated = validateCatalogItemCategory({
    ...baseItem,
    brand,
    partNumber,
    modelNumber: baseItem.modelNumber || partNumber,
    simplifiedName,
    displayName,
    sourceName: baseItem.sourceName || (baseItem.sourceUrl ? new URL(baseItem.sourceUrl, "https://example.com").hostname.replace(/^www\./, "") : ""),
    imageUrl: baseItem.imageUrl || imageOverride?.imageUrl,
    imageSourceUrl: baseItem.imageSourceUrl || imageOverride?.imageSourceUrl,
    imageSourceKind: baseItem.imageSourceKind || imageOverride?.imageSourceKind,
    imageLastCheckedAt: baseItem.imageLastCheckedAt || imageOverride?.imageLastCheckedAt,
    imageNeedsReview: baseItem.imageNeedsReview ?? Boolean(imageOverride),
    notes: cleanCatalogDescription(baseItem.notes ?? ""),
    excludedCategories: baseItem.excludedCategories ?? [],
    confidence: baseItem.confidence ?? (baseItem.sourceUrl ? "medium" : "low"),
    needsReview: baseItem.needsReview ?? false,
    verified: Boolean(baseItem.verified && baseItem.sourceUrl)
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
  if (brand === "yokomo" && (item.category === "frontShockTowers" || item.category === "rearShockTowers") && /\b(blue|red|purple|black)\b/.test(cleanName)) {
    return `${item.category}|${brand}|shock-tower-color:${cleanName}`;
  }
  return part ? `${item.category}|${brand}|part:${part}` : `${item.category}|${brand}|name:${cleanName}`;
}

const sideAgnosticCategories = new Set<ProductCatalogCategory>([
  "frontUpperArms",
  "rearUpperArms",
  "frontLowerArms",
  "rearLowerArms",
  "frontKnuckles",
  "knucklePlates",
  "rearHubCarriers",
  "frontToeBlocks",
  "rearToeBlocks",
  "frontShockTowers",
  "rearShockTowers",
  "dampers",
  "springs",
  "differentials",
  "gearDiffs",
  "ballDiffs",
  "solidAxles",
  "motorMounts",
  "bellcranks",
  "slideRacks",
  "steeringRacks"
]);
const wheelCategories = new Set<ProductCatalogCategory>(["frontWheels", "rearWheels"]);
const electronicsCanonicalCategories = new Set<ProductCatalogCategory>(["servos", "escs", "capacitors"]);
const variantFamilyCategories = new Set<ProductCatalogCategory>([
  "chassis",
  "frontUpperArms",
  "rearUpperArms",
  "frontLowerArms",
  "rearLowerArms",
  "frontKnuckles",
  "knucklePlates",
  "rearHubCarriers",
  "frontShockTowers",
  "rearShockTowers",
  "dampers",
  "springs",
  "upperDecks",
  "lowerDecks",
  "differentials",
  "gearDiffs",
  "ballDiffs",
  "solidAxles",
  "frontAxles",
  "rearAxles",
  "motorMounts",
  "bellcranks",
  "slideRacks",
  "steeringRacks"
]);

function sideAgnosticCatalogIdentity(item: ProductCatalogItem) {
  if (!sideAgnosticCategories.has(item.category)) return "";
  const label = normalizeProductValue(item.simplifiedName || item.productName)
    .replace(/\b(left|right|lh|rh|l h|r h|l side|r side|left side|right side)\b/g, " ")
    .replace(/\b(left or right|right or left|left right|right left)\b/g, " ")
    .replace(/\b(l\/r|r\/l)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!label) return "";
  return `${item.category}|${normalizeProductValue(item.brand)}|side-agnostic:${label}`;
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

const variantColorWords = [
  "fluorescent pink",
  "fluorescent yellow",
  "fluorescent green",
  "dark gunmetal",
  "gun metal",
  "gunmetal",
  "orange",
  "purple",
  "silver",
  "black",
  "white",
  "green",
  "yellow",
  "bronze",
  "chrome",
  "gold",
  "blue",
  "pink",
  "red"
];

function tuningVariantColorFromName(value: string) {
  const normalized = normalizeProductValue(value);
  if (/\bsilver\s+edge\b/.test(normalized)) return "";
  return variantColorWords.find((color) => new RegExp(`\\b${color.replace(/\s+/g, "\\s+")}\\b`, "i").test(normalized)) ?? "";
}

function tuningVariantSizeFromName(value: string) {
  const sizes = Array.from(new Set(Array.from(value.matchAll(/\b\d+(?:\.\d+)?\s*mm\b/gi)).map((match) => match[0].replace(/\s+/g, ""))));
  return sizes.length === 1 ? sizes[0] : "";
}

function bundledVariantColorsFromName(value: string) {
  const normalized = normalizeProductValue(value);
  if (/\bsilver\s+edge\b/.test(normalized)) return [];
  const colors = variantColorWords.filter((color) => new RegExp(`\\b${color.replace(/\s+/g, "\\s+")}\\b`, "i").test(normalized));
  return Array.from(new Set(colors.map(titleCase)));
}

function stripVariantFamilyTokens(value: string, brand: string) {
  const cleanBrand = normalizeProductValue(brand);
  let next = cleanTuneSelectorName(value)
    .replace(/\bsilver\s+edge\b/gi, "SilverEdge")
    .replace(/\[[^\]]*]/g, " ")
    .replace(/\(\s*\)/g, " ")
    .replace(/\(\s*(?:black|blue|red|purple|silver|gold|white|green|orange|pink|yellow|bronze|chrome|gunmetal|gun metal)(?:\s*[-/]\s*(?:black|blue|red|purple|silver|gold|white|green|orange|pink|yellow|bronze|chrome|gunmetal|gun metal))*\s*\)/gi, " ")
    .replace(/\b(?:red|purple|black|blue|silver|gold|white|green|orange|pink|yellow|bronze|chrome|gunmetal|gun metal)\b/gi, " ")
    .replace(/\b(?:red|purple|black|blue)\s+(?:purple|black|blue|red)(?:\s+(?:purple|black|blue|red))*\b/gi, " ")
    .replace(/\b(?:set|kit)\b/gi, " ")
    .replace(/\bSilverEdge\b/g, "Silver Edge")
    .replace(/\s+\(\s*$/g, " ")
    .replace(/\s*[-–—]\s*$/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleanBrand) {
    next = next
      .replace(new RegExp(`\\b${cleanBrand.replace(/\s+/g, "\\s+")}\\b`, "gi"), " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return next;
}

function tuningVariantFromItem(item: ProductCatalogItem): ProductCatalogVariant {
  const sourceText = `${item.productName} ${item.simplifiedName ?? ""} ${item.displayName ?? ""}`;
  const color = tuningVariantColorFromName(sourceText);
  const size = tuningVariantSizeFromName(sourceText);
  const sku = item.partNumber || item.modelNumber || undefined;
  const displayName = [color && titleCase(color), size].filter(Boolean).join(" / ") || sku || "Standard";
  return {
    id: slugPart([displayName, sku || item.id].filter(Boolean).join("-")),
    color: color ? titleCase(color) : undefined,
    size: size || undefined,
    sku,
    displayName,
    sourceProductName: item.productName,
    sourceUrl: item.sourceUrl
  };
}

function shouldCanonicalizeVariantFamily(item: ProductCatalogItem) {
  if (!variantFamilyCategories.has(item.category)) return false;
  if (item.variants?.length) return true;
  const sourceText = `${item.productName} ${item.simplifiedName ?? ""} ${item.displayName ?? ""} ${item.partNumber ?? ""} ${item.modelNumber ?? ""}`;
  if (tuningVariantColorFromName(sourceText)) return true;
  if (bundledVariantColorsFromName(sourceText).length > 1) return true;
  return false;
}

function variantFamilyName(item: ProductCatalogItem) {
  if (!shouldCanonicalizeVariantFamily(item)) return "";
  const sourceName = item.simplifiedName || item.productName;
  const familyName = stripVariantFamilyTokens(sourceName, item.brand);
  return familyName.length >= 4 ? familyName : "";
}

function canonicalizeVariantFamilyItem(item: ProductCatalogItem) {
  const familyName = variantFamilyName(item);
  if (!familyName) return item;
  const existingVariants = item.variants ?? [];
  const inferredVariants = existingVariants.length ? existingVariants : [tuningVariantFromItem(item)];
  const bundledColors = !existingVariants.length
    ? bundledVariantColorsFromName(`${item.productName} ${item.simplifiedName ?? ""} ${item.displayName ?? ""}`)
    : [];
  const variants = bundledColors.length > 1
    ? bundledColors.map((color): ProductCatalogVariant => ({
        id: slugPart(color),
        color,
        displayName: color,
        sourceProductName: item.productName,
        sourceUrl: item.sourceUrl
      }))
    : inferredVariants;
  const canonicalId = `${item.category}-${slugPart(item.brand)}-${slugPart(familyName)}-${slugPart(item.compatibleChassis.map(normalizeProductValue).sort().join("-")) || "universal"}`;
  const partNumber = variants.map((variant) => variant.sku).filter(Boolean).join(" / ") || item.partNumber || item.modelNumber || "";
  return {
    ...item,
    id: canonicalId,
    canonicalProductId: canonicalId,
    canonicalVariantId: variants.length === 1 ? variants[0].id : item.canonicalVariantId,
    simplifiedName: familyName,
    displayName: catalogDisplayName(familyName, partNumber),
    productName: familyName,
    partNumber,
    modelNumber: partNumber,
    variants: mergeVariants(item.variants, variants),
    aliases: Array.from(new Set([...(item.aliases ?? []), item.productName, item.displayName, item.simplifiedName].filter((value): value is string => Boolean(value)))),
    legacyIds: Array.from(new Set([...(item.legacyIds ?? []), item.id].filter(Boolean)))
  };
}

function toeBlockColorFromName(value: string) {
  const normalized = normalizeProductValue(value);
  const colors = ["black", "red", "purple", "blue", "silver", "gold"].filter((color) => new RegExp(`\\b${color}\\b`).test(normalized));
  return colors.map(titleCase).join(" / ");
}

function toeBlockPositionFromName(item: ProductCatalogItem) {
  const value = `${item.productName} ${item.simplifiedName ?? ""} ${item.displayName ?? ""} ${item.modelNumber ?? ""}`;
  const part = item.partNumber || item.modelNumber || "";
  const numberMatch = value.match(/#\s*(\d+)/i) || part.match(/(?:RD-30[01]-?)(\d+)(?:T)?$/i);
  if (numberMatch) return `#${numberMatch[1]}`;
  const tkMatch = part.match(/RD-301-(\d+)T/i);
  if (tkMatch) return `#${tkMatch[1]} TK`;
  const armMountPairMatch = value.match(/\barm\s+mounts?\s+([A-Z])\s*\/\s*([A-Z])\b/i);
  if (armMountPairMatch) return `Mount ${armMountPairMatch[1].toUpperCase()} / ${armMountPairMatch[2].toUpperCase()}`;
  const armMountMatch = value.match(/\barm\s+mounts?\s+([A-Z])\b/i);
  if (armMountMatch) return `Mount ${armMountMatch[1].toUpperCase()}`;
  const advanceMatch = value.match(/\b(FF|FR\/RF|ARS|RR)\b(?:\s*\+?(-?\d+(?:\.\d+)?))?(?:\s*mm)?/i);
  if (advanceMatch && /advance\s+20|SAK-A5/i.test(value)) {
    const location = advanceMatch[1].toUpperCase();
    const size = advanceMatch[2] ? `${advanceMatch[2]}mm` : "";
    if (location === "FF" && /\+\s*0|\b\+0\b/i.test(value)) return "FF +0";
    return [location, size].filter(Boolean).join(" ");
  }
  const frMountMatch = value.match(/\bfr\s+suspension\s+mount\s+([A-Z])\b/i) || part.match(/B8-301FR([A-Z])/i);
  if (frMountMatch) return `FR ${frMountMatch[1].toUpperCase()}`;
  const separateMountMatch = value.match(/\bseparate\s+(?:aluminum\s+)?suspension\s+mount\s+([A-Z])\b/i) || part.match(/B8-301S([A-Z])/i);
  if (separateMountMatch) return `Separate ${separateMountMatch[1].toUpperCase()}`;
  const letterMountMatch = value.match(/\bsuspension\s+(?:toe\s+block\s+)?(?:mount\s+)?([A-E])\b/i);
  if (letterMountMatch) return `Mount ${letterMountMatch[1].toUpperCase()}`;
  const toeBlockLetterMatch = value.match(/\btoe\s+block\s+([A-E])\b/i);
  if (toeBlockLetterMatch) return `Block ${toeBlockLetterMatch[1].toUpperCase()}`;
  if (/\bfront\b/i.test(value) && /\brear\b/i.test(value)) return "";
  if (/\bfront\b/i.test(value)) return "Front";
  if (/\brear\b/i.test(value)) return "Rear";
  return "";
}

const hiddenToeBlockFamilies = new Set([
  "reve d|rdx molded suspension mount",
  "reve d|rf sus mount",
  "reve d|standard toe block",
  "overdose|galm suspension mount set"
]);

function shouldHideToeBlockItem(item: ProductCatalogItem, familyName: string) {
  const familyKey = `${normalizeProductValue(item.brand)}|${normalizeProductValue(familyName)}`;
  if (hiddenToeBlockFamilies.has(familyKey)) return true;
  const value = normalizeProductValue(`${item.productName} ${item.simplifiedName ?? ""} ${item.displayName ?? ""} ${item.modelNumber ?? ""}`);
  return /\bpivot\s+ball\b|\bservo\s+horn\b|\bbrace\b/.test(value);
}

function toeBlockRangeFromName(value: string) {
  const rangeMatch = value.match(/[-+]?\d+(?:\.\d+)?\s*(?:~|-|\/|to)\s*[-+]?\d+(?:\.\d+)?/i);
  if (rangeMatch) return rangeMatch[0].replace(/\s+/g, " ").replace(/to/i, "to");
  return "";
}

function toeBlockSizeFromName(value: string) {
  const values = Array.from(new Set(Array.from(value.matchAll(/\b\d+(?:\.\d+)?\s*mm\b/gi)).map((match) => match[0].replace(/\s+/g, ""))));
  return values.length > 1 ? `${values.length} widths` : values[0] ?? "";
}

function toeBlockFamilyName(item: ProductCatalogItem) {
  if (!toeBlockCategories.has(item.category)) return "";
  const brand = normalizeProductValue(item.brand);
  const value = `${item.productName} ${item.simplifiedName ?? ""} ${item.displayName ?? ""} ${item.modelNumber ?? ""}`;
  const normalized = normalizeProductValue(value);

  if (brand === "reve d") {
    if (/rd\s*301\s*\d+t|\btk\s+type\b/.test(normalized)) return "SE TK Type Toe Block";
    if (/rd-301rf3|\brf\s+sus/.test(normalized)) return "RF Sus-Mount";
    if (/rd\s*301|\bse\s+toe\s+block\b/.test(normalized)) return "SE Toe Block";
    if (/rd\s*300|\bstandard\s+toe\s+block\b|\btoe\s+block\s+#/.test(normalized)) return "Standard Toe Block";
    if (/d1-300f|d1-300r|\brdx\s+molded/.test(normalized)) return "RDX Molded Suspension Mount";
  }

  if (brand === "mst") {
    if (/820159|rmx\s+mrx.*adjustment/.test(normalized)) return "RMX / MRX Aluminum Adjustment Suspension Mount";
    if (/820058|820143|adjustable\s+aluminum\s+suspension\s+mount/.test(normalized)) return "RMX Adjustable Aluminum Suspension Mount";
    if (/210576|rmx\s+2.*toe/.test(normalized)) return "RMX 2.0 / 2.5 Aluminum Suspension Mount TOE";
    if (/230069|rmx\s+2.*suspension\s+mount/.test(normalized)) return "RMX 2.0 Suspension Mount";
  }

  if (brand === "3racing") {
    if (/advance\s+20|sak-a54|sak-a53/.test(normalized)) return "Advance 20 Suspension Mount";
    if (/sak-d508|d5.*suspension\s+mount/.test(normalized)) return "D5 Suspension Mount";
  }

  if (brand === "yokomo") {
    if (/rd-301as|rd2/.test(normalized)) return "RD2.0 Aluminum Suspension Mount";
    if (/y2-301ap|y2-301ar|adjustable\s+aluminum\s+suspension\s+mount/.test(normalized)) return "Adjustable Aluminum Suspension Mount";
    if (/rd-301ad|rd-301ae|aluminum\s+suspension\s+mount\s+[de]\b/.test(normalized)) return "Aluminum Suspension Mount";
    if (/y2-301db|y2-301eb|brass\s+rear\s+suspension\s+mount/.test(normalized)) return "Brass Rear Suspension Mount";
    if (/b8-301|bd8.*toe\s+block/.test(normalized)) return "YD2 / BD8 Suspension Toe Block";
  }

  if (brand === "team associated" && /arm\s+mount/.test(normalized)) return "DC10 FT Aluminum Arm Mount";
  if (brand === "overdose" && /tc.*suspension\s+mount|od2965/.test(normalized)) return "TC Aluminum Low Mount Suspension Mount";
  if (brand === "overdose" && /od2407|galm.*suspension\s+mount/.test(normalized)) return "GALM Suspension Mount Set";
  if (brand === "rhino racing" && /shark\s+suspension\s+mount|rr-1300/.test(normalized)) return "SHARK Suspension Mount";

  return cleanTuneSelectorName(item.simplifiedName || item.productName)
    .replace(/\b(?:front|rear)\b/gi, " ")
    .replace(/\b(?:black|red|purple|blue|silver|gold)\b/gi, " ")
    .replace(/\b#\s*\d+\b/g, " ")
    .replace(/\bmount\s+[a-e]\b/gi, "Mount")
    .replace(/\bblock\s+[a-e]\b/gi, "Block")
    .replace(/\s+/g, " ")
    .trim();
}

function toeBlockVariantFromItem(item: ProductCatalogItem): ProductCatalogVariant {
  const position = toeBlockPositionFromName(item);
  const color = toeBlockColorFromName(item.productName);
  const range = toeBlockRangeFromName(item.productName);
  const size = toeBlockSizeFromName(item.productName);
  const sku = item.partNumber || item.modelNumber || undefined;
  const displayName = [position, color, range, size].filter(Boolean).join(" / ") || sku || "Standard";
  return {
    id: slugPart([displayName, sku || item.id].filter(Boolean).join("-")),
    color: color || undefined,
    size: size || range || undefined,
    sku,
    displayName,
    sourceProductName: item.productName,
    sourceUrl: item.sourceUrl
  };
}

function toeBlockCatalogIdentity(item: ProductCatalogItem) {
  if (!toeBlockCategories.has(item.category)) return "";
  const familyName = toeBlockFamilyName(item);
  if (!familyName) return "";
  return `${item.category}|${normalizeProductValue(item.brand)}|toe-block:${normalizeProductValue(familyName)}`;
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
  const traction = wheelTractionFromName(item.productName);
  const profile = wheelProfileFromName(item.productName);
  const displayBits = [color, offsets.join(" / "), traction, profile, packCount].filter(Boolean);
  return {
    id: slugPart([color || "standard", offsets.join("-") || "", traction, profile, packCount || "", skus.join("-") || item.id].filter(Boolean).join("-")),
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
    const key = [
      normalizeProductValue(variant.color ?? ""),
      normalizeProductValue(variant.offset ?? ""),
      normalizeProductValue(variant.packCount ?? ""),
      normalizeProductValue(variant.sku ?? ""),
      normalizeProductValue(variant.displayName ?? "")
    ].join("|");
    variants.set(key, { ...variants.get(key), ...variant });
  });
  return Array.from(variants.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function withMergedCatalogMetadata(current: ProductCatalogItem, next: ProductCatalogItem) {
  const preferred = preferredCatalogItem(current, next);
  const other = preferred === current ? next : current;
  const hiddenFromTuneBuilder = Boolean(preferred.hiddenFromTuneBuilder) && Boolean(other.hiddenFromTuneBuilder);
  const tuneSelectable = preferred.tuneSelectable === false && other.tuneSelectable === false ? false : preferred.tuneSelectable ?? other.tuneSelectable;
  return {
    ...preferred,
    hiddenFromTuneBuilder,
    tuneSelectable,
    reasonHidden: hiddenFromTuneBuilder ? preferred.reasonHidden || other.reasonHidden : undefined,
    aliases: Array.from(new Set([...(preferred.aliases ?? []), ...(other.aliases ?? []), other.productName, other.displayName, other.simplifiedName].filter((value): value is string => Boolean(value)))),
    legacyIds: Array.from(new Set([...(preferred.legacyIds ?? []), ...(other.legacyIds ?? []), other.id].filter(Boolean))),
    variants: mergeVariants(preferred.variants, other.variants)
  };
}

function canonicalizeWheelItem(item: ProductCatalogItem) {
  if (!wheelCategories.has(item.category)) return item;
  const baseName = wheelBaseName(item.simplifiedName || item.productName);
  const variants = item.variants?.length ? item.variants : [wheelVariantFromItem(item)];
  const canonicalId = `${item.category}-${slugPart(item.brand)}-${slugPart(baseName || item.simplifiedName || item.productName)}`;
  const partNumber = Array.from(new Set(variants.map((variant) => variant.sku).filter(Boolean))).join(" / ") || item.partNumber || item.modelNumber || "";
  return {
    ...item,
    id: canonicalId,
    canonicalProductId: canonicalId,
    canonicalVariantId: variants.length === 1 ? variants[0].id : item.canonicalVariantId,
    simplifiedName: baseName || item.simplifiedName,
    displayName: baseName || item.displayName,
    productName: baseName || item.productName,
    partNumber,
    modelNumber: partNumber,
    variants: mergeVariants(item.variants, variants),
    aliases: Array.from(new Set([...(item.aliases ?? []), item.productName, item.displayName, item.simplifiedName].filter((value): value is string => Boolean(value)))),
    legacyIds: Array.from(new Set([...(item.legacyIds ?? []), item.id].filter(Boolean)))
  };
}

function canonicalizeToeBlockItem(item: ProductCatalogItem) {
  if (!toeBlockCategories.has(item.category)) return item;
  const familyName = toeBlockFamilyName(item);
  if (!familyName) return item;
  const variants = item.variants?.length ? item.variants : [toeBlockVariantFromItem(item)];
  const canonicalId = `${item.category}-${slugPart(item.brand)}-${slugPart(familyName)}`;
  const partNumber = variants.map((variant) => variant.sku).filter(Boolean).join(" / ") || item.partNumber || item.modelNumber || "";
  const shouldHideFamily = shouldHideToeBlockItem(item, familyName);
  return {
    ...item,
    id: canonicalId,
    canonicalProductId: canonicalId,
    canonicalVariantId: variants.length === 1 ? variants[0].id : item.canonicalVariantId,
    simplifiedName: familyName,
    displayName: catalogDisplayName(familyName, partNumber),
    productName: familyName,
    partNumber,
    modelNumber: partNumber,
    variants: mergeVariants(item.variants, variants),
    tuneSelectable: shouldHideFamily ? false : item.tuneSelectable,
    hiddenFromTuneBuilder: shouldHideFamily || item.hiddenFromTuneBuilder,
    reasonHidden: shouldHideFamily ? "Removed during suspension mount cleanup at user request." : item.reasonHidden,
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
  items.map(canonicalizeWheelItem).map(canonicalizeToeBlockItem).map(canonicalizeSideAgnosticItem).map(canonicalizeElectronicsItem).map(canonicalizeVariantFamilyItem).forEach((item) => {
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
    const identity = wheelCatalogIdentity(item) || toeBlockCatalogIdentity(item) || sideAgnosticCatalogIdentity(item) || catalogIdentity(item);
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
  return uniqueCatalogItems(
    [...productCatalogSeed, ...loadUserCatalogItems(), ...extraItems]
      .flatMap(expandBundledCatalogOptions)
      .flatMap(expandInterchangeableToeBlockCatalogOptions)
      .map(normalizeCatalogItem)
  );
}

export function filterProductCatalog(items: ProductCatalogItem[], filters: ProductCatalogFilters = {}) {
  const brand = normalize(filters.brand ?? "");
  const query = normalize(filters.query ?? "");
  const compatibleChassis = normalize(filters.compatibleChassis ?? "");

  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (!filters.includeNeedsReview && item.needsReview) return false;
    if (!filters.includeLowConfidence && item.confidence === "low") return false;
    if (item.tuneSelectable === false && !filters.includeHiddenFromTuneBuilder) return false;
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
  }).sort((a, b) => {
    const brandCompare = a.brand.localeCompare(b.brand);
    if (brandCompare) return brandCompare;
    return catalogOptionLabel(a).localeCompare(catalogOptionLabel(b));
  });
}

export function productsByCategory(category: ProductCatalogCategory, items = getProductCatalog()) {
  if (wheelCategories.has(category)) {
    const syncedWheelItems = items
      .filter((item) => wheelCategories.has(item.category))
      .map((item) => item.category === category ? item : {
        ...item,
        category,
        legacyIds: Array.from(new Set([...(item.legacyIds ?? []), item.id].filter(Boolean)))
      });
    return filterProductCatalog(uniqueCatalogItems(syncedWheelItems), { category });
  }
  return filterProductCatalog(items, { category });
}

export function productsByBrand(brand: string, items = getProductCatalog()) {
  return filterProductCatalog(items, { brand });
}

export function productsByBrandAndCategory(brand: string, category: ProductCatalogCategory, items = getProductCatalog()) {
  if (wheelCategories.has(category)) {
    return filterProductCatalog(productsByCategory(category, items), { brand });
  }
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
