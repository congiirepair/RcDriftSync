import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { RotateCcw } from "lucide-react";
import type { Hotspot, SetupSheetTemplate, Tune } from "../types";

interface InteractiveSheetProps {
  sheet: SetupSheetTemplate;
  tune: Tune;
  onHotspot: (hotspot: Hotspot) => void;
}

export function InteractiveSheet({ sheet, tune, onHotspot }: InteractiveSheetProps) {
  const sx = (value: number) => (value <= 1 ? value * sheet.imageWidth : value);
  const sy = (value: number) => (value <= 1 ? value * sheet.imageHeight : value);
  const sw = (value: number) => (value <= 1 ? value * sheet.imageWidth : value);
  const sh = (value: number) => (value <= 1 ? value * sheet.imageHeight : value);

  const markerText = (fieldId: string) => {
    const value = String(tune.values[fieldId] ?? "Tap");
    return value.length > 12 ? `${value.slice(0, 11)}...` : value;
  };

  const labelText = (label: string) => {
    const text = `Tap: ${label}`;
    return text.length > 20 ? `${text.slice(0, 19)}...` : text;
  };

  return (
    <div className="interactiveShell">
      <div className="sheetHelp">Tap a highlighted area or colored hole to edit that setup item. Pinch to zoom, drag to pan.</div>
      <TransformWrapper minScale={1} maxScale={3.5} doubleClick={{ disabled: true }} wheel={{ disabled: true }} pinch={{ step: 6 }}>
        {({ resetTransform }) => (
          <>
            <button className="zoomReset" type="button" onClick={() => resetTransform()} aria-label="Reset zoom">
              <RotateCcw size={18} />
            </button>
            <TransformComponent wrapperClass="transformWrapper" contentClass="transformContent">
              <div className="sheetCanvas" style={{ aspectRatio: `${sheet.imageWidth}/${sheet.imageHeight}` }}>
                <img src={sheet.image} alt={sheet.name} draggable={false} />
                <svg className="hotspotLayer" viewBox={`0 0 ${sheet.imageWidth} ${sheet.imageHeight}`} aria-label={`${sheet.name} interactive fields`}>
                  {sheet.hotspots.map((hotspot) => {
                    const selected = tune.selections[hotspot.fieldId] ?? String(tune.values[hotspot.fieldId] ?? "");
                    const x = sx(hotspot.x);
                    const y = sy(hotspot.y);
                    const width = sw(hotspot.width);
                    const height = sh(hotspot.height);
                    return (
                      <g key={hotspot.id}>
                        <rect
                          className="hotspotRect"
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          rx="18"
                          onClick={() => onHotspot(hotspot)}
                        />
                        <g className="hotspotLabel" onClick={() => onHotspot(hotspot)}>
                          <rect x={x} y={Math.max(0, y - 28)} width={Math.max(160, Math.min(230, width))} height="24" rx="10" />
                          <text x={x + 10} y={Math.max(18, y - 11)}>
                            {labelText(hotspot.label)}
                          </text>
                        </g>
                        {hotspot.options?.map((option) => {
                          const isSelected = selected === option.id;
                          const optionX = sx(option.x);
                          const optionY = sy(option.y);
                          return (
                            <g key={option.id} className={isSelected ? "selectedHole" : "hole"}>
                              <circle cx={optionX} cy={optionY} r={isSelected ? 16 : 12} onClick={() => onHotspot(hotspot)} />
                              {isSelected ? <path d={`M ${optionX - 7} ${optionY} l5 6 l10 -12`} onClick={() => onHotspot(hotspot)} /> : null}
                            </g>
                          );
                        })}
                        {!hotspot.options ? (
                          <>
                            <rect className="valueMarker" x={x + 8} y={y + 8} width={width - 16} height={height - 16} rx="12" onClick={() => onHotspot(hotspot)} />
                            <text className={markerText(hotspot.fieldId).length > 8 ? "compactText" : ""} x={x + 18} y={y + 34} onClick={() => onHotspot(hotspot)}>
                              {markerText(hotspot.fieldId)}
                            </text>
                          </>
                        ) : null}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
