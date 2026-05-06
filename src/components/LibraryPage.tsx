import { CopyPlus, Heart, MessageCircle, Search, Star, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { getPdfTemplate } from "../data/pdfTemplates";
import type { AppData, Tune } from "../types";
import { navigate } from "../utils/routing";
import { bestForTags, tuneDisplayName } from "../utils/tuneInsights";
import { SetupPersonalityBars } from "./TuneVisuals";
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

const sortOptions = ["newest", "most cloned", "most liked", "most viewed", "rating"] as const;

const textValue = (tune: Tune, field: string) => String(tune.values[field] ?? tune.selections[field] ?? "");

function tuneTire(tune: Tune) {
  return textValue(tune, "tires") || textValue(tune, "frontTires") || textValue(tune, "rearTires") || "Tire not listed";
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
  if (category === "esc") return Boolean(textValue(tune, "escBrand") || textValue(tune, "escModel") || textValue(tune, "boostTiming"));
  if (category === "servo") return Boolean(textValue(tune, "servoBrand") || textValue(tune, "servoModel"));
  if (category === "gyro") return Boolean(textValue(tune, "gyroBrand") || textValue(tune, "gyroModel") || textValue(tune, "gyroGain"));
  if (category === "track") return Boolean(tune.track);
  return haystack.includes(category);
}

function sortTunes(tunes: Tune[], sort: string) {
  return [...tunes].sort((a, b) => {
    if (sort === "most viewed") return (b.viewCount ?? 0) - (a.viewCount ?? 0);
    if (sort === "most cloned") return (b.cloneCount ?? 0) - (a.cloneCount ?? 0);
    if (sort === "most liked") return (b.likeCount ?? 0) - (a.likeCount ?? 0);
    if (sort === "rating") return b.rating - a.rating;
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  });
}

export function LibraryPage({ data, compact = false, onClone, onLike, onFavorite, onComment, onFollow }: LibraryPageProps) {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<(typeof sortOptions)[number]>("newest");
  const [query, setQuery] = useState("");
  const [commentingTuneId, setCommentingTuneId] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const comments = data.comments ?? [];
  const favorites = data.favorites ?? [];
  const publicTunes = useMemo(() => {
    const search = query.toLowerCase().trim();
    return sortTunes(
      data.tunes.filter((tune) => {
        if (tune.visibility !== "public") return false;
        if (!matchesCategory(tune, category)) return false;
        if (!search) return true;
        const template = getPdfTemplate(tune.sheetId);
        const searchable = `${tune.name} ${template.chassis} ${tune.ownerDisplayName ?? ""} ${tune.track} ${tune.surface} ${tune.tags.join(" ")} ${Object.values(tune.values).join(" ")}`.toLowerCase();
        return searchable.includes(search);
      }),
      sort
    );
  }, [category, data.tunes, query, sort]);

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
          <h1>Public tune library</h1>
          <span>Find setups by chassis, electronics, track, surface, tire, rating, and driver.</span>
        </header>
      ) : null}

      <section className="communityRails" aria-label="Community tune categories">
        {filterOptions.map(([id, label]) => (
          <button key={id} className={category === id ? "active" : ""} type="button" onClick={() => setCategory(id)}>
            {label}
          </button>
        ))}
      </section>

      <div className="libraryFilters communityFilters">
        <label>
          <Search size={17} />
          <input value={query} placeholder="Search chassis, ESC, tire, track..." onChange={(event) => setQuery(event.target.value)} />
        </label>
        <select value={sort} onChange={(event) => setSort(event.target.value as (typeof sortOptions)[number])}>
          {sortOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
      </div>

      <div className="communityFeatureGrid">
        <CommunityStat label="Featured tunes" value={data.tunes.filter((tune) => tune.visibility === "public" && matchesCategory(tune, "featured")).length} />
        <CommunityStat label="Most cloned" value={Math.max(0, ...data.tunes.map((tune) => tune.cloneCount ?? 0))} />
        <CommunityStat label="Public drivers" value={new Set(data.tunes.filter((tune) => tune.visibility === "public").map((tune) => tune.ownerUsername)).size} />
      </div>

      <div className="communityTuneList">
        {publicTunes.length ? publicTunes.map((tune) => {
          const template = getPdfTemplate(tune.sheetId);
          const commentsForTune = comments.filter((comment) => comment.tuneId === tune.id);
          const isFavorite = favorites.some((favorite) => favorite.tuneId === tune.id);
          return (
            <article className="communityTuneCard" key={tune.id}>
              <button className="communityThumb" type="button" onClick={() => navigate(`/t/${tune.shareId ?? tune.id}`)}>
                {tune.photos[0] && tune.sharedPhotosEnabled ? <img src={tune.photos[0].cloudUrl || tune.photos[0].dataUrl} alt="" /> : <img src={template.previewImageAsset} alt="" />}
              </button>
              <div className="communityTuneBody">
                <div>
                  <p>{template.chassis}</p>
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
                <SetupPersonalityBars tune={tune} compact />
                <div className="tagRow">{bestForTags(tune).slice(0, 5).map((tag) => <span key={tag}>{tag}</span>)}</div>
                <div className="communityStats">
                  <span>{tune.likeCount ?? 0} likes</span>
                  <span>{tune.cloneCount ?? 0} clones</span>
                  <span>{tune.viewCount ?? 0} views</span>
                  <span>{commentsForTune.length} comments</span>
                </div>
                <div className="publicActions communityActions">
                  <button type="button" onClick={() => navigate(`/t/${tune.shareId ?? tune.id}`)}>View</button>
                  <button type="button" onClick={() => onClone?.(tune)}><CopyPlus size={16} /> Clone</button>
                  <button type="button" onClick={() => onLike?.(tune.id)}><Heart size={16} /> Like</button>
                  <button type="button" aria-pressed={isFavorite} onClick={() => onFavorite?.(tune.id)}>{isFavorite ? "Saved" : "Favorite"}</button>
                  <button type="button" onClick={() => onFollow?.(tune.ownerUsername ?? "demo-driver")}><UserPlus size={16} /> {data.follows?.some((follow) => follow.followingUsername === (tune.ownerUsername ?? "demo-driver")) ? "Following" : "Follow"}</button>
                  <button type="button" onClick={() => setCommentingTuneId(commentingTuneId === tune.id ? "" : tune.id)}><MessageCircle size={16} /> Comment</button>
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
                {tune.clonedFromTuneId ? <p className="remixNote">Remix of {tune.clonedFromShareId ?? tune.clonedFromTuneId}</p> : null}
              </div>
            </article>
          );
        }) : <EmptyState title="Community" body="Public tunes will appear here once drivers start sharing." />}
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
