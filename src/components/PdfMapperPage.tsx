import { Download, FileText, Upload } from "lucide-react";
import type { MouseEvent } from "react";
import { useMemo, useState } from "react";
import { getPdfTemplate } from "../data/pdfTemplates";
import type { PdfCheckboxMap, PdfHoleGroup, PdfTemplate, PdfTextMap } from "../data/pdfTemplates";
import type { Tune } from "../types";
import { generateFilledPdf } from "../utils/pdfExport";

type MappingKind = "text" | "checkbox" | "hole";

interface FieldMapDraft {
  id: string;
  name: string;
  chassis: string;
  sourcePdf: string;
  pdfAsset: string;
  previewImageAsset: string;
  pageWidth: number;
  pageHeight: number;
  text: PdfTextMap[];
  checkboxes: PdfCheckboxMap[];
  holeGroups: PdfHoleGroup[];
}

const officialTemplateIds = ["rdx-template", "mc3-template"];

const fromTemplate = (template: PdfTemplate): FieldMapDraft => ({
  id: template.id,
  name: template.name,
  chassis: template.chassis,
  sourcePdf: template.pdfAsset.split("/").pop() ?? template.pdfAsset,
  pdfAsset: template.pdfAsset,
  previewImageAsset: template.previewImageAsset,
  pageWidth: template.pageWidth,
  pageHeight: template.pageHeight,
  text: template.text.map((item) => ({ ...item })),
  checkboxes: template.checkboxes.map((item) => ({ ...item })),
  holeGroups: template.holeGroups.map((group) => ({ ...group, holes: group.holes.map((hole) => ({ ...hole })) }))
});

