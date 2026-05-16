import { ChevronDown, CopyPlus, Heart, MessageCircle, MoreHorizontal, Search, SlidersHorizontal, Star, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getPdfTemplate } from "../data/pdfTemplates";
import { chassisBrands, chassisInfoFromTune, chassisSearchText, findChassisBrand, slugifyChassis } from "../data/chassisBrands";
import { partDisplayForTune } from "../data/rcParts";
import type { AppData, Tune, UserAccount } from "../types";
import { navigate } from "../utils/routing";
import { bestForTags, tuneDisplayName } from "../utils/tuneInsights";
import { BrandBadge, BrandCard, BrandHeader } from "./BrandIdentity";
import { BasicTuneSummary } from "./TuneVisuals";
import { EmptyState } from "./UiPrimitives";

export interface CommunityActions {
  onClone: (tune: Tune) => void;
  onLike: (tuneId: string) => void;
  onFavorite: (tuneId: string) => void;
  onComment: (tuneId: string, body: string) => void;
  onFollow: (username: string) => void;
}

interface LibraryPageProps extends Partial<CommunityActions> {
  data: AppData;
  compact?: boolean;
}

const filterOptions = [
  ["all", "All"],
  ["featured", "Featured"],
  ["trending", "Trending"],
  ["most-cloned", "Most cloned"],
  ["newest", "Newest"],
  ["highest-rated", "Highest rated"],
  ["rdx", "RDX"],
  ["mc-3", "MC-3"],
  ["universal", "Universal"],
  ["esc", "ESC tunes"],
  ["servo", "Servo tunes"],
  ["gyro", "Gyro tunes"],
  ["track", "Track-specific"]
] as const;

const sortOptions = ["newest", "popular", "most copied/forked", "most liked", "most viewed", "most favorited", "rating"] as const;

const textValue = (tune: Tune, field: string) => String(tune.values[field] ?? tune.selections[field] ?? "");

function normalizeFilterText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function filterMatches(value: string, filter: string) {
  if (filter === "all") return true;
  const normalizedValue = normalizeFilterText(value);
  const normalizedFilter = normalizeFilterText(filter);
  if (!normalizedValue || !normalizedFilter) return false;
  return normalizedValue === normalizedFilter || normalizedValue.includes(normalizedFilter) || normalizedFilter.includes(normalizedValue);
}

function firstValue(...values: Array<string | number | boolean | string[] | undefined | null>) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const joined = value.filter(Boolean).join(", ");
      if (joined.trim()) return joined;
      continue;
    }
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

function basicTuneFilterValue(tune: Tune, key: string, car?: AppData["cars"][number]) {
  const chassisInfo = chassisInfoFromTune(tune, car);
  if (key === "chassis") return `${chassisInfo.brand} ${chassisInfo.model}`.trim();
  if (key === "deck") return firstValue(tune.values.chassisDeck, tune.chassisSetup?.chassis?.deck);
  if (key === "frontKnuckle") return firstValue(tune.values.frontKnuckle, tune.chassisSetup?.front?.knuckle?.model);
  if (key === "frontSpringBrand") return firstValue(tune.values.frontSpringBrand, tune.chassisSetup?.front?.spring?.brand);
  if (key === "frontWheelBrand") return firstValue(tune.values.frontWheelBrand, tune.chassisSetup?.front?.wheel?.brand);
  if (key === "servoBrand") return firstValue(tune.values.servoBrand, tune.electronics?.servo?.brand);
  if (key === "gyroBrand") return firstValue(tune.values.gyroBrand, tune.electronics?.gyro?.brand);
  if (key === "escBrand") return firstValue(tune.values.escBrand, tune.electronics?.esc?.brand);
  if (key === "motor") return firstValue(partDisplayForTune(tune, "motor", ["motorBrand", "motorModel", "motor"], tune.electronics?.motor), tune.values.motorModel, tune.values.motor, tune.electronics?.motor?.model, tune.electronics?.motor?.brand);
  if (key === "rearHubCarrier") return firstValue(tune.values.rearHubCarrier, tune.chassisSetup?.rear?.hubCarrier?.model);
  if (key === "rearWheelBrand") return firstValue(tune.values.rearWheelBrand, tune.chassisSetup?.rear?.wheel?.brand);
  return "";
}

function communitySearchText(tune: Tune, car?: AppData["cars"][number]) {
  const template = getPdfTemplate(tune.sheetId);
  const electronics = tuneElectronicsText(tune);
  return [
    tune.name,
    template.chassis,
    chassisSearchText(tune, car),
    tune.ownerDisplayName,
    tune.ownerUsername,
    tune.track,
    tune.surface,
    tuneTire(tune),
    electronics.motor,
    electronics.esc,
    electronics.gyro,
    electronics.servo,
    ...tune.tags,
    ...bestForTags(tune),
    ...Object.values(tune.values).map(String)
  ].filter(Boolean).join(" ").toLowerCase();
}

