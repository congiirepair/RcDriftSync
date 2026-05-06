import { Copy, Download, Heart, QrCode, Share2, Star } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { absoluteShareUrl } from "../config/domain";
import { getPdfTemplate } from "../data/pdfTemplates";
import type { Car, Tune } from "../types";
import { FilledPdfPreview } from "./FilledPdfPreview";
import { TuneTimeline, TuneVisualSummary, VisualChassisMap } from "./TuneVisuals";

interface PublicTunePageProps {
  tune?: Tune;
  car?: Car;
  onClone: (tune: Tune) => void;
  onLike: (tune: Tune) => void;
  onShare: (tune: Tune) => void;
  onViewed: (tune: Tune) => void;
}

const chassisFields = [
  ["frontRideHeight", "Front ride height"],
  ["frontCamber", "Front camber"],
  ["frontToe", "Front toe"],
  ["frontShockPosition", "Front shock position"],
  ["frontSpring", "Front spring"],
  ["frontShockOil", "Front shock oil"],
  ["rearRideHeight", "Rear ride height"],
  ["rearCamber", "Rear camber"],
  ["rearToe", "Rear toe"],
  ["rearShockPosition", "Rear shock position"],
  ["rearSpring", "Rear spring"],
  ["rearShockOil", "Rear shock oil"],
  ["motorPosition", "Motor position"]
] as const;

const electronicsGroups = [
  {
    title: "ESC tune",
    enabled: "sharedEscTuneEnabled",
    fields: [
      ["escBrand", "Brand"],
      ["escModel", "Model"],
      ["escProfileName", "Profile"],
      ["throttleCurve", "Throttle curve"],
      ["boostTiming", "Boost"],
      ["turboTiming", "Turbo"],
      ["motorTiming", "Motor timing"]
    ]
  },
  {
    title: "Servo tune",
    enabled: "sharedServoTuneEnabled",
    fields: [
      ["servoBrand", "Brand"],
      ["servoModel", "Model"],
      ["servoHornLength", "Horn length"],
      ["endpointLeft", "Endpoint left"],
      ["endpointRight", "Endpoint right"],
      ["centerTrim", "Center trim"]
    ]
  },
  {
    title: "Gyro tune",
    enabled: "sharedGyroTuneEnabled",
    fields: [
      ["gyroBrand", "Brand"],
      ["gyroModel", "Model"],
      ["gyroGain", "Gain"],
      ["gyroMode", "Mode"],
      ["gyroCurveSetting", "Curve"],
      ["gyroDirection", "Direction"]
    ]
  },
  {
    title: "Radio tune",
    enabled: "sharedRadioTuneEnabled",
    fields: [
      ["radioBrand", "Brand"],
      ["radioModel", "Model"],
      ["steeringDualRate", "Steering dual rate"],
      ["steeringExpo", "Steering expo"],
      ["throttleExpo", "Throttle expo"],
      ["brakeCurve", "Brake curve"]
    ]
  }
] as const;

function tuneValue(tune: Tune, fieldId: string) {
  if (fieldId === "tire") return tune.values.tires ?? tune.values.frontTires ?? tune.values.rearTires;
  return tune.values[fieldId] ?? tune.selections[fieldId] ?? "";
}

function visibleRows(tune: Tune, rows: readonly (readonly [string, string])[]) {
  return rows
    .map(([fieldId, label]) => [label, tuneValue(tune, fieldId)] as const)
    .filter(([, value]) => String(value ?? "").trim());
}

