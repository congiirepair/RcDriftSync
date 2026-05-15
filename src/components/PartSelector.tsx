import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { catalogBrandsByCategory, catalogOptionLabel, filterProductCatalog, getProductCatalog, type ProductCatalogCategory, type ProductCatalogItem, type ProductCatalogVariant } from "../features/catalog";
import { formatFormLabel } from "../utils/formLabels";

export interface PartSelectorValue {
  brand?: string;
  brandSlug?: string;
  model?: string;
  modelSlug?: string;
  partNumber?: string;
  customName?: string;
  notes?: string;
  catalogItemId?: string;
  canonicalProductId?: string;
  canonicalVariantId?: string;
  variantLabel?: string;
  imageUrl?: string;
  category?: ProductCatalogCategory;
  isCustom?: boolean;
}

interface PartSelectorProps {
  label: string;
  category: ProductCatalogCategory;
  value: PartSelectorValue;
  emptyLabel?: string;
  allowStock?: boolean;
  allowNotApplicable?: boolean;
  allowSupportParts?: boolean;
  helper?: string;
  onChange: (value: PartSelectorValue) => void;
}

const RECENT_PARTS_KEY = "rcds-recent-part-selector-values";
const MAX_RECENT_PER_CATEGORY = 8;

function selectorCategories(category: ProductCatalogCategory): ProductCatalogCategory[] {
  if (category === "frontToeBlocks" || category === "rearToeBlocks") return ["frontToeBlocks", "rearToeBlocks"];
  return [category];
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function text(value?: string) {
  return (value ?? "").trim();
}

function partValueFromItem(item: ProductCatalogItem, variant?: ProductCatalogVariant): PartSelectorValue {
  const partNumber = variant?.sku || item.partNumber || item.modelNumber;
  const model = cleanPartTitle(catalogOptionLabel(item), partNumber);
  return {
    brand: item.brand,
    brandSlug: slugify(item.brand),
    model,
    modelSlug: slugify(model),
    partNumber,
    notes: variant?.displayName ? `Variant: ${variant.displayName}` : "",
    catalogItemId: item.id,
    canonicalProductId: item.canonicalProductId || item.id,
    canonicalVariantId: variant?.id || item.canonicalVariantId,
    variantLabel: variant?.displayName,
    imageUrl: item.imageUrl,
    category: item.category,
    isCustom: false
  };
}

function selectedTitle(value: PartSelectorValue) {
  if (value.isCustom) return value.customName || value.model || "Custom part";
  return value.model || value.customName || "";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanPartTitle(label: string, partNumber?: string) {
  const cleanPart = text(partNumber).toUpperCase();
  const partTokens = cleanPart.split(/[\s,/]+/).filter(Boolean);
  const partPattern = partTokens.length ? partTokens.map(escapeRegExp).join("|") : "";
  let next = label
    .replace(/\bSourced wizard catalog product\.?\s*/gi, "")
    .replace(/\bVerify exact fitment before ordering\.?\s*/gi, "")
    .replace(/\(\s*(?:left|right)\s+(?:or|\/)\s+(?:left|right)\s*\)/gi, " ")
    .replace(/\(\s*(?:left|right)\s+side\s*\)/gi, " ")
    .replace(/\b(?:left|right)\s+(?:or|\/)\s+(?:left|right)\b/gi, " ")
    .replace(/\b(?:left|right)\s+side\b/gi, " ")
    .replace(/\b(?:left|right)\b/gi, " ")
    .replace(/\b(?:lh|rh|l\/h|r\/h)\b/gi, " ")
    .replace(/\b(?:l\/r|r\/l)\b/gi, " ")
    .replace(/\b(?:replacement|spare|optional?|option|upgrade)\s+parts?\b/gi, " ")
    .replace(/\b(?:replacement|spare)\b/gi, " ")
    .replace(/\b(?:set|kit)\b/gi, " ")
    .replace(/\[\s*\]/g, "")
    .replace(/\[\s*(?:[A-Z0-9][A-Z0-9.-]*\s*)+\]/gi, (match) => {
      const contents = match.slice(1, -1).trim().split(/\s+/);
      return contents.length && contents.every((token) => /^(?=.*\d)[A-Z0-9][A-Z0-9.-]*$/i.test(token)) ? " " : match;
    });
  if (cleanPart) {
    next = next
      .replace(new RegExp(`\\s*\\(?\\b${escapeRegExp(cleanPart)}\\b\\)?\\s*`, "gi"), " ")
      .replace(partPattern ? new RegExp(`\\s*\\(?\\b(?:${partPattern})\\b\\)?\\s*`, "gi") : /$^/, " ");
  }
  return next
    .replace(/\(\s*\)/g, "")
    .replace(/\s*[-–—]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function recentStorageAvailable() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function recentKey(value: PartSelectorValue) {
  return [value.brand, value.model || value.customName, value.canonicalVariantId, value.partNumber].filter(Boolean).join("|").toLowerCase();
}

function loadRecentParts(category: ProductCatalogCategory): PartSelectorValue[] {
  if (!recentStorageAvailable()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_PARTS_KEY) || "{}") as Record<string, PartSelectorValue[]>;
    return Array.isArray(parsed[category]) ? parsed[category] : [];
  } catch {
    return [];
  }
}

function saveRecentPart(category: ProductCatalogCategory, value: PartSelectorValue) {
  if (!recentStorageAvailable()) return;
  const model = text(value.model || value.customName);
  if (!model || model === "Not applicable") return;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_PARTS_KEY) || "{}") as Record<string, PartSelectorValue[]>;
    const current = Array.isArray(parsed[category]) ? parsed[category] : [];
    const next = [{ ...value, category }, ...current.filter((item) => recentKey(item) !== recentKey(value))].slice(0, MAX_RECENT_PER_CATEGORY);
    window.localStorage.setItem(RECENT_PARTS_KEY, JSON.stringify({ ...parsed, [category]: next }));
  } catch {
    // Recent choices are a convenience only; ignore storage failures.
  }
}

