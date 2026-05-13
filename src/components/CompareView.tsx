import { ArrowRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import { chassisInfoFromTune } from "../data/chassisBrands";
import { partDisplayForTune } from "../data/rcParts";
import type { AppData, Tune, TuneSnapshot } from "../types";
import { changedFields } from "../utils/changes";
import { feelLabels, tuneDisplayName, valueText } from "../utils/tuneInsights";
import { SetupPersonalityBars, TuneVisualSummary } from "./TuneVisuals";

interface CompareViewProps {
  data: AppData;
  onClose: () => void;
}

type CompareSource = Tune | (TuneSnapshot & { id: string; updatedAt?: string; createdAt?: string; history?: Tune["history"]; photos?: Tune["photos"]; ownerId?: string; visibility?: Tune["visibility"] });

const compareSections = [
  {
    title: "Chassis / Track",
    rows: [
      ["chassis", "Chassis"],
      ["surface", "Surface"],
      ["track", "Track"],
      ["trackConditionPreset", "Track condition"],
      ["grip", "Grip"],
      ["rating", "Rating"],
      ["visibility", "Visibility"]
    ]
  },
  {
    title: "Electronics",
    rows: [
      ["motor", "Motor"],
      ["escModel", "ESC"],
      ["gyroModel", "Gyro"],
      ["gyroGain", "Gyro gain"],
      ["servoModel", "Servo"],
      ["boostTiming", "Boost"],
      ["turboTiming", "Turbo"],
      ["finalDriveRatio", "FDR"]
    ]
  },
  {
    title: "Geometry / Suspension",
    rows: [
      ["frontRideHeight", "Front ride height"],
      ["rearRideHeight", "Rear ride height"],
      ["frontCamber", "Front camber"],
      ["rearCamber", "Rear camber"],
      ["frontToe", "Front toe"],
      ["rearToe", "Rear toe"],
      ["frontShockPosition", "Front shock position"],
      ["rearShockPosition", "Rear shock position"],
      ["frontSpring", "Front spring"],
      ["rearSpring", "Rear spring"],
      ["frontShockOil", "Front shock oil"],
      ["rearShockOil", "Rear shock oil"]
    ]
  },
  {
    title: "Tires / Feel / Change",
    rows: [
      ["tires", "Tires"],
      ["frontTire", "Front tire"],
      ["rearTire", "Rear tire"],
      ["tags", "Tags"],
      ["changeReason", "Why changed"],
      ["testResult", "Result"],
      ["notes", "Notes"]
    ]
  }
] as const;

function snapshotToSource(snapshot: TuneSnapshot, owner: Tune, id: string): CompareSource {
  return {
    ...snapshot,
    id,
    updatedAt: owner.updatedAt,
    createdAt: owner.createdAt,
    photos: owner.photos,
    history: owner.history,
    ownerId: owner.ownerId,
    visibility: owner.visibility
  };
}

function sourceValue(source: CompareSource, fieldId: string, car?: AppData["cars"][number]) {
  if (fieldId === "chassis") {
    const info = chassisInfoFromTune(source as Tune, car);
    return [info.brand, info.model].filter(Boolean).join(" ") || "Unknown / Other";
  }
  if (fieldId === "motor") return partDisplayForTune(source as Tune, "motor", ["motorBrand", "motorModel", "motor"], source.electronics?.motor) || valueText(source as Tune, "motorModel") || valueText(source as Tune, "motor");
  if (fieldId === "escModel") return partDisplayForTune(source as Tune, "esc", ["escBrand", "escModel"], source.electronics?.esc) || valueText(source as Tune, "escModel");
  if (fieldId === "gyroModel") return partDisplayForTune(source as Tune, "gyro", ["gyroBrand", "gyroModel"], source.electronics?.gyro) || valueText(source as Tune, "gyroModel");
  if (fieldId === "servoModel") return partDisplayForTune(source as Tune, "servo", ["servoBrand", "servoModel"], source.electronics?.servo) || valueText(source as Tune, "servoModel");
  if (fieldId === "tags") return (source.tags ?? []).join(", ");
  const direct = source[fieldId as keyof CompareSource];
  if (direct !== undefined && typeof direct !== "object") return String(direct);
  return valueText(source as Tune, fieldId);
}

function hasDifference(leftValue: string, rightValue: string) {
  return leftValue.trim() !== rightValue.trim();
}

export function CompareView({ data, onClose }: CompareViewProps) {
  const [leftId, setLeftId] = useState(data.tunes[0]?.id ?? "");
  const leftTune = data.tunes.find((tune) => tune.id === leftId) ?? data.tunes[0];
  const rightOptions = useMemo(() => {
    const saved = data.tunes.map((tune) => ({ id: tune.id, label: tuneDisplayName(tune), source: tune as CompareSource }));
    const previous = (leftTune?.history ?? []).map((entry) => ({ id: `history:${entry.id}`, label: `Previous: ${entry.summary}`, source: snapshotToSource(entry.snapshot, leftTune, `history-${entry.id}`) }));
    return [...previous, ...saved];
  }, [data.tunes, leftTune]);
  const [rightId, setRightId] = useState(rightOptions[0]?.id ?? "");
  const left = leftTune;
  const right = rightOptions.find((option) => option.id === rightId)?.source ?? rightOptions[0]?.source ?? data.tunes[1] ?? data.tunes[0];
  const leftCar = left ? data.cars.find((car) => car.id === left.carId) : undefined;
  const rightCar = right ? data.cars.find((car) => car.id === right.carId) : undefined;
  const changed = useMemo(() => (left && right && "history" in right ? changedFields(left, right as Tune) : new Set<string>()), [left, right]);
  if (!left || !right) {
    return (
      <main className="compareView">
        <header className="compareHeader">
          <div>
            <p>Tune comparison</p>
            <h1>Compare setups</h1>
          </div>
          <button className="iconButton" type="button" onClick={onClose} aria-label="Close compare">
            <X size={23} />
          </button>
        </header>
        <section className="appCard">
          <h2>No tunes to compare yet</h2>
          <p className="mutedText">Save at least one tune, then duplicate or edit it to compare changes over time.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="compareView">
      <header className="compareHeader">
        <div>
          <p>Tune comparison</p>
          <h1>Compare setups</h1>
        </div>
        <button className="iconButton" type="button" onClick={onClose} aria-label="Close compare">
          <X size={23} />
        </button>
      </header>
      <div className="comparePickers">
        <label>
          <span>Left tune</span>
          <select value={leftId} onChange={(event) => setLeftId(event.target.value)}>
            {data.tunes.map((tune) => (
              <option key={tune.id} value={tune.id}>{tuneDisplayName(tune)}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Compare against</span>
          <select value={rightId} onChange={(event) => setRightId(event.target.value)}>
            {rightOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="compareSummaryGrid">
        <TuneVisualSummary tune={left} car={leftCar} compact />
        <TuneVisualSummary tune={right as Tune} car={rightCar} compact />
      </div>

      <section className="compareFeel appCard">
        <header>
          <p>Driver feel</p>
          <h2>Rating differences</h2>
        </header>
        <SetupPersonalityBars tune={left} compact />
        <ArrowRight size={18} />
        <SetupPersonalityBars tune={right as Tune} compact />
      </section>

      <div className="compareRows">
        {compareSections.map((section) => (
          <section key={section.title} className="compareSection">
            <h2>{section.title}</h2>
            {section.rows.map(([id, label]) => {
              const leftValue = sourceValue(left, id, leftCar);
              const rightValue = sourceValue(right, id, rightCar);
              const changedRow = changed.has(id) || hasDifference(leftValue, rightValue);
              return (
                <article className={changedRow ? "changed" : ""} key={`${section.title}-${id}`}>
                  <strong>{label}</strong>
                  <span>{leftValue || "Not set"}</span>
                  <span>{rightValue || "Not set"}</span>
                </article>
              );
            })}
          </section>
        ))}
        <section className="compareSection">
          <h2>Feel ratings</h2>
          {feelLabels.slice(0, 10).map((feel) => {
            const leftValue = String(left.expectedFeel?.[feel.key] ?? "");
            const rightValue = String((right as Tune).expectedFeel?.[feel.key] ?? "");
            return (
              <article className={hasDifference(leftValue, rightValue) ? "changed" : ""} key={feel.key}>
                <strong>{feel.label}</strong>
                <span>{leftValue || "Not set"}</span>
                <span>{rightValue || "Not set"}</span>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