export function PublicTunePage({ tune, car, onClone, onLike, onShare, onViewed }: PublicTunePageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const viewedTuneId = useRef("");

  useEffect(() => {
    if (!tune || viewedTuneId.current === tune.id) return;
    viewedTuneId.current = tune.id;
    onViewed(tune);
  }, [onViewed, tune]);

  if (!tune) {
    return (
      <main className="publicPage">
        <h1>Shared tune not available</h1>
        <p>This tune may be private, removed, or only visible to the owner.</p>
      </main>
    );
  }

  const sharedTune = tune;
  const template = getPdfTemplate(sharedTune.sheetId);
  const shareUrl = absoluteShareUrl(sharedTune.shareId ?? sharedTune.id);
  const canShowPhotos = sharedTune.sharedPhotosEnabled && sharedTune.photos.length > 0;
  const showOwner = sharedTune.sharedOwnerNameEnabled !== false;
  const chassisRows = visibleRows(sharedTune, chassisFields);

  async function copyLink() {
    await navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    onShare(sharedTune);
  }

  async function nativeShare() {
    if (navigator.share) {
      await navigator.share({ title: sharedTune.name, text: "RC Drift Sync tune", url: shareUrl });
    } else {
      await navigator.clipboard?.writeText(shareUrl);
      setCopied(true);
    }
    onShare(sharedTune);
  }

  function likeTune() {
    if (liked) return;
    setLiked(true);
    onLike(sharedTune);
  }

  return (
    <main className="publicPage">
      <header className="publicHero">
        <p>Shared tune</p>
        <h1>{tune.name}</h1>
        <span>
          {showOwner ? `${tune.ownerDisplayName ?? "RC driver"} · ` : ""}
          {template.chassis} · {tune.track || "Track not set"} · {tune.rating}/5
        </span>
      </header>

      <section className="sharePanel">
        <div className="qrBox">
          <QRCodeSVG value={shareUrl} size={148} bgColor="transparent" fgColor="currentColor" />
        </div>
        <div>
          <h2>Share link</h2>
          <p>{shareUrl}</p>
          <div className="publicActions">
            <button type="button" onClick={copyLink}>
              <Copy size={18} />
              {copied ? "Copied" : "Copy link"}
            </button>
            <button type="button" onClick={nativeShare}>
              <Share2 size={18} />
              Share
            </button>
            <button type="button" onClick={likeTune} aria-pressed={liked}>
              <Heart size={18} />
              {liked ? "Liked" : "Like"}
            </button>
            {tune.cloneEnabled ? (
              <button type="button" onClick={() => onClone(tune)}>
                <Download size={18} />
                Clone to My Garage
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="publicSection">
        <h2>Overview</h2>
        <TuneVisualSummary tune={tune} car={car} />
        <dl className="publicDataGrid">
          <div><dt>Car</dt><dd>{car?.name ?? "Shared car"}</dd></div>
          <div><dt>Chassis</dt><dd>{template.chassis}</dd></div>
          <div><dt>Track</dt><dd>{tune.track || "Not listed"}</dd></div>
          <div><dt>Surface</dt><dd>{tune.surface || "Not listed"}</dd></div>
          <div><dt>Tire</dt><dd>{String(tuneValue(tune, "tire") || "Not listed")}</dd></div>
          <div><dt>Rating</dt><dd><Star size={15} /> {tune.rating}/5</dd></div>
        </dl>
        <div className="tagRow">{tune.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <p className="publicStats">{tune.viewCount ?? 0} views · {tune.likeCount ?? 0} likes · {tune.cloneCount ?? 0} clones · {tune.shareCount ?? 0} shares</p>
      </section>

      {tune.sharedChassisSetupEnabled !== false && chassisRows.length ? (
        <>
          <VisualChassisMap tune={tune} />
          <PublicRows title="Chassis setup" rows={chassisRows} />
        </>
      ) : null}

      {electronicsGroups.map((group) => {
        if (!tune[group.enabled]) return null;
        const rows = visibleRows(tune, group.fields);
        return rows.length ? <PublicRows key={group.title} title={group.title} rows={rows} /> : null;
      })}

      <section className="publicSection">
        <h2>
          <QrCode size={19} />
          Filled setup PDF
        </h2>
        <FilledPdfPreview tune={tune} template={template} onSave={async () => undefined} allowDownload={tune.pdfDownloadEnabled !== false} shareUrl={shareUrl} />
      </section>

      {tune.sharedNotesEnabled ? (
        <section className="publicSection">
          <h2>Notes</h2>
          <p>{tune.notes || "No public notes included."}</p>
        </section>
      ) : null}

      {tune.sharedHistoryEnabled && tune.history.length ? (
        <section className="publicSection">
          <h2>Change history</h2>
          <TuneTimeline tune={tune} />
          <div className="publicTimeline">
            {tune.history.slice(0, 6).map((entry) => (
              <article key={entry.id}>
                <strong>{entry.summary}</strong>
                <span>{new Date(entry.date).toLocaleDateString()}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {canShowPhotos ? (
        <section className="publicSection">
          <h2>Photos</h2>
          <div className="photoGrid">
            {tune.photos.map((photo) => (
              <figure className="photoCard" key={photo.id}>
                <img src={photo.cloudUrl || photo.dataUrl} alt={photo.label} />
                <figcaption>{photo.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function PublicRows({ title, rows }: { title: string; rows: readonly (readonly [string, string | number | boolean | string[]])[] }) {
  return (
    <section className="publicSection">
      <h2>{title}</h2>
      <dl className="publicDataGrid">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
