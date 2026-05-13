import { rcParts } from "./rcParts";
import { sourcedCatalogItems } from "./sourcedCatalogProducts";
import { sourcedWheelCatalogItems } from "./sourcedWheelProducts";
import { sourcedWizardCatalogItems } from "./sourcedWizardProducts";

export const productCatalogCategories = [
  "chassis",
  "decks",
  "dampers",
  "springs",
  "frontKnuckles",
  "knucklePlates",
  "frontAxles",
  "frontWheels",
  "tires",
  "servos",
  "servoTuneProfiles",
  "gyros",
  "gyroTuneProfiles",
  "motors",
  "escs",
  "escTuneProfiles",
  "differentials",
  "frontLowerArms",
  "rearLowerArms",
  "rearHubCarriers",
  "rearAxles",
  "rearWheels",
  "frontToeBlocks",
  "rearToeBlocks",
  "frontLowerArmShims",
  "rearLowerArmShims",
  "frontShockTowers",
  "rearShockTowers",
  "frontUpperArms",
  "rearUpperArms",
  "shockPistons",
  "shockShafts",
  "damperOils",
  "motorRotors",
  "motorStators",
  "capacitors",
  "servoHorns",
  "electronicsBundles",
  "mountedWheelTireSets",
  "motorMounts",
  "escMounts",
  "servoMounts",
  "bodyMounts",
  "batteryMounts",
  "escAccessories",
  "motorAccessories",
  "servoAccessories",
  "gyroAccessories",
  "shockAccessories",
  "wheelHexes",
  "drivetrainAccessories",
  "fanCovers",
  "suspensionKits"
] as const;

export type ProductCatalogCategory = (typeof productCatalogCategories)[number];

export interface ProductCatalogVariant {
  id: string;
  color?: string;
  offset?: string;
  size?: string;
  compound?: string;
  packCount?: string;
  sku?: string;
  displayName: string;
  sourceProductName?: string;
  sourceUrl?: string;
}

export interface ProductCatalogItem {
  id: string;
  category: ProductCatalogCategory;
  subcategory?: string;
  brand: string;
  productName: string;
  simplifiedName?: string;
  displayName?: string;
  partNumber?: string;
  modelNumber: string;
  productType?: string;
  compatibleChassis: string[];
  notes: string;
  tunableParameters: string[];
  sourceUrl?: string;
  sourceName?: string;
  imageUrl?: string;
  imageSourceUrl?: string;
  imageSourceKind?: "og:image" | "twitter:image" | "json-ld" | "img";
  imageLastCheckedAt?: string;
  imageNeedsReview?: boolean;
  userAdded: boolean;
  verified: boolean;
  confidence?: "high" | "medium" | "low";
  needsReview?: boolean;
  categorizationReason?: string;
  excludedCategories?: string[];
  discontinued?: boolean;
  tuneSelectable?: boolean;
  hiddenFromTuneBuilder?: boolean;
  reasonHidden?: string;
  canonicalProductId?: string;
  canonicalVariantId?: string;
  variants?: ProductCatalogVariant[];
  aliases?: string[];
  legacyIds?: string[];
  lastCheckedAt?: string;
}

const electronicsCategoryMap = {
  servo: "servos",
  gyro: "gyros",
  motor: "motors",
  esc: "escs",
  tire: "tires",
  wheel: "frontWheels"
} as const;

export const defaultTunableParametersByCategory: Partial<Record<ProductCatalogCategory, string[]>> = {
  escs: ["profile name", "throttle curve", "throttle punch", "brake strength", "drag brake", "neutral brake", "boost", "turbo", "timing", "PWM / drive frequency", "BEC voltage", "notes"],
  servos: ["speed", "torque", "smoother", "dead band", "damper", "stretcher", "boost", "endpoints", "center trim", "mode", "notes"],
  gyros: ["gain", "mode", "curve", "endpoint", "direction", "notes"],
  frontKnuckles: ["upper arm hole", "lower arm hole", "spacer position", "trail if applicable", "steering stop", "notes"],
  knucklePlates: ["plate type", "intended feel", "kingpin/trail effect", "notes"],
  frontLowerArms: ["inner shim", "outer shim", "arm length", "spacer position", "notes"],
  rearLowerArms: ["inner shim", "outer shim", "arm length", "spacer position", "notes"],
  frontToeBlocks: ["toe angle", "bushing", "shim", "position", "notes"],
  rearToeBlocks: ["toe angle", "bushing", "shim", "position", "notes"],
  frontWheels: ["brand", "model", "offset", "diameter", "width", "notes"],
  rearWheels: ["brand", "model", "offset", "diameter", "width", "notes"],
  tires: ["brand", "model", "compound", "diameter", "surface", "notes"],
  springs: ["brand", "model", "front/rear", "length", "rate if known", "notes"],
  frontShockTowers: ["upper shock hole", "tower height", "spacer", "notes"],
  rearShockTowers: ["upper shock hole", "tower height", "spacer", "notes"],
  frontUpperArms: ["inner hole", "outer hole", "arm length", "spacer position", "notes"],
  rearUpperArms: ["inner hole", "outer hole", "arm length", "spacer position", "notes"],
  shockPistons: ["hole count", "hole diameter", "piston thickness", "notes"],
  shockShafts: ["length", "diameter", "coating", "notes"],
  damperOils: ["viscosity", "front/rear use", "temperature notes", "notes"],
  motorRotors: ["diameter", "magnet strength", "motor compatibility", "notes"],
  motorStators: ["turn rating", "motor compatibility", "notes"],
  capacitors: ["capacity", "voltage", "ESC compatibility", "mounting notes"],
  servoHorns: ["spline", "length", "offset", "notes"],
  differentials: ["type", "oil", "grease", "shim setup", "notes"]
};

function itemFromExistingPart(part: (typeof rcParts)[number], category: ProductCatalogCategory): ProductCatalogItem {
  return {
    id: part.slug,
    category,
    brand: part.brand,
    productName: part.model,
    modelNumber: "",
    compatibleChassis: [],
    notes: part.notes ?? "",
    tunableParameters: defaultTunableParametersByCategory[category] ?? [],
    userAdded: false,
    verified: false
  };
}

const electronicsCatalogItems = rcParts
  .filter((part) => part.category in electronicsCategoryMap)
  .flatMap((part) => {
    const category = electronicsCategoryMap[part.category as keyof typeof electronicsCategoryMap];
    const item = itemFromExistingPart(part, category);
    if (part.category === "wheel") {
      return [item, { ...item, id: `${item.id}-rear`, category: "rearWheels" as const }];
    }
    return [item];
  });

function catalogItem(input: Omit<ProductCatalogItem, "userAdded" | "verified"> & { verified?: boolean }): ProductCatalogItem {
  return {
    ...input,
    userAdded: false,
    verified: Boolean(input.verified && input.sourceUrl)
  };
}

const hrcMountedDriftSets = [
  {
    id: "hrc-hrc61071ch-5-spoke-chrome-3mm-mounted-drift-set",
    productName: "5-Spoke Mounted Drift Set - Chrome / 3mm",
    modelNumber: "HRC61071CH",
    notes: "1/10 slick drift tires mounted on 5-spoke chrome wheels with 3mm offset.",
    sourceUrl: "https://www.rc-multistore.com/hrc-racing-reifen-1-10-drift-montiert-5-spoke-chrome-felgen-3mm-offset-slick-2-stk-hrc61071ch"
  },
  {
    id: "hrc-hrc61071bw-cls-black-white-3mm-mounted-drift-set",
    productName: "CLS Mounted Drift Set - Black / White / 3mm",
    modelNumber: "HRC61071BW",
    notes: "1/10 slick drift tires mounted on CLS black/white wheels with 3mm offset.",
    sourceUrl: "https://www.mkracing.eu/hrc-racing-reifen-1-10-drift-montiert-cls-schwarz-weiss-felgen-3mm-offset-slick-hrc61071bw.html"
  },
  {
    id: "hrc-hrc61071gm-5-spoke-gunmetal-3mm-mounted-drift-set",
    productName: "5-Spoke Mounted Drift Set - Gunmetal / 3mm",
    modelNumber: "HRC61071GM",
    notes: "1/10 slick drift tires mounted on 5-spoke gunmetal wheels with 3mm offset.",
    sourceUrl: "https://planet-rc.ch/reifen-1-10-drift-montiert-5-spoke-gunmetal-felgen-3mm-offset-slick-2-stk-en/"
  },
  {
    id: "hrc-hrc61062or-5-spoke-black-orange-6mm-mounted-drift-set",
    productName: "5-Spoke Mounted Drift Set - Black / Orange / 6mm",
    modelNumber: "HRC61062OR",
    notes: "1/10 slick drift tires mounted on 5-spoke black/orange wheels with 6mm offset.",
    sourceUrl: "https://www.modellbau-profi.de/RC-Autos-Zubehoer/Reifen-und-Felgen/Reifen-Drift/Drift-Reifen-1-10-montiert-5-Spoke-Felgen-6mm-Offset-Schwarz-orange-2st-.htm?ProdNr=293HRC61062OR&a=article&p=9086"
  }
];

const hrcCatalogItems: ProductCatalogItem[] = hrcMountedDriftSets.flatMap((item) => [
  catalogItem({
    ...item,
    id: `${item.id}-tire`,
    category: "tires",
    brand: "HRC",
    compatibleChassis: ["Universal"],
    tunableParameters: defaultTunableParametersByCategory.tires ?? [],
    verified: true
  }),
  catalogItem({
    ...item,
    id: `${item.id}-front-wheel`,
    category: "frontWheels",
    brand: "HRC",
    compatibleChassis: ["Universal"],
    tunableParameters: defaultTunableParametersByCategory.frontWheels ?? [],
    verified: true
  }),
  catalogItem({
    ...item,
    id: `${item.id}-rear-wheel`,
    category: "rearWheels",
    brand: "HRC",
    compatibleChassis: ["Universal"],
    tunableParameters: defaultTunableParametersByCategory.rearWheels ?? [],
    verified: true
  })
]);

