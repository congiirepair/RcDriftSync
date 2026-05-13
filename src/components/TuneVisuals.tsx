import { Activity, ArrowRightLeft, BatteryCharging, CarFront, CopyPlus, FileText, Gauge, RadioTower, Route, Share2, SlidersHorizontal, TimerReset, Wrench } from "lucide-react";
import type { ChangeEvent } from "react";
import { chassisInfoFromTune } from "../data/chassisBrands";
import { visualSetupSummaryValues } from "../data/visualSetupDefinitions";
import type { Car, Tune, TuneFeelProfile } from "../types";
import { bestForTags, feelForTune, primaryFeelLabels, tuneConfidence, tuneDisplayName, valueText } from "../utils/tuneInsights";
import { BrandLogo } from "./BrandIdentity";

export function SetupPersonalityBars({ tune, compact = false }: { tune: Tune; compact?: boolean }) {
  const feel = feelForTune(tune);
  const rows = compact ? primaryFeelLabels.slice(0, 4) : primaryFeelLabels;
  return (
    <div className={compact ? "feelBars compact" : "feelBars"} aria-label="Setup personality">
      {rows.map((item) => {
        const value = Number(feel[item.key] ?? 5);
        return (
            <div className="feelBar" key={item.key}>
              <span>{item.label}</span>
              <i aria-hidden="true"><b style={{ width: `${Math.max(0, Math.min(100, (value / 10) * 100))}%` }} /></i>
              <em>{value <= 3 ? item.low : value >= 8 ? item.high : "balanced"}</em>
            </div>
        );
      })}
    </div>
  );
}

export function FeelEditor({ tune, onChange }: { tune: Tune; onChange: (feel: TuneFeelProfile) => void }) {
  const feel = feelForTune(tune);
  const update = (key: keyof TuneFeelProfile) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...feel, [key]: Number(event.target.value) });
  };
  return (
    <section className="feelEditor">
      <header>
        <p>Expected feel</p>
        <h3>How this tune should drive</h3>
      </header>
      {primaryFeelLabels.map((item) => (
        <label key={item.key}>
          <span>{item.label}</span>
            <input type="range" min="1" max="10" step="1" value={Number(feel[item.key] ?? 5)} onChange={update(item.key)} />
            <strong>{Number(feel[item.key] ?? 5)}/10</strong>
            <em>{item.low} / {item.high}</em>
        </label>
      ))}
    </section>
  );
}

export function VisualChassisMap({ tune }: { tune: Tune }) {
  const filled = {
    steering: Boolean(valueText(tune, "frontToe") || valueText(tune, "ackerman") || valueText(tune, "gyroGain")),
    front: Boolean(valueText(tune, "frontRideHeight") || valueText(tune, "frontSpring") || valueText(tune, "frontShockPosition")),
    rear: Boolean(valueText(tune, "rearRideHeight") || valueText(tune, "rearSpring") || valueText(tune, "rearShockPosition")),
    motor: Boolean(valueText(tune, "motorPosition") || valueText(tune, "pinionGear") || valueText(tune, "spurGear")),
    weight: Boolean(valueText(tune, "batteryPosition") || valueText(tune, "addedWeight") || valueText(tune, "weightLocation")),
    electronics: Boolean(valueText(tune, "escModel") || valueText(tune, "servoModel") || valueText(tune, "gyroModel")),
    tires: Boolean(valueText(tune, "tires") || valueText(tune, "frontWheelOffset") || valueText(tune, "rearWheelOffset"))
  };
  return (
    <section className="visualChassisMap" aria-label="Visual setup map">
      <header>
        <p>Setup map</p>
        <h3>Filled zones</h3>
      </header>
      <div className="chassisDiagram" aria-hidden="true">
        <span className={filled.front ? "filled front" : "front"}>Front suspension</span>
        <span className={filled.steering ? "filled steering" : "steering"}>Steering</span>
        <span className={filled.electronics ? "filled electronics" : "electronics"}>Electronics</span>
        <span className={filled.weight ? "filled weight" : "weight"}>Weight</span>
        <span className={filled.motor ? "filled motor" : "motor"}>Motor</span>
        <span className={filled.rear ? "filled rear" : "rear"}>Rear suspension</span>
        <span className={filled.tires ? "filled tires" : "tires"}>Tires</span>
      </div>
    </section>
  );
}