function tuneTire(tune: Tune) {
  return partDisplayForTune(tune, "tire", ["tires", "frontTires", "rearTires"]) || "Tire not listed";
}

function tuneElectronicsText(tune: Tune) {
  const gyroGain = textValue(tune, "gyroGain");
  return {
    motor: [partDisplayForTune(tune, "motor", ["motorBrand", "motorModel", "motor"], tune.electronics?.motor), textValue(tune, "motorTiming")].filter(Boolean).join(" / "),
    esc: partDisplayForTune(tune, "esc", ["escBrand", "escModel"], tune.electronics?.esc),
    gyro: [partDisplayForTune(tune, "gyro", ["gyroBrand", "gyroModel"], tune.electronics?.gyro), gyroGain && `gain ${gyroGain}`].filter(Boolean).join(" "),
    servo: partDisplayForTune(tune, "servo", ["servoBrand", "servoModel"], tune.electronics?.servo)
  };
}

function communityQuickFacts(tune: Tune) {
  const electronics = tuneElectronicsText(tune);
  return [
    ["Surface", tune.surface],
    ["Tire", tuneTire(tune) === "Tire not listed" ? "" : tuneTire(tune)],
    ["Motor", electronics.motor],
    ["ESC", electronics.esc],
    ["Gyro", electronics.gyro],
    ["Servo", electronics.servo]
  ].filter(([, value]) => String(value ?? "").trim()) as Array<[string, string]>;
}

function matchesCategory(tune: Tune, category: string) {
  const template = getPdfTemplate(tune.sheetId);
  const haystack = `${tune.name} ${tune.sheetId} ${template.chassis} ${tune.track} ${tune.surface} ${tune.tags.join(" ")} ${Object.values(tune.values).join(" ")}`.toLowerCase();
  if (category === "all") return true;
  if (category === "featured") return (tune.likeCount ?? 0) >= 15 || (tune.cloneCount ?? 0) >= 8;
  if (category === "trending") return (tune.viewCount ?? 0) + (tune.likeCount ?? 0) + (tune.cloneCount ?? 0) >= 50;
  if (category === "most-cloned") return (tune.cloneCount ?? 0) > 0;
  if (category === "newest") return true;
  if (category === "highest-rated") return tune.rating >= 4;
  if (category === "rdx") return haystack.includes("rdx");
  if (category === "mc-3") return haystack.includes("mc-3") || haystack.includes("mc3");
  if (category === "universal") return tune.sheetId.includes("universal");
  if (category === "esc") return Boolean(tuneElectronicsText(tune).esc || textValue(tune, "boostTiming"));
  if (category === "servo") return Boolean(tuneElectronicsText(tune).servo);
  if (category === "gyro") return Boolean(tuneElectronicsText(tune).gyro || textValue(tune, "gyroGain"));
  if (category === "track") return Boolean(tune.track);
  return haystack.includes(category);
}

function sortTunes(tunes: Tune[], sort: string) {
  return [...tunes].sort((a, b) => {
    if (sort === "most viewed") return (b.viewCount ?? 0) - (a.viewCount ?? 0);
    if (sort === "popular") return ((b.viewCount ?? 0) + (b.likeCount ?? 0) + (b.cloneCount ?? 0)) - ((a.viewCount ?? 0) + (a.likeCount ?? 0) + (a.cloneCount ?? 0));
    if (sort === "most copied/forked") return (b.cloneCount ?? 0) - (a.cloneCount ?? 0);
    if (sort === "most liked") return (b.likeCount ?? 0) - (a.likeCount ?? 0);
    if (sort === "most favorited") return (b.favoriteCount ?? 0) - (a.favoriteCount ?? 0);
    if (sort === "rating") return b.rating - a.rating;
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  });
}