const hrcNerdCatalogItems: ProductCatalogItem[] = [
  catalogItem({
    id: "hrc-hrc000037-nerd-damper-ss-10mm-trf-od",
    category: "dampers",
    brand: "HRC",
    productName: "NERD Damper SS Shaft - TRF / OD 10mm",
    modelNumber: "HRC000037",
    compatibleChassis: ["TRF damper", "Overdose damper", "Universal"],
    notes: "Adjustable damping force shaft/piston core for TRF/OD style dampers. Cylinders, caps, diaphragms, and rod guides are not included.",
    tunableParameters: ["damping dial turns", "Nd oil weight", "spring retainer", "O-ring / X-ring", "notes"],
    sourceUrl: "https://supergdrift.com/products/nerd-damper-ss-set-spring-retainers-combo-trf-od-hrc-hrc000037-hrc000039",
    verified: true
  }),
  catalogItem({
    id: "hrc-hrc000045-nerd-damper-slf-big-bore-11mm-yokomo",
    category: "dampers",
    brand: "HRC",
    productName: "NERD Damper SLF Big Bore Shaft - Yokomo 11mm",
    modelNumber: "HRC000045",
    compatibleChassis: ["Yokomo YD", "Yokomo RD", "Yokomo SD", "Yokomo MD"],
    notes: "Adjustable damping force shaft/piston core for Yokomo-style big bore dampers.",
    tunableParameters: ["damping dial turns", "Nd oil weight", "spring retainer", "O-ring / X-ring", "notes"],
    sourceUrl: "https://supergdrift.com/products/nerd-damper-slf-big-bore-pair-only-yokomo-yd2-hrc-hrc000045",
    verified: true
  }),
  catalogItem({
    id: "hrc-hrc000064-nerd-ultimo-dlc-10mm-trf-od",
    category: "dampers",
    brand: "HRC",
    productName: "NERD ULTIMO DLC Damper Shaft - TRF / OD 10mm",
    modelNumber: "HRC000064",
    compatibleChassis: ["TRF damper", "Overdose damper", "Universal"],
    notes: "ULTIMO DLC adjustable damper shaft set with 10mm piston for TRF/OD style dampers.",
    tunableParameters: ["damping dial turns", "Nd oil weight", "spring retainer", "X-ring guide", "notes"],
    sourceUrl: "https://supergdrift.com/products/nerd-ultimo-dlc-adjustable-damper-shaft-set-2pc-trf-od-hrc-hrc000064",
    verified: true
  }),
  catalogItem({
    id: "hrc-hrc000065-nerd-ultimo-dlc-11mm-yokomo",
    category: "dampers",
    brand: "HRC",
    productName: "NERD ULTIMO DLC Damper Shaft - Yokomo 11mm",
    modelNumber: "HRC000065",
    compatibleChassis: ["Yokomo YD", "Yokomo RD", "Yokomo SD", "Yokomo MD"],
    notes: "ULTIMO DLC adjustable damper shaft set with 11mm piston for Yokomo big bore dampers.",
    tunableParameters: ["damping dial turns", "Nd oil weight", "spring retainer", "X-ring guide", "notes"],
    sourceUrl: "https://rc-hrc.shop-pro.jp/?pid=186529419",
    verified: true
  }),
  catalogItem({
    id: "hrc-hrc000039-nerd-adjustable-spring-retainer",
    category: "dampers",
    brand: "HRC",
    productName: "NERD Adjustable Spring Retainer",
    modelNumber: "HRC000039",
    compatibleChassis: ["NERD Damper"],
    notes: "Threaded spring retainer for HRC NERD dampers; supports preload and damper length adjustment at the retainer.",
    tunableParameters: ["preload", "retainer height", "ball end position", "notes"],
    sourceUrl: "https://shopping.rc-art.net/products/e/4589744640391/",
    verified: true
  }),
  catalogItem({
    id: "hrc-hrc000037-hrc000039-nerd-ss-combo-trf-od",
    category: "dampers",
    brand: "HRC",
    productName: "NERD Damper SS Combo - TRF / OD",
    modelNumber: "HRC000037 + HRC000039",
    compatibleChassis: ["TRF damper", "Overdose damper", "Universal"],
    notes: "Combo listing: two pairs of HRC000037 NERD shafts plus two pairs of HRC000039 spring retainers.",
    tunableParameters: ["damping dial turns", "Nd oil weight", "preload", "notes"],
    sourceUrl: "https://supergdrift.com/products/nerd-damper-ss-set-spring-retainers-combo-trf-od-hrc-hrc000037-hrc000039",
    verified: true
  }),
  catalogItem({
    id: "hrc-hrc000045-hrc000039-nerd-slf-big-bore-combo-yokomo",
    category: "dampers",
    brand: "HRC",
    productName: "NERD Damper SLF Big Bore Combo - Yokomo",
    modelNumber: "HRC000045 + HRC000039",
    compatibleChassis: ["Yokomo YD", "Yokomo RD", "Yokomo SD", "Yokomo MD"],
    notes: "Combo listing: two pairs of HRC000045 NERD big bore shafts plus two pairs of HRC000039 spring retainers.",
    tunableParameters: ["damping dial turns", "Nd oil weight", "preload", "notes"],
    sourceUrl: "https://supergdrift.com/products/nerd-damper-slf-big-bore-set-spring-retainers-combo-yokomo-yd2-hrc-hrc000045-hrc000039",
    verified: true
  }),
  catalogItem({
    id: "hrc-hrc000040-nerd-nd-shock-oil-10wt",
    category: "damperOils",
    brand: "HRC",
    productName: "NERD Nd Shock Oil - 10 wt",
    modelNumber: "HRC000040",
    compatibleChassis: ["NERD Damper"],
    notes: "Dedicated HRC Nd oil for NERD dampers; 10 wt is the softer option.",
    tunableParameters: defaultTunableParametersByCategory.damperOils ?? [],
    sourceUrl: "https://supergdrift.com/products/nerd-damper-fluid-10-20-30-nd-shock-oil-hrc-hrc000040-hrc000041-hrc000042",
    verified: true
  }),
  catalogItem({
    id: "hrc-hrc000041-nerd-nd-shock-oil-20wt",
    category: "damperOils",
    brand: "HRC",
    productName: "NERD Nd Shock Oil - 20 wt",
    modelNumber: "HRC000041",
    compatibleChassis: ["NERD Damper"],
    notes: "Dedicated HRC Nd oil for NERD dampers; 20 wt is the medium option.",
    tunableParameters: defaultTunableParametersByCategory.damperOils ?? [],
    sourceUrl: "https://supergdrift.com/products/nerd-damper-fluid-10-20-30-nd-shock-oil-hrc-hrc000040-hrc000041-hrc000042",
    verified: true
  }),
  catalogItem({
    id: "hrc-hrc000042-nerd-nd-shock-oil-30wt",
    category: "damperOils",
    brand: "HRC",
    productName: "NERD Nd Shock Oil - 30 wt",
    modelNumber: "HRC000042",
    compatibleChassis: ["NERD Damper"],
    notes: "Dedicated HRC Nd oil for NERD dampers; 30 wt is the harder option.",
    tunableParameters: defaultTunableParametersByCategory.damperOils ?? [],
    sourceUrl: "https://supergdrift.com/products/nerd-damper-fluid-10-20-30-nd-shock-oil-hrc-hrc000040-hrc000041-hrc000042",
    verified: true
  })
];

