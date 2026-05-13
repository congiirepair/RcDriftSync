import type { Car, Tune } from "../types";

export interface ChassisBrandSeed {
  name: string;
  slug: string;
  logoLight: string;
  logoDark: string;
  logoMark: string;
  logoWordmark?: string;
  fallbackLogoText: string;
  brandColorAccent: string;
  models: string[];
}

export interface ChassisDisplayInfo {
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
  isFallback: boolean;
}

export const chassisBrands: ChassisBrandSeed[] = [
  {
    name: "Yokomo",
    slug: "yokomo",
    logoLight: "/brand-logos/yokomo-light.svg",
    logoDark: "/brand-logos/yokomo-dark.svg",
    logoMark: "/brand-logos/yokomo-mark.svg",
    fallbackLogoText: "Yokomo",
    brandColorAccent: "#FFFFFF",
    models: [
      "RD 1.0",
      "RD 2.0",
      "SD 1.0",
      "SD 2.0",
      "SD 3.0",
      "MD 1.0",
      "MD 2.0",
      "MD 3.0",
      "YD-2",
      "YD-2E",
      "YD-2S",
      "YD-2SX",
      "YD-2SXII",
      "YD-2SXIII",
      "YD-2Z",
      "YD-2 ZX",
      "YD-2RX",
      "YD-4",
      "DIB",
      "DRB",
      "Custom"
    ]
  },
  {
    name: "Reve D",
    slug: "reve-d",
    logoLight: "/brand-logos/reve-d-user-mark-20260509.svg",
    logoDark: "/brand-logos/reve-d-user-mark-20260509.svg",
    logoMark: "/brand-logos/reve-d-user-mark-20260509.svg",
    logoWordmark: "/brand-logos/reve-d-user-mark-20260509.svg",
    fallbackLogoText: "Reve D",
    brandColorAccent: "#59D6FF",
    models: ["RDX", "MC-1", "MC-2", "MC-III", "Custom"]
  },
  {
    name: "Overdose",
    slug: "overdose",
    logoLight: "/brand-logos/overdose-light.svg",
    logoDark: "/brand-logos/overdose-dark.svg",
    logoMark: "/brand-logos/overdose-mark.svg",
    fallbackLogoText: "Overdose",
    brandColorAccent: "#FFFFFF",
    models: ["GALM", "GALM V2", "XEX", "XEX V2", "Vacula", "Divall", "TC Flex", "Custom"]
  },
  {
    name: "Rhino Racing",
    slug: "rhino-racing",
    logoLight: "/brand-logos/rhino-racing-light.svg",
    logoDark: "/brand-logos/rhino-racing-dark.svg",
    logoMark: "/brand-logos/rhino-racing-mark.svg",
    fallbackLogoText: "Rhino",
    brandColorAccent: "#FFFFFF",
    models: ["Shark", "Shark Final Form", "RMX Shark Conversion", "RTS 1/24", "Custom"]
  },
  {
    name: "Sakura",
    slug: "sakura",
    logoLight: "/brand-logos/sakura-3racing-user-20260509.svg",
    logoDark: "/brand-logos/sakura-3racing-user-20260509.svg",
    logoMark: "/brand-logos/sakura-3racing-user-20260509.svg",
    logoWordmark: "/brand-logos/sakura-3racing-user-20260509.svg",
    fallbackLogoText: "Sakura",
    brandColorAccent: "#FFFFFF",
    models: ["D3", "D4", "D5", "D5S", "D5S Lite", "D6", "D6S", "D6GA", "D6 Sport", "D6 Ultimate", "Custom"]
  },
  {
    name: "MST",
    slug: "mst",
    logoLight: "/brand-logos/mst-light.svg",
    logoDark: "/brand-logos/mst-dark.svg",
    logoMark: "/brand-logos/mst-mark.svg",
    fallbackLogoText: "MST",
    brandColorAccent: "#FFFFFF",
    models: ["RMX 2.0", "RMX 2.5", "RMX EX", "RMX-M", "RMX 4", "RMX 4 S PRO", "FXX", "FXX-D", "FSX", "RFX", "MS-01D", "Custom"]
  },
  {
    name: "GRK",
    slug: "grk",
    logoLight: "/brand-logos/grk-light.svg",
    logoDark: "/brand-logos/grk-dark.svg",
    logoMark: "/brand-logos/grk-mark.svg",
    fallbackLogoText: "GRK",
    brandColorAccent: "#FFFFFF",
    models: ["GRK5-R", "GRK5", "GRK4", "GRK Global Standard2 EVO", "GRK-M", "GRK Global", "GRK Global Standard", "GRK Global Standard 2", "GRK GS2", "GRK GS2 EVO", "GS2MOD / GRK GS2 Modified", "GRK GS2 Modified", "GRK4 EVO", "GRK5R", "GRK3", "GRK3 Plus", "GRK5 Racing Conversion Chassis", "GRK5-R Conversion Set", "GS2EVO Competition Conversion Chassis", "HRP Conversion Chassis Kit", "EVO-R Conversion Chassis Set", "Custom"]
  },
  {
    name: "Shibata",
    slug: "shibata",
    logoLight: "/brand-logos/shibata-light.svg",
    logoDark: "/brand-logos/shibata-dark.svg",
    logoMark: "/brand-logos/shibata-mark.svg",
    fallbackLogoText: "Shibata",
    brandColorAccent: "#FFFFFF",
    models: ["DR GRK", "GRK5-R", "GRK5", "GRK4", "GRK Global Standard2 EVO", "GRK-M", "GRK Global", "GRK Global Standard", "GRK Global Standard 2", "GRK GS2", "GRK GS2 EVO", "GS2MOD / GRK GS2 Modified", "GRK4 EVO", "GRK5R", "GRK5 Racing Conversion Chassis", "GRK5-R Conversion Set", "GS2EVO Competition Conversion Chassis", "HRP Conversion Chassis Kit", "EVO-R Conversion Chassis Set", "Custom"]
  },
  {
    name: "Team Associated",
    slug: "team-associated",
    logoLight: "/brand-logos/team-associated-light.svg",
    logoDark: "/brand-logos/team-associated-dark.svg",
    logoMark: "/brand-logos/team-associated-mark.svg",
    fallbackLogoText: "Team Associated",
    brandColorAccent: "#FFFFFF",
    models: ["DC10", "DC10 RTR", "Custom"]
  },
  {
    name: "Other / Custom",
    slug: "other",
    logoLight: "/brand-logos/custom-chassis-light.svg",
    logoDark: "/brand-logos/custom-chassis-dark.svg",
    logoMark: "/brand-logos/custom-chassis-mark.svg",
    fallbackLogoText: "Custom",
    brandColorAccent: "#59D6FF",
    models: ["Custom"]
  }
];