export function LibraryPage({ data, compact = false, onClone, onLike, onFavorite, onComment, onFollow }: LibraryPageProps) {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<(typeof sortOptions)[number]>("newest");
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [chassisFilter, setChassisFilter] = useState("all");
  const [surfaceFilter, setSurfaceFilter] = useState("all");
  const [tireFilter, setTireFilter] = useState("all");
  const [motorFilter, setMotorFilter] = useState("all");
  const [escFilter, setEscFilter] = useState("all");
  const [gyroFilter, setGyroFilter] = useState("all");
  const [servoFilter, setServoFilter] = useState("all");
  const [deckFilter, setDeckFilter] = useState("all");
  const [frontKnuckleFilter, setFrontKnuckleFilter] = useState("all");
  const [frontSpringBrandFilter, setFrontSpringBrandFilter] = useState("all");
  const [frontWheelBrandFilter, setFrontWheelBrandFilter] = useState("all");
  const [rearHubCarrierFilter, setRearHubCarrierFilter] = useState("all");
  const [rearWheelBrandFilter, setRearWheelBrandFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [partFiltersOpen, setPartFiltersOpen] = useState(false);
  const [commentingTuneId, setCommentingTuneId] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [moreMenuTuneId, setMoreMenuTuneId] = useState("");
  const comments = data.comments ?? [];
  const favorites = data.favorites ?? [];
  const selectedBrand = chassisBrands.find((brand) => brand.slug === brandFilter);
  const publicPool = data.tunes.filter((tune) => tune.visibility === "public");
  const hasPublicTunes = publicPool.length > 0;
  const optionSet = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
  const basicOptionSet = (key: string) => optionSet(publicPool.map((tune) => basicTuneFilterValue(tune, key, data.cars.find((car) => car.id === tune.carId))));
  const chassisOptions = basicOptionSet("chassis");
  const deckOptions = basicOptionSet("deck");
  const frontKnuckleOptions = basicOptionSet("frontKnuckle");
  const frontSpringBrandOptions = basicOptionSet("frontSpringBrand");
  const frontWheelBrandOptions = basicOptionSet("frontWheelBrand");
  const rearHubCarrierOptions = basicOptionSet("rearHubCarrier");
  const rearWheelBrandOptions = basicOptionSet("rearWheelBrand");
  const surfaceOptions = optionSet(publicPool.map((tune) => tune.surface));
  const tireOptions = optionSet(publicPool.map(tuneTire).filter((item) => item !== "Tire not listed"));
  const motorOptions = basicOptionSet("motor");
  const escOptions = basicOptionSet("escBrand");
  const gyroOptions = basicOptionSet("gyroBrand");
  const servoOptions = basicOptionSet("servoBrand");
  const tagOptions = optionSet(publicPool.flatMap((tune) => [...tune.tags, ...bestForTags(tune)]));
  const publicTunes = useMemo(() => {
    const search = query.toLowerCase().trim();
    return sortTunes(
      data.tunes.filter((tune) => {
        if (tune.visibility !== "public") return false;
        if (!matchesCategory(tune, category)) return false;
        const car = data.cars.find((item) => item.id === tune.carId);
        const chassisInfo = chassisInfoFromTune(tune, car);
        const basics = {
          chassis: basicTuneFilterValue(tune, "chassis", car),
          deck: basicTuneFilterValue(tune, "deck", car),
          frontKnuckle: basicTuneFilterValue(tune, "frontKnuckle", car),
          frontSpringBrand: basicTuneFilterValue(tune, "frontSpringBrand", car),
          frontWheelBrand: basicTuneFilterValue(tune, "frontWheelBrand", car),
          servoBrand: basicTuneFilterValue(tune, "servoBrand", car),
          gyroBrand: basicTuneFilterValue(tune, "gyroBrand", car),
          escBrand: basicTuneFilterValue(tune, "escBrand", car),
          motor: basicTuneFilterValue(tune, "motor", car),
          rearHubCarrier: basicTuneFilterValue(tune, "rearHubCarrier", car),
          rearWheelBrand: basicTuneFilterValue(tune, "rearWheelBrand", car)
        };
        if (brandFilter !== "all" && chassisInfo.brandSlug !== brandFilter) return false;
        if (modelFilter !== "all" && chassisInfo.modelSlug !== modelFilter) return false;
        if (!filterMatches(basics.chassis, chassisFilter)) return false;
        if (!filterMatches(tune.surface, surfaceFilter)) return false;
        if (!filterMatches(tuneTire(tune), tireFilter)) return false;
        if (!filterMatches(basics.deck, deckFilter)) return false;
        if (!filterMatches(basics.frontKnuckle, frontKnuckleFilter)) return false;
        if (!filterMatches(basics.frontSpringBrand, frontSpringBrandFilter)) return false;
        if (!filterMatches(basics.frontWheelBrand, frontWheelBrandFilter)) return false;
        if (!filterMatches(basics.servoBrand, servoFilter)) return false;
        if (!filterMatches(basics.gyroBrand, gyroFilter)) return false;
        if (!filterMatches(basics.escBrand, escFilter)) return false;
        if (!filterMatches(basics.motor, motorFilter)) return false;
        if (!filterMatches(basics.rearHubCarrier, rearHubCarrierFilter)) return false;
        if (!filterMatches(basics.rearWheelBrand, rearWheelBrandFilter)) return false;
        if (tagFilter !== "all" && ![...tune.tags, ...bestForTags(tune)].includes(tagFilter)) return false;
        if (!search) return true;
        return communitySearchText(tune, car).includes(search);
      }),
      sort
    );
  }, [brandFilter, category, chassisFilter, data.cars, data.tunes, deckFilter, escFilter, frontKnuckleFilter, frontSpringBrandFilter, frontWheelBrandFilter, gyroFilter, modelFilter, motorFilter, query, rearHubCarrierFilter, rearWheelBrandFilter, servoFilter, sort, surfaceFilter, tagFilter, tireFilter]);
  const activeFilterLabels = [
    category !== "all" ? filterOptions.find(([id]) => id === category)?.[1] : "",
    brandFilter !== "all" ? selectedBrand?.name : "",
    modelFilter !== "all" ? selectedBrand?.models.find((model) => slugifyChassis(model) === modelFilter) ?? modelFilter : "",
    chassisFilter !== "all" ? chassisFilter : "",
    surfaceFilter !== "all" ? surfaceFilter : "",
    tireFilter !== "all" ? tireFilter : "",
    deckFilter !== "all" ? deckFilter : "",
    frontKnuckleFilter !== "all" ? frontKnuckleFilter : "",
    frontSpringBrandFilter !== "all" ? frontSpringBrandFilter : "",
    frontWheelBrandFilter !== "all" ? frontWheelBrandFilter : "",
    escFilter !== "all" ? escFilter : "",
    motorFilter !== "all" ? motorFilter : "",
    gyroFilter !== "all" ? gyroFilter : "",
    servoFilter !== "all" ? servoFilter : "",
    rearHubCarrierFilter !== "all" ? rearHubCarrierFilter : "",
    rearWheelBrandFilter !== "all" ? rearWheelBrandFilter : "",
    tagFilter !== "all" ? tagFilter : ""
  ].filter(Boolean);
  const activePartFilterCount = [
    deckFilter,
    frontKnuckleFilter,
    frontSpringBrandFilter,
    frontWheelBrandFilter,
    escFilter,
    motorFilter,
    gyroFilter,
    servoFilter,
    rearHubCarrierFilter,
    rearWheelBrandFilter
  ].filter((value) => value !== "all").length;

  function resetFilters() {
    setCategory("all");
    setBrandFilter("all");
    setModelFilter("all");
    setChassisFilter("all");
    setSurfaceFilter("all");
    setTireFilter("all");
    setDeckFilter("all");
    setFrontKnuckleFilter("all");
    setFrontSpringBrandFilter("all");
    setFrontWheelBrandFilter("all");
    setMotorFilter("all");
    setEscFilter("all");
    setGyroFilter("all");
    setServoFilter("all");
    setRearHubCarrierFilter("all");
    setRearWheelBrandFilter("all");
    setTagFilter("all");
    setQuery("");
  }

  function saveComment(tuneId: string) {
    if (!commentBody.trim()) return;
    onComment?.(tuneId, commentBody.trim());
    setCommentBody("");
    setCommentingTuneId("");
  }

  return (
    <main className={compact ? "communityLibrary compact" : "publicPage communityLibrary"}>
      {!compact ? (
        <header className="publicHero">
          <p>RC Drift Sync Community</p>
          <h1>Shared tune library</h1>
          <span>Find driver-shared setups by chassis, electronics, track, surface, tire, rating, and driver.</span>
        </header>
      ) : null}

      <section className="communityRails" aria-label="Community tune categories">
        {filterOptions.map(([id, label]) => (
          <button key={id} className={category === id ? "active" : ""} type="button" onClick={() => setCategory(id)}>
            {label}
          </button>
        ))}
      </section>

      <section className="brandBrowseRail" aria-label="Browse by brand">
        {chassisBrands.map((brand) => (
          <BrandCard
            key={brand.slug}
            brand={brand}
            active={brandFilter === brand.slug}
            count={data.tunes.filter((tune) => tune.visibility === "public" && chassisInfoFromTune(tune, data.cars.find((car) => car.id === tune.carId)).brandSlug === brand.slug).length}
            onClick={() => {
              setBrandFilter(brand.slug);
              setModelFilter("all");
            }}
          />
        ))}
      </section>

      <section className="communitySearchPanel">
        <label>
          <Search size={17} />
          <input value={query} placeholder="Search brand, model, ESC, tire, track..." onChange={(event) => setQuery(event.target.value)} />
        </label>
        <button className="smallPill" type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} aria-controls="community-filter-panel">
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </section>

      {activeFilterLabels.length ? (
        <section className="activeFilterBar" aria-label="Active community filters">
          {activeFilterLabels.map((label) => <span key={label}>{label}</span>)}
          <button type="button" onClick={resetFilters}>Reset</button>
        </section>
      ) : null}

      <div id="community-filter-panel" className={`libraryFilters communityFilters ${filtersOpen ? "open" : ""}`}>
        <header>
          <strong>Filter tunes</strong>
          <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={17} /></button>
        </header>
        <p className="filterPanelHint">Start broad, then open part filters only when you need a specific setup detail.</p>
        <select value={sort} onChange={(event) => setSort(event.target.value as (typeof sortOptions)[number])}>
          {sortOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
        <select value={brandFilter} onChange={(event) => {
          setBrandFilter(event.target.value);
          setModelFilter("all");
        }} aria-label="Brand filter">
          <option value="all">All brands</option>
          {chassisBrands.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}
        </select>
        <select value={modelFilter} onChange={(event) => setModelFilter(event.target.value)} aria-label="Model filter">
          <option value="all">All models</option>
          {(selectedBrand?.models ?? []).map((model) => <option key={model} value={slugifyChassis(model)}>{model}</option>)}
        </select>
        <select value={chassisFilter} onChange={(event) => setChassisFilter(event.target.value)} aria-label="Chassis filter">
          <option value="all">All chassis</option>
          {chassisOptions.map((chassis) => <option key={chassis}>{chassis}</option>)}
        </select>
        <select value={surfaceFilter} onChange={(event) => setSurfaceFilter(event.target.value)} aria-label="Surface filter">
          <option value="all">All surfaces</option>
          {surfaceOptions.map((surface) => <option key={surface}>{surface}</option>)}
        </select>
        <select value={tireFilter} onChange={(event) => setTireFilter(event.target.value)} aria-label="Tire filter">
          <option value="all">All tires</option>
          {tireOptions.map((tire) => <option key={tire}>{tire}</option>)}
        </select>
        <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} aria-label="Driving style filter">
          <option value="all">All styles</option>
          {tagOptions.map((tag) => <option key={tag}>{tag}</option>)}
        </select>
        <section className={`partFilterDisclosure ${partFiltersOpen ? "open" : ""}`}>
          <button type="button" onClick={() => setPartFiltersOpen((open) => !open)} aria-expanded={partFiltersOpen}>
            <span>Part filters{activePartFilterCount ? ` (${activePartFilterCount})` : ""}</span>
            <ChevronDown size={17} />
          </button>
          {partFiltersOpen ? (
            <div className="partFilterGrid">
              <select value={deckFilter} onChange={(event) => setDeckFilter(event.target.value)} aria-label="Deck filter">
                <option value="all">All decks</option>
                {deckOptions.map((deck) => <option key={deck}>{deck}</option>)}
              </select>
              <select value={frontKnuckleFilter} onChange={(event) => setFrontKnuckleFilter(event.target.value)} aria-label="Front knuckle filter">
                <option value="all">All front knuckles</option>
                {frontKnuckleOptions.map((knuckle) => <option key={knuckle}>{knuckle}</option>)}
              </select>
              <select value={frontSpringBrandFilter} onChange={(event) => setFrontSpringBrandFilter(event.target.value)} aria-label="Front spring brand filter">
                <option value="all">All front spring brands</option>
                {frontSpringBrandOptions.map((springBrand) => <option key={springBrand}>{springBrand}</option>)}
              </select>
              <select value={frontWheelBrandFilter} onChange={(event) => setFrontWheelBrandFilter(event.target.value)} aria-label="Front wheel brand filter">
                <option value="all">All front wheel brands</option>
                {frontWheelBrandOptions.map((wheelBrand) => <option key={wheelBrand}>{wheelBrand}</option>)}
              </select>
              <select value={escFilter} onChange={(event) => setEscFilter(event.target.value)} aria-label="ESC filter">
                <option value="all">All ESC brands</option>
                {escOptions.map((esc) => <option key={esc}>{esc}</option>)}
              </select>
              <select value={motorFilter} onChange={(event) => setMotorFilter(event.target.value)} aria-label="Motor filter">
                <option value="all">All motors</option>
                {motorOptions.map((motor) => <option key={motor}>{motor}</option>)}
              </select>
              <select value={gyroFilter} onChange={(event) => setGyroFilter(event.target.value)} aria-label="Gyro filter">
                <option value="all">All gyro brands</option>
                {gyroOptions.map((gyro) => <option key={gyro}>{gyro}</option>)}
              </select>
              <select value={servoFilter} onChange={(event) => setServoFilter(event.target.value)} aria-label="Servo filter">
                <option value="all">All servo brands</option>
                {servoOptions.map((servo) => <option key={servo}>{servo}</option>)}
              </select>
              <select value={rearHubCarrierFilter} onChange={(event) => setRearHubCarrierFilter(event.target.value)} aria-label="Rear hub carrier filter">
                <option value="all">All rear hub carriers</option>
                {rearHubCarrierOptions.map((hub) => <option key={hub}>{hub}</option>)}
              </select>
              <select value={rearWheelBrandFilter} onChange={(event) => setRearWheelBrandFilter(event.target.value)} aria-label="Rear wheel brand filter">
                <option value="all">All rear wheel brands</option>
                {rearWheelBrandOptions.map((wheelBrand) => <option key={wheelBrand}>{wheelBrand}</option>)}
              </select>
            </div>
          ) : null}
        </section>
      </div>

      <div className="communityFeatureGrid">
        <CommunityStat label="Featured tunes" value={publicPool.filter((tune) => matchesCategory(tune, "featured")).length} />
        <CommunityStat label="Most cloned" value={Math.max(0, ...publicPool.map((tune) => tune.cloneCount ?? 0))} />
        <CommunityStat label="Public drivers" value={new Set(publicPool.map((tune) => tune.ownerUsername ?? tune.ownerId).filter(Boolean)).size} />
      </div>

      <section className="popularModelStrip">
        <h2>Popular models</h2>
        <div className="tagRow">
          {chassisBrands.flatMap((brand) => brand.models.map((model) => ({ brand, model, count: publicPool.filter((tune) => {
            const car = data.cars.find((item) => item.id === tune.carId);
            const info = chassisInfoFromTune(tune, car);
            return info.brandSlug === brand.slug && info.modelSlug === slugifyChassis(model);
          }).length })))
            .filter((item) => item.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 8)
            .map((item) => (
              <button key={`${item.brand.slug}-${item.model}`} type="button" onClick={() => {
                setBrandFilter(item.brand.slug);
                setModelFilter(slugifyChassis(item.model));
              }}>
                {item.brand.name} {item.model} - {item.count}
              </button>
            ))}
          {!publicPool.length ? <span>No public models yet</span> : null}
        </div>
      </section>

      <div className="communityTuneList">
        {publicTunes.length ? publicTunes.map((tune) => {
          const template = getPdfTemplate(tune.sheetId);
          const car = data.cars.find((item) => item.id === tune.carId);
          const chassisInfo = chassisInfoFromTune(tune, car);
          const quickFacts = communityQuickFacts(tune).slice(0, 5);
          const commentsForTune = comments.filter((comment) => comment.tuneId === tune.id);
          const isFavorite = favorites.some((favorite) => favorite.tuneId === tune.id);
          return (
            <article className="communityTuneCard" key={tune.id}>
              <button className="communityThumb" type="button" onClick={() => navigate(`/t/${tune.shareId ?? tune.id}`)}>
                {tune.photos[0] && tune.sharedPhotosEnabled ? <img src={tune.photos[0].cloudUrl || tune.photos[0].dataUrl} alt="" /> : <img src={template.previewImageAsset} alt="" />}
              </button>
              <div className="communityTuneBody">
                <div>
                  <BrandBadge brandSlug={chassisInfo.brandSlug} />
                  <p>{chassisInfo.brand} - {chassisInfo.model}</p>
                  <h2>{tuneDisplayName(tune)}</h2>
                  <button className="driverLink" type="button" onClick={() => navigate(`/u/${tune.ownerUsername ?? "demo-driver"}`)}>
                    {tune.ownerDisplayName ?? tune.ownerUsername ?? "RC driver"}
                  </button>
                </div>
                <div className="communityMeta">
                  <span>{tune.track || "Track not listed"}</span>
                  <span>{tune.surface || "Surface not listed"}</span>
                  <span>{tuneTire(tune)}</span>
                  <span><Star size={14} /> {tune.rating}/5</span>
                </div>
                {quickFacts.length ? (
                  <div className="tuneCardFacts communityQuickFacts" aria-label="Community tune quick facts">
                    {quickFacts.map(([label, value]) => <span key={label}><em>{label}</em>{value}</span>)}
                  </div>
                ) : null}
                <BasicTuneSummary tune={tune} car={car} compact onView={() => navigate(`/t/${tune.shareId ?? tune.id}`)} onClone={tune.cloneEnabled === false ? undefined : () => onClone?.(tune)} />
                <div className="tagRow">{bestForTags(tune).slice(0, 5).map((tag) => <span key={tag}>{tag}</span>)}</div>
                <div className="communityStats">
                  <span>{tune.likeCount ?? 0} likes</span>
                  <span>{tune.cloneCount ?? 0} clones</span>
                  <span>{tune.viewCount ?? 0} views</span>
                  <span>{commentsForTune.length} comments</span>
                </div>
                {tune.sourceTuneId ? (
                  <p className="remixNote">Copied from {tune.sourceBrand ?? "community"} {tune.sourceModel ?? "setup"}</p>
                ) : null}
                <div className="publicActions communityActions">
                  <button type="button" onClick={() => navigate(`/t/${tune.shareId ?? tune.id}`)}>View</button>
                  <button type="button" onClick={() => onClone?.(tune)}><CopyPlus size={16} /> Copy to My Tunes</button>
                  <div className="communityMore">
                    <button
                      type="button"
                      aria-expanded={moreMenuTuneId === tune.id}
                      aria-label={`More community actions for ${tuneDisplayName(tune)}`}
                      onClick={() => setMoreMenuTuneId((current) => current === tune.id ? "" : tune.id)}
                    >
                      <MoreHorizontal size={16} />
                      More
                    </button>
                    {moreMenuTuneId === tune.id ? (
                      <div className="communityMoreMenu">
                        <button type="button" onClick={() => {
                          setMoreMenuTuneId("");
                          onLike?.(tune.id);
                        }}><Heart size={16} /> Like</button>
                        <button type="button" aria-pressed={isFavorite} onClick={() => {
                          setMoreMenuTuneId("");
                          onFavorite?.(tune.id);
                        }}>{isFavorite ? "Remove favorite" : "Favorite"}</button>
                        <button type="button" onClick={() => {
                          setMoreMenuTuneId("");
                          onFollow?.(tune.ownerUsername ?? "demo-driver");
                        }}><UserPlus size={16} /> {data.follows?.some((follow) => follow.followingUsername === (tune.ownerUsername ?? "demo-driver")) ? "Following" : "Follow driver"}</button>
                        <button type="button" onClick={() => {
                          setMoreMenuTuneId("");
                          setCommentingTuneId(commentingTuneId === tune.id ? "" : tune.id);
                        }}><MessageCircle size={16} /> Comment</button>
                      </div>
                    ) : null}
                  </div>
                </div>
                {commentingTuneId === tune.id ? (
                  <div className="commentComposer">
                    <textarea value={commentBody} placeholder="Add a helpful track note..." onChange={(event) => setCommentBody(event.target.value)} />
                    <button className="smallPill" type="button" onClick={() => saveComment(tune.id)}>Post comment</button>
                  </div>
                ) : null}
                {commentsForTune.length ? (
                  <div className="commentList">
                    {commentsForTune.slice(0, 2).map((comment) => (
                      <article key={comment.id}>
                        <strong>{comment.authorName}</strong>
                        <span>{comment.body}</span>
                      </article>
                    ))}
                  </div>
                ) : null}
                {tune.clonedFromTuneId && !tune.sourceTuneId ? <p className="remixNote">Remix of {tune.clonedFromShareId ?? tune.clonedFromTuneId}</p> : null}
              </div>
            </article>
          );
        }) : (
          <EmptyState
            title={hasPublicTunes ? "No matching setups" : "Community"}
            body={hasPublicTunes ? "Try clearing filters or searching a broader chassis, surface, or electronics setup." : "Public tunes will appear here once drivers start sharing."}
            action={hasPublicTunes ? <button className="primaryAction" type="button" onClick={resetFilters}>Clear filters</button> : undefined}
          />
        )}
      </div>
    </main>
  );
}

