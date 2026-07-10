import type { ProductCatalogCategory, ProductCatalogItem } from "./productCatalog";

type SakuraCatalogInput = {
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
  legacyIds?: string[];
  variants?: ProductCatalogItem["variants"];
  tuneSelectable?: boolean;
  hiddenFromTuneBuilder?: boolean;
  reasonHidden?: string;
  canonicalProductId?: string;
  canonicalVariantId?: string;
};

const checkedAt = "2026-05-13";
const sakuraD5Fitment = ["3Racing Sakura D5", "3Racing Sakura D5S", "3Racing Sakura D5 MR", "3Racing Sakura D5 Pro"];
const sakuraD6Fitment = ["3Racing Sakura D6", "3Racing Sakura D6 Sport", "3Racing Sakura D6GA", "3Racing AuperD6"];

function officialUrl(handle: string) {
  return `https://3racing.shop/products/${handle}`;
}

function sakuraItem(input: SakuraCatalogInput): ProductCatalogItem {
  const skus = input.modelNumber.split(/\s*\/\s*/).map((sku) => sku.trim()).filter(Boolean);
  const primarySku = skus[0] ?? input.modelNumber;
  const variantNote = skus.length > 1 ? ` Official SKU variants: ${skus.join(", ")}.` : "";
  return {
    id: `3racing-${input.category}-${input.slug}`,
    category: input.category,
    brand: "3Racing",
    productName: input.productName,
    simplifiedName: input.simplifiedName,
    displayName: input.simplifiedName,
    modelNumber: primarySku,
    partNumber: primarySku,
    productType: input.productType,
    compatibleChassis: input.compatibleChassis ?? [...sakuraD5Fitment, ...sakuraD6Fitment],
    notes: `${input.notes ?? "Official 3Racing Sakura catalog product. Fitment should be confirmed for the driver's exact Sakura generation."}${variantNote}`,
    tunableParameters: [],
    sourceUrl: officialUrl(input.handle),
    sourceName: "3Racing official shop",
    userAdded: false,
    verified: true,
    confidence: "high",
    needsReview: false,
    lastCheckedAt: checkedAt,
    aliases: [...(input.aliases ?? []), ...skus],
    legacyIds: input.legacyIds,
    variants: input.variants,
    tuneSelectable: input.tuneSelectable,
    hiddenFromTuneBuilder: input.hiddenFromTuneBuilder,
    reasonHidden: input.reasonHidden,
    canonicalProductId: input.canonicalProductId,
    canonicalVariantId: input.canonicalVariantId
  };
}

