import { scaleLinear } from "d3-scale";
import type { KeyboardEvent } from "react";
import { BASIC_CUSTOM_OPTION } from "../data/basicTuneOptions";

export type GeometryDiagramType =
  | "shockTower"
  | "damperArm"
  | "rearHub"
  | "steering"
  | "slideRack"
  | "ddss"
  | "ifs";

interface GeometryHolePoint {
  option: string;
  x: number;
  y: number;
  label: string;
}

interface D3GeometryHolePickerProps {
  label: string;
  value: string;
  options: string[];
  helper?: string;
  diagram: GeometryDiagramType;
  onChange: (value: string) => void;
}

const customOptionLabels = new Set([BASIC_CUSTOM_OPTION, "Custom / Other"]);

function isCustomOption(option: string) {
  return customOptionLabels.has(option);
}

function selectFromKeyboard(event: KeyboardEvent<SVGGElement>, action: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  action();
}

function compactLabel(option: string, index: number) {
  if (/hole\s*\d/i.test(option)) return option.replace(/^Hole\s*/i, "");
  if (/position\s*\d/i.test(option)) return option.replace(/^Position\s*/i, "P");
  if (/inner/i.test(option)) return "IN";
  if (/middle|center/i.test(option)) return "MID";
  if (/outer/i.test(option)) return "OUT";
  if (/forward/i.test(option)) return "FWD";
  if (/rearward/i.test(option)) return "REAR";
  if (/upper/i.test(option)) return "UP";
  if (/lower/i.test(option)) return "LOW";
  return String(index + 1);
}

function pointsFor(diagram: GeometryDiagramType, options: string[]): GeometryHolePoint[] {
  const holeOptions = options.filter((option) => !isCustomOption(option));
  const x = scaleLinear().domain([0, Math.max(1, holeOptions.length - 1)]).range([0, 1]);
  return holeOptions.map((option, index) => {
    const t = x(index);
    if (diagram === "shockTower") {
      return { option, x: 34 + t * 30, y: 72 - t * 48, label: compactLabel(option, index) };
    }
    if (diagram === "damperArm") {
      return { option, x: 22 + t * 56, y: 58 - Math.sin(t * Math.PI) * 6, label: compactLabel(option, index) };
    }
    if (diagram === "rearHub") {
      const column = index % 3;
      const row = Math.floor(index / 3);
      return { option, x: 30 + column * 20, y: row === 0 ? 36 : 64, label: compactLabel(option, index) };
    }
    if (diagram === "slideRack") {
      return { option, x: 22 + t * 56, y: 50, label: compactLabel(option, index) };
    }
    if (diagram === "ddss") {
      const positions = [
        { x: 31, y: 50 },
        { x: 50, y: 50 },
        { x: 69, y: 50 },
        { x: 50, y: 31 },
        { x: 50, y: 69 }
      ];
      return { option, ...(positions[index] ?? { x: 22 + t * 56, y: 50 }), label: compactLabel(option, index) };
    }
    if (diagram === "ifs") {
      const column = index % 3;
      const row = Math.floor(index / 3);
      return { option, x: 28 + column * 22, y: row === 0 ? 36 : 64, label: compactLabel(option, index) };
    }
    return { option, x: 25 + t * 50, y: 38 + Math.sin(t * Math.PI) * 24, label: compactLabel(option, index) };
  });
}

