import type { ChangeEntry } from "../types";

interface HistoryTabProps {
  history: ChangeEntry[];
  onDuplicate: (entry?: ChangeEntry) => void;
}

export function HistoryTab({ history, onDuplicate }: HistoryTabProps) {
  return (
    <div className="tabPanel">
      <button className="primaryAction fullWidth" type="button" onClick={() => onDuplicate()}>
        Duplicate current tune
      </button>
      <div className="historyList">
        {history.length === 0 ? <p className="emptyText">No revisions yet. Save an edit and it will appear here.</p> : null}
        {history.map((entry) => (
          <article className="historyItem" key={entry.id}>
            <time>{new Date(entry.date).toLocaleString()}</time>
            <h3>{entry.summary}</h3>
            <ul>
              {entry.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
            <button type="button" onClick={() => onDuplicate(entry)}>
              Duplicate this previous version
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
