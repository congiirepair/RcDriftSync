import type { ProductCatalogCategory, ProductCatalogItem } from "./productCatalog";

type ShibataCatalogInput = {
  category: ProductCatalogCategory;
  slug: string;
  productName: string;
  simplifiedName: string;
  modelNumber: string;
  productType: string;
  compatibleChassis?: string[];
  handle: string;
  notes?: string;
  aliases?: string[];
  variants?: ProductCatalogItem["variants"];
  tuneSelectable?: boolean;
  hiddenFromTuneBuilder?: boolean;
  reasonHidden?: string;
  canonicalProductId?: string;
  canonicalVariantId?: string;
  legacyIds?: string[];
};

const checkedAt = "2026-05-13";
const grkFitment = ["Shibata GRK", "Shibata GRK5", "Shibata GRK5-R", "Shibata GRK GS2 EVO", "Shibata HRP"];

function officialUrl(handle: string) {
  return `https://www.drgrk.com/products/${handle}`;
}

function shibataItem(input: ShibataCatalogInput): ProductCatalogItem {
  const skus = input.modelNumber.split(/\s*\/\s*/).map((sku) => sku.trim()).filter(Boolean);
  const primarySku = skus[0] ?? input.modelNumber;
  const variantNote = skus.length > 1 ? ` Official color/variant SKUs: ${skus.join(", ")}.` : "";
  return {
    id: `shibata-${input.category}-${input.slug}`,
    category: input.category,
    brand: "Shibata",
    productName: input.productName,
    simplifiedName: input.simplifiedName,
    displayName: input.simplifiedName,
    modelNumber: primarySku,
    partNumber: primarySku,
    productType: input.productType,
    compatibleChassis: input.compatibleChassis ?? grkFitment,
    notes: `${input.notes ?? "Official SHIBATA/DR GRK catalog product. Fitment should be confirmed for the driver's exact car generation."}${variantNote}`,
    tunableParameters: [],
    sourceUrl: officialUrl(input.handle),
    sourceName: "SHIBATA GRK official store",
    userAdded: false,
    verified: true,
    confidence: "high",
    needsReview: false,
    lastCheckedAt: checkedAt,
    aliases: [...(input.aliases ?? []), ...skus],
    variants: input.variants,
    tuneSelectable: input.tuneSelectable,
    hiddenFromTuneBuilder: input.hiddenFromTuneBuilder,
    reasonHidden: input.reasonHidden,
    canonicalProductId: input.canonicalProductId,
    canonicalVariantId: input.canonicalVariantId,
    legacyIds: input.legacyIds
  };
}

const colorVariants = (skus: Array<{ color: string; sku: string }>): ProductCatalogItem["variants"] =>
  skus.map(({ color, sku }) => ({
    id: `${color.toLowerCase()}-${sku.toLowerCase()}`,
    color,
    sku,
    displayName: color
  }));

const lowerArms = [
  {
    slug: "adjustable-geometry-lower-arm",
    productName: "Adjustable geometry lower arm",
    simplifiedName: "Adjustable Geometry Lower Arm",
    modelNumber: "R31S322BK / R31S322PU / R31S322RD",
    handle: "adjustable-geometry-lower-arm-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S322BK" },
      { color: "Purple", sku: "R31S322PU" },
      { color: "Red", sku: "R31S322RD" }
    ])
  },
  {
    slug: "adjustable-side-lower-arm-short",
    productName: "Adjustable side lower arm short",
    simplifiedName: "Adjustable Side Lower Arm Short",
    modelNumber: "R31S330BK / R31S330PU / R31S330RD",
    handle: "adjustable-side-lower-arm-short-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S330BK" },
      { color: "Purple", sku: "R31S330PU" },
      { color: "Red", sku: "R31S330RD" }
    ])
  },
  {
    slug: "short-adjustable-main-lower-arm",
    productName: "Short Adjustable Main Lower Arm",
    simplifiedName: "Short Adjustable Main Lower Arm",
    modelNumber: "R31S339BK / R31S339PU / R31S339RD",
    handle: "short-adjustable-main-lower-arm-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S339BK" },
      { color: "Purple", sku: "R31S339PU" },
      { color: "Red", sku: "R31S339RD" }
    ])
  },
  {
    slug: "grk-short-sus-arm",
    productName: "GRK Short Suspension Arm",
    simplifiedName: "GRK Short Suspension Arm",
    modelNumber: "R31G082",
    handle: "grk-short-sus-arm-2",
    compatibleChassis: ["Shibata GRK", "Shibata GRK GS2 EVO", "Shibata GRK5"]
  },
  {
    slug: "grk4-low-arm",
    productName: "GRK4 Lower Arm",
    simplifiedName: "GRK4 Lower Arm",
    modelNumber: "R31S306BK",
    handle: "grk4-low-arm-black",
    compatibleChassis: ["Shibata GRK4", "Shibata GRK5", "Shibata GRK GS2 EVO"]
  }
];

const upperArms = [
  {
    slug: "ball-bearing-upper-arm",
    productName: "Ball bearing upper arm",
    simplifiedName: "Ball Bearing Upper Arm",
    modelNumber: "R31S329BK / R31S329PU / R31S329RD",
    handle: "ball-bearing-upper-arm-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S329BK" },
      { color: "Purple", sku: "R31S329PU" },
      { color: "Red", sku: "R31S329RD" }
    ])
  },
  {
    slug: "short-ball-bearing-upper-arm",
    productName: "Short Ball bearing Upper Arm",
    simplifiedName: "Short Ball Bearing Upper Arm",
    modelNumber: "R31S340BK / R31S340PU / R31S340RD",
    handle: "short-ball-bearing-upper-arm-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S340BK" },
      { color: "Purple", sku: "R31S340PU" },
      { color: "Red", sku: "R31S340RD" }
    ])
  }
];

