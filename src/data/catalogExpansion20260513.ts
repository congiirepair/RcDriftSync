import type { ProductCatalogItem, ProductCatalogVariant } from "./productCatalog";

type CatalogInput = Omit<ProductCatalogItem, "userAdded" | "verified" | "confidence" | "lastCheckedAt">;

const checkedAt = "2026-05-13";

function researchedItem(input: CatalogInput): ProductCatalogItem {
  return {
    ...input,
    userAdded: false,
    verified: Boolean(input.sourceUrl),
    confidence: "high",
    lastCheckedAt: checkedAt
  };
}

function tireVariants(variants: Array<[string, string, string?, string?]>): ProductCatalogVariant[] {
  return variants.map(([id, displayName, sku, size]) => ({
    id,
    displayName,
    sku,
    size,
    sourceProductName: displayName
  }));
}

function colorVariants(variants: Array<[string, string, string]>): ProductCatalogVariant[] {
  return variants.map(([id, color, sku]) => ({
    id,
    color,
    sku,
    displayName: color,
    sourceProductName: color
  }));
}

function toothVariants(teeth: number[], skuPrefix: string): ProductCatalogVariant[] {
  return teeth.map((tooth) => ({
    id: `${tooth}t`,
    displayName: `${tooth}T`,
    sku: `${skuPrefix}${String(tooth).padStart(2, "0")}`,
    size: `${tooth}T`,
    sourceProductName: `${tooth}T`
  }));
}

function servoHornVariants(variants: Array<[string, string, string, string]>): ProductCatalogVariant[] {
  return variants.map(([id, spline, color, sku]) => ({
    id,
    color,
    sku,
    displayName: `${spline} / ${color}`,
    sourceProductName: `${spline} ${color}`
  }));
}

