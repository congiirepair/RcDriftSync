import { useMemo, useState } from "react";
import { BASIC_CUSTOM_OPTION, starterBasicBrands } from "../data/basicTuneOptions";
import { productCatalogCategories, type ProductCatalogCategory, type ProductCatalogItem } from "../data/productCatalog";
import {
  catalogBrands,
  catalogDisplayName,
  catalogOptionLabel,
  createUserCatalogItem,
  deleteUserCatalogItem,
  exportProductCatalog,
  filterProductCatalog,
  generateSimplifiedName,
  getProductCatalog,
  importProductCatalog,
  loadProductSuggestions,
  loadUserCatalogItems,
  submitProductSuggestion,
  updateProductSuggestionStatus,
  upsertUserCatalogItem,
  validateCatalogImport
} from "../services/productCatalog";
import type { UserAccount } from "../types";
import { navigate } from "../utils/routing";
import { EmptyState, SelectField, TextAreaField, TextField } from "./UiPrimitives";

const emptyDraft = (): ProductCatalogItem => ({
  id: "",
  category: "servos",
  brand: "",
  productName: "",
  simplifiedName: "",
  displayName: "",
  partNumber: "",
  modelNumber: "",
  productType: "",
  compatibleChassis: [],
  notes: "",
  tunableParameters: [],
  sourceUrl: "",
  sourceName: "",
  userAdded: true,
  verified: false,
  confidence: "low",
  needsReview: false,
  categorizationReason: "",
  excludedCategories: [],
  discontinued: false
});

function csvToList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function listToCsv(value: string[]) {
  return value.join(", ");
}

