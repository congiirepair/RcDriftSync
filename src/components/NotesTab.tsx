import type { Tune } from "../types";

interface NotesTabProps {
  tune: Tune;
  onNotes: (notes: string) => void;
}

export function NotesTab({ tune, onNotes }: NotesTabProps) {
  return (
    <div className="tabPanel">
      <label className="field notesField">
        <span>Track notes</span>
        <textarea value={tune.notes} rows={12} onChange={(event) => onNotes(event.target.value)} />
      </label>
    </div>
  );
}