const sampleTune = (templateId: string): Tune => ({
  id: `mapper-${templateId}`,
  name: "Mapper sample",
  carId: "mapper-car",
  sheetId: templateId,
  date: "2026-05-05",
  track: "PDF mapper",
  surface: "Plastic Tile",
  grip: "Medium",
  rating: 4,
  tags: ["sample"],
  values: {
    driver: "RC Drift Sync",
    body: "Sample body",
    wing: "Sample wing",
    tires: "Sample tires",
    frontRideHeight: 6,
    rearRideHeight: 6.5,
    frontCamber: -6,
    rearCamber: -3,
    frontToe: 0,
    rearToe: 3,
    frontShockOil: "350 cSt",
    rearShockOil: "400 cSt",
    frontShockPosition: templateId === "mc3-template" ? "2" : "middle-high",
    rearShockPosition: templateId === "mc3-template" ? "3" : "middle-low",
    diffType: "Gear Diff",
    motorPosition: "High Mount",
    servoPosition: templateId === "mc3-template" ? "middle" : "M",
    gyroModel: "Sample gyro",
    escModel: "Sample ESC"
  },
  selections: {
    frontShockPosition: templateId === "mc3-template" ? "2" : "middle-high",
    rearShockPosition: templateId === "mc3-template" ? "3" : "middle-low"
  },
  notes: "",
  photos: [],
  history: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export function PdfMapperPage() {
  const [templateId, setTemplateId] = useState("rdx-template");
  const template = useMemo(() => getPdfTemplate(templateId), [templateId]);
  const [drafts, setDrafts] = useState<Record<string, FieldMapDraft>>(() => Object.fromEntries(officialTemplateIds.map((id) => [id, fromTemplate(getPdfTemplate(id))])));
  const draft = drafts[templateId];
  const [kind, setKind] = useState<MappingKind>("text");
  const [fieldId, setFieldId] = useState("frontRideHeight");
  const [label, setLabel] = useState("Front Ride Height");
  const [checkboxValue, setCheckboxValue] = useState("Plastic Tile");
  const [holeGroupId, setHoleGroupId] = useState("frontShockTower");
  const [holeId, setHoleId] = useState("middle-high");
  const [lastPoint, setLastPoint] = useState<{ pdfX: number; pdfY: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const exported = JSON.stringify(draft, null, 2);

  function updateDraft(next: FieldMapDraft) {
    setDrafts((items) => ({ ...items, [templateId]: next }));
  }

  function chooseTemplate(id: string) {
    setTemplateId(id);
    setPreviewUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return "";
    });
  }

  function capturePoint(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    setLastPoint({
      pdfX: Number((x * draft.pageWidth).toFixed(2)),
      pdfY: Number(((1 - y) * draft.pageHeight).toFixed(2))
    });
  }

  function addMapping() {
    const point = lastPoint ?? { pdfX: draft.pageWidth / 2, pdfY: draft.pageHeight / 2 };
    if (kind === "text") {
      updateDraft({
        ...draft,
        text: [{ fieldId, label, page: 0, pdfX: point.pdfX, pdfY: point.pdfY, fontSize: 8, maxWidth: 80 }, ...draft.text]
      });
    } else if (kind === "checkbox") {
      updateDraft({
        ...draft,
        checkboxes: [{ id: `${fieldId}-${Date.now()}`, fieldId, value: checkboxValue, page: 0, pdfX: point.pdfX, pdfY: point.pdfY, size: 7 }, ...draft.checkboxes]
      });
    } else {
      const existing = draft.holeGroups.find((group) => group.id === holeGroupId);
      const hole = { id: holeId, label: label || holeId, pdfX: point.pdfX, pdfY: point.pdfY };
      updateDraft({
        ...draft,
        holeGroups: existing
          ? draft.holeGroups.map((group) => (group.id === holeGroupId ? { ...group, fieldId, holes: [hole, ...group.holes] } : group))
          : [{ id: holeGroupId, fieldId, label, page: 0, holes: [hole] }, ...draft.holeGroups]
      });
    }
  }

  function importJson(value: string) {
    try {
      const parsed = JSON.parse(value) as FieldMapDraft;
      if (parsed.id && Array.isArray(parsed.text) && Array.isArray(parsed.checkboxes) && Array.isArray(parsed.holeGroups)) {
        setDrafts((items) => ({ ...items, [parsed.id]: parsed }));
        setTemplateId(parsed.id);
      }
    } catch {
      return;
    }
  }

  async function testOutput() {
    const bytes = await generateFilledPdf({ ...template, ...draft }, sampleTune(templateId));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(new Blob([bytes.slice().buffer], { type: "application/pdf" })));
  }

  return (
    <main className="publicPage">
      <header className="publicHero">
        <p>Admin only</p>
        <h1>Official PDF mapper</h1>
        <span>Tap the official preview to capture real PDF coordinates, then export separate RDX or MC-3 field map JSON.</span>
      </header>

      <section className="calibrationToolbar">
        <label>
          Template
          <select value={templateId} onChange={(event) => chooseTemplate(event.target.value)}>
            <option value="rdx-template">Reve D RDX</option>
            <option value="mc3-template">Reve D MC-3</option>
          </select>
        </label>
        <label>
          Mapping type
          <select value={kind} onChange={(event) => setKind(event.target.value as MappingKind)}>
            <option value="text">Text field</option>
            <option value="checkbox">Checkbox</option>
            <option value="hole">Hole / dot</option>
          </select>
        </label>
        <span>{lastPoint ? `PDF x ${lastPoint.pdfX}, y ${lastPoint.pdfY}` : "Tap the sheet to capture PDF coordinates"}</span>
      </section>

      <section className="calibrationGrid">
        <div className="calibrationCanvas pdfMapperCanvas" onClick={capturePoint}>
          <img src={draft.previewImageAsset} alt={`${draft.name} PDF preview`} />
          <svg viewBox={`0 0 ${draft.pageWidth} ${draft.pageHeight}`} preserveAspectRatio="none">
            {draft.text.map((item) => (
              <circle key={`text-${item.fieldId}-${item.pdfX}-${item.pdfY}`} cx={item.pdfX} cy={draft.pageHeight - item.pdfY} r="3.5" />
            ))}
            {draft.checkboxes.map((item) => (
              <rect key={item.id} x={item.pdfX - 3} y={draft.pageHeight - item.pdfY - 3} width="7" height="7" />
            ))}
            {draft.holeGroups.flatMap((group) =>
              group.holes.map((hole) => <circle key={`${group.id}-${hole.id}-${hole.pdfX}`} className="calibrationSelected" cx={hole.pdfX} cy={draft.pageHeight - hole.pdfY} r="4" />)
            )}
          </svg>
        </div>

        <aside className="calibrationPanel">
          <h2>{draft.name}</h2>
          <p className="pdfCoordReadout">{draft.sourcePdf}</p>
          <label>Field ID<input value={fieldId} onChange={(event) => setFieldId(event.target.value)} /></label>
          <label>Label<input value={label} onChange={(event) => setLabel(event.target.value)} /></label>
          {kind === "checkbox" ? <label>Checkbox value<input value={checkboxValue} onChange={(event) => setCheckboxValue(event.target.value)} /></label> : null}
          {kind === "hole" ? (
            <>
              <label>Hole group ID<input value={holeGroupId} onChange={(event) => setHoleGroupId(event.target.value)} /></label>
              <label>Hole ID<input value={holeId} onChange={(event) => setHoleId(event.target.value)} /></label>
            </>
          ) : null}
          <button type="button" onClick={addMapping}>Add mapping at tap</button>
          <button type="button" onClick={testOutput}><FileText size={16} /> Test sample output</button>
          {previewUrl ? <iframe className="mapperPreviewFrame" title="Sample filled PDF output" src={previewUrl} /> : null}

          <div className="jsonTools">
            <h2>Field map JSON</h2>
            <textarea value={exported} onChange={(event) => importJson(event.target.value)} rows={12} />
            <div>
              <button type="button" onClick={() => navigator.clipboard?.writeText(exported)}><Download size={16} /> Copy JSON</button>
              <label className="importButton"><Upload size={16} /> Import JSON<input type="file" accept="application/json" onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) importJson(await file.text());
              }} /></label>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
