import type { ElectronicsCategory, Tune, TuneElectronicsItem } from "../types";

export type RcPartCategory = ElectronicsCategory | "radio" | "tire" | "wheel" | "accessory";

export interface RcPart {
  brand: string;
  model: string;
  slug: string;
  category: RcPartCategory;
  subcategory?: string;
  notes?: string;
  discontinued?: boolean;
  custom?: boolean;
}

export const rcParts: RcPart[] = [
  { brand: "Yokomo", model: "SP-02D", slug: "yokomo-sp-02d", category: "servo", subcategory: "drift-servo" },
  { brand: "Yokomo", model: "SP-03D", slug: "yokomo-sp-03d", category: "servo", subcategory: "drift-servo" },
  { brand: "Yokomo", model: "SP-03D V2", slug: "yokomo-sp-03d-v2", category: "servo", subcategory: "drift-servo" },
  { brand: "Reve D", model: "RS-ST", slug: "reve-d-rs-st", category: "servo", subcategory: "drift-servo" },
  { brand: "Reve D", model: "RS-ST PRO", slug: "reve-d-rs-st-pro", category: "servo", subcategory: "drift-servo" },
  { brand: "Futaba", model: "CT700", slug: "futaba-ct700", category: "servo", subcategory: "drift-servo" },
  { brand: "Sanwa", model: "PGS-LH II", slug: "sanwa-pgs-lh-ii", category: "servo", subcategory: "drift-servo" },

  { brand: "Yokomo", model: "DX1 Type-R", slug: "yokomo-dx1-type-r", category: "motor", subcategory: "brushless-drift" },
  { brand: "Yokomo", model: "DX1 Type-T", slug: "yokomo-dx1-type-t", category: "motor", subcategory: "brushless-drift" },
  { brand: "Yokomo", model: "DX1 Type-R Titanium Shaft 10.5T", slug: "yokomo-dx1-type-r-titanium-10-5t", category: "motor", subcategory: "brushless-drift" },
  { brand: "Yokomo", model: "DX2 Type-R 11.5T", slug: "yokomo-dx2-type-r-11-5t", category: "motor", subcategory: "brushless-drift" },
  { brand: "Yokomo", model: "DX2 Type-R 13.5T", slug: "yokomo-dx2-type-r-13-5t", category: "motor", subcategory: "brushless-drift" },
  { brand: "Yokomo", model: "DX2 Type-R 15.5T", slug: "yokomo-dx2-type-r-15-5t", category: "motor", subcategory: "brushless-drift" },
  { brand: "Yokomo", model: "Racing Performer", slug: "yokomo-racing-performer-motor", category: "motor", subcategory: "brushless-drift" },
  { brand: "Yokomo", model: "ZERO-S Drift 10.5T", slug: "yokomo-zero-s-drift-10-5t", category: "motor", subcategory: "brushless-drift" },
  { brand: "Yokomo", model: "ZERO-S Drift 13.5T", slug: "yokomo-zero-s-drift-13-5t", category: "motor", subcategory: "brushless-drift" },
  { brand: "Reve D", model: "Absolute1", slug: "reve-d-absolute1", category: "motor", subcategory: "brushless-drift" },
  { brand: "Acuvance", model: "Fledge", slug: "acuvance-fledge", category: "motor", subcategory: "brushless-drift" },
  { brand: "Acuvance", model: "Luxon Agile", slug: "acuvance-luxon-agile", category: "motor", subcategory: "brushless-drift" },
  { brand: "Maclan", model: "MDP Drift Performance Motor", slug: "maclan-mdp-drift-performance-motor", category: "motor", subcategory: "brushless-drift" },
  { brand: "Maclan", model: "MRR Motor", slug: "maclan-mrr-motor", category: "motor", subcategory: "brushless-drift" },
  { brand: "Overdose x Acuvance", model: "OD Factory Tuned Spec", slug: "overdose-acuvance-od-factory-tuned-spec", category: "motor", subcategory: "brushless-drift" },

  { brand: "Yokomo", model: "BL-R100", slug: "yokomo-bl-r100", category: "esc", subcategory: "drift-esc" },
  { brand: "Yokomo", model: "BL-R160", slug: "yokomo-bl-r160", category: "esc", subcategory: "drift-esc" },
  { brand: "Yokomo", model: "BL-PRO4", slug: "yokomo-bl-pro4", category: "esc", subcategory: "drift-esc" },
  { brand: "Yokomo", model: "BL-SP4", slug: "yokomo-bl-sp4", category: "esc", subcategory: "drift-esc" },
  { brand: "Yokomo", model: "RPX II", slug: "yokomo-rpx-ii", category: "esc", subcategory: "drift-esc" },
  { brand: "Reve D", model: "BREVE RD Spec", slug: "reve-d-breve-rd-spec", category: "esc", subcategory: "drift-esc" },
  { brand: "Reve D", model: "ELITE", slug: "reve-d-elite", category: "esc", subcategory: "drift-esc" },
  { brand: "Acuvance", model: "XARVIS", slug: "acuvance-xarvis", category: "esc", subcategory: "drift-esc" },
  { brand: "Acuvance", model: "XARVIS XX", slug: "acuvance-xarvis-xx", category: "esc", subcategory: "drift-esc" },
  { brand: "Acuvance", model: "RAD", slug: "acuvance-rad", category: "esc", subcategory: "drift-esc" },
  { brand: "Maclan", model: "MDP 160", slug: "maclan-mdp-160", category: "esc", subcategory: "drift-esc" },
  { brand: "Maclan", model: "MDP 160 Flow Edition", slug: "maclan-mdp-160-flow-edition", category: "esc", subcategory: "drift-esc" },
  { brand: "Hobbywing", model: "XR10 Justock", slug: "hobbywing-xr10-justock", category: "esc", subcategory: "drift-esc" },
  { brand: "Hobbywing", model: "XR10 Pro", slug: "hobbywing-xr10-pro", category: "esc", subcategory: "drift-esc" },

  { brand: "Yokomo", model: "DP-302 V4", slug: "yokomo-dp-302-v4", category: "gyro", subcategory: "drift-gyro" },
  { brand: "Yokomo", model: "YG-302V2", slug: "yokomo-yg-302v2", category: "gyro", subcategory: "drift-gyro" },
  { brand: "Reve D", model: "REVOX", slug: "reve-d-revox", category: "gyro", subcategory: "drift-gyro" },
  { brand: "Futaba", model: "GYD550", slug: "futaba-gyd550", category: "gyro", subcategory: "drift-gyro" },
  { brand: "Futaba", model: "GYD560", slug: "futaba-gyd560", category: "gyro", subcategory: "drift-gyro" },
  { brand: "Sanwa", model: "SGS-02", slug: "sanwa-sgs-02", category: "gyro", subcategory: "drift-gyro" },

  { brand: "Futaba", model: "10PX", slug: "futaba-10px", category: "radio", subcategory: "transmitter" },
  { brand: "Futaba", model: "4PM Plus", slug: "futaba-4pm-plus", category: "radio", subcategory: "transmitter" },
  { brand: "Sanwa", model: "M17", slug: "sanwa-m17", category: "radio", subcategory: "transmitter" },
  { brand: "Sanwa", model: "MT-5", slug: "sanwa-mt-5", category: "radio", subcategory: "transmitter" },
  { brand: "Futaba", model: "R404SBS", slug: "futaba-r404sbs", category: "receiver", subcategory: "receiver" },
  { brand: "Sanwa", model: "RX-493i", slug: "sanwa-rx-493i", category: "receiver", subcategory: "receiver" },

  { brand: "Gens Ace", model: "Redline 2S Shorty", slug: "gens-ace-redline-2s-shorty", category: "battery", subcategory: "2s-shorty" },
  { brand: "Gens Ace", model: "3500mAh HV Shorty", slug: "gens-ace-3500mah-hv-shorty", category: "battery", subcategory: "2s-shorty" },
  { brand: "Reedy", model: "Zappers SG5 Shorty", slug: "reedy-zappers-sg5-shorty", category: "battery", subcategory: "2s-shorty" },

  { brand: "DS Racing", model: "LF-4", slug: "ds-racing-lf-4", category: "tire", subcategory: "drift-tire" },
  { brand: "DS Racing", model: "LF-5", slug: "ds-racing-lf-5", category: "tire", subcategory: "drift-tire" },
  { brand: "DS Racing", model: "LF-3", slug: "ds-racing-lf-3", category: "tire", subcategory: "drift-tire" },
  { brand: "Reve D", model: "AS-01", slug: "reve-d-as-01", category: "tire", subcategory: "drift-tire" },
  { brand: "Yokomo", model: "DRA", slug: "yokomo-dra", category: "tire", subcategory: "drift-tire" },
  { brand: "Yokomo", model: "DRA Asphalt", slug: "yokomo-dra-asphalt", category: "tire", subcategory: "drift-tire" },
  { brand: "Yokomo", model: "DRC Carpet / P-Tile", slug: "yokomo-drc-carpet-p-tile", category: "tire", subcategory: "drift-tire" },
  { brand: "Yokomo", model: "DRC Pre-Assembled", slug: "yokomo-drc-pre-assembled", category: "tire", subcategory: "drift-tire" },
  { brand: "Yokomo", model: "DRP P-Tile", slug: "yokomo-drp-p-tile", category: "tire", subcategory: "drift-tire" },
  { brand: "MST", model: "CSR", slug: "mst-csr", category: "tire", subcategory: "drift-tire" },

  { brand: "Reve D", model: "UL12", slug: "reve-d-ul12", category: "wheel", subcategory: "drift-wheel" },
  { brand: "Yokomo", model: "Racing Performer Wheel", slug: "yokomo-racing-performer-wheel", category: "wheel", subcategory: "drift-wheel" },
  { brand: "MST", model: "Adjustable Offset Wheel", slug: "mst-adjustable-offset-wheel", category: "wheel", subcategory: "drift-wheel" },

  { brand: "Muchmore", model: "Fleta ZX V2 Fan", slug: "muchmore-fleta-zx-v2-fan", category: "accessory", subcategory: "motor-fan" },
  { brand: "Yeah Racing", model: "Tornado High Speed Fan", slug: "yeah-racing-tornado-high-speed-fan", category: "accessory", subcategory: "esc-fan" },
  { brand: "Acuvance", model: "Chevalier Trace", slug: "acuvance-chevalier-trace", category: "accessory", subcategory: "capacitor" },
  { brand: "Hobbywing", model: "Non-Polarity Capacitor Module", slug: "hobbywing-non-polarity-capacitor-module", category: "accessory", subcategory: "capacitor" }
];

