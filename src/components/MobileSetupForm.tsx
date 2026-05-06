import { useState } from "react";
import type { PdfTemplate, FormFieldDef } from "../data/pdfTemplates";
import type { Tune } from "../types";

interface MobileSetupFormProps {
  tune: Tune;
  template: PdfTemplate;
  onValue: (fieldId: string, value: string | number | boolean | string[]) => void;
  onMeta: (patch: Partial<Tune>) => void;
}

export function MobileSetupForm({ tune, template, onValue, onMeta }: MobileSetupFormProps) {
  const [section, setSection] = useState(template.sections[0]);
  const fields = template.formFields.filter((field) => field.section === section);

  function valueFor(field: FormFieldDef) {
    if (field.id === "date") return tune.date;
    if (field.id === "drivingPlace") return tune.track;
    return tune.values[field.id] ?? "";
  }

  function setField(field: FormFieldDef, value: string | number | boolean | string[]) {
    if (field.id === "date") onMeta({ date: String(value) });
    else if (field.id === "drivingPlace") onMeta({ track: String(value) });
    else onValue(field.id, value);
  }

  return (
    <div className="mobileForm">
      <div className="sectionScroller" role="tablist" aria-label="Setup form sections">
        {template.sections.map((item) => (
          <button key={item} className={item === section ? "active" : ""} type="button" onClick={() => setSection(item)}>
            {item}
          </button>
        ))}
      </div>
      <section className="formSection">
        <h2>{section}</h2>
        <div className="fieldGrid">
          {fields.map((field) => {
            const value = valueFor(field);
            if (field.type === "textarea") {
              return (
                <label className="field fieldWide" key={field.id}>
                  <span>{field.label}</span>
                  <textarea value={String(value)} rows={4} onChange={(event) => setField(field, event.target.value)} />
                </label>
              );
            }
            if (field.type === "select" || field.type === "holeSelect") {
              return (
                <label className="field" key={field.id}>
                  <span>{field.label}</span>
                  <select value={String(value)} onChange={(event) => setField(field, event.target.value)}>
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
            if (field.type === "checkboxGroup") {
              return (
                <fieldset className="checkGroup fieldWide" key={field.id}>
                  <legend>{field.label}</legend>
                  {field.options?.map((option) => (
                    <label key={option}>
                      <input type="radio" name={field.id} checked={value === option} onChange={() => setField(field, option)} />
                      <span>{option}</span>
                    </label>
                  ))}
                </fieldset>
              );
            }
            return (
              <label className="field" key={field.id}>
                <span>{field.label}</span>
                <div className="inputWithUnit">
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    inputMode={field.type === "number" ? "decimal" : "text"}
                    value={String(value)}
                    placeholder={field.placeholder}
                    onChange={(event) => setField(field, field.type === "number" ? Number(event.target.value) : event.target.value)}
                  />
                  {field.suffix ? <em>{field.suffix}</em> : null}
                </div>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