const chassisCatalogItems: ProductCatalogItem[] = [
  catalogItem({
    id: "reve-d-d1-415fm-rdx-molded-front-knuckle",
    category: "frontKnuckles",
    brand: "Reve D",
    productName: "D1-415FM RDX Molded Front Knuckle",
    modelNumber: "D1-415FM",
    compatibleChassis: ["RDX"],
    notes: "RDX molded front knuckle set.",
    tunableParameters: defaultTunableParametersByCategory.frontKnuckles ?? [],
    sourceUrl: "https://teamreved.com/product/d1-415fm",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-415fg-rdx-graphite-front-knuckle",
    category: "frontKnuckles",
    brand: "Reve D",
    productName: "D1-415FG RDX Graphite Front Knuckle",
    modelNumber: "D1-415FG",
    compatibleChassis: ["RDX"],
    notes: "Graphite resin front knuckle for RDX.",
    tunableParameters: defaultTunableParametersByCategory.frontKnuckles ?? [],
    sourceUrl: "https://teamreved.com/product/d1-415fg",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-415fa-rdx-aluminum-front-knuckle",
    category: "frontKnuckles",
    brand: "Reve D",
    productName: "D1-415FA RDX Aluminum Front Knuckle",
    modelNumber: "D1-415FA",
    compatibleChassis: ["RDX"],
    notes: "Silver Edge aluminum front knuckle set for RDX.",
    tunableParameters: defaultTunableParametersByCategory.frontKnuckles ?? [],
    sourceUrl: "https://supergdrift.com/products/silver-edge-aluminum-front-knuckle-set-for-rwd-drift-rdx-reve-d-d1-415fa",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-mk-b-rdx-multi-select-front-knuckle-base",
    category: "frontKnuckles",
    brand: "Reve D",
    productName: "D1-MK-B RDX Multi-select Front Knuckle Base",
    modelNumber: "D1-MK-B",
    compatibleChassis: ["RDX"],
    notes: "Aluminum multi-select front knuckle base for RDX.",
    tunableParameters: ["upper arm hole", "lower arm hole", "plate option", "spacer position", "steering stop", "notes"],
    sourceUrl: "https://teamreved.com/product/d1-mk-b",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-mk-b2-rdx-multi-front-knuckle-offset-base",
    category: "frontKnuckles",
    brand: "Reve D",
    productName: "D1-MK-B2 RDX Multi Front Knuckle 2.0mm Offset Base",
    modelNumber: "D1-MK-B2",
    compatibleChassis: ["RDX"],
    notes: "2.0mm offset type base part for the RDX multi front knuckle system.",
    tunableParameters: ["upper arm hole", "lower arm hole", "plate option", "offset", "spacer position", "notes"],
    sourceUrl: "https://teamreved.com/product/d1-mk-b2",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-mk-ph-rdx-multi-select-knuckle-plate-hikaru",
    category: "knucklePlates",
    brand: "Reve D",
    productName: "D1-MK-PH RDX Multi-select Knuckle Plate HIKARU",
    modelNumber: "D1-MK-PH",
    compatibleChassis: ["RDX", "MC-III", "MC-3"],
    notes: "Aluminum HIKARU plate for the RDX multi-select front knuckle base.",
    tunableParameters: defaultTunableParametersByCategory.knucklePlates ?? [],
    sourceUrl: "https://supergdrift.com/products/rdx-multi-select-front-knuckle-base-plate-for-rwd-1-10-drift-reve-d-d1-mk-ph",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-mk-pa-rdx-multi-select-knuckle-plate-akira",
    category: "knucklePlates",
    brand: "Reve D",
    productName: "D1-MK-PA RDX Multi-select Knuckle Plate AKIRA",
    modelNumber: "D1-MK-PA",
    compatibleChassis: ["RDX", "MC-III", "MC-3"],
    notes: "Aluminum AKIRA plate for the RDX multi-select front knuckle base.",
    tunableParameters: defaultTunableParametersByCategory.knucklePlates ?? [],
    sourceUrl: "https://www.vertexrc-usa.com/index.php/reve-d-multi-select-knuckle-plate-akira-d1-mk-pa.html",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-mk-pu-rdx-multi-select-knuckle-plate-type-us",
    category: "knucklePlates",
    brand: "Reve D",
    productName: "D1-MK-PU RDX Multi-select Knuckle Plate Type US",
    modelNumber: "D1-MK-PU",
    compatibleChassis: ["RDX", "MC-III", "MC-3"],
    notes: "Type US aluminum plate for the RDX multi-select front knuckle base.",
    tunableParameters: defaultTunableParametersByCategory.knucklePlates ?? [],
    sourceUrl: "https://www.vertexrc-usa.com/index.php/reve-d-rdx-multi-select-front-knuckle-2mm-offset-base-d1-mk-b2.html",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rd-001-asl-front-knuckle",
    category: "frontKnuckles",
    brand: "Reve D",
    productName: "RD-001 ASL Front Knuckle",
    modelNumber: "RD-001",
    compatibleChassis: ["Universal", "YD-2"],
    notes: "ASL aluminum front knuckle.",
    tunableParameters: defaultTunableParametersByCategory.frontKnuckles ?? [],
    sourceUrl: "https://nextlevelrccars.com/shop/reved-110-parts/reve-d-asl-front-knuckle-rd-001/",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rd-001sg-sg-front-knuckle",
    category: "frontKnuckles",
    brand: "Reve D",
    productName: "RD-001SG SG Front Knuckle",
    modelNumber: "RD-001SG",
    compatibleChassis: ["Universal"],
    notes: "SG front knuckle developed for use with SG bell crank geometry.",
    tunableParameters: defaultTunableParametersByCategory.frontKnuckles ?? [],
    sourceUrl: "https://ignitehobbies.com/products/reve-d-alum-sg-front-knuckle",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-415sa-adjustable-kingpin-steering-block",
    category: "frontKnuckles",
    brand: "Yokomo",
    productName: "Y2-415SA Adjustable Kingpin Angle Steering Block",
    modelNumber: "Y2-415SA",
    compatibleChassis: ["YD-2", "YD-2E", "YD-2S", "YD-2SX", "YD-2Z", "YD-2 ZX"],
    notes: "Adjustable kingpin angle steering block for YD-2. Yokomo lists it as discontinued.",
    tunableParameters: ["kingpin spacer", "upper arm hole", "lower arm hole", "spacer position", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-415SA/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-415sala-lightweight-steering-block",
    category: "frontKnuckles",
    brand: "Yokomo",
    productName: "Y2-415SALA Lightweight Front Steering Block",
    modelNumber: "Y2-415SALA",
    compatibleChassis: ["YD-2", "YD-2E", "YD-2S", "YD-2SX", "YD-2Z", "YD-2 ZX", "YD-2RX", "YD-4", "RD 1.0", "SD 1.0", "SD 2.0", "SD 3.0"],
    notes: "Aluminum lightweight steering block with variable kingpin angle.",
    tunableParameters: ["kingpin spacer", "upper arm hole", "lower arm hole", "spacer position", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-415SALA/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-415cpfa-front-steering-block-dummy-brake",
    category: "frontKnuckles",
    brand: "Yokomo",
    productName: "Y2-415CPFA Front Steering Block for Dummy Brake",
    modelNumber: "Y2-415CPFA",
    compatibleChassis: ["YD-2", "YD-2E", "YD-2S", "YD-2SX", "YD-2Z", "YD-2 ZX", "YD-4"],
    notes: "YD-2 series steering block for the Yokomo dummy brake set.",
    tunableParameters: ["upper arm hole", "lower arm hole", "trail", "kingpin angle", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-415CPFA/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-008fsca-aluminum-front-short-lower-a-arm",
    category: "frontLowerArms",
    brand: "Yokomo",
    productName: "Y2-008FSCA Aluminum Front Short Lower A Arm Set",
    modelNumber: "Y2-008FSCA",
    compatibleChassis: ["YD-2", "YD-4", "RD 1.0", "SD 1.0", "SD 2.0", "SD 3.0"],
    notes: "Aluminum front short lower A arm set for YD-2/YD-4 series.",
    tunableParameters: ["inner shim", "outer shim", "arm length", "shock mounting hole", "spacer position", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-008FSCA",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-008rsa-short-rear-suspension-arm",
    category: "rearLowerArms",
    brand: "Yokomo",
    productName: "Y2-008RSA Short Rear Suspension Arm",
    modelNumber: "Y2-008RSA",
    compatibleChassis: ["YD-2", "YD-2E", "YD-2S", "YD-2SX", "YD-2Z", "YD-2 ZX", "YD-4", "RD 1.0", "SD 1.0", "SD 2.0", "SD 3.0"],
    notes: "Short rear suspension arm for YD-2 series.",
    tunableParameters: ["inner shim", "outer shim", "arm length", "shock mounting hole", "spacer position", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-008RSA",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-415rba-brass-rear-hub-carrier",
    category: "rearHubCarriers",
    brand: "Yokomo",
    productName: "Y2-415RBA Brass Rear Hub Carrier",
    modelNumber: "Y2-415RBA",
    compatibleChassis: ["YD-2", "YD-2E", "YD-2S", "YD-2SX", "YD-2Z", "YD-2 ZX", "YD-2RX"],
    notes: "Brass rear hub carrier for YD-2 series.",
    tunableParameters: ["upper arm hole", "lower arm hole", "hub weight", "spacer position", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-415RBA/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-rd-415ar-chamfered-rear-hub-carrier",
    category: "rearHubCarriers",
    brand: "Yokomo",
    productName: "RD-415AR Chamfered Rear Hub Carrier",
    modelNumber: "RD-415AR",
    compatibleChassis: ["RD 2.0", "SD 3.0"],
    notes: "Chamfered aluminum rear hub carrier for RD2.0/SD3.0.",
    tunableParameters: ["upper arm hole", "lower arm pin position", "roll center", "spacer position", "notes"],
    sourceUrl: "https://www.vertexrc-usa.com/index.php/shop-all/yokomo-chamfered-rear-hub-carrier-for-rd2-0-sd3-0-black-rd-415ar.html",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-301ara-adjustable-suspension-mount-set",
    category: "rearToeBlocks",
    brand: "Yokomo",
    productName: "Y2-301ARA Aluminum Adjustable Suspension Mount Set",
    modelNumber: "Y2-301ARA",
    compatibleChassis: ["YD-2", "YD-2Z", "RD 1.0", "SD 1.0", "SD 2.0", "SD 3.0"],
    notes: "Aluminum adjustable suspension mount set with B/D/E mounts.",
    tunableParameters: ["toe angle", "mount width", "bushing", "shim", "position", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-301ARA/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-301db-brass-rear-suspension-mount-d",
    category: "rearToeBlocks",
    brand: "Yokomo",
    productName: "Y2-301DB Brass Rear Suspension Mount D",
    modelNumber: "Y2-301DB",
    compatibleChassis: ["YD-2", "YD-2SX", "YD-2Z", "YD-2RX"],
    notes: "Brass rear suspension mount D for YD-2.",
    tunableParameters: ["toe angle", "mount width", "bushing", "shim", "position", "notes"],
    sourceUrl: "https://teamyokomo.com/topics/11404/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-301eb-brass-rear-suspension-mount-e",
    category: "rearToeBlocks",
    brand: "Yokomo",
    productName: "Y2-301EB Brass Rear Suspension Mount E",
    modelNumber: "Y2-301EB",
    compatibleChassis: ["YD-2", "YD-2SX", "YD-2Z", "YD-2RX"],
    notes: "Brass rear suspension mount E for YD-2.",
    tunableParameters: ["toe angle", "mount width", "bushing", "shim", "position", "notes"],
    sourceUrl: "https://teamyokomo.com/topics/11404/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-002tsa-lightweight-flexible-chassis-set",
    category: "decks",
    brand: "Yokomo",
    productName: "Y2-002TSA Teams Lightweight Flexible Chassis Set",
    modelNumber: "Y2-002TSA",
    compatibleChassis: ["YD-2"],
    notes: "Lightweight flexible chassis set for YD-2.",
    tunableParameters: ["deck material", "flex", "brace position", "battery position", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-002TSA/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-sbbspa-slf-aluminum-big-bore-shock-set",
    category: "dampers",
    brand: "Yokomo",
    productName: "Y2-SBBSPA SLF Aluminum Big Bore Shock Set",
    modelNumber: "Y2-SBBSPA",
    compatibleChassis: ["YD-2", "YD-2E", "YD-2S", "YD-2SX", "YD-2Z", "YD-2 ZX", "RD 1.0", "SD 1.0", "SD 2.0", "SD 3.0"],
    notes: "Super low-friction aluminum big bore shock set for YD-2.",
    tunableParameters: ["shock oil", "piston", "shaft", "spring cup", "preload", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-SBBSPA/",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rdx-kit-standard-molded-shock-assembly",
    category: "dampers",
    brand: "Reve D",
    productName: "RDX Kit Standard Molded Shock Assembly",
    modelNumber: "RDX standard",
    compatibleChassis: ["RDX", "MC-III", "MC-3"],
    notes: "The molded shock package supplied with the RDX kit, tracked as a selectable damper baseline.",
    tunableParameters: ["shock oil", "piston", "shaft", "spring cup", "preload", "notes"],
    sourceUrl: "https://teamreved.com/product/rkd-rdx",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-s6m-rdx-molded-shock-cap-shock-end",
    category: "dampers",
    brand: "Reve D",
    productName: "D1-S6M RDX Molded Shock Cap / Shock End Set",
    modelNumber: "D1-S6M",
    compatibleChassis: ["RDX", "MC-III", "MC-3"],
    notes: "RDX standard molded shock cap and shock end replacement set.",
    tunableParameters: ["shock end", "cap", "maintenance notes", "notes"],
    sourceUrl: "https://teamreved.com/product/d1-s6m",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-s4moc-rdx-molded-shock-o-ring-cap",
    category: "dampers",
    brand: "Reve D",
    productName: "D1-S4MOC RDX Molded Shock O-ring Cap",
    modelNumber: "D1-S4MOC",
    compatibleChassis: ["RDX", "MC-III", "MC-3"],
    notes: "RDX standard molded shock O-ring cap replacement set.",
    tunableParameters: ["O-ring cap", "maintenance notes", "notes"],
    sourceUrl: "https://teamreved.com/product/d1-s4moc",
    verified: true
  }),
  catalogItem({
    id: "yokomo-d-180a-rwd-drift-spring-set",
    category: "springs",
    brand: "Yokomo",
    productName: "D-180A RWD Drift Spring Set",
    modelNumber: "D-180A",
    compatibleChassis: ["Universal", "YD-2", "YD-2Z", "RD 1.0", "RD 2.0", "SD 1.0", "SD 2.0", "SD 3.0"],
    notes: "Six-type RWD drift spring set.",
    tunableParameters: ["front/rear", "spring rate", "spring length", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/D-180A/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-010fha-aluminum-ul-front-axle",
    category: "frontAxles",
    brand: "Yokomo",
    productName: "Y2-010FHA Aluminum UL Front Axle",
    modelNumber: "Y2-010FHA",
    compatibleChassis: ["YD-2", "YD-2E", "YD-2S", "YD-2SX", "YD-2Z", "YD-2 ZX"],
    notes: "Lightweight integrated aluminum front axle and hex hub for YD-2 series.",
    tunableParameters: ["axle length", "hex width", "wheel spacing", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-010FHA/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-011cb8a-clamping-front-wheel-hub-8mm",
    category: "frontAxles",
    brand: "Yokomo",
    productName: "Y2-011CB8A 8.0mm Clamping Front Wheel Hub",
    modelNumber: "Y2-011CB8A",
    compatibleChassis: ["YD-2", "YD-2E", "YD-2S", "YD-2SX", "YD-2Z", "YD-2 ZX"],
    notes: "8.0mm aluminum clamping wheel hub.",
    tunableParameters: ["hub thickness", "track width", "wheel spacing", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-011CB8A/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-010a-rear-universal-drive-shaft-49mm",
    category: "rearAxles",
    brand: "Yokomo",
    productName: "Y2-010A Rear Universal Drive Shaft 49mm",
    modelNumber: "Y2-010A",
    compatibleChassis: ["YD-2", "YD-2Z", "RD 1.0", "RD 2.0", "SD 1.0", "SD 2.0", "SD 3.0"],
    notes: "49mm rear universal drive shaft for YD-2.",
    tunableParameters: ["shaft length", "axle angle", "track width", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-010A/",
    verified: true
  }),
  catalogItem({
    id: "mst-atk-v3-upright",
    category: "frontKnuckles",
    brand: "MST",
    productName: "ATK V3 Upright",
    modelNumber: "820141",
    compatibleChassis: ["RMX 2.0", "RMX 2.5", "RMX EX", "RMX 4", "FRX", "MRX"],
    notes: "MST ATK V3 front upright/knuckle listed in MST upgrade comparison materials.",
    tunableParameters: ["trail", "upper arm position", "lower arm position", "steering stop", "spacer position", "notes"],
    sourceUrl: "https://www.rc-mst.com/_upload/down_item_img/202508280847082a.pdf",
    verified: true
  }),
  catalogItem({
    id: "mst-820162-atk-v3-aluminum-front-upright",
    category: "frontKnuckles",
    brand: "MST",
    productName: "820162 ATK V3 Aluminum Front Upright",
    modelNumber: "820162",
    compatibleChassis: ["RMX 2.0", "RMX 2.5", "RMX EX", "RMX-M", "MRX", "FRX"],
    notes: "Aluminum ATK V3 front upright/hub set.",
    tunableParameters: ["trail", "upper arm position", "lower arm position", "spacer position", "steering stop", "notes"],
    sourceUrl: "https://www.hobbytown.com/mst-aluminum-atk-v3-front-wheel-hub-uprights-red-2-mxs-820162r/p1644780",
    verified: true
  }),
  catalogItem({
    id: "mst-820147-aluminum-front-lower-arm-set",
    category: "frontLowerArms",
    brand: "MST",
    productName: "820147 Aluminum Front Lower Arm Set",
    modelNumber: "820147",
    compatibleChassis: ["RMX 2.0", "RMX 2.5", "RMX EX", "RMX-M", "MRX", "FRX"],
    notes: "MST aluminum front lower arm set listed in MST upgrade comparison material.",
    tunableParameters: ["inner shim", "outer shim", "arm length", "shock mounting hole", "spacer position", "notes"],
    sourceUrl: "https://www.rc-mst.com/_upload/down_item_img/202508280847082a.pdf",
    verified: true
  }),
  catalogItem({
    id: "mst-210575-aluminum-front-upper-arm-set",
    category: "frontLowerArms",
    brand: "MST",
    productName: "210575 Aluminum Front Upper Arm Set",
    modelNumber: "210575",
    compatibleChassis: ["RMX 2.0", "RMX 2.5", "FMX 2.0"],
    notes: "MST aluminum front upper arm set. Included in catalog as front suspension arm setup support.",
    tunableParameters: ["caster", "inner shim", "outer shim", "arm length", "spacer position", "notes"],
    sourceUrl: "https://www.driftmanjirc.com/products/mst-rmx-rrx-2-0-aluminium-upper-arm-set-rc-drift-car-210575",
    verified: true
  }),
  catalogItem({
    id: "mst-210070-ht-rear-lower-arm-wheel-hub",
    category: "rearLowerArms",
    brand: "MST",
    productName: "210070 HT Rear Lower Arm & Wheel Hub",
    modelNumber: "210070",
    compatibleChassis: ["RMX 2.0", "RMX 2.5"],
    notes: "HT rear lower arm and wheel hub listed in MST exploded view materials.",
    tunableParameters: ["inner shim", "outer shim", "arm length", "hub spacing", "notes"],
    sourceUrl: "https://www.rc-mst.com/_upload/down_item_img/202011040303542a.pdf",
    verified: true
  }),
  catalogItem({
    id: "mst-230069-suspension-mount-set",
    category: "rearToeBlocks",
    brand: "MST",
    productName: "230069 Suspension Mount Set +1.0/-2.0",
    modelNumber: "230069",
    compatibleChassis: ["RMX 2.0", "RMX 2.5"],
    notes: "Suspension mount set listed in MST exploded view materials.",
    tunableParameters: ["toe angle", "mount offset", "shim", "position", "notes"],
    sourceUrl: "https://www.rc-mst.com/_upload/down_item_img/202011040303542a.pdf",
    verified: true
  }),
  catalogItem({
    id: "mst-210636-esc-rear-mount-set",
    category: "decks",
    brand: "MST",
    productName: "210636 ESC Rear Mount Set",
    modelNumber: "210636",
    compatibleChassis: ["RMX 2.0", "RMX 2.5"],
    notes: "ESC rear mount set from MST upgrade comparison material.",
    tunableParameters: ["ESC position", "weight bias", "rear traction", "notes"],
    sourceUrl: "https://www.rc-mst.com/_upload/down_item_img/202508280847082a.pdf",
    verified: true
  }),
  catalogItem({
    id: "mst-820157-dk-rwd-drift-spring-set",
    category: "springs",
    brand: "MST",
    productName: "820157 DK-RWD Drift Spring Set",
    modelNumber: "820157",
    compatibleChassis: ["RMX 2.0", "RMX 2.5", "RMX EX", "RMX-M", "MRX", "FRX", "FXX"],
    notes: "DK-RWD drift spring set with front 26mm and rear 28mm soft/medium/hard springs.",
    tunableParameters: ["front/rear", "spring length", "spring rate", "notes"],
    sourceUrl: "https://www.elitedriftshop.com/en/shop/mst-drift-spring-set-mst820157/",
    verified: true
  }),
  catalogItem({
    id: "mst-820103-820112-suspension-coil-spring-set",
    category: "springs",
    brand: "MST",
    productName: "820103-820112 Suspension Coil Spring Set",
    modelNumber: "820103/820104/820105/820106/820110/820112",
    compatibleChassis: ["RMX 2.0", "RMX 2.5", "RRX", "FXX", "MRX", "FMX 2.0"],
    notes: "MST suspension coil spring sets in multiple rates.",
    tunableParameters: ["front/rear", "spring length", "spring rate", "notes"],
    sourceUrl: "https://www.driftmanjirc.com/collections/rc-mst-max-speed-technology/products/rc-drift-suspension-coil-spring-set-mst-various-spring-rates-drift-manji",
    verified: true
  }),
  catalogItem({
    id: "mst-832109-gt-adjustable-offset-wheel",
    category: "frontWheels",
    brand: "MST",
    productName: "832109 GT Adjustable Offset Wheel",
    modelNumber: "832109",
    compatibleChassis: ["Universal", "RMX 2.0", "RMX 2.5", "RMX EX", "FXX", "MRX"],
    notes: "MST GT adjustable-offset wheel, commonly listed with +3/+5/+7/+9mm offset settings.",
    tunableParameters: ["offset", "diameter", "width", "color", "notes"],
    sourceUrl: "https://www.rcteam.com/en/products/mst-gt-wheels-with-adjustable-offset-black-chrome-chrome-x4-832109sbk",
    verified: true
  }),
  catalogItem({
    id: "mst-832109-gt-adjustable-offset-wheel-rear",
    category: "rearWheels",
    brand: "MST",
    productName: "832109 GT Adjustable Offset Wheel",
    modelNumber: "832109",
    compatibleChassis: ["Universal", "RMX 2.0", "RMX 2.5", "RMX EX", "FXX", "MRX"],
    notes: "MST GT adjustable-offset wheel, commonly listed with +3/+5/+7/+9mm offset settings.",
    tunableParameters: ["offset", "diameter", "width", "color", "notes"],
    sourceUrl: "https://www.rcteam.com/en/products/mst-gt-wheels-with-adjustable-offset-black-chrome-chrome-x4-832109sbk",
    verified: true
  }),
  catalogItem({
    id: "wrap-up-next-gx-rwd-front-knuckle-v4",
    category: "frontKnuckles",
    brand: "Wrap-Up Next",
    productName: "GX RWD Front Knuckle Ver.4",
    modelNumber: "0627-FD",
    compatibleChassis: ["YD-2", "Universal"],
    notes: "GX RWD front knuckle Ver.4.",
    tunableParameters: ["upper arm hole", "lower arm hole", "kingpin angle extension", "trail", "spacer position", "notes"],
    sourceUrl: "https://rcpace.com/wrap-up-next-gx-rwd-front-knuckle-ver-4-super-lightweight-purple.html",
    verified: true
  }),
  catalogItem({
    id: "wrap-up-next-reversa-front-knuckle",
    category: "frontKnuckles",
    brand: "Wrap-Up Next",
    productName: "Reversa Front Knuckle",
    modelNumber: "0780-FD",
    compatibleChassis: ["Universal"],
    notes: "Reversa front knuckle.",
    tunableParameters: ["upper arm hole", "lower arm hole", "reversible position", "trail", "spacer position", "notes"],
    sourceUrl: "https://www.vertexrc-usa.com/index.php/wrap-up-next-reversa-front-knuckle-red-0780-fd.html",
    verified: true
  }),
  catalogItem({
    id: "wrap-up-next-vx-front-knuckle",
    category: "frontKnuckles",
    brand: "Wrap-Up Next",
    productName: "VX Front Knuckle",
    modelNumber: "0222-FD",
    compatibleChassis: ["Universal"],
    notes: "VX RWD front knuckle with scrub and trail adjustment.",
    tunableParameters: ["kingpin angle", "scrub", "trail", "upper arm hole", "lower arm hole", "notes"],
    sourceUrl: "https://www.vertexrc-usa.com/WRAP-UP-NEXT-VX-FRONT-KNUCKLE-RED-0222-FD.html",
    verified: true
  }),
  catalogItem({
    id: "overdose-od2277-adjustable-aluminum-rear-hub-carriers",
    category: "rearHubCarriers",
    brand: "Overdose",
    productName: "OD2277 Adjustable Aluminum Rear Hub Carriers",
    modelNumber: "OD2277",
    compatibleChassis: ["GALM", "GALM V2", "YD-2"],
    notes: "Adjustable aluminum rear hub carriers with toe, tread, axle height, and upper arm mounting adjustment.",
    tunableParameters: ["toe angle", "tread width", "axle height", "upper arm hole", "spacer position", "notes"],
    sourceUrl: "https://www.elitedriftshop.com/en/shop/overdose-adjustable-aluminum-rear-hub-carriers-purple-od2277b/",
    verified: true
  }),
  catalogItem({
    id: "overdose-od2898-es-aluminum-rear-upright",
    category: "rearHubCarriers",
    brand: "Overdose",
    productName: "OD2898 ES Aluminum Rear Upright",
    modelNumber: "OD2898",
    compatibleChassis: ["GALM", "GALM V2"],
    notes: "ES aluminum rear upright for GALM series.",
    tunableParameters: ["upper arm hole", "suspension shaft height", "pin diameter", "spacer position", "notes"],
    sourceUrl: "https://rckitout.com/product/overdose-es-aluminum-rear-upright-for-galm-series-red-od2898",
    verified: true
  }),
  catalogItem({
    id: "overdose-od2965-tc-aluminum-suspension-mount-572",
    category: "rearToeBlocks",
    brand: "Overdose",
    productName: "OD2965 TC Aluminum Suspension Mount 57.2mm",
    modelNumber: "OD2965",
    compatibleChassis: ["GALM", "GALM V2"],
    notes: "TAKE-C produced TC suspension mount, 57.2mm width.",
    tunableParameters: ["mount width", "roll center", "toe angle", "shim", "position", "notes"],
    sourceUrl: "https://rcpace.com/overdose-tc-aluminium-suspension-mount-57-2mm-for-galm-purple.html",
    verified: true
  }),
  catalogItem({
    id: "overdose-od3868-aluminum-rear-upper-arm-mount",
    category: "rearToeBlocks",
    brand: "Overdose",
    productName: "OD3868 Aluminum Rear Upper Arm Mount",
    modelNumber: "OD3868",
    compatibleChassis: ["GALM"],
    notes: "Aluminum rear upper arm mount for GALM with multiple upper arm positions.",
    tunableParameters: ["upper arm position", "shock tower level", "camber gain", "notes"],
    sourceUrl: "https://www.drifted.nl/en/alum-rear-upper-arm-mount-for-galm-red.html",
    verified: true
  }),
  catalogItem({
    id: "overdose-od2874-rear-mount-kit",
    category: "decks",
    brand: "Overdose",
    productName: "OD2874 Rear Mount Kit",
    modelNumber: "OD2874",
    compatibleChassis: ["GALM", "GALM V2"],
    notes: "Rear mount kit for GALM/GALM Ver.2.",
    tunableParameters: ["motor position", "rear traction", "weight bias", "notes"],
    sourceUrl: "https://www.mrcplaza.com.au/products/overdose-rear-mount-kit",
    verified: true
  }),
  catalogItem({
    id: "overdose-od3836-rear-mount-kit-type-2",
    category: "decks",
    brand: "Overdose",
    productName: "OD3836 Rear Mount Kit Type-2",
    modelNumber: "OD3836",
    compatibleChassis: ["GALM", "GALM V2"],
    notes: "Rear mount kit Type-2 for GALM/GALM Ver.2.",
    tunableParameters: ["motor position", "gear drive", "weight bias", "rear traction", "notes"],
    sourceUrl: "https://www.drifted.nl/nl/rear-mount-kit-type-2-for-galm-galm-ver2-red.html",
    verified: true
  }),
  catalogItem({
    id: "rhino-rr-1400-shark-adjustable-front-knuckle",
    category: "frontKnuckles",
    brand: "Rhino Racing",
    productName: "RR-1400 SHARK Adjustable Front Knuckle Set",
    modelNumber: "RR-1400",
    compatibleChassis: ["Shark", "Shark Final Form"],
    notes: "SHARK adjustable front knuckle set included in Rhino Racing Final Form chassis kits.",
    tunableParameters: ["upper arm hole", "lower arm hole", "trail", "spacer position", "steering stop", "notes"],
    sourceUrl: "https://rhino-racing.com.cn/product/purple-shark-final-form-factory-assembled-chassis-kit-ifs-1-10-premium-rwd-drift-car-rr-2000p/",
    verified: true
  }),
  catalogItem({
    id: "rhino-rr-1100-shark-ball-bearing-lower-arms",
    category: "frontLowerArms",
    brand: "Rhino Racing",
    productName: "RR-1100 SHARK Ball Bearing Lower Arms",
    modelNumber: "RR-1100",
    compatibleChassis: ["Shark", "Shark Final Form", "YD-2", "RMX", "RDX"],
    notes: "SHARK lower aluminum arms with bearing pivots and spring-loaded shimming.",
    tunableParameters: ["inner shim", "outer shim", "track width", "spring-loaded shimming", "arm length", "notes"],
    sourceUrl: "https://supergdrift.com/collections/lower-upper-arms/products/shark-lower-aluminum-arms-red-purple-black-rhino-racing-rr-1100r-rr-1100p-rr-1100b",
    verified: true
  }),
  catalogItem({
    id: "rhino-rr-1100-shark-ball-bearing-rear-lower-arms",
    category: "rearLowerArms",
    brand: "Rhino Racing",
    productName: "RR-1100 SHARK Ball Bearing Lower Arms",
    modelNumber: "RR-1100",
    compatibleChassis: ["Shark", "Shark Final Form", "YD-2", "RMX", "RDX"],
    notes: "SHARK lower aluminum arms used as front or rear lower arms depending on build.",
    tunableParameters: ["inner shim", "outer shim", "track width", "spring-loaded shimming", "arm length", "notes"],
    sourceUrl: "https://supergdrift.com/collections/lower-upper-arms/products/shark-lower-aluminum-arms-red-purple-black-rhino-racing-rr-1100r-rr-1100p-rr-1100b",
    verified: true
  }),
  catalogItem({
    id: "rhino-rr-1500-shark-rear-upright-set",
    category: "rearHubCarriers",
    brand: "Rhino Racing",
    productName: "RR-1500 SHARK Rear Upright Set",
    modelNumber: "RR-1500",
    compatibleChassis: ["Shark", "Shark Final Form"],
    notes: "SHARK aluminum rear upright/knuckle set.",
    tunableParameters: ["upper arm hole", "active camber", "spacer position", "rear traction", "notes"],
    sourceUrl: "https://www.elitedriftshop.com/en/product/rhino-racing-shark-aluminum-rear-knuckles-uprights-purple-rr-1500p/",
    verified: true
  }),
  catalogItem({
    id: "rhino-rr-1300-shark-suspension-mount-kit",
    category: "rearToeBlocks",
    brand: "Rhino Racing",
    productName: "RR-1300 SHARK Suspension Mount Kit",
    modelNumber: "RR-1300",
    compatibleChassis: ["Shark", "Shark Final Form"],
    notes: "SHARK suspension mount kit included in Final Form assemblies.",
    tunableParameters: ["toe angle", "mount width", "bushing", "shim", "position", "notes"],
    sourceUrl: "https://rhino-racing.com.cn/product/purple-shark-final-form-factory-assembled-chassis-kit-ifs-1-10-premium-rwd-drift-car-rr-2000p/",
    verified: true
  }),
  catalogItem({
    id: "rhino-rr-800-shark-adjustable-chassis-kit",
    category: "decks",
    brand: "Rhino Racing",
    productName: "RR-800 SHARK Adjustable Chassis Kit",
    modelNumber: "RR-800",
    compatibleChassis: ["Shark", "Shark Final Form"],
    notes: "SHARK adjustable chassis kit included in Final Form assemblies.",
    tunableParameters: ["wheelbase", "deck flex", "battery position", "weight bias", "notes"],
    sourceUrl: "https://rhino-racing.com.cn/product/purple-shark-final-form-factory-assembled-chassis-kit-ifs-1-10-premium-rwd-drift-car-rr-2000p/",
    verified: true
  }),
  catalogItem({
    id: "team-associated-72277-dc10-ft-aluminum-steering-blocks",
    category: "frontKnuckles",
    brand: "Team Associated",
    productName: "72277 DC10 FT Aluminum Steering Blocks",
    modelNumber: "72277",
    compatibleChassis: ["DC10", "DC10 RTR"],
    notes: "Factory Team aluminum steering blocks for DC10.",
    tunableParameters: ["upper arm hole", "lower arm hole", "spacer position", "steering stop", "notes"],
    sourceUrl: "https://www.rc-kleinkram.de/en/detail/index/sArticle/59432",
    verified: true
  }),
  catalogItem({
    id: "team-associated-72280-dc10-ft-aluminum-front-upper-arms",
    category: "frontLowerArms",
    brand: "Team Associated",
    productName: "72280 DC10 FT Aluminum Front Upper Arms",
    modelNumber: "72280",
    compatibleChassis: ["DC10", "DC10 RTR"],
    notes: "Factory Team aluminum front upper arms for DC10.",
    tunableParameters: ["caster", "inner shim", "outer shim", "arm spacer", "notes"],
    sourceUrl: "https://www.bigsquidrc.com/associated-announces-factory-team-parts-for-the-dc10/",
    verified: true
  }),
  catalogItem({
    id: "team-associated-72281-dc10-ft-aluminum-front-lower-arms",
    category: "frontLowerArms",
    brand: "Team Associated",
    productName: "72281 DC10 FT Aluminum Front Lower Arms",
    modelNumber: "72281",
    compatibleChassis: ["DC10", "DC10 RTR"],
    notes: "Factory Team aluminum front lower arms for DC10.",
    tunableParameters: ["inner shim", "outer shim", "arm spacer", "shock mounting hole", "notes"],
    sourceUrl: "https://www.bigsquidrc.com/associated-announces-factory-team-parts-for-the-dc10/",
    verified: true
  }),
  catalogItem({
    id: "team-associated-72282-dc10-ft-titanium-front-axles",
    category: "frontAxles",
    brand: "Team Associated",
    productName: "72282 DC10 FT Titanium Front Axles",
    modelNumber: "72282",
    compatibleChassis: ["DC10", "DC10 RTR"],
    notes: "Factory Team titanium front axles for DC10.",
    tunableParameters: ["axle length", "wheel spacing", "notes"],
    sourceUrl: "https://www.bigsquidrc.com/associated-announces-factory-team-parts-for-the-dc10/",
    verified: true
  }),
  catalogItem({
    id: "team-associated-72254-dc10-ft-aluminum-arm-mounts-ab",
    category: "frontToeBlocks",
    brand: "Team Associated",
    productName: "72254 DC10 FT Aluminum Arm Mounts A/B",
    modelNumber: "72254",
    compatibleChassis: ["DC10", "DC10 RTR"],
    notes: "Factory Team aluminum arm mounts A/B for DC10.",
    tunableParameters: ["arm mount insert", "shim", "caster/anti-squat setting", "notes"],
    sourceUrl: "https://www.associatedelectrics.com/news/latest_products/2936-new-ft-parts-for-the-dc10/",
    verified: true
  }),
  catalogItem({
    id: "team-associated-72255-dc10-ft-aluminum-arm-mount-c",
    category: "rearToeBlocks",
    brand: "Team Associated",
    productName: "72255 DC10 FT Aluminum Arm Mount C",
    modelNumber: "72255",
    compatibleChassis: ["DC10", "DC10 RTR"],
    notes: "Factory Team aluminum arm mount C for DC10.",
    tunableParameters: ["arm mount insert", "shim", "toe/anti-squat setting", "notes"],
    sourceUrl: "https://www.associatedelectrics.com/news/latest_products/2936-new-ft-parts-for-the-dc10/",
    verified: true
  }),
  catalogItem({
    id: "team-associated-72256-dc10-ft-aluminum-arm-mount-d",
    category: "rearToeBlocks",
    brand: "Team Associated",
    productName: "72256 DC10 FT Aluminum Arm Mount D",
    modelNumber: "72256",
    compatibleChassis: ["DC10", "DC10 RTR"],
    notes: "Factory Team aluminum arm mount D for DC10.",
    tunableParameters: ["arm mount insert", "shim", "toe/anti-squat setting", "notes"],
    sourceUrl: "https://www.associatedelectrics.com/news/latest_products/2936-new-ft-parts-for-the-dc10/",
    verified: true
  }),
  catalogItem({
    id: "team-associated-72257-dc10-ft-aluminum-wheel-hex-65",
    category: "frontAxles",
    brand: "Team Associated",
    productName: "72257 DC10 FT Aluminum Wheel Hex 6.5mm",
    modelNumber: "72257",
    compatibleChassis: ["DC10", "DC10 RTR"],
    notes: "Factory Team 6.5mm aluminum wheel hex for DC10.",
    tunableParameters: ["hex thickness", "track width", "wheel spacing", "notes"],
    sourceUrl: "https://www.associatedelectrics.com/news/latest_products/2922-new-ft-parts-for-the-dc10/",
    verified: true
  }),
  catalogItem({
    id: "team-associated-72258-dc10-ft-aluminum-wheel-hex-85",
    category: "rearAxles",
    brand: "Team Associated",
    productName: "72258 DC10 FT Aluminum Wheel Hex 8.5mm",
    modelNumber: "72258",
    compatibleChassis: ["DC10", "DC10 RTR"],
    notes: "Factory Team 8.5mm aluminum wheel hex for DC10.",
    tunableParameters: ["hex thickness", "track width", "wheel spacing", "notes"],
    sourceUrl: "https://www.associatedelectrics.com/news/latest_products/2922-new-ft-parts-for-the-dc10/",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rd-002-asl-front-lower-arm",
    category: "frontLowerArms",
    brand: "Reve D",
    productName: "RD-002 ASL Front Lower Arm",
    modelNumber: "RD-002",
    compatibleChassis: ["Universal", "YD-2"],
    notes: "ASL adjustable front lower arm.",
    tunableParameters: defaultTunableParametersByCategory.frontLowerArms ?? [],
    sourceUrl: "https://tcrcdrift.com/products/reve-d-asl-front-lower-arm-rd-002",
    verified: true
  }),
  catalogItem({
    id: "topline-tdw-tp-654-rdx-front-lower-arms",
    category: "frontLowerArms",
    brand: "Topline",
    productName: "RDX Delrin Front Lower Arms",
    modelNumber: "TDW-TP-654",
    compatibleChassis: ["RDX"],
    notes: "Topline Delrin front lower arms for RDX with spacer hardware.",
    tunableParameters: ["inner shim", "outer shim", "damper mounting hole", "spacer position", "notes"],
    sourceUrl: "https://www.hobbytown.com/topline-reve-d-rdx-delrin-front-lower-arms-white-2-tdw-tp-654/p1662615",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-415rm-rdx-molded-rear-hub-carrier",
    category: "rearHubCarriers",
    brand: "Reve D",
    productName: "D1-415RM RDX Molded Rear Hub Carrier",
    modelNumber: "D1-415RM",
    compatibleChassis: ["RDX"],
    notes: "RDX molded rear hub carrier with six ball-end mounting positions.",
    tunableParameters: ["upper hole", "lower hole", "ball-end mounting position", "spacer position", "notes"],
    sourceUrl: "https://teamreved.com/product/d1-415rm",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rd-012s-rdx-aluminum-rear-hub-carrier",
    category: "rearHubCarriers",
    brand: "Reve D",
    productName: "RD-012S RDX Aluminum Rear Hub Carrier",
    modelNumber: "RD-012S",
    compatibleChassis: ["RDX"],
    notes: "Aluminum rear hub carrier set for RDX.",
    tunableParameters: ["upper hole", "lower hole", "ball-end mounting position", "spacer position", "notes"],
    sourceUrl: "https://www.hobbytown.com/reve-d-rdx-aluminum-rear-hub-carrier-set-rv-rd-012s/p1490922",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rd-012psb-rear-hub-carrier-plate",
    category: "rearHubCarriers",
    brand: "Reve D",
    productName: "RD-012PSB Rear Hub Carrier Plate",
    modelNumber: "RD-012PSB",
    compatibleChassis: ["RDX"],
    notes: "Rear hub carrier plate for RD-012S with additional service hole.",
    tunableParameters: ["plate hole", "sway bar lever ratio", "weight mounting", "notes"],
    sourceUrl: "https://www.vertexrc-usa.com/index.php/shop-all/reved/rdx/reve-d-rear-hub-carrier-plate-for-rd-012s-rd-012psb.html",
    verified: true
  }),
  catalogItem({
    id: "topline-tdw-tp-655-rdx-rear-hub-carriers",
    category: "rearHubCarriers",
    brand: "Topline",
    productName: "RDX Rear Hub Carriers Type U",
    modelNumber: "TDW-TP-655",
    compatibleChassis: ["RDX"],
    notes: "Topline rear hub carriers for Reve D RDX.",
    tunableParameters: ["upper hole", "lower hole", "dummy suspension pin", "spacer position", "notes"],
    sourceUrl: "https://www.hobbytown.com/topline-reve-d-rdx-rear-hub-carriers-white-2-type-u-tdw-tp-655/p1662616",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-011r50-ez-type-rear-wheel-hub-5mm",
    category: "rearAxles",
    brand: "Reve D",
    productName: "D1-011R50 EZ Type Rear Wheel Hub 5.0mm",
    modelNumber: "D1-011R50",
    compatibleChassis: ["RDX"],
    notes: "Aluminum EZ type rear wheel hub for RDX rear axle.",
    tunableParameters: ["hub thickness", "wheel spacing", "track width", "notes"],
    sourceUrl: "https://revedriftarena.com/product/d1-011r50-ez-type-rear-wheel-hub-5-0mm/",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-011r70-ez-type-rear-wheel-hub-7mm",
    category: "rearAxles",
    brand: "Reve D",
    productName: "D1-011R70 EZ Type Rear Wheel Hub 7.0mm",
    modelNumber: "D1-011R70",
    compatibleChassis: ["RDX"],
    notes: "7.0mm version of the RDX EZ type rear wheel hub line.",
    tunableParameters: ["hub thickness", "wheel spacing", "track width", "notes"],
    sourceUrl: "https://revedriftarena.com/product/d1-011r50-ez-type-rear-wheel-hub-5-0mm/",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-s1s-r-tune-short-spring-set",
    category: "springs",
    brand: "Reve D",
    productName: "D1-S1S R-Tune Short Spring Set",
    modelNumber: "D1-S1S",
    compatibleChassis: ["Universal", "RDX"],
    notes: "R-Tune short spring set.",
    tunableParameters: defaultTunableParametersByCategory.springs ?? [],
    sourceUrl: "https://www.driftparadiz.fr/en/products/set-short-springs-r-tune-box-reve-d",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-ss1s-rdx-r-tune-spring-soft",
    category: "springs",
    brand: "Reve D",
    productName: "D1-SS1S RDX R-tune Spring Soft",
    modelNumber: "D1-SS1S",
    compatibleChassis: ["RDX"],
    notes: "RDX R-tune spring, soft.",
    tunableParameters: ["front/rear", "spring length", "spring rate", "orientation", "notes"],
    sourceUrl: "https://teamreved.com/product/d1-ss1s-mh-h",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-ss1mh-rdx-r-tune-spring-medium-hard",
    category: "springs",
    brand: "Reve D",
    productName: "D1-SS1MH RDX R-tune Spring Medium Hard",
    modelNumber: "D1-SS1MH",
    compatibleChassis: ["RDX"],
    notes: "RDX R-tune spring, medium hard.",
    tunableParameters: ["front/rear", "spring length", "spring rate", "orientation", "notes"],
    sourceUrl: "https://teamreved.com/product/d1-ss1s-mh-h",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-ss1h-rdx-r-tune-spring-hard",
    category: "springs",
    brand: "Reve D",
    productName: "D1-SS1H RDX R-tune Spring Hard",
    modelNumber: "D1-SS1H",
    compatibleChassis: ["RDX"],
    notes: "RDX R-tune spring, hard.",
    tunableParameters: ["front/rear", "spring length", "spring rate", "orientation", "notes"],
    sourceUrl: "https://teamreved.com/product/d1-ss1s-mh-h",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rd-011fs-r-tune-2ws-front-spring-soft",
    category: "springs",
    brand: "Reve D",
    productName: "RD-011FS R-tune 2WS Front Spring Soft",
    modelNumber: "RD-011FS",
    compatibleChassis: ["Universal", "YD-2", "RDX", "MC-1", "MC-2", "MC-III"],
    notes: "R-tune 2WS front spring, soft.",
    tunableParameters: ["front/rear", "spring length", "spring rate", "notes"],
    sourceUrl: "https://teamreved.com/product/rd-011fs-fh",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rd-011fh-r-tune-2ws-front-spring-hard",
    category: "springs",
    brand: "Reve D",
    productName: "RD-011FH R-tune 2WS Front Spring Hard",
    modelNumber: "RD-011FH",
    compatibleChassis: ["Universal", "YD-2", "RDX", "MC-1", "MC-2", "MC-III"],
    notes: "R-tune 2WS front spring, hard.",
    tunableParameters: ["front/rear", "spring length", "spring rate", "notes"],
    sourceUrl: "https://teamreved.com/product/rd-011fs-fh",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rd-006as-spring-all-set",
    category: "springs",
    brand: "Reve D",
    productName: "RD-006AS Spring All Set",
    modelNumber: "RD-006AS",
    compatibleChassis: ["Universal", "RDX", "MC-1", "MC-2", "MC-III", "YD-2"],
    notes: "Reve D spring all set with storage box.",
    tunableParameters: ["front/rear", "spring rate", "spring length", "notes"],
    sourceUrl: "https://teamreved.com/product/rd-006as",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rw-ul12-wheel-offset-6",
    category: "frontWheels",
    brand: "Reve D",
    productName: "RW-UL12 Competition Wheel Offset 6mm",
    modelNumber: "RW-UL12",
    compatibleChassis: ["Universal", "RDX", "MC-1", "MC-2", "MC-III"],
    notes: "UL12 12-spoke competition drift wheel, 6mm offset.",
    tunableParameters: ["offset", "diameter", "width", "color", "notes"],
    sourceUrl: "https://teamreved.com/product/rw-ul12",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rw-ul12-wheel-offset-6-rear",
    category: "rearWheels",
    brand: "Reve D",
    productName: "RW-UL12 Competition Wheel Offset 6mm",
    modelNumber: "RW-UL12",
    compatibleChassis: ["Universal", "RDX", "MC-1", "MC-2", "MC-III"],
    notes: "UL12 12-spoke competition drift wheel, 6mm offset.",
    tunableParameters: ["offset", "diameter", "width", "color", "notes"],
    sourceUrl: "https://teamreved.com/product/rw-ul12",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rw-ul12-wheel-offset-8",
    category: "frontWheels",
    brand: "Reve D",
    productName: "RW-UL12 Competition Wheel Offset 8mm",
    modelNumber: "RW-UL12",
    compatibleChassis: ["Universal", "RDX", "MC-1", "MC-2", "MC-III"],
    notes: "UL12 12-spoke competition drift wheel, 8mm offset.",
    tunableParameters: ["offset", "diameter", "width", "color", "notes"],
    sourceUrl: "https://teamreved.com/news/2022082401",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rw-ul12-wheel-offset-8-rear",
    category: "rearWheels",
    brand: "Reve D",
    productName: "RW-UL12 Competition Wheel Offset 8mm",
    modelNumber: "RW-UL12",
    compatibleChassis: ["Universal", "RDX", "MC-1", "MC-2", "MC-III"],
    notes: "UL12 12-spoke competition drift wheel, 8mm offset.",
    tunableParameters: ["offset", "diameter", "width", "color", "notes"],
    sourceUrl: "https://teamreved.com/news/2022082401",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rw-dp5-wheel-offset-6",
    category: "frontWheels",
    brand: "Reve D",
    productName: "RW-DP5 Competition Wheel Offset 6mm",
    modelNumber: "RW-DP5",
    compatibleChassis: ["Universal", "RDX", "MC-1", "MC-2", "MC-III"],
    notes: "DP5 5-spoke competition drift wheel, 6mm offset.",
    tunableParameters: ["offset", "diameter", "width", "color", "notes"],
    sourceUrl: "https://teamreved.com/product-cat/tire-wheel",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rw-dp5-wheel-offset-6-rear",
    category: "rearWheels",
    brand: "Reve D",
    productName: "RW-DP5 Competition Wheel Offset 6mm",
    modelNumber: "RW-DP5",
    compatibleChassis: ["Universal", "RDX", "MC-1", "MC-2", "MC-III"],
    notes: "DP5 5-spoke competition drift wheel, 6mm offset.",
    tunableParameters: ["offset", "diameter", "width", "color", "notes"],
    sourceUrl: "https://teamreved.com/product-cat/tire-wheel",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rw-dp5-wheel-offset-8",
    category: "frontWheels",
    brand: "Reve D",
    productName: "RW-DP5 Competition Wheel Offset 8mm",
    modelNumber: "RW-DP5",
    compatibleChassis: ["Universal", "RDX", "MC-1", "MC-2", "MC-III"],
    notes: "DP5 5-spoke competition drift wheel, 8mm offset.",
    tunableParameters: ["offset", "diameter", "width", "color", "notes"],
    sourceUrl: "https://teamreved.com/news/2022082401",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rw-dp5-wheel-offset-8-rear",
    category: "rearWheels",
    brand: "Reve D",
    productName: "RW-DP5 Competition Wheel Offset 8mm",
    modelNumber: "RW-DP5",
    compatibleChassis: ["Universal", "RDX", "MC-1", "MC-2", "MC-III"],
    notes: "DP5 5-spoke competition drift wheel, 8mm offset.",
    tunableParameters: ["offset", "diameter", "width", "color", "notes"],
    sourceUrl: "https://teamreved.com/news/2022082401",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-300fm-rdx-molded-front-sus-mount",
    category: "frontToeBlocks",
    brand: "Reve D",
    productName: "D1-300FM RDX Molded Front Upper/Lower Sus-Mount",
    modelNumber: "D1-300FM",
    compatibleChassis: ["RDX"],
    notes: "RDX molded front upper/lower suspension mount.",
    tunableParameters: ["toe angle", "mount position", "shim", "notes"],
    sourceUrl: "https://teamreved.com/product/d1-300fm",
    verified: true
  }),
  catalogItem({
    id: "reve-d-rd-301rf3-aluminum-rf-sus-mount",
    category: "rearToeBlocks",
    brand: "Reve D",
    productName: "RD-301RF3 Aluminum Sus-Mount RF #3",
    modelNumber: "RD-301RF3",
    compatibleChassis: ["RDX", "D1-RAC"],
    notes: "RF type aluminum suspension mount used with D1-RAC rear A-arm conversion.",
    tunableParameters: ["toe angle", "RF/RR spacing", "shim", "position", "notes"],
    sourceUrl: "https://teamreved.com/product/rd-301rf3",
    verified: true
  }),
  catalogItem({
    id: "reve-d-d1-cgs01-rdx-carbon-main-chassis-upper-deck",
    category: "decks",
    brand: "Reve D",
    productName: "D1-CGS01 RDX Carbon Main Chassis & Upper Deck Set",
    modelNumber: "D1-CGS01",
    compatibleChassis: ["RDX"],
    notes: "Carbon main chassis and upper deck set for RDX.",
    tunableParameters: ["deck material", "brace position", "battery position", "notes"],
    sourceUrl: "https://teamreved.com/product/d1-cgs01",
    verified: true
  })
];

const differentialCatalogItems: ProductCatalogItem[] = [
  catalogItem({
    id: "universal-gear-differential",
    category: "differentials",
    brand: "Universal",
    productName: "Gear differential",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Common tunable rear differential style using oil/grease and internal gears.",
    tunableParameters: defaultTunableParametersByCategory.differentials ?? []
  }),
  catalogItem({
    id: "universal-ball-differential",
    category: "differentials",
    brand: "Universal",
    productName: "Ball differential",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Adjustable ball diff style, often tuned by tightening and grease choice.",
    tunableParameters: defaultTunableParametersByCategory.differentials ?? []
  }),
  catalogItem({
    id: "universal-spool-solid-axle",
    category: "differentials",
    brand: "Universal",
    productName: "Spool / solid axle",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Locked rear drive option with no differential action.",
    tunableParameters: defaultTunableParametersByCategory.differentials ?? []
  }),
  catalogItem({
    id: "universal-lsd-differential",
    category: "differentials",
    brand: "Universal",
    productName: "LSD differential",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Limited-slip differential option where supported by the chassis.",
    tunableParameters: defaultTunableParametersByCategory.differentials ?? []
  }),
  catalogItem({
    id: "yokomo-y2-500gsaa-resin-bevel-gear-diff",
    category: "differentials",
    brand: "Yokomo",
    productName: "YD/RD/SD Resin Bevel Gear Diff",
    modelNumber: "Y2-500GSAA",
    compatibleChassis: ["YD-2", "RD", "SD", "MD", "Universal"],
    notes: "Assembled resin bevel gear differential with aluminum drive cups and protector specification.",
    tunableParameters: ["diff oil", "drive cups", "protector", "shim setup", "notes"],
    sourceUrl: "https://supergdrift.com/products/yd-2-resin-bevel-gear-def-differential-unit-aluminum-drive-cup-protector-specification-assembled-yokomo-y2-500gsa",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-500gs-a-resin-gear-diff",
    category: "differentials",
    brand: "Yokomo",
    productName: "YD-2 Resin Gear Diff Assembly",
    modelNumber: "Y2-500GS-A",
    compatibleChassis: ["YD-2", "YZ-2", "Universal"],
    notes: "Pre-assembled plastic gear differential for YD-2/YZ-2 style gearboxes.",
    tunableParameters: ["diff oil", "shim setup", "drive cups", "notes"],
    sourceUrl: "https://supergdrift.com/collections/drivetrain-anything-that-spins/products/yd-2-resin-bevel-gear-def-differential-unit-assembly-yokomo-y2-500gs-a",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-500-a-ball-diff",
    category: "differentials",
    brand: "Yokomo",
    productName: "YD/RD/SD/MD Ball Diff",
    modelNumber: "Y2-500-A",
    compatibleChassis: ["YD-2", "RD", "SD", "MD", "Universal"],
    notes: "Ball differential unit supplied with bearings and grease.",
    tunableParameters: ["diff tightness", "grease", "break-in", "maintenance", "notes"],
    sourceUrl: "https://supergdrift.com/products/yd-2-ball-differential-unit-yokomo-y2-500",
    verified: true
  }),
  catalogItem({
    id: "yokomo-y2-502-solid-spool",
    category: "differentials",
    brand: "Yokomo",
    productName: "YD-2 Solid Spool",
    modelNumber: "Y2-502",
    compatibleChassis: ["YD-2", "Universal"],
    notes: "Solid axle/spool option for YD-2 style gearboxes.",
    tunableParameters: ["drive cups", "spool setup", "notes"],
    sourceUrl: "https://teamyokomo.com/downloadfiles/%2102%21MANUAL/%2103%21DRIFT_KIT/YD-2AC_Manual_%5BEnglish%5D.pdf",
    verified: true
  }),
  catalogItem({
    id: "rhino-racing-rr-600-clsd",
    category: "differentials",
    brand: "Rhino Racing",
    productName: "C-LSD Active Differential",
    modelNumber: "RR-600",
    compatibleChassis: ["RDX", "YD", "RD", "SD", "MD", "Universal"],
    notes: "Centrifugal C-LSD assembly that can be tuned with pinion count, springs, and diff fluid.",
    tunableParameters: ["pinion count", "spring", "diff oil", "lockup feel", "drive cups", "notes"],
    sourceUrl: "https://supergdrift.com/products/yd2-rdx-md1-0-aluminum-c-lsd-centrifugal-clsd-differential-assembly-unit-rhino-racing-rr-600",
    verified: true
  }),
  catalogItem({
    id: "rhino-racing-ra-2608-tcd",
    category: "differentials",
    brand: "Rhino Racing",
    productName: "TCD Torque Coupling Differential",
    modelNumber: "RA-2608",
    compatibleChassis: ["RDX", "YD", "RD", "SD", "MD", "Universal"],
    notes: "Torque-coupling differential assembly co-developed with Team AD.",
    tunableParameters: ["spring", "engagement point", "lockup feel", "diff oil", "notes"],
    sourceUrl: "https://supergdrift.com/products/tcd-torque-coupling-differential-assembly-unit-rdx-yd-rd-sd-mdrhino-racing-ra-2608",
    verified: true
  }),
  catalogItem({
    id: "usukani-us88508-yokomo-lsd-conversion",
    category: "differentials",
    brand: "Usukani",
    productName: "Yokomo Original Diff LSD Conversion",
    modelNumber: "US88508",
    compatibleChassis: ["Yokomo Y2-500GSAA", "Usukani NGE-PRO", "Universal"],
    notes: "LSD conversion set for Yokomo original differential based applications.",
    tunableParameters: ["LSD plates", "diff oil", "shim setup", "notes"],
    sourceUrl: "https://www.amainhobbies.com/usukani-yokomo-original-differential-lsd-conversion-set-usu-us88508/p1623456",
    verified: true
  })
];

const researchedCatalogItems: ProductCatalogItem[] = [
  catalogItem({
    id: "hobbywing-xerun-xd10-pro-drift-esc",
    category: "escs",
    brand: "Hobbywing",
    productName: "XeRun XD10 Pro Drift ESC",
    simplifiedName: "XeRun XD10 Pro Drift ESC",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Standalone drift ESC for 1/10 drift cars.",
    tunableParameters: defaultTunableParametersByCategory.escs ?? [],
    sourceUrl: "https://www.hobbywing.com/en/products/xerun-xd10-pro41",
    verified: true
  }),
  catalogItem({
    id: "hobbywing-xerun-d10-10-5t-drift-motor",
    category: "motors",
    brand: "Hobbywing",
    productName: "XeRun D10 10.5T Drift Motor",
    simplifiedName: "XeRun D10 10.5T Drift Motor",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Standalone sensored brushless drift motor.",
    tunableParameters: defaultTunableParametersByCategory.motors ?? [],
    sourceUrl: "https://www.hobbywing.com/en/products/xerun-d1033.html",
    verified: true
  }),
  catalogItem({
    id: "hobbywing-xerun-d10-13-5t-drift-motor",
    category: "motors",
    brand: "Hobbywing",
    productName: "XeRun D10 13.5T Drift Motor",
    simplifiedName: "XeRun D10 13.5T Drift Motor",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Standalone sensored brushless drift motor.",
    tunableParameters: defaultTunableParametersByCategory.motors ?? [],
    sourceUrl: "https://www.hobbywing.com/en/products/xerun-d1033.html",
    verified: true
  }),
  catalogItem({
    id: "futaba-hps-cd700-drift-servo",
    category: "servos",
    brand: "Futaba",
    productName: "HPS-CD700 Drift Servo",
    simplifiedName: "HPS-CD700 Drift Servo",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Low-profile high-voltage drift car servo.",
    tunableParameters: defaultTunableParametersByCategory.servos ?? [],
    sourceUrl: "https://futabausa.com/product/hps-cd700-s-bus2-brushless/",
    verified: true
  }),
  catalogItem({
    id: "futaba-hps-ct701-surface-servo",
    category: "servos",
    brand: "Futaba",
    productName: "HPS-CT701 Servo",
    simplifiedName: "HPS-CT701 Servo",
    modelNumber: "01102360-3",
    compatibleChassis: ["Universal"],
    notes: "S.Bus2 high-voltage low-profile brushless surface servo suitable for 1/10 RC cars and drifting.",
    tunableParameters: defaultTunableParametersByCategory.servos ?? [],
    sourceUrl: "https://futabausa.com/product/hps-ct701/",
    verified: true
  }),
  catalogItem({
    id: "futaba-hps-ct700-surface-servo",
    category: "servos",
    brand: "Futaba",
    productName: "HPS-CT700 Servo",
    simplifiedName: "HPS-CT700 Servo",
    modelNumber: "01102321-3",
    compatibleChassis: ["Universal"],
    notes: "High-voltage low-profile brushless surface servo with S.Bus/S.Bus2 support.",
    tunableParameters: defaultTunableParametersByCategory.servos ?? [],
    sourceUrl: "https://www.rc.futaba.co.jp/products/detail/I00000090",
    verified: true
  }),
  catalogItem({
    id: "futaba-bls571sv-low-profile-servo",
    category: "servos",
    brand: "Futaba",
    productName: "BLS571SV Servo",
    simplifiedName: "BLS571SV Servo",
    modelNumber: "BLS571SV",
    compatibleChassis: ["Universal"],
    notes: "Low-profile programmable S.Bus2 brushless surface servo.",
    tunableParameters: defaultTunableParametersByCategory.servos ?? [],
    sourceUrl: "https://futabausa.com/product-support/servochart/",
    verified: true
  }),
  catalogItem({
    id: "futaba-s9571sv-low-profile-servo",
    category: "servos",
    brand: "Futaba",
    productName: "S9571SV Servo",
    simplifiedName: "S9571SV Servo",
    modelNumber: "S9571SV",
    compatibleChassis: ["Universal"],
    notes: "Low-profile S.Bus2 surface servo listed in Futaba servo comparison data.",
    tunableParameters: defaultTunableParametersByCategory.servos ?? [],
    sourceUrl: "https://futabausa.com/product-support/servochart/",
    verified: true
  }),
  catalogItem({
    id: "futaba-gyd470-drift-gyro",
    category: "gyros",
    brand: "Futaba",
    productName: "GYD470 Drift Gyro",
    simplifiedName: "GYD470 Drift Gyro",
    modelNumber: "036293",
    compatibleChassis: ["Universal"],
    notes: "Standalone 2WD/4WD drift car gyro.",
    tunableParameters: defaultTunableParametersByCategory.gyros ?? [],
    sourceUrl: "https://www.rc.futaba.co.jp/products/detail/I00000326",
    verified: true
  }),
  catalogItem({
    id: "futaba-gyd550-drift-gyro",
    category: "gyros",
    brand: "Futaba",
    productName: "GYD550 Drift Gyro",
    simplifiedName: "GYD550 Drift Gyro",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Standalone counter-steer gyro system for drift RC cars.",
    tunableParameters: defaultTunableParametersByCategory.gyros ?? [],
    sourceUrl: "https://futabausa.com/product/gyd550-drift-rc-car-counter-steer-gyro-system/",
    verified: true
  }),
  catalogItem({
    id: "sanwa-pgs-cl-ii-drift-setting-servo",
    category: "servos",
    brand: "Sanwa",
    productName: "PGS-CL II Drift Setting Servo",
    simplifiedName: "PGS-CL II Drift Setting Servo",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Programmable low-profile car servo with Sanwa response mode support.",
    tunableParameters: defaultTunableParametersByCategory.servos ?? [],
    sourceUrl: "https://sanwa-denshi.co.jp/rc/car/servo/",
    verified: true
  }),
  catalogItem({
    id: "sanwa-pgs-cl-ii-servo",
    category: "servos",
    brand: "Sanwa",
    productName: "PGS-CL II Servo",
    simplifiedName: "PGS-CL II Servo",
    modelNumber: "107A54516A",
    compatibleChassis: ["Universal"],
    notes: "Programmable car servo with SSL and telemetry support.",
    tunableParameters: defaultTunableParametersByCategory.servos ?? [],
    sourceUrl: "https://sanwa-denshi.com/rc/car/servo/pgs-cl_ii.html",
    verified: true
  }),
  catalogItem({
    id: "sanwa-sgs-02-gyro",
    category: "gyros",
    brand: "Sanwa",
    productName: "SGS-02 Drift Gyro",
    simplifiedName: "SGS-02 Drift Gyro",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Standalone gyro system with Sanwa response mode support.",
    tunableParameters: defaultTunableParametersByCategory.gyros ?? [],
    sourceUrl: "https://sanwa-denshi.co.jp/rc/car/option1/sgs-02.html",
    verified: true
  }),
  catalogItem({
    id: "acuvance-xarvis-xx-esc",
    category: "escs",
    brand: "Acuvance",
    productName: "XARVIS XX ESC",
    simplifiedName: "XARVIS XX ESC",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Standalone brushless ESC with Acuvance motor program support.",
    tunableParameters: defaultTunableParametersByCategory.escs ?? [],
    sourceUrl: "https://acuvance.co.jp/product/blm_sc/xarvis-xx/",
    verified: true
  }),
  catalogItem({
    id: "acuvance-xarvis-esc",
    category: "escs",
    brand: "Acuvance",
    productName: "XARVIS ESC",
    simplifiedName: "XARVIS ESC",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Standalone Acuvance brushless ESC compatible with TAOIII setup workflow.",
    tunableParameters: defaultTunableParametersByCategory.escs ?? [],
    sourceUrl: "https://acuvance.co.jp/product/blm_sc/xarvis/",
    verified: true
  }),
  catalogItem({
    id: "acuvance-rad-esc",
    category: "escs",
    brand: "Acuvance",
    productName: "RAD ESC",
    simplifiedName: "RAD ESC",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "High-end Acuvance brushless ESC with reverse-connection protection and TAOIII setup support.",
    tunableParameters: defaultTunableParametersByCategory.escs ?? [],
    sourceUrl: "https://acuvance.co.jp/product/blm_sc/rad/",
    verified: true
  }),
  catalogItem({
    id: "acuvance-chevalier-blaze-capacitor",
    category: "capacitors",
    brand: "Acuvance",
    productName: "Chevalier Blaze Capacitor",
    simplifiedName: "Chevalier Blaze Capacitor",
    modelNumber: "OP-15103",
    compatibleChassis: ["Universal"],
    notes: "High-power Acuvance capacitor for ESC/battery terminal connection.",
    tunableParameters: defaultTunableParametersByCategory.capacitors ?? [],
    sourceUrl: "https://acuvance-usa.com/chevelierblaze.aspx",
    verified: true
  }),
  catalogItem({
    id: "acuvance-chevalier-trace-capacitor",
    category: "capacitors",
    brand: "Acuvance",
    productName: "Chevalier Trace Capacitor",
    simplifiedName: "Chevalier Trace Capacitor",
    modelNumber: "OP-15136",
    compatibleChassis: ["Universal"],
    notes: "Acuvance Chevalier series capacitor/electronic power device.",
    tunableParameters: defaultTunableParametersByCategory.capacitors ?? [],
    sourceUrl: "https://acuvance-usa.com/capacitors.aspx",
    verified: true
  }),
  catalogItem({
    id: "acuvance-trace-bector-capacitor",
    category: "capacitors",
    brand: "Acuvance",
    productName: "Trace Bector Capacitor",
    simplifiedName: "Trace Bector Capacitor",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Acuvance advanced power device listed in the Acuvance capacitor lineup.",
    tunableParameters: defaultTunableParametersByCategory.capacitors ?? [],
    sourceUrl: "https://acuvance-usa.com/capacitors.aspx",
    verified: true
  }),
  catalogItem({
    id: "acuvance-pulse-master",
    category: "capacitors",
    brand: "Acuvance",
    productName: "Pulse Master",
    simplifiedName: "Pulse Master",
    modelNumber: "OP-15120",
    compatibleChassis: ["Universal"],
    notes: "Acuvance advanced power/signal device commonly paired with ESC electronics.",
    tunableParameters: defaultTunableParametersByCategory.capacitors ?? [],
    sourceUrl: "https://acuvance-usa.com/capacitors.aspx",
    verified: true
  }),
  catalogItem({
    id: "acuvance-surge-killer-capacitor",
    category: "capacitors",
    brand: "Acuvance",
    productName: "Surge Killer Capacitor",
    simplifiedName: "Surge Killer Capacitor",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Acuvance capacitor product listed in the Acuvance capacitor lineup.",
    tunableParameters: defaultTunableParametersByCategory.capacitors ?? [],
    sourceUrl: "https://acuvance-usa.com/capacitors.aspx",
    verified: true
  }),
  catalogItem({
    id: "acuvance-fledge-brushless-motor",
    category: "motors",
    brand: "Acuvance",
    productName: "FLEDGE Brushless Motor",
    simplifiedName: "FLEDGE Brushless Motor",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Standalone brushless motor compatible with XARVIS XX FLEDGE/AGILE programs.",
    tunableParameters: defaultTunableParametersByCategory.motors ?? [],
    sourceUrl: "https://acuvance.co.jp/product/blm/fledge/",
    verified: true
  }),
  catalogItem({
    id: "acuvance-luxon-agile-brushless-motor",
    category: "motors",
    brand: "Acuvance",
    productName: "LUXON AGILE Brushless Motor",
    simplifiedName: "LUXON AGILE Brushless Motor",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Standalone brushless motor with Acuvance M.F.C.S. tuning support.",
    tunableParameters: defaultTunableParametersByCategory.motors ?? [],
    sourceUrl: "https://acuvance.co.jp/product/blm/luxon4/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-sp-03d-v2-drift-servo",
    category: "servos",
    brand: "Yokomo",
    productName: "SP-03D V2 Brushless Drift Servo",
    simplifiedName: "SP-03D V2 Brushless Drift Servo",
    modelNumber: "SP-03DV2A",
    compatibleChassis: ["Universal"],
    notes: "Standalone programmable brushless drift servo.",
    tunableParameters: defaultTunableParametersByCategory.servos ?? [],
    sourceUrl: "https://teamyokomo.com/parts/SP-03DV2A/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-rpx-ii-drift-spec-esc",
    category: "escs",
    brand: "Yokomo",
    productName: "Racing Performer RPXII Drift Spec ESC",
    simplifiedName: "Racing Performer RPXII Drift Spec ESC",
    modelNumber: "BL-RPX2DP",
    compatibleChassis: ["Universal"],
    notes: "Standalone Racing Performer drift-spec ESC.",
    tunableParameters: defaultTunableParametersByCategory.escs ?? [],
    sourceUrl: "https://teamyokomo.com/parts/BL-RPX2DP/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-drc-drift-competition-tire",
    category: "tires",
    brand: "Yokomo",
    productName: "DRC Drift Competition Tire",
    simplifiedName: "DRC Drift Competition Tire",
    modelNumber: "ZR-DRCA",
    compatibleChassis: ["Universal"],
    notes: "Standalone carpet/P-tile drift tire.",
    tunableParameters: defaultTunableParametersByCategory.tires ?? [],
    sourceUrl: "https://teamyokomo.com/parts/ZR-DRCA/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-dra-drift-competition-tire",
    category: "tires",
    brand: "Yokomo",
    productName: "DRA Drift Competition Tire",
    simplifiedName: "DRA Drift Competition Tire",
    modelNumber: "ZR-DRA",
    compatibleChassis: ["Universal"],
    notes: "Standalone asphalt drift tire.",
    tunableParameters: defaultTunableParametersByCategory.tires ?? [],
    sourceUrl: "https://www.yokomostore.com/product/yokomo-dra-drift-competition-awd-rwd-tire-for-asphalt-4pcs/",
    verified: true
  }),
  catalogItem({
    id: "mst-csr-fr-f-silver-dot-drift-tire",
    category: "tires",
    brand: "MST",
    productName: "CSR FR-F Silver Dot Drift Tire",
    simplifiedName: "CSR FR-F Silver Dot Drift Tire",
    modelNumber: "",
    compatibleChassis: ["Universal"],
    notes: "Standalone RWD slick hard plastic drift tire.",
    tunableParameters: defaultTunableParametersByCategory.tires ?? [],
    sourceUrl: "https://www.driftmanjirc.com/collections/wheels-tires/products/mst-csr-fr-f-silver-dot-rc-drift-tires-1-10",
    verified: true
  }),
  catalogItem({
    id: "reve-d-ul12-drift-wheel",
    category: "frontWheels",
    brand: "Reve D",
    productName: "UL12 Drift Wheel",
    simplifiedName: "UL12 Drift Wheel",
    modelNumber: "RW-UL12",
    compatibleChassis: ["Universal"],
    notes: "Standalone lightweight high-traction drift wheel.",
    tunableParameters: defaultTunableParametersByCategory.frontWheels ?? [],
    sourceUrl: "https://www.vertexrc-usa.com/index.php/reve-d-drift-wheel-ul12-white-offset-6-2pcs-rw-ul12w6.html",
    verified: true
  }),
  catalogItem({
    id: "reve-d-ul12-drift-wheel-rear",
    category: "rearWheels",
    brand: "Reve D",
    productName: "UL12 Drift Wheel",
    simplifiedName: "UL12 Drift Wheel",
    modelNumber: "RW-UL12",
    compatibleChassis: ["Universal"],
    notes: "Standalone lightweight high-traction drift wheel.",
    tunableParameters: defaultTunableParametersByCategory.rearWheels ?? [],
    sourceUrl: "https://www.vertexrc-usa.com/index.php/reve-d-drift-wheel-ul12-white-offset-6-2pcs-rw-ul12w6.html",
    verified: true
  }),
  catalogItem({
    id: "yokomo-racing-performer-high-traction-drift-wheel",
    category: "frontWheels",
    brand: "Yokomo",
    productName: "Racing Performer High Traction Drift Wheel",
    simplifiedName: "Racing Performer High Traction Drift Wheel",
    modelNumber: "RP-6313W6A",
    compatibleChassis: ["Universal"],
    notes: "Standalone high-traction drift wheel.",
    tunableParameters: defaultTunableParametersByCategory.frontWheels ?? [],
    sourceUrl: "https://teamyokomo.com/parts/RP-6313W6A/",
    verified: true
  }),
  catalogItem({
    id: "yokomo-racing-performer-high-traction-drift-wheel-rear",
    category: "rearWheels",
    brand: "Yokomo",
    productName: "Racing Performer High Traction Drift Wheel",
    simplifiedName: "Racing Performer High Traction Drift Wheel",
    modelNumber: "RP-6313W6A",
    compatibleChassis: ["Universal"],
    notes: "Standalone high-traction drift wheel.",
    tunableParameters: defaultTunableParametersByCategory.rearWheels ?? [],
    sourceUrl: "https://teamyokomo.com/parts/RP-6313W6A/",
    verified: true
  }),
  catalogItem({
    id: "mst-106-adjustable-offset-wheel",
    category: "frontWheels",
    brand: "MST",
    productName: "106 Adjustable Offset Wheel",
    simplifiedName: "106 Adjustable Offset Wheel",
    modelNumber: "832107BK",
    compatibleChassis: ["Universal"],
    notes: "Standalone adjustable-offset 26mm drift wheel.",
    tunableParameters: defaultTunableParametersByCategory.frontWheels ?? [],
    sourceUrl: "https://www.rcteam.com/en/products/mst-106-wheels-with-adjustable-offset-black-black-x4-832107bk",
    verified: true
  }),
  catalogItem({
    id: "mst-106-adjustable-offset-wheel-rear",
    category: "rearWheels",
    brand: "MST",
    productName: "106 Adjustable Offset Wheel",
    simplifiedName: "106 Adjustable Offset Wheel",
    modelNumber: "832107BK",
    compatibleChassis: ["Universal"],
    notes: "Standalone adjustable-offset 26mm drift wheel.",
    tunableParameters: defaultTunableParametersByCategory.rearWheels ?? [],
    sourceUrl: "https://www.rcteam.com/en/products/mst-106-wheels-with-adjustable-offset-black-black-x4-832107bk",
    verified: true
  })
];

export const productCatalogSeed: ProductCatalogItem[] = [
  ...electronicsCatalogItems,
  ...researchedCatalogItems,
  ...chassisCatalogItems,
  ...differentialCatalogItems,
  ...hrcCatalogItems,
  ...hrcNerdCatalogItems,
  ...sourcedCatalogItems,
  ...sourcedWizardCatalogItems,
  ...sourcedWheelCatalogItems
];
