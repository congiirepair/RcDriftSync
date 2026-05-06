import type { SetupField, Tune } from "../types";

interface FieldEditorProps {
  field: SetupField;
  tune: Tune;
  onValue: (fieldId: string, value: string | number | boolean | string[]) => void;
}

export function FieldEditor({ field, tune, onValue }: FieldEditorProps) {
  const raw = tune.values[field.id] ?? "";

  if (field.type === "select") {
    return (
      <label className="field">
        <span>{field.label}</span>
        <select value={String(raw)} onChange={(event) => onValue(field.id, event.target.value)}>
          <option value="">Not set</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="field fieldWide">
        <span>{field.label}</span>
        <textarea value={String(raw)} placeholder={field.placeholder} onChange={(event) => onValue(field.id, event.target.value)} rows={4} />
      </label>
    );
  }

  return (
    <label className="field">
      <span>{field.label}</span>
      <div className="inputWithUnit">
        <input
          value={String(raw)}
          inputMode={field.type === "number" ? "decimal" : "text"}
          type={field.type === "number" ? "number" : "text"}
          placeholder={field.placeholder}
          onChange={(event) => onValue(field.id, field.type === "number" ? Number(event.target.value) : event.target.value)}
        />
        {field.unit ? <em>{field.unit}</em> : null}
      </div>
    </label>
  );
}