const d5 = (input: Omit<SakuraCatalogInput, "compatibleChassis">) => sakuraItem({ ...input, compatibleChassis: sakuraD5Fitment });
const d6 = (input: Omit<SakuraCatalogInput, "compatibleChassis">) => sakuraItem({ ...input, compatibleChassis: sakuraD6Fitment });
const colorVariant = (color: string, sku: string) => ({
  id: `${color.toLowerCase()}-${sku.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  color,
  sku,
  displayName: color,
  sourceProductName: color
});
const wheelVariant = (displayName: string, sku: string) => ({
  id: `${displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${sku.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  sku,
  displayName,
  sourceProductName: displayName
});
const toothVariants = (teeth: number[], prefix: string) =>
  teeth.map((tooth) => ({
    id: `${tooth}t-${prefix.toLowerCase()}${tooth}`,
    sku: `${prefix}${tooth}`,
    displayName: `${tooth}T`,
    size: `${tooth}T`,
    sourceProductName: `${tooth}T`
  }));

export const sakuraCatalogItems: ProductCatalogItem[] = [
  d5({
    category: "upperDecks",
    slug: "d5s-upper-deck",
    productName: "SAK-D515 Upper Deck For D5S",
    simplifiedName: "D5S Upper Deck",
    modelNumber: "SAK-D515",
    productType: "upper deck",
    handle: "sak-d515-upper-deck-for-d5s",
    notes: "Official 3Racing upper deck for Sakura D5S. Added to upper deck selection so deck tuning does not get mixed into the generic chassis selector."
  }),
  d6({
    category: "lowerDecks",
    slug: "d6-fibre-glass-main-chassis",
    productName: "SAK-D603 Fibre Glass Main Chassis for D6",
    simplifiedName: "D6 Fibre Glass Main Chassis",
    modelNumber: "SAK-D603",
    productType: "lower deck / main chassis plate",
    handle: "sak-d603-fibre-glass-main-chssis-for-d6-copy",
    notes: "Official Sakura D6 Sport fibre glass main chassis plate. Added to lower deck selection; separate from complete D6 kits and support mounts."
  }),
  d6({
    category: "lowerDecks",
    slug: "d6-carbon-graphite-main-chassis",
    productName: "SAK-D603GA Carbon Graphite Main Chassis Colored for D6",
    simplifiedName: "D6 Carbon Graphite Main Chassis",
    modelNumber: "SAK-D603GA",
    productType: "lower deck / main chassis plate",
    handle: "sak-d603-fibre-glass-main-chssis-for-d6-copy",
    notes: "Official Sakura D6 carbon graphite main chassis color version. Kept as a lower deck/main chassis selector item."
  }),
  d6({
    category: "upperDecks",
    slug: "d6-fibre-glass-upper-deck",
    productName: "SAK-D616 Fibre Glass Upper Deck for D6",
    simplifiedName: "D6 Fibre Glass Upper Deck",
    modelNumber: "SAK-D616",
    productType: "upper deck",
    handle: "sak-d615-92mm-servo-rod-for-d6-copy",
    notes: "Official Sakura D6 fibre glass upper deck. Added after separating deck tuning into upper and lower deck selectors."
  }),
  d6({
    category: "upperDecks",
    slug: "d6-carbon-graphite-upper-deck",
    productName: "SAK-D616GA Carbon Graphite Color Upper Deck For D6",
    simplifiedName: "D6 Carbon Graphite Upper Deck",
    modelNumber: "SAK-D616GA",
    productType: "upper deck",
    handle: "sak-d616-fibre-glass-upper-deck-for-d6-copy",
    notes: "Official Sakura D6 carbon graphite color upper deck."
  }),
  d6({
    category: "upperDecks",
    slug: "auper-d6-aluminum-upper-deck",
    productName: "SAK-D6811 Aluminum Upper Deck for Auper D6",
    simplifiedName: "Auper D6 Aluminum Upper Deck",
    modelNumber: "SAK-D6811/BU / SAK-D6811/PU / SAK-D6811/RE",
    productType: "upper deck",
    handle: "sak-d6811-aluminum-upper-deck-for-auper-d6",
    notes: "Official Auper D6 aluminum upper deck assembly with front and rear upper deck plates. Color variants are grouped so the selector remains compact.",
    variants: [
      colorVariant("Blue", "SAK-D6811/BU"),
      colorVariant("Purple", "SAK-D6811/PU"),
      colorVariant("Red", "SAK-D6811/RE")
    ]
  }),
  d5({
    category: "frontLowerArms",
    slug: "d5-front-suspension-arm",
    productName: "SAK-D503 Front Suspension Arm Set For D5S",
    simplifiedName: "D5 Front Suspension Arm",
    modelNumber: "SAK-D503",
    productType: "front lower arm",
    handle: "sak-d503-front-suspension-arm-set-for-d5s"
  }),
  d5({
    category: "rearLowerArms",
    slug: "d5-rear-suspension-arm",
    productName: "SAK-D505 Rear Suspension Arm Set For D5S",
    simplifiedName: "D5 Rear Suspension Arm",
    modelNumber: "SAK-D505",
    productType: "rear lower arm",
    handle: "sak-d505-rear-suspension-arm-set-for-d5s"
  }),
  d5({
    category: "rearLowerArms",
    slug: "d5pro-mr-rear-suspension-arm",
    productName: "SAK-D5633 D5pro_MR Rear Suspension Arm",
    simplifiedName: "D5 Pro MR Rear Suspension Arm",
    modelNumber: "SAK-D5633",
    productType: "rear lower arm",
    handle: "sak-d5633-d5pro_mr-rear-suspension-arm"
  }),
  d5({
    category: "frontLowerArms",
    slug: "d5-aluminum-front-suspension-arms-v2",
    productName: "SAK-D5621/V2 Aluminum Front Suspension Arms Ver.2 For D5",
    simplifiedName: "D5 Aluminum Front Suspension Arms Ver.2",
    modelNumber: "SAK-D5621/V2",
    productType: "front lower arm",
    handle: "sak-d5621-v2-aluminum-front-suspension-arms-ver-2-for-d5"
  }),
  d5({
    category: "frontUpperArms",
    slug: "d5-al-front-upper-arms",
    productName: "SAK-D5651 AL Front Upper Arms",
    simplifiedName: "D5 MR Aluminum Front Upper Arms",
    modelNumber: "SAK-D5651",
    productType: "front upper arm",
    handle: "sak-d5651-al-front-upper-arms"
  }),
  d5({
    category: "frontKnuckles",
    slug: "d5-kpi-knuckle",
    productName: "SAK-D522 KPI Knuckle For D5S",
    simplifiedName: "D5 KPI Knuckle",
    modelNumber: "SAK-D522",
    productType: "front steering knuckle",
    handle: "sak-d522-kpi-knuckle-for-d5s"
  }),
  d5({
    category: "frontKnuckles",
    slug: "d5mr-kpi-steering-block",
    productName: "SAK-D550 KPI Steering Block For D5MR",
    simplifiedName: "D5MR KPI Steering Block",
    modelNumber: "SAK-D550",
    productType: "front steering knuckle",
    handle: "sak-d550-kpi-steering-block-for-d5mr",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Removed from front knuckle selector by catalog review."
  }),
  d5({
    category: "frontKnuckles",
    slug: "d5mr-al-high-profile-kpi-knuckle",
    productName: "SAK-D5642 AL High Profile KPI Knuckle",
    simplifiedName: "D5MR High Profile KPI Knuckle",
    modelNumber: "SAK-D5642",
    productType: "front steering knuckle",
    handle: "sak-d5642-al-high-profile-kpi-kunckle"
  }),
  d5({
    category: "rearHubCarriers",
    slug: "d5-rear-hub-carrier",
    productName: "SAK-D523 Rear Hub Carrier For D5S",
    simplifiedName: "D5 Rear Hub Carrier",
    modelNumber: "SAK-D523",
    productType: "rear hub carrier",
    handle: "sak-d523-rear-hub-carrier-for-d5s"
  }),
  d5({
    category: "rearHubCarriers",
    slug: "d5mr-al-high-profile-rear-upright",
    productName: "SAK-D5648 AL High Profile Rear Upright",
    simplifiedName: "D5MR High Profile Rear Upright",
    modelNumber: "SAK-D5648",
    productType: "rear hub carrier",
    handle: "sak-d5648-al-high-profile-rear-upright"
  }),
  d5({
    category: "wheelHexes",
    slug: "d5mr-al-rear-wheel-hub-standard",
    productName: "SAK-D5652 AL Rear Wheel Hub Standard",
    simplifiedName: "D5MR Aluminum Rear Wheel Hub",
    modelNumber: "SAK-D5652",
    productType: "rear wheel hub",
    handle: "sak-d5652-al-rear-wheel-hub-standard",
    notes: "Official 3Racing aluminum rear wheel hub for Sakura D5MR. Kept out of rear hub carrier selectors because it is a wheel hub/hex-style part, not the upright or hub carrier.",
    legacyIds: ["3racing-rearHubCarriers-d5mr-al-rear-wheel-hub-standard"]
  }),
  d5({
    category: "frontToeBlocks",
    slug: "d5-front-suspension-mount",
    productName: "SAK-D508/A Front Suspension Mount For D5S",
    simplifiedName: "D5 Front Suspension Mount",
    modelNumber: "SAK-D508/A",
    productType: "toe block / suspension mount",
    handle: "sak-d508-a-front-suspension-mount-for-d5s"
  }),
  d5({
    category: "suspensionKits",
    slug: "d5-aluminum-upper-suspension-mount",
    productName: "SAK-D5617 Aluminium Upper Suspension Mount For D5",
    simplifiedName: "D5 Aluminum Upper Suspension Mount",
    modelNumber: "SAK-D5617",
    productType: "upper suspension mount",
    handle: "sak-d5617-aluminum-upper-suspension-mount-for-d5",
    notes: "Official 3Racing 7075 aluminum upper suspension mount for Sakura D5. 3Racing describes it as a front geometry tuning upgrade for track width and hinge pin angle changes when used with SAK-A545 mount nuts."
  }),
  d5({
    category: "frontToeBlocks",
    slug: "advance-20-ff-suspension-mount",
    productName: "SAK-A539 7075 Suspension Mount FF +0 For Advance 20",
    simplifiedName: "Advance 20 FF Suspension Mount",
    modelNumber: "SAK-A539",
    productType: "toe block / suspension mount",
    handle: "sak-a539-7075-suspension-mount-ff-0-for-advance-20",
    variants: [
      {
        id: "ff-plus-0-sak-a539",
        size: "+0",
        sku: "SAK-A539",
        displayName: "FF +0"
      }
    ]
  }),
  d5({
    category: "rearToeBlocks",
    slug: "advance-20-ff-suspension-mount",
    productName: "SAK-A539 7075 Suspension Mount FF +0 For Advance 20",
    simplifiedName: "Advance 20 FF Suspension Mount",
    modelNumber: "SAK-A539",
    productType: "toe block / suspension mount",
    handle: "sak-a539-7075-suspension-mount-ff-0-for-advance-20",
    variants: [
      {
        id: "ff-plus-0-sak-a539",
        size: "+0",
        sku: "SAK-A539",
        displayName: "FF +0"
      }
    ]
  }),
  ...[
    ["advance-20-ff-45mm-suspension-mount", "SAK-A543 7075 Suspension Mount FF 45mm For Advance 20", "Advance 20 FF Suspension Mount", "SAK-A543", "sak-a543-7075-suspension-mount-ff-45mm-for-advance-20", "FF 45mm"],
    ["advance-20-fr-rf-suspension-mount", "SAK-A541 7075 FR-RF Suspension Mount For Advance 20", "Advance 20 FR/RF Suspension Mount", "SAK-A541", "sak-a541-7075-fr-rf-suspension-mount-for-advance-20"],
    ["advance-20-ars-suspension-mount", "SAK-A542 7075 Suspension Mount ARS For Advance 20", "Advance 20 ARS Suspension Mount", "SAK-A542", "sak-a542-7075-suspension-mount-ars-for-advance-20"],
    ["advance-20-rr-46-2-suspension-mount", "SAK-A540 7075 Suspension Mount RR 46.2mm For Advance 20", "Advance 20 RR Suspension Mount", "SAK-A540", "sak-a540-7075-suspension-mount-rr-46-2mm-for-advance-20", "RR 46.2mm"],
    ["advance-20-rr-suspension-mount", "SAK-A544 7075 Suspension Mount RR 43.7mm For Advance 20", "Advance 20 RR Suspension Mount", "SAK-A544", "sak-a544-7075-suspension-mount-rr-43-7mm-for-advance-20", "RR 43.7mm"]
  ].flatMap(([slug, productName, simplifiedName, modelNumber, handle, displayName]) => [
    d5({ category: "frontToeBlocks", slug, productName, simplifiedName, modelNumber, productType: "toe block / suspension mount", handle, variants: [{ id: `${modelNumber.toLowerCase()}`, sku: modelNumber, displayName: displayName ?? modelNumber }] }),
    d5({ category: "rearToeBlocks", slug, productName, simplifiedName, modelNumber, productType: "toe block / suspension mount", handle, variants: [{ id: `${modelNumber.toLowerCase()}`, sku: modelNumber, displayName: displayName ?? modelNumber }] })
  ]),
  d5({
    category: "frontShockTowers",
    slug: "d5-front-shock-tower",
    productName: "SAK-D517 Front Shock Tower For D5S",
    simplifiedName: "D5 Front Shock Tower",
    modelNumber: "SAK-D517",
    productType: "front shock tower",
    handle: "sak-d517-front-shock-tower-for-d5s"
  }),
  d5({
    category: "frontShockTowers",
    slug: "d5-mini-front-shock-tower",
    productName: "SAK-D518 Front Shock Tower For D5 Mini Sport",
    simplifiedName: "D5 Mini Front Shock Tower",
    modelNumber: "SAK-D518",
    productType: "front shock tower",
    handle: "sak-d518-front-shock-tower-for-d5-mini-sport"
  }),
  d5({
    category: "frontShockTowers",
    slug: "d5-aluminum-front-upper-shock-tower",
    productName: "SAK-D5606 Aluminium Front Upper Shock Tower For D5",
    simplifiedName: "D5 Aluminum Front Upper Shock Tower",
    modelNumber: "SAK-D5606",
    productType: "front shock tower",
    handle: "sak-d5606-aluminum-front-upper-shock-tower-for-d5"
  }),
  d5({
    category: "rearShockTowers",
    slug: "d5-fiber-rear-shock-tower",
    productName: "SAK-D520 Fiber Rear Shock Tower For D5S",
    simplifiedName: "D5 Fiber Rear Shock Tower",
    modelNumber: "SAK-D520",
    productType: "rear shock tower",
    handle: "sak-d520-fiber-rear-shock-tower-for-d5s"
  }),
  d5({
    category: "rearShockTowers",
    slug: "d5-aluminum-rear-shock-tower",
    productName: "SAK-D5612 Aluminium Rear Shock Tower For D5 Pro",
    simplifiedName: "D5 Aluminum Rear Shock Tower",
    modelNumber: "SAK-D5612",
    productType: "rear shock tower",
    handle: "sak-d5612-aluminum-rear-shock-tower-for-d5-pro"
  }),
  d5({
    category: "dampers",
    slug: "d5-55mm-damper-set",
    productName: "SAK-D529 Damper Set For D5 55mm",
    simplifiedName: "D5 55mm Damper Set",
    modelNumber: "SAK-D529",
    productType: "complete damper / shock",
    handle: "sak-d529-damper-set-for-d5-55mm"
  }),
  d5({
    category: "gearDiffs",
    slug: "d5-39t-metal-gear-differential",
    productName: "SAK-D501 39T Metal Gear Differential For D5S",
    simplifiedName: "D5 39T Metal Gear Differential",
    modelNumber: "SAK-D501",
    productType: "gear differential",
    handle: "sak-d501-39t-metal-gear-differential-for-d5s"
  }),
  d5({
    category: "solidAxles",
    slug: "d5-solid-spool-core",
    productName: "SAK-D502 Solid Spool Core For D5",
    simplifiedName: "D5 Solid Spool Core",
    modelNumber: "SAK-D502",
    productType: "solid axle / spool",
    handle: "sak-d502-solid-spool-core-for-d5"
  }),
  d5({
    category: "steeringRacks",
    slug: "d5-steering-wiper",
    productName: "SAK-D510 Steering Wiper For D5S",
    simplifiedName: "D5 Steering Wiper",
    modelNumber: "SAK-D510",
    productType: "steering rack",
    handle: "sak-d510-steering-wiper-for-d5s"
  }),
  d5({
    category: "steeringRacks",
    slug: "d5-aluminum-steering-wiper",
    productName: "SAK-D5607 Aluminium Steering Wiper For D5",
    simplifiedName: "D5 Aluminum Steering Wiper",
    modelNumber: "SAK-D5607",
    productType: "steering rack",
    handle: "sak-d5607-aluminum-steering-wiper-for-d5"
  }),
  d5({
    category: "motorMounts",
    slug: "d5-motor-mount",
    productName: "SAK-D525 Motor Mount Set For D5S",
    simplifiedName: "D5 Motor Mount",
    modelNumber: "SAK-D525",
    productType: "motor mount",
    handle: "sak-d525-motor-mount-set-for-d5s"
  }),
  d5({
    category: "motorMounts",
    slug: "d5mr-motor-mount",
    productName: "SAK-D5637 AL MR Motor Mount",
    simplifiedName: "D5MR Aluminum Motor Mount",
    modelNumber: "SAK-D5637",
    productType: "motor mount",
    handle: "sak-d5637-al-mr_motor-mount"
  }),
  d5({
    category: "frontAxles",
    slug: "d5-front-drive-axle",
    productName: "SAK-D544 Front Drive Axle",
    simplifiedName: "D5 Front Drive Axle",
    modelNumber: "SAK-D544",
    productType: "front axle",
    handle: "sak-d544-front-drive-axle"
  }),
  d5({
    category: "frontAxles",
    slug: "d5-front-wheel-axle-2mm",
    productName: "SAK-D5650 Front Wheel Axle Shaft +2mm",
    simplifiedName: "D5MR Front Wheel Axle +2mm",
    modelNumber: "SAK-D5650",
    productType: "front axle",
    handle: "sak-d5650-front-wheel-axle-shat-2mm"
  }),
  d5({
    category: "rearAxles",
    slug: "d5-swing-shaft-44mm",
    productName: "SAK-D535 Swing Shaft Set For D5S 44mm",
    simplifiedName: "D5 Swing Shaft 44mm",
    modelNumber: "SAK-D535",
    productType: "rear axle shaft",
    handle: "sak-d535-swing-shaft-set-for-d5s-44mm"
  }),
  d5({
    category: "frontWheels",
    slug: "d5-lite-rim-set",
    productName: "SAK-D545 Rim Set For D5 Lite",
    simplifiedName: "D5 Lite Rim Set",
    modelNumber: "SAK-D545/CH / SAK-D545/IR / SAK-D545",
    productType: "standalone wheel",
    handle: "sak-d545-rim-set-for-d5-lite-black-1",
    variants: [
      wheelVariant("Chrome", "SAK-D545/CH"),
      wheelVariant("Iron", "SAK-D545/IR"),
      wheelVariant("Black", "SAK-D545")
    ]
  }),
  d5({
    category: "rearWheels",
    slug: "d5-lite-rim-set",
    productName: "SAK-D545 Rim Set For D5 Lite",
    simplifiedName: "D5 Lite Rim Set",
    modelNumber: "SAK-D545/CH / SAK-D545/IR / SAK-D545",
    productType: "standalone wheel",
    handle: "sak-d545-rim-set-for-d5-lite-black-1",
    variants: [
      wheelVariant("Chrome", "SAK-D545/CH"),
      wheelVariant("Iron", "SAK-D545/IR"),
      wheelVariant("Black", "SAK-D545")
    ]
  }),
  d6({
    category: "frontLowerArms",
    slug: "d6-front-lower-wishbone",
    productName: "SAK-D601 Front lower wishbone set for D6",
    simplifiedName: "D6 Front Lower Wishbone",
    modelNumber: "SAK-D601",
    productType: "front lower arm",
    handle: "sak-d602-front-lower-bumper-for-d6-copy"
  }),
  d6({
    category: "rearLowerArms",
    slug: "d6-rear-lower-wishbone",
    productName: "SAK-D606 Rear Lower wishbones for D6",
    simplifiedName: "D6 Rear Lower Wishbone",
    modelNumber: "SAK-D606",
    productType: "rear lower arm",
    handle: "sak-d605-steering-post-set-m8-x-15-8-for-d6-copy"
  }),
  d6({
    category: "frontLowerArms",
    slug: "auper-d6-aluminum-front-lower-arm",
    productName: "SAK-D6802 Aluminum Front lower Arm for Auper D6",
    simplifiedName: "Auper D6 Aluminum Front Lower Arm",
    modelNumber: "SAK-D6802/BU/V2 / SAK-D6802/PU/V2 / SAK-D6802/RE/V2",
    productType: "front lower arm",
    handle: "sak-d6801-aluminium-chassis-for-auper-d6-copy",
    variants: [
      colorVariant("Blue", "SAK-D6802/BU/V2"),
      colorVariant("Purple", "SAK-D6802/PU/V2"),
      colorVariant("Red", "SAK-D6802/RE/V2")
    ]
  }),
  d6({
    category: "rearLowerArms",
    slug: "auper-d6-aluminum-rear-lower-arm",
    productName: "SAK-D6803 Aluminum Rear lower Arm for Auper D6",
    simplifiedName: "Auper D6 Aluminum Rear Lower Arm",
    modelNumber: "SAK-D6803/BU/V2 / SAK-D6803/PU/V2 / SAK-D6803/RE/V2",
    productType: "rear lower arm",
    handle: "sak-d6803-aluminum-rear-lower-arm-for-auper-d6",
    variants: [
      colorVariant("Blue", "SAK-D6803/BU/V2"),
      colorVariant("Purple", "SAK-D6803/PU/V2"),
      colorVariant("Red", "SAK-D6803/RE/V2")
    ]
  }),
  d6({
    category: "frontUpperArms",
    slug: "d6-front-upper-wishbone",
    productName: "SAK-D639 Front Upper wishbone for D6",
    simplifiedName: "D6 Front Upper Wishbone",
    modelNumber: "SAK-D639",
    productType: "front upper arm",
    handle: "sak-d638-rear-swing-outer-shaft-for-d6-copy"
  }),
  d6({
    category: "rearUpperArms",
    slug: "d6-rear-upper-wishbone",
    productName: "SAK-D640 Rear Upper wishbone for D6",
    simplifiedName: "D6 Rear Upper Wishbone",
    modelNumber: "SAK-D640",
    productType: "rear upper arm",
    handle: "sak-d639-front-upper-wishbone-for-d6-copy"
  }),
  d6({
    category: "frontUpperArms",
    slug: "auper-d6-aluminum-front-upper-arm",
    productName: "SAK-D6822 Aluminum Front Upper Arm for Auper D6",
    simplifiedName: "Auper D6 Aluminum Front Upper Arm",
    modelNumber: "SAK-D6822/BU / SAK-D6822/PU / SAK-D6822/RE",
    productType: "front upper arm",
    handle: "sak-d6803-aluminum-rear-lower-arm-for-auper-d6-copy-1",
    variants: [
      colorVariant("Blue", "SAK-D6822/BU"),
      colorVariant("Purple", "SAK-D6822/PU"),
      colorVariant("Red", "SAK-D6822/RE")
    ]
  }),
  d6({
    category: "rearUpperArms",
    slug: "auper-d6-aluminum-rear-upper-arm",
    productName: "SAK-D6823 Aluminium Rear Upper Arm for Auper D6",
    simplifiedName: "Auper D6 Aluminum Rear Upper Arm",
    modelNumber: "SAK-D6823/BU / SAK-D6823/PU / SAK-D6823/RE",
    productType: "rear upper arm",
    handle: "sak-d6823-aluminium-rear-upper-arm-for-auper-d6",
    aliases: ["SAK-D6823/BU", "SAK-D6823/PU", "SAK-D6823/RE"],
    legacyIds: [
      "3racing-rearUpperArms-auper-d6-aluminum-rear-upper-arm-blue",
      "3racing-rearUpperArms-auper-d6-aluminum-rear-upper-arm-purple",
      "3racing-rearUpperArms-auper-d6-aluminum-rear-upper-arm-red"
    ],
    variants: [
      colorVariant("Blue", "SAK-D6823/BU"),
      colorVariant("Purple", "SAK-D6823/PU"),
      colorVariant("Red", "SAK-D6823/RE")
    ]
  }),
  d6({
    category: "frontKnuckles",
    slug: "d6-composite-knuckle",
    productName: "SAK-D609 Composite Knuckle set for D6",
    simplifiedName: "D6 Composite Knuckle",
    modelNumber: "SAK-D609",
    productType: "front steering knuckle",
    handle: "sak-d609-composite-knuckle-set-for-d6"
  }),
  d6({
    category: "frontKnuckles",
    slug: "auper-d6-aluminum-kpi-knuckle",
    productName: "SAK-D6814 Aluminum KPI knuckle for Auper D6",
    simplifiedName: "Auper D6 Aluminum KPI Knuckle",
    modelNumber: "SAK-D6814/BU / SAK-D6814/PU / SAK-D6814/RE",
    productType: "front steering knuckle",
    handle: "sak-d6814-aluminum-kpi-knuckle-for-auper-d6",
    variants: [
      colorVariant("Blue", "SAK-D6814/BU"),
      colorVariant("Purple", "SAK-D6814/PU"),
      colorVariant("Red", "SAK-D6814/RE")
    ]
  }),
  d6({
    category: "rearHubCarriers",
    slug: "auper-d6-aluminum-rear-upright",
    productName: "SAK-D6816 Aluminum Rear Upright for Auper D6",
    simplifiedName: "Auper D6 Aluminum Rear Upright",
    modelNumber: "SAK-D6816/BU / SAK-D6816/RE / SAK-D6816/PU",
    productType: "rear hub carrier",
    handle: "sak-d6816-aluminum-rear-upright-for-auper-d6",
    variants: [
      colorVariant("Blue", "SAK-D6816/BU"),
      colorVariant("Red", "SAK-D6816/RE"),
      colorVariant("Purple", "SAK-D6816/PU")
    ]
  }),
  d6({
    category: "steeringRacks",
    slug: "d6-dual-wiper-steering",
    productName: "SAK-D604 Dual Wiper Steering set for D6",
    simplifiedName: "D6 Dual Wiper Steering Set",
    modelNumber: "SAK-D604",
    productType: "steering rack",
    handle: "sak-d603_ga_re-carbon-graphite-main-chssis-red-coloured-for-d6-copy"
  }),
  d6({
    category: "steeringRacks",
    slug: "auper-d6-aluminum-steering-rack",
    productName: "SAK-D6805 Aluminum Steering Rack for Auper D6",
    simplifiedName: "Auper D6 Aluminum Steering Rack",
    modelNumber: "SAK-D6805/BU / SAK-D6805/PU / SAK-D6805/RE",
    productType: "steering rack",
    handle: "sak-d6804-aluminum-front-bumper-for-auper-d6-copy",
    variants: [
      colorVariant("Blue", "SAK-D6805/BU"),
      colorVariant("Purple", "SAK-D6805/PU"),
      colorVariant("Red", "SAK-D6805/RE")
    ]
  }),
  d6({
    category: "motorMounts",
    slug: "d6-mr-upper-motor-plate",
    productName: "SAK-D617 MR upper motor Plate for D6",
    simplifiedName: "D6 MR Upper Motor Plate",
    modelNumber: "SAK-D617",
    productType: "motor mount",
    handle: "sak-d616_re-carbon-graphite-red-color-upper-deck-for-d6-copy"
  }),
  d6({
    category: "motorMounts",
    slug: "d6-rr-lower-motor-plate",
    productName: "SAK-D618 RR lower motor Plate for D6",
    simplifiedName: "D6 RR Lower Motor Plate",
    modelNumber: "SAK-D618",
    productType: "motor mount",
    handle: "sak-d618-rr-lower-motor-plate-for-d6"
  }),
  d6({
    category: "motorMounts",
    slug: "auper-d6-motor-mount-base",
    productName: "SAK-D6808F/G Aluminum Motor Mount Base for Auper D6",
    simplifiedName: "Auper D6 Aluminum Motor Mount Base",
    modelNumber: "SAK-D6808F/BU / SAK-D6808G/BU",
    productType: "motor mount",
    handle: "sak-d6808e-aluminum-upper-deck-mount-for-auper-d6-copy",
    variants: [
      { id: "f-blue-sak-d6808f-bu", color: "Blue", sku: "SAK-D6808F/BU", displayName: "F / Blue", sourceProductName: "F Blue" },
      { id: "g-blue-sak-d6808g-bu", color: "Blue", sku: "SAK-D6808G/BU", displayName: "G / Blue", sourceProductName: "G Blue" }
    ]
  }),
  d6({
    category: "gearDiffs",
    slug: "d6-idler-gear-differential",
    productName: "SAK-D630 idlerGear differential for D6",
    simplifiedName: "D6 Idler Gear Differential",
    modelNumber: "SAK-D630",
    productType: "gear differential",
    handle: "sak-d629-bevel-diff-bearing-housing-for-d6-copy"
  }),
  d6({
    category: "gearDiffs",
    slug: "d6-cero-gear-differential",
    productName: "SAK-C101 Gear Differential Set For 3RACING Cero",
    simplifiedName: "Cero/D6 Gear Differential Set",
    modelNumber: "SAK-C101",
    productType: "gear differential",
    handle: "sak-c101-cero-ultra-gear-differential-set"
  }),
  d6({
    category: "dampers",
    slug: "d6-oil-absorber",
    productName: "SAK-D652 Oil Absorber For D6GA",
    simplifiedName: "D6GA Oil Absorber",
    modelNumber: "SAK-D652/BU / SAK-D652/PU / SAK-D652/RE",
    productType: "complete damper / shock",
    handle: "sak-d652-oil-absorber-for-d6ga",
    variants: [
      colorVariant("Blue", "SAK-D652/BU"),
      colorVariant("Purple", "SAK-D652/PU"),
      colorVariant("Red", "SAK-D652/RE")
    ]
  }),
  d6({
    category: "dampers",
    slug: "auper-d6-rear-big-bore-absorber",
    productName: "SAK-D6818 Aluminum Rear Big Bore Absorber for Auper D6",
    simplifiedName: "Auper D6 Rear Big Bore Absorber",
    modelNumber: "SAK-D6818/BU / SAK-D6818/PU / SAK-D6818/RE",
    productType: "complete damper / shock",
    handle: "sak-d6818-aluminum-rear-big-bore-absorber-for-auper-d6",
    variants: [
      colorVariant("Blue", "SAK-D6818/BU"),
      colorVariant("Purple", "SAK-D6818/PU"),
      colorVariant("Red", "SAK-D6818/RE")
    ]
  }),
  d6({
    category: "shockPistons",
    slug: "d6-pom-piston",
    productName: "SAK-D642 M10 x 1.2 x 6 POM piston set for D6",
    simplifiedName: "D6 POM Piston Set",
    modelNumber: "SAK-D642",
    productType: "shock piston",
    handle: "sak-d642-m10-x-1-2-x-6-pom-piston-set-for-d6"
  }),
  d6({
    category: "springs",
    slug: "d6-1-2x14x34-spring",
    productName: "SAK-D651 M1.2 x 14 x 34 Spring",
    simplifiedName: "D6 M1.2 x 14 x 34 Spring",
    modelNumber: "SAK-D651 / SAK-D651/TR / SAK-D651/GY / SAK-D651/WH / SAK-D651/YE / SAK-D651/OR / SAK-D651/GR / SAK-D651/BU / SAK-D651/RE / SAK-D651/PU",
    productType: "spring set",
    handle: "sak-d651-m1-2-x-14-x-34-spring-set",
    variants: [
      wheelVariant("Base", "SAK-D651"),
      colorVariant("Transparent", "SAK-D651/TR"),
      colorVariant("Gray", "SAK-D651/GY"),
      colorVariant("White", "SAK-D651/WH"),
      colorVariant("Yellow", "SAK-D651/YE"),
      colorVariant("Orange", "SAK-D651/OR"),
      colorVariant("Green", "SAK-D651/GR"),
      colorVariant("Blue", "SAK-D651/BU"),
      colorVariant("Red", "SAK-D651/RE"),
      colorVariant("Purple", "SAK-D651/PU")
    ]
  }),
  d6({
    category: "frontAxles",
    slug: "d6-front-outer-shaft",
    productName: "SAK-D612 Front outer shaft for D6",
    simplifiedName: "D6 Front Outer Shaft",
    modelNumber: "SAK-D612",
    productType: "front axle",
    handle: "sak-d612-front-outer-shaft-for-d6"
  }),
  d6({
    category: "frontAxles",
    slug: "auper-d6-aluminum-front-axle",
    productName: "SAK-D6815 Aluminum Front Axle for Auper D6",
    simplifiedName: "Auper D6 Aluminum Front Axle",
    modelNumber: "SAK-D6815",
    productType: "front axle",
    handle: "sak-d6815-aluminum-front-axle-for-auper-d6"
  }),
  ...[
    ["d6-rear-swing-shaft", "SAK-D636 Rear Swing Shaft for D6", "D6 Rear Swing Shaft", "SAK-D636", "sak-d635-brake-disc-for-d6-copy"],
    ["d6-rear-swing-shaft-50mm", "SAK-D637 Rear Swing Shaft 50mm for D6", "D6 Rear Swing Shaft 50mm", "SAK-D637", "sak-d636-rear-swing-shaft-for-d6-copy"],
    ["d6-rear-swing-outer-shaft", "SAK-D638 Rear Swing Outer shaft for D6", "D6 Rear Swing Outer Shaft", "SAK-D638", "sak-d637-rear-swing-shaft-50mm-for-d6-copy"],
    ["auper-d6-dual-joint-rear-universal-shaft", "SAK-D6821 Dual Joint Rear Universal Shaft for Auper D6", "Auper D6 Dual Joint Rear Universal Shaft", "SAK-D6821", "sak-d6820-aluminum-rear-body-post-for-auper-d6-copy"]
  ].map(([slug, productName, simplifiedName, modelNumber, handle]) => d6({
    category: "rearAxles",
    slug,
    productName,
    simplifiedName,
    modelNumber,
    productType: "rear axle shaft",
    handle
  })),
  d6({
    category: "frontWheels",
    slug: "d6-m6-spoke-y-wheel",
    productName: "SAK-D646 M6 spoke Y shape 6mm offset for D6",
    simplifiedName: "D6 M6 Spoke Y 6mm Wheel",
    modelNumber: "SAK-D646",
    productType: "standalone wheel",
    handle: "sak-d646-m6-spoke-y-shape-6mm-offset-for-d6"
  }),
  d6({
    category: "rearWheels",
    slug: "d6-m6-spoke-y-wheel",
    productName: "SAK-D646 M6 spoke Y shape 6mm offset for D6",
    simplifiedName: "D6 M6 Spoke Y 6mm Wheel",
    modelNumber: "SAK-D646",
    productType: "standalone wheel",
    handle: "sak-d646-m6-spoke-y-shape-6mm-offset-for-d6"
  }),
  d6({
    category: "tires",
    slug: "d6-polish-cement-tires",
    productName: "SAK-D647 polish Cement tires for D6",
    simplifiedName: "D6 Polish Cement Tires",
    modelNumber: "SAK-D647",
    productType: "standalone tire",
    handle: "sak-d646-m6-spoke-y-shape-6mm-offset-for-d6-copy"
  }),
  sakuraItem({
    category: "spurGears",
    slug: "48p-spur-gear",
    productName: "48 Pitch Spur Gear",
    simplifiedName: "48 Pitch Spur Gear",
    modelNumber: "3RAC-SG4865 / 3RAC-SG4866 / 3RAC-SG4867 / 3RAC-SG4868 / 3RAC-SG4869 / 3RAC-SG4870 / 3RAC-SG4871 / 3RAC-SG4872 / 3RAC-SG4873 / 3RAC-SG4874 / 3RAC-SG4875 / 3RAC-SG4876 / 3RAC-SG4877 / 3RAC-SG4878 / 3RAC-SG4879 / 3RAC-SG4880",
    productType: "spur gear",
    compatibleChassis: ["Universal", ...sakuraD5Fitment, ...sakuraD6Fitment],
    handle: "48-pitch-spur-gear",
    variants: toothVariants([65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80], "3RAC-SG48")
  }),
  sakuraItem({
    category: "spurGears",
    slug: "64p-spur-gear",
    productName: "64 Pitch Spur Gear",
    simplifiedName: "64 Pitch Spur Gear",
    modelNumber: "3RAC-SG6474 / 3RAC-SG6475 / 3RAC-SG6476 / 3RAC-SG6477 / 3RAC-SG6478 / 3RAC-SG6479 / 3RAC-SG6480",
    productType: "spur gear",
    compatibleChassis: ["Universal", ...sakuraD5Fitment, ...sakuraD6Fitment],
    handle: "64-pitch-spur-gear_version",
    variants: toothVariants([74, 75, 76, 77, 78, 79, 80], "3RAC-SG64")
  }),
  sakuraItem({
    category: "pinionGears",
    slug: "48p-pinion-gear",
    productName: "48 Pitch Pinion Gear",
    simplifiedName: "48 Pitch Pinion Gear",
    modelNumber: "3RAC-PG4815 / 3RAC-PG4816 / 3RAC-PG4817 / 3RAC-PG4818 / 3RAC-PG4819 / 3RAC-PG4820 / 3RAC-PG4821 / 3RAC-PG4822 / 3RAC-PG4823 / 3RAC-PG4824",
    productType: "pinion gear",
    compatibleChassis: ["Universal", ...sakuraD5Fitment, ...sakuraD6Fitment],
    handle: "48-pitch-pinion-gear",
    variants: toothVariants([15, 16, 17, 18, 19, 20, 21, 22, 23, 24], "3RAC-PG48")
  }),
  sakuraItem({
    category: "pinionGears",
    slug: "64p-pinion-gear",
    productName: "64 Pitch Pinion Gear",
    simplifiedName: "64 Pitch Pinion Gear",
    modelNumber: "3RAC-PG6418 / 3RAC-PG6419 / 3RAC-PG6420 / 3RAC-PG6421 / 3RAC-PG6422 / 3RAC-PG6423 / 3RAC-PG6424 / 3RAC-PG6425",
    productType: "pinion gear",
    compatibleChassis: ["Universal", ...sakuraD5Fitment, ...sakuraD6Fitment],
    handle: "6",
    variants: toothVariants([18, 19, 20, 21, 22, 23, 24, 25], "3RAC-PG64")
  })
];