function CommunityStat({ label, value }: { label: string; value: number }) {
  return (
    <section>
      <strong>{value}</strong>
      <span>{label}</span>
    </section>
  );
}

export function TrackPage({ data, trackSlug, onClone }: { data: AppData; trackSlug: string; onClone: (tune: Tune) => void }) {
  const normalizedSlug = decodeURIComponent(trackSlug);
  const tunes = data.tunes.filter((tune) => tune.visibility === "public" && tune.track.toLowerCase().replace(/\s+/g, "-") === normalizedSlug);
  const track = tunes[0]?.track ?? normalizedSlug.replace(/-/g, " ");
  const tires = Array.from(new Set(tunes.map(tuneTire).filter(Boolean))).slice(0, 6);
  const drivers = Array.from(new Set(tunes.map((tune) => tune.ownerDisplayName ?? tune.ownerUsername ?? "RC driver"))).slice(0, 6);
  return (
    <main className="publicPage">
      <header className="publicHero">
        <p>Track page</p>
        <h1>{track}</h1>
        <span>{tunes.length} public tunes · {drivers.length} drivers tuning here</span>
      </header>
      <section className="communityFeatureGrid">
        <CommunityStat label="Popular tunes" value={tunes.filter((tune) => (tune.likeCount ?? 0) > 0).length} />
        <CommunityStat label="Recent tunes" value={tunes.length} />
        <CommunityStat label="Common tires" value={tires.length} />
      </section>
      <section className="publicSection">
        <h2>Surface notes</h2>
        <p>{tunes[0]?.surface ? `${tunes[0].surface} setups are common here. Use tire and gyro settings as starting points, then test gently.` : "No surface notes yet."}</p>
      </section>
      <section className="publicSection">
        <h2>Common tires</h2>
        <div className="tagRow">{tires.map((tire) => <span key={tire}>{tire}</span>)}</div>
      </section>
      <section className="publicSection">
        <h2>Drivers tuning here</h2>
        <div className="tagRow">{drivers.map((driver) => <span key={driver}>{driver}</span>)}</div>
      </section>
      <LibraryPage data={{ ...data, tunes }} compact onClone={onClone} />
    </main>
  );
}