export function TuneVisualSummary({ tune, car, compact = false }: { tune: Tune; car?: Car; compact?: boolean }) {
  const chassisInfo = chassisInfoFromTune(tune, car);
  return (
    <section className={compact ? "tuneVisualSummary compact" : "tuneVisualSummary"}>
      <header>
        <div>
          <strong>Driver Feel</strong>
          <span>{[chassisInfo.brand && chassisInfo.model ? `${chassisInfo.brand} ${chassisInfo.model}` : "", tune.track, tune.surface].filter(Boolean).join(" - ") || tuneDisplayName(tune)}</span>
        </div>
      </header>
      <SetupPersonalityBars tune={tune} compact={compact} />
    </section>
  );
}

function basicProfileName(tune: Tune, category: "esc" | "servo" | "gyro") {
  const item = tune.electronics?.[category];
  const snapshot = item?.profileSnapshot;
  if (snapshot && typeof snapshot === "object" && "profileName" in snapshot) return String(snapshot.profileName ?? "");
  return valueText(tune, `${category}ProfileName`) || item?.selectedProfileId || "";
}

function compactPair(primary: string, secondary?: string) {
  return [primary, secondary].filter(Boolean).join(" / ");
}

function electronicsProductLabel(tune: Tune, category: "esc" | "motor" | "servo" | "gyro") {
  const item = tune.electronics?.[category];
  const brand = item?.brand || valueText(tune, `${category}Brand`);
  const modelKey = category === "motor" ? "motorModel" : `${category}Model`;
  const model = item?.model || valueText(tune, modelKey) || (category === "motor" ? valueText(tune, "motor") : "");
  const product = compactPair(brand, model);
  if (category === "motor") return compactPair(product, valueText(tune, "motorTurns"));
  if (category === "esc" || category === "servo" || category === "gyro") return product || basicProfileName(tune, category);
  return product;
}

function basicTuneSummaryRows(tune: Tune, car?: Car) {
  const chassisInfo = chassisInfoFromTune(tune, car);
  const insertSummary = visualSetupSummaryValues(tune).slice(0, 4).join(" / ");
  const rows = [
    ["Chassis", `${chassisInfo.brand} ${chassisInfo.model}`.trim()],
    ["Track", tune.track],
    ["Mount inserts", insertSummary],
    ["Motor", electronicsProductLabel(tune, "motor")],
    ["ESC", electronicsProductLabel(tune, "esc")],
    ["Servo", electronicsProductLabel(tune, "servo")],
    ["Gyro", electronicsProductLabel(tune, "gyro")]
  ] as const;
  return rows.filter(([, value]) => String(value ?? "").trim());
}

function tunePrimaryFacts(tune: Tune, car?: Car) {
  const chassisInfo = chassisInfoFromTune(tune, car);
  const tire = valueText(tune, "frontTire") || valueText(tune, "rearTire") || valueText(tune, "tires");
  const esc = valueText(tune, "escModel") || valueText(tune, "escBrand");
  const motor = valueText(tune, "motorModel") || valueText(tune, "motor");
  const gyro = valueText(tune, "gyroModel") || valueText(tune, "gyroBrand");
  const servo = valueText(tune, "servoModel") || valueText(tune, "servoBrand");
  return [
    ["Chassis", `${chassisInfo.brand} ${chassisInfo.model}`.trim()],
    ["Surface", tune.surface],
    ["Tire", tire],
    ["Motor", motor],
    ["ESC", esc],
    ["Gyro", gyro],
    ["Servo", servo]
  ].filter(([, value]) => String(value ?? "").trim()) as Array<[string, string]>;
}

export function BasicTuneSummary({
  tune,
  car,
  compact = false,
  onView,
  onClone,
  cloneLabel = "Clone tune",
  excludeLabels = []
}: {
  tune: Tune;
  car?: Car;
  compact?: boolean;
  onView?: () => void;
  onClone?: () => void;
  cloneLabel?: string;
  excludeLabels?: string[];
}) {
  const exclude = new Set(excludeLabels);
  const rows = basicTuneSummaryRows(tune, car).filter(([label]) => !exclude.has(label));
  if (!rows.length) return null;
  const visibleRows = compact ? rows.slice(0, 6) : rows;
  const hiddenCount = rows.length - visibleRows.length;
  return (
    <section className={compact ? "basicTuneSummary compact" : "basicTuneSummary"} aria-label="Basic Tune summary">
      <header>
        <strong>Setup Snapshot</strong>
        {!compact ? <span>{`${rows.length} saved item${rows.length === 1 ? "" : "s"}`}</span> : null}
        {compact && hiddenCount > 0 ? <span>{`+${hiddenCount} more`}</span> : null}
      </header>
      <div className="basicSummaryChips">
        {visibleRows.map(([label, value]) => (
          <span key={label}>
            <em>{label}</em>
            {String(value)}
          </span>
        ))}
      </div>
      <div className="publicActions communityActions">
        {onView ? <button type="button" onClick={onView}><FileText size={16} /> View full tune</button> : null}
        {onClone ? <button type="button" onClick={onClone}><CopyPlus size={16} /> {cloneLabel}</button> : null}
      </div>
    </section>
  );
}