export function PartSelector({
  label,
  category,
  value,
  emptyLabel,
  allowStock = true,
  allowNotApplicable = true,
  allowSupportParts = false,
  helper,
  onChange
}: PartSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [showSupportParts, setShowSupportParts] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState({
    brand: value.brand || "",
    name: value.customName || value.model || "",
    partNumber: value.partNumber || "",
    notes: value.notes || ""
  });
  const selected = selectedTitle(value);
  const selectedPartNumber = text(value.partNumber);
  const categories = useMemo(() => selectorCategories(category), [category]);
  const brands = useMemo(
    () => Array.from(new Set(categories.flatMap((item) => catalogBrandsByCategory(item)))).sort((a, b) => a.localeCompare(b)),
    [categories]
  );
  const recentParts = useMemo(() => loadRecentParts(category), [category]);
  const catalogItems = useMemo(
    () => categories
      .flatMap((item) => filterProductCatalog(getProductCatalog(), {
        category: item,
        brand: brandFilter || undefined,
        query,
        tuneSelectableOnly: !showSupportParts,
        includeHiddenFromTuneBuilder: showSupportParts
      }))
      .filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index)
      .slice(0, 120),
    [brandFilter, categories, query, showSupportParts]
  );
  const catalogGroups = useMemo(() => {
    const groups = new Map<string, ProductCatalogItem[]>();
    catalogItems.forEach((item) => groups.set(item.brand, [...(groups.get(item.brand) ?? []), item]));
    return Array.from(groups.entries()).sort(([brandA], [brandB]) => brandA.localeCompare(brandB));
  }, [catalogItems]);

  function chooseItem(item: ProductCatalogItem, variant?: ProductCatalogVariant) {
    const next = partValueFromItem(item, variant);
    saveRecentPart(category, next);
    onChange(next);
    setOpen(false);
  }

  function saveCustom() {
    const brand = text(customDraft.brand) || "Custom";
    const model = text(customDraft.name) || "Custom part";
    const next = {
      brand,
      brandSlug: slugify(brand),
      model,
      modelSlug: slugify(model),
      customName: model,
      partNumber: text(customDraft.partNumber),
      notes: text(customDraft.notes),
      category,
      isCustom: true
    };
    saveRecentPart(category, next);
    onChange(next);
    setCustomOpen(false);
    setOpen(false);
  }

  function chooseSimple(labelValue: string) {
    const next = {
      brand: labelValue,
      brandSlug: slugify(labelValue),
      model: labelValue,
      modelSlug: slugify(labelValue),
      category,
      isCustom: false
    };
    saveRecentPart(category, next);
    onChange(next);
    setOpen(false);
  }

  const selectorDialog = open ? (
    <div className="partSelectorOverlay" role="presentation">
      <section className="partSelectorSheet" role="dialog" aria-modal="true" aria-label={`${formatFormLabel(label)} selector`}>
        <div className="partSelectorSheetHeader">
          <div>
            <span>Product Browser</span>
            <h3>{formatFormLabel(label)}</h3>
          </div>
          <button className="partSelectorCloseButton" type="button" aria-label="Back to tune" onClick={() => setOpen(false)}>
            <span className="partSelectorCloseText">Back</span>
            <X size={20} />
          </button>
        </div>

        <label className="partSelectorSearch">
          <Search size={18} />
          <input value={query} placeholder="Search brand, model, part number..." onChange={(event) => setQuery(event.target.value)} />
        </label>

        <div className="partSelectorBrandRail" aria-label="Brand filters">
          <button className={!brandFilter ? "active" : ""} type="button" onClick={() => setBrandFilter("")}>All</button>
          {brands.map((brand) => (
            <button key={brand} className={brandFilter === brand ? "active" : ""} type="button" onClick={() => setBrandFilter(brand)}>
              {brand}
            </button>
          ))}
        </div>

        <div className="partSelectorQuickActions">
          {allowStock ? <button type="button" onClick={() => chooseSimple("Stock")}>Use Stock</button> : null}
          {allowNotApplicable ? <button type="button" onClick={() => chooseSimple("Not applicable")}>Not applicable</button> : null}
          <button type="button" onClick={() => {
            setCustomDraft({ ...customDraft, name: query || customDraft.name });
            setCustomOpen((current) => !current);
          }}>{customOpen ? "Hide Custom" : "Use Custom"}</button>
          {selected ? <button type="button" onClick={() => {
            onChange({});
            setOpen(false);
          }}>Clear</button> : null}
        </div>
        {allowSupportParts ? (
          <label className="partSelectorSupportToggle">
            <input type="checkbox" checked={showSupportParts} onChange={(event) => setShowSupportParts(event.target.checked)} />
            <span>Show hardware / replacement parts</span>
          </label>
        ) : <div className="partSelectorSupportToggle partSelectorSupportTogglePlaceholder" aria-hidden="true" />}

        {!query && !brandFilter && recentParts.length ? (
          <div className="partSelectorRecent">
            <span>Recent choices</span>
            <div>
              {recentParts.map((part) => (
                <button key={recentKey(part)} type="button" onClick={() => {
                  saveRecentPart(category, part);
                  onChange(part);
                  setOpen(false);
                }}>
                  <strong>{part.brand || "Custom"}</strong>
                  <em>{part.model || part.customName}</em>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="partSelectorResults">
          {catalogGroups.map(([brand, items]) => (
            <div className="partSelectorBrandGroup" key={brand}>
              <div className="partSelectorBrandHeading">{brand}</div>
              {items.map((item) => (
                item.variants && item.variants.length > 1 ? (
                  <div className="partSelectorVariantGroup" key={item.id}>
                    <div className="part-option part-option-heading">
                      <span className="part-option-media">
                        {item.imageUrl ? <img className="part-option-image" src={item.imageUrl} alt="" loading="lazy" /> : <span className="part-option-placeholder">{item.brand.slice(0, 2)}</span>}
                      </span>
                      <div className="part-option-copy">
                        <div className="part-meta-row">
                          <span className="part-brand">{item.brand}</span>
                          {item.partNumber || item.modelNumber ? <span className="part-number">{item.partNumber || item.modelNumber}</span> : null}
                        </div>
                        <div className="part-name">{cleanPartTitle(catalogOptionLabel(item), item.partNumber || item.modelNumber)}</div>
                      </div>
                      {item.hiddenFromTuneBuilder ? <div className="part-support-note">{item.reasonHidden || "Support/replacement part"}</div> : null}
                    </div>
                    {item.variants.map((variant) => (
                      <button key={`${item.id}-${variant.id}`} type="button" onClick={() => chooseItem(item, variant)}>
                        <div className="part-option">
                          <span className="part-option-media part-option-variant">Option</span>
                          <div className="part-option-copy">
                            <div className="part-meta-row">
                              <span className="part-brand">Variant</span>
                              {variant.sku ? <span className="part-number">{variant.sku}</span> : null}
                            </div>
                            <div className="part-name">{variant.displayName}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button key={item.id} type="button" onClick={() => chooseItem(item, item.variants?.[0])}>
                    <div className="part-option">
                      <span className="part-option-media">
                        {item.imageUrl ? <img className="part-option-image" src={item.imageUrl} alt="" loading="lazy" /> : <span className="part-option-placeholder">{item.brand.slice(0, 2)}</span>}
                      </span>
                      <div className="part-option-copy">
                        <div className="part-meta-row">
                          <span className="part-brand">{item.brand}</span>
                          {item.partNumber || item.modelNumber ? <span className="part-number">{item.partNumber || item.modelNumber}</span> : null}
                        </div>
                        <div className="part-name">{cleanPartTitle(catalogOptionLabel(item), item.partNumber || item.modelNumber)}</div>
                      </div>
                      {item.hiddenFromTuneBuilder ? <div className="part-support-note">{item.reasonHidden || "Support/replacement part"}</div> : null}
                    </div>
                  </button>
                )
              ))}
            </div>
          ))}
          {!catalogItems.length ? (
            <div className="partSelectorEmpty">
              <strong>No matching catalog parts yet.</strong>
              <span>Save the part as Custom / Other and it will stay with this tune.</span>
              <button type="button" onClick={() => {
                setCustomDraft({ ...customDraft, name: query || customDraft.name });
                setCustomOpen(true);
              }}>Add custom part</button>
            </div>
          ) : null}
        </div>

        {customOpen ? <div className="partSelectorCustom">
          <h4>Custom / Other</h4>
          <label>
            <span>{formatFormLabel("Custom brand")}</span>
            <input value={customDraft.brand} placeholder="Brand name" onChange={(event) => setCustomDraft({ ...customDraft, brand: event.target.value })} />
          </label>
          <label>
            <span>{formatFormLabel("Custom part name")}</span>
            <input value={customDraft.name} placeholder="Part name" onChange={(event) => setCustomDraft({ ...customDraft, name: event.target.value })} />
          </label>
          <label>
            <span>{formatFormLabel("Part number optional")}</span>
            <input value={customDraft.partNumber} placeholder="ex. Y2-008FUA" onChange={(event) => setCustomDraft({ ...customDraft, partNumber: event.target.value })} />
          </label>
          <label>
            <span>{formatFormLabel("Notes optional")}</span>
            <textarea value={customDraft.notes} placeholder="Fitment, color, spacers, or setup notes" onChange={(event) => setCustomDraft({ ...customDraft, notes: event.target.value })} />
          </label>
          <button className="primaryAction" type="button" onClick={saveCustom}>
            Save custom part
          </button>
        </div> : null}
        <button className="partSelectorMobileBack" type="button" onClick={() => setOpen(false)}>
          Back to tune
        </button>
      </section>
    </div>
  ) : null;

  return (
    <section className="partSelector">
      <div className="partSelectorHeader">
        <div>
          <h4>{formatFormLabel(label)}</h4>
          {helper ? <p>{helper}</p> : null}
        </div>
        {selected ? <button type="button" onClick={() => setOpen(true)}>Change</button> : null}
      </div>

      <button className={`partSelectorCard ${selected ? "selected" : ""}`} type="button" onClick={() => setOpen(true)}>
        {selected ? (
          <>
            <span className="partSelectorPreviewMark" aria-hidden="true">
              {value.imageUrl ? <img className="partSelectorThumb" src={value.imageUrl} alt="" loading="lazy" /> : <span>{(value.brand || "RC").slice(0, 2)}</span>}
            </span>
            <span className="partSelectorPreviewCopy">
              <span className="partBrand">{value.brand || (value.isCustom ? "Custom" : "Selected")}</span>
              <strong>{cleanPartTitle(selected, value.partNumber)}</strong>
              <span className="partSelectorMeta">
                {value.variantLabel ? <em>{value.variantLabel}</em> : null}
                <em>{category}</em>
                {value.isCustom ? <em>Custom</em> : null}
              </span>
            </span>
          </>
        ) : (
          <>
            <strong>{emptyLabel ? formatFormLabel(emptyLabel) : `Select ${formatFormLabel(label)}`}</strong>
            <small>Search brand, model, or part number.</small>
          </>
        )}
      </button>
      {selectedPartNumber ? <p className="part-helper-text">Part #: {selectedPartNumber}</p> : null}
      {selectorDialog && typeof document !== "undefined" ? createPortal(selectorDialog, document.body) : selectorDialog}
    </section>
  );
}
