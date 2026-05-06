import type { SetupSheetTemplate, Tune } from "../types";
import { FieldEditor } from "./FieldEditor";

interface DetailsTabProps {
  tune: Tune;
  sheet: SetupSheetTemplate;
  onMeta: (patch: Partial<Tune>) => void;
  onValue: (fieldId: string, value: string | number | boolean | string[]) => void;
}

export function DetailsTab({ tune, sheet, onMeta, onValue }: DetailsTabProps) {
  const sections = sheet.fields.reduce<Record<string, typeof sheet.fields>>((acc, field) => {
    acc[field.section] = [...(acc[field.section] ?? []), field];
    return acc;
  }, {});

  return (
    <div className="tabPanel detailsPanel">
      <section className="formSection">
        <h2>Tune info</h2>
        <label className="field fieldWide">
          <span>Tune name</span>
          <input value={tune.name} onChange={(event) => onMeta({ name: event.target.value })} />
        </label>
        <div className="fieldGrid">
          <label className="field">
            <span>Date</span>
            <input type="date" value={tune.date} onChange={(event) => onMeta({ date: event.target.value })} />
          </label>
          <label className="field">
            <span>Track</span>
            <input value={tune.track} onChange={(event) => onMeta({ track: event.target.value })} />
          </label>
          <label className="field">
            <span>Surface</span>
            <input value={tune.surface} onChange={(event) => onMeta({ surface: event.target.value })} />
          </label>
          <label className="field">
            <span>Grip</span>
            <select value={tune.grip} onChange={(event) => onMeta({ grip: event.target.value })}>
              <option>Low</option>
              <option>Low to medium</option>
              <option>Medium</option>
              <option>High</option>
              <option>Changing</option>
            </select>
          </label>
          <label className="field">
            <span>Rating</span>
            <input type="range" min="1" max="5" value={tune.rating} onChange={(event) => onMeta({ rating: Number(event.target.value) })} />
            <strong>{tune.rating}/5</strong>
          </label>
          <label className="field">
            <span>Tags</span>
            <input value={tune.tags.join(", ")} onChange={(event) => onMeta({ tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} />
          </label>
        </div>
      </section>

      {Object.entries(sections).map(([section, fields]) => (
        <section className="formSection" key={section}>
          <h2>{section}</h2>
          <div className="fieldGrid">
            {fields.map((field) => (
              <FieldEditor key={field.id} field={field} tune={tune} onValue={onValue} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