export function AdminCatalogPage({ account, onLogin }: { account: UserAccount | null; onLogin: () => void }) {
  const [catalogItems, setCatalogItems] = useState(() => getProductCatalog());
  const [userItems, setUserItems] = useState(() => loadUserCatalogItems());
  const [suggestions, setSuggestions] = useState(() => loadProductSuggestions());
  const [draft, setDraft] = useState<ProductCatalogItem>(emptyDraft);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCatalogCategory | "">("");
  const [brand, setBrand] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | "needsReview" | "clean">("all");
  const [importText, setImportText] = useState("");
  const [exportText, setExportText] = useState("");
  const [message, setMessage] = useState("");
  const brands = useMemo(() => catalogBrands(catalogItems), [catalogItems]);
  const filtered = useMemo(() => filterProductCatalog(catalogItems, {
    category: category || undefined,
    brand: brand || undefined,
    query: search,
    verifiedOnly: verifiedFilter === "verified",
    includeNeedsReview: true,
    includeLowConfidence: true,
    includeHiddenFromTuneBuilder: true
  })
    .filter((item) => verifiedFilter === "unverified" ? !item.verified : true)
    .filter((item) => reviewFilter === "needsReview" ? item.needsReview : reviewFilter === "clean" ? !item.needsReview : true), [brand, catalogItems, category, search, verifiedFilter, reviewFilter]);

  function refresh() {
    const nextUserItems = loadUserCatalogItems();
    setUserItems(nextUserItems);
    setCatalogItems(getProductCatalog());
    setSuggestions(loadProductSuggestions());
  }

  function saveDraft() {
    const simplifiedName = draft.simplifiedName || generateSimplifiedName(draft);
    const partNumber = draft.partNumber || draft.modelNumber;
    const item = createUserCatalogItem({
      ...draft,
      simplifiedName,
      partNumber,
      displayName: catalogDisplayName(simplifiedName, partNumber),
      id: editingId || draft.id || undefined,
      compatibleChassis: draft.compatibleChassis,
      tunableParameters: draft.tunableParameters,
      verified: Boolean(draft.verified && draft.sourceUrl)
    });
    upsertUserCatalogItem(item);
    setMessage(`${item.productName} saved to the catalog.`);
    setDraft(emptyDraft());
    setEditingId("");
    refresh();
  }

  function editItem(item: ProductCatalogItem) {
    setDraft({ ...item, userAdded: true });
    setEditingId(item.id);
    setMessage(item.userAdded ? "" : "Seed products are copied into your editable local catalog when saved.");
  }

  function deleteItem(item: ProductCatalogItem) {
    if (!item.userAdded && !userItems.some((userItem) => userItem.id === item.id)) {
      setMessage("Seed catalog items cannot be deleted locally. Edit and save a replacement instead.");
      return;
    }
    deleteUserCatalogItem(item.id);
    setMessage(`${item.productName} deleted from your local catalog.`);
    refresh();
  }

  function importJson() {
    try {
      const imported = importProductCatalog(importText).map((item) => ({ ...item, userAdded: true }));
      const validation = validateCatalogImport(imported);
      imported.forEach(upsertUserCatalogItem);
      setMessage(`${imported.length} catalog item${imported.length === 1 ? "" : "s"} imported. ${validation.issues.length} validation issue${validation.issues.length === 1 ? "" : "s"} flagged.`);
      setImportText("");
      refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Catalog import failed.");
    }
  }

  if (!account) {
    return (
      <main className="publicPage">
        <header className="publicHero">
          <p>Admin Catalog</p>
          <h1>Sign in required</h1>
          <span>Catalog manager is hidden from normal users. Sign in with a master admin account.</span>
          <button className="primaryAction" type="button" onClick={onLogin}>Log in</button>
        </header>
      </main>
    );
  }

  if (!account.isAdmin) {
    return (
      <main className="publicPage">
        <header className="publicHero">
          <p>Admin Catalog</p>
          <h1>Product suggestion</h1>
          <span>Admin tools are hidden for your account, but you can suggest a product for review.</span>
          <button className="smallPill" type="button" onClick={() => navigate("/")}>Go home</button>
        </header>
        <section className="appCard adminCatalogSearch">
          <h2>Suggest a product</h2>
          <ProductSuggestionForm submittedBy={account.uid} onSubmit={() => setMessage("Product suggestion submitted for admin review.")} />
          {message ? <div className="saveToast show">{message}</div> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="publicPage adminCatalogPage">
      <header className="publicHero">
        <p>Admin Catalog</p>
        <h1>Product catalog manager</h1>
        <span>Temporary local catalog storage is active. Replace this with Firebase custom claims and Firestore catalog collections before opening admin access broadly.</span>
      </header>

      {message ? <div className="saveToast show">{message}</div> : null}

      <section className="adminCatalogGrid">
        <article className="appCard adminCatalogEditor">
          <h2>{editingId ? "Edit product" : "Add product"}</h2>
          <div className="formSplit">
            <SelectField label="Category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as ProductCatalogCategory })}>
              {productCatalogCategories.map((item) => <option key={item}>{item}</option>)}
            </SelectField>
            <SelectField label="Brand" value={draft.brand} onChange={(event) => setDraft({ ...draft, brand: event.target.value })}>
              <option value="">Select brand</option>
              {Array.from(new Set([...starterBasicBrands.filter((item) => item !== BASIC_CUSTOM_OPTION), ...brands])).map((item) => <option key={item}>{item}</option>)}
              <option>{BASIC_CUSTOM_OPTION}</option>
            </SelectField>
          </div>
          {draft.brand === BASIC_CUSTOM_OPTION ? <TextField label="Custom brand" value={draft.brand === BASIC_CUSTOM_OPTION ? "" : draft.brand} onChange={(event) => setDraft({ ...draft, brand: event.target.value })} /> : null}
          <TextField label="Product name" value={draft.productName} onChange={(event) => setDraft({ ...draft, productName: event.target.value })} />
          <div className="formSplit">
            <TextField label="Simplified name" value={draft.simplifiedName ?? ""} placeholder="Clean dropdown name" onChange={(event) => setDraft({ ...draft, simplifiedName: event.target.value })} />
            <TextField label="Part number" value={draft.partNumber || draft.modelNumber} onChange={(event) => setDraft({ ...draft, partNumber: event.target.value, modelNumber: event.target.value })} />
          </div>
          <button className="smallPill" type="button" onClick={() => {
            const simplifiedName = generateSimplifiedName(draft);
            const partNumber = draft.partNumber || draft.modelNumber;
            setDraft({ ...draft, simplifiedName, partNumber, displayName: catalogDisplayName(simplifiedName, partNumber) });
          }}>Generate simplified name</button>
          <TextField label="Display name preview" value={catalogDisplayName(draft.simplifiedName || generateSimplifiedName(draft), draft.partNumber || draft.modelNumber)} readOnly />
          <TextField label="Model number" value={draft.modelNumber} onChange={(event) => setDraft({ ...draft, modelNumber: event.target.value, partNumber: event.target.value })} />
          <TextField label="Product type" value={draft.productType ?? ""} placeholder="standalone gyro, motor mount, RTR kit..." onChange={(event) => setDraft({ ...draft, productType: event.target.value })} />
          <TextField label="Compatible chassis" value={listToCsv(draft.compatibleChassis)} placeholder="RDX, RMX 2.5, YD-2" onChange={(event) => setDraft({ ...draft, compatibleChassis: csvToList(event.target.value) })} />
          <TextField label="Tunable parameters" value={listToCsv(draft.tunableParameters)} placeholder="toe angle, shim, notes" onChange={(event) => setDraft({ ...draft, tunableParameters: csvToList(event.target.value) })} />
          <TextField label="Source URL" value={draft.sourceUrl ?? ""} placeholder="Required before marking verified" onChange={(event) => setDraft({ ...draft, sourceUrl: event.target.value, verified: draft.verified && Boolean(event.target.value) })} />
          <TextField label="Source name" value={draft.sourceName ?? ""} placeholder="Manufacturer or retailer source" onChange={(event) => setDraft({ ...draft, sourceName: event.target.value })} />
          <SelectField label="Verified" value={draft.verified ? "verified" : "unverified"} onChange={(event) => setDraft({ ...draft, verified: event.target.value === "verified" && Boolean(draft.sourceUrl) })}>
            <option value="unverified">Unverified</option>
            <option value="verified">Verified with source URL</option>
          </SelectField>
          <div className="formSplit">
            <SelectField label="Confidence" value={draft.confidence ?? "low"} onChange={(event) => setDraft({ ...draft, confidence: event.target.value as ProductCatalogItem["confidence"] })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </SelectField>
            <SelectField label="Needs review" value={draft.needsReview ? "yes" : "no"} onChange={(event) => setDraft({ ...draft, needsReview: event.target.value === "yes" })}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </SelectField>
          </div>
          <TextAreaField label="Categorization reason" value={draft.categorizationReason ?? ""} onChange={(event) => setDraft({ ...draft, categorizationReason: event.target.value })} />
          <TextField label="Excluded categories" value={listToCsv(draft.excludedCategories ?? [])} placeholder="gyros, escs, motors" onChange={(event) => setDraft({ ...draft, excludedCategories: csvToList(event.target.value) })} />
          <TextAreaField label="Notes" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
          <div className="buttonRow">
            <button className="primaryAction" type="button" onClick={saveDraft} disabled={!draft.brand || !draft.productName}>Save product</button>
            <button className="smallPill" type="button" onClick={() => {
              setDraft(emptyDraft());
              setEditingId("");
            }}>Clear</button>
          </div>
        </article>

        <article className="appCard adminCatalogEditor">
          <h2>Import / export</h2>
          <button className="smallPill" type="button" onClick={() => setExportText(exportProductCatalog(catalogItems))}>Export catalog JSON</button>
          <TextAreaField label="Export JSON" value={exportText} readOnly />
          <TextAreaField label="Import catalog JSON" value={importText} placeholder="Paste catalog JSON array" onChange={(event) => setImportText(event.target.value)} />
          <button className="primaryAction" type="button" onClick={importJson} disabled={!importText.trim()}>Import JSON</button>
        </article>
      </section>

      <section className="appCard adminCatalogSearch">
        <h2>Search catalog</h2>
        <div className="formSplit">
          <TextField label="Search" value={search} placeholder="Brand, product, chassis..." onChange={(event) => setSearch(event.target.value)} />
          <SelectField label="Category" value={category} onChange={(event) => setCategory(event.target.value as ProductCatalogCategory | "")}>
            <option value="">All categories</option>
            {productCatalogCategories.map((item) => <option key={item}>{item}</option>)}
          </SelectField>
          <SelectField label="Brand" value={brand} onChange={(event) => setBrand(event.target.value)}>
            <option value="">All brands</option>
            {brands.map((item) => <option key={item}>{item}</option>)}
          </SelectField>
          <SelectField label="Verified" value={verifiedFilter} onChange={(event) => setVerifiedFilter(event.target.value as "all" | "verified" | "unverified")}>
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </SelectField>
          <SelectField label="Review status" value={reviewFilter} onChange={(event) => setReviewFilter(event.target.value as "all" | "needsReview" | "clean")}>
            <option value="all">All</option>
            <option value="needsReview">Needs review</option>
            <option value="clean">Clean</option>
          </SelectField>
        </div>
        <div className="adminCatalogList">
          {filtered.length ? filtered.map((item) => (
            <article key={item.id} className="adminCatalogItem">
              <div>
                <strong>{item.brand} {catalogOptionLabel(item)}</strong>
                <span>{item.category} · {item.verified ? "verified" : "unverified"} · {item.userAdded ? "local" : "seed"}</span>
                <small>Original: {item.productName}</small>
                {item.categorizationReason ? <small>Reason: {item.categorizationReason}</small> : null}
                {item.hiddenFromTuneBuilder ? <small>Hidden from tune builder: {item.reasonHidden || "Support/replacement part"}</small> : null}
                {item.variants?.length ? <small>Variants: {item.variants.map((variant) => variant.displayName).join(", ")}</small> : null}
                {item.legacyIds?.length ? <small>Legacy IDs: {item.legacyIds.join(", ")}</small> : null}
                {item.excludedCategories?.length ? <small>Excluded: {item.excludedCategories.join(", ")}</small> : null}
                {item.compatibleChassis.length ? <small>Chassis: {item.compatibleChassis.join(", ")}</small> : null}
                {item.tunableParameters.length ? <small>Parameters: {item.tunableParameters.join(", ")}</small> : null}
              </div>
              <div className="buttonRow">
                <button className="smallPill" type="button" onClick={() => editItem(item)}>Edit</button>
                <button className="smallPill destructive" type="button" onClick={() => deleteItem(item)}>Delete</button>
              </div>
            </article>
          )) : <EmptyState title="No catalog items" body="Try another filter or add the first product for this category." />}
        </div>
      </section>

      <section className="appCard adminCatalogSearch">
        <h2>Product suggestions</h2>
        <ProductSuggestionForm submittedBy={account.uid} onSubmit={() => {
          setSuggestions(loadProductSuggestions());
          setMessage("Product suggestion submitted for admin review.");
        }} />
        <div className="adminCatalogList">
          {suggestions.length ? suggestions.map((item) => (
            <article className="adminCatalogItem" key={item.id}>
              <div>
                <strong>{item.brand} {item.productName}</strong>
                <span>{item.category} · {item.status} · submitted by {item.submittedBy || "unknown"}</span>
                {item.sourceUrl ? <small>{item.sourceUrl}</small> : null}
              </div>
              <div className="buttonRow">
                <button className="smallPill" type="button" onClick={() => setSuggestions(updateProductSuggestionStatus(item.id, "approved"))}>Approve</button>
                <button className="smallPill" type="button" onClick={() => setSuggestions(updateProductSuggestionStatus(item.id, "rejected"))}>Reject</button>
              </div>
            </article>
          )) : <span>No product suggestions yet.</span>}
        </div>
      </section>
    </main>
  );
}

function ProductSuggestionForm({ submittedBy, onSubmit }: { submittedBy?: string; onSubmit: () => void }) {
  const [draft, setDraft] = useState({
    category: "servos" as ProductCatalogCategory,
    brand: "",
    productName: "",
    modelNumber: "",
    notes: "",
    sourceUrl: ""
  });
  return (
    <div className="productSuggestionForm">
      <div className="formSplit">
        <SelectField label="Category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as ProductCatalogCategory })}>
          {productCatalogCategories.map((item) => <option key={item}>{item}</option>)}
        </SelectField>
        <TextField label="Brand" value={draft.brand} onChange={(event) => setDraft({ ...draft, brand: event.target.value })} />
      </div>
      <TextField label="Product name" value={draft.productName} onChange={(event) => setDraft({ ...draft, productName: event.target.value })} />
      <TextField label="Model number" value={draft.modelNumber} onChange={(event) => setDraft({ ...draft, modelNumber: event.target.value })} />
      <TextField label="Source URL optional" value={draft.sourceUrl} onChange={(event) => setDraft({ ...draft, sourceUrl: event.target.value })} />
      <TextAreaField label="Notes" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
      <button className="smallPill" type="button" disabled={!draft.brand || !draft.productName} onClick={() => {
        submitProductSuggestion({ ...draft, submittedBy });
        setDraft({ category: "servos", brand: "", productName: "", modelNumber: "", notes: "", sourceUrl: "" });
        onSubmit();
      }}>Submit product suggestion</button>
    </div>
  );
}
