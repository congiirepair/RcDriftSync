import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { getSheet } from "../data/sheets";
import type { AppData } from "../types";
import { changedFields } from "../utils/changes";
import { tuneDisplayName } from "../utils/tuneInsights";
import { SetupPersonalityBars } from "./TuneVisuals";

interface CompareViewProps {
  data: AppData;
  onClose: () => void;
}

export function CompareView({ data, onClose }: CompareViewProps) {
  const [leftId, setLeftId] = useState(data.tunes[0]?.id ?? "");
  const [rightId, setRightId] = useState(data.tunes[1]?.id ?? data.tunes[0]?.id ?? "");
  const left = data.tunes.find((tune) => tune.id === leftId) ?? data.tunes[0];
  const right = data.tunes.find((tune) => tune.id === rightId) ?? data.tunes[1] ?? data.tunes[0];
  const changed = useMemo(() => (left && right ? changedFields(left, right) : new Set<string>()), [left, right]);
  if (!left || !right) return null;
  const fields = getSheet(left.sheetId).fields;

  return (
    <main className="compareView">
      <header className="compareHeader">
        <div>
          <p>Tune comparison</p>
          <h1>Compare</h1>
        </div>
        <button className="iconButton" type="button" onClick={onClose} aria-label="Close compare">
          <X size={23} />
        </button>
      </header>
      <div className="comparePickers">
        <select value={leftId} onChange={(event) => setLeftId(event.target.value)}>
          {data.tunes.map((tune) => (
            <option key={tune.id} value={tune.id}>
              {tuneDisplayName(tune)}
            </option>
          ))}
        </select>
        <select value={rightId} onChange={(event) => setRightId(event.target.value)}>
          {data.tunes.map((tune) => (
            <option key={tune.id} value={tune.id}>
              {tuneDisplayName(tune)}
            </option>
          ))}
        </select>
      </div>
      <div className="miniSheets">
        {[left, right].map((tune) => {
          const sheet = getSheet(tune.sheetId);
          return (
            <section key={tune.id}>
              <h2>{tuneDisplayName(tune)}</h2>
              <SetupPersonalityBars tune={tune} compact />
              <div className="miniSheet">
                <img src={sheet.image} alt={sheet.name} />
                <svg viewBox={`0 0 ${sheet.imageWidth} ${sheet.imageHeight}`}>
                  {sheet.hotspots.flatMap((hotspot) =>
                    hotspot.options
                      ?.filter((option) => option.id === tune.selections[hotspot.fieldId])
                      .map((option) => <circle key={`${hotspot.id}-${option.id}`} cx={option.x} cy={option.y} r="18" />) ?? []
                  )}
                </svg>
              </div>
            </section>
          );
        })}
      </div>
      <div className="compareRows">
        {["track", "surface", "grip", "rating", ...fields.map((field) => field.id)].map((id) => {
          const label = fields.find((field) => field.id === id)?.label ?? id;
          const leftValue = id in left ? left[id as keyof typeof left] : left.selections[id] ?? left.values[id] ?? "";
          const rightValue = id in right ? right[id as keyof typeof right] : right.selections[id] ?? right.values[id] ?? "";
          return (
            <article className={changed.has(id) ? "changed" : ""} key={id}>
              <strong>{label}</strong>
              <span>{String(leftValue)}</span>
              <span>{String(rightValue)}</span>
            </article>
          );
        })}
      </div>
    </main>
  );
}