export const catalogExpansion20260513Items: ProductCatalogItem[] = [
  researchedItem({
    id: "buzz-break-overdose-hdpe-drift-tire-series",
    category: "tires",
    brand: "Buzz Break",
    productName: "Buzz Break / Overdose HDPE Drift Tire Series",
    simplifiedName: "Buzz Break HDPE Drift Tire Series",
    displayName: "Buzz Break HDPE Drift Tire Series",
    modelNumber: "BB-RT-001 / BB-RT-002 / BB-RT-003 / BB-RT-004 / BB-RT-005 / BB-RT-006 / BB-RT-007 / BB-RT-008 / BB-RT-009",
    productType: "drift tire",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "Collapsed Buzz Break / Overdose HDPE tire family. Kept as one selector item with real tire-pattern and width variants so the tire menu stays clean.",
    tunableParameters: ["compound", "surface", "width", "notes"],
    sourceUrl: "https://buzzbreak.jp/tire/",
    sourceName: "Buzz Break / Banzai Hobby / Super-G / DriftParadiZ",
    variants: [
      {
        id: "bb-rt-001-rolling-dancer-26",
        displayName: "Drift Star Rolling Dancer 26mm",
        sku: "BB-RT-001",
        size: "26mm",
        sourceProductName: "Buzz Break Drift Star Rolling Dancer 26mm",
        sourceUrl: "https://supergdrift.com/products/buzz-break-drift-star-rolling-dancer-26mm-tires-2-pack-overdose-bb-rt-001"
      },
      {
        id: "bb-rt-002-rolling-dancer-30",
        displayName: "Drift Star Rolling Dancer 30mm",
        sku: "BB-RT-002",
        size: "30mm",
        sourceProductName: "Buzz Break Drift Star Rolling Dancer 30mm",
        sourceUrl: "https://supergdrift.com/collections/tires/products/buzz-break-drift-star-rolling-dancer-30mm-tires-2-pack-overdose-bb-rt-002"
      },
      {
        id: "bb-rt-003-valino-greeva-ebisu",
        displayName: "VALINO GREEVA Ebisu Matsuri",
        sku: "BB-RT-003",
        sourceProductName: "VALINO GREEVA Ebisu Matsuri"
      },
      {
        id: "bb-rt-004-toyo-proxes-r888r-26",
        displayName: "TOYO Proxes R888R 26mm",
        sku: "BB-RT-004",
        size: "26mm",
        sourceProductName: "TOYO Proxes R888R Drift 26mm",
        sourceUrl: "https://en.banzaihobby.com/products/po-nov-2024-overdose-bb-rt-004-toyo-tires-proxes-r888r-drift-26mm-2pcs"
      },
      {
        id: "bb-rt-005-toyo-proxes-r888r-30",
        displayName: "TOYO Proxes R888R 30mm",
        sku: "BB-RT-005",
        size: "30mm",
        sourceProductName: "TOYO Proxes R888R Drift 30mm",
        sourceUrl: "https://www.super-rc.co.jp/rc/product/view?id=106780"
      },
      {
        id: "bb-rt-006-potenza-re71rs-26",
        displayName: "Bridgestone Potenza RE-71RS 26mm",
        sku: "BB-RT-006",
        size: "26mm",
        sourceProductName: "Bridgestone Potenza RE-71RS 26mm"
      },
      {
        id: "bb-rt-007-potenza-re71rs-30",
        displayName: "Bridgestone Potenza RE-71RS 30mm",
        sku: "BB-RT-007",
        size: "30mm",
        sourceProductName: "Bridgestone Potenza RE-71RS 30mm",
        sourceUrl: "https://banzaihobby.com/products/po-aug-2025-overdose-bb-rt-007-bridgestone-potenza-re-71rs-30mm"
      },
      {
        id: "bb-rt-008-toyo-proxes-r1r-26",
        displayName: "TOYO Proxes R1R 26mm",
        sku: "BB-RT-008",
        size: "26mm",
        sourceProductName: "TOYO Proxes R1R 26mm",
        sourceUrl: "https://www.driftparadiz.fr/en/products/toyo-tires-proxes-r1r-26mm-drift-tires-buzz-break-bb-rt-008"
      },
      {
        id: "bb-rt-009-toyo-proxes-r1r-30",
        displayName: "TOYO Proxes R1R 30mm",
        sku: "BB-RT-009",
        size: "30mm",
        sourceProductName: "TOYO Proxes R1R 30mm",
        sourceUrl: "https://www.driftparadiz.fr/products/pneus-drift-toyo-tires-proxes-r1r-30mm-buzz-break-bb-rt-009"
      }
    ],
    aliases: [
      "Buzz Break Drift Star Rolling Dancer",
      "Buzz Break TOYO Proxes R888R",
      "Buzz Break Bridgestone Potenza RE-71RS",
      "Buzz Break TOYO Proxes R1R",
      "BB-RT-001",
      "BB-RT-002",
      "BB-RT-003",
      "BB-RT-004",
      "BB-RT-005",
      "BB-RT-006",
      "BB-RT-007",
      "BB-RT-008",
      "BB-RT-009"
    ]
  }),
  researchedItem({
    id: "overdose-valino-pergea-drift-tire-series",
    category: "tires",
    brand: "Overdose",
    productName: "VALINO PERGEA Drift Tire Series",
    simplifiedName: "VALINO PERGEA Drift Tire Series",
    displayName: "VALINO PERGEA Drift Tire Series",
    modelNumber: "OD2771 / OD2772 / OD2790",
    productType: "drift tire",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "Overdose VALINO PERGEA tire family collapsed by pattern/width.",
    tunableParameters: ["compound", "surface", "width", "notes"],
    sourceUrl: "https://supergdrift.com/collections/tires",
    sourceName: "Super-G R/C Drift Arena",
    variants: tireVariants([
      ["od2771-pergea-08rs-26", "VALINO PERGEA 08RS 26mm", "OD2771", "26mm"],
      ["od2772-pergea-08rs-30", "VALINO PERGEA 08RS 30mm Wide", "OD2772", "30mm"],
      ["od2790-pergea-08c-26", "VALINO PERGEA 08C 26mm", "OD2790", "26mm"]
    ])
  }),
  researchedItem({
    id: "topline-hdpe-drift-tire-series",
    category: "tires",
    brand: "Topline",
    productName: "HDPE Drift Tire Series",
    simplifiedName: "HDPE Drift Tire Series",
    displayName: "Topline HDPE Drift Tire Series",
    modelNumber: "TDT-002PE / TDT-006PE / TMT-001PE",
    productType: "drift tire",
    compatibleChassis: ["Universal 1/10 drift", "M-chassis"],
    notes: "Topline HDPE carpet/P-tile tire family collapsed into one selector item.",
    tunableParameters: ["compound", "surface", "diameter", "notes"],
    sourceUrl: "https://supergdrift.com/collections/tires",
    sourceName: "Super-G R/C Drift Arena",
    variants: tireVariants([
      ["tdt-002pe-sports-edition", "Sports Edition HDPE", "TDT-002PE"],
      ["tdt-006pe-street-edition", "Street Edition HDPE", "TDT-006PE"],
      ["tmt-001pe-mini-sports", "Mini Sports Edition HDPE", "TMT-001PE"]
    ])
  }),
  researchedItem({
    id: "mst-drift-tire-series",
    category: "tires",
    brand: "MST",
    productName: "MST Drift Tire Series",
    simplifiedName: "MST Drift Tire Series",
    displayName: "MST Drift Tire Series",
    modelNumber: "830010 / 830011 / 101039 / 101040",
    productType: "drift tire",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "MST CS/PST tire family collapsed by compound/use.",
    tunableParameters: ["compound", "surface", "front/rear", "notes"],
    sourceUrl: "https://supergdrift.com/collections/tires",
    sourceName: "Super-G R/C Drift Arena",
    variants: tireVariants([
      ["830011-pst-silver-dot", "PST Silver Dot HDPE P-tile / concrete", "830011"],
      ["830010-csr-white-dot", "CS-R Low Grip White Dot carpet", "830010"],
      ["101039-101040-csm-fr", "CS-M Drift Tires F/R", "101039 / 101040"]
    ])
  }),
  researchedItem({
    id: "dlike-tapered-soft-drift-tire",
    category: "tires",
    brand: "D-Like",
    productName: "Tapered Soft Drift Tire",
    simplifiedName: "Tapered Soft Drift Tire",
    displayName: "Tapered Soft Drift Tire",
    modelNumber: "DL199-2",
    productType: "drift tire",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "D-Like tapered soft drift tire.",
    tunableParameters: ["compound", "surface", "notes"],
    sourceUrl: "https://supergdrift.com/collections/tires",
    sourceName: "Super-G R/C Drift Arena"
  }),
  researchedItem({
    id: "rc926-pe26rs-hdpe-drift-tire",
    category: "tires",
    brand: "RC926",
    productName: "PE26RS HDPE Drift Tire",
    simplifiedName: "PE26RS HDPE Drift Tire",
    displayName: "PE26RS HDPE Drift Tire",
    modelNumber: "KN-DT11PE26",
    productType: "drift tire",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "RC926 PE26RS 26mm HDPE drift tire.",
    tunableParameters: ["compound", "surface", "diameter", "notes"],
    sourceUrl: "https://supergdrift.com/collections/tires",
    sourceName: "Super-G R/C Drift Arena"
  }),
  researchedItem({
    id: "super-g-tsg-007-polished-surface-drift-tire",
    category: "tires",
    brand: "Super-G",
    productName: "TSG-007 Polished Surface Drift Tire",
    simplifiedName: "TSG-007 Polished Surface Drift Tire",
    displayName: "TSG-007 Polished Surface Drift Tire",
    modelNumber: "TSG007",
    productType: "drift tire",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "Super-G polished concrete drift tire.",
    tunableParameters: ["compound", "surface", "diameter", "notes"],
    sourceUrl: "https://supergdrift.com/collections/tires",
    sourceName: "Super-G R/C Drift Arena"
  }),
  researchedItem({
    id: "eagle-constant-grip-camber-sidewall-drift-tire",
    category: "tires",
    brand: "Eagle Racing",
    productName: "Constant Grip Camber Sidewall Drift Tire",
    simplifiedName: "Constant Grip Camber Sidewall Drift Tire",
    displayName: "Constant Grip Camber Sidewall Drift Tire",
    modelNumber: "3946U-S4",
    productType: "drift tire",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "Eagle Racing curved/camber sidewall drift tire.",
    tunableParameters: ["compound", "camber sidewall", "surface", "notes"],
    sourceUrl: "https://supergdrift.com/collections/tires",
    sourceName: "Super-G R/C Drift Arena"
  }),
  researchedItem({
    id: "gens-ace-redline-2s-shorty-lihv-6000-140c",
    category: "batteries",
    brand: "Gens Ace",
    productName: "Redline 2.0 2S Shorty LiHV Battery 6000mAh 140C",
    simplifiedName: "Redline 2.0 2S Shorty 6000mAh 140C",
    displayName: "Redline 2.0 2S Shorty 6000mAh 140C",
    modelNumber: "GEA60002S14D5",
    productType: "2S shorty LiHV battery",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "Shorty LiHV pack with 5mm bullets; useful for recording common 2S shorty drift battery setups.",
    tunableParameters: ["cell count", "capacity", "C rating", "shape", "weight", "mounting notes"],
    sourceUrl: "https://www.rcteam.com/en/products/gens-ace-redline-2-0-hv-lipo-battery-shorty-7-6v-6000mah-140c-2s1p",
    sourceName: "RC Team"
  }),
  researchedItem({
    id: "reve-d-rb-50rs-2s-shorty-lipo-5000",
    category: "batteries",
    brand: "Reve D",
    productName: "RB-50RS 2S Shorty LiPo Battery 5000mAh",
    simplifiedName: "RB-50RS 2S Shorty 5000mAh",
    displayName: "RB-50RS 2S Shorty 5000mAh",
    modelNumber: "RB-50RS",
    productType: "2S shorty LiPo battery",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "Reve D 5000mAh 2S shorty LiPo drift battery.",
    tunableParameters: ["cell count", "capacity", "C rating", "shape", "weight", "mounting notes"],
    sourceUrl: "https://www.rc-drift-shop.com/Reve-D-Shorty-5000mAh-74V-2S-200C/100C-LiPo-4mm-216g/en",
    sourceName: "RC-Drift-Shop"
  }),
  researchedItem({
    id: "reve-d-rb-37sb-2s-shorty-lipo-3700",
    category: "batteries",
    brand: "Reve D",
    productName: "RB-37SB 2S Shorty LiPo Battery 3700mAh",
    simplifiedName: "RB-37SB 2S Shorty 3700mAh",
    displayName: "RB-37SB 2S Shorty 3700mAh",
    modelNumber: "RB-37SB",
    productType: "2S shorty LiPo battery",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "Low-height Reve D 3700mAh 2S shorty LiPo battery option.",
    tunableParameters: ["cell count", "capacity", "C rating", "shape", "weight", "mounting notes"],
    sourceUrl: "https://www.rcpro.it/en/team-reved/1504-reve-d-shorty-3700mah-74v-2s-200c100c-lipo-4mm-156g-4582586514905.html",
    sourceName: "RC Pro"
  }),
  researchedItem({
    id: "reedy-zappers-sg5-2s-shorty-battery-series",
    category: "batteries",
    brand: "Reedy",
    productName: "Zappers SG5 2S Shorty Battery Series",
    simplifiedName: "Zappers SG5 2S Shorty Battery Series",
    displayName: "Zappers SG5 2S Shorty Battery Series",
    modelNumber: "27383 / 27397 / 27385",
    productType: "2S shorty LiHV battery",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "Official Reedy Zappers SG5 7.6V shorty packs. Grouped as shorty variants so drivers can record capacity, height, weight, and plug style without cluttering the selector.",
    tunableParameters: ["cell count", "capacity", "C rating", "shape", "weight", "plug", "mounting notes"],
    sourceUrl: "https://www.associatedelectrics.com/news/latest_products/2564-new-reedy-zappers-sg5-competition-hv-lipo-batteries/",
    sourceName: "Associated Electrics / Reedy official product news",
    variants: [
      { id: "4800mah-130c-27383", sku: "27383", size: "4800mAh", displayName: "4800mAh 130C Shorty", sourceProductName: "Zappers SG5 4800mAh 130C 7.6V Shorty" },
      { id: "4000mah-130c-lp-27397", sku: "27397", size: "4000mAh", displayName: "4000mAh 130C LP Shorty", sourceProductName: "Zappers SG5 4000mAh 130C 7.6V LP Shorty" },
      { id: "3600mah-130c-lp-27385", sku: "27385", size: "3600mAh", displayName: "3600mAh 130C LP Shorty", sourceProductName: "Zappers SG5 3600mAh 130C 7.6V LP Shorty" }
    ],
    aliases: ["Reedy Zappers SG5", "Reedy SG5 4800", "Reedy SG5 4000", "Reedy SG5 3600", "27383", "27397", "27385"]
  }),
  researchedItem({
    id: "maclan-graphene-v4-hv-2s-lcg-shorty-4800",
    category: "batteries",
    brand: "Maclan",
    productName: "Graphene V4 HV 2S LCG Shorty 4800mAh",
    simplifiedName: "Graphene V4 HV 2S LCG Shorty 4800mAh",
    displayName: "Graphene V4 HV 2S LCG Shorty 4800mAh",
    modelNumber: "MCL6031",
    productType: "2S shorty LiHV battery",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "Maclan official 7.6V 2S LCG shorty pack. Useful for drivers documenting low-CG battery placement and weight bias.",
    tunableParameters: ["cell count", "capacity", "C rating", "shape", "weight", "mounting notes"],
    sourceUrl: "https://maclanracingshop.com/maclan-racing-graphene-v4-hv-2s-lcg-shorty-4800-mah/",
    sourceName: "Maclan Racing Pro Shop",
    aliases: ["MCL6031", "Maclan 4800 LCG Shorty", "Maclan Graphene V4 HV Shorty"]
  }),
  researchedItem({
    id: "rhino-racing-rr-1405-sr-front-steering-knuckles",
    category: "frontKnuckles",
    brand: "Rhino Racing",
    productName: "SR Series Front Steering Aluminum Knuckle",
    simplifiedName: "SR Front Steering Knuckle",
    displayName: "SR Series Front Steering Knuckle",
    modelNumber: "RR-1405BL / RR-1405R / RR-1405P / RR-1405B",
    productType: "front steering knuckle",
    compatibleChassis: ["Rhino Racing Shark", "SHARK DDSS", "Yokomo YD-2", "MST RMX", "Reve D RDX", "Yokomo RD", "Yokomo SD"],
    notes: "SR Series RWD knuckle with adjustable trail/torque. Collapsed color variants into one selector item.",
    tunableParameters: ["trail", "ackerman", "steering stop", "upper arm hole", "lower arm hole", "notes"],
    sourceUrl: "https://supergdrift.com/products/sr-series-front-steering-aluminum-knuckle-set-blue-red-purple-black-rhino-racing-rr-1405",
    sourceName: "Super-G R/C Drift Arena",
    variants: colorVariants([
      ["blue-rr-1405bl", "Blue", "RR-1405BL"],
      ["red-rr-1405r", "Red", "RR-1405R"],
      ["purple-rr-1405p", "Purple", "RR-1405P"],
      ["black-rr-1405b", "Black", "RR-1405B"]
    ])
  }),
  researchedItem({
    id: "rhino-racing-rr-1505-sr-rear-hub-carriers",
    category: "rearHubCarriers",
    brand: "Rhino Racing",
    productName: "SR Series Aluminum Rear Hub Carrier",
    simplifiedName: "SR Rear Hub Carrier",
    displayName: "SR Series Rear Hub Carrier",
    modelNumber: "RR-1505BL / RR-1505R / RR-1505P / RR-1505B",
    productType: "rear hub carrier",
    compatibleChassis: ["Rhino Racing Shark", "SHARK DDSS", "Yokomo YD-2", "MST RMX", "Reve D RDX", "Yokomo RD", "Yokomo SD"],
    notes: "SR rear upright/hub carrier intended to promote active camber. Collapsed color variants into one selector item.",
    tunableParameters: ["upper arm hole", "active camber", "roll center", "spacer position", "notes"],
    sourceUrl: "https://www.elitedriftshop.com/en/shop/rhino-racing-sr-aluminum-rear-hub-carriers-black-rr-1505b/",
    sourceName: "Elite Drift Shop",
    variants: colorVariants([
      ["blue-rr-1505bl", "Blue", "RR-1505BL"],
      ["red-rr-1505r", "Red", "RR-1505R"],
      ["purple-rr-1505p", "Purple", "RR-1505P"],
      ["black-rr-1505b", "Black", "RR-1505B"]
    ])
  }),
  researchedItem({
    id: "rhino-racing-rr-841-shark-front-shock-tower",
    category: "frontShockTowers",
    brand: "Rhino Racing",
    productName: "SHARK Carbon Lightweight Front Shock Tower",
    simplifiedName: "SHARK Carbon Front Shock Tower",
    displayName: "SHARK Carbon Front Shock Tower",
    modelNumber: "RR-841",
    productType: "front shock tower",
    compatibleChassis: ["Rhino Racing Shark", "SHARK DDSS"],
    notes: "Carbon front shock tower for DDSS / SHARK non-IFS front ends. Super-G notes three mounting heights.",
    tunableParameters: ["upper shock hole", "tower height", "front shock spacing", "notes"],
    sourceUrl: "https://supergdrift.com/products/shark-carbon-lightweight-front-shock-tower-for-ddss-shark-non-ifs-rhino-racing-rr-841",
    sourceName: "Super-G R/C Drift Arena"
  }),
  researchedItem({
    id: "rhino-racing-rr-845-shark-narrow-rear-shock-tower",
    category: "rearShockTowers",
    brand: "Rhino Racing",
    productName: "SHARK Carbon Lightweight Narrow Rear Shock Tower",
    simplifiedName: "SHARK Carbon Narrow Rear Shock Tower",
    displayName: "SHARK Carbon Narrow Rear Shock Tower",
    modelNumber: "RR-845",
    productType: "rear shock tower",
    compatibleChassis: ["Rhino Racing Shark", "SHARK DDSS"],
    notes: "Carbon narrow rear shock tower for SHARK transmission. Lighter replacement for the aluminum narrow rear tower.",
    tunableParameters: ["upper shock hole", "tower width", "body clearance", "rear shock spacing", "notes"],
    sourceUrl: "https://supergdrift.com/products/carbon-lightweight-narrow-shock-tower-for-shark-transmission-rhino-racing-rr-845",
    sourceName: "Super-G R/C Drift Arena"
  }),
  researchedItem({
    id: "rhino-racing-rr-1000-hydra-ifs-kit",
    category: "suspensionKits",
    brand: "Rhino Racing",
    productName: "HYDRA IFS Inboard Front Suspension Kit",
    simplifiedName: "HYDRA IFS Kit",
    displayName: "HYDRA IFS Kit",
    modelNumber: "RR-1000R / RR-1000P / RR-1000B",
    productType: "inboard front suspension kit",
    compatibleChassis: ["Rhino Racing Shark", "SHARK DDSS"],
    notes: "Inboard front suspension kit for DDSS / SHARK. Listed as a suspension kit rather than a front shock tower because Rhino notes it eliminates the need for a front shock tower.",
    tunableParameters: ["rocker position", "shock mount position", "ride height", "body clearance", "notes"],
    sourceUrl: "https://rhino-racing.com.cn/product/black-hydra-ifs-inboard-front-suspension-kit-for-ddss-shark-rr-1000b/",
    sourceName: "Rhino Racing",
    variants: colorVariants([
      ["red-rr-1000r", "Red", "RR-1000R"],
      ["purple-rr-1000p", "Purple", "RR-1000P"],
      ["black-rr-1000b", "Black", "RR-1000B"]
    ])
  }),
  researchedItem({
    id: "rhino-racing-rr-202-shark-49mm-cvd",
    category: "rearAxles",
    brand: "Rhino Racing",
    productName: "SHARK Stainless CVD Universal Axle 49mm",
    simplifiedName: "SHARK Stainless CVD 49mm",
    displayName: "SHARK Stainless CVD 49mm",
    modelNumber: "RR-202",
    productType: "axle shaft",
    compatibleChassis: ["Rhino Racing Shark", "Yokomo YD-2", "Yokomo RD", "Yokomo SD", "Yokomo MD"],
    notes: "49mm stainless universal CVD set for C-LSD powered SHARK/Yokomo-style gearboxes.",
    tunableParameters: ["shaft length", "drive cup", "pin", "rear track width", "notes"],
    sourceUrl: "https://supergdrift.com/products/shark-stainless-cvd-universal-axle-set-49mm-yd2-y2-010-compatible-rhino-racing-rr-202",
    sourceName: "Super-G R/C Drift Arena"
  }),
  researchedItem({
    id: "rhino-racing-rr-601-rr-611-clsd-52t-ring-spur",
    category: "spurGears",
    brand: "Rhino Racing",
    productName: "C-LSD 52T Ring Spur Gear",
    simplifiedName: "C-LSD 52T Ring Spur",
    displayName: "C-LSD 52T Ring Spur",
    modelNumber: "RR-601 / RR-611",
    productType: "spur gear",
    compatibleChassis: ["Rhino Racing C-LSD", "Rhino Racing Shark"],
    notes: "52T ring spur options for Rhino Racing C-LSD. Aluminum and lightweight plastic versions collapsed as variants.",
    tunableParameters: ["tooth count", "material", "drive feel", "notes"],
    sourceUrl: "https://www.asborc.com/products/rhino-racing-52t-aluminum-main-gear-ring-spur-for-c-lsd-rr-601",
    sourceName: "asbo-rc",
    variants: [
      { id: "aluminum-rr-601", displayName: "Aluminum 52T", sku: "RR-601", sourceProductName: "52T Aluminum Main Gear" },
      { id: "lightweight-plastic-rr-611", displayName: "Lightweight Plastic 52T", sku: "RR-611", sourceProductName: "52T Lightweight Plastic Main Gear", sourceUrl: "https://www.asborc.com/products/rhino-racing-52t-light-weight-plastic-main-gear-ring-spur-for-c-lsd-rr-611" }
    ]
  }),
  researchedItem({
    id: "rhino-racing-rr-625-clsd-belt-pulley",
    category: "drivetrainAccessories",
    brand: "Rhino Racing",
    productName: "C-LSD Belt Pulley",
    simplifiedName: "C-LSD Belt Pulley",
    displayName: "C-LSD Belt Pulley",
    modelNumber: "RR-625",
    productType: "drivetrain accessory",
    compatibleChassis: ["Rhino Racing C-LSD", "Overdose GALM", "3Racing Sakura D5"],
    notes: "Belt pulley for using the Rhino Racing C-LSD in compatible belt-drive cars. Kept out of spur/pinion selectors.",
    tunableParameters: ["belt drive conversion", "pulley setup", "drivetrain feel", "notes"],
    sourceUrl: "https://rhino-racing.com.cn/product/belt-pulley-for-c-lsd-rr-625/",
    sourceName: "Rhino Racing"
  }),
  researchedItem({
    id: "rhino-racing-rr-610-lightweight-clsd",
    category: "differentials",
    brand: "Rhino Racing",
    productName: "Lightweight C-LSD Active Differential",
    simplifiedName: "Lightweight C-LSD",
    displayName: "Lightweight C-LSD",
    modelNumber: "RR-610",
    productType: "differential / axle assembly",
    compatibleChassis: ["Rhino Racing Shark", "Yokomo YD-2", "Yokomo RD", "Yokomo SD", "Yokomo MD", "Reve D RDX"],
    notes: "Lightweight plastic-housing C-LSD active differential. Kept separate from the RR-600 aluminum C-LSD because the material changes rotating mass and throttle response.",
    tunableParameters: ["pinion count", "spring", "diff oil", "lockup feel", "drive cups", "notes"],
    sourceUrl: "https://supergdrift.com/products/yd2-lightweight-c-lsd-centrifugal-clsd-differential-assembly-unit-rhino-racing-rr-610",
    sourceName: "Super-G R/C Drift Arena"
  }),
  researchedItem({
    id: "overdose-od3937-od3938-od3939-galm-slide-rack-type-3",
    category: "slideRacks",
    brand: "Overdose",
    productName: "GALM Aluminum Curved Slide Rack Type-3",
    simplifiedName: "GALM Curved Slide Rack Type-3",
    displayName: "GALM Curved Slide Rack Type-3",
    modelNumber: "OD3937 / OD3938 / OD3939",
    productType: "slide rack",
    compatibleChassis: ["Overdose GALM", "Overdose GALM V2"],
    notes: "Type-3 curved slide rack with forward rack adjustment in 1mm increments up to 4mm. Collapsed colors as variants.",
    tunableParameters: ["rack forward position", "ackerman", "steering angle", "ball end", "notes"],
    sourceUrl: "https://supergdrift.com/products/aluminum-curved-slide-rack-type-3-for-galm-overdose-od3937-od3938-od3939",
    sourceName: "Super-G R/C Drift Arena",
    variants: colorVariants([
      ["purple-od3937", "Purple", "OD3937"],
      ["red-od3938", "Red", "OD3938"],
      ["black-od3939", "Black", "OD3939"]
    ])
  }),
  researchedItem({
    id: "reve-d-d1-202-rdx-bell-crank-series",
    category: "bellcranks",
    brand: "Reve D",
    productName: "RDX Bell Crank Series",
    simplifiedName: "RDX Bell Crank Series",
    displayName: "RDX Bell Crank Series",
    modelNumber: "D1-202M / D1-202G / D1-202A",
    productType: "bell crank",
    compatibleChassis: ["Reve D RDX"],
    notes: "RDX steering bell crank family collapsed by material. The official RDX parts list references molded, graphite-reinforced, and aluminum bell crank options.",
    tunableParameters: ["inner hole", "outer hole", "ackerman effect", "spacer position", "material", "notes"],
    sourceUrl: "https://teamreved.com/product/rkd-rdx",
    sourceName: "Reve D",
    variants: [
      { id: "molded-d1-202m", displayName: "Molded", sku: "D1-202M", sourceProductName: "RDX Molded Bell Crank" },
      { id: "graphite-d1-202g", displayName: "Graphite", sku: "D1-202G", sourceProductName: "RDX Graphite Bell Crank" },
      { id: "aluminum-d1-202a", displayName: "Aluminum", sku: "D1-202A", sourceProductName: "RDX Aluminum Bell Crank" }
    ],
    aliases: ["RDX Graphite Resin Bell Crank", "RDX Aluminum Bell Crank Set", "RDX Molded Bell Crank"]
  }),
  researchedItem({
    id: "yokomo-y2-202v-adjustable-steering-bell-crank",
    category: "bellcranks",
    brand: "Yokomo",
    productName: "YD-2 Adjustable Steering Bell Crank Set",
    simplifiedName: "YD-2 Adjustable Steering Bell Crank",
    displayName: "YD-2 Adjustable Steering Bell Crank",
    modelNumber: "Y2-202V / Y2-202VA",
    productType: "bell crank",
    compatibleChassis: ["Yokomo YD-2", "Yokomo RD", "Yokomo SD"],
    notes: "Adjustable Yokomo YD-2/RD/SD steering bell crank family. Kept as one selector entry with standard and aluminum variants for cleaner browsing.",
    tunableParameters: ["inner hole", "outer hole", "ackerman effect", "servo link position", "spacer position", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-202VA/",
    sourceName: "Yokomo",
    variants: [
      { id: "standard-y2-202v", displayName: "Adjustable", sku: "Y2-202V", sourceProductName: "Adjustable Steering Bell Crank" },
      { id: "aluminum-y2-202va", displayName: "Aluminum Adjustable", sku: "Y2-202VA", sourceProductName: "Aluminum Adjustable Steering Bell Crank" }
    ],
    aliases: ["Y2-202VA Aluminum Adjustable Steering Bell Crank", "Y2-202V Adjustable Steering Bell Crank"]
  }),
  researchedItem({
    id: "yokomo-y2-202slp-slide-rack-steering-system",
    category: "slideRacks",
    brand: "Yokomo",
    productName: "YD-2 Slide Rack Steering System",
    simplifiedName: "YD-2 Slide Rack Steering System",
    displayName: "YD-2 Slide Rack Steering System",
    modelNumber: "Y2-202SL / Y2-202SLP",
    productType: "slide rack",
    compatibleChassis: ["Yokomo YD-2", "Yokomo RD", "Yokomo SD"],
    notes: "Yokomo slide rack steering system family for drivers using rack steering instead of bellcranks.",
    tunableParameters: ["rack position", "ackerman", "steering link position", "spacer position", "notes"],
    sourceUrl: "https://teamyokomo.com/parts/Y2-202SLP/",
    sourceName: "Yokomo",
    variants: [
      { id: "standard-y2-202sl", displayName: "Standard", sku: "Y2-202SL", sourceProductName: "Slide Rack Steering System" },
      { id: "plastic-y2-202slp", displayName: "Plastic Parts", sku: "Y2-202SLP", sourceProductName: "Slide Rack Steering System Plastic Parts" }
    ],
    aliases: ["Y2-202SL Slide Rack", "Y2-202SLP Slide Rack Plastic Parts"]
  }),
  researchedItem({
    id: "mst-210589-rmx-aluminum-steering-wiper-set",
    category: "bellcranks",
    brand: "MST",
    productName: "RMX Aluminum Steering Wiper Set",
    simplifiedName: "RMX Aluminum Steering Wiper Set",
    displayName: "RMX Aluminum Steering Wiper Set",
    modelNumber: "210589BK / 210589R",
    productType: "bell crank / steering wiper",
    compatibleChassis: ["MST RMX 2.0", "MST RMX 2.5", "MST RRX 2.0", "MST FMX 2.0", "MST RMX EX", "MST MRX"],
    notes: "MST aluminum steering arm/wiper set for RMX-family steering geometry. The separate 210588 wiper mount is treated as support hardware and intentionally excluded from this main selector.",
    tunableParameters: ["inner hole", "outer hole", "ackerman effect", "spacer position", "material", "notes"],
    sourceUrl: "https://supergdrift.com/products/rmx-2-0-aluminum-steering-arms-wiper-set-red-mst-210589r",
    sourceName: "Super-G R/C Drift Arena",
    variants: [
      {
        id: "black-210589bk",
        color: "Black",
        sku: "210589BK",
        displayName: "Black",
        sourceProductName: "RMX 2.0 Aluminum Steering Arms Wiper Set Black"
      },
      {
        id: "red-210589r",
        color: "Red",
        sku: "210589R",
        displayName: "Red",
        sourceProductName: "RMX 2.0 Aluminum Steering Arms Wiper Set Red"
      }
    ],
    aliases: ["RMX 2.0 Aluminum Steering Arms Wiper Set", "RMX 2.5 Aluminium Steering Arm Wiper Set", "MST 210589"]
  }),
  researchedItem({
    id: "overdose-od3835-od3837-galm-rear-mount-kit-type-2",
    category: "motorMounts",
    brand: "Overdose",
    productName: "GALM Rear Mount Kit Type-2",
    simplifiedName: "GALM Rear Mount Kit Type-2",
    displayName: "GALM Rear Mount Kit Type-2",
    modelNumber: "OD3835 / OD3836 / OD3837",
    productType: "rear motor mount / rear bulkhead kit",
    compatibleChassis: ["Overdose GALM", "Overdose GALM V2"],
    notes: "Rear mount kit Type-2 moves the rear shock tower and motor forward about 5mm, reduces rear overhang, and supports gear-drive or belt-drive setups. Added as a motor/rear mount selector item, not a deck item.",
    tunableParameters: ["motor position", "rear shock tower position", "gear drive", "belt drive", "weight bias", "rear traction", "notes"],
    sourceUrl: "https://banzaihobby.com/products/overdose-od3835-rear-mount-kit-type-2-for-galm-galm-ver-2-purple",
    sourceName: "Banzai Hobby",
    variants: colorVariants([
      ["purple-od3835", "Purple", "OD3835"],
      ["red-od3836", "Red", "OD3836"],
      ["black-od3837", "Black", "OD3837"]
    ]),
    aliases: ["OD3836 Rear Mount Kit Type-2", "Overdose Rear Mount Kit Type-2 for GALM", "Rear Mount Kit Type-2 for GALM / GALM ver.2"]
  }),
  researchedItem({
    id: "team-ad-ad-9018-adxf-ifs-kit",
    category: "suspensionKits",
    brand: "Team AD",
    productName: "AD-XF IFS Horizontal Shock Conversion Kit",
    simplifiedName: "AD-XF IFS Kit",
    displayName: "AD-XF IFS Kit",
    modelNumber: "AD-9018",
    productType: "inboard front suspension kit",
    compatibleChassis: ["Team AD AD-XF", "Reve D RDX", "Yokomo YD-2", "Yokomo RD1", "Yokomo RD2"],
    notes: "Optional inboard front suspension / cantilever shock conversion for AD-XF front bulkhead builds. Super-G notes left/right swivel can be locked or moving with 0-4mm chassis adjustment and requires the AD-XF bulkhead.",
    tunableParameters: ["rocker position", "shock mount position", "ride height", "front shock spacing", "notes"],
    sourceUrl: "https://supergdrift.com/products/ad-xf-ifs-horizontal-shock-conversion-kit-black-red-purple-team-ad-ad-xf-ad-9018",
    sourceName: "Super-G R/C Drift Arena",
    variants: colorVariants([
      ["black-ad-9018b", "Black", "AD-9018B"],
      ["red-ad-9018r", "Red", "AD-9018R"],
      ["purple-ad-9018p", "Purple", "AD-9018P"]
    ])
  }),
  researchedItem({
    id: "team-ad-ad-9019-adxf-front-bulkhead-conversion",
    category: "suspensionKits",
    brand: "Team AD",
    productName: "AD-XF Front Bulkhead Conversion",
    simplifiedName: "AD-XF Front Bulkhead Conversion",
    displayName: "AD-XF Front Bulkhead Conversion",
    modelNumber: "AD-9019B / AD-9019R / AD-9019P",
    productType: "front bulkhead / front suspension conversion",
    compatibleChassis: ["Team AD AD-XF", "Reve D RDX", "Yokomo YD-2", "Yokomo RD1", "Yokomo RD2"],
    notes: "Adjustable front bulkhead with quick caster adjustment and L-arm support for direct-drive steering when using mid/rear servo layouts. Includes a front graphite shock tower. AD-9017 is needed for RDX, RD2.0, and ZX/RX fitments per retailer notes.",
    tunableParameters: ["caster", "front bulkhead position", "direct-drive steering support", "front shock tower", "IFS compatibility", "notes"],
    sourceUrl: "https://supergdrift.com/products/ad-xf-front-gearbox-bulk-head-for-ad-x-series-rdx-yd2-rd1-rd2-black-red-purple-team-ad-ad-xf",
    sourceName: "Super-G R/C Drift Arena",
    variants: colorVariants([
      ["black-ad-9019b", "Black", "AD-9019B"],
      ["red-ad-9019r", "Red", "AD-9019R"],
      ["purple-ad-9019p", "Purple", "AD-9019P"]
    ]),
    aliases: ["ADXF Front Gearbox", "AD-XF Front Gearbox Bulk Head", "AD-XF Front Bulk Head", "Team AD Front Bulkhead Conversion"]
  }),
  researchedItem({
    id: "team-ad-ad-9011-rear-hub-carriers",
    category: "rearHubCarriers",
    brand: "Team AD",
    productName: "AD-9011 Aluminum Rear Hub Carriers",
    simplifiedName: "AD-9011 Rear Hub Carriers",
    displayName: "AD-9011 Rear Hub Carriers",
    modelNumber: "AD-9011B / AD-9011R / AD-9011P",
    productType: "rear hub carrier",
    compatibleChassis: ["Team AD", "Yokomo RD2.0", "Yokomo YD-2", "Reve D RDX"],
    notes: "Team AD aluminum rear upright/hub carrier with dual mode transformation for adjustable toe or standard rear hub carrier use. Color variants are grouped.",
    tunableParameters: ["upper arm hole", "adjustable toe mode", "roll center", "spacer position", "notes"],
    sourceUrl: "https://www.elitedriftshop.com/en/shop/team-ad-aluminum-rear-hub-carriers-black-ad-9011b/",
    sourceName: "Elite Drift Shop / Super-G",
    variants: colorVariants([
      ["black-ad-9011b", "Black", "AD-9011B"],
      ["red-ad-9011r", "Red", "AD-9011R"],
      ["purple-ad-9011p", "Purple", "AD-9011P"]
    ]),
    aliases: ["Team AD Aluminum Rear Hub Carriers", "Rear Hub Carriers RD2.0 Uprights Team AD", "AD-9011"]
  }),
  researchedItem({
    id: "team-ad-ad-9012-steering-blocks",
    category: "frontKnuckles",
    brand: "Team AD",
    productName: "AD-9012 Steering Blocks / RWD Knuckles",
    simplifiedName: "AD-9012 Steering Blocks",
    displayName: "AD-9012 Steering Blocks",
    modelNumber: "AD-9012B / AD-9012R / AD-9012P",
    productType: "front steering knuckle",
    compatibleChassis: ["Universal 1/10 drift", "Team AD", "Yokomo RD2.0", "Yokomo YD-2", "Reve D RDX"],
    notes: "Team AD steering block / RWD knuckle includes adjustable front axle hub. Accessory shim kit is intentionally excluded from the primary knuckle selector.",
    tunableParameters: ["upper arm hole", "lower arm hole", "front axle hub", "trail", "spacer position", "notes"],
    sourceUrl: "https://supergdrift.com/collections/chassis-parts-everything-needed/products/steering-blocks-rwd-knuckles-for-1-10-rc-drift-car-red-purple-black-team-ad-ad-9012",
    sourceName: "Super-G R/C Drift Arena",
    variants: colorVariants([
      ["black-ad-9012b", "Black", "AD-9012B"],
      ["red-ad-9012r", "Red", "AD-9012R"],
      ["purple-ad-9012p", "Purple", "AD-9012P"]
    ]),
    aliases: ["Team AD Steering Blocks", "Team AD RWD Knuckles", "AD-9012"]
  }),
  researchedItem({
    id: "team-ad-ad-90141-upper-deck-set",
    category: "upperDecks",
    brand: "Team AD",
    productName: "AD-90141 Upper Deck Set RDX YD2 RD SD",
    simplifiedName: "AD-90141 Upper Deck Set",
    displayName: "AD-90141 Upper Deck Set",
    modelNumber: "AD-90141B / AD-90141R / AD-90141P",
    productType: "upper deck",
    compatibleChassis: ["Reve D RDX", "Yokomo YD-2", "Yokomo RD", "Yokomo SD"],
    notes: "Team AD upper deck set for RDX, YD2, RD, and SD platforms. Color variants are grouped to keep the upper deck selector compact.",
    tunableParameters: ["upper deck material", "flex", "brace position", "battery clearance", "notes"],
    sourceUrl: "https://supergdrift.com/collections/chassis-parts-everything-needed?page=7",
    sourceName: "Super-G R/C Drift Arena",
    variants: colorVariants([
      ["black-ad-90141b", "Black", "AD-90141B"],
      ["red-ad-90141r", "Red", "AD-90141R"],
      ["purple-ad-90141p", "Purple", "AD-90141P"]
    ]),
    aliases: ["Upper Deck Set RDX YD2 RD SD", "Team AD Upper Deck Set", "AD-90141"]
  }),
  researchedItem({
    id: "team-ad-ad-9021-md1-front-direct-steering-kit",
    category: "steeringRacks",
    brand: "Team AD",
    productName: "MD 1.0 Carbon Fiber Front Direct Steering Upgrade Kit",
    simplifiedName: "MD 1.0 Front Direct Steering Kit",
    displayName: "MD 1.0 Front Direct Steering Kit",
    modelNumber: "AD-9021",
    productType: "steering rack",
    compatibleChassis: ["Yokomo MD1.0", "Team AD"],
    notes: "Direct-steering upgrade kit for Yokomo MD1.0 style front end.",
    tunableParameters: ["steering link position", "ackerman", "servo height", "spacer position", "notes"],
    sourceUrl: "https://supergdrift.com/products/md-1-0-carbon-fiber-front-direct-steering-upgrade-kit-ad-team-ad-9021",
    sourceName: "Super-G R/C Drift Arena"
  }),
  researchedItem({
    id: "scale-reflex-863500-adjustable-rear-esc-mount",
    category: "escMounts",
    brand: "Scale Reflex",
    productName: "Adjustable Rear ESC Mount Kit",
    simplifiedName: "Adjustable Rear ESC Mount",
    displayName: "Adjustable Rear ESC Mount",
    modelNumber: "863500 / 863501 / 863502 / 863503",
    productType: "ESC mount",
    compatibleChassis: ["Yokomo YD-2", "MST RMX", "Overdose GALM", "Yokomo SD", "Yokomo RD"],
    notes: "Rear ESC mount with four fore/aft mounting holes for weight-bias tuning. Collapsed color variants into one selector item.",
    tunableParameters: ["ESC position", "weight bias", "mount height", "spacer position", "notes"],
    sourceUrl: "https://scalereflex.com/product/yd2-rmx-galm-adjustable-rear-esc-kit-scale-reflex-863500/",
    sourceName: "Scale Reflex",
    variants: colorVariants([
      ["black-863500", "Black", "863500"],
      ["blue-863501", "Blue", "863501"],
      ["purple-863502", "Purple", "863502"],
      ["red-863503", "Red", "863503"]
    ])
  }),
  researchedItem({
    id: "scale-reflex-900100-900110-hydra-lower-deck",
    category: "lowerDecks",
    brand: "Scale Reflex",
    productName: "HYDRA Lightweight Carbon Lower Deck for SHARK",
    simplifiedName: "HYDRA SHARK Lower Deck",
    displayName: "HYDRA SHARK Lower Deck",
    modelNumber: "900100 / 900110",
    productType: "lower deck / main chassis plate",
    compatibleChassis: ["Rhino Racing Shark", "SHARK DDSS"],
    notes: "Third-party lower deck for Rhino Racing SHARK that offers standard and flex lower deck options. Upper deck is sold separately.",
    tunableParameters: ["deck flex", "deck material", "wheelbase", "battery position", "notes"],
    sourceUrl: "https://scalereflex.com/product/hydra-standard-chassis-deck-kit-for-rhino-racing-shark-900100/",
    sourceName: "Scale Reflex",
    variants: [
      { id: "standard-900100", displayName: "Standard", sku: "900100", sourceProductName: "Standard Lower Deck" },
      { id: "flex-900110", displayName: "Flex", sku: "900110", sourceProductName: "Flex Lower Deck" }
    ]
  }),
  researchedItem({
    id: "scale-reflex-900116-900119-hydra-upper-deck",
    category: "upperDecks",
    brand: "Scale Reflex",
    productName: "HYDRA Lightweight Carbon Upper Deck for SHARK",
    simplifiedName: "HYDRA SHARK Upper Deck",
    displayName: "HYDRA SHARK Upper Deck",
    modelNumber: "900116 / 900117 / 900118 / 900119",
    productType: "upper deck",
    compatibleChassis: ["Rhino Racing Shark", "SHARK DDSS"],
    notes: "Third-party upper deck for Rhino Racing SHARK. Thickness options tune flex and side bite.",
    tunableParameters: ["upper deck thickness", "deck flex", "side bite", "notes"],
    sourceUrl: "https://scalereflex.com/product/hydra-upper-chassis-deck-kit-for-rhino-racing-shark-1-5mm-2-0mm-2-5mm-3-0mm-900116-900117-900118-900119/",
    sourceName: "Scale Reflex",
    variants: [
      { id: "3-0mm-900116", displayName: "3.0mm", sku: "900116", size: "3.0mm", sourceProductName: "Hydra Upper Deck 3.0mm" },
      { id: "2-5mm-900117", displayName: "2.5mm", sku: "900117", size: "2.5mm", sourceProductName: "Hydra Upper Deck 2.5mm" },
      { id: "2-0mm-900118", displayName: "2.0mm", sku: "900118", size: "2.0mm", sourceProductName: "Hydra Upper Deck 2.0mm" },
      { id: "1-5mm-900119", displayName: "1.5mm", sku: "900119", size: "1.5mm", sourceProductName: "Hydra Upper Deck 1.5mm" }
    ]
  }),
  researchedItem({
    id: "scale-reflex-842014-842032-48p-pinion-gear",
    category: "pinionGears",
    brand: "Scale Reflex",
    productName: "Reflex 48P Hard Anodized Pinion Gear",
    simplifiedName: "Reflex 48P Pinion Gear",
    displayName: "Reflex 48P Pinion Gear",
    modelNumber: "842014-842032",
    productType: "pinion gear",
    compatibleChassis: ["Universal 1/10 drift", "Yokomo YD-2", "MST RMX", "Usukani PDS", "Usukani NGE", "Overdose GALM", "Overdose Vacula", "3Racing Sakura D4", "3Racing Sakura D5"],
    notes: "48 pitch hard anodized aluminum pinion gear family. Collapsed 14T-32T into variants.",
    tunableParameters: ["tooth count", "pitch", "FDR", "motor temperature", "notes"],
    sourceUrl: "https://supergdrift.com/products/reflex-pinion-gear-with-set-screw-hard-anodized-aluminum-48p-15t-16t-17t-18t-19t-20t-21t-22t-23t-24t-25t-26t-27t-28t-scale-reflex",
    sourceName: "Super-G R/C Drift Arena",
    variants: toothVariants([14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32], "8420")
  }),
  researchedItem({
    id: "rhino-racing-rr-751-ddss-shark-steering-wiper",
    category: "steeringRacks",
    brand: "Rhino Racing",
    productName: "DDSS SHARK Steering Wiper",
    simplifiedName: "DDSS SHARK Steering Wiper",
    displayName: "DDSS SHARK Steering Wiper",
    modelNumber: "RR-751R / RR-751P / RR-751B",
    productType: "steering rack",
    compatibleChassis: ["Rhino Racing Shark", "SHARK DDSS", "Yokomo YD-2"],
    notes: "DDSS steering wiper assembly for SHARK direct-drive steering setups. Collapsed color variants into one selector item.",
    tunableParameters: ["wiper position", "ackerman", "link spacing", "servo alignment", "notes"],
    sourceUrl: "https://supergdrift.com/products/steering-wiper-ddss-shark-red-black-purple-rhino-racing-rr-751",
    sourceName: "Super-G R/C Drift Arena",
    variants: colorVariants([
      ["red-rr-751r", "Red", "RR-751R"],
      ["purple-rr-751p", "Purple", "RR-751P"],
      ["black-rr-751b", "Black", "RR-751B"]
    ])
  }),
  researchedItem({
    id: "rhino-racing-rr-1600-shark-rear-h-arm-adapter-set",
    category: "suspensionKits",
    brand: "Rhino Racing",
    productName: "SHARK Rear H-Arm Adapter Set",
    simplifiedName: "SHARK Rear H-Arm Adapter Set",
    displayName: "SHARK Rear H-Arm Adapter Set",
    modelNumber: "RR-1600R / RR-1600P / RR-1600B",
    productType: "rear suspension adapter kit",
    compatibleChassis: ["Rhino Racing SHARK", "SHARK DDSS", "Yokomo YD-2", "MST RMX", "Reve D RDX"],
    notes: "Rear H-arm adapter set for converting compatible lower-arm layouts. Kept as a suspension kit so lower-arm selectors stay limited to actual arms.",
    tunableParameters: ["rear arm style", "adapter position", "toe block fitment", "roll center", "notes"],
    sourceUrl: "https://rhino-racing.com.cn/products/rhino-racing-shark/suspension/",
    sourceName: "Rhino Racing",
    variants: colorVariants([
      ["red-rr-1600r", "Red", "RR-1600R"],
      ["purple-rr-1600p", "Purple", "RR-1600P"],
      ["black-rr-1600b", "Black", "RR-1600B"]
    ])
  }),
  researchedItem({
    id: "rhino-racing-ddss-shark-servo-horn-series",
    category: "servoHorns",
    brand: "Rhino Racing",
    productName: "DDSS SHARK Servo Horn Series",
    simplifiedName: "DDSS SHARK Servo Horn",
    displayName: "DDSS SHARK Servo Horn",
    modelNumber: "RR-755B / RR-755P / RR-755R / RR-757B / RR-757P / RR-757R",
    productType: "servo horn",
    compatibleChassis: ["Rhino Racing Shark", "SHARK DDSS", "Rhinomax"],
    notes: "DDSS servo horn family collapsed by spline and color. 25T is for Futaba-style splines; 23T is for KO Propo / Sanwa.",
    tunableParameters: ["spline", "length", "servo alignment", "steering throw", "notes"],
    sourceUrl: "https://supergdrift.com/products/25t-servo-horn-splined-ddss-rhinomax-shark-red-black-purple-rhino-racing-rr-755b-rr-755p-rr-755r",
    sourceName: "Super-G R/C Drift Arena",
    variants: servoHornVariants([
      ["25t-black-rr-755b", "25T Futaba", "Black", "RR-755B"],
      ["25t-purple-rr-755p", "25T Futaba", "Purple", "RR-755P"],
      ["25t-red-rr-755r", "25T Futaba", "Red", "RR-755R"],
      ["23t-black-rr-757b", "23T KO/Sanwa", "Black", "RR-757B"],
      ["23t-purple-rr-757p", "23T KO/Sanwa", "Purple", "RR-757P"],
      ["23t-red-rr-757r", "23T KO/Sanwa", "Red", "RR-757R"]
    ])
  }),
  researchedItem({
    id: "overdose-od3884-od3889-jt-direct-servo-horn-type-2",
    category: "servoHorns",
    brand: "Overdose",
    productName: "GALM JT Aluminum Direct Servo Horn Type-2",
    simplifiedName: "GALM JT Direct Servo Horn Type-2",
    displayName: "GALM JT Direct Servo Horn Type-2",
    modelNumber: "OD3884 / OD3885 / OD3886 / OD3887 / OD3888 / OD3889",
    productType: "servo horn",
    compatibleChassis: ["Overdose GALM", "Overdose GALM V2"],
    notes: "Overdose direct servo horn family collapsed by spline and color. 23T is for Sanwa / KO; 25T is for Futaba.",
    tunableParameters: ["spline", "length", "servo alignment", "steering throw", "notes"],
    sourceUrl: "https://supergdrift.com/products/jt-aluminum-direct-servo-horn-type-2-sanwa-ko-23t-galm-black-purple-red-overdose-od3884-od3885-od3886",
    sourceName: "Super-G R/C Drift Arena",
    variants: servoHornVariants([
      ["23t-black-od3884", "23T Sanwa/KO", "Black", "OD3884"],
      ["23t-purple-od3885", "23T Sanwa/KO", "Purple", "OD3885"],
      ["23t-red-od3886", "23T Sanwa/KO", "Red", "OD3886"],
      ["25t-black-od3887", "25T Futaba", "Black", "OD3887"],
      ["25t-purple-od3888", "25T Futaba", "Purple", "OD3888"],
      ["25t-red-od3889", "25T Futaba", "Red", "OD3889"]
    ])
  }),
  researchedItem({
    id: "d-like-dl158-dl169-self-adjusting-cvd-axle-series",
    category: "rearAxles",
    brand: "D-Like",
    productName: "Hopping Bone Self-Adjusting CVD Axle Series",
    simplifiedName: "Hopping Bone Self-Adjusting CVD",
    displayName: "Hopping Bone Self-Adjusting CVD",
    modelNumber: "DL169-3 / DL158",
    productType: "axle shaft",
    compatibleChassis: ["Yokomo YD-2", "MST RMX", "Usukani PDS", "Universal 1/10 drift"],
    notes: "D-Like self-adjusting CVD axle family collapsed by length.",
    tunableParameters: ["shaft length", "pin size", "drive cup", "track width", "notes"],
    sourceUrl: "https://supergdrift.com/products/hopping-bone-self-adjusting-cvd-axles-short-yokomo-yd-2-pds-mst-2-pin-d-like-dl169-3",
    sourceName: "Super-G R/C Drift Arena",
    variants: [
      { id: "short-dl169-3", displayName: "Short", sku: "DL169-3", sourceProductName: "Short Self-Adjusting CVD" },
      { id: "long-dl158", displayName: "Long", sku: "DL158", sourceProductName: "Long Self-Adjusting CVD", sourceUrl: "https://supergdrift.com/products/hopping-bone-self-adjusting-cvd-axles-long-yokomo-yd-2-pds-mst-2-pin-d-like-dl158" }
    ]
  }),
  researchedItem({
    id: "wrap-up-next-0287-fd-high-traction-rear-universal-shaft",
    category: "rearAxles",
    brand: "Wrap-Up Next",
    productName: "High Traction Rear Universal Shaft",
    simplifiedName: "High Traction Rear Universal Shaft",
    displayName: "High Traction Rear Universal Shaft",
    modelNumber: "0287-FD",
    productType: "rear universal shaft",
    compatibleChassis: ["Universal 1/10 drift", "Wrap-Up Next FR-D", "Wrap-Up Next MR-D"],
    notes: "Wrap-Up Next high-traction rear universal shaft with 5mm axle design and length-adjustment tuning use. Added from RC-ART product listing.",
    tunableParameters: ["shaft length", "axle diameter", "drive cup", "track width", "notes"],
    sourceUrl: "https://shopping.rc-art.net/products/4571344917355/",
    sourceName: "RC-ART"
  }),
  researchedItem({
    id: "d-like-dl408-dl409-adjustable-aluminum-servo-horn",
    category: "servoHorns",
    brand: "D-Like",
    productName: "Adjustable Aluminum Servo Horn",
    simplifiedName: "Adjustable Aluminum Servo Horn",
    displayName: "Adjustable Aluminum Servo Horn",
    modelNumber: "DL408 / DL409",
    productType: "servo horn",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "D-Like adjustable aluminum servo horn collapsed by spline count.",
    tunableParameters: ["spline", "length", "servo alignment", "steering throw", "notes"],
    sourceUrl: "https://supergdrift.com/products/adjustable-aluminum-servo-horn-23t-25t-dlike",
    sourceName: "Super-G R/C Drift Arena",
    variants: [
      { id: "23t-dl408", displayName: "23T", sku: "DL408", sourceProductName: "23T Adjustable Servo Horn" },
      { id: "25t-dl409", displayName: "25T", sku: "DL409", sourceProductName: "25T Adjustable Servo Horn" }
    ]
  }),
  researchedItem({
    id: "usukani-nge-op22-aluminum-front-knuckle",
    category: "frontKnuckles",
    brand: "Usukani",
    productName: "NGE Aluminum Front Knuckle",
    simplifiedName: "NGE Aluminum Front Knuckle",
    displayName: "NGE Aluminum Front Knuckle",
    modelNumber: "NGE-OP22",
    productType: "front steering knuckle",
    compatibleChassis: ["Usukani NGE", "Usukani NGE-PRO"],
    notes: "NGE aluminum knuckle option listed in the official NGE-PRO option parts bundle.",
    tunableParameters: ["trail", "scrub", "upper arm hole", "lower arm hole", "steering stop", "notes"],
    sourceUrl: "https://www.usukani.com/products/nge-pro",
    sourceName: "Usukani"
  }),
  researchedItem({
    id: "usukani-nge-op21-aluminum-rear-hub",
    category: "rearHubCarriers",
    brand: "Usukani",
    productName: "NGE Aluminum Rear Hub Carrier",
    simplifiedName: "NGE Aluminum Rear Hub Carrier",
    displayName: "NGE Aluminum Rear Hub Carrier",
    modelNumber: "NGE-OP21",
    productType: "rear hub carrier",
    compatibleChassis: ["Usukani NGE", "Usukani NGE-PRO"],
    notes: "NGE aluminum rear hub set listed in the official NGE-PRO option parts bundle.",
    tunableParameters: ["upper arm hole", "roll center", "axle height", "spacer position", "notes"],
    sourceUrl: "https://www.usukani.com/products/nge-pro",
    sourceName: "Usukani"
  }),
  researchedItem({
    id: "usukani-nge-op24-aluminum-front-lower-arm",
    category: "frontLowerArms",
    brand: "Usukani",
    productName: "NGE Aluminum Front Lower Arm",
    simplifiedName: "NGE Aluminum Front Lower Arm",
    displayName: "NGE Aluminum Front Lower Arm",
    modelNumber: "NGE-OP24",
    productType: "lower suspension arm",
    compatibleChassis: ["Usukani NGE", "Usukani NGE-PRO"],
    notes: "NGE aluminum front lower arm set listed in the official NGE-PRO option parts bundle.",
    tunableParameters: ["inner shim", "outer shim", "track width", "shock hole", "notes"],
    sourceUrl: "https://www.usukani.com/products/nge-pro",
    sourceName: "Usukani"
  }),
  researchedItem({
    id: "usukani-nge-op31-aluminum-front-upper-arm",
    category: "frontUpperArms",
    brand: "Usukani",
    productName: "NGE Aluminum Front Upper Arm",
    simplifiedName: "NGE Aluminum Front Upper Arm",
    displayName: "NGE Aluminum Front Upper Arm",
    modelNumber: "NGE-OP31",
    productType: "upper arm",
    compatibleChassis: ["Usukani NGE", "Usukani NGE-PRO"],
    notes: "NGE aluminum front upper arm set listed in the official NGE-PRO option parts bundle.",
    tunableParameters: ["inner hole", "outer hole", "camber", "arm length", "notes"],
    sourceUrl: "https://www.usukani.com/products/nge-pro",
    sourceName: "Usukani"
  }),
  researchedItem({
    id: "usukani-nge-aluminum-suspension-mount-set",
    category: "frontToeBlocks",
    brand: "Usukani",
    productName: "NGE Aluminum Suspension Mount Set",
    simplifiedName: "NGE Aluminum Suspension Mount Set",
    displayName: "NGE Aluminum Suspension Mount Set",
    modelNumber: "NGE-OP38 / NGE-OP60",
    productType: "toe block / suspension mount",
    compatibleChassis: ["Usukani NGE", "Usukani NGE-PRO", "Usukani NGE-SE 2.0"],
    notes: "NGE aluminum suspension mount family. This item appears in front and rear suspension mount selectors because toe blocks/suspension mounts are selected by position.",
    tunableParameters: ["mount width", "toe angle", "bushing", "shim", "position", "notes"],
    sourceUrl: "https://www.usukani.com/products/nge-pro",
    sourceName: "Usukani",
    variants: [
      { id: "nge-pro-op38", displayName: "NGE-PRO", sku: "NGE-OP38", sourceProductName: "AL suspension mount set" },
      { id: "nge-se-2-op60", displayName: "NGE-SE 2.0", sku: "NGE-OP60", sourceProductName: "AL Suspension Mount Set for NGE-SE 2.0" }
    ]
  }),
  researchedItem({
    id: "usukani-nge-op50-cf-front-shock-tower",
    category: "frontShockTowers",
    brand: "Usukani",
    productName: "NGE CF Multihole Front Shock Tower",
    simplifiedName: "NGE CF Multihole Front Shock Tower",
    displayName: "NGE CF Multihole Front Shock Tower",
    modelNumber: "NGE-OP50",
    productType: "front shock tower",
    compatibleChassis: ["Usukani NGE", "Usukani NGE-PRO"],
    notes: "NGE carbon multihole F&R shock tower option listed in the official NGE-PRO option parts bundle.",
    tunableParameters: ["upper shock hole", "shock angle", "tower height", "spacer", "notes"],
    sourceUrl: "https://www.usukani.com/products/nge-pro",
    sourceName: "Usukani"
  }),
  researchedItem({
    id: "usukani-nge-op50-cf-rear-shock-tower",
    category: "rearShockTowers",
    brand: "Usukani",
    productName: "NGE CF Multihole Rear Shock Tower",
    simplifiedName: "NGE CF Multihole Rear Shock Tower",
    displayName: "NGE CF Multihole Rear Shock Tower",
    modelNumber: "NGE-OP50",
    productType: "rear shock tower",
    compatibleChassis: ["Usukani NGE", "Usukani NGE-PRO"],
    notes: "NGE carbon multihole F&R shock tower option listed in the official NGE-PRO option parts bundle.",
    tunableParameters: ["upper shock hole", "shock angle", "tower height", "spacer", "notes"],
    sourceUrl: "https://www.usukani.com/products/nge-pro",
    sourceName: "Usukani"
  }),
  researchedItem({
    id: "usukani-nge-direct-drive-steering-system",
    category: "steeringRacks",
    brand: "Usukani",
    productName: "NGE Adjustable Direct-Drive Steering System",
    simplifiedName: "NGE Direct-Drive Steering System",
    displayName: "NGE Direct-Drive Steering System",
    modelNumber: "NGE-OP30 / NGE-OP57",
    productType: "steering rack",
    compatibleChassis: ["Usukani NGE", "Usukani NGE-PRO"],
    notes: "NGE direct-drive steering family. The official NGE-PRO bundle lists OP30; Usukani option listings also reference a US x LM adjustable direct-drive steering system for NGE.",
    tunableParameters: ["steering link position", "ackerman", "servo height", "link spacing", "notes"],
    sourceUrl: "https://www.usukani.com/c/option-parts_0006",
    sourceName: "Usukani"
  }),
  researchedItem({
    id: "usukani-nge-metal-gear-diff-unit",
    category: "gearDiffs",
    brand: "Usukani",
    productName: "NGE Metal Gear Differential Unit",
    simplifiedName: "NGE Metal Gear Diff",
    displayName: "NGE Metal Gear Diff",
    modelNumber: "NGE-OP53 / NGE-OP54",
    productType: "gear differential",
    compatibleChassis: ["Usukani NGE", "Usukani NGE-PRO", "Usukani PDS", "3Racing Sakura D5"],
    notes: "Usukani NGE metal gear differential family collapsed into full-option and Type-A variants.",
    tunableParameters: ["diff oil", "gear type", "outdrive", "drive feel", "notes"],
    sourceUrl: "https://supergdrift.com/products/metal-gear-diff-unit-for-nge-full-option-usukani-nge-op53",
    sourceName: "Super-G R/C Drift Arena",
    variants: [
      { id: "full-option-nge-op53", displayName: "Full-option", sku: "NGE-OP53", sourceProductName: "Metal Gear Diff Unit for NGE Full-option" },
      { id: "type-a-nge-op54", displayName: "Type-A", sku: "NGE-OP54", sourceProductName: "Metal Gear diff unit For NGE Type-A", sourceUrl: "https://www.usukani.com/c/option-parts_0006" }
    ]
  }),
  researchedItem({
    id: "mst-210677m-rmx-60t-metal-gear-diff",
    category: "gearDiffs",
    brand: "MST",
    productName: "RMX 60T Metal Gear Differential",
    simplifiedName: "RMX 60T Metal Gear Diff",
    displayName: "RMX 60T Metal Gear Diff",
    modelNumber: "210677M",
    productType: "gear differential",
    compatibleChassis: ["MST RMX 2.5", "MST RMX 2.5EX", "MST RMX-M", "MST RMX EX"],
    notes: "MST 48P 60T metal bevel/spur gear differential assembly for RMX-series drift drivetrains.",
    tunableParameters: ["diff oil", "gear material", "drive feel", "shim setup", "notes"],
    sourceUrl: "https://supergdrift.com/collections/bevel-idler-gears/products/metal-gear-60t-spur-gear-bevel-gear-differential-mst-210677m",
    sourceName: "Super-G R/C Drift Arena"
  }),
  researchedItem({
    id: "mst-rmx-ball-diff-series",
    category: "ballDiffs",
    brand: "MST",
    productName: "RMX Ball Differential Series",
    simplifiedName: "RMX Ball Differential Series",
    displayName: "RMX Ball Differential Series",
    modelNumber: "210592 / 210644",
    productType: "ball differential",
    compatibleChassis: ["MST RMX 2.0", "MST RMX 2.5", "MST RRX 2.0", "MST RMX-M"],
    notes: "MST RMX ball differential options collapsed by gearbox generation. Confirm gearbox compatibility before ordering.",
    tunableParameters: ["diff tightness", "grease", "break-in", "spur gear", "notes"],
    sourceUrl: "https://www.driftmanjirc.com/collections/rc-mst-max-speed-technology/products/mst-rmx-2-0-ball-diff-set-210592-fits-rrx-2-0-1-10-scale-rc-drifting",
    sourceName: "Drift Manji RC / AMain",
    variants: [
      { id: "rmx-2-0-210592", displayName: "RMX 2.0 Ball Diff", sku: "210592", sourceProductName: "RMX 2.0 Ball Differential Set" },
      { id: "rmx-2-5-210644", displayName: "RMX 2.5 / Spur Gear Ball Diff", sku: "210644", sourceProductName: "RMX 2.5 Ball Differential Transmission Set", sourceUrl: "https://www.driftmanjirc.com/products/mst-rmx-2-5-ball-differential-transmission-set-210644" }
    ]
  }),
  researchedItem({
    id: "mst-rmx-aluminum-spool-series",
    category: "solidAxles",
    brand: "MST",
    productName: "RMX Aluminum Spool / Solid Axle Series",
    simplifiedName: "RMX Aluminum Spool Series",
    displayName: "RMX Aluminum Spool Series",
    modelNumber: "210585R",
    productType: "solid axle / spool",
    compatibleChassis: ["MST RMX 2.0", "MST RMX 2.5", "MST RRX 2.0"],
    notes: "MST aluminum spool/locked differential option for RMX-style gearboxes.",
    tunableParameters: ["spool setup", "drive cups", "locked diff behavior", "notes"],
    sourceUrl: "https://rccarworld.com/product/mst-rmx-2-0-aluminum-spool-set/",
    sourceName: "RC Car World"
  }),
  researchedItem({
    id: "yokomo-y2-500gsaa-resin-bevel-gear-diff-specific",
    category: "gearDiffs",
    brand: "Yokomo",
    productName: "YD/RD/SD Resin Bevel Gear Diff",
    simplifiedName: "YD/RD/SD Resin Bevel Gear Diff",
    displayName: "YD/RD/SD Resin Bevel Gear Diff",
    modelNumber: "Y2-500GSAA",
    productType: "gear differential",
    compatibleChassis: ["Yokomo YD-2", "Yokomo RD", "Yokomo SD", "Yokomo MD"],
    notes: "Yokomo resin bevel gear differential assembly with aluminum drive cups and protector specification. Also retained in the legacy generic differential category for old tune compatibility.",
    tunableParameters: ["diff oil", "drive cups", "protector", "shim setup", "notes"],
    sourceUrl: "https://supergdrift.com/products/yd-2-resin-bevel-gear-def-differential-unit-aluminum-drive-cup-protector-specification-assembled-yokomo-y2-500gsa",
    sourceName: "Super-G R/C Drift Arena",
    legacyIds: ["yokomo-y2-500gsaa-resin-bevel-gear-diff"]
  }),
  researchedItem({
    id: "yokomo-y2-500-a-ball-diff-specific",
    category: "ballDiffs",
    brand: "Yokomo",
    productName: "YD/RD/SD/MD Ball Diff",
    simplifiedName: "YD/RD/SD/MD Ball Diff",
    displayName: "YD/RD/SD/MD Ball Diff",
    modelNumber: "Y2-500-A",
    productType: "ball differential",
    compatibleChassis: ["Yokomo YD-2", "Yokomo RD", "Yokomo SD", "Yokomo MD"],
    notes: "Yokomo ball differential unit with bearings and grease. Also retained in the legacy generic differential category for old tune compatibility.",
    tunableParameters: ["diff tightness", "grease", "break-in", "maintenance", "notes"],
    sourceUrl: "https://supergdrift.com/products/yd-2-ball-differential-unit-yokomo-y2-500",
    sourceName: "Super-G R/C Drift Arena",
    legacyIds: ["yokomo-y2-500-a-ball-diff"]
  }),
  researchedItem({
    id: "yokomo-y2-502-solid-spool-specific",
    category: "solidAxles",
    brand: "Yokomo",
    productName: "YD-2 Solid Spool",
    simplifiedName: "YD-2 Solid Spool",
    displayName: "YD-2 Solid Spool",
    modelNumber: "Y2-502",
    productType: "solid axle / spool",
    compatibleChassis: ["Yokomo YD-2", "Yokomo RD", "Yokomo SD"],
    notes: "Yokomo locked spool/solid axle option for YD/RD/SD style gearboxes. Also retained in the legacy generic differential category for old tune compatibility.",
    tunableParameters: ["drive cups", "spool setup", "locked diff behavior", "notes"],
    sourceUrl: "https://teamyokomo.com/downloadfiles/%2102%21MANUAL/%2103%21DRIFT_KIT/YD-2AC_Manual_%5BEnglish%5D.pdf",
    sourceName: "Yokomo manual",
    legacyIds: ["yokomo-y2-502-solid-spool"]
  }),
  researchedItem({
    id: "topline-tp-361-rdx-gear-diff",
    category: "gearDiffs",
    brand: "Topline",
    productName: "TP-361 Gear Diff for RDX",
    simplifiedName: "RDX Gear Diff",
    displayName: "RDX Gear Diff",
    modelNumber: "TP-361",
    productType: "gear differential",
    compatibleChassis: ["Reve D RDX"],
    notes: "Topline resin gear differential unit for Reve D RDX. Retailer notes improved throttle response, longitudinal traction, and long maintenance cycle.",
    tunableParameters: ["diff oil", "gear material", "drive feel", "maintenance notes", "notes"],
    sourceUrl: "https://www.driftparadiz.fr/en/products/differential-for-rdx-topline",
    sourceName: "DriftParadiZ / RC Drift Dojo",
    aliases: ["Differential for RDX TOPLINE TP-361", "Gear Diff for RDX Topline"]
  }),
  researchedItem({
    id: "power-hd-r12s-low-profile-servo",
    category: "servos",
    brand: "Power HD",
    productName: "R12S Low Profile HV Digital Servo",
    simplifiedName: "R12S Low Profile Servo",
    displayName: "R12S Low Profile Servo",
    modelNumber: "R12S",
    productType: "standalone servo",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "Low-profile HV digital steering servo commonly sold for 1/10 drift/touring use. Source lists 12kg and 0.06s at 7.4V.",
    tunableParameters: ["speed", "torque", "smoother", "dead band", "damper", "endpoints", "center trim", "notes"],
    sourceUrl: "https://supergdrift.com/collections/vendors?q=powerhd",
    sourceName: "Super-G / Great Hobbies",
    aliases: ["PHDR12S", "PowerHD R12", "HD-R12S"]
  }),
  researchedItem({
    id: "power-hd-g1-rwd-drift-gyro",
    category: "gyros",
    brand: "Power HD",
    productName: "G1 Drift RWD Gyro",
    simplifiedName: "G1 Drift RWD Gyro",
    displayName: "G1 Drift RWD Gyro",
    modelNumber: "G1",
    productType: "standalone gyro",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "Power HD G1 drift gyro listed by Super-G as a RWD drift gyro with metal housing.",
    tunableParameters: ["gain", "mode", "curve", "endpoint", "direction", "notes"],
    sourceUrl: "https://supergdrift.com/collections/vendors?q=powerhd",
    sourceName: "Super-G R/C Drift Arena"
  }),
  researchedItem({
    id: "omg-predator-lp-16bf-servo",
    category: "servos",
    brand: "OMG",
    productName: "Predator LP-16BF Low Profile Servo",
    simplifiedName: "Predator LP-16BF Servo",
    displayName: "Predator LP-16BF Servo",
    modelNumber: "OMG-D4-16BF/BK / OMG-D4-16BF/RD / OMG-D4-16BF/VT",
    productType: "standalone servo",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "OMG Predator brushless digital low-profile servo for 1/10 drift/touring cars. Color variants are grouped.",
    tunableParameters: ["speed", "torque", "dead band", "endpoints", "center trim", "notes"],
    sourceUrl: "https://www.driftmanjirc.com/collections/rc-radio-gear/products/omg-predator-17kg-brushless-low-profile-servo",
    sourceName: "Drift Manji RC / Drifted",
    variants: colorVariants([
      ["black-omg-d4-16bf-bk", "Black", "OMG-D4-16BF/BK"],
      ["red-omg-d4-16bf-rd", "Red", "OMG-D4-16BF/RD"],
      ["purple-omg-d4-16bf-vt", "Purple", "OMG-D4-16BF/VT"]
    ]),
    aliases: ["OMG LP-16BF", "OMG Predator", "OMG-D4-16BF"]
  }),
  researchedItem({
    id: "agfrc-a50bhlw-low-profile-servo",
    category: "servos",
    brand: "AGFRC",
    productName: "A50BHLW Low Profile Brushless Servo",
    simplifiedName: "A50BHLW Servo",
    displayName: "A50BHLW Servo",
    modelNumber: "A50BHLW",
    productType: "standalone servo",
    compatibleChassis: ["Universal 1/10 drift"],
    notes: "Low-profile brushless HV servo with metal housing and magnetic encoder. Listed as 4.8-8.4V and programmable with AGF-SP interface.",
    tunableParameters: ["speed", "torque", "dead band", "endpoints", "center trim", "notes"],
    sourceUrl: "https://www.rc-drift-shop.com/AGF-RC-A50BHLW-Servo/en",
    sourceName: "RC-Drift-Shop",
    aliases: ["AGF-RC A50BHLW", "AGFRC A50BHLW"]
  }),
  researchedItem({
    id: "usukani-nge-op47-adjustable-ep-mount",
    category: "escMounts",
    brand: "Usukani",
    productName: "NGE Adjustable EP Mount",
    simplifiedName: "NGE Adjustable EP Mount",
    displayName: "NGE Adjustable EP Mount",
    modelNumber: "NGE-OP47",
    productType: "ESC mount",
    compatibleChassis: ["Usukani NGE", "Usukani NGE-PRO"],
    notes: "Adjustable electronics/ESC mount listed in the official NGE-PRO option parts bundle.",
    tunableParameters: ["ESC position", "weight bias", "mount height", "wire routing", "notes"],
    sourceUrl: "https://www.usukani.com/products/nge-pro",
    sourceName: "Usukani"
  }),
  researchedItem({
    id: "usukani-nge-op20-aluminum-servo-mount",
    category: "servoMounts",
    brand: "Usukani",
    productName: "NGE Aluminum Servo Mount",
    simplifiedName: "NGE Aluminum Servo Mount",
    displayName: "NGE Aluminum Servo Mount",
    modelNumber: "NGE-OP20",
    productType: "servo mount",
    compatibleChassis: ["Usukani NGE", "Usukani NGE-PRO"],
    notes: "Aluminum servo mount listed in the official NGE-PRO option parts bundle.",
    tunableParameters: ["servo position", "servo height", "steering alignment", "notes"],
    sourceUrl: "https://www.usukani.com/products/nge-pro",
    sourceName: "Usukani"
  }),
  researchedItem({
    id: "shibata-r31s338-grk-movable-esc-mount",
    category: "escMounts",
    brand: "Shibata",
    productName: "GRK Movable ESC Mount",
    simplifiedName: "GRK Movable ESC Mount",
    displayName: "GRK Movable ESC Mount",
    modelNumber: "R31S338BK / R31S338PU / R31S338RD",
    productType: "ESC mount",
    compatibleChassis: ["Shibata GRK5-R", "Shibata GRK5", "Shibata GRK"],
    notes: "Adjustable rear ESC mount for GRK5-R rear motor layouts. Supports ESC angle and rear overhang placement.",
    tunableParameters: ["ESC position", "ESC angle", "weight bias", "rear traction", "notes"],
    sourceUrl: "https://www.amainhobbies.com/shibata-grk5r-aluminum-adjustable-rear-esc-mount-red-grk-r31s338rd/p1798238",
    sourceName: "AMain Hobbies",
    variants: colorVariants([
      ["black-r31s338bk", "Black", "R31S338BK"],
      ["purple-r31s338pu", "Purple", "R31S338PU"],
      ["red-r31s338rd", "Red", "R31S338RD"]
    ])
  }),
  researchedItem({
    id: "shibata-r31s305-variable-esc-plate",
    category: "escMounts",
    brand: "Shibata",
    productName: "GRK Variable ESC Plate",
    simplifiedName: "GRK Variable ESC Plate",
    displayName: "GRK Variable ESC Plate",
    modelNumber: "R31S305BK / R31S305PU / R31S305RD",
    productType: "ESC mount",
    compatibleChassis: ["Shibata GRK5", "Shibata GRK4", "Shibata GRK3", "Shibata GRK-M", "Shibata GRK Global Series"],
    notes: "Variable ESC plate lets drivers move the ESC behind or around the gearbox for traction and weight-bias tuning.",
    tunableParameters: ["ESC position", "weight bias", "gearbox mounting", "wire routing", "notes"],
    sourceUrl: "https://rcsupremacy.com/products/variable-esc-plate-various-colors-r31s305",
    sourceName: "RC Supremacy",
    variants: colorVariants([
      ["black-r31s305bk", "Black", "R31S305BK"],
      ["purple-r31s305pu", "Purple", "R31S305PU"],
      ["red-r31s305rd", "Red", "R31S305RD"]
    ])
  }),
  researchedItem({
    id: "team-associated-dc10-carbon-lower-deck-series",
    category: "lowerDecks",
    brand: "Team Associated",
    productName: "DC10 Carbon Lower Deck Series",
    simplifiedName: "DC10 Carbon Lower Deck Series",
    displayName: "DC10 Carbon Lower Deck Series",
    modelNumber: "ASC72200 / ASC72286",
    productType: "lower deck",
    compatibleChassis: ["Team Associated DC10", "DC10", "DC10 RTR"],
    notes: "Collapsed DC10 lower deck replacements into one selector item with standard and Factory Team flex variants.",
    tunableParameters: ["deck material", "deck flex", "brace position", "battery position", "notes"],
    sourceUrl: "https://supergdrift.com/collections/vendors/products/carbon-fiber-chassis-kit-for-dc10-lower-deck-associated-asc72200",
    sourceName: "Super-G R/C Drift Arena",
    variants: [
      {
        id: "standard-asc72200",
        displayName: "Standard lower deck",
        sku: "ASC72200",
        sourceProductName: "Carbon Fiber Chassis Kit for DC10 Lower Deck"
      },
      {
        id: "ft-flex-20mm-asc72286",
        displayName: "FT Flex 2.0mm",
        sku: "ASC72286",
        size: "2.0mm",
        sourceProductName: "DC10 Carbon Fiber FT Flex Lower 2.0mm Deck Chassis Kit",
        sourceUrl: "https://supergdrift.com/collections/vendors/products/dc10-carbon-fiber-flex-lower-deck-chassis-kit-associated-asc72286"
      }
    ],
    aliases: [
      "Carbon Fiber Chassis Kit FOR DC10 Lower Deck [Associated] ASC72200",
      "DC10 Carbon Fiber FT Flex Lower 2.0mm Deck Chassis Kit [Associated] ASC72286"
    ]
  }),
  researchedItem({
    id: "team-associated-dc10-ft-flex-top-deck-series",
    category: "upperDecks",
    brand: "Team Associated",
    productName: "DC10 FT Flex Top Deck Series",
    simplifiedName: "DC10 FT Flex Top Deck Series",
    displayName: "DC10 FT Flex Top Deck Series",
    modelNumber: "ASC72287 / ASC72288",
    productType: "upper deck",
    compatibleChassis: ["Team Associated DC10", "DC10", "DC10 RTR"],
    notes: "Factory Team flex top deck options for high-motor and low-motor DC10 layouts. Grouped as variants so deck selection stays compact.",
    tunableParameters: ["deck flex", "motor height", "rear traction", "chassis roll", "notes"],
    sourceUrl: "https://60years.associatedelectrics.com/dc10-ft-flex-top-deck-high-motor/",
    sourceName: "Associated Electrics",
    variants: [
      {
        id: "high-motor-asc72287",
        displayName: "High Motor",
        sku: "ASC72287",
        sourceProductName: "DC10 FT Flex Top Deck, High Motor",
        sourceUrl: "https://60years.associatedelectrics.com/dc10-ft-flex-top-deck-high-motor/"
      },
      {
        id: "low-motor-asc72288",
        displayName: "Low Motor",
        sku: "ASC72288",
        sourceProductName: "DC10 FT Flex Top Deck, Low Motor",
        sourceUrl: "https://60years.associatedelectrics.com/dc10-ft-flex-top-deck-low-motor/"
      }
    ],
    aliases: [
      "DC10 FT Flex Top Deck, High Motor",
      "DC10 FT Flex Top Deck, Low Motor",
      "72287",
      "72288"
    ]
  }),
  researchedItem({
    id: "team-associated-dc10-ft-aluminum-spur-gear-hub",
    category: "drivetrainAccessories",
    brand: "Team Associated",
    productName: "DC10 FT Aluminum Spur Gear Hub",
    simplifiedName: "DC10 FT Aluminum Spur Gear Hub",
    displayName: "DC10 FT Aluminum Spur Gear Hub",
    modelNumber: "ASC72263",
    productType: "spur gear hub",
    compatibleChassis: ["Team Associated DC10", "DC10", "DC10 RTR"],
    notes: "Factory Team aluminum spur gear hub for the DC10 drivetrain. Kept out of spur gear selectors because it is the hub, not a spur gear.",
    tunableParameters: ["spur hub material", "drivetrain rigidity", "gear mesh", "rotating mass", "notes"],
    sourceUrl: "https://www.associatedelectrics.com/news/latest_products/2936-new-ft-parts-for-the-dc10/",
    sourceName: "Associated Electrics",
    aliases: ["72263", "ASC72263", "DC10 Factory Team Aluminum Spur Gear Hub"]
  }),
  researchedItem({
    id: "yokomo-44-5mm-rear-universal-shaft-series",
    category: "rearAxles",
    brand: "Yokomo",
    productName: "44.5mm Rear Universal Shaft Series",
    simplifiedName: "44.5mm Rear Universal Shaft Series",
    displayName: "44.5mm Rear Universal Shaft Series",
    modelNumber: "B9-010RAA / B9-01445BA",
    productType: "rear axle shaft",
    compatibleChassis: ["Yokomo drift fitment to verify", "Yokomo BD/SD/RD/MD fitment to verify"],
    notes: "Yokomo 44.5mm rear shaft options. Added because 44.5mm axle choices were missing; drivers should verify hub, axle bearing, and platform compatibility before selecting.",
    tunableParameters: ["length", "drive shaft type", "wheel hub offset", "spacer", "notes"],
    sourceUrl: "https://www.rcmart.com/yokomo-44-5mm-rear-universal-shaft-b9-010raa-00121528",
    sourceName: "RC Mart / Yokomo parts listing",
    variants: [
      {
        id: "44-5mm-rear-universal-b9-010raa",
        displayName: "Rear Universal 44.5mm",
        sku: "B9-010RAA",
        size: "44.5mm",
        sourceProductName: "44.5mm Rear Universal Shaft"
      },
      {
        id: "44-5mm-aluminum-b9-01445ba",
        displayName: "Aluminum 44.5mm",
        sku: "B9-01445BA",
        size: "44.5mm",
        sourceProductName: "Aluminum Rear Drive Shaft 44.5mm",
        sourceUrl: "https://www.rcmart.com/yokomo-aluminum-rear-drive-shaft-44-5mm-for-yz-2-b9-01445ba-00124530"
      }
    ],
    aliases: ["B9-010RAA", "B9-01445BA", "Yokomo 44.5mm rear shaft", "Yokomo aluminum rear drive shaft 44.5mm"]
  })
];