function DiagramBody({ diagram }: { diagram: GeometryDiagramType }) {
  if (diagram === "shockTower") {
    return (
      <>
        <path className="geometryDiagramPart" d="M27 80 L35 18 H66 L73 80 Z" />
        <path className="geometryDiagramDetail" d="M35 78 C43 67 58 67 66 78" />
      </>
    );
  }
  if (diagram === "damperArm") {
    return (
      <>
        <path className="geometryDiagramPart" d="M14 52 C32 39 68 39 86 52 L78 68 H22 Z" />
        <path className="geometryDiagramDetail" d="M20 60 H80" />
      </>
    );
  }
  if (diagram === "rearHub") {
    return (
      <>
        <path className="geometryDiagramPart" d="M27 18 H73 L82 31 V72 L70 82 H30 L18 72 V31 Z" />
        <circle className="geometryDiagramDetail" cx="50" cy="50" r="12" />
      </>
    );
  }
  if (diagram === "slideRack") {
    return (
      <>
        <path className="geometryDiagramPart" d="M12 41 H88 V59 H12 Z" />
        <path className="geometryDiagramDetail" d="M19 50 H81" />
      </>
    );
  }
  if (diagram === "ddss") {
    return (
      <>
        <path className="geometryDiagramPart" d="M30 30 H70 V70 H30 Z" />
        <path className="geometryDiagramDetail" d="M50 24 V76 M24 50 H76" />
      </>
    );
  }
  if (diagram === "ifs") {
    return (
      <>
        <path className="geometryDiagramPart" d="M19 25 H81 L72 45 H28 Z" />
        <path className="geometryDiagramPart secondary" d="M22 57 H78 L70 77 H30 Z" />
      </>
    );
  }
  return (
    <>
      <path className="geometryDiagramPart" d="M25 25 L78 43 L65 76 L20 60 Z" />
      <path className="geometryDiagramDetail" d="M31 56 C45 43 60 38 73 42" />
    </>
  );
}

export function D3GeometryHolePicker({ label, value, options, helper, diagram, onChange }: D3GeometryHolePickerProps) {
  const points = pointsFor(diagram, options);
  const selectedIndex = points.findIndex((point) => point.option === value);
  const selectedPoint = selectedIndex >= 0 ? points[selectedIndex] : null;

  return (
    <fieldset className="geometryPointPicker geometryPointPickerVisual fieldWide">
      <legend>{label}</legend>
      <div className="geometryDiagramWrap">
        <svg viewBox="0 0 100 100" className="geometryD3Diagram" role="img" aria-label={`${label} mounting hole diagram`}>
          <defs>
            <radialGradient id={`geometry-glow-${diagram}-${label.replace(/\W+/g, "-")}`} cx="50%" cy="45%" r="65%">
              <stop offset="0" stopColor="rgba(32, 188, 255, 0.28)" />
              <stop offset="1" stopColor="rgba(2, 8, 14, 0)" />
            </radialGradient>
          </defs>
          <rect className="geometryDiagramBackplate" x="7" y="8" width="86" height="84" rx="13" />
          <rect x="7" y="8" width="86" height="84" rx="13" fill={`url(#geometry-glow-${diagram}-${label.replace(/\W+/g, "-")})`} />
          <DiagramBody diagram={diagram} />
          {points.map((point, index) => {
            const selected = point.option === value;
            const action = () => onChange(selected ? "" : point.option);
            return (
              <g
                key={point.option}
                className={selected ? "geometryD3Hole selected" : "geometryD3Hole"}
                role="button"
                tabIndex={0}
                aria-label={`${label}: ${point.option}`}
                aria-pressed={selected}
                onClick={action}
                onKeyDown={(event) => selectFromKeyboard(event, action)}
              >
                <circle className="geometryD3HitArea" cx={point.x} cy={point.y} r="11" />
                <circle className="geometryD3HoleOuter" cx={point.x} cy={point.y} r={selected ? 7.4 : 6.2} />
                <circle className="geometryD3HoleInner" cx={point.x} cy={point.y} r={selected ? 3.8 : 2.6} />
                <text x={point.x} y={point.y + 17}>{point.label || index + 1}</text>
              </g>
            );
          })}
        </svg>
        <div className="geometryDiagramReadout">
          <span>{selectedPoint ? "Selected mounting point" : "Tap a mounting hole"}</span>
          <strong>{value || "Not selected"}</strong>
        </div>
      </div>
      <div className="geometryPointOptions" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={value === option ? "selected" : ""}
            aria-pressed={value === option}
            onClick={() => onChange(value === option ? "" : option)}
          >
            {option}
          </button>
        ))}
      </div>
      {helper ? <small className="fieldHelper">{helper}</small> : null}
    </fieldset>
  );
}
