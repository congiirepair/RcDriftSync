import type { Tune, TuneSnapshot } from "../types";

const trackedLabels: Record<string, string> = {
  name: "Tune name",
  track: "Track",
  surface: "Surface",
  grip: "Grip",
  rating: "Rating",
  notes: "Notes",
  frontShockPosition: "Front shock position",
  rearShockPosition: "Rear shock position",
  frontUpperLink: "Front upper link",
  rearUpperLink: "Rear upper link",
  armMount: "Arm mount",
  servoPosition: "Servo position"
};

export function snapshotTune(tune: Tune): TuneSnapshot {
  return {
    name: tune.name,
    carId: tune.carId,
    sheetId: tune.sheetId,
    date: tune.date,
    track: tune.track,
    surface: tune.surface,
    grip: tune.grip,
    rating: tune.rating,
    tags: [...tune.tags],
    values: { ...tune.values },
    selections: { ...tune.selections },
    notes: tune.notes,
    setupIntent: [...(tune.setupIntent ?? [])],
    bestForTags: [...(tune.bestForTags ?? [])],
    trackConditionPreset: tune.trackConditionPreset,
    expectedFeel: tune.expectedFeel ? { ...tune.expectedFeel } : undefined,
    actualFeel: tune.actualFeel ? { ...tune.actualFeel } : undefined,
    changeReason: tune.changeReason,
    testResult: tune.testResult,
    confidenceRating: tune.confidenceRating,
    summaryChips: [...(tune.summaryChips ?? [])]
  };
}

export function describeChanges(before: Tune, after: Tune): string[] {
  const changes: string[] = [];
  const beforeSnapshot = snapshotTune(before);
  const afterSnapshot = snapshotTune(after);

  for (const key of ["name", "track", "surface", "grip", "rating", "notes"] as const) {
    if (JSON.stringify(beforeSnapshot[key]) !== JSON.stringify(afterSnapshot[key])) {
      changes.push(`${trackedLabels[key]} changed`);
    }
  }

  const ids = new Set([...Object.keys(before.values), ...Object.keys(after.values), ...Object.keys(before.selections), ...Object.keys(after.selections)]);
  ids.forEach((id) => {
    const beforeValue = before.selections[id] ?? before.values[id];
    const afterValue = after.selections[id] ?? after.values[id];
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes.push(`${trackedLabels[id] ?? id} changed from ${String(beforeValue ?? "blank")} to ${String(afterValue ?? "blank")}`);
    }
  });

  if (JSON.stringify(before.tags) !== JSON.stringify(after.tags)) changes.push("Tags changed");
  if (JSON.stringify(before.setupIntent ?? []) !== JSON.stringify(after.setupIntent ?? [])) changes.push("Tune goal changed");
  if (JSON.stringify(before.bestForTags ?? []) !== JSON.stringify(after.bestForTags ?? [])) changes.push("Best-for tags changed");
  if (JSON.stringify(before.expectedFeel ?? {}) !== JSON.stringify(after.expectedFeel ?? {})) changes.push("Expected car feel changed");
  if (JSON.stringify(before.actualFeel ?? {}) !== JSON.stringify(after.actualFeel ?? {})) changes.push("Tested car feel changed");
  if (before.changeReason !== after.changeReason) changes.push("Change reason updated");
  if (before.testResult !== after.testResult) changes.push("Test result updated");
  if (before.photos.length !== after.photos.length) changes.push("Photos changed");
  return [...new Set(changes)];
}

export function withRevision(before: Tune, after: Tune): Tune {
  const changes = describeChanges(before, after);
  if (!changes.length) return after;
  return {
    ...after,
    updatedAt: new Date().toISOString(),
    history: [
      {
        id: `rev-${Date.now()}`,
        date: new Date().toISOString(),
        summary: changes.slice(0, 2).join(", "),
        changes,
        snapshot: snapshotTune(before)
      },
      ...after.history
    ]
  };
}

export function changedFields(left: Tune, right: Tune): Set<string> {
  const changed = new Set<string>();
  const ids = new Set([...Object.keys(left.values), ...Object.keys(right.values), ...Object.keys(left.selections), ...Object.keys(right.selections)]);
  ids.forEach((id) => {
    if (JSON.stringify(left.selections[id] ?? left.values[id]) !== JSON.stringify(right.selections[id] ?? right.values[id])) changed.add(id);
  });
  for (const key of ["track", "surface", "grip", "rating", "notes", "tags"] as const) {
    if (JSON.stringify(left[key]) !== JSON.stringify(right[key])) changed.add(key);
  }
  for (const key of ["setupIntent", "bestForTags", "expectedFeel", "actualFeel", "changeReason", "testResult", "confidenceRating"] as const) {
    if (JSON.stringify(left[key] ?? null) !== JSON.stringify(right[key] ?? null)) changed.add(key);
  }
  return changed;
}
