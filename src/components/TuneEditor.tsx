import { Clock, FileText, Images, ListChecks, Save, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { getPdfTemplate } from "../data/pdfTemplates";
import { getSheet } from "../data/sheets";
import type { Car, EditorTab, Tune } from "../types";
import { FilledPdfPreview } from "./FilledPdfPreview";
import { HistoryTab } from "./HistoryTab";
import { MobileSetupForm } from "./MobileSetupForm";
import { NotesTab } from "./NotesTab";
import { PhotosTab } from "./PhotosTab";

interface TuneEditorProps {
  tune: Tune;
  car?: Car;
  onDraft: (tune: Tune) => void;
  onSave: () => void;
  onDuplicate: (source?: Tune) => void;
  dirty: boolean;
}

const tabs: Array<{ id: EditorTab; label: string; icon: typeof SlidersHorizontal }> = [
  { id: "sheet", label: "Preview", icon: SlidersHorizontal },
  { id: "details", label: "Form", icon: ListChecks },
  { id: "photos", label: "Photos", icon: Images },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "history", label: "History", icon: Clock }
];

export function TuneEditor({ tune, car, onDraft, onSave, onDuplicate }: TuneEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>("details");
  const sheet = useMemo(() => getSheet(tune.sheetId), [tune.sheetId]);
  const pdfTemplate = useMemo(() => getPdfTemplate(tune.sheetId), [tune.sheetId]);

  function updateValue(fieldId: string, value: string | number | boolean | string[]) {
    onDraft({
      ...tune,
      values: { ...tune.values, [fieldId]: value },
      selections: typeof value === "string" ? { ...tune.selections, [fieldId]: value } : tune.selections
    });
  }

  function updateMeta(patch: Partial<Tune>) {
    onDraft({ ...tune, ...patch });
  }

  return (
    <main className="editor">
      <header className="editorHeader">
        <div>
          <p>{sheet.chassis}</p>
          <h1>{tune.name}</h1>
          <span>
            {tune.track || "Track not set"} · {tune.grip}
          </span>
        </div>
      </header>

      <nav className="tabBar" aria-label="Tune editor tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} className={activeTab === tab.id ? "active" : ""} type="button" onClick={() => setActiveTab(tab.id)}>
              <Icon size={19} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {activeTab === "sheet" ? (
        <div className="tabPanel sheetPanel">
          <FilledPdfPreview tune={tune} car={car} onSave={onSave} />
        </div>
      ) : null}
      {activeTab === "details" ? <MobileSetupForm tune={tune} template={pdfTemplate} onMeta={updateMeta} onValue={updateValue} /> : null}
      {activeTab === "photos" ? <PhotosTab tune={tune} onPhotos={(photos) => onDraft({ ...tune, photos })} /> : null}
      {activeTab === "notes" ? <NotesTab tune={tune} onNotes={(notes) => onDraft({ ...tune, notes })} /> : null}
      {activeTab === "history" ? <HistoryTab history={tune.history} onDuplicate={() => onDuplicate(tune)} /> : null}

      <div className="stickySave">
        <button className="primaryAction" type="button" onClick={onSave}>
          <Save size={21} />
          Save
        </button>
      </div>
    </main>
  );
}
