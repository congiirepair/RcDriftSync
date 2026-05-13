import { Download, ShieldCheck, Trash2, Upload } from "lucide-react";
import type { MouseEvent } from "react";
import { useMemo, useState } from "react";
import { setupSheets } from "../data/sheets";
import { getPdfTemplate } from "../data/pdfTemplates";
import type { AppData, Hotspot, SetupField, UserAccount } from "../types";

const fieldTypes: SetupField["type"][] = ["text", "number", "select", "textarea", "toggle"];

const emptyHotspot = (x = 0.5, y = 0.5): Hotspot => ({
  id: `hotspot-${Date.now()}`,
  label: "New hotspot",
  type: "field",
  fieldId: "newField",
  x,
  y,
  width: 0.08,
  height: 0.025
});

interface AdminPageProps {
  account: UserAccount | null;
  data: AppData;
  onDeleteCar: (carId: string) => void;
  onDeleteTune: (tuneId: string) => void;
  onResetHome: () => void;
  onLogin: () => void;
}

export function AdminPage({ account, data, onDeleteCar, onDeleteTune, onResetHome, onLogin }: AdminPageProps) {
  const [sheetId, setSheetId] = useState(setupSheets[0].id);
  const sheet = useMemo(() => setupSheets.find((item) => item.id === sheetId) ?? setupSheets[0], [sheetId]);
  const [hotspots, setHotspots] = useState<Hotspot[]>(sheet.hotspots);
  const [selectedId, setSelectedId] = useState(sheet.hotspots[0]?.id ?? "");
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [fieldType, setFieldType] = useState<SetupField["type"]>("text");

  const selected = hotspots.find((hotspot) => hotspot.id === selectedId) ?? hotspots[0];
  const pdfTemplate = getPdfTemplate(sheet.id);
  const toPdf = (point: { x: number; y: number }) => ({
    pdfX: Number((point.x * pdfTemplate.pageWidth).toFixed(2)),
    pdfY: Number(((1 - point.y) * pdfTemplate.pageHeight).toFixed(2))
  });
  const lastPdfPoint = lastPoint ? toPdf(lastPoint) : null;
  const selectedPdfPoint = selected ? toPdf({ x: selected.x, y: selected.y }) : null;
  const exported = JSON.stringify({ sheetId, image: sheet.image, width: sheet.imageWidth, height: sheet.imageHeight, hotspots }, null, 2);

  function chooseSheet(id: string) {
    const next = setupSheets.find((item) => item.id === id) ?? setupSheets[0];
    setSheetId(next.id);
    setHotspots(next.hotspots);
    setSelectedId(next.hotspots[0]?.id ?? "");
  }

  function updateSelected(patch: Partial<Hotspot>) {
    setHotspots((items) => items.map((item) => (item.id === selected.id ? { ...item, ...patch } : item)));
  }

  function addAtLastPoint() {
    const point = lastPoint ?? { x: 0.5, y: 0.5 };
    const next = emptyHotspot(point.x, point.y);
    setHotspots((items) => [next, ...items]);
    setSelectedId(next.id);
  }

  function imageTap(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setLastPoint({ x: Number(x.toFixed(5)), y: Number(y.toFixed(5)) });
  }

  function importJson(value: string) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed.hotspots)) {
        setHotspots(parsed.hotspots);
        setSelectedId(parsed.hotspots[0]?.id ?? "");
      }
    } catch {
      return;
    }
  }

  if (!account) {
    return (
      <main className="publicPage">
        <header className="publicHero">
          <p>Admin</p>
          <h1>Sign in required</h1>
          <span>Master admin tools are protected. Sign in with the admin account to manage public items and templates.</span>
          <button className="primaryAction" type="button" onClick={onLogin}>Log in</button>
        </header>
      </main>
    );
  }

  if (!account.isAdmin) {
    return (
      <main className="publicPage">
        <header className="publicHero">
          <p>Admin</p>
          <h1>Access denied</h1>
          <span>{account.email || account.username || "This account"} is signed in, but it does not have master admin access.</span>
        </header>
      </main>
    );
  }

  return (
    <main className="publicPage">
      <header className="publicHero">
        <p>Master admin</p>
        <h1>RC Drift Sync control center</h1>
        <span>Signed in as {account.username || account.email}. Delete public builds, clear local home content, and manage setup sheet calibration.</span>
      </header>
      <section className="adminManagement">
        <article className="appCard">
          <ShieldCheck size={24} />
          <div>
            <strong>Home page items</strong>
            <span>Clear the local/demo garage content that feeds the Home dashboard on this device.</span>
          </div>
          <button className="dangerAction" type="button" onClick={onResetHome}>
            Clear local home
          </button>
        </article>
        <article className="appCard adminListCard">
          <h2>Builds / tunes</h2>
          {data.tunes.length ? data.tunes.map((tune) => (
            <div className="adminItemRow" key={tune.id}>
              <div>
                <strong>{tune.name}</strong>
                <span>{tune.visibility || "private"} · {tune.ownerUsername || tune.ownerId || "local"}</span>
              </div>
              <button className="dangerAction" type="button" onClick={() => onDeleteTune(tune.shareId || tune.id)}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )) : <span>No tunes loaded.</span>}
        </article>
        <article className="appCard adminListCard">
          <h2>Cars</h2>
          {data.cars.length ? data.cars.map((car) => (
            <div className="adminItemRow" key={car.id}>
              <div>
                <strong>{car.name}</strong>
                <span>{car.chassis}</span>
              </div>
              <button className="dangerAction" type="button" onClick={() => onDeleteCar(car.id)}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )) : <span>No cars loaded.</span>}
        </article>
      </section>
      <header className="adminSubHeader">
        <p>Template editor</p>
        <h2>Setup sheet calibration</h2>
        <span>Tap the official PDF render to capture normalized x/y coordinates, place hotspots, and export the template JSON.</span>
      </header>
      <section className="calibrationToolbar">
        <label>
          Sheet
          <select value={sheetId} onChange={(event) => chooseSheet(event.target.value)}>
            {setupSheets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={addAtLastPoint}>Add hotspot at tap</button>
        <span>
          {lastPoint && lastPdfPoint
            ? `normalized x ${lastPoint.x}, y ${lastPoint.y} · PDF x ${lastPdfPoint.pdfX}, y ${lastPdfPoint.pdfY}`
            : "Tap sheet to capture coordinates"}
        </span>
      </section>
      <section className="calibrationGrid">
        <div className="calibrationCanvas" onClick={imageTap}>
          <img src={sheet.image} alt={sheet.name} />
          <svg viewBox="0 0 1 1" preserveAspectRatio="none">
            {hotspots.map((hotspot) => (
              <rect
                key={hotspot.id}
                className={hotspot.id === selected?.id ? "calibrationSelected" : ""}
                x={hotspot.x}
                y={hotspot.y}
                width={hotspot.width}
                height={hotspot.height}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedId(hotspot.id);
                }}
              />
            ))}
          </svg>
        </div>
        <aside className="calibrationPanel">
          {selected ? (
            <>
              <h2>{selected.label}</h2>
              {selectedPdfPoint ? <p className="pdfCoordReadout">PDF x {selectedPdfPoint.pdfX}, y {selectedPdfPoint.pdfY}</p> : null}
              <label>Label<input value={selected.label} onChange={(event) => updateSelected({ label: event.target.value })} /></label>
              <label>ID<input value={selected.id} onChange={(event) => updateSelected({ id: event.target.value })} /></label>
              <label>Field ID<input value={selected.fieldId} onChange={(event) => updateSelected({ fieldId: event.target.value })} /></label>
              <label>Field type<select value={fieldType} onChange={(event) => setFieldType(event.target.value as SetupField["type"])}>{fieldTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label>X<input type="number" step="0.0001" value={selected.x} onChange={(event) => updateSelected({ x: Number(event.target.value) })} /></label>
              <label>Y<input type="number" step="0.0001" value={selected.y} onChange={(event) => updateSelected({ y: Number(event.target.value) })} /></label>
              <label>Width<input type="number" step="0.0001" value={selected.width} onChange={(event) => updateSelected({ width: Number(event.target.value) })} /></label>
              <label>Height<input type="number" step="0.0001" value={selected.height} onChange={(event) => updateSelected({ height: Number(event.target.value) })} /></label>
            </>
          ) : null}
          <div className="jsonTools">
            <h2>Hotspot JSON</h2>
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
