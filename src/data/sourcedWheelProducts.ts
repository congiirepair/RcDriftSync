import type { ProductCatalogItem } from "./productCatalog";
import type { RcPart } from "./rcParts";

interface SourcedWheelProduct {
  brand: string;
  productName: string;
  modelNumber: string;
  sourceUrl: string;
  simplifiedName?: string;
  displayName?: string;
  tuneSelectable?: boolean;
  hiddenFromTuneBuilder?: boolean;
  reasonHidden?: string;
  canonicalProductId?: string;
  variants?: ProductCatalogItem["variants"];
}

// Sourced from Super-G R/C Drift Arena product feeds on 2026-05-06.
// Keep these as catalog entries, not claims that the list is complete forever.
export const sourcedWheelProducts: SourcedWheelProduct[] = [
  {
    brand: "Team Associated",
    productName: "DC10 FT Adjustable 2-Piece Wheel Rims - 4pc (Inner Face Plates) [Associated] 72246 72247 72248 72249",
    modelNumber: "72246 / 72247 / 72248 / 72249",
    sourceUrl: "https://supergdrift.com/collections/rims/products/dc10-ft-adjustable-2-piece-wheel-rims-4pc-inner-faces-associated-72246-72247-72248-72249"
  },
  {
    brand: "D-Like",
    productName: "MS-7 5mm (RED) 1/10 Rims  Rims [D-Like] DL102",
    modelNumber: "DL102",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ms-7-5mm-red-rims-d-like"
  },
  {
    brand: "D-Like",
    productName: "TE-37SL MS-37SL Rims 5mm - 7mm (Bronze) [D-Like] DL397 DL396",
    modelNumber: "DL397-2 / DL396-2",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te-37sl-ms-37sl-rims-5mm-7mm-bronze-d-like-dl397-dl396"
  },
  {
    brand: "D-Like",
    productName: "TE-37SL MS-37SL Rims 5mm - 7mm (Matte Black) [D-Like] DL328 DL329",
    modelNumber: "DL328-2 / DL329",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te-37sl-ms-37sl-rims-5mm-7mm-matte-black-d-like-dl328-dl329"
  },
  {
    brand: "D-Like",
    productName: "TE-37SL MS-37SL Rims 5mm - 7mm (Silver) [D-Like] DL399 DL398",
    modelNumber: "DL399 / DL398",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te-37sl-ms-37sl-rims-5mm-7mm-silver-d-like-dl399-dl398"
  },
  {
    brand: "D-Like",
    productName: "TE-37SL MS-37SL Rims 5mm - 7mm (White) [D-Like] DL395-2 DL394-2",
    modelNumber: "DL395-2 / DL394-2",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te-37sl-ms-37sl-rims-5mm-7mm-white-d-like-dl395-2-dl394-2"
  },
  {
    brand: "DS Racing",
    productName: "DRIFT ELEMENT Adjustable Offset ( CHROME SERIES ) Rims 5 Spoke (white, gold, gunmetal, black, light gold) [DS Racing]",
    modelNumber: "DE-008 / DE-009 / DE-010 / DE-011 / DE-012 / DE-013 / DE-014 / DE-015 / DE-018 / DE-017 / DE-019 / DE-020 / DE-021 / DE-022 / DE-016",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drift-element-adjustable-offset-chrome-series-rims-5-spoke-white-gold-gunmetal-black-light-gold-ds-racing"
  },
  {
    brand: "DS Racing",
    productName: "DRIFT ELEMENT Adjustable Offset (BLACK) Rims [DS Racing] DE-005 DE-006 DE-007",
    modelNumber: "DE-005 / DE-006 / DE-007",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drift-element-adjustable-offset-black-rims-ds-racing-de-005-de-006-de-007"
  },
  {
    brand: "DS Racing",
    productName: "DRIFT ELEMENT Adjustable Offset (White)  Rims [DS Racing] DE-002 DE-003 DE-004",
    modelNumber: "DE-002 / DE-003 / DE-004",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drift-element-adjustable-offset-white-rims-ds-racing-de-002-de-003-de-004"
  },
  {
    brand: "DS Racing",
    productName: "DRIFT ELEMENT II - 6 SPOKES Adjustable Offset Rims ( CHROME SERIES ) 6 SPOKE (white, black, gun metal, bronze, chrome) [DS Racing]",
    modelNumber: "DE-208 / DE-209 / DE-210 / DE-211 / DE-212 / DE-213 / DE-214 / DE-222 / DE-221 / DE-220 / DE-219 / DE-218 / DE-217 / DE-216 / DE-215 / DE-201",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drift-element-ii-6-spokes-adjustable-offset-rims-chrome-series-6-spoke-white-black-gun-metal-bronze-chrome-ds-racing"
  },
  {
    brand: "DS Racing",
    productName: "DRIFT ELEMENT MESH Adjustable Offset 1-10 Rims [DS Racing]",
    modelNumber: "DE-305 / DE-306 / DE-307 / DE-302 / DE-303 / DE-304",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drift-element-mesh-adjustable-offset-1-10-rims-ds-racing"
  },
  {
    brand: "DS Racing",
    productName: "Feathery Split 5Y Wheels 8mm OFFSET (Bronze) 1-10 Drift Rims[DS Racing] DF-5Y2-8B-BZ",
    modelNumber: "DF-5Y2-8B-BZ",
    sourceUrl: "https://supergdrift.com/collections/rims/products/feathery-split-5y-wheels-8mm-offset-bronze-1-10-drift-rimsds-racing-df-5y2-8b-bz"
  },
  {
    brand: "DS Racing",
    productName: "Feathery Split 5Y Wheels 8mm OFFSET (Chrome) 1-10 Drift Rims[DS Racing] DF-5Y28B-CR",
    modelNumber: "DF-5Y28B-CR",
    sourceUrl: "https://supergdrift.com/collections/rims/products/feathery-5y-wheels-8mm-offset-chrome-1-10-drift-rimsds-racing-df-5y28b-cr"
  },
  {
    brand: "DS Racing",
    productName: "Feathery Split 5Y Wheels 8mm OFFSET (Matte White) 1-10 Drift Rims[DS Racing] DF-5Y2-8W-WM",
    modelNumber: "DF-5Y2-8W-WM",
    sourceUrl: "https://supergdrift.com/collections/rims/products/feathery-split-5y-wheels-8mm-offset-matte-white-1-10-drift-rimsds-racing-df-5y2-8w-wm"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - BLACK N-6 Drift Wheel High Traction 6mm / 8mm 1/10 Rims [G-Force] GD070 GD071",
    modelNumber: "GD070 / GD071",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-black-n-6-drift-wheel-high-traction-6mm-8mm-1-10-rims-g-force-gd070-gd071"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - BLACK N-6 Drift Wheel Super Traction 6mm / 8mm 1/10 Rims [G-Force] GD072 GD073",
    modelNumber: "GD072 / GD073",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-black-n-6-drift-wheel-super-traction-6mm-8mm-1-10-rims-g-force-gd072-gd073"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - BLACK N-Type Drift Wheel (Normal Traction) 6mm / 8mm 1/10 Rims [G-Force] GD038 GD039",
    modelNumber: "GD038 / GD039",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-black-n-type-drift-wheel-normal-traction-6mm-8mm-1-10-rims-g-force-gd038-gd039"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - BLACK N-Type Drift Wheel High Traction 6mm / 8mm 1/10 Rims [G-Force] GD054 GD055",
    modelNumber: "GD054 / GD055",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-black-n-type-drift-wheel-super-traction-6mm-8mm-1-10-rims-g-force-gd054-gd055"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - BLACK N-Type Drift Wheel Super Traction 6mm / 8mm 1/10 Rims [G-Force] GD056 GD057",
    modelNumber: "GD056 / GD057",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-black-n-type-drift-wheel-super-traction-6mm-8mm-1-10-rims-g-force-gd056-gd057"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - BRONZE N-Type Drift Wheel (Normal Traction) 6mm / 8mm 1/10 Rims [G-Force] GD040 GD041",
    modelNumber: "GD040 / GD041",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-bronze-n-type-drift-wheel-normal-traction-6mm-8mm-1-10-rims-g-force-gd040-gd041"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - BRONZE N-Type Drift Wheel (Traction) 6mm / 8mm 1/10 Rims [G-Force] GD090 GD091",
    modelNumber: "GD090 / GD091",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-bronze-n-type-drift-wheel-traction-6mm-8mm-1-10-rims-g-force-gd090-gd091"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - MATTE Silver N-Type Drift Wheel (Normal Traction) 6mm / 8mm 1/10 Rims [G-Force] GD042 GD043",
    modelNumber: "GD042 / GD043",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-matte-silver-n-type-drift-wheel-normal-traction-6mm-8mm-1-10-rims-g-force-gd042-gd043"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - TITAN Silver N-Type Drift Wheel (Normal Traction) 6mm / 8mm 1/10 Rims [G-Force] GD044 GD045",
    modelNumber: "GD044 / GD045",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-titan-silver-n-type-drift-wheel-normal-traction-6mm-8mm-1-10-rims-g-force-gd044-gd045"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - WHITE N-6 Drift Wheel High Traction 6mm / 8mm 1/10 Rims [G-Force] GD064 GD065",
    modelNumber: "GD064 / GD065",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-white-n-6-drift-wheel-high-traction-6mm-8mm-1-10-rims-g-force-gd064-gd065"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - WHITE N-6 Drift Wheel Super Traction 6mm / 8mm 1/10 Rims [G-Force] GD066 GD067",
    modelNumber: "GD066 / GD067",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-white-n-6-drift-wheel-super-traction-6mm-8mm-1-10-rims-g-force-gd066-gd067"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - WHITE N-Type Drift Wheel (Normal Traction) 6mm / 8mm 1/10 Rims [G-Force] GD036 GD037",
    modelNumber: "GD036 / GD037",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-white-n-type-drift-wheel-standard-traction-6mm-8mm-1-10-rims-g-force-gd050-gd051-copy"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - WHITE N-Type Drift Wheel High Traction 6mm / 8mm 1/10 Rims [G-Force] GD048 GD049",
    modelNumber: "GD048 / GD049",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-white-n-type-drift-wheel-high-traction-6mm-8mm-1-10-rims-g-force-gd048-gd049"
  },
  {
    brand: "Hayate",
    productName: "HAYATE - WHITE N-Type Drift Wheel Super Traction 6mm / 8mm 1/10 Rims [G-Force] GD050 GD051",
    modelNumber: "GD050 / GD051",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayate-n-type-drift-wheel-super-traction-6mm-8mm-1-10-rims-g-force-gd050-gd051"
  },
  {
    brand: "Hayashi Garage",
    productName: "EURO (BIPPU) VIP Dish Style 1-10 Rims 8mm - Chrome Metallic Silver Gloss Black [Hayashi Garage]",
    modelNumber: "HG20218 / HG20228 / HG20208",
    sourceUrl: "https://supergdrift.com/collections/rims/products/euro-bippu-vip-dish-style-1-10-rims-8mm-chrome-metallic-silver-gloss-black-hayashi-garage"
  },
  {
    brand: "Hayashi Garage",
    productName: "NIZ 5-Star Multipiece Style 1-10 Rims (6mm / 8mm) White Gold Silver [Hayashi Garage]",
    modelNumber: "HG20156 / HG20158 / HG20166 / HG20168 / HG20146 / HG20148",
    sourceUrl: "https://supergdrift.com/collections/rims/products/niz-5-star-1-10-rims-6mm-8mm-white-gold-silver-hayashi-garage"
  },
  {
    brand: "Hayashi Garage",
    productName: "PANA 8-Spoke Style 1-10 Rims (6mm / 8mm) Gun Metal Gold Silver [Hayashi Garage]",
    modelNumber: "HG20416 / HG20418 / HG20316 / HG20318 / HG20326 / HG20328",
    sourceUrl: "https://supergdrift.com/collections/rims/products/pana-8-spoke-style-1-10-rims-6mm-8mm-gun-metal-gold-silver-hayashi-garage"
  },
  {
    brand: "LAB",
    productName: "WORK Meister S1 3P Chrome 6mm / 8mm Drift Wheels [LAB]",
    modelNumber: "LW-0806C / LW-0808C",
    sourceUrl: "https://supergdrift.com/products/work-meister-s1-3p-6mm-8mm-rims-chrome-lab-lw-0808c-lw-0806c"
  },
  {
    brand: "LAB",
    productName: "WORK Meister S1 3P Bronze Metallic 6mm / 8mm Drift Wheels [LAB]",
    modelNumber: "LW-0806BM / LW-0808BM",
    sourceUrl: "https://supergdrift.com/products/work-meister-s1-3p-6mm-8mm-rims-bronze-metallic-w-chrome-lip-lab-lw-0808bm-lw-0806bm"
  },
  {
    brand: "LAB",
    productName: "WORK Meister S1 3P Matte Carbon / Chrome 6mm / 8mm Drift Wheels [LAB]",
    modelNumber: "LW-0806MCB / LW-0808MCB",
    sourceUrl: "https://supergdrift.com/collections/lab/products/work-meister-s1-3p-6mm-8mm-rims-matte-carbon-black-w-chrome-lip-lab-lw-0808mcb-lw-0806mcb"
  },
  {
    brand: "LAB",
    productName: "WORK Emotion CR3P Matte Carbon / Chrome 6mm / 8mm Drift Wheels [LAB]",
    modelNumber: "LW-0606MCB / LW-0608MCB",
    sourceUrl: "https://supergdrift.com/products/work-emotion-cr3p-matte-carbon-chrome-6mm-8mm-1-10-drift-rims-lab-lw-0606mcb-lw-0608mcb"
  },
  {
    brand: "LAB",
    productName: "WORK Emotion CR3P Snow White / Chrome 6mm / 8mm Drift Wheels [LAB]",
    modelNumber: "LW-0606MSN / LW-0608MSN",
    sourceUrl: "https://supergdrift.com/products/work-emotion-cr3p-snow-white-chrome-6mm-8mm-1-10-drift-rims-lab-lw-0606msn-lw-0608msn"
  },
  {
    brand: "LAB",
    productName: "VOLK Racing TE37SL White High Traction 6mm / 8mm Drift Wheels [LAB]",
    modelNumber: "LWH-0306WHa / LWH-0308WHa",
    sourceUrl: "https://supergdrift.com/products/volk-racing-te37-te-37-te37sl-6mm-8mm-white-high-traction-1-10-drift-rims-lab-lwh-0306wh-lwh-0308wh"
  },
  {
    brand: "LAB",
    productName: "RAYS Gram Lights 57D Neon Orange 6mm / 8mm Drift Wheels [LAB]",
    modelNumber: "LW-0406ORa / LW-0408ORa",
    sourceUrl: "https://supergdrift.com/products/1-10-rays-neon-orange-gramlights-57d-rims-6mm-8mm-drift-rims-lab-lw-0406or-lw-0408or"
  },
  {
    brand: "LAB",
    productName: "WORK Meister L1 Black Chrome 6mm / 8mm Drift Wheels [LAB]",
    modelNumber: "OW-0506BC / OW-0508BC",
    sourceUrl: "https://supergdrift.com/products/outlet-work-meister-l1-black-chrome-1-10-rims-wheel-6mm-8mm-lab-ow-0506bc-ow-0508bc"
  },
  {
    brand: "HPI Racing",
    productName: "1-10 GLOSS BLACK WORK MEISTER S1 RIMS - 6mm DEEP DISH WHEELS [HPI Racing] 160525",
    modelNumber: "160525",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-gloss-black-work-meister-s1-rims-deep-dish-wheels-hpi-racing-hpi160525"
  },
  {
    brand: "HPI Racing",
    productName: "1-10 TE37 WHEEL 26mm BLACK (6mm OFFSET) Rims [HPI Racing] 3846",
    modelNumber: "3846",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-te37-wheel-26mm-black-6mm-offset-rims-hpi-racing-3846"
  },
  {
    brand: "HPI Racing",
    productName: "BBS RS MESH (Gold with Silver Lip) 1-10 Rims - 6mm [HPI] 120266",
    modelNumber: "120266",
    sourceUrl: "https://supergdrift.com/collections/rims/products/bbs-rs-mesh-gold-with-silver-lip-1-10-rims-6mm-hpi-120266"
  },
  {
    brand: "HPI Racing",
    productName: "Fifteen52 TURBOMAC TARMAC Rims 6mm BLACK [HPI RACING] 114638",
    modelNumber: "114638",
    sourceUrl: "https://supergdrift.com/collections/rims/products/fifteen52-turbomac-tarmac-rims-6mm-black-hpi-racing-114638"
  },
  {
    brand: "HPI Racing",
    productName: "Fifteen52 TURBOMAC TARMAC Rims 6mm WHITE (HIGH TRACTION) [HPI RACING] 114637",
    modelNumber: "114637",
    sourceUrl: "https://supergdrift.com/collections/rims/products/fifteen52-turbomac-tarmac-rims-6mm-white-high-traction-hpi-racing-114637"
  },
  {
    brand: "HPI Racing",
    productName: "Fifteen52 TURBOMAC TARMAC Rims 9mm WHITE [HPI RACING] 160206",
    modelNumber: "160206",
    sourceUrl: "https://supergdrift.com/collections/rims/products/fifteen52-turbomac-tarmac-rims-9mm-white-hpi-racing-160206"
  },
  {
    brand: "HPI Racing",
    productName: "FS-15 Sport 8 Spoke Wheel Silver 6mm 1-10 RIMS [HPI RACING] 160541",
    modelNumber: "160541",
    sourceUrl: "https://supergdrift.com/collections/rims/products/fs-15-sport-8-spoke-wheel-silver-6mm-1-10-rims-hpi-racing-160541"
  },
  {
    brand: "HPI Racing",
    productName: "Kansei Astro Wheels White 6mm Offset 1-10 Rims [HPI] 160949",
    modelNumber: "160949",
    sourceUrl: "https://supergdrift.com/collections/rims/products/kansei-astro-wheels-white-6mm-offset-1-10-rims-hpi-160949"
  },
  {
    brand: "HPI Racing",
    productName: "RAYS GRAM LIGHTS 57S-PRO GLOSS BLACK (6mm OFFSET) DEEP DISH 1-10 RIMS [HPI RACING] 160483",
    modelNumber: "160483",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rays-gram-lights-57s-pro-gloss-black-6mm-offset-deep-dish-1-10-rims-hpi-racing-160483"
  },
  {
    brand: "HPI Racing",
    productName: "RAYS VOLK RACING TE37 (6mm OFFSET) BRONZE DEEP DISH 1-10 RIMS [HPI RACING] 3848",
    modelNumber: "3848",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rays-volk-racing-te37-6mm-offset-deep-dish-1-10-rims-hpi-racing-3848"
  },
  {
    brand: "HPI Racing",
    productName: "RAYS VOLK RACING TE37 (6mm OFFSET) WHITE DEEP DISH 1-10 RIMS [HPI RACING] 3845",
    modelNumber: "3845",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rays-volk-racing-te37-6mm-offset-matte-chrome-deep-dish-1-10-rims-hpi-racing-3845"
  },
  {
    brand: "HPI Racing",
    productName: "RTR 7Twenty Style 55 JAMES DEANE - Gun Metal 1-10 Rims - 6mm - 9mm [HPI] 120226 120225",
    modelNumber: "120225 / 120226",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rtr-7twenty-style-55-james-deane-gun-metal-1-10-rims-6mm-9mm-hpi-120226-120225"
  },
  {
    brand: "HPI Racing",
    productName: "RTR Tech 7 - Black 1-10 Rims - 6mm / 9mm [HPI] 160400 160368",
    modelNumber: "160400 / 160368",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rtr-tech-7-black-1-10-rims-6mm-hpi-160400"
  },
  {
    brand: "HPI Racing",
    productName: "RTR Tech 7 - Green 1-10 Rims - 6mm - 9mm [HPI] 116531 116532",
    modelNumber: "116531 / 116532",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rtr-tech-7-green-1-10-rims-6mm-9mm-hpi-116531-116532"
  },
  {
    brand: "HPI Racing",
    productName: "RTR Tech 7 - Orange 1-10 Rims - 6mm - 9mm [HPI] 120250 120251",
    modelNumber: "120250 / 120251",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rtr-tech-7-orange-1-10-rims-6mm-9mm-hpi-120250-120251"
  },
  {
    brand: "HPI Racing",
    productName: "Work EMOTION XC8 - White 1-10 Rims - 6mm - 9mm [HPI] 3304 3305",
    modelNumber: "3304 / 3305",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-xc8-white-1-10-rims-6mm-9mm-hpi-3304-3305"
  },
  {
    brand: "K-Force",
    productName: "1-10 DEVIL SHADOW SPOKE RIMS (SILVER) +6 (4 PACK) (INCH DOWN) [K FORCE] KF-5384",
    modelNumber: "KF-5384",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-devil-shadow-spoke-rims-silver-6-4-pack-inch-down-k-sport-kf-5384"
  },
  {
    brand: "K-Force",
    productName: "1-10 Hoshinos Impul Silhouette +3 Silver Dish (4 PACK) WHEELS [K FORCE] HOSHINO-S3",
    modelNumber: "HOSHINO-S3",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-hoshinos-impul-silhouette-3-silver-dish-4-pack-wheels-k-force-hoshino-s3"
  },
  {
    brand: "K-Force",
    productName: "1-10 SSR LONGCHAMP XR-4 RIMS (GOLD) +6 (4 PACK) (INCH DOWN) [K FORCE] KF-8744",
    modelNumber: "KF-8744",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-ssr-longchamp-xr-4-rims-gold-6-4-pack-inch-down-k-sport-kf-8744"
  },
  {
    brand: "K-Force",
    productName: "1-10 SSR LONGCHAMP XR-4 RIMS (SILVER) +6 (4 PACK) (INCH DOWN) [K FORCE] KF-5940",
    modelNumber: "KF-5940",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-ssr-longchamp-xr-4-rims-silver-6-4-pack-inch-down-k-sport-kf-5940"
  },
  {
    brand: "K-Force",
    productName: "1-10 SSR LONGCHAMP XR-4 RIMS (SILVER) +9 (4 PACK) (INCH DOWN) [K FORCE] KF-5947",
    modelNumber: "KF-5947",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-ssr-longchamp-xr-4-rims-silver-9-4-pack-inch-down-k-sport-kf-5947"
  },
  {
    brand: "K-Force",
    productName: "1-10 SSR MK1 RIMS +3 Chrome Dish (4 PACK)  WHEELS [K FORCE] SSRMK1-C",
    modelNumber: "SSRMK1-C",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-ssr-mk1-rims-3-chrome-dish-4-pack-wheels-k-sport-ssrmk1-c"
  },
  {
    brand: "K-Force",
    productName: "1-10 SSR MK3 RIMS +3 MATTE SILVER (4 PACK)  WHEELS [K FORCE] SSRMK3-MS",
    modelNumber: "SSRMK3-MS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-ssr-mk3-rims-3-matte-silver-4-pack-k-sport-ssrmk3-ms"
  },
  {
    brand: "K-Force",
    productName: "1-10 SSR REVERSE MESH RIMS (GOLD) +6 (4 PACK) (INCH DOWN) [K FORCE] KF-5273",
    modelNumber: "KF-5273",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-ssr-reverse-mesh-rims-gold-6-4-pack-inch-down-k-sport-kf-5273"
  },
  {
    brand: "K-Force",
    productName: "1-10 SSR REVERSE MESH RIMS (GOLD) +9 (4 PACK) (INCH DOWN) [K FORCE] KF-5274",
    modelNumber: "KF-5274",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-ssr-reverse-mesh-rims-gold-9-4-pack-inch-down-k-force-kf-5274"
  },
  {
    brand: "K-Force",
    productName: "1-10 SSR REVERSE MESH RIMS (SILVER) +6 (4 PACK) (INCH DOWN) [K FORCE] KF-5271",
    modelNumber: "KF-5271",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-ssr-reverse-mesh-rims-silver-6-4-pack-inch-down-k-sport-kf-5271"
  },
  {
    brand: "K-Force",
    productName: "1-10 SSR REVERSE MESH RIMS (SILVER) +9 (4 PACK) (INCH DOWN) [K FORCE] KF-5275",
    modelNumber: "KF-5275",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-ssr-reverse-mesh-rims-silver-9-4-pack-inch-down-k-sport-kf-5275"
  },
  {
    brand: "K-Force",
    productName: "1-10 SSR STAR SHARKS TECHNO BOSOZUKO RIMS (SILVER) +6 OFFSET (4 PACK) (INCH DOWN) [K FORCE] KF-5422",
    modelNumber: "KF-5422",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-ssr-star-sharks-techno-bosozuko-rims-silver-6-offset-4-pack-inch-down-k-sport-kf-5422-copy"
  },
  {
    brand: "K-Force",
    productName: "1-10 SSR STAR SHARKS TECHNO BOSOZUKO RIMS (SILVER) +9 OFFSET DEEP DISH (4 PACK) (INCH DOWN) [K FORCE] KF-5419",
    modelNumber: "KF-5419",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-ssr-star-sharks-techno-bosozuko-rims-silver-6-offset-4-pack-inch-down-k-sport-kf-5419"
  },
  {
    brand: "K-Force",
    productName: "1-10 SSR STAR SHARKS TECHNO BOSOZUKO RIMS BLACK +9 OFFSET (4 PACK) (INCH DOWN) [K SPORT] SSR-STAR-B9",
    modelNumber: "SSR-STAR-B9",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-ssr-star-sharks-techno-bosozuko-rims-black-9-offset-4-pack-inch-down-k-sport-ssr-star-b9"
  },
  {
    brand: "K-Force",
    productName: "1-10 STEELIES 6mm OFFSET - INCH DOWN RIMS (smaller diameter face) (4 PACK) [K FORCE] KS-STEELIES-S6",
    modelNumber: "KS-STEELIES-S6",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-steelies-6mm-offset-inch-down-rims-smaller-diameter-face-4-pack-k-force-ks-steelies-s6"
  },
  {
    brand: "K-Force",
    productName: "1-10 STEELIES 9mm OFFSET - INCH DOWN RIMS (smaller diameter face) (4 PACK) [K FORCE] KS-STEELIES-S9",
    modelNumber: "KS-STEELIES-S9",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-steelies-9mm-offset-inch-down-rims-smaller-diameter-face-4-pack-k-force-ks-steelies-s9"
  },
  {
    brand: "K-Force",
    productName: "1-10 TAKECHI PROJECT RACING HART 4 SPOKE RIMS (GOLD) +6 (4 PACK) (INCH DOWN) [K FORCE] KF-5814",
    modelNumber: "KF-5814",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-takechi-project-racing-hart-4-spoke-rims-gold-6-4-pack-inch-down-k-force-kf-5817"
  },
  {
    brand: "K-Force",
    productName: "1-10 TAKECHI PROJECT RACING HART 4 SPOKE RIMS (GOLD) +9 (4 PACK) (INCH DOWN) [K FORCE] KF-5819",
    modelNumber: "KF-5819",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-takechi-project-racing-hart-4-spoke-rims-gold-9-4-pack-inch-down-k-sport-kf-5819"
  },
  {
    brand: "K-Force",
    productName: "1-10 TAKECHI PROJECT RACING HART 4 SPOKE RIMS (SILVER) +6 (4 PACK) (INCH DOWN) [K FORCE] KF-5817",
    modelNumber: "KF-5817",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-takechi-hart-4-spoke-rims-silver-6-4-pack-inch-down-k-sport-kf-5817"
  },
  {
    brand: "K-Force",
    productName: "1-10 TAKECHI PROJECT RACING HART 4 SPOKE RIMS (SILVER) +9 (4 PACK) (INCH DOWN) [K FORCE] KF-5818",
    modelNumber: "KF-5818",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-takechi-project-racing-hart-4-spoke-rims-silver-6-4-pack-inch-down-k-sport-kf-5817-copy"
  },
  {
    brand: "K-Force",
    productName: "1-10 TAKECHI PROJECT RACING HART 4 SPOKE RIMS +6 (SILVER) + ADVAN TIRES [K FORCE] KF-5827T",
    modelNumber: "KF-5827T",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-takechi-project-racing-hart-4-spoke-rims-silver-6-4-pack-advan-tires-mounted-inch-down-k-force-kf-5827t",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Mounted wheel/tire bundle, not a standalone wheel choice."
  },
  {
    brand: "K-Force",
    productName: "1-10 VOLK RACING GT-V RIMS - DEEP DISH +9 CHROME (4 PACK) [K SPORT] GTV-4010S-9mm",
    modelNumber: "GTV-4010S-9mm",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-volk-racing-gt-v-rims-deep-dish-9-chrome-4-pack-k-sport-gtv-4010s-9mm"
  },
  {
    brand: "K-Force",
    productName: "1-10 VOLK RACING RAYS CE28 RIMS +6 BRONZE (4 PACK) [K FORCE] KF-5315",
    modelNumber: "KF-5315",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-volk-racing-rays-ce28-rims-6-bronze-4-pack-k-force-kf-5315"
  },
  {
    brand: "K-Force",
    productName: "1-10 VOLK RACING RAYS CE28 RIMS +6 GLOSS WHITE (4 PACK) [K FORCE] KF-5311",
    modelNumber: "KF-5311",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-volk-racing-rays-ce28-rims-6-white-4-pack-k-force-kf-5311"
  },
  {
    brand: "K-Force",
    productName: "1-10 WORK MEISTER S1 RIMS - DEEP DISH +9 CHROME (4 PACK) [K FORCE] MEISTERS1-C",
    modelNumber: "MEISTERS1-C",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-work-meister-s1-rims-deep-dish-9-chrome-4-pack-k-sport-meisters1-c"
  },
  {
    brand: "K-Force",
    productName: "4 SPOKE - RACING HART TAKECHI FR 4H - 6MM OFFSET OLD SCHOOL INCHDOWN 1-10 RIMS - BLACK (4 PACK) [K SPORT] 4SPOKE-B6",
    modelNumber: "4SPOKE-B6",
    sourceUrl: "https://supergdrift.com/collections/rims/products/4-spoke-racing-hart-takechi-fr-4h-6mm-offset-old-school-inchdown-1-10-rims-black-4-pack-k-sport-4spoke-b6"
  },
  {
    brand: "K-Force",
    productName: "4 SPOKE - RACING HART TAKECHI FR 4H - 9MM OFFSET OLD SCHOOL INCHDOWN 1-10 RIMS - BLACK (4 PACK) [K SPORT] 4SPOKE-B9",
    modelNumber: "4SPOKE-B9",
    sourceUrl: "https://supergdrift.com/collections/rims/products/4-spoke-racing-hart-takechi-fr-4h-9mm-offset-old-school-inchdown-1-10-rims-black-4-pack-k-sport-4spoke-b9"
  },
  {
    brand: "K-Force",
    productName: "TE37v 6 SPOKE RIMS - GOLD w- CHROME LIP (4 PACK) [K FORCE] KF8348",
    modelNumber: "KF8348",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te37v-6-spoke-rims-gold-w-chrome-lip-4-pack-k-sport-kf8348"
  },
  {
    brand: "K-Force",
    productName: "TE37v 6 SPOKE RIMS - ROYAL BLACK w- CHROME LIP (4 PACK) [K FORCE] KF8344",
    modelNumber: "KF8344",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te37v-6-spoke-rims-royal-black-w-chrome-lip-4-pack-k-sport-te37vblkchrme"
  },
  {
    brand: "LAB",
    productName: "1-10 RAYS - Neon Green GRAMLIGHTS 57D Rims 6mm 8mm - DRIFT RIMS [LAB] LW-0406GRa LW-0408GRa",
    modelNumber: "LW-0406GRa / LW-0408GRa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-rays-neon-green-gramlights-57d-rims-6mm-8mm-drift-rims-lab-lw-0406gr-lw-0408gr"
  },
  {
    brand: "LAB",
    productName: "1-10 RAYS - Neon Orange GRAMLIGHTS 57D Rims 6mm 8mm - DRIFT RIMS [LAB] LW-0406ORa LW-0408ORa",
    modelNumber: "LW-0406ORa / LW-0408ORa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-rays-neon-orange-gramlights-57d-rims-6mm-8mm-drift-rims-lab-lw-0406or-lw-0408or"
  },
  {
    brand: "LAB",
    productName: "1-10 RAYS - Neon Pink GRAMLIGHTS 57D Rims 6mm 8mm - DRIFT RIMS [LAB] LW-0406PIa LW-0408PIa",
    modelNumber: "LW-0406PIa / LW-0408PIa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-rays-neon-pink-gramlights-57d-rims-6mm-8mm-drift-rims-lab-lw-0406pi-lw-0408pi"
  },
  {
    brand: "LAB",
    productName: "1-10 RAYS - Neon Yellow GRAMLIGHTS 57D Rims 6mm 8mm - DRIFT RIMS [LAB] LW-0406YEa LW-0408YEa",
    modelNumber: "LW-0406YEa / LW-0408YEa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-rays-neon-yellow-gramlights-57d-rims-6mm-8mm-drift-rims-lab-lw-0406ye-lw-0408ye"
  },
  {
    brand: "LAB",
    productName: "GRAM LIGHTS 57D Sports WHEEL TRACTION TYPE BRONZE 6mm 8mm [LAB] LWT-0406BRa LWT-0408BRa",
    modelNumber: "LWT-0406BRa / LWT-0408BRa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gram-lights-57d-sports-wheel-traction-type-bronze-6mm-8mm-lab-lwt-0406br-lwt-0408br"
  },
  {
    brand: "LAB",
    productName: "GRAM LIGHTS 57D Sports WHEEL TRACTION TYPE GOLD METAL 6mm 8mm [LAB] LWT-0406Ga LWT-0408Ga",
    modelNumber: "LWT-0406Ga / LWT-0408Ga",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gram-lights-57d-sports-wheel-traction-type-gold-metal-6mm-8mm-lab-lwt-0406g-lwt-0408g"
  },
  {
    brand: "LAB",
    productName: "GRAM LIGHTS 57D Sports WHEEL TRACTION TYPE HIGH GLOSS BLACK 6mm 8mm [LAB] LWT-0406HGB LWT-0408HGB",
    modelNumber: "LWT-0406HGB / LWT-0408HGB",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gram-lights-57d-sports-wheel-traction-type-high-gloss-black-6mm-8mm-lab-lwt-0406hgb-lwt-0408hgb"
  },
  {
    brand: "LAB",
    productName: "OUTLET:  Work EMOTION T5R 2P T5R2P CONCAVE TYPE BLACK CANDY RED RIMS 6mm 8mm [LAB] OW-0706BCR OW-0708BCR",
    modelNumber: "OW-0706BCR / OW-0708BCR",
    sourceUrl: "https://supergdrift.com/collections/rims/products/outlet-work-emotion-t5r-2p-t5r2p-concave-type-black-candy-red-rims-6mm-8mm-lab-ow-0706bcr-ow-0708bcr"
  },
  {
    brand: "LAB",
    productName: "OUTLET: Volk Racing Rays BRONZE TE37 Sports 1-10 Rims Wheel SUPER HIGH TRACTION 6mm 8mm [LAB] OWH-0306BR OWH-0308BR",
    modelNumber: "OWH-0306BR / OWH-0308BR",
    sourceUrl: "https://supergdrift.com/collections/rims/products/volk-racing-rays-bronze-te37-sports-1-10-rims-wheel-super-high-traction-6mm-8mm-lab-owh-0306br-owh-0308br"
  },
  {
    brand: "LAB",
    productName: "OUTLET: Work Equip 05 1-10 Rims Wheel (Black Chrome) 6mm 8mm [LAB] OW-0106BC OW-0108BC",
    modelNumber: "OW-0106BC / OW-0108BC",
    sourceUrl: "https://supergdrift.com/collections/rims/products/outlet-gun-metal-chrome-work-equip-1-10-rims-wheel-black-chrome-6mm-8mm-lab-ow-0106bc-ow-0108bc"
  },
  {
    brand: "LAB",
    productName: "OUTLET: Work Meister L1 - Black Chrome - 1-10 Rims Wheel 6mm 8mm [LAB] OW-0506BC OW-0508BC",
    modelNumber: "OW-0506BC / OW-0508BC",
    sourceUrl: "https://supergdrift.com/collections/rims/products/outlet-work-meister-l1-black-chrome-1-10-rims-wheel-6mm-8mm-lab-ow-0506bc-ow-0508bc"
  },
  {
    brand: "LAB",
    productName: "Super High Traction WORK MEISTER S1 3P 6mm - 8mm 1-10 RC RIMS CHROME [LAB] LWS-0808C LWS-0806C",
    modelNumber: "LWS-0806C / LWS-0808C",
    sourceUrl: "https://supergdrift.com/collections/rims/products/super-high-traction-work-meister-s1-3p-6mm-8mm-1-10-rc-rims-chrome-lab-lws-0808c-lws-0806c"
  },
  {
    brand: "LAB",
    productName: "TE37 Sports WHEEL HIGH TRACTION TYPE BRONZE METAL 6mm 8mm [LAB] LWH-0306BRa LWH-0308BRa",
    modelNumber: "LWH-0306BRa / LWH-0308BRa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te37-sports-wheel-high-traction-type-bronze-metal-6mm-8mm-lab-lwh-0306br-lwh-0308br"
  },
  {
    brand: "LAB",
    productName: "TE37 Sports WHEEL HIGH TRACTION TYPE GOLD METAL 6mm 8mm [LAB] LWH-0306G LWH-0308G",
    modelNumber: "LWH-0306G(a) / LWH-0308GA",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te37-sports-wheel-high-traction-type-gold-metal-6mm-8mm-lab-lwh-0306g-lwh-0308g"
  },
  {
    brand: "LAB",
    productName: "TE37 Sports WHEEL TRACTION TYPE BLACK CHROME 6mm 8mm [LAB] LWT-0306BC LWT-0308BC",
    modelNumber: "LWT-0306BC / LWT-0308BC",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te37-sports-wheel-traction-type-black-chrome-6mm-8mm-lab-lwt-0306bc-lwt-0308bc"
  },
  {
    brand: "LAB",
    productName: "VOLK RACING TE37 TE-37 TE37SL 6mm 8mm BLACK HIGH TRACTION 1-10 DRIFT RIMS [LAB] LWH-0306BKa LWH-0308BKa",
    modelNumber: "LWH-0306BKa / LWH-0308BKa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/volk-racing-te37-te-37-te37sl-6mm-8mm-black-high-traction-1-10-drift-rims-lab-lwh-0306bk-lwh-0308bk"
  },
  {
    brand: "LAB",
    productName: "VOLK RACING TE37 TE-37 TE37SL 6mm 8mm WHITE  HIGH TRACTION 1-10 DRIFT RIMS [LAB] LWH-0306WHa LWH-0308WHa",
    modelNumber: "LWH-0306WHa / LWH-0308WHa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/volk-racing-te37-te-37-te37sl-6mm-8mm-white-high-traction-1-10-drift-rims-lab-lwh-0306wh-lwh-0308wh"
  },
  {
    brand: "LAB",
    productName: "Work Emotion CR3P MATTE BLACK CHROME 6mm 8mm 1-10 DRIFT RIMS [LAB] LW-0606MBCA LW-0608MBCA",
    modelNumber: "LW-0606MBCA / LW-0608MBCA",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-cr3p-matte-black-chrome-6mm-8mm-1-10-drift-rims-lab-lw-0606mbca-lw-0608mbca"
  },
  {
    brand: "LAB",
    productName: "Work Emotion CR3P MATTE CARBON - CHROME 6mm 8mm 1-10 DRIFT RIMS [LAB] LW-0606MCB LW-0608MCB",
    modelNumber: "LW-0606MCBa / LW-0608MCBa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-cr3p-matte-carbon-chrome-6mm-8mm-1-10-drift-rims-lab-lw-0606mcb-lw-0608mcb"
  },
  {
    brand: "LAB",
    productName: "Work Emotion CR3P MATTE CARBON / BRONZE LIP 6mm 8mm 1-10 DRIFT RIMS [LAB] LW-0606CBRA LW-0608CBRA",
    modelNumber: "LW-0606CBRA / LW-0608CBRA",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-cr3p-matte-carbon-bronze-lip-6mm-8mm-1-10-drift-rims-lab-lw-0606cbra-lw-0608cbra"
  },
  {
    brand: "LAB",
    productName: "Work Emotion CR3P SNOW WHITE - CHROME 6mm 8mm 1-10 DRIFT RIMS [LAB] LW-0606MSN LW-0608MSN",
    modelNumber: "LW-0606MSNa / LW-0608MSNa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-cr3p-snow-white-chrome-6mm-8mm-1-10-drift-rims-lab-lw-0606msn-lw-0608msn"
  },
  {
    brand: "LAB",
    productName: "Work EMOTION T5R 2P T5R2P CONCAVE TYPE BLACK CANDY PURPLE RIMS 6mm 8mm [LAB] LW-0706CP LW-0708CP",
    modelNumber: "LW-0706CP / LW-0708CP",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-t5r-2p-t5r2p-concave-type-black-candy-purple-rims-6mm-8mm-lab-lw-0706cp-lw-0708cp"
  },
  {
    brand: "LAB",
    productName: "Work EMOTION T5R 2P T5R2P CONCAVE TYPE BLACK CANDY RED RIMS 6mm 8mm [LAB] LW-0706BCRa LW-0708BCRa",
    modelNumber: "LW-0706BCRa / LW-0708BCRa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-t5r-2p-t5r2p-concave-type-black-candy-red-rims-6mm-8mm-lab-lw-0706bcr-lw-0708bcr"
  },
  {
    brand: "LAB",
    productName: "Work EMOTION T5R 2P T5R2P CONCAVE TYPE Bronze Gray Metallic RIMS 6mm 8mm [LAB] LW-0706BGMa LW-0708BGMa",
    modelNumber: "LW-0706BGMa / LW-0708BGMa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-t5r-2p-t5r2p-concave-type-bronze-gray-metallic-rims-6mm-8mm-lab-lw-0706bgma-lw-0708bgma"
  },
  {
    brand: "LAB",
    productName: "Work EMOTION T5R 2P T5R2P CONCAVE TYPE CANDY GOLD RIMS 6mm 8mm [LAB] LW-0706CGa LW-0708CGa",
    modelNumber: "LW-0706CGa / LW-0708CGa",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-t5r-2p-t5r2p-concave-type-candy-gold-rims-6mm-8mm-lab-lw-0706cga-lw-0708cga"
  },
  {
    brand: "LAB",
    productName: "Work EMOTION T5R 2P T5R2P CONCAVE TYPE CANDY RED RIMS 6mm 8mm [LAB] LW-0706CR LW-0708CR",
    modelNumber: "LW-0706CR / LW-0708CR",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-t5r-2p-t5r2p-concave-type-candy-red-rims-6mm-8mm-lab-lw-0706cr-lw-0708cr"
  },
  {
    brand: "LAB",
    productName: "Work EMOTION T5R 2P T5R2P CONCAVE TYPE CHROME RIMS 6mm 8mm [LAB] LW-0706C LW-0708C",
    modelNumber: "LW-0706Ca / LW-0708Ca",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-t5r-2p-t5r2p-concave-type-chrome-rims-6mm-8mm-lab-lw-0706c-lw-0708c"
  },
  {
    brand: "LAB",
    productName: "Work EMOTION T5R 2P T5R2P CONCAVE TYPE PURE WHITE RIMS 6mm 8mm [LAB] LW-0706PWA LW-0708PWA",
    modelNumber: "LW-0706PWA / LW-0708PWA",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-t5r-2p-t5r2p-concave-type-pure-white-rims-6mm-8mm-lab-lw-0706pwa-lw-0708pwa"
  },
  {
    brand: "LAB",
    productName: "WORK EQUIP 05 6mm - 8mm RIMS MATTE CHROME [LAB] LW-0108MCA LW-0106MCA",
    modelNumber: "LW-0106MCA / LW-0108MCA",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-equip-5-spokes-6mm-8mm-rims-matte-chrome-lab-lw-0108mc-lw-0106mc"
  },
  {
    brand: "LAB",
    productName: "WORK MEISTER S1 3P 6mm - 8mm 1-10 RC RIMS CHROME [LAB] LW-0808C LW-0806C",
    modelNumber: "LW-0806C / LW-0808C",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-meister-s1-3p-6mm-8mm-rims-chrome-lab-lw-0808c-lw-0806c"
  },
  {
    brand: "LAB",
    productName: "WORK MEISTER S1 3P 6mm - 8mm RIMS BRONZE METALLIC (W/ CHROME LIP) [LAB] LW-0808BM LW-0806BM",
    modelNumber: "LW-0806BM / LW-0808BM",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-meister-s1-3p-6mm-8mm-rims-bronze-metallic-w-chrome-lip-lab-lw-0808bm-lw-0806bm"
  },
  {
    brand: "LAB",
    productName: "WORK MEISTER S1 3P 6mm - 8mm RIMS GUN METAL METALLIC (W/ BRONZE LIP) [LAB] LW-0808BGM LW-0806BGM",
    modelNumber: "LW-0806BGM / LW-0808BGM",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-meister-s1-3p-6mm-8mm-rims-gun-metal-metallic-w-bronze-lip-lab-lw-0808bgm-lw-0806bgm"
  },
  {
    brand: "LAB",
    productName: "WORK MEISTER S1 3P 6mm - 8mm RIMS High Gloss Black (Mirror) [LAB] LW-0808HGB LW-0806HGB",
    modelNumber: "LW-0806HGB / LW-0808HGB",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-meister-s1-3p-6mm-8mm-rims-high-gloss-black-mirror-lab-lw-0808hgb-lw-0806hgb"
  },
  {
    brand: "LAB",
    productName: "WORK MEISTER S1 3P 6mm - 8mm RIMS MATTE CARBON W/ CHROME LIP [LAB] LW-0808MCB LW-0806MCB",
    modelNumber: "LW-0806MCB / LW-0808MCB",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-meister-s1-3p-6mm-8mm-rims-matte-carbon-black-w-chrome-lip-lab-lw-0808mcb-lw-0806mcb"
  },
  {
    brand: "LAB",
    productName: "WORK MEISTER S1 3P 6mm - 8mm RIMS PURE WHITE (W/ CHROME LIP) [LAB] LW-0806PW LW-0808PW",
    modelNumber: "LW-0806PW / LW-0808PW",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-meister-s1-3p-6mm-8mm-rims-pure-white-w-chrome-lip-lab-lw-0806pw-lw-0808pw"
  },
  {
    brand: "LAB",
    productName: "Work VS-KF VSKF 1-10 VS KF Wheels (CHROME) 6mm / 8mm [Lab] LW-0906C  LW-0908C",
    modelNumber: "LW-0906C / LW-0908C",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lab"
  },
  {
    brand: "LAB",
    productName: "Work VS-KF VSKF 1-10 VS KF Wheels (HIGH GLOSS BLACK) 6mm / 8mm [Lab] LW-0906HGB LW-0908HGB",
    modelNumber: "LW-0906HGB / LW-0908HGB",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-vs-kf-vskf-1-10-vs-kf-wheels-high-gloss-black-6mm-8mm-lab-lw-0906hgb-lw-0908hgb"
  },
  {
    brand: "Mikuni",
    productName: "1-10 Advan Oni (Matte Silver) Rims 5mm - 7mm [Mikuni] DW-925MS DW-927MS",
    modelNumber: "DW-925MS / DW-927MS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-advan-oni-matte-silver-rims-5mm-7mm-mikuni-dw-925ms-dw-927ms"
  },
  {
    brand: "Mikuni",
    productName: "1/10 Advan Oni +5mm / +7mm (Chrome) Rims [Mikuni] DW-927CS DW-925CS",
    modelNumber: "DW-925CS / DW-927CS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/advan-oni-7mm-chrome-rims-mikuni-dw-927cs"
  },
  {
    brand: "Mikuni",
    productName: "Advan AVS T6  Wheels (WHITE) 1-10 Rims 5mm - 7mm [Mikuni] DW-1325WH DW-1327WH",
    modelNumber: "DW-1325WH / DW-1327WH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/advan-avs-t6-wheels-white-1-10-rims-5mm-7mm-topline-rc-dw-1325wh-dw-1327wh"
  },
  {
    brand: "Mikuni",
    productName: "Advan AVS T6 Wheels (CHROME) 1-10 Rims 5mm - 7mm [Mikuni] DW-1325CS DW-1327CS",
    modelNumber: "DW-1325CS / DW-1327CS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/advan-avs-t6-wheels-chrome-1-10-rims-5mm-7mm-mikuni-dw-1325cs-dw-1327cs"
  },
  {
    brand: "Mikuni",
    productName: "Advan AVS TS6 Matte Silver 5mm / 7mm 1/10 RC RIMS [Mikuni] DW-1325MS DW-1327MS",
    modelNumber: "DW-1325MS / DW-1327MS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/yokohama-avs-ts6-matte-silver-5mm-7mm-1-10-rc-rims-mikuni-dw-1325ms-dw-1327ms"
  },
  {
    brand: "Mikuni",
    productName: "EPSILON MESH +6mm (Matte Gold) Rims [Mikuni] DW-1293S",
    modelNumber: "DW-1293S",
    sourceUrl: "https://supergdrift.com/collections/rims/products/epsilon-mesh-6mm-matte-gold-rims-mikuni-dw-1293s"
  },
  {
    brand: "Mikuni",
    productName: "EPSILON MESH +6mm (Matte Silver) Rims [Mikuni] DW-1026MS",
    modelNumber: "DW-1026MS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/epsilon-mesh-6mm-matte-silver-rims-mikuni-dw-1026ms"
  },
  {
    brand: "Mikuni",
    productName: "Work Equip 05 Matte Silver 3mm 1-10 RC RIMS [Mikuni] DW-1123MS",
    modelNumber: "DW-1123MS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-equip-5-spoke-matte-silver-3mm-1-10-rc-rims-mikuni-dw-1123ms"
  },
  {
    brand: "Mikuni",
    productName: "Yokohama AVS Model T7 Deep Face Concave Rims (YELLOW) 5MM / 7MM [TOPLINE]",
    modelNumber: "DW-1227YE / DW-1225YE",
    sourceUrl: "https://supergdrift.com/collections/rims/products/yokohama-avs-model-t7-deep-face-concave-rims-yellow-7mm-mikuni"
  },
  {
    brand: "Mikuni",
    productName: "Yokohama AVS VS6  PEARL WHITE 5mm / 7mm 1/10 RC RIMS [Mikuni] DW-727PW DW-725PW",
    modelNumber: "DW-725PW / DW-727PW",
    sourceUrl: "https://supergdrift.com/collections/rims/products/yokohama-avs-vs6-pearl-white-7mm-1-10-rc-rims-mikuni-dw-727pw"
  },
  {
    brand: "MST",
    productName: "1-10 57FX - FX FLAT MATTE SILVER - 8 Offset Drift Rims (4-Pack) [MST] 832035FS",
    modelNumber: "832035FS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-57fx-fx-flat-matte-silver-8-offset-drift-rims-4-pack-mst-832035fs"
  },
  {
    brand: "MST",
    productName: "1-10 BBS CI-R (SPLIT 5 SPOKE) RID BLACK - 5 Offset Drift Rims (4-Pack) [MST] 832042BK",
    modelNumber: "832042BK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-bbs-ci-r-split-5-spoke-rid-black-5-offset-drift-rims-4-pack-mst-832042bk"
  },
  {
    brand: "MST",
    productName: "1-10 BBS CI-R (SPLIT 5 SPOKE) RID DEEP CONCAVE GOLD - 8 Offset Drift Rims (4-Pack) [MST] 832043GD",
    modelNumber: "832043GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-bbs-ci-r-split-5-spoke-rid-deep-concave-gold-8-offset-drift-rims-4-pack-mst-832043gd"
  },
  {
    brand: "MST",
    productName: "1-10 BBS CI-R (SPLIT 5 SPOKE) RID FLAT MATTE SILVER - 8 Offset Drift Rims (4-Pack) [MST] 832043FS",
    modelNumber: "832043FS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-bbs-ci-r-split-5-spoke-rid-flat-matte-silver-8-offset-drift-rims-4-pack-mst-832043fs"
  },
  {
    brand: "MST",
    productName: "1-10 BBS CI-R (SPLIT 5 SPOKE) RID GLOSS WHITE - 11 Offset Drift Rims (4-Pack) [MST] 832044W",
    modelNumber: "832044W",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-bbs-ci-r-split-5-spoke-rid-gloss-white-11-offset-drift-rims-4-pack-mst-832044w"
  },
  {
    brand: "MST",
    productName: "1-10 BBS CI-R (SPLIT 5 SPOKE) RID GOLD - 5 Offset Drift Rims (4-Pack) [MST] 832042GD",
    modelNumber: "832042GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-bbs-ci-r-split-5-spoke-rid-gold-5-offset-drift-rims-4-pack-mst-832042gd"
  },
  {
    brand: "MST",
    productName: "1-10 RE30 RAYS STYLE MATTE SILVER  8 Offset Drift Rims (4-Pack) [MST] 832009FS",
    modelNumber: "832009FS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-re30-rays-style-matte-silver-8-offset-drift-rims-4-pack-mst-832009fs"
  },
  {
    brand: "MST",
    productName: "12 Multi Spoke (Gold / Chrome Lip) Adjustable Offset Rims (4-Pack) 1-10 SSR Style Wheels [MST] 832105GD",
    modelNumber: "832105GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/12-multi-spoke-gold-chrome-lip-adjustable-offset-rims-4-pack-1-10-ssr-style-wheels-mst-832105gd"
  },
  {
    brand: "MST",
    productName: "12 Multi Spoke (Silver / Chrome Lip) Adjustable Offset Rims (4-Pack) 1-10 SSR Style Wheels [MST] 832105FS",
    modelNumber: "832105FS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/12-multi-spoke-silver-chrome-lip-adjustable-offset-rims-4-pack-1-10-ssr-style-wheels-mst-832105fs"
  },
  {
    brand: "MST",
    productName: "12 Spoke Multispoke BLITZ Style (Gunmetal - CHROME LIP) 1-10 S-SBK 21 AdjustableOffset Rims (4-Pack) [MST] 832105SBK",
    modelNumber: "832105SBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/12-spoke-multispoke-blitz-style-gunmetal-chrome-lip-1-10-s-sbk-21-adjustableoffset-rims-4-pack-mst-832105sbk"
  },
  {
    brand: "MST",
    productName: "501 Mesh (BLACK - CHROME) Adjustable Offset Rims (4-Pack) 1-10 BBS STYLE [MST] 832103FBK",
    modelNumber: "832103FBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/501-mesh-black-chrome-adjustable-offset-rims-4-pack-mst-832103fbk"
  },
  {
    brand: "MST",
    productName: "501 Mesh (Dark Chrome / Silver Lip) Adjustable Offset Rims (4-Pack)  1-10 BBS STYLE [MST] 832104SBK",
    modelNumber: "832104SBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/501-mesh-dark-chrome-silver-lip-adjustable-offset-rims-4-pack-1-10-bbs-style-mst-832104sbk"
  },
  {
    brand: "MST",
    productName: "501 Mesh (GOLD - SILVER) Adjustable Offset Rims (4-Pack) 1-10 BBS Style [MST] 832104GD",
    modelNumber: "832104GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/501-mesh-gold-silver-adjustable-offset-rims-4-pack-mst-832104gd"
  },
  {
    brand: "MST",
    productName: "501 Mesh (Matte Black / Silver Lip) Adjustable Offset Rims (4-Pack)  1-10 BBS STYLE [MST] 832104FBK",
    modelNumber: "832104FBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/501-mesh-matte-black-silver-lip-adjustable-offset-rims-4-pack-1-10-bbs-style-mst-832104fbk"
  },
  {
    brand: "MST",
    productName: "501 Mesh (Silver / Silver Lip) Adjustable Offset Rims (4-Pack)  1-10 BBS STYLE [MST] 832104FS",
    modelNumber: "832104FS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/501-mesh-silver-silver-lip-adjustable-offset-rims-4-pack-1-10-bbs-style-mst-832104fs"
  },
  {
    brand: "MST",
    productName: "501 Mesh (WHITE) Adjustable Offset Rims (4-Pack) 1-10 BBS Style [MST] 832103W",
    modelNumber: "832103W",
    sourceUrl: "https://supergdrift.com/collections/rims/products/501-mesh-white-adjustable-offset-rims-4-pack-1-10-bbs-style-mst-832103w"
  },
  {
    brand: "MST",
    productName: "6 Spoke (Chrome) Adjustable Offset Rims (4-Pack) 1-10 TE37 HRE 546 Style Wheels [MST] 832107S",
    modelNumber: "832107S",
    sourceUrl: "https://supergdrift.com/collections/rims/products/6-spoke-chrome-adjustable-offset-rims-4-pack-1-10-te37-hre-546-style-wheels-mst-832107s"
  },
  {
    brand: "MST",
    productName: "6 Spoke (Gold / Chrome Lip) Adjustable Offset Rims (4-Pack) 1-10 TE37 HRE 546 Style Wheels [MST] 832107GD",
    modelNumber: "832107GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/6-spoke-gold-chrome-lip-adjustable-offset-rims-4-pack-1-10-te37-hre-style-wheels-mst-832107gd"
  },
  {
    brand: "MST",
    productName: "6 Spoke (Matte Black / Chrome Lip) Adjustable Offset Rims (4-Pack) 1-10 TE37 HRE 546 Style Wheels [MST] 832107FBK",
    modelNumber: "832107FBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/6-spoke-matte-black-chrome-lip-adjustable-offset-rims-4-pack-1-10-te37-hre-546-style-wheels-mst-832107fbk"
  },
  {
    brand: "MST",
    productName: "Black 5 Spokes - ADVAN GT Style - 5 Offset Rims (4-Pack) [MST] 832004BK",
    modelNumber: "832004BK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/black-5-spokes-advan-gt-style-5-offset-rims-4-pack-mst-832004bk"
  },
  {
    brand: "MST",
    productName: "BLACK CHROME TMB 5 Spokes - Rotiform Style - DEEP 8 Offset 1-10 Rims (4-Pack) [MST] 102045SBK",
    modelNumber: "102045SBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/black-chrome-tmb-5-spokes-rotiform-style-deep-8-offset-1-10-rims-4-pack-mst-102045sbk"
  },
  {
    brand: "MST",
    productName: "BLACK GTR (Split 5 Spoke) 9 Offset 1-10 Rims (4-Pack) [MST] 832068BK",
    modelNumber: "832068BK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/black-gtr-split-5-spoke-9-offset-1-10-rims-4-pack-mst-832068bk"
  },
  {
    brand: "MST",
    productName: "Chrome 5 Spokes - ADVAN GT Style - 11 Offset Rims (4-Pack) [MST] 102020S",
    modelNumber: "102020S",
    sourceUrl: "https://supergdrift.com/collections/rims/products/chrome-5-spokes-advan-gt-style-10-offset-rims-4-pack-mst-102020s"
  },
  {
    brand: "MST",
    productName: "Chrome 5 Spokes - ADVAN GT Style - 5 Offset Rims (4-Pack) [MST] 102018S",
    modelNumber: "102018S",
    sourceUrl: "https://supergdrift.com/collections/rims/products/chrome-5-spokes-advan-gt-style-5-offset-rims-4-pack-mst-102018s"
  },
  {
    brand: "MST",
    productName: "Chrome 5 Spokes - ADVAN GT Style - 8 Offset Rims (4-Pack) [MST] 102019S",
    modelNumber: "102019S",
    sourceUrl: "https://supergdrift.com/collections/rims/products/chrome-5-spokes-advan-gt-style-8-offset-rims-4-pack-mst-102019s"
  },
  {
    brand: "MST",
    productName: "CHROME FX Split 5 Spokes - Titan Style - Concave 8 Offset 1-10 Rims (4-Pack) [MST] 102049S",
    modelNumber: "102049S",
    sourceUrl: "https://supergdrift.com/collections/rims/products/chrome-split-5-spokes-titan-style-concave-8-offset-1-10-rims-4-pack-mst-102049s"
  },
  {
    brand: "MST",
    productName: "CHROME FX Split 5 Spokes - Titan Style - DEEP Concave 11 Offset 1-10 Rims (4-Pack) [MST] 102050S",
    modelNumber: "102050S",
    sourceUrl: "https://supergdrift.com/collections/rims/products/chrome-fx-split-5-spokes-titan-style-deep-concave-11-offset-1-10-rims-4-pack-mst-102050s"
  },
  {
    brand: "MST",
    productName: "CHROME GTR (Split 5 Spoke) 7 Offset 1-10 Rims (4-Pack) [MST] 102077S",
    modelNumber: "102077S",
    sourceUrl: "https://supergdrift.com/collections/rims/products/chrome-white-gtr-split-5-spoke-7-offset-1-10-rims-4-pack-mst-102077s"
  },
  {
    brand: "MST",
    productName: "Chrome GUNMETAL Smoked 5 Spokes - ADVAN GT Style - 8 Offset Rims (4-Pack) [MST] 102019SBK",
    modelNumber: "102019SBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/chrome-gunmetal-smoked-5-spokes-advan-gt-style-8-offset-rims-4-pack-mst-102019sbk"
  },
  {
    brand: "MST",
    productName: "CHROME RID Split 5 Spokes - DEEP CONCAVE BBS CI-R Style - 11 Offset Rims (4-Pack) [MST] 102058S",
    modelNumber: "102058S",
    sourceUrl: "https://supergdrift.com/collections/rims/products/chrome-rid-split-5-spokes-deep-concave-bbs-ci-r-style-11-offset-rims-4-pack-mst-102058s"
  },
  {
    brand: "MST",
    productName: "CHROME TMB 5 Spokes - Rotiform Style - 5 Offset 1-10 Rims (4-Pack) [MST] 102044S",
    modelNumber: "102044S",
    sourceUrl: "https://supergdrift.com/collections/rims/products/chrome-tmb-5-spokes-rotiform-style-5-offset-1-10-rims-4-pack-mst-102044s"
  },
  {
    brand: "MST",
    productName: "CHROME TMB 5 Spokes - Rotiform Style - DEEP 8 Offset 1-10 Rims (4-Pack) [MST] 102045S",
    modelNumber: "102045S",
    sourceUrl: "https://supergdrift.com/collections/rims/products/chrome-tmb-5-spokes-rotiform-style-deep-8-offset-1-10-rims-4-pack-mst-102045s"
  },
  {
    brand: "MST",
    productName: "Flat Silver FB 5 Spokes - 8 Offset 1-10 Rims (4-Pack) [MST] 832047FS",
    modelNumber: "832047FS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/flat-silver-fb-5-spokes-8-offset-rims-4-pack-mst-832047fs"
  },
  {
    brand: "MST",
    productName: "GLOSS WHITE GTR (Split 5 Spoke) 7 Offset 1-10 Rims (4-Pack) [MST] 832067W",
    modelNumber: "832067W",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gloss-white-gtr-split-5-spoke-7-offset-1-10-rims-4-pack-mst-832067w-1"
  },
  {
    brand: "MST",
    productName: "Gold FB 5 Spokes - 8 Offset 1-10 Rims (4-Pack) [MST] 832047GD",
    modelNumber: "832047GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gold-fb-5-spokes-8-offset-1-10-rims-4-pack-mst-832047gd"
  },
  {
    brand: "MST",
    productName: "GOLD FX Split 5 Spokes - Titan Style - Concave 8 Offset 1-10 Rims (4-Pack) [MST] 102049GD",
    modelNumber: "102049GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gold-split-5-spokes-titan-style-8-offset-1-10-rims-4-pack-mst-102049gd"
  },
  {
    brand: "MST",
    productName: "GOLD GTR (Split 5 Spoke) 9 Offset 1-10 Rims (4-Pack) [MST] 832068GD",
    modelNumber: "832068GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gold-gtr-split-5-spoke-9-offset-1-10-rims-4-pack-mst-832068gd"
  },
  {
    brand: "MST",
    productName: "GOLD RS II - ADVAN STYLE (Multi Spoke) 9 Offset 1-10 Rims (4-Pack) [MST] 102070GD",
    modelNumber: "102070GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gold-rs-ii-advan-style-multi-spoke-9-offset-1-10-rims-4-pack-mst-102070gd"
  },
  {
    brand: "MST",
    productName: "Green High Traction 5mm 7mm 1-10 TE37 Style Wheels [MST] 832302G 832301G",
    modelNumber: "832301G / 832302G",
    sourceUrl: "https://supergdrift.com/collections/rims/products/green-high-traction-5mm-7mm-1-10-te37-style-wheels-mst-832302g-832301g"
  },
  {
    brand: "MST",
    productName: "GT 5 SPOKE (BLACK FACE) Adjustable Offset Rims (4-Pack) [MST] 832110FBK",
    modelNumber: "832110FBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gt-5-spoke-black-face-adjustable-offset-rims-4-pack-mst-832110fbk"
  },
  {
    brand: "MST",
    productName: "GT 5 SPOKE (FLAT BLACK / CHROME) Adjustable Offset Rims (4-Pack) [MST] 832109FBK",
    modelNumber: "832109FBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gt-5-spoke-flat-black-chrome-adjustable-offset-rims-4-pack-mst-832109fbk"
  },
  {
    brand: "MST",
    productName: "GT 5 SPOKE (Matte Silver) Adjustable Offset Rims (4-Pack) 1-10 Advan TC5 Style Wheels [MST] 832110FS",
    modelNumber: "832110FS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gt-5-spoke-matte-silver-adjustable-offset-rims-4-pack-mst-832110fs"
  },
  {
    brand: "MST",
    productName: "GT 5 SPOKE (SILVER) Adjustable Offset Rims (4-Pack) [MST] 832109FS",
    modelNumber: "832109FS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gt-5-spoke-silver-adjustable-offset-rims-4-pack-mst-832109fs"
  },
  {
    brand: "MST",
    productName: "GT 5 SPOKE (SMOKE CHROME) Adjustable Offset Rims (4-Pack) [MST] 832109SBK",
    modelNumber: "832109SBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gt-5-spoke-smoke-chrome-adjustable-offset-rims-4-pack-mst-832109sbk"
  },
  {
    brand: "MST",
    productName: "GT 5 SPOKE (SMOKE CHROME) Adjustable Offset Rims (4-Pack) [MST] 832110SBK",
    modelNumber: "832110SBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gt-5-spoke-black-face-adjustable-offset-rims-4-pack-mst-832110sbk"
  },
  {
    brand: "MST",
    productName: "GT 5 SPOKE (WHITE -  WHITE) Adjustable Offset Rims (4-Pack) [MST] 832109W",
    modelNumber: "832109W",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gt-5-spoke-white-white-adjustable-offset-rims-4-pack-mst-832109w"
  },
  {
    brand: "MST",
    productName: "Gun Metal Grey High Traction 5mm 7mm 1-10 TE37 Style Wheels [MST] 832302GR 832301GR",
    modelNumber: "832301GR / 832302GR",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gun-metal-grey-high-traction-5mm-7mm-1-10-te37-style-wheels-mst-832302gr-832301gr"
  },
  {
    brand: "MST",
    productName: "Hot Pink High Traction 5mm 7mm 1-10 TE37 Style Wheels [MST] 832302HP 832301HP",
    modelNumber: "832301HP / 832302HP",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hot-pink-high-traction-5mm-7mm-1-10-te37-style-wheels-mst-832302hp-832301hp"
  },
  {
    brand: "MST",
    productName: "LM Mesh (BLACK - CHROME)BBS Style Adjustable Offset 1-10 Rims (4-Pack) [MST] 832101FBK",
    modelNumber: "832101FBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lm-mesh-black-chrome-adjustable-offset-rims-4-pack-mst-832101fbk"
  },
  {
    brand: "MST",
    productName: "LM Mesh (BLACK - SILVER) Adjustable Offset Rims (4-Pack) BBS Style [MST] 832102FBK",
    modelNumber: "832102FBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lm-mesh-black-silver-adjustable-offset-rims-4-pack-mst-832102fbk"
  },
  {
    brand: "MST",
    productName: "LM Mesh (Chrome - Gold) BBS Style Adjustable Offset 1-10 Rims (4-Pack) [MST] 832101GD",
    modelNumber: "832101GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lm-mesh-chrome-gold-adjustable-offset-rims-4-pack-mst-832101gd"
  },
  {
    brand: "MST",
    productName: "LM Mesh (GLOSS BLACK) Adjustable Offset Rims 1-10 BBS Style [MST] 832101BK",
    modelNumber: "832101BK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lm-mesh-gloss-black-adjustable-offset-rims-1-10-bbs-style-mst-832101bk"
  },
  {
    brand: "MST",
    productName: "LM Mesh (Gun Metal Metallic) BBS Style Adjustable Offset 1-10 Rims (4-Pack) [MST] 832102SBK",
    modelNumber: "832102SBK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lm-mesh-gun-metal-metallic-adjustable-offset-rims-mst-832102sbk"
  },
  {
    brand: "MST",
    productName: "LM Mesh (SILVER - Gold) BBS Style Adjustable Offset 1-10 Rims (4-Pack) [MST] 832102GD",
    modelNumber: "832102GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lm-mesh-silver-gold-adjustable-offset-rims-4-pack-mst-832102gd"
  },
  {
    brand: "MST",
    productName: "LM Mesh (Silver - Silver) BBS Style Adjustable Offset 1-10 Rims (4-Pack) [MST] 832102FS",
    modelNumber: "832102FS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lm-mesh-silver-silver-adjustable-offset-rims-mst-832102fs"
  },
  {
    brand: "MST",
    productName: "Silver 5 Spokes - ADVAN GT Style - 5 Offset Rims (4-Pack) [MST] 832004FS",
    modelNumber: "832004FS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/silver-5-spokes-advan-gt-style-5-offset-rims-4-pack-mst-832004fs"
  },
  {
    brand: "MST",
    productName: "Silver 5 Spokes - ADVAN GT Style - 8 Offset Rims (4-Pack) [MST] 832005FS",
    modelNumber: "832005FS (102091S)",
    sourceUrl: "https://supergdrift.com/collections/rims/products/silver-5-spokes-advan-gt-style-8-offset-rims-4-pack-mst-832005fs"
  },
  {
    brand: "MST",
    productName: "Silver 5 Spokes - ADVAN GT Style DEEP - 11 Offset Rims (4-Pack) [MST] 102020FS",
    modelNumber: "102020FS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/silver-5-spokes-advan-gt-style-deep-11-offset-rims-4-pack-mst-102020fs"
  },
  {
    brand: "MST",
    productName: "SSR Professor SP1 (GOLD) 1-10 Rims (4-Pack) [MST] +5 +7 +9 Offsets",
    modelNumber: "102064GD / 102065GD / 832052GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-professor-sp1-gold-1-10-rims-4-pack-mst-5-7-9-offsets"
  },
  {
    brand: "MST",
    productName: "TSP Gold (57 extreme) 7 Offset Rims (4-Pack) [MST] 832064GD",
    modelNumber: "832064GD",
    sourceUrl: "https://supergdrift.com/collections/rims/products/tsp-gold-57-extreme-7-offset-rims-4-pack-mst-832064gd"
  },
  {
    brand: "MST",
    productName: "White High Traction 5mm 7mm 1-10 TE37 Style Wheels [MST] 832302W 832301W",
    modelNumber: "832301W / 832302W",
    sourceUrl: "https://supergdrift.com/collections/rims/products/white-high-traction-5mm-7mm-1-10-te37-style-wheels-mst-832302w-832301w"
  },
  {
    brand: "Overdose",
    productName: "*WIDE* 30mm R-Spec Gokutan VALINO GV117D (9 offset - FLO GREEN) (2 PACK) 1/10 Rims Wheel [Buzz Break x Overdose] BB-RW-008",
    modelNumber: "BB-RW-008",
    sourceUrl: "https://supergdrift.com/collections/rims/products/wide-30mm-r-spec-gokutan-valino-gv117d-26mm-9-offset-flo-green-2-pack-1-10-rims-wheel-buzz-break-x-overdose-bb-rw-008"
  },
  {
    brand: "Overdose",
    productName: "*WIDE* 30mm R-Spec Gokutan VALINO GV117D (9 offset - FLO PINK) (2 PACK) 1/10 Rims Wheel [Buzz Break x Overdose] BB-RW-010",
    modelNumber: "BB-RW-010",
    sourceUrl: "https://supergdrift.com/collections/rims/products/wide-30mm-r-spec-gokutan-valino-gv117d-9-offset-flo-pink-2-pack-1-10-rims-wheel-buzz-break-x-overdose-bb-rw-010"
  },
  {
    brand: "Overdose",
    productName: "*WIDE* WORK EMOTION ZR7 30mm WIDE (9offset - BLACK) (2 PACK) 1/10 Rims Wheel [Buzz Break x Overdose] BB-RW-037",
    modelNumber: "BB-RW-037",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-zr7-30mm-wide-9offset-black-2-pack-1-10-rims-wheel-buzz-break-x-overdose-bb-rw-037"
  },
  {
    brand: "Overdose",
    productName: "*WIDE* WORK EMOTION ZR7 30mm WIDE (9offset - WHITE) (2 PACK) 1/10 Rims Wheel [Buzz Break x Overdose] BB-RW-035",
    modelNumber: "BB-RW-035",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-zr7-30mm-wide-9offset-white-2-pack-1-10-rims-wheel-buzz-break-x-overdose-bb-rw-035"
  },
  {
    brand: "Overdose",
    productName: "Buzz Break Valino N820S - PINK 7mm 1/10 Wheel Rims [Overdose] BB-RW-015",
    modelNumber: "BB-RW-015",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n820s-pink-7mm-1-10-wheel-rims-overdose-bb-rw-015"
  },
  {
    brand: "Overdose",
    productName: "Buzz Break Valino N820S - PURPLE 7mm 1/10 Wheel Rims [Overdose] BB-RW-016",
    modelNumber: "BB-RW-016",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n820s-r-spec-purple-7mm-1-10-wheel-rims-overdose-bb-rw-016"
  },
  {
    brand: "Overdose",
    productName: "BuzzBreak Cut-out letter rim sticker (Die-Cut) Decals for Wheels [Overdose] BB-ST-006",
    modelNumber: "BB-ST-006",
    sourceUrl: "https://supergdrift.com/collections/rims/products/buzzbreak-cut-out-letter-rim-sticker-die-cut-decals-for-wheels-overdose-bb-st-006",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Wheel decal/sticker accessory, not a standalone wheel."
  },
  {
    brand: "Overdose",
    productName: "BuzzBreak GRAFFITI TYPE Cut-out letter rim sticker (Die-Cut) Decals for Wheels [Overdose] BB-ST-010",
    modelNumber: "BB-ST-010",
    sourceUrl: "https://supergdrift.com/collections/rims/products/buzzbreak-graffiti-type-cut-out-letter-rim-sticker-die-cut-decals-for-wheels-overdose-bb-st-010",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Wheel decal/sticker accessory, not a standalone wheel."
  },
  {
    brand: "Overdose",
    productName: "BuzzBreak N560S Wheel R-SPEC 30mm (9 offset - BLACK) *wide* (2 PACK) [Overdose] BB-RW-032",
    modelNumber: "BB-RW-032",
    sourceUrl: "https://supergdrift.com/collections/rims/products/buzzbreak-n560s-wheel-r-spec-30mm-9-offset-black-wide-2-pack-overdose-bb-rw-032"
  },
  {
    brand: "Overdose",
    productName: "BuzzBreak N560S Wheel R-SPEC 30mm (9 offset - WHITE) *wide* (2 PACK) [Overdose] BB-RW-030",
    modelNumber: "BB-RW-030",
    sourceUrl: "https://supergdrift.com/collections/rims/products/buzzbreak-n560s-wheel-r-spec-30mm-9-offset-white-wide-2-pack-overdose-bb-rw-030"
  },
  {
    brand: "Overdose",
    productName: "BuzzBreak N820S Wheel R-SPEC 30mm (9 offset - BLACK) *wide* (2 PACK) [Overdose] BB-RW-026",
    modelNumber: "BB-RW-026",
    sourceUrl: "https://supergdrift.com/collections/rims/products/buzzbreak-n820s-wheel-r-spec-30mm-9-offset-black-wide-2-pack-overdose-bb-rw-026"
  },
  {
    brand: "Overdose",
    productName: "BuzzBreak N820S Wheel R-SPEC 30mm (9 offset - WHITE) *wide* (2 PACK) [Overdose] BB-RW-024",
    modelNumber: "BB-RW-024",
    sourceUrl: "https://supergdrift.com/collections/rims/products/buzzbreak-n820s-wheel-r-spec-30mm-9-offset-white-wide-2-pack-overdose-bb-rw-024"
  },
  {
    brand: "Overdose",
    productName: "BuzzBreak OVERDOSE TYPE Cut-out letter rim sticker (Die-Cut) Decals for Wheels [Overdose] BB-ST-008",
    modelNumber: "BB-ST-008",
    sourceUrl: "https://supergdrift.com/collections/rims/products/buzzbreak-overdose-type-cut-out-letter-rim-sticker-die-cut-decals-for-wheels-overdose-bb-st-008",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Wheel decal/sticker accessory, not a standalone wheel."
  },
  {
    brand: "Overdose",
    productName: "CHROME Buzz Break Valino N820S - PINK - PURPLE - GOLD - RED - SILVER 7mm 1/10 Wheel Rims [Overdose]",
    modelNumber: "BB-RW-017 / BB-RW-019 / BB-RW-021 / BB-RW-018 / BB-RW-020",
    sourceUrl: "https://supergdrift.com/collections/rims/products/chrome-buzz-break-valino-n820s-pink-purple-gold-red-7mm-1-10-wheel-rims-overdose"
  },
  {
    brand: "Overdose",
    productName: "N560 ABS - BLACK 7mm 1/10 Wheel Rims [Overdose] BB-RW-031",
    modelNumber: "BB-RW-031",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n560-abs-black-7mm-1-10-wheel-rims-overdose-bb-rw-031"
  },
  {
    brand: "Overdose",
    productName: "N560 ABS - WHITE 7mm 1/10 Wheel Rims [Overdose] BB-RW-029",
    modelNumber: "BB-RW-029",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n560-abs-white-7mm-1-10-wheel-rims-overdose-bb-rw-029"
  },
  {
    brand: "Overdose",
    productName: "N820S R-Spec - BLACK 7mm 1/10 Wheel Rims [Overdose] BB-RW-025",
    modelNumber: "BB-RW-025",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n820s-r-spec-black-7mm-1-10-wheel-rims-overdose-bb-rw-025"
  },
  {
    brand: "Overdose",
    productName: "N820S R-Spec - LIME GREEN 7mm 1/10 Wheel Rims [Overdose] BB-RW-001",
    modelNumber: "BB-RW-001",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n820s-r-spec-lime-green-7mm-1-10-wheel-rims-overdose-bb-rw-001"
  },
  {
    brand: "Overdose",
    productName: "N820S R-Spec - WHITE 7mm 1/10 Wheel Rims [Overdose] BB-RW-023",
    modelNumber: "BB-RW-023",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n820s-r-spec-white-7mm-1-10-wheel-rims-overdose-bb-rw-023"
  },
  {
    brand: "Overdose",
    productName: "PREORDER: 326Power Yaba KING MESH - High Chrome - 7mm - 10mm - 1-10 Rims [Overdose] OD2027c OD2029c",
    modelNumber: "PREORDER: OD2027c / PREORDER: OD2029c",
    sourceUrl: "https://supergdrift.com/collections/rims/products/yaba-king-mesh-chrome-7mm-10mm-rims-overdose-od2027c-od2029c"
  },
  {
    brand: "Overdose",
    productName: "PREORDER: 326Power Yaba KING MESH - Matte Chrome - 7mm - 10mm - 1-10 Rims [Overdose] OD2028c OD2026c",
    modelNumber: "PREORDER: OD2026c / PREORDER: OD2028c",
    sourceUrl: "https://supergdrift.com/collections/rims/products/yaba-king-mesh-matte-chrome-7mm-10mm-rims-overdose-od2028c-od2026c"
  },
  {
    brand: "Overdose",
    productName: "R-Spec Gokutan VALINO GV117D 26mm (7 offset - FLO GREEN) (2 PACK) 1/10 Rims Wheel [Buzz Break x Overdose] BB-RW-007",
    modelNumber: "BB-RW-007",
    sourceUrl: "https://supergdrift.com/collections/rims/products/r-spec-valino-gv117d-26mm-7-offset-flo-green-2-pack-1-10-rims-wheel-buzz-break-x-overdose-bb-rw-007"
  },
  {
    brand: "Overdose",
    productName: "R-Spec Gokutan VALINO GV117D 26mm (7 offset - FLO PINK) (2 PACK) 1/10 Rims Wheel [Buzz Break x Overdose] BB-RW-009",
    modelNumber: "BB-RW-009",
    sourceUrl: "https://supergdrift.com/collections/rims/products/r-spec-gokutan-valino-gv117d-26mm-7-offset-flo-pink-2-pack-1-10-rims-wheel-buzz-break-x-overdose-bb-rw-009"
  },
  {
    brand: "Overdose",
    productName: "R-Spec Gokutan VALINO GV117D 26mm (7 offset - LIME YELLOW) (2 PACK) 1/10 Rims Wheel [Buzz Break x Overdose] BB-RW-027",
    modelNumber: "BB-RW-027",
    sourceUrl: "https://supergdrift.com/collections/rims/products/r-spec-gokutan-valino-gv117d-26mm-7-offset-lime-yellow-2-pack-1-10-rims-wheel-buzz-break-x-overdose-bb-rw-027"
  },
  {
    brand: "Overdose",
    productName: "R-SPEC VALINO GV117D 26mm (7 offset - BLACK) (2 PACK) 1/10 Rims Wheel [Buzz Break x Overdose] BB-RW-005",
    modelNumber: "BB-RW-005",
    sourceUrl: "https://supergdrift.com/collections/rims/products/valino-gv117d-26mm-7-offset-black-2-pack-1-10-rims-wheel-buzz-break-x-overdose-bb-rw-005"
  },
  {
    brand: "Overdose",
    productName: "R-Spec VALINO GV117D 26mm (7 offset - WHITE) (2 PACK) 1/10 Rims Wheel [Buzz Break x Overdose] BB-RW-003",
    modelNumber: "BB-RW-003",
    sourceUrl: "https://supergdrift.com/collections/rims/products/valino-gv117d-26mm-7-offset-white-2-pack-1-10-rims-wheel-buzz-break-x-overdose-bb-rw-003"
  },
  {
    brand: "Overdose",
    productName: "R-SPEC Work CR KAI WHITE Rims 9mm *WIDE* [Overdose] OD2778",
    modelNumber: "OD2778",
    sourceUrl: "https://supergdrift.com/collections/rims/products/r-spec-work-cr-kai-white-rims-9mm-wide-overdose-od2778"
  },
  {
    brand: "Overdose",
    productName: "R-SPEC Work Emotion T7R WHITE Rims 9mm *WIDE* [Overdose] OD2781",
    modelNumber: "OD2781",
    sourceUrl: "https://supergdrift.com/collections/rims/products/r-spec-work-emotion-t7r-white-rims-9mm-wide-overdose-od2781"
  },
  {
    brand: "Overdose",
    productName: "RAYS Gramlight 57Transcend 5mm - 7mm Rims (WHITE) [Overdose] OD2875 OD2876 57 Gram Light Transcend",
    modelNumber: "OD2876 (7mm) / OD2875 (5mm)",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rays-gramlight-57transcend-5mm-7mm-rims-white-overdose-od2875-od2876-57-gram-light-transcend"
  },
  {
    brand: "Overdose",
    productName: "VALINO GV330 26mm (7 offset - WHITE) (2 PACK) 1/10 Rims Wheel [Overdose] OD2773",
    modelNumber: "OD2773",
    sourceUrl: "https://supergdrift.com/collections/rims/products/valino-gv330-26mm-7-offset-white-2-pack-overdose-od2773"
  },
  {
    brand: "Overdose",
    productName: "VALINO N820S Aluminum Wheel 26mm (OFF+7) 1-10 Drift Rim - Pink Silver Purple Red Gold Black [Overdose] BB-RW-011 BB-RW-012 BB-RW-013",
    modelNumber: "BB-RW-011 / BB-RW-012 / BB-RW-013 / BB-RW-014 / BB-RW-022 / BB-RW-033",
    sourceUrl: "https://supergdrift.com/collections/rims/products/valino-n820s-aluminium-wheel-26mm-silver-off-7-1-10-drift-rim-overdose-bb-rw-012"
  },
  {
    brand: "Overdose",
    productName: "VALINO N820S UL-Spec (Ultra Light Weight) Aluminum Wheel 26mm (OFF+7) 1-10 Drift Rim - Pink Silver Purple Red Gold Black [Overdose] BB-RW-038 BB-RW-039 BB-RW-040 BB-RW-041",
    modelNumber: "BB-RW-038 / BB-RW-039 / BB-RW-040 / BB-RW-041",
    sourceUrl: "https://supergdrift.com/collections/rims/products/valino-n820s-ul-spec-ultra-light-weight-aluminum-wheel-26mm-off-7-1-10-drift-rim-pink-silver-purple-red-gold-black-overdose-bb-rw-038-bb-rw-039-bb-rw-040-bb-rw-041"
  },
  {
    brand: "Overdose",
    productName: "Work CR KAI EMOTION LIME GREEN 7mm Wheels Rims [Overdose] OD2946",
    modelNumber: "OD2946",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-cr-kai-emotion-lime-green-7mm-overdose-od2946"
  },
  {
    brand: "Overdose",
    productName: "Work CR KAI R-SPEC 7mm 26mm RIMS Rims PINK YELLOW GREEN [Overdose] OD2935 OD2934 OD2933",
    modelNumber: "OD2935 / OD2934 / OD2933",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-cr-kai-r-spec-7mm-26mm-rims-rims-pink-yellow-green-overdose-od2935-od2934-od2933"
  },
  {
    brand: "Overdose",
    productName: "Work Emotion R-SPEC T7R 7mm (WHITE) Wheels Rims [Overdose] OD2678B",
    modelNumber: "OD2678B",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-r-spec-t7r-7mm-white-overdose-od2678"
  },
  {
    brand: "Overdose",
    productName: "WORK EMOTION ZR7 26mm (7 offset - BLACK) (2 PACK) 1/10 Rims Wheel [Buzz Break x Overdose] BB-RW-036",
    modelNumber: "BB-RW-036",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-zr7-26mm-7-offset-black-2-pack-1-10-rims-wheel-buzz-break-x-overdose-bb-rw-036"
  },
  {
    brand: "Overdose",
    productName: "WORK EMOTION ZR7 26mm (7 offset - WHITE) (2 PACK) 1/10 Rims Wheel [Buzz Break x Overdose] BB-RW-034",
    modelNumber: "BB-RW-034",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-zr7-26mm-7-offset-white-2-pack-1-10-rims-wheel-buzz-break-x-overdose-bb-rw-034"
  },
  {
    brand: "Overdose",
    productName: "Work VS-KF (Black Metal Chrome) 5mm - 7mm 1/10 WHEELS Rims [Overdose] OD2726B OD2728B VSKF",
    modelNumber: "OD2728B / OD2726B",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-vs-kf-black-metal-chrome-5mm-7mm-rims-overdose-od2726b-od2728b-vskf"
  },
  {
    brand: "Overdose",
    productName: "Work VS-KF (BLACK) R-SPEC Rims (HIGH TRACTION) 5mm - 7mm / 9mm WIDE  [Overdose] OD2570 OD2571 VSKF",
    modelNumber: "OD2765 / OD2764 / OD2820",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-vs-kf-black-r-spec-rims-high-traction-5mm-7mm-overdose-od2570-od2571-vskf"
  },
  {
    brand: "Overdose",
    productName: "Work VS-KF (Chrome) 5mm - 7mm Rims [Overdose] OD1184 OD1186 VSKF",
    modelNumber: "OD1186b / OD1184b",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-vs-kf-chrome-5mm-7mm-rims-overdose-od1184-od1186-vskf"
  },
  {
    brand: "Overdose",
    productName: "Work VS-KF (MATTE Black Metal) Rims 5mm - 7mm [Overdose] OD2725b OD2727b VSKF",
    modelNumber: "OD2727B / OD2725b",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-vs-kf-matte-black-metal-rims-5mm-7mm-overdose-od2725-od2727-vskf"
  },
  {
    brand: "Overdose",
    productName: "Work VS-KF (Matte Chrome) 5mm - 7mm Rims [Overdose] OD1185b OD1183b VSKF",
    modelNumber: "OD1185b / OD1183a",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-vs-kf-matte-chrome-5mm-7mm-rims-overdose-od1185a-od1183a-vskf"
  },
  {
    brand: "Overdose",
    productName: "Yokohama AVS VS6  Chrome 5mm - 7mm 1-10 RC RIMS [Mikuni] DW-727PS DW-725PS",
    modelNumber: "DW-725PS / DW-727PS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/yokohama-avs-vs6-chrome-7mm-1-10-rc-rims-mikuni-dw-727ps"
  },
  {
    brand: "Pandora",
    productName: "DISPLAY RIM RWB M-1 MESH  - 26mm WHEEL - 8mm - 16mm OFFSET [Pandora RC] PAB-533 PAB-532",
    modelNumber: "PAC-532 / PAC-533",
    sourceUrl: "https://supergdrift.com/collections/rims/products/display-rim-rwb-m-1-mesh-26mm-wheel-8mm-16mm-offset-pandora-rc-pab-533-pab-532"
  },
  {
    brand: "Pandora",
    productName: "DISPLAY RIM RWB-S1 5 SPOKE - 26mm WHEEL - 8mm - 16mm OFFSET [Pandora RC] PAC-531 PAC-530",
    modelNumber: "PAC-531 / PAC-530",
    sourceUrl: "https://supergdrift.com/collections/rims/products/display-rim-rwb-s1-5-spoke-26mm-wheel-8mm-16mm-offset-pandora-rc-pac-531-pac-530"
  },
  {
    brand: "Pandora",
    productName: "DISPLAY SMALLER DIAMETER RIM R32 GTR  SKYLINE GT-R - 26mm WHEEL (inch down) [Pandora RC] PAC-542",
    modelNumber: "PAC-542",
    sourceUrl: "https://supergdrift.com/collections/rims/products/display-smaller-diameter-rim-r32-gtr-skyline-gt-r-26mm-wheel-inch-down-pandora-rc-pac-542"
  },
  {
    brand: "Pandora",
    productName: "DISPLAY SMALLER DIAMETER RIM ZERO4 4 SPOKE - 26mm WHEEL (inch down) [Pandora RC] PAC-543",
    modelNumber: "PAC-543",
    sourceUrl: "https://supergdrift.com/collections/rims/products/display-smaller-diameter-rim-zero4-4-spoke-26mm-wheel-inch-down-pandora-rc-pac-543"
  },
  {
    brand: "Pandora",
    productName: "DISPLAY SMALLER DIAMETER RIM-TIRE GLOWSTAR - STAR ROAD MESH - 30 WHEEL (inch down) [Pandora RC] PAC-544",
    modelNumber: "PAC-544",
    sourceUrl: "https://supergdrift.com/collections/rims/products/display-smaller-diameter-rim-tire-glowstar-star-road-mesh-30-wheel-inch-down-pandora-rc-pac-544",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Rim/tire display bundle, not a standalone wheel choice."
  },
  {
    brand: "RC-Art",
    productName: "HIGH TRACTION WHITE SSR PROFESSOR SPX 6mm - 8mm 1/10 WHEELS RIMS [RC Art] WW-0506HWH WW-0508HWH",
    modelNumber: "WW-0506HWH / WW-0508HWH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/high-traction-white-ssr-professor-spx-6mm-8mm-1-10-wheels-rims-rc-art-ww-0506hwh-ww-0508hwh"
  },
  {
    brand: "RC-Art",
    productName: "HIGH TRACTION WHITE SSR REINER 6mm - 8mm 1/10 WHEELS RIMS [RC Art] WW-0706HWH WW-0708HWH",
    modelNumber: "WW-0706HWH / WW-0708HWH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/high-traction-white-ssr-reiner-6mm-8mm-1-10-wheels-rims-rc-art-ww-0706hwh-ww-0708hwh"
  },
  {
    brand: "RC-Art",
    productName: "MATTE SILVER SSR PROFESSOR SPX 6mm - 8mm 1/10 WHEELS RIMS [RC Art] WW-0506MS WW-0508MS",
    modelNumber: "WW-0506MS / WW-0508MS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/matte-silver-ssr-professor-spx-6mm-8mm-rc-art-ww-0506ms-ww-0508ms"
  },
  {
    brand: "RC-Art",
    productName: "SSR AERO SPOKE BLACK 6mm - 8mm RIMS [RC Art] WW-0606BK WW-0608BK",
    modelNumber: "WW-0606BK / WW-0608BK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-aero-spoke-black-6mm-8mm-rims-rc-art-ww-0206bk-ww-0208bk"
  },
  {
    brand: "RC-Art",
    productName: "SSR AERO SPOKE CHROME SILVER 1-10 RIMS 6mm - 8mm [RC-Art] WW-0606CS WW-0608CS (Copy)",
    modelNumber: "WW-0606CS / WW-0608CS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-aero-spoke-chrome-silver-1-10-rims-6mm-8mm-rc-art-ww-0606cs-ww-0608cs-copy"
  },
  {
    brand: "RC-Art",
    productName: "SSR AERO SPOKE CHROME SILVER RIMS 6mm - 8mm [RC-Art] WW-0206CS WW-0208CS",
    modelNumber: "WW-0206CS / WW-0208CS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-aero-spoke-chrome-silver-rims-6mm-8mm-topline-rc-ww-0206cs-ww-0208cs"
  },
  {
    brand: "RC-Art",
    productName: "SSR AERO SPOKE WHITE 1-10 RIMS 6mm - 8mm [RC-Art] WW-0606WH WW-0608WH",
    modelNumber: "WW-0606WH / WW-0608WH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-aero-spoke-white-rims-6mm-8mm-rc-art-ww-0206wh-ww-0208wh"
  },
  {
    brand: "RC-Art",
    productName: "SSR Formula Mesh 19 Rims +8mm - +6mm (GUN METALLIC) [RC-Art] ART4708GM ART4706GM",
    modelNumber: "ART4706GM / ART4708GM",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-formula-mesh-19-rims-8mm-6mm-gun-metallic-rc-art-art4708gm-art4706gm"
  },
  {
    brand: "RC-Art",
    productName: "SSR Formula Mesh 19 SILVER 6mm Offset (2 RIMS) [RC ART] ART4706MS",
    modelNumber: "ART4706MS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-formula-mesh-19-silver-6mm-offset-2-rims-rc-art-art4706ms"
  },
  {
    brand: "RC-Art",
    productName: "SSR Formula Mesh Rims +8mm - +6mm (Gold w- Chrome Lip) [RC-Art] ART4708G ART4706G",
    modelNumber: "ART4706G / ART4708G",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-formula-mesh-rims-8mm-6mm-gold-w-chrome-lip-rc-art-art4708g-art4706g"
  },
  {
    brand: "RC-Art",
    productName: "SSR GT F01 GUN METAL 8mm / 8mm Offset (2 RIMS) 1/10 WHEELS [RC ART] ART5006GM ART5008GM",
    modelNumber: "ART5006GM / ART5008GM",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-gtf01-gun-metal-6mm-offset-high-traction-2-rims-rc-art-art5006gm-art5008gm"
  },
  {
    brand: "RC-Art",
    productName: "SSR GT X01 BLACK BLACK 6mm / 8mm Offset (2 RIMS) 1/10 WHEELS [RC ART] WW-0906FB WW-0908FB",
    modelNumber: "WW-0906FB / WW-0908FB",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-gt-x01-black-black-6mm-8mm-offset-2-rims-1-10-wheels-rc-art-ww-0906fb-ww-0908fb"
  },
  {
    brand: "RC-Art",
    productName: "SSR GTX01 BRONZE RIMS 6mm - 8mm HIGH TRACTION [RC-Art] WW-0906HBR WW-0908HBR",
    modelNumber: "WW-0906HBR / WW-0908HBR",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-gtx01-bronze-rims-6mm-8mm-high-traction-rc-art-ww-0906hbr-ww-0908hbr"
  },
  {
    brand: "RC-Art",
    productName: "SSR GTX01 DARK SILVER RIMS 6mm 8mm [RC-Art] ART5106DS ART5108DS",
    modelNumber: "ART5106DS / ART5108DS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-gtx01-dark-silver-rims-6mm-rc-art-art5106ds"
  },
  {
    brand: "RC-Art",
    productName: "SSR GTX01 WHITE RIMS 6mm - 8mm HIGH TRACTION [RC-Art] WW-0906HWH WW-0908HWH",
    modelNumber: "WW-0906HWH / WW-0908HWH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-gtx01-white-rims-6mm-8mm-high-traction-rc-art-ww-0906hwh-ww-0908hwh"
  },
  {
    brand: "RC-Art",
    productName: "SSR Longchamp XR-4 Fifteen Series - Gun Metal 6mm / 8mm (2 PACK) (INCH DOWN) 1-10 Rims [RC-Art] ARTW0206MG ARTW0208MG",
    modelNumber: "ARTW0206MG / ARTW0208MG",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-longchamp-xr-4-fifteen-series-gun-metal-6mm-8mm-2-pack-inch-down-1-10-rims-rc-art-artw0206mg-artw0208mg"
  },
  {
    brand: "RC-Art",
    productName: "SSR Longchamp XR-4 Fifteen Series - Silver 6mm / 8mm (2 PACK) (INCH DOWN) 1-10 Rims [RC-Art] ARTW0206MS ARTW0208MS",
    modelNumber: "ARTW0206MS / ARTW0208MS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/longchamp-fifteen-series-silver-6mm-8mm-2-pack-inch-down-rc-art-artw0206ms-artw0208ms"
  },
  {
    brand: "RC-Art",
    productName: "SSR REINER type10S 1-10 BLACK RC DRIFT RIMS SPEED STAR RACING Type-10S [RC-ART] WW-0706BK WW-0708BK",
    modelNumber: "WW-0706BK / WW-0708BK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-reiner-type10s-1-10-black-rc-drift-rims-speed-star-racing-type-10s-rc-art-ww-0706bk-ww-0708bk"
  },
  {
    brand: "RC-Art",
    productName: "SSR REINER type10S 1-10 WHITE RC DRIFT RIMS SPEED STAR RACING Type-10S [RC-ART] WW-0706WH  WW-0308WH",
    modelNumber: "WW-0706WH / WW-0308WH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-reiner-type10s-1-10-white-rc-drift-rims-speed-star-racing-type-10s-rc-art-ww-0306wh-ww-0308wh"
  },
  {
    brand: "RC-Art",
    productName: "Watanabe Fifteen Series - Gold 6mm / 8mm (2 PACK) (INCH DOWN) 1-10 Rims [RC-Art] ARTW0106G ARTW0108G",
    modelNumber: "ARTW0106G / ARTW0108G",
    sourceUrl: "https://supergdrift.com/collections/rims/products/watanabe-fifteen-series-gold-6mm-8mm-2-pack-inch-down-1-10-rims-rc-art-artw0106g-artw0108g"
  },
  {
    brand: "RC-Art",
    productName: "Watanabe Fifteen Series - Matte Gun Metallic 6mm / 8mm (2 PACK) (INCH DOWN) 1-10 Rims [RC-Art] ARTW0106MG ARTW0108MG",
    modelNumber: "ARTW0106MG / ARTW0108MG",
    sourceUrl: "https://supergdrift.com/collections/rims/products/watanabe-fifteen-series-matte-gun-metallic-6mm-8mm-2-pack-inch-down-1-10-rims-rc-art-artw0106mg-artw0108mg"
  },
  {
    brand: "RC-Art",
    productName: "Watanabe Fifteen Series - Silver 6mm / 8mm (2 PACK) (INCH DOWN) 1-10 Rims [RC-Art] ARTW0106MS ARTW0108MS",
    modelNumber: "ARTW0106MS / ARTW0108MS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/watanabe-fifteen-series-silver-6mm-8mm-2-pack-inch-down-rc-art-artw0106ms-artw0108ms"
  },
  {
    brand: "Reve D",
    productName: "Aluminum Brake Disc Type Front Axle Type R for RDX (4.5mm, 2 pieces) Wheel Hub [Reve D] D1-010FDR",
    modelNumber: "D1-010FDR",
    sourceUrl: "https://supergdrift.com/collections/reve-d/products/aluminum-brake-disc-type-front-axle-type-r-for-rdx-4-5mm-2-pieces-wheel-hub-reve-d-d1-010fdr",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Wheel hub/axle accessory, not a standalone wheel."
  },
  {
    brand: "Reve D",
    productName: "Aluminum Brake Disc Type Rear Wheel Hub Type R for RDX (5.5mm, 2 pieces) [Reve D] D1-011RDR",
    modelNumber: "D1-011RDR",
    sourceUrl: "https://supergdrift.com/collections/reve-d/products/aluminum-brake-disc-type-rear-wheel-hub-type-r-for-rdx-5-5mm-2-pieces-reve-d-d1-010rdr",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Wheel hub/axle accessory, not a standalone wheel."
  },
  {
    brand: "Reve D",
    productName: "BLACK DP5 Drift Rims 8mm OFFSET (HIGH TRACTION) [Reve D] RW-DP5K8",
    modelNumber: "RW-DP5K8",
    sourceUrl: "https://supergdrift.com/collections/rims/products/black-dp5-drift-rims-8mm-offset-high-traction-reve-d-rw-dp5k8"
  },
  {
    brand: "Reve D",
    productName: "BLACK DP5 Drift Wheel Rims 6mm OFFSET (HIGH TRACTION) [Reve D] RW-DP5K6",
    modelNumber: "RW-DP5k6",
    sourceUrl: "https://supergdrift.com/collections/rims/products/black-dp5-drift-wheel-rims-6mm-offset-high-traction-reve-d-rw-dp5k6"
  },
  {
    brand: "Reve D",
    productName: "BLACK UL12 (57extreme) Drift Wheel Rims 6mm OFFSET (HIGH TRACTION) [Reve D] RW-UL12K6",
    modelNumber: "RW-UL12K6",
    sourceUrl: "https://supergdrift.com/collections/rims/products/black-ul12-57extreme-drift-wheel-rims-6mm-offset-high-traction-reve-d-rw-ul12k6"
  },
  {
    brand: "Reve D",
    productName: "BRONZE DP5 Drift Wheel Rims 6mm OFFSET (HIGH TRACTION) [Reve D] RW-DP5B6",
    modelNumber: "RW-DP5B6",
    sourceUrl: "https://supergdrift.com/collections/rims/products/bronze-dp5-drift-wheel-rims-6mm-offset-high-traction-reve-d-rw-dp5b6"
  },
  {
    brand: "Reve D",
    productName: "GA18 - 1-10 Drift Car Competition Wheel DISH WHEEL (24mm Width) - 4mm RIMS - YELLOW WHITE BLACK [Reve D] RW-GA18Y4 RW-GA18W4 RW-GA18K4",
    modelNumber: "RW-GA18K4 / RW-GA18W4 / RW-GA18Y4",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ga18-1-10-drift-car-competition-wheel-dish-wheel-24mm-width-4mm-rims-yellow-white-black-reve-d-rw-ga18y4-rw-ga18w4-rw-ga18k4"
  },
  {
    brand: "Reve D",
    productName: "GREEN DP5 Drift Wheel Rims 6mm OFFSET (HIGH TRACTION) [Reve D] RW-DP5G6",
    modelNumber: "RW-DP5G6",
    sourceUrl: "https://supergdrift.com/collections/reve-d/products/green-dp5-drift-wheel-rims-6mm-offset-high-traction-reve-d-rw-dp5g6"
  },
  {
    brand: "Reve D",
    productName: "GUN METAL METALLIC UL12 (57extreme) Drift Wheel Rims 6mm OFFSET (HIGH TRACTION) [Reve D] RW-UL12M6",
    modelNumber: "RW-UL12M6",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gun-metal-metallic-ul12-57extreme-drift-wheel-rims-6mm-offset-high-traction-reve-d-rw-ul12m6"
  },
  {
    brand: "Reve D",
    productName: "JD7 7 SPOKE DEEP CONCAVE Drift Rims Wheel (WHITE OR BLACK) 6mm - 8mm OFFSET (HIGH TRACTION) RIMS [Reve D] RW-JD7MK6 RW-JD7MK8 RW-JD7MW6 RW-JD7MW8 REVE-D",
    modelNumber: "RW-JD7MK6 / RW-JD7MK8 / RW-JD7MW6 / RW-JD7MW8",
    sourceUrl: "https://supergdrift.com/collections/rims/products/jd7-7-spoke-deep-concave-drift-rims-wheel-white-or-black-6mm-8mm-offset-high-traction-rims-reve-d-rw-jd7mk6-rw-jd7mk8-rw-jd7mw6-rw-jd7mw8-reve-d"
  },
  {
    brand: "Reve D",
    productName: "NEON PINK UL12 (57extreme) Drift Wheel Rims 6mm OFFSET (HIGH TRACTION) [Reve D] RW-UL12P6",
    modelNumber: "RW-UL12P6",
    sourceUrl: "https://supergdrift.com/collections/rims/products/neon-pink-ul12-57extreme-drift-wheel-rims-6mm-offset-high-traction-reve-d-rw-ul12p6"
  },
  {
    brand: "Reve D",
    productName: "NEON YELLOW DP5 Drift Wheel Rims 6mm OFFSET (HIGH TRACTION) [Reve D] RW-DP5Y6",
    modelNumber: "RW-DP5Y6",
    sourceUrl: "https://supergdrift.com/collections/rims/products/neon-yellow-dp5-drift-wheel-rims-6mm-offset-high-traction-reve-d-rw-dp5y6"
  },
  {
    brand: "Reve D",
    productName: "NEON YELLOW DP5 Drift Wheel Rims 8mm OFFSET (HIGH TRACTION) [Reve D] RW-DP5Y8",
    modelNumber: "RW-DP5Y8",
    sourceUrl: "https://supergdrift.com/collections/rims/products/neon-yellow-dp5-drift-wheel-rims-8mm-offset-high-traction-reve-d-rw-dp5y8"
  },
  {
    brand: "Reve D",
    productName: "NEON YELLOW UL12 (57extreme) Drift Wheel Rims 6mm OFFSET (HIGH TRACTION) [Reve D] RW-UL12Y6",
    modelNumber: "RW-UL12Y6",
    sourceUrl: "https://supergdrift.com/collections/rims/products/neon-yellow-ul12-57extreme-drift-wheel-rims-6mm-offset-high-traction-reve-d-rw-ul12y6"
  },
  {
    brand: "Reve D",
    productName: "RDX ALUMINUM Front Axle Wheel Hub (4.5mm) Brake Disc [Reve D] D1-010FA",
    modelNumber: "D1-010FA",
    sourceUrl: "https://supergdrift.com/collections/reve-d/products/rdx-aluminum-front-axle-wheel-hub-4-5mm-brake-disc-reve-d-d1-010fa",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Wheel hub/axle accessory, not a standalone wheel."
  },
  {
    brand: "Reve D",
    productName: "RDX ALUMINUM Front Axle Wheel Hub (4.5mm) Brake Disc [Reve D] D1-010FDC",
    modelNumber: "D1-010FDC",
    sourceUrl: "https://supergdrift.com/collections/reve-d/products/rdx-aluminum-front-axle-wheel-hub-4-5mm-brake-disc-reve-d-d1-010fdc",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Wheel hub/axle accessory, not a standalone wheel."
  },
  {
    brand: "Reve D",
    productName: "RDX ALUMINUM Rear Axle Wheel Hub (5.5mm) Brake Disc [Reve D] D1-011RDC",
    modelNumber: "D1-011RDC",
    sourceUrl: "https://supergdrift.com/collections/reve-d/products/rdx-aluminum-front-axle-wheel-hub-4-0mm-brake-disc-reve-d-d1-011rdc",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Wheel hub/axle accessory, not a standalone wheel."
  },
  {
    brand: "Reve D",
    productName: "RDX EZ Type Wheel Hub 5.0mm - 7.0mm [Reve D] D1-011R50 D1-011R70",
    modelNumber: "D1-011R50 / D1-011R70",
    sourceUrl: "https://supergdrift.com/collections/reve-d/products/rdx-ez-type-wheel-hub-5-0mm-7-0mm-reve-d-d1-011r50-d1-011r70",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    reasonHidden: "Wheel hub/axle accessory, not a standalone wheel."
  },
  {
    brand: "Reve D",
    productName: "VR10 Multi Spoke - Black Chrome White 6mm - 10mm OFFSET (HIGH TRACTION) RIMS [Reve D]",
    modelNumber: "RW-VR10K1 / RW-VR10K6 / RW-VR10S1 / RW-VR10S6 / RW-VR10W1 / RW-VR10W6",
    sourceUrl: "https://supergdrift.com/collections/rims/products/vr10-multi-spoke-black-chrome-white-6mm-10mm-offset-high-traction-rims-reve-d"
  },
  {
    brand: "Reve D",
    productName: "WHITE DP5 Drift Rims 8mm OFFSET (HIGH TRACTION) [Reve D] RW-DP5W8",
    modelNumber: "RW-DP5W8",
    sourceUrl: "https://supergdrift.com/collections/rims/products/white-dp5-drift-rims-8mm-offset-high-traction-reve-d-rw-dp5w8"
  },
  {
    brand: "Reve D",
    productName: "WHITE DP5 Drift Wheel Rims 6mm OFFSET (HIGH TRACTION) [Reve D] RW-DP5W6",
    modelNumber: "RW-DP5W6",
    sourceUrl: "https://supergdrift.com/collections/rims/products/white-dp5-drift-wheel-rims-6mm-offset-high-traction-reve-d-rw-dp5w6"
  },
  {
    brand: "Reve D",
    productName: "WHITE UL12 (57extreme) Drift Wheel Rims 6mm OFFSET (HIGH TRACTION) [Reve D] RW-UL12W6",
    modelNumber: "RW-UL12W6",
    sourceUrl: "https://supergdrift.com/collections/rims/products/white-ul12-57extreme-drift-wheel-rims-6mm-offset-high-traction-reve-d-rw-ul12w6"
  },
  {
    brand: "Scale Dynamics",
    productName: "BBS RS Mesh (Chrome) Rims Set (10mm - 13mm) [Scale Dynamics] 10165 10166",
    modelNumber: "10165 / 10166",
    sourceUrl: "https://supergdrift.com/collections/rims/products/bbs-rs-mesh-chrome-rims-set-10mm-13mm-scale-dynamics-10165-10166"
  },
  {
    brand: "Scale Dynamics",
    productName: "Hayashi Street (Silver) Rims Set (9mm / 12mm) V16D 1/10 Drift Wheels [Scale Dynamics] 10161 10162",
    modelNumber: "10161 / 10162",
    sourceUrl: "https://supergdrift.com/collections/rims/products/hayashi-street-silver-rims-set-9mm-12mm-scale-dynamics-10105-10106"
  },
  {
    brand: "Scale Dynamics",
    productName: "INCHDOWN V16D Work Equip 03 (Polished Silver - CHROME) Rims Set (9mm - 12mm) [Scale Dynamics] 10173  10174",
    modelNumber: "10173 / 10174",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-equip-03-polished-silver-chrome-rims-set-9mm-12mm-scale-dynamics-10171-10172"
  },
  {
    brand: "Scale Dynamics",
    productName: "INCHDOWN: RS Watanabe Aluminum Silver Rims Set (9mm - 12mm) [Scale Dynamics] 10151 10152",
    modelNumber: "10151 / 10152",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rs-watanabe-aluminum-silver-rims-set-9mm-12mm-scale-dynamics-10107-10108"
  },
  {
    brand: "Scale Dynamics",
    productName: "INCHDOWN: RS Watanabe Gunmetal Rims Set (9mm - 12mm) [Scale Dynamics] 10153 10154",
    modelNumber: "10153 / 10154",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rs-watanabe-black-gun-metal-rims-set-9mm-12mm-scale-dynamics-10109-10110"
  },
  {
    brand: "Scale Dynamics",
    productName: "INCHDOWN: RS Watanabe Titanium (Gold) Rims Set (9mm - 12mm) [Scale Dynamics] 10155 10156",
    modelNumber: "10155 / 10156",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rs-watanabe-titanium-gold-rims-set-9mm-12mm-scale-dynamics-10111-10112"
  },
  {
    brand: "Scale Dynamics",
    productName: "INCHDOWN: V16D Work Equip 01 (CHROME POLISHED RIM) Rims Set (9mm - 12mm) [Scale Dynamics] 10171 10172",
    modelNumber: "10171 / 10172",
    sourceUrl: "https://supergdrift.com/collections/rims/products/inchdown-v16d-work-equip-01-chrome-polished-rim-rims-set-9mm-12mm-scale-dynamics-10171-10172"
  },
  {
    brand: "Scale Dynamics",
    productName: "Work Equip 01 (BRONZE LIP) Rims Set (9mm - 12mm) [Scale Dynamics] 10175 10176",
    modelNumber: "10175 / 10176",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-equip-01-bronze-lip-rims-set-9mm-12mm-scale-dynamics-10175-10176"
  },
  {
    brand: "Scale Dynamics",
    productName: "Work Equip 03 (BRONZE LIP) Rims Set (9mm - 12mm) [Scale Dynamics] 10177 10178",
    modelNumber: "10177 / 10178",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-equip-03-bronze-lip-rims-set-9mm-12mm-scale-dynamics-10177-10178"
  },
  {
    brand: "Shibata",
    productName: "37Kai - 6 Spoke - Black - 1-10 Rims (5mm - 7mm - 9mm) [Shibata] R31W242B R31W427 R31G052B",
    modelNumber: "R31G052B / R31W242B / R31W427",
    sourceUrl: "https://supergdrift.com/collections/rims/products/37kai-6-spoke-black-1-10-rims-5mm-7mm-9mm-shibata-r31w242b-r31w427-r31g052b"
  },
  {
    brand: "Shibata",
    productName: "F23 - 5 Spoke - Gun Metal - 1-10 Rims (5mm - 7mm) [Shibata] DR-SW05FGS DR-SW07FGS",
    modelNumber: "DR-SW05FGS / DR-SW07FGS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/f23-5-spoke-gun-metal-1-10-rims-5mm-7mm-shibata-dr-sw05fgs-dr-sw07fgs"
  },
  {
    brand: "Shibata",
    productName: "F23 - 5 Spoke - Gun Metal - High Traction - Rims (5mm - 7mm) [Shibata] DR-SW05FGH DR-SW07FGH",
    modelNumber: "DR-SW05FGH / DR-SW07FGH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/f23-5-spoke-gun-metal-high-traction-rims-5mm-7mm-shibata-dr-sw05fgh-dr-sw07fgh"
  },
  {
    brand: "Shibata",
    productName: "F23 - 5 Spoke - White - High Traction - Rims (5mm - 7mm) [Shibata] DR-SW05FWH DR-SW07FWH",
    modelNumber: "DR-SW05FHW / DR-SW07FHW",
    sourceUrl: "https://supergdrift.com/collections/rims/products/f23-5-spoke-white-high-traction-rims-5mm-7mm-shibata-dr-sw05fwh-dr-sw07fwh"
  },
  {
    brand: "Shibata",
    productName: "F23 - 5 Spoke White - Black - Gun Metal - Rims (5mm - 7mm) [Shibata] DR-SW07FWH DR-SW07FBK DR-SW0FGWH DR-SW05FBK",
    modelNumber: "DR-SW05FBK / DR-SW07FBK / DR-SW05FWH / DR-SW07FWH / DR-SW05FGM / DR-SW07FGM",
    sourceUrl: "https://supergdrift.com/collections/rims/products/f23-5-spoke-white-black-rims-5mm-7mm-shibata-dr-sw07fwh-dr-sw07fbk-dr-sw0fgwh-dr-sw05fbk"
  },
  {
    brand: "Shibata",
    productName: "G23 - Split 5 Spoke White - Black Rims (5mm - 7mm) [Shibata] DR-SW07GWH DR-SW07GBK DR-SW05GWH DR-SW05GBK",
    modelNumber: "DR-SW05GBK / DR-SW07GBK / DR-SW05GWH / DR-SW07GWH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/g23-split-5-spoke-white-black-rims-5mm-7mm-shibata-dr-sw07gwh-dr-sw07gbk-dr-sw05gwh-dr-sw05gbk"
  },
  {
    brand: "Speed Way Pal",
    productName: "Slide Master VOLK TE-37R - 10mm CARBON GRAPHITE 1-10 Rims Wheels [Speed Way Pal] PA070N-10CG",
    modelNumber: "PA070N-10CG",
    sourceUrl: "https://supergdrift.com/collections/rims/products/slide-master-te-37r-10mm-carbon-graphite-1-10-rims-wheels-speed-way-pal-pa070n-10cg"
  },
  {
    brand: "Speed Way Pal",
    productName: "Slide Master VOLK TE-37R - 10mm GLOSS BLACK 1-10 Rims Wheels [Speed Way Pal] PA070N-10BL",
    modelNumber: "PA070N-10BL",
    sourceUrl: "https://supergdrift.com/collections/rims/products/slide-master-te-37r-10mm-gloss-black-1-10-rims-wheels-speed-way-pal-pa070n-10bl"
  },
  {
    brand: "Speed Way Pal",
    productName: "Slide Master WORK D9 - 10mm GOLD 1-10 Rims Wheels [Speed Way Pal] PA074-10G",
    modelNumber: "PA074-10G",
    sourceUrl: "https://supergdrift.com/collections/rims/products/slide-master-d9-10mm-gold-1-10-rims-wheels-speed-way-pal-pa074-10g"
  },
  {
    brand: "Spice",
    productName: "TE37 6 Spoke Wheels - 5mm 8mm KV Coat - ORANGE 1-10 DRIFT RIMS [SPICE] SPKV-006 SPKV-009",
    modelNumber: "SPKV-006 / SPKV-009",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te37-6-spoke-wheels-5mm-8mm-kv-coat-orange-1-10-drift-rims-spice-spkv-006-spkv-009"
  },
  {
    brand: "Spice",
    productName: "TE37 6 Spoke Wheels - 5mm 8mm KV Coat - PINK 1-10 DRIFT RIMS [SPICE] SPKV-007 SPKV-010",
    modelNumber: "SPKV-007 / SPKV-010",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te37-6-spoke-wheels-5mm-8mm-kv-coat-pink-1-10-drift-rims-spice-spkv-007-spkv-010"
  },
  {
    brand: "Spice",
    productName: "TE37 6 Spoke Wheels - 5mm 8mm KV Coat - YELLOW 1-10 DRIFT RIMS [SPICE] SPKV-008 SPKV-005",
    modelNumber: "SPKV-005 / SPKV-008",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te37-6-spoke-wheels-5mm-8mm-kv-coat-pink-1-10-drift-rims-spice-spkv-008-spkv-005"
  },
  {
    brand: "Spice",
    productName: "VOLK RACING TE37 TE-37 TE37SL 5mm 8mm Gun Metallic Silver RAYS 1-10 DRIFT RIMS [SPICE] SPA-424 SPA-429",
    modelNumber: "SPA-424 / SPA-429",
    sourceUrl: "https://supergdrift.com/collections/rims/products/volk-racing-te37-te-37-te37sl-5mm-8mm-gun-metallic-silver-rays-1-10-drift-rims-spice-spa-424-spa-429"
  },
  {
    brand: "Spice",
    productName: "VOLK RACING TE37 TE-37 TE37SL 5mm 8mm Matte Silver RAYS 1-10 DRIFT RIMS [SPICE] SPA-423 SPA-428",
    modelNumber: "SPA-423 / SPA-428",
    sourceUrl: "https://supergdrift.com/collections/rims/products/volk-racing-te37-te-37-te37sl-5mm-8mm-matte-silver-rays-1-10-drift-rims-spice-spa-423-spa-428"
  },
  {
    brand: "Tamiya",
    productName: "Rally OZ Rims WHITE (4 Pack) [Tamiya] 51021",
    modelNumber: "51021",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rally-oz-rims-white-4-pack-tamiya-51021"
  },
  {
    brand: "Tetsujin",
    productName: "1/10 Marguerite Rims Wheels (Brown Chrome / Gold) 2, 5 8 OFFSET (PAIR) [Tetsujin] TT-8439",
    modelNumber: "TT-8439",
    sourceUrl: "https://supergdrift.com/collections/rims/products/1-10-marguerite-rims-wheels-brown-chrome-gold-2-5-8-offset-pair-tetsujin-tt-8439"
  },
  {
    brand: "Tetsujin",
    productName: "DAISY (mesh) Chrome FACE DISC for Super-Rim (2 pc) [Tetsujin] TT-7635",
    modelNumber: "TT-7635",
    sourceUrl: "https://supergdrift.com/collections/rims/products/daisy-mesh-chrome-face-disc-for-super-rim-2-pc-tetsujin-tt-7635"
  },
  {
    brand: "Tetsujin",
    productName: "DAISY GOLD - CHROME LIP RIM02 Super-Rim Set (Adjustable Offset 3, 6, 9) [Tetsujin] TT-8098",
    modelNumber: "TT-8098",
    sourceUrl: "https://supergdrift.com/collections/rims/products/daisy-gold-chrome-lip-rim02-super-rim-set-adjustable-offset-3-6-9-tetsujin-tt-8098"
  },
  {
    brand: "Tetsujin",
    productName: "DEEP SPIDER (Chrome / Chrome Purple) Super-Rim Set (Adjustable Offset 3, 6, 9) [Tetsujin] TT-8551",
    modelNumber: "TT-8551",
    sourceUrl: "https://supergdrift.com/collections/rims/products/deep-spider-chrome-chrome-purple-super-rim-set-adjustable-offset-3-6-9-tetsujin-tt-8551"
  },
  {
    brand: "Tetsujin",
    productName: "DEEP SPIDER (Chrome Purple) Super-Rim Set (Adjustable Offset 3, 6, 9) [Tetsujin] TT-8552",
    modelNumber: "TT-8552",
    sourceUrl: "https://supergdrift.com/collections/rims/products/deep-spider-chrome-purple-super-rim-set-adjustable-offset-3-6-9-tetsujin-tt-8552"
  },
  {
    brand: "Tetsujin",
    productName: "DEEP SPIDER ALUM SILVER Super-Rim Set (Adjustable Offset 3, 6, 9) [Tetsujin] TT-7773",
    modelNumber: "",
    sourceUrl: "https://supergdrift.com/collections/rims/products/spider-silver-super-rim-set-adjustable-offset-3-6-9-tetsujin-tt-7773"
  },
  {
    brand: "Tetsujin",
    productName: "DEEP SPIDER Gun metal / Silver Super-Rim Set (Adjustable Offset 3, 6, 9) [Tetsujin] TT-7774",
    modelNumber: "TT-7774",
    sourceUrl: "https://supergdrift.com/collections/rims/products/deep-spider-gun-metal-silver-super-rim-set-adjustable-offset-3-6-9-tetsujin-tt-7774"
  },
  {
    brand: "Tetsujin",
    productName: "Dhalia Chrome RIM02 Super-Rim Set (Adjustable Offset 3, 6, 9) [Tetsujin] TT-8366",
    modelNumber: "TT-8366",
    sourceUrl: "https://supergdrift.com/collections/rims/products/dhalia-chrome-rim02-super-rim-set-adjustable-offset-3-6-9-tetsujin-tt-7583"
  },
  {
    brand: "Tetsujin",
    productName: "GRAN SEEKER (mesh) ALUMI SILVER FACE DISC for Super-Rim (2 pc) [Tetsujin] TT-7121",
    modelNumber: "TT-7121",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gran-seeker-mesh-silver-metallic-face-disc-for-super-rim-2-pc-tetsujin-tt-7121"
  },
  {
    brand: "Tetsujin",
    productName: "GRAN SEEKER (mesh) GUN METAL FACE DISC for Super-Rim (2 pc) [Tetsujin] TT-7149",
    modelNumber: "TT-7149",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gran-seeker-mesh-gloss-black-face-disc-for-super-rim-2-pc-tetsujin-tt-7149"
  },
  {
    brand: "Tetsujin",
    productName: "GRAN SEEKER MESH (Chrome / Chrome Purple) 01 Super-Rim Set (Adjustable Offset 5 8 11) PAIR 1/10 Rims [Tetsujin] TT-8549",
    modelNumber: "TT-8549",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gran-seeker-mesh-chrome-chrome-purple-01-super-rim-set-adjustable-offset-5-8-11-pair-1-10-rims-tetsujin-tt-8549"
  },
  {
    brand: "Tetsujin",
    productName: "GRAN SEEKER MESH (Chrome Purple) 01 Super-Rim Set (Adjustable Offset 5 8 11) PAIR 1/10 Rims [Tetsujin] TT-8550",
    modelNumber: "TT-8550",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gran-seeker-mesh-chrome-purple-01-super-rim-set-adjustable-offset-5-8-11-tetsujin-tt-8550"
  },
  {
    brand: "Tetsujin",
    productName: "GRAN SEEKER MESH ALUM SILVER / CHROME 01 Super-Rim Set (Adjustable Offset 5 8 11) [Tetsujin] TT-8130",
    modelNumber: "TT-8130",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gran-seeker-mesh-alum-silver-chrome-01-super-rim-set-adjustable-offset-5-8-11-tetsujin-tt-8130"
  },
  {
    brand: "Tetsujin",
    productName: "GRAN SEEKER MESH FULL CHROME RIM02 Super-Rim Set (Adjustable Offset 5 8 11) [Tetsujin] TT-8367",
    modelNumber: "TT-8367",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gran-seeker-full-chrome-rim02-super-rim-set-adjustable-offset-5-8-11-tetsujin-tt-8367"
  },
  {
    brand: "Tetsujin",
    productName: "GRAN SEEKER MESH GLOSS BLACK / CHROME 01 Super-Rim Set (Adjustable Offset 5 8 11) [Tetsujin] TT-8109",
    modelNumber: "TT-8109",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gran-seeker-mesh-gloss-black-super-rim-set-adjustable-offset-5-8-11-tetsujin-tt-8367-copy"
  },
  {
    brand: "Tetsujin",
    productName: "GRAN SEEKER MESH GOLD - CHROME LIP RIM02 Super-Rim Set (Adjustable Offset 5 8 11) [Tetsujin] TT-8110",
    modelNumber: "TT-8110",
    sourceUrl: "https://supergdrift.com/collections/rims/products/gran-seeker-gold-chrome-lip-rim02-super-rim-set-adjustable-offset-5-8-11-tetsujin-tt-8110"
  },
  {
    brand: "Tetsujin",
    productName: "Jasmime Chrome RIM02 Super-Rim Set (Adjustable Offset 3, 6, 9) [Tetsujin] TT-8368",
    modelNumber: "TT-8368",
    sourceUrl: "https://supergdrift.com/collections/rims/products/jasmime-chrome-rim02-super-rim-set-adjustable-offset-3-6-9-tetsujin-tt-8368"
  },
  {
    brand: "Tetsujin",
    productName: "Lycoris (Black) w- Chrome RIM02 Super-Rim Set (Adjustable Offset 6, 9,12) [Tetsujin] TT-7611",
    modelNumber: "TT-7611",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lycoris-black-w-chrome-rim02-super-rim-set-adjustable-offset-6-9-12-tetsujin-tt-7611"
  },
  {
    brand: "Tetsujin",
    productName: "LYCORIS (mesh) Metallic RED FACE DISC for Super-Rim (2 pc) [Tetsujin] TT-8023",
    modelNumber: "TT-8023",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lycoris-mesh-metallic-red-face-disc-for-super-rim-2-pc-tetsujin-tt-8023"
  },
  {
    brand: "Tetsujin",
    productName: "Lycoris (Silver - Green Lip) RIM02 Super-Rim Set (Adjustable Offset 6, 9, 12) [Tetsujin] TT-8557",
    modelNumber: "TT-8557",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lycoris-silver-green-lip-rim02-super-rim-set-adjustable-offset-6-9-12-tetsujin-tt-8557"
  },
  {
    brand: "Tetsujin",
    productName: "Lycoris (White) w- Chrome RIM02 Super-Rim Set (Adjustable Offset 6, 9,12) [Tetsujin] TT-7610",
    modelNumber: "TT-7610",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lycoris-white-w-chrome-rim02-super-rim-set-adjustable-offset-6-9-12-tetsujin-tt-7610"
  },
  {
    brand: "Tetsujin",
    productName: "LYCORIS Chrome RIM02 Super-Rim Set (Adjustable Offset 6, 9, 12) [Tetsujin] TT-8365",
    modelNumber: "TT-8365",
    sourceUrl: "https://supergdrift.com/collections/rims/products/lycoris-chrome-rim02-super-rim-set-adjustable-offset-6-9-12-tetsujin-tt-8365"
  },
  {
    brand: "Tetsujin",
    productName: "Rim Type-01 Chrome Black (Gun Metal) LIP for Super-Rim (2 pc) [Tetsujin] TT-7680",
    modelNumber: "TT-7680",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rim-type-01-chrome-black-lip-for-super-rim-tetsujin-tt-7680"
  },
  {
    brand: "Tetsujin",
    productName: "Rim Type-01 Chrome LIP for Super-Rim (2 pc) [Tetsujin] TT-7612",
    modelNumber: "TT-7612",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rim-type-01-chrome-lip-for-super-rim-tetsujin-tt-7612"
  },
  {
    brand: "Tetsujin",
    productName: "RIM02 x Daisy (Chrome-Chrome) 2-Pack [Tetsujin] TT-7637",
    modelNumber: "TT-7637",
    sourceUrl: "https://supergdrift.com/collections/rims/products/rim02-x-daisy-chrome-chrome-2-pack-tetsujin-tt-7637"
  },
  {
    brand: "Tetsujin",
    productName: "Southern Cross Chrome RIM02 Super-Rim Set (Adjustable Offset 3, 6, 9) [Tetsujin] TT-7585",
    modelNumber: "TT-8371 (7585)",
    sourceUrl: "https://supergdrift.com/collections/rims/products/southern-cross-chrome-rim02-super-rim-set-adjustable-offset-3-6-9-tetsujin-tt-7585"
  },
  {
    brand: "Tetsujin",
    productName: "Southern Cross Cool Gray / Matte Black RIM02 Super-Rim Set (Adjustable Offset 3, 6, 9) [Tetsujin] TT-8207",
    modelNumber: "TT-8207",
    sourceUrl: "https://supergdrift.com/collections/rims/products/southern-cross-cool-gray-matte-black-rim02-super-rim-set-adjustable-offset-3-6-9-tetsujin-tt-8207"
  },
  {
    brand: "Tetsujin",
    productName: "Sunflower Black / Chrome RIM02 Super-Rim Set (Adjustable Offset 6, 9, 12) [Tetsujin] TT-7625",
    modelNumber: "TT-7625",
    sourceUrl: "https://supergdrift.com/collections/rims/products/sunflower-black-chrome-rim02-super-rim-set-adjustable-offset-6-9-12-tetsujin-tt-7625"
  },
  {
    brand: "Tetsujin",
    productName: "Super Bowler 1-10 Rims Wheels (BLACK-CHROME) 5, 8 11 OFFSET (PAIR) [Tetsujin] TT-8353",
    modelNumber: "TT-8353",
    sourceUrl: "https://supergdrift.com/collections/rims/products/super-bowler-rims-wheels-black-chrome-5-8-11-offset-pair-tetsujin-tt-8353"
  },
  {
    brand: "Tetsujin",
    productName: "Super Bowler 1-10 Rims Wheels (Chrome / Chrome Purple) 5, 8 11 OFFSET (PAIR) [Tetsujin] TT-8553",
    modelNumber: "TT-8553",
    sourceUrl: "https://supergdrift.com/collections/rims/products/super-bowler-1-10-rims-wheels-chrome-chrome-purple-5-8-11-offset-pair-tetsujin-tt-8553"
  },
  {
    brand: "Tetsujin",
    productName: "Super Bowler Rims Wheels (BLACK) 5, 8 11 OFFSET (PAIR) [Tetsujin] TT-8236",
    modelNumber: "TT-8236",
    sourceUrl: "https://supergdrift.com/collections/rims/products/super-bowler-rims-wheels-black-5-8-11-offset-pair-tetsujin-tt-8236"
  },
  {
    brand: "Tetsujin",
    productName: "Super Bowler Rims Wheels (BROWN-GOLD) 5, 8 11 OFFSET (PAIR) [Tetsujin] TT-8285",
    modelNumber: "TT-8285",
    sourceUrl: "https://supergdrift.com/collections/rims/products/super-bowler-rims-wheels-brown-gold-5-8-11-offset-pair-tetsujin-tt-8285"
  },
  {
    brand: "Tetsujin",
    productName: "Super Bowler Rims Wheels (Chrome Purple) 5, 8 11 OFFSET (PAIR) [Tetsujin] TT-8546",
    modelNumber: "TT-8546",
    sourceUrl: "https://supergdrift.com/collections/rims/products/super-bowler-rims-wheels-chrome-purple-5-8-11-offset-pair-tetsujin-tt-8546"
  },
  {
    brand: "Tetsujin",
    productName: "Super Bowler Rims Wheels (Silver Green lip) 5, 8 11 OFFSET (PAIR) [Tetsujin] TT-8559",
    modelNumber: "TT-8559",
    sourceUrl: "https://supergdrift.com/collections/rims/products/super-bowler-rims-wheels-silver-green-lip-5-8-11-offset-pair-tetsujin-tt-8559"
  },
  {
    brand: "Tetsujin",
    productName: "Super Bowler Rims Wheels (Silver-Chrome) 5, 8 11 OFFSET (PAIR) [Tetsujin] TT-8237",
    modelNumber: "TT-8237",
    sourceUrl: "https://supergdrift.com/collections/rims/products/super-bowler-rims-wheels-silver-chrome-5-8-11-offset-pair-tetsujin-tt-8237"
  },
  {
    brand: "Topline",
    productName: "Advan AVS T7 HIGH TRACTION  Wheels (GREEN) Rims 5mm - 8mm [Topline RC] IW-2208G IW-2205G",
    modelNumber: "IW-2208G / IW-2205G",
    sourceUrl: "https://supergdrift.com/collections/rims/products/advan-avs-t7-high-traction-wheels-green-rims-5mm-8mm-topline-rc-iw-2208g-iw-2205g"
  },
  {
    brand: "Topline",
    productName: "Advan AVS T7 HIGH TRACTION  Wheels (GREEN) Rims 6mm - 8mm [Topline RC] IW-1206G IW-1208G",
    modelNumber: "IW-1206G / IW-1208G",
    sourceUrl: "https://supergdrift.com/collections/rims/products/advan-avs-t7-high-traction-wheels-green-rims-6mm-8mm-topline-rc-iw-1206g-iw-1208g"
  },
  {
    brand: "Topline",
    productName: "Advan AVS T7 HIGH TRACTION  Wheels (MATTE BRONZE) Rims 5mm - 8mm [Topline RC] IW-2208BR IW-2205BR",
    modelNumber: "IW-2208BR / IW-2205BR",
    sourceUrl: "https://supergdrift.com/collections/rims/products/advan-avs-t7-high-traction-wheels-matte-bronze-rims-5mm-8mm-topline-rc-iw-2208br-iw-2205br"
  },
  {
    brand: "Topline",
    productName: "Advan AVS T7 HIGH TRACTION  Wheels (PINK) Rims 5mm - 8mm [Topline RC] IW-2208PK IW-2205PK",
    modelNumber: "IW-2208PK / IW-2205PK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/advan-avs-t7-high-traction-wheels-pink-rims-5mm-8mm-topline-rc-iw-2208pk-iw-2205pk"
  },
  {
    brand: "Topline",
    productName: "Advan AVS T7 HIGH TRACTION  Wheels (YELLOW) Rims 6mm - 8mm [Topline RC] IW-1206Y IW-1208Y",
    modelNumber: "IW-1206Y / IW-1208Y",
    sourceUrl: "https://supergdrift.com/collections/rims/products/advan-avs-t7-high-traction-wheels-yellow-rims-6mm-8mm-topline-rc-iw-1206y-iw-1208y"
  },
  {
    brand: "Topline",
    productName: "Advan AVS T7 SUPER HIGH TRACTION  Wheels (BLACK) 6mm - 8mm [Topline RC] IW-3206BK IW-3208BK",
    modelNumber: "IW-3208BK / IW-3206BK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/advan-avs-t7-super-high-traction-wheels-black-6mm-8mm-topline-rc-iw-3206bk-iw-3208bk"
  },
  {
    brand: "Topline",
    productName: "Advan AVS T7 SUPER HIGH TRACTION  Wheels (WHITE) Rims 5mm - 6mm - 8mm - 9mm [Topline RC] IW-3206WH IW-3208WH IW-3205WH IW-3209WH",
    modelNumber: "IW-3208WH / IW-3206WH / IW-3205WH / IW-3209WH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/advan-avs-t7-super-high-traction-wheels-white-rims-5mm-6mm-8mm-9mm-topline-rc-iw-3206wh-iw-3208wh-iw-3205wh-iw-3209wh"
  },
  {
    brand: "Topline",
    productName: "Advan AVS T7 Wheels (CHROME SILVER) Rims 6mm - 8mm [Topline RC] IW-1206CS IW-1208CS",
    modelNumber: "IW-1208CS / IW-1206CS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/advan-avs-t7-wheels-chrome-silver-rims-6mm-8mm-topline-rc-iw-1206cs-iw-1208cs"
  },
  {
    brand: "Topline",
    productName: "DRS-5 WHEEL 5-SPOKES MATTE CHROME 5mm 7mm 9mm [Topline] DRS-071MC",
    modelNumber: "DRS-071MC",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drs-5-wheel-5-spokes-matte-chrome-5mm-7mm-9mm-topline-drs-071mc"
  },
  {
    brand: "Topline",
    productName: "DRS-5 WHEEL HIGH TRACTION MATTE CHROME 6mm / 8mm 1/10 Rims [Topline RC] TDW-0613MC TDW-0813MC",
    modelNumber: "TDW-0613MC / TDW-0813MC",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drs-5-wheel-high-traction-matte-chrome-6mm-8mm-1-10-rims-topline-rc-tdw-0613mc-tdw-0813mc"
  },
  {
    brand: "Topline",
    productName: "DRS-5 WHEEL HIGH TRACTION WHITE 6mm / 8mm  1/10 Rims [Topline RC] TDW-086WH (Copy)",
    modelNumber: "TDW-0613WH / TDW-0813WH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drs-5-wheel-high-traction-white-6mm-8mm-1-10-rims-topline-rc-tdw-086wh-copy"
  },
  {
    brand: "Topline",
    productName: "DRS-5 WHEEL SILVER 6mm 8mm [Topline RC] TDW-0612MS TDW-0812MS",
    modelNumber: "TDW-0612MS / TDW-0812MS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drs-5-wheel-silver-6mm-8mm-topline-rc-tdw-0612ms-tdw-0812ms"
  },
  {
    brand: "Topline",
    productName: "DRS-5 WHEEL SUPER HIGH TRACTION BLACK 8mm [Topline RC] TDW-086BK",
    modelNumber: "TDW-086BK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drs-5-wheel-super-high-traction-black-8mm-topline-rc-tdw-086bk"
  },
  {
    brand: "Topline",
    productName: "DRS-5 WHEEL SUPER HIGH TRACTION MATTE CHROME 5mm 7mm 8mm [Topline RC] TDW-086MC TDW-076MC",
    modelNumber: "TDW-056MC / TDW-076MC / TDW-086MC",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drs-5-wheel-super-high-traction-matte-chrome-8mm-topline-rc-tdw-086mc"
  },
  {
    brand: "Topline",
    productName: "DRS-5 WHEEL SUPER HIGH TRACTION WHITE 8mm 1/10 Rims [Topline RC] TDW-086WH",
    modelNumber: "TDW-086WH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drs-5-wheel-super-high-traction-white-8mm-topline-rc-tdw-086wh"
  },
  {
    brand: "Topline",
    productName: "DRS-5 WHEEL WHITE 6mm 8mm [Topline RC] TDW-0612WH TDW-0812WH",
    modelNumber: "TDW-0612WH / TDW-0812WH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/drs-5-wheel-white-6mm-8mm-topline-rc-tdw-0612wh-tdw-0812wh"
  },
  {
    brand: "Topline",
    productName: "FX SPORT PINK 6mm / 8mm 1/10 RIMS [Topline RC] TDW-0614PK TDW-0814PK",
    modelNumber: "TDW-0614PK / TDW-0814PK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/fx-sport-pink-6-8-topline-rc-tdw-068pk-tdw-088pk"
  },
  {
    brand: "Topline",
    productName: "FX Sport Rims G025 (Maziora) Purple-Green Pearl Iridescent 5mm - 8MM [Topline RC] TDW-0614MJ TDW-0814MJ",
    modelNumber: "TDW-0614MJ / TDW-0814MJ",
    sourceUrl: "https://supergdrift.com/collections/rims/products/fx-sport-rims-g025-maziora-purple-green-pearl-iridescent-5mm-8mm-topline-rc-tdw-0614mj-tdw-0814mj"
  },
  {
    brand: "Topline",
    productName: "FX SPORT WHITE (6mm / 7mm / 8mm) 1/10 RIMS [Topline RC] TDW-0614WH TDW-0714WH TDW-0814WH",
    modelNumber: "TDW-0614WH / TDW-0714WH / TDW-0814WH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/fx-sport-white-6-7-8-topline-rc-tdw-068wh-tdw-078wh-tdw-088wh"
  },
  {
    brand: "Topline",
    productName: "HIGH TRACTION N Model Ver III 5 Spoke Concave Rims (PINK) 5mm - 7mm [Topline RC] TDW-054PK TDW-074PK",
    modelNumber: "TDW-082PK / TDW-054PK / TDW-074PK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/high-traction-n-model-ver-iii-5-spoke-concave-rims-pink-5mm-7mm-topline-rc-tdw-054pk-tdw-074pk"
  },
  {
    brand: "Topline",
    productName: "HIGH TRACTION N Model Ver III Deep Face Concave Rims (Green) 5mm - 6mm - 7mm - 8mm [Topline RC] TDW-054G TDW-074G",
    modelNumber: "TDW-082G / TDW-062G / TDW-054G / TDW-074G",
    simplifiedName: "N Model Ver III Deep Face Concave Wheel",
    displayName: "N Model Ver III Deep Face Concave Wheel",
    variants: [
      { id: "green-5-6-7-8mm-tdw-g", color: "Green", offset: "5mm / 6mm / 7mm / 8mm", sku: "TDW-082G / TDW-062G / TDW-054G / TDW-074G", displayName: "Green / 5-8mm", sourceProductName: "HIGH TRACTION N Model Ver III Deep Face Concave Rims (Green) 5mm - 6mm - 7mm - 8mm [Topline RC] TDW-054G TDW-074G", sourceUrl: "https://supergdrift.com/collections/rims/products/high-traction-n-model-ver-iii-deep-face-concave-rims-green-5mm-6mm-7mm-8mm-topline-rc-tdw-054g-tdw-074g" },
      { id: "bronze-gun-metal-6-7-8mm-tdw-br", color: "Bronze Gun Metal", offset: "6mm / 7mm / 8mm", sku: "TDW-082BR / TDW-062BR / TDW-074BR", displayName: "Bronze Gun Metal / 6-8mm", sourceProductName: "N Model Ver III Deep Face Concave Rims (Bronze Gun Metal) 6mm - 7mm - 8mm [Topline RC]", sourceUrl: "https://supergdrift.com/collections/rims/products/n-model-ver-iii-deep-face-concave-rims-bronze-gun-metal-6mm-7mm-8mm-topline-rc" },
      { id: "white-5-6-7-8mm-tdw-wh", color: "White", offset: "5mm / 6mm / 7mm / 8mm", sku: "TDW-062WH / TDW-082WH / TDW-052WH / TDW-074WH", displayName: "White / 5-8mm", sourceProductName: "N Model Ver III Deep Face Concave Rims (WHITE) 5mm - 6mm - 7mm - 8mm [Topline RC]", sourceUrl: "https://supergdrift.com/collections/rims/products/n-model-ver-iii-deep-face-concave-rims-white-5mm-6mm-7mm-8mm-topline-rc" },
      { id: "yellow-5-6-7-8mm-tdw-y", color: "Yellow", offset: "5mm / 6mm / 7mm / 8mm", sku: "TDW-082Y / TDW-062Y / TDW-074Y / TDW-054Y", displayName: "Yellow / 5-8mm", sourceProductName: "N Model Ver III Deep Face Concave Rims (Yellow) 5mm - 6mm - 7mm - 8mm [Topline RC]", sourceUrl: "https://supergdrift.com/collections/rims/products/n-model-ver-iii-deep-face-concave-rims-yellow-5mm-6mm-7mm-8mm-topline-rc" }
    ],
    sourceUrl: "https://supergdrift.com/collections/rims/products/high-traction-n-model-ver-iii-deep-face-concave-rims-green-5mm-6mm-7mm-8mm-topline-rc-tdw-054g-tdw-074g"
  },
  {
    brand: "Topline",
    productName: "M5 SPOKE WHEEL BLACK 6mm - 8mm  [TOPLINE] EW-0106BK EW-0108BK",
    modelNumber: "EW-0106BK / EW-0108BK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/m5-spoke-wheel-black-6mm-8mm-topline-ew-0106bk-ew-0108bk"
  },
  {
    brand: "Topline",
    productName: "M5 SPOKE WHEEL MATTE BRONZE 6mm - 8mm  [TOPLINE] EW-0106BR EW-0108BR",
    modelNumber: "EW-0106BR / EW-0108BR",
    sourceUrl: "https://supergdrift.com/collections/rims/products/m5-spoke-wheel-matte-bronze-6mm-8mm-topline-ew-0106br-ew-0108br"
  },
  {
    brand: "Topline",
    productName: "M5 SPOKE WHEEL WHITE 6mm - 8mm  [TOPLINE] EW-0106WH EW-0108WH",
    modelNumber: "EW-0106WH / EW-0108WH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/m5-spoke-wheel-white-6mm-8mm-topline-ew-0106wh-ew-0108wh"
  },
  {
    brand: "Topline",
    productName: "N Model Ver III 5 Spoke Concave Rims (PINK) 5mm - 7mm [Topline RC] TDW-052PK TDW-072PK",
    modelNumber: "TDW-052PK / TDW-072PK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n-model-ver-iii-5-spoke-concave-rims-pink-5mm-7mm-topline-rc-tdw-052pk-tdw-072pk"
  },
  {
    brand: "Topline",
    productName: "N Model Ver III 5 Spoke Concave Rims TITANIUM SILVER 6mm - 8MM [Topline RC] TDW-062TS TDW-082TS",
    modelNumber: "TDW-062TS / TDW-082TS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n-model-ver-iii-5-spoke-concave-rims-titanium-silver-6mm-8mm-topline-rc-tdw-062ts-tdw-082ts"
  },
  {
    brand: "Topline",
    productName: "N Model Ver III 5 Spoke Concave Wheels (Maziora) Purple/Green Iridescent 5mm 6mm 8MM [Topline RC] TDW-082MJ TDW-062MJ TDW-052MJ",
    modelNumber: "TDW-052MJ / TDW-062MJ / TDW-082MJ?",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n-model-ver-iii-5-spoke-concave-rims-maziora-purple-green-pearl-iridescent-5mm-8mm-topline-rc-tdw-082mj-tdw-052mj"
  },
  {
    brand: "Topline",
    productName: "N Model Ver III Deep Face Concave Rims (Bronze Gun Metal) 6mm - 7mm - 8mm [Topline RC]",
    modelNumber: "TDW-082BR / TDW-062BR / TDW-074BR",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n-model-ver-iii-deep-face-concave-rims-bronze-gun-metal-6mm-7mm-8mm-topline-rc",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    canonicalProductId: "topline-n-model-ver-iii-deep-face-concave-wheel",
    reasonHidden: "Collapsed into the Topline N Model Ver III Deep Face Concave Wheel variant family."
  },
  {
    brand: "Topline",
    productName: "N Model Ver III Deep Face Concave Rims (WHITE) 5mm - 6mm - 7mm - 8mm [Topline RC]",
    modelNumber: "TDW-062WH / TDW-082WH / TDW-052WH / TDW-074WH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n-model-ver-iii-deep-face-concave-rims-white-5mm-6mm-7mm-8mm-topline-rc",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    canonicalProductId: "topline-n-model-ver-iii-deep-face-concave-wheel",
    reasonHidden: "Collapsed into the Topline N Model Ver III Deep Face Concave Wheel variant family."
  },
  {
    brand: "Topline",
    productName: "N Model Ver III Deep Face Concave Rims (Yellow) 5mm - 6mm - 7mm - 8mm [Topline RC]",
    modelNumber: "TDW-082Y / TDW-062Y / TDW-074Y / TDW-054Y",
    sourceUrl: "https://supergdrift.com/collections/rims/products/n-model-ver-iii-deep-face-concave-rims-yellow-5mm-6mm-7mm-8mm-topline-rc",
    tuneSelectable: false,
    hiddenFromTuneBuilder: true,
    canonicalProductId: "topline-n-model-ver-iii-deep-face-concave-wheel",
    reasonHidden: "Collapsed into the Topline N Model Ver III Deep Face Concave Wheel variant family."
  },
  {
    brand: "Topline",
    productName: "NF MESH ver. 71 - MATTE CHROME 6mm - 8mm 1-10 RC RIMS 26MM WIDE [Topline] EW-0406MC EW-0408MC",
    modelNumber: "EW-0406MC / EW-0408MC",
    sourceUrl: "https://supergdrift.com/collections/rims/products/nf-mesh-ver-71-matte-chrome-6mm-8mm-1-10-rc-rims-26mm-wide-topline-ew-0406mc-ew-0408mc"
  },
  {
    brand: "Topline",
    productName: "NF Multi Spoke MATTE CHROME 6mm - 8mm 1-10 RC RIMS 26MM WIDE [Topline] EW-0306MC EW-0308MC",
    modelNumber: "EW-0306MC / EW-0308MC",
    sourceUrl: "https://supergdrift.com/collections/rims/products/nf-multi-spoke-matte-chrome-6mm-8mm-1-10-rc-rims-26mm-wide-topline-ew-0306mc-ew-0308mc"
  },
  {
    brand: "Topline",
    productName: "NMODEL VER3 N MODEL III 3 - SUPER HIGH TRACTION 5mm 6mm 7mm 8mm BLACK RIMS [TOPLINE] TDW-055BK TDW-065BK TDW-075BK TDW-085BK",
    modelNumber: "TDW-055BK / TDW-065BK / TDW-075BK / TDW-085BK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/nmodel-ver3-n-model-iii-3-super-high-traction-5mm-6mm-7mm-8mm-black-rims-topline-tdw-055bk-tdw-065bk-tdw-075bk-tdw-085bk"
  },
  {
    brand: "Topline",
    productName: "NMODEL VER3 N MODEL III 3 - SUPER HIGH TRACTION 5mm 6mm 7mm 8mm WHITE RIMS [TOPLINE] TDW-055WH TDW-065WH TDW-075WH TDW-085WH",
    modelNumber: "TDW-055WH / TDW-065WH / TDW-075WH / TDW-085WH",
    sourceUrl: "https://supergdrift.com/collections/rims/products/nmodel-ver3-n-model-iii-3-super-high-traction-5mm-6mm-7mm-8mm-white-rims-topline-tdw-055wh-tdw-065wh-tdw-075wh-tdw-085wh"
  },
  {
    brand: "Topline",
    productName: "SSR AGLE MINERVA 6MM / 8MM BLACK Rims [Topline] TDW-063BK TDW-083BK",
    modelNumber: "TDW-063BK / TDW-083BK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-agile-minerva-8mm-black-rims-topline-tdw-083bk"
  },
  {
    brand: "Topline",
    productName: "SSR MINERVA MATTE CHROME 6mm - 8mm 1-10 RC RIMS ** 30MM WIDE ** [Topline] TDW-0263MC TDW-0283MC",
    modelNumber: "TDW-0263MC / TDW-0283MC",
    sourceUrl: "https://supergdrift.com/collections/rims/products/ssr-minerva-matte-chrome-6mm-8mm-1-10-rc-rims-30mm-wide-topline-tdw-0263mc-tdw-0283mc"
  },
  {
    brand: "Topline",
    productName: "Watanabe F8 +10mm(Gold) 1/10 RIMS - 2 PACK [Topline] WAT-100G",
    modelNumber: "WAT-100G",
    sourceUrl: "https://supergdrift.com/collections/rims/products/watanabe-f8-10mmgold-4-pack-topline-wat-100g"
  },
  {
    brand: "Topline",
    productName: "Work Emotion CR3P CHROME 6mm 8mm 1-10 DRIFT RIMS [LAB] LW-0606Ca LW-0608Ca",
    modelNumber: "LW-0606Ca / LW-0608Ca",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-emotion-cr3p-chrome-6mm-8mm-1-10-drift-rims-lab-lw-0606c-lw-0608c"
  },
  {
    brand: "Topline",
    productName: "Work Equip SILVER FACE BLACK LIP 6mm 8mm 1-10 DRIFT RIMS [LAB] LW0106BS LW-0108BS",
    modelNumber: "LW-0106BS / LW-0108BS",
    sourceUrl: "https://supergdrift.com/collections/rims/products/work-equip-silver-face-black-lip-6mm-8mm-1-10-drift-rims-lab-lw0106bs-lw-0108bs"
  },
  {
    brand: "Topline",
    productName: "Yokohama AVS Model T7 Concave Rims (PINK) 5mm 6mm 8mm [TOPLINE]",
    modelNumber: "DW-1225PI / IW-1206PK / IW-1208PK",
    sourceUrl: "https://supergdrift.com/collections/rims/products/yokohama-avs-model-t7-concave-rims-yellow-5mm-mikuni"
  },
  {
    brand: "Yokomo",
    productName: "Racing Performer 6 Spoke (Black) Rims - 6mm - 8mm [Yokomo] RP-6213B6 RP-6213B8",
    modelNumber: "RP-6213B8A / RP-6213B6A",
    sourceUrl: "https://supergdrift.com/collections/rims/products/yokomo-racing-performer-6-spoke-black-rims-6mm-8mm-rp-6213b6-rp-6213b8"
  },
  {
    brand: "Yokomo",
    productName: "Racing Performer 6 Spoke HIGH TRACTION VINTAGE (Inch Down) - 6mm RIMS - YELLOW WHITE TITANIUM BRONZE [Yokomo] RP-6313W6 RP-6313Y6 RP-6313T6",
    modelNumber: "RP-6313T6A / RP-6313W6A / RP-6313Y6A",
    sourceUrl: "https://supergdrift.com/collections/rims/products/racing-performer-6-spoke-high-traction-vintage-inch-down-6mm-yokomo-rp-6313w6-rp-6313y6-rp-6313t6"
  },
  {
    brand: "Yokomo",
    productName: "TE37 Style 6 Spoke (Black) Rims - 5mm - 7mm [Yokomo] TW-5313B5 TW-5313B7",
    modelNumber: "TW-5313B5 / TW-5313B7",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te37-style-6-spoke-black-rims-5mm-7mm-yokomo-tw-5313b5-tw-5313b7"
  },
  {
    brand: "Yokomo",
    productName: "TE37 Style 6 Spoke (White) Rims - 5mm - 7mm [Yokomo] TW-5313W5 TW-5313W7",
    modelNumber: "TW-5313W5 / TW-5313W7",
    sourceUrl: "https://supergdrift.com/collections/rims/products/te37-style-6-spoke-white-rims-5mm-7mm-yokomo-tw-5313w5-tw-5313w7"
  },
];

