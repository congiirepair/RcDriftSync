import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { VisualSetupDefinition, VisualSetupOption, VisualSetupSlot } from "../data/visualSetupDefinitions";

interface VisualSetupHelperProps {
  definition: VisualSetupDefinition;
  values: Record<string, string>;
  onSelect: (slot: VisualSetupSlot, option: VisualSetupOption) => void;
}

function optionAt(definition: VisualSetupDefinition, value: string) {
  return definition.options.find((option) => option.label === value || option.id === value);
}

function keyboardSelect(event: KeyboardEvent<SVGGElement>, action: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  action();
}

function InsertDiagram({
  definition,
  slot,
  selected,
  onSelect
}: {
  definition: VisualSetupDefinition;
  slot: VisualSetupSlot;
  selected: string;
  onSelect: (option: VisualSetupOption) => void;
}) {
  const selectedOption = optionAt(definition, selected);
  return (
    <article className="visualSetupSlot">
      <header>
        <strong>{slot.label}</strong>
        <span>{selectedOption?.label ?? "Tap a position"}</span>
      </header>
      <svg viewBox="0 0 100 100" className="visualSetupDiagram" role="img" aria-label={`${slot.label} insert positions`}>
        <defs>
          <linearGradient id={`visual-plate-${definition.id}-${slot.id}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#102938" />
            <stop offset="0.58" stopColor="#07131b" />
            <stop offset="1" stopColor="#02080e" />
          </linearGradient>
        </defs>
        <path className="visualSetupPlate" d="M12 16 H88 L94 24 V76 L88 84 H12 L6 76 V24 Z" fill={`url(#visual-plate-${definition.id}-${slot.id})`} />
        <path className="visualSetupCenterline" d="M50 19 V81" />
        <text className="visualSetupColumnLabel" x="34" y="15">In</text>
        <text className="visualSetupColumnLabel" x="66" y="15">Out</text>
        {definition.options.map((option) => {
          const isSelected = selectedOption?.id === option.id;
          const action = () => onSelect(option);
          return (
            <g
              key={option.id}
              className={isSelected ? "visualSetupHotspot selected" : "visualSetupHotspot"}
              role="button"
              tabIndex={0}
              aria-label={`${slot.label}: ${option.label}`}
              aria-pressed={isSelected}
              onClick={action}
              onKeyDown={(event) => keyboardSelect(event, action)}
            >
              <circle cx={option.x} cy={option.y} r={isSelected ? 6.7 : 5.4} />
              <text x={option.x} y={option.y + 1.6}>{option.label.replace(" ", "\n")}</text>
            </g>
          );
        })}
      </svg>
      <p>{selectedOption?.helper ?? definition.helper}</p>
    </article>
  );
}

export function VisualSetupHelper({ definition, values, onSelect }: VisualSetupHelperProps) {
  const [open, setOpen] = useState(false);
  const selectedCount = definition.slots.filter((slot) => values[slot.fieldId]).length;
  return (
    <section className="visualSetupHelper">
      <button
        className="visualSetupToggle"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span>
          <strong>Visual Setup Helper</strong>
          <em>{definition.brand} - {selectedCount}/{definition.slots.length} insert positions saved</em>
        </span>
        <ChevronDown size={18} />
      </button>
      {open ? (
        <div className="visualSetupPanel">
          <div className="visualSetupIntro">
            <span>{definition.displayName}</span>
            <p>{definition.helper}</p>
            <small>{definition.verified ? "Verified source" : "Fallback / needs verification"}: {definition.sourceLabel}</small>
          </div>
          <div className="visualSetupSlots">
            {definition.slots.map((slot) => (
              <InsertDiagram
                key={slot.id}
                definition={definition}
                slot={slot}
                selected={values[slot.fieldId] ?? ""}
                onSelect={(option) => onSelect(slot, option)}
              />
            ))}
          </div>
          <dl className="visualSetupReadout">
            {definition.slots.map((slot) => (
              <div key={slot.id}>
                <dt>{slot.label}</dt>
                <dd>{values[slot.fieldId] || "Not selected"}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