const suspensionMounts = [
  {
    slug: "aluminum-sus-mount",
    productName: "Aluminum Suspension Mount for GRK",
    simplifiedName: "Aluminum Suspension Mount",
    modelNumber: "R31S304BK",
    handle: "aluminum-sus-mount-for-grk"
  },
  {
    slug: "reversible-wide-suspension-mount-v2",
    productName: "Reversible wide suspension mount ver.2",
    simplifiedName: "Reversible Wide Suspension Mount Ver.2",
    modelNumber: "R31S316BK / R31S316PU / R31S316RD",
    handle: "reversible-wide-suspension-mount-ver-2-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S316BK" },
      { color: "Purple", sku: "R31S316PU" },
      { color: "Red", sku: "R31S316RD" }
    ])
  },
  {
    slug: "s-wide-reversible-sus-mount",
    productName: "S-Wide Reversible Suspension Mount",
    simplifiedName: "S-Wide Reversible Suspension Mount",
    modelNumber: "R31S324BK / R31S324PU / R31S324RD",
    handle: "s-wide-reversible-sus-mount-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S324BK" },
      { color: "Purple", sku: "R31S324PU" },
      { color: "Red", sku: "R31S324RD" }
    ])
  }
];

const wheels = [
  {
    slug: "37kai-wheel",
    productName: "37kai wheel offset +5 / +7 / +9 black",
    simplifiedName: "37kai Wheel",
    modelNumber: "R31G052B / R31W242B / R31W427",
    handle: "37kai-wheel-offset-5-black-2"
  },
  {
    slug: "57kai-wheel",
    productName: "57kai wheel offset +5 / +7 / +9 black",
    simplifiedName: "57kai Wheel",
    modelNumber: "R31W260B / R31W261B / R31W262B",
    handle: "57kai-wheel-offset-5-black-2"
  },
  {
    slug: "shiba-f23-wheel",
    productName: "SHIBAWHEEL F23 offset +5 / +7",
    simplifiedName: "Shiba Wheel F23",
    modelNumber: "DR-SW05FBK / DR-SW05FWH / DR-SW05FGS / DR-SW05FGH / DR-SW07FBK / DR-SW07FWH / DR-SW07FGS / DR-SW07FGH / DR-SW07FTS",
    handle: "shibawheel-f23-off-5-bk2"
  },
  {
    slug: "shiba-g23-wheel",
    productName: "SHIBAWHEEL G23 offset +5 / +7",
    simplifiedName: "Shiba Wheel G23",
    modelNumber: "DR-SW05GBK / DR-SW07GBK / DR-SW07GWH / DR-SW07GTS",
    handle: "shibawheel-g23-off-5-bk2"
  }
];