export const otherChassisBrand = chassisBrands[chassisBrands.length - 1];

export function slugifyChassis(value: string) {
  return value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

export function findChassisBrand(slugOrName?: string) {
  const normalized = slugifyChassis(slugOrName ?? "");
  return chassisBrands.find((brand) => brand.slug === normalized || slugifyChassis(brand.name) === normalized);
}

export function modelsForBrand(slugOrName?: string) {
  return (findChassisBrand(slugOrName) ?? otherChassisBrand).models;
}

function inferBrandFromText(text: string) {
  const lower = text.toLowerCase();
  return chassisBrands.find((brand) => {
    if (brand.slug === "other") return false;
    return lower.includes(brand.name.toLowerCase()) || lower.includes(brand.slug.replace(/-/g, " "));
  });
}

function inferModelForBrand(text: string, brand: ChassisBrandSeed) {
  const lower = text.toLowerCase();
  return brand.models.find((model) => model !== "Custom" && lower.includes(model.toLowerCase()));
}

export function chassisInfoFromCar(car?: Car | null): ChassisDisplayInfo {
  const text = `${car?.brand ?? ""} ${car?.chassis ?? ""} ${car?.chassisModel ?? ""}`.trim();
  const brand = findChassisBrand(car?.chassisBrandSlug ?? car?.brand) ?? inferBrandFromText(text) ?? otherChassisBrand;
  const model = car?.chassisModel || inferModelForBrand(text, brand) || (brand.slug === "other" ? car?.chassis || "Custom" : "Unknown / Other");
  return {
    brand: brand.slug === "other" && car?.brand ? car.brand : brand.name,
    brandSlug: brand.slug,
    model,
    modelSlug: slugifyChassis(model),
    isFallback: !car?.chassisBrandSlug && !car?.brand
  };
}

export function chassisInfoFromTune(tune: Tune, car?: Car | null): ChassisDisplayInfo {
  const carInfo = chassisInfoFromCar(car);
  const text = `${tune.chassisBrand ?? ""} ${tune.chassisModel ?? ""} ${tune.values.chassis ?? ""} ${tune.tags.join(" ")} ${car?.chassis ?? ""} ${car?.chassisModel ?? ""}`.trim();
  const brand = findChassisBrand(tune.chassisBrandSlug ?? tune.chassisBrand) ?? inferBrandFromText(text) ?? findChassisBrand(carInfo.brandSlug) ?? otherChassisBrand;
  const customBrand = tune.customChassisBrand?.trim();
  const customModel = tune.customChassisModel?.trim();
  const model = customModel || tune.chassisModel || inferModelForBrand(text, brand) || carInfo.model || "Unknown / Other";
  return {
    brand: brand.slug === "other" && customBrand ? customBrand : brand.name,
    brandSlug: brand.slug,
    model,
    modelSlug: tune.chassisModelSlug || slugifyChassis(model),
    isFallback: !tune.chassisBrandSlug && !tune.chassisBrand && carInfo.isFallback
  };
}

export function chassisSearchText(tune: Tune, car?: Car | null) {
  const info = chassisInfoFromTune(tune, car);
  return `${info.brand} ${info.model} ${tune.chassisVariant ?? ""} ${tune.customChassisBrand ?? ""} ${tune.customChassisModel ?? ""}`;
}
