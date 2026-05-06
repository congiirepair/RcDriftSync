import { Activity, ArrowRightLeft, BatteryCharging, CarFront, CircleGauge, CopyPlus, FileText, Gauge, RadioTower, Route, Share2, SlidersHorizontal, Sparkles, TimerReset, Wrench } from "lucide-react";
import type { ChangeEvent } from "react";
import type { Car, Tune, TuneFeelProfile } from "../types";
import { bestForTags, feelForTune, feelLabels, keySetupChips, shortChangeSummary, tuneConfidence, tuneDisplayName, valueText } from "../utils/tuneInsights";

export function SetupPersonalityBars({ tune, compact = false }: { tune: Tune; compact?: boolean }) {
  const feel = feelForTune(tune);
  const rows = compact ? feelLabels.slice(0, 4) : feelLabels;
  return (
    <div className={compact ? "feelBars compact" : "feelBars"} aria-label="Setup personality">
      {rows.map((item) => {
        const value = feel[item.key];
        return (
          <div className="feelBar" key={item.key}>
            <span>{item.label}</span>
            <i aria-hidden="true"><b style={{ width: `${Math.max(0, Math.min(100, (value / 5) * 100))}%` }} /></i>
            <em>{value <= 2 ? item.low : value >= 4 ? item.high : "balanced"}</em>
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
      {feelLabels.map((item) => (
        <label key={item.key}>
          <span>{item.label}</span>
          <input type="range" min="1" max="5" step="1" value={feel[item.key]} onChange={update(item.key)} />
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
  const tags = bestForTags(tune);
  const chips = keySetupChips(tune, car);
  return (
    <section className={compact ? "tuneVisualSummary compact" : "tuneVisualSummary"}>
      <header>
        <div>
          <p>{car?.chassisModel || car?.chassis || "RC drift tune"}</p>
          <strong>{tuneDisplayName(tune)}</strong>
          <span>{tune.track || "Track not set"} · {tune.surface || "Surface not set"} · confidence {tuneConfidence(tune)}/5</span>
        </div>
        <CircleGauge size={compact ? 24 : 30} />
      </header>
      <SetupPersonalityBars tune={tune} compact={compact} />
      <div className="tagRow">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      {!compact ? <div className="setupChipGrid">{chips.map((chip) => <span key={chip}>{chip}</span>)}</div> : null}
      {!compact ? <p className="changeLine"><Sparkles size={16} /> {shortChangeSummary(tune)}</p> : null}
    </section>
  );
}

export function TuneCard({ tune, car, onView, onClone, onFavorite }: { tune: Tune; car?: Car; onView?: () => void; onClone?: () => void; onFavorite?: () => void }) {
  return (
    <article className="visualTuneCard">
      <button className="visualTuneCardMain" type="button" onClick={onView}>
        <span className="tuneCardIcon"><CarFront size={22} /></span>
        <span>
          <strong>{tuneDisplayName(tune)}</strong>
          <em>{car?.chassisModel || car?.chassis || "Chassis not set"} · {tune.surface || "Surface not set"}</em>
        </span>
      </button>
      <SetupPersonalityBars tune={tune} compact />
      <div className="tagRow">{bestForTags(tune).slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
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
            <span>{new Date(entry.date).toLocaleDateString()}</span>
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