export const shibataGrkCatalogItems: ProductCatalogItem[] = [
  ...lowerArms.flatMap((item) => [
    shibataItem({ ...item, category: "frontLowerArms", productType: "lower suspension arm" }),
    shibataItem({ ...item, category: "rearLowerArms", productType: "lower suspension arm" })
  ]),
  ...upperArms.flatMap((item) => [
    shibataItem({ ...item, category: "frontUpperArms", productType: "upper arm" }),
    shibataItem({ ...item, category: "rearUpperArms", productType: "upper arm" })
  ]),
  ...suspensionMounts.flatMap((item) => [
    shibataItem({ ...item, category: "frontToeBlocks", productType: "toe block / suspension mount" }),
    shibataItem({ ...item, category: "rearToeBlocks", productType: "toe block / suspension mount" })
  ]),
  shibataItem({
    category: "rearToeBlocks",
    slug: "s-wide-adjustable-sus-block",
    productName: "S-Wide Adjustable Suspension Block",
    simplifiedName: "S-Wide Adjustable Suspension Block",
    modelNumber: "R31S325BK / R31S325PU / R31S325RD",
    productType: "toe block / suspension mount",
    compatibleChassis: ["Shibata GRK", "Shibata GRK4", "Shibata GRK5", "Shibata GRK5-R", "Shibata GRK GS2 EVO"],
    handle: "s-wide-adjustable-sus-block-black",
    notes: "Official SHIBATA super-wide adjustable suspension block. Rear RR position only; intended to pair with R31S324 S-Wide Reversible Suspension Mount on carbon chassis.",
    variants: colorVariants([
      { color: "Black", sku: "R31S325BK" },
      { color: "Purple", sku: "R31S325PU" },
      { color: "Red", sku: "R31S325RD" }
    ])
  }),
  shibataItem({
    category: "frontKnuckles",
    slug: "light-weight-aluminum-knuckle-v1",
    productName: "GRK Light weight Aluminum Knuckle V1",
    simplifiedName: "Light Weight Aluminum Knuckle V1",
    modelNumber: "R31S331BK / R31S331PU / R31S331RD",
    productType: "front steering knuckle",
    handle: "grk-light-weight-aluminum-knuckle-v1-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S331BK" },
      { color: "Purple", sku: "R31S331PU" },
      { color: "Red", sku: "R31S331RD" }
    ])
  }),
  shibataItem({
    category: "frontKnuckles",
    slug: "gs2-evo-rwd-front-knuckle",
    productName: "GS2 EVO RWD front knuckle",
    simplifiedName: "GS2 EVO RWD Front Knuckle",
    modelNumber: "R31G083",
    productType: "front steering knuckle",
    compatibleChassis: ["Shibata GRK GS2 EVO", "Shibata GRK"],
    handle: "gs2-evo-rwd-front-knuckle"
  }),
  shibataItem({
    category: "frontKnuckles",
    slug: "multi-angle-knuckle-set",
    productName: "Multi-angle knuckle set",
    simplifiedName: "Multi-Angle Knuckle Set",
    modelNumber: "R31S300",
    productType: "front steering knuckle",
    handle: "multi-angle-knuckle-set-black"
  }),
  shibataItem({
    category: "rearHubCarriers",
    slug: "grk5-knuckle-for-rear-a-arm",
    productName: "GRK5 Rear Knuckle for A Arm",
    simplifiedName: "GRK5 Rear Knuckle",
    modelNumber: "R31S326BK / R31S326PU / R31S326RD",
    productType: "rear hub carrier",
    compatibleChassis: ["Shibata GRK5", "Shibata GRK5-R", "Shibata GRK GS2 EVO"],
    handle: "grk5-knuckle-for-rear-a-arm-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S326BK" },
      { color: "Purple", sku: "R31S326PU" },
      { color: "Red", sku: "R31S326RD" }
    ])
  }),
  shibataItem({
    category: "rearHubCarriers",
    slug: "inset-rear-knuckle",
    productName: "Inset rear knuckle",
    simplifiedName: "Inset Rear Knuckle",
    modelNumber: "R31S323BK / R31S323PU / R31S323RD",
    productType: "rear hub carrier",
    handle: "inset-rear-knuckle-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S323BK" },
      { color: "Purple", sku: "R31S323PU" },
      { color: "Red", sku: "R31S323RD" }
    ])
  }),
  shibataItem({
    category: "rearHubCarriers",
    slug: "multi-use-rear-knuckle",
    productName: "Multi-use rear knuckle",
    simplifiedName: "Multi-Use Rear Knuckle",
    modelNumber: "R31S334PU",
    productType: "rear hub carrier",
    handle: "multi-use-rear-knuckle-purple"
  }),
  shibataItem({
    category: "frontShockTowers",
    slug: "double-position-front-shock-tower",
    productName: "GRK Carbon double position front shock tower",
    simplifiedName: "Carbon Double Position Front Shock Tower",
    modelNumber: "R31S319",
    productType: "front shock tower",
    handle: "grk-double-position-front-shock-tower-made-of-carbon-fiber"
  }),
  shibataItem({
    category: "frontShockTowers",
    slug: "short-front-shock-tower",
    productName: "GRK Carbon short front shock tower",
    simplifiedName: "Carbon Short Front Shock Tower",
    modelNumber: "R31S321",
    productType: "front shock tower",
    handle: "grk-short-front-shock-tower-made-of-carbon-fiber"
  }),
  shibataItem({
    category: "rearShockTowers",
    slug: "double-position-rear-shock-tower",
    productName: "GRK Carbon double position rear shock tower",
    simplifiedName: "Carbon Double Position Rear Shock Tower",
    modelNumber: "R31S320",
    productType: "rear shock tower",
    handle: "grk-double-position-rear-shock-tower-made-of-carbon-fiber"
  }),
  shibataItem({
    category: "rearShockTowers",
    slug: "wide-rear-shock-tower",
    productName: "GRK Wide rear shock tower",
    simplifiedName: "Wide Rear Shock Tower",
    modelNumber: "R31S327BK / R31S327PU / R31S327RD",
    productType: "rear shock tower",
    handle: "grk-wide-rear-shock-tower-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S327BK" },
      { color: "Purple", sku: "R31S327PU" },
      { color: "Red", sku: "R31S327RD" }
    ])
  }),
  shibataItem({
    category: "rearShockTowers",
    slug: "height-adjustable-rear-damper-stay",
    productName: "Height Adjustable Rear Shock Tower Damper Stay",
    simplifiedName: "Height Adjustable Rear Shock Tower Damper Stay",
    modelNumber: "R31S335BK / R31S335PU / R31S335RD",
    productType: "rear shock tower",
    handle: "height-adjustable-rear-damper-stay-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S335BK" },
      { color: "Purple", sku: "R31S335PU" },
      { color: "Red", sku: "R31S335RD" }
    ])
  }),
  shibataItem({
    category: "springs",
    slug: "drift-spring-series",
    productName: "SHIBATA Drift Spring Series",
    simplifiedName: "Drift Spring Series",
    modelNumber: "R31S030LR / R31S021LR / R31S080LR / R31S040LR / R31S090LR / R31S110LR / R31S091LR / R31S111LR",
    productType: "spring set",
    handle: "drift-spring-5left-and-right-winding",
    notes: "Official SHIBATA/DR GRK drift shock spring family. Grouped as selectable variants so the tuner menu stays compact while preserving each spring part number.",
    legacyIds: [
      "shibata-springs-drift-spring-5-0",
      "shibata-springs-drift-spring-5-1",
      "shibata-springs-drift-spring-6-5",
      "shibata-springs-drift-spring-8-0-dual-rate",
      "shibata-springs-drift-spring-9-0",
      "shibata-springs-progressive-spring-1-2-9-0",
      "shibata-springs-drift-spring-9-5-dual-rate",
      "shibata-springs-progressive-spring-1-3-9-5"
    ],
    variants: [
      { id: "5-0-r31s030lr", sku: "R31S030LR", size: "5.0", displayName: "5.0 L/R", sourceProductName: "DRIFT SPRING 5.0 L/R symmetrical", sourceUrl: officialUrl("drift-spring-5left-and-right-winding") },
      { id: "5-1-r31s021lr", sku: "R31S021LR", size: "5.1", displayName: "5.1 L/R", sourceProductName: "DRIFT SPRING 5.1 L/R symmetrical", sourceUrl: officialUrl("drift-spring-5-1left-and-right-winding") },
      { id: "6-5-r31s080lr", sku: "R31S080LR", size: "6.5", displayName: "6.5 L/R", sourceProductName: "DRIFT SPRING 6.5 L/R symmetrical", sourceUrl: officialUrl("drift-spring-6-5-l-r") },
      { id: "8-0-dual-rate-r31s040lr", sku: "R31S040LR", size: "8.0", displayName: "8.0 L/R Dual Rate", sourceProductName: "DRIFT SPRING 8.0 L/R symmetrical Dual rate", sourceUrl: officialUrl("drift-spring-dual-rate-spring-8-symmetrical-windings") },
      { id: "9-0-r31s090lr", sku: "R31S090LR", size: "9.0", displayName: "9.0 L/R", sourceProductName: "DRIFT SPRING 9.0 L/R symmetrical", sourceUrl: officialUrl("drift-spring-9-0-l-r-symmetrical") },
      { id: "1-2-9-0-r31s110lr", sku: "R31S110LR", size: "1.2mm 9.0", displayName: "Progressive 1.2mm 9.0", sourceProductName: "SHIBATA Drift Spring 1.2mm 9.0", sourceUrl: officialUrl("shibata-drift-progressive-spring-1-2mm-9-0") },
      { id: "9-5-dual-rate-r31s091lr", sku: "R31S091LR", size: "9.5", displayName: "9.5 L/R Dual Rate", sourceProductName: "DRIFT SPRING 9.5 L/R symmetrical Dual rate", sourceUrl: officialUrl("drift-spring-9-5-l-r-symmetrical-dual-rate") },
      { id: "1-3-9-5-r31s111lr", sku: "R31S111LR", size: "1.3mm 9.5", displayName: "Progressive 1.3mm 9.5", sourceProductName: "SHIBATA DRIFT Progressive Spring 1.3mm 9.5", sourceUrl: officialUrl("shibata-drift-progressive-spring-1-3mm-9-6") }
    ]
  }),
  shibataItem({
    category: "springs",
    slug: "hyper-spring-series",
    productName: "SHIBATA Hyper Spring Series",
    simplifiedName: "Hyper Spring Series",
    modelNumber: "R31S115LR / R31S116LR",
    productType: "spring set",
    handle: "hyper-spring-set-1-2mm-6-coils",
    notes: "Official SHIBATA Hyper spring family. Collapsed into coil-count variants for cleaner spring selection.",
    legacyIds: ["shibata-springs-hyper-spring-1-2-6-coils", "shibata-springs-hyper-spring-1-2-7-coils"],
    variants: [
      { id: "1-2mm-6-coils-r31s115lr", sku: "R31S115LR", size: "1.2mm 6 coils", displayName: "1.2mm 6 Coils", sourceProductName: "Hyper Spring Set / 1.2mm 6 coils", sourceUrl: officialUrl("hyper-spring-set-1-2mm-6-coils") },
      { id: "1-2mm-7-coils-r31s116lr", sku: "R31S116LR", size: "1.2mm 7 coils", displayName: "1.2mm 7 Coils", sourceProductName: "Hyper Spring Set / 1.2mm 7 coils", sourceUrl: officialUrl("hyper-spring-set-1-2mm-7-coils-copy") }
    ]
  }),
  shibataItem({
    category: "springs",
    slug: "weight-transfer-spring-series",
    productName: "SHIBATA Weight Transfer Spring Series",
    simplifiedName: "Weight Transfer Spring Series",
    modelNumber: "R31S044 / R31S045",
    productType: "spring set",
    handle: "weight-transfer-spring-35",
    notes: "Official SHIBATA weight transfer spring family for load transfer tuning. Collapsed into length variants.",
    legacyIds: ["shibata-springs-weight-transfer-spring-35", "shibata-springs-weight-transfer-spring-45"],
    variants: [
      { id: "35mm-r31s044", sku: "R31S044", size: "35mm", displayName: "35mm", sourceProductName: "Weight Transfer Spring 35mm", sourceUrl: officialUrl("weight-transfer-spring-35") },
      { id: "45mm-r31s045", sku: "R31S045", size: "45mm", displayName: "45mm", sourceProductName: "Weight Transfer Spring 45mm", sourceUrl: officialUrl("weight-transfer-spring-45") }
    ]
  }),
  ...[
    ["drift-spring-5-0", "DRIFT SPRING 5.0 L/R symmetrical", "Drift Spring 5.0 L/R", "R31S030LR", "drift-spring-5left-and-right-winding", "shibata-springs-drift-spring-series", "5-0-r31s030lr"],
    ["drift-spring-5-1", "DRIFT SPRING 5.1 L/R symmetrical", "Drift Spring 5.1 L/R", "R31S021LR", "drift-spring-5-1left-and-right-winding", "shibata-springs-drift-spring-series", "5-1-r31s021lr"],
    ["drift-spring-6-5", "DRIFT SPRING 6.5 L/R symmetrical", "Drift Spring 6.5 L/R", "R31S080LR", "drift-spring-6-5-l-r", "shibata-springs-drift-spring-series", "6-5-r31s080lr"],
    ["drift-spring-8-0-dual-rate", "DRIFT SPRING 8.0 L/R symmetrical Dual rate", "Drift Spring 8.0 L/R Dual Rate", "R31S040LR", "drift-spring-dual-rate-spring-8-symmetrical-windings", "shibata-springs-drift-spring-series", "8-0-dual-rate-r31s040lr"],
    ["drift-spring-9-0", "DRIFT SPRING 9.0 L/R symmetrical", "Drift Spring 9.0 L/R", "R31S090LR", "drift-spring-9-0-l-r-symmetrical", "shibata-springs-drift-spring-series", "9-0-r31s090lr"],
    ["progressive-spring-1-2-9-0", "SHIBATA Drift Spring 1.2mm 9.0", "Progressive Spring 1.2mm 9.0", "R31S110LR", "shibata-drift-progressive-spring-1-2mm-9-0", "shibata-springs-drift-spring-series", "1-2-9-0-r31s110lr"],
    ["drift-spring-9-5-dual-rate", "DRIFT SPRING 9.5 L/R symmetrical Dual rate", "Drift Spring 9.5 L/R Dual Rate", "R31S091LR", "drift-spring-9-5-l-r-symmetrical-dual-rate", "shibata-springs-drift-spring-series", "9-5-dual-rate-r31s091lr"],
    ["progressive-spring-1-3-9-5", "SHIBATA DRIFT Progressive Spring 1.3mm 9.5", "Progressive Spring 1.3mm 9.5", "R31S111LR", "shibata-drift-progressive-spring-1-3mm-9-6", "shibata-springs-drift-spring-series", "1-3-9-5-r31s111lr"],
    ["hyper-spring-1-2-6-coils", "Hyper Spring Set / 1.2mm 6 coils", "Hyper Spring 1.2mm 6 Coils", "R31S115LR", "hyper-spring-set-1-2mm-6-coils", "shibata-springs-hyper-spring-series", "1-2mm-6-coils-r31s115lr"],
    ["hyper-spring-1-2-7-coils", "Hyper Spring Set / 1.2mm 7 coils", "Hyper Spring 1.2mm 7 Coils", "R31S116LR", "hyper-spring-set-1-2mm-7-coils-copy", "shibata-springs-hyper-spring-series", "1-2mm-7-coils-r31s116lr"],
    ["weight-transfer-spring-35", "Weight Transfer Spring 35mm", "Weight Transfer Spring 35mm", "R31S044", "weight-transfer-spring-35", "shibata-springs-weight-transfer-spring-series", "35mm-r31s044"],
    ["weight-transfer-spring-45", "Weight Transfer Spring 45mm", "Weight Transfer Spring 45mm", "R31S045", "weight-transfer-spring-45", "shibata-springs-weight-transfer-spring-series", "45mm-r31s045"]
  ].map(([slug, productName, simplifiedName, modelNumber, handle, canonicalProductId, canonicalVariantId]) => shibataItem({
    category: "springs",
    slug,
    productName,
    simplifiedName,
    modelNumber,
    productType: "spring set",
    handle,
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Merged into a clean SHIBATA spring variant family for tuner selection.",
    canonicalProductId,
    canonicalVariantId
  })),
  shibataItem({
    category: "shockPistons",
    slug: "damper-piston",
    productName: "Damper piston",
    simplifiedName: "Damper Piston",
    modelNumber: "R31W120",
    productType: "shock piston",
    handle: "damper-piston4"
  }),
  shibataItem({
    category: "shockShafts",
    slug: "damper-shaft-series",
    productName: "SHIBATA Damper Shaft Series",
    simplifiedName: "Damper Shaft Series",
    modelNumber: "R31S011 / R31S112 / R31S113 / R31S054",
    productType: "shock shaft",
    handle: "hdfc-damper-shaft-30mm-2",
    notes: "Official SHIBATA damper shaft family. Grouped by length/coating so drivers choose the shaft spec, not separate duplicate-looking rows.",
    legacyIds: [
      "shibata-shockShafts-hdfc-damper-shaft-30mm",
      "shibata-shockShafts-titanium-coat-damper-shaft-28mm",
      "shibata-shockShafts-titanium-coat-damper-shaft-30mm",
      "shibata-shockShafts-titanium-damper-shaft-31mm"
    ],
    variants: [
      { id: "hdfc-30mm-r31s011", sku: "R31S011", size: "30mm", displayName: "HDFC 30mm", sourceProductName: "HDFC damper shaft 30mm", sourceUrl: officialUrl("hdfc-damper-shaft-30mm-2") },
      { id: "titanium-coat-28mm-r31s112", sku: "R31S112", size: "28mm", displayName: "Titanium Coat 28mm", sourceProductName: "Titanium coat damper shaft 28mm", sourceUrl: officialUrl("titanium-coat-damper-shaft-28mm-2") },
      { id: "titanium-coat-30mm-r31s113", sku: "R31S113", size: "30mm", displayName: "Titanium Coat 30mm", sourceProductName: "Titanium coat damper shaft 30mm", sourceUrl: officialUrl("titanium-coat-damper-shaft-30mm-2") },
      { id: "titanium-31mm-r31s054", sku: "R31S054", size: "31mm", displayName: "Titanium 31mm", sourceProductName: "Titanium Damper shaft 31mm", sourceUrl: officialUrl("titanium-damper-shaft-31mm") }
    ]
  }),
  ...[
    ["hdfc-damper-shaft-30mm", "HDFC damper shaft 30mm", "HDFC Damper Shaft 30mm", "R31S011", "hdfc-damper-shaft-30mm-2", "hdfc-30mm-r31s011"],
    ["titanium-coat-damper-shaft-28mm", "Titanium coat damper shaft 28mm", "Titanium Coat Damper Shaft 28mm", "R31S112", "titanium-coat-damper-shaft-28mm-2", "titanium-coat-28mm-r31s112"],
    ["titanium-coat-damper-shaft-30mm", "Titanium coat damper shaft 30mm", "Titanium Coat Damper Shaft 30mm", "R31S113", "titanium-coat-damper-shaft-30mm-2", "titanium-coat-30mm-r31s113"],
    ["titanium-damper-shaft-31mm", "Titanium Damper shaft 31mm", "Titanium Damper Shaft 31mm", "R31S054", "titanium-damper-shaft-31mm", "titanium-31mm-r31s054"]
  ].map(([slug, productName, simplifiedName, modelNumber, handle, canonicalVariantId]) => shibataItem({
    category: "shockShafts",
    slug,
    productName,
    simplifiedName,
    modelNumber,
    productType: "shock shaft",
    handle,
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Merged into the SHIBATA damper shaft variant family for cleaner selector browsing.",
    canonicalProductId: "shibata-shockShafts-damper-shaft-series",
    canonicalVariantId
  })),
  shibataItem({
    category: "gearDiffs",
    slug: "gear-diff-set-for-grk",
    productName: "Gear diff set for GRK",
    simplifiedName: "Gear Diff Set for GRK",
    modelNumber: "R31W271",
    productType: "gear differential",
    handle: "gear-diff-set-for-grk"
  }),
  shibataItem({
    category: "ballDiffs",
    slug: "ball-diff-set",
    productName: "Ball diff set",
    simplifiedName: "Ball Diff Set",
    modelNumber: "R31G001",
    productType: "ball differential",
    handle: "ball-diff-set"
  }),
  shibataItem({
    category: "solidAxles",
    slug: "spool-axle-set",
    productName: "GRK Spool axle set",
    simplifiedName: "GRK Spool Axle Set",
    modelNumber: "R31W201",
    productType: "solid axle / spool",
    handle: "grk-spool-axle-set"
  }),
  shibataItem({
    category: "drivetrainAccessories",
    slug: "aluminum-spur-gear-mount-for-grk",
    productName: "Aluminum spur gear mount for GRK",
    simplifiedName: "GRK Aluminum Spur Gear Mount",
    modelNumber: "R31W200",
    productType: "spur gear mount",
    compatibleChassis: ["Shibata GRK Global", "Shibata GRK Global Standard", "Shibata GRK"],
    notes: "Official aluminum spur gear mount for GRK Global / Global Standard drivetrains. Kept out of spur gear selectors because it is the mount, not the gear.",
    handle: "aluminum-spur-gear-mount-for-grk"
  }),
  shibataItem({
    category: "drivetrainAccessories",
    slug: "grkgs-spur-gear-mount",
    productName: "GRKGS Spur gear mount",
    simplifiedName: "GRKGS Spur Gear Mount",
    modelNumber: "R31G010",
    productType: "spur gear mount",
    compatibleChassis: ["Shibata GRK Global", "Shibata GRK Global Standard", "Shibata GS2 EVO"],
    notes: "Official GRKGS spur gear mount. Kept out of spur gear selectors because it is the mount, not the gear.",
    handle: "grkgs-spur-gear-mount"
  }),
  shibataItem({
    category: "drivetrainAccessories",
    slug: "grk-global-rwd-reduction-gear-adapter",
    productName: "GRK GLOBAL RWD Gear Adapter R31W213/W214/W215",
    simplifiedName: "GRK Global RWD Reduction Gear Adapter",
    modelNumber: "R31W269",
    productType: "reduction gear adapter",
    compatibleChassis: ["Shibata GRK Global RWD", "Shibata GRK Global Standard RWD"],
    notes: "Official GRK Global RWD adapter for using 10T/11T/12T reduction bevel gears. Kept as a drivetrain accessory rather than a gear selector item.",
    handle: "grk-global-rwd-gear-adapter-r31w213-w214-w215"
  }),
  shibataItem({
    category: "drivetrainAccessories",
    slug: "grk-deceleration-bevel-gear-series",
    productName: "GRK Deceleration Bevel Gear Series",
    simplifiedName: "GRK Deceleration Bevel Gear Series",
    modelNumber: "R31W213 / R31W214 / R31W215",
    productType: "reduction bevel gear",
    compatibleChassis: ["Shibata GRK Global RWD", "Shibata GRK Global Standard RWD"],
    notes: "Official GRK 10T/11T/12T deceleration bevel gear options. Grouped as drivetrain setup variants.",
    handle: "deceleration-bevel-gear-10t",
    variants: [
      { id: "10t-r31w213", sku: "R31W213", size: "10T", displayName: "10T", sourceProductName: "Deceleration bevel gear 10T" },
      { id: "11t-r31w214", sku: "R31W214", size: "11T", displayName: "11T", sourceProductName: "Deceleration bevel gear 11T" },
      { id: "12t-r31w215", sku: "R31W215", size: "12T", displayName: "12T", sourceProductName: "Deceleration bevel gear 12T" }
    ]
  }),
  shibataItem({
    category: "spurGears",
    slug: "grkgs-78t-spur-gear",
    productName: "GRKGS 78T Spur Gear",
    simplifiedName: "GRKGS 78T Spur Gear",
    modelNumber: "R31G011",
    productType: "spur gear",
    handle: "grkgs-78t-spur-gear"
  }),
  shibataItem({
    category: "spurGears",
    slug: "high-precision-48p-spur-gear-series",
    productName: "High-Precision Spur Gear 48P Series",
    simplifiedName: "High-Precision Spur Gear 48P Series",
    modelNumber: "R31S103 / R31S032",
    productType: "spur gear",
    handle: "high-precision-spur-gear-48p-72t",
    notes: "Official SHIBATA premium machined POM 48P spur gear family. Grouped by tooth count to keep the spur selector compact.",
    legacyIds: ["shibata-spurGears-48p-72t-spur-gear", "shibata-spurGears-48p-76t-spur-gear"],
    variants: [
      { id: "72t-r31s103", sku: "R31S103", size: "72T", displayName: "72T", sourceProductName: "High-precision Spur Gear 48P/72T", sourceUrl: officialUrl("high-precision-spur-gear-48p-72t") },
      { id: "76t-r31s032", sku: "R31S032", size: "76T", displayName: "76T", sourceProductName: "High-precision Spur Gear 48P/76T", sourceUrl: officialUrl("high-precision-spur-gear-48p-76t") }
    ]
  }),
  ...[
    ["48p-72t-spur-gear", "High-precision Spur Gear 48P/72T", "High-Precision Spur Gear 48P 72T", "R31S103", "high-precision-spur-gear-48p-72t", "72t-r31s103"],
    ["48p-76t-spur-gear", "High-precision Spur Gear 48P/76T", "High-Precision Spur Gear 48P 76T", "R31S032", "high-precision-spur-gear-48p-76t", "76t-r31s032"]
  ].map(([slug, productName, simplifiedName, modelNumber, handle, canonicalVariantId]) => shibataItem({
    category: "spurGears",
    slug,
    productName,
    simplifiedName,
    modelNumber,
    productType: "spur gear",
    handle,
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Merged into the SHIBATA High-Precision 48P spur gear variant family.",
    canonicalProductId: "shibata-spurGears-high-precision-48p-spur-gear-series",
    canonicalVariantId
  })),
  shibataItem({
    category: "slideRacks",
    slug: "grk5-slide-rack-unit",
    productName: "GRK5 Slide rack unit",
    simplifiedName: "GRK5 Slide Rack Unit",
    modelNumber: "R31S333BK / R31S333PU / R31S333RD",
    productType: "slide rack",
    handle: "grk5-slide-rack-unit-black",
    variants: colorVariants([
      { color: "Black", sku: "R31S333BK" },
      { color: "Purple", sku: "R31S333PU" },
      { color: "Red", sku: "R31S333RD" }
    ])
  }),
  shibataItem({
    category: "steeringRacks",
    slug: "grk5-steering-rack",
    productName: "GRK5 Steering rack",
    simplifiedName: "GRK5 Steering Rack",
    modelNumber: "R31S066",
    productType: "steering rack",
    handle: "grk5-steering-rack"
  }),
  shibataItem({
    category: "steeringRacks",
    slug: "gs2-evo-curved-steering-rack",
    productName: "GS2 EVO Curved Steering rack",
    simplifiedName: "GS2 EVO Curved Steering Rack",
    modelNumber: "R31G085",
    productType: "steering rack",
    compatibleChassis: ["Shibata GRK GS2 EVO", "Shibata GRK"],
    handle: "gs2-evo-curved-steering-rack"
  }),
  ...[
    {
      slug: "grk-r-motor-mount-unit",
      productName: "GRK-R Motor Mount Unit Set",
      simplifiedName: "GRK-R Motor Mount Unit",
      modelNumber: "GRKRCVBK / GRKRCVPU / GRKRCVRD",
      handle: "grk-r-motor-mount-unit-set-black",
      variants: colorVariants([
        { color: "Black", sku: "GRKRCVBK" },
        { color: "Purple", sku: "GRKRCVPU" },
        { color: "Red", sku: "GRKRCVRD" }
      ])
    },
    {
      slug: "grk4-motor-mount",
      productName: "GRK4 Motor mount set",
      simplifiedName: "GRK4 Motor Mount",
      modelNumber: "R31S311BK",
      handle: "grk4-motor-mount-set-black"
    },
    {
      slug: "grkgs-motor-mount-under-plate",
      productName: "GRKGS Motor mount under plate",
      simplifiedName: "GRKGS Motor Mount Under Plate",
      modelNumber: "R31G017",
      handle: "grkgs-motor-mount-under-plate-plastic"
    }
  ].map(({ slug, productName, simplifiedName, modelNumber, handle, variants }) => shibataItem({
    category: "motorMounts",
    slug,
    productName,
    simplifiedName,
    modelNumber,
    productType: "motor mount",
    handle,
    variants
  })),
  ...[
    {
      slug: "grk-direct-servo-horn-23t",
      productName: "GRK Direct servo horn 23T",
      simplifiedName: "GRK Direct Servo Horn 23T",
      modelNumber: "R31S026BK / R31S026PU / R31S026RD",
      handle: "grk-direct-servo-horn-23t-black",
      variants: colorVariants([
        { color: "Black", sku: "R31S026BK" },
        { color: "Purple", sku: "R31S026PU" },
        { color: "Red", sku: "R31S026RD" }
      ])
    },
    {
      slug: "grk-direct-servo-horn-25t",
      productName: "GRK Direct servo horn 25T",
      simplifiedName: "GRK Direct Servo Horn 25T",
      modelNumber: "R31S025BK / R31S025PU / R31S025RD",
      handle: "grk-direct-servo-horn-25t-black",
      variants: colorVariants([
        { color: "Black", sku: "R31S025BK" },
        { color: "Purple", sku: "R31S025PU" },
        { color: "Red", sku: "R31S025RD" }
      ])
    },
    {
      slug: "grk-direct-servo-horn-v2-23t",
      productName: "GRK Direct servo horn Ver2 23T",
      simplifiedName: "GRK Direct Servo Horn Ver.2 23T",
      modelNumber: "R31S109BK / R31S109PU / R31S109RD",
      handle: "grk-direct-servo-horn-ver2-23t-black",
      variants: colorVariants([
        { color: "Black", sku: "R31S109BK" },
        { color: "Purple", sku: "R31S109PU" },
        { color: "Red", sku: "R31S109RD" }
      ])
    },
    {
      slug: "grk-direct-servo-horn-v2-25t",
      productName: "GRK Direct servo horn Ver2 25T",
      simplifiedName: "GRK Direct Servo Horn Ver.2 25T",
      modelNumber: "R31S108BK / R31S108PU / R31S108RD",
      handle: "grk-direct-servo-horn-ver2-25t-black",
      variants: colorVariants([
        { color: "Black", sku: "R31S108BK" },
        { color: "Purple", sku: "R31S108PU" },
        { color: "Red", sku: "R31S108RD" }
      ])
    }
  ].map(({ slug, productName, simplifiedName, modelNumber, handle, variants }) => shibataItem({
    category: "servoHorns",
    slug,
    productName,
    simplifiedName,
    modelNumber,
    productType: "servo horn",
    handle,
    variants
  })),
  shibataItem({
    category: "frontAxles",
    slug: "grkrwd-lightweight-front-axle",
    productName: "GRKRWD lightweight front axle",
    simplifiedName: "GRKRWD Lightweight Front Axle",
    modelNumber: "R31S064",
    productType: "front axle",
    handle: "grkrwd-lightweight-front-axle"
  }),
  shibataItem({
    category: "frontAxles",
    slug: "hrp-aluminum-front-axle-4mm",
    productName: "HRP Aluminum Front Axle 4mm",
    simplifiedName: "HRP Aluminum Front Axle 4mm",
    modelNumber: "R31S131",
    productType: "front axle",
    compatibleChassis: ["Shibata HRP", "Shibata GRK"],
    handle: "hrp-aluminum-front-axle-4mm"
  }),
  ...[
    ["rear-universal-shaft-set", "Rear universal shaft set", "Rear Universal Shaft Set", "R31W205", "rear-universal-shaft-set-2"],
    ["universal-shaft-36-5mm", "Universal shaft 36.5mm", "Universal Shaft 36.5mm", "R31W272", "universal-shaft-36-5mm-2"],
    ["universal-shaft-42-5mm", "Universal shaft 42.5mm", "Universal Shaft 42.5mm", "R31W273", "universal-shaft-42-5mm-2"],
    ["universal-shaft-48-0mm", "Universal shaft 48.0mm", "Universal Shaft 48.0mm", "R31W435", "universal-shaft-48-0mm-2"],
    ["universal-shaft-49-5mm", "Universal shaft 49.5mm", "Universal Shaft 49.5mm", "R31W274", "universal-shaft-49-5mm-2"]
  ].map(([slug, productName, simplifiedName, modelNumber, handle]) => shibataItem({
    category: "rearAxles",
    slug,
    productName,
    simplifiedName,
    modelNumber,
    productType: "rear axle shaft",
    handle
  })),
  ...[
    ["dr-hpm135vr", "DR High Performance Motor VR4.3 / 13.5T", "DR High Performance Motor VR4.3 13.5T", "DR-HPM135VR", "dr-high-performance-motor-vr4-3-13-5t"],
    ["dr-hpm155", "SHIBATA DR HIGH Performance motor 15.5T", "DR High Performance Motor 15.5T", "DR-HPM155", "shibata-dr-high-performance-motor-15-5t"]
  ].map(([slug, productName, simplifiedName, modelNumber, handle]) => shibataItem({
    category: "motors",
    slug,
    productName,
    simplifiedName,
    modelNumber,
    productType: "standalone motor",
    handle
  })),
  ...wheels.flatMap((item) => [
    shibataItem({ ...item, category: "frontWheels", productType: "standalone wheel" }),
    shibataItem({ ...item, category: "rearWheels", productType: "standalone wheel" })
  ]),
  shibataItem({
    category: "tires",
    slug: "shibatire-hdpe-series",
    productName: "SHIBATIRE HDPE Drift Tire Series",
    simplifiedName: "SHIBATIRE HDPE Drift Tire Series",
    modelNumber: "DR-ST31PE / R31W436",
    productType: "standalone tire",
    handle: "shibatire-200d-hdpe-2",
    notes: "Official SHIBATA tire family. The 200D version is 26mm wide and uses the same HDPE material as R31W436; grouped as variants so tire selection stays compact.",
    legacyIds: ["shibata-tires-shibatire-200d-hdpe", "shibata-tires-shibatire-hdpe"],
    variants: [
      { id: "200d-hdpe-dr-st31pe", sku: "DR-ST31PE", size: "26mm", displayName: "200D HDPE 26mm", sourceProductName: "SHIBATIRE 200D HDPE(2)", sourceUrl: officialUrl("shibatire-200d-hdpe-2") },
      { id: "hdpe-r31w436", sku: "R31W436", displayName: "HDPE", sourceProductName: "SHIBATIRE HDPE (4)", sourceUrl: officialUrl("shibatire-hdpe-4") }
    ]
  }),
  shibataItem({
    category: "tires",
    slug: "shibatire-200d-hdpe",
    productName: "SHIBATIRE 200D HDPE Drift Tire",
    simplifiedName: "SHIBATIRE 200D HDPE Drift Tire",
    modelNumber: "DR-ST31PE",
    productType: "standalone tire",
    handle: "shibatire-200d-hdpe-2",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Merged into the SHIBATIRE HDPE tire variant family.",
    canonicalProductId: "shibata-tires-shibatire-hdpe-series",
    canonicalVariantId: "200d-hdpe-dr-st31pe"
  }),
  shibataItem({
    category: "tires",
    slug: "shibatire-hdpe",
    productName: "SHIBATIRE HDPE Drift Tire",
    simplifiedName: "SHIBATIRE HDPE Drift Tire",
    modelNumber: "R31W436",
    productType: "standalone tire",
    handle: "shibatire-hdpe-4",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Merged into the SHIBATIRE HDPE tire variant family.",
    canonicalProductId: "shibata-tires-shibatire-hdpe-series",
    canonicalVariantId: "hdpe-r31w436"
  })
];