export function BrandPage({
  data,
  brandSlug,
  account,
  onClone,
  onCreateTune
}: {
  data: AppData;
  brandSlug: string;
  account: UserAccount | null;
  onClone: (tune: Tune) => void;
  onCreateTune: (brandSlug: string) => void;
}) {
  const brand = findChassisBrand(brandSlug) ?? chassisBrands[0];
  const [modelFilter, setModelFilter] = useState("all");
  const [surfaceFilter, setSurfaceFilter] = useState("all");
  const [query, setQuery] = useState("");
  const brandTunes = data.tunes.filter((tune) => chassisInfoFromTune(tune, data.cars.find((car) => car.id === tune.carId)).brandSlug === brand.slug);
  const publicTunes = brandTunes.filter((tune) => tune.visibility === "public");
  const myTunes = brandTunes.filter((tune) => account ? tune.ownerId === account.uid : tune.ownerId === "local-user" || !tune.ownerId);
  const surfaces = Array.from(new Set(publicTunes.map((tune) => tune.surface).filter(Boolean)));
  const popularModels = brand.models
    .map((model) => ({ model, count: publicTunes.filter((tune) => chassisInfoFromTune(tune, data.cars.find((car) => car.id === tune.carId)).modelSlug === slugifyChassis(model)).length }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const visibleTunes = publicTunes.filter((tune) => {
    const info = chassisInfoFromTune(tune, data.cars.find((car) => car.id === tune.carId));
    if (modelFilter !== "all" && info.modelSlug !== modelFilter) return false;
    if (surfaceFilter !== "all" && tune.surface !== surfaceFilter) return false;
    if (!query.trim()) return true;
    return `${tune.name} ${tune.track} ${tune.surface} ${tune.tags.join(" ")} ${Object.values(tune.values).join(" ")}`.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <main className="publicPage brandPage">
      <BrandHeader
        brand={brand}
        subtitle={`${brand.models.length} models ready for tune organization`}
        action={<button className="primaryAction" type="button" onClick={() => onCreateTune(brand.slug)}>Create Brand Tune</button>}
      />
      <section className="publicSection">
        <h2>Available models</h2>
        <div className="tagRow">{brand.models.map((model) => <span key={model}>{model}</span>)}</div>
      </section>
      <section className="communityFeatureGrid">
        <CommunityStat label="Public tunes" value={publicTunes.length} />
        <CommunityStat label="My saved tunes" value={myTunes.length} />
        <CommunityStat label="Popular models" value={popularModels.length} />
      </section>
      <section className="publicSection">
        <h2>Popular models</h2>
        {popularModels.length ? <div className="tagRow">{popularModels.map((item) => <span key={item.model}>{item.model} · {item.count}</span>)}</div> : <p>No public model activity yet.</p>}
      </section>
      <div className="libraryFilters communityFilters">
        <label>
          <Search size={17} />
          <input value={query} placeholder={`Search ${brand.name} tunes...`} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <select value={modelFilter} onChange={(event) => setModelFilter(event.target.value)} aria-label="Model filter">
          <option value="all">All models</option>
          {brand.models.map((model) => <option key={model} value={slugifyChassis(model)}>{model}</option>)}
        </select>
        <select value={surfaceFilter} onChange={(event) => setSurfaceFilter(event.target.value)} aria-label="Surface filter">
          <option value="all">All surfaces</option>
          {surfaces.map((surface) => <option key={surface}>{surface}</option>)}
        </select>
      </div>
      <section className="publicSection">
        <h2>Public community tunes</h2>
        <div className="communityTuneList">
          {visibleTunes.length ? visibleTunes.map((tune) => {
            const car = data.cars.find((item) => item.id === tune.carId);
            const info = chassisInfoFromTune(tune, car);
            return (
              <article className="communityTuneCard compactBrandTune" key={tune.id}>
                <div className="communityTuneBody">
                  <BrandBadge brandSlug={info.brandSlug} />
                  <h2>{tuneDisplayName(tune)}</h2>
                  <p>{info.model} · {tune.surface || "Surface not listed"} · {tune.track || "Track not listed"}</p>
                  <BasicTuneSummary tune={tune} car={car} compact onView={() => navigate(`/t/${tune.shareId ?? tune.id}`)} onClone={tune.cloneEnabled !== false ? () => onClone(tune) : undefined} />
                  <div className="publicActions communityActions">
                    <button type="button" onClick={() => navigate(`/t/${tune.shareId ?? tune.id}`)}>View</button>
                    {tune.cloneEnabled !== false ? <button type="button" onClick={() => onClone(tune)}><CopyPlus size={16} /> Clone</button> : null}
                  </div>
                </div>
              </article>
            );
          }) : <EmptyState title={`${brand.name} tunes`} body="Public tunes for this brand will appear once drivers share them." />}
        </div>
      </section>
      <section className="publicSection">
        <h2>My saved tunes for {brand.name}</h2>
        {myTunes.length ? <div className="tagRow">{myTunes.slice(0, 10).map((tune) => <span key={tune.id}>{tuneDisplayName(tune)}</span>)}</div> : <p>No saved tunes for this brand yet.</p>}
      </section>
    </main>
  );
}