const wheelTunableParameters = ["offset", "diameter", "width", "color", "front/rear use", "notes"];

function wheelId(product: SourcedWheelProduct, suffix = "") {
  return `${product.brand}-${product.productName}${suffix}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

function wheelCatalogItem(product: SourcedWheelProduct, category: "frontWheels" | "rearWheels"): ProductCatalogItem {
  return {
    id: wheelId(product, category === "rearWheels" ? " rear" : " front"),
    category,
    brand: product.brand,
    productName: product.productName,
    simplifiedName: product.simplifiedName,
    displayName: product.displayName,
    modelNumber: product.modelNumber,
    compatibleChassis: ["Universal"],
    notes: "Sourced wheel/rim product. Verify fitment and offset before ordering.",
    tunableParameters: wheelTunableParameters,
    sourceUrl: product.sourceUrl,
    userAdded: false,
    verified: true,
    tuneSelectable: product.tuneSelectable,
    hiddenFromTuneBuilder: product.hiddenFromTuneBuilder,
    reasonHidden: product.reasonHidden,
    canonicalProductId: product.canonicalProductId,
    variants: product.variants
  };
}

export const sourcedWheelCatalogItems: ProductCatalogItem[] = sourcedWheelProducts.flatMap((product) => [
  wheelCatalogItem(product, "frontWheels"),
  wheelCatalogItem(product, "rearWheels")
]);

export const sourcedWheelRcParts: RcPart[] = sourcedWheelProducts.map((product) => ({
  brand: product.brand,
  model: product.productName,
  slug: wheelId(product),
  category: "wheel",
  subcategory: "drift-wheel",
  notes: product.modelNumber ? `SKU: ${product.modelNumber}` : "Sourced wheel/rim product"
}));