export function TuneCard({ tune, car, onView, onClone, onFavorite }: { tune: Tune; car?: Car; onView?: () => void; onClone?: () => void; onFavorite?: () => void }) {
  const chassisInfo = chassisInfoFromTune(tune, car);
  const facts = tunePrimaryFacts(tune, car).slice(0, 5);
  return (
    <article className="visualTuneCard">
      <button className="visualTuneCardMain" type="button" onClick={onView}>
        <span className="tuneCardIcon"><BrandLogo brandSlug={chassisInfo.brandSlug} size="small" variant="mark" /></span>
        <span>
          <strong>{tuneDisplayName(tune)}</strong>
          <em>{car?.chassisModel || car?.chassis || "Chassis not set"} · {tune.surface || "Surface not set"}</em>
        </span>
      </button>
      {facts.length ? (
        <div className="tuneCardFacts" aria-label="Tune quick facts">
          {facts.map(([label, value]) => (
            <span key={label}><em>{label}</em>{value}</span>
          ))}
        </div>
      ) : null}
      <BasicTuneSummary tune={tune} car={car} compact onView={onView} />
      <div className="tagRow compactTags">{bestForTags(tune).slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
      <div className="communityStats">
        <span>{tune.likeCount ?? 0} likes</span>
        <span>{tune.cloneCount ?? 0} forks</span>
        <span>{tuneConfidence(tune)}/5 confidence</span>
      </div>
      <div className="publicActions communityActions">
        {onView ? <button type="button" onClick={onView}><FileText size={16} /> View</button> : null}
        {onClone ? <button type="button" onClick={onClone}><CopyPlus size={16} /> Clone</button> : null}
        {onFavorite ? <button type="button" onClick={onFavorite}><Share2 size={16} /> Save</button> : null}
      </div>
    </article>
  );
}

export function TuneTimeline({ tune }: { tune: Tune }) {
  const assistantEntries = tune.setupAssistantLog ?? [];
  const revisions = tune.history ?? [];
  const hasEntries = assistantEntries.length || revisions.length || tune.changeReason;
  return (
    <section className="tuneTimeline">
      <header>
        <p>Tune evolution</p>
        <h3>What changed and how it felt</h3>
      </header>
      {!hasEntries ? <span className="emptyText">No tune changes logged yet.</span> : null}
      {tune.changeReason ? (
        <article>
          <Wrench size={17} />
          <div><strong>Current change reason</strong><span>{tune.changeReason}</span></div>
        </article>
      ) : null}
      {assistantEntries.slice(0, 4).map((entry) => (
        <article key={entry.id}>
          <TimerReset size={17} />
          <div>
            <strong>{entry.symptom}</strong>
            <span>{entry.result || "test planned"} · {entry.testChange || entry.plainLanguage}</span>
          </div>
        </article>
      ))}
      {revisions.slice(0, 4).map((entry) => (
        <article key={entry.id}>
          <Activity size={17} />
          <div>
            <strong>{entry.summary}</strong>
            <span>{[new Date(entry.date).toLocaleDateString(), entry.result, entry.trackCondition, entry.reason].filter(Boolean).join(" - ")}</span>
            {entry.notes ? <small>{entry.notes}</small> : null}
          </div>
        </article>
      ))}
    </section>
  );
}

export function TuneCategoryTabs() {
  const tabs = [
    ["Electronics", RadioTower],
    ["Steering", Route],
    ["Suspension", SlidersHorizontal],
    ["Drivetrain", ArrowRightLeft],
    ["Motor position", Gauge],
    ["Tires / wheels", CarFront],
    ["Weight balance", BatteryCharging],
    ["Notes / photos", FileText]
  ] as const;
  return (
    <div className="categoryPills" aria-label="Tune categories">
      {tabs.map(([label, Icon]) => (
        <span key={label}><Icon size={15} /> {label}</span>
      ))}
    </div>
  );
}