export function partsByCategory(category: RcPartCategory, subcategory?: string) {
  return rcParts.filter((part) => part.category === category && (!subcategory || part.subcategory === subcategory));
}

export function partLabel(part: Pick<RcPart, "brand" | "model">) {
  return `${part.brand} ${part.model}`.trim();
}

export function findPartBySlug(slug?: string) {
  return rcParts.find((part) => part.slug === slug);
}

export function matchKnownPart(category: RcPartCategory, value?: string) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return undefined;
  return partsByCategory(category).find((part) => part.slug === normalized || partLabel(part).toLowerCase() === normalized || normalized.includes(part.model.toLowerCase()));
}

export function electronicsItemFromPart(part: RcPart, existing?: TuneElectronicsItem): TuneElectronicsItem {
  return {
    brand: part.brand,
    model: part.model,
    slug: part.slug,
    customName: "",
    settings: existing?.settings ?? {},
    notes: existing?.notes ?? "",
    turns: existing?.turns,
    timing: existing?.timing,
    rotor: existing?.rotor,
    firmware: existing?.firmware,
    gain: existing?.gain,
    mode: existing?.mode
  };
}

export function partDisplayForTune(tune: Tune, category: RcPartCategory, legacyFields: string[], item?: TuneElectronicsItem) {
  if (item?.customName) return item.customName;
  if (item?.brand || item?.model) return [item.brand, item.model].filter(Boolean).join(" ");
  const legacy = legacyFields.map((field) => String(tune.values[field] ?? "")).filter(Boolean).join(" ");
  const known = matchKnownPart(category, legacy);
  return known ? partLabel(known) : legacy;
}
