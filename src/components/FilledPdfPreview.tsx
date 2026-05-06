import { Download, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { PdfTemplate } from "../data/pdfTemplates";
import type { Tune } from "../types";
import { downloadPdf, generateFilledPdf, pdfPreviewPosition } from "../utils/pdfExport";

interface FilledPdfPreviewProps {
  tune: Tune;
  template: PdfTemplate;
  onSave: () => void;
  allowDownload?: boolean;
  shareUrl?: string;
}

export function FilledPdfPreview({ tune, template, onSave, allowDownload = true, shareUrl }: FilledPdfPreviewProps) {
  const [busy, setBusy] = useState(false);
  const textMarkers = useMemo(
    () =>
      template.text
        .map((item) => {
          const value = item.fieldId === "date" ? tune.date : item.fieldId === "drivingPlace" ? tune.track : tune.values[item.fieldId] ?? tune.selections[item.fieldId] ?? "";
          if (!value) return null;
          return { ...item, value: `${String(value)}${item.suffix ? ` ${item.suffix}` : ""}` };
        })
        .filter(Boolean),
    [template, tune]
  );

  async function exportPdf() {
    setBusy(true);
    try {
      await onSave();
      const bytes = await generateFilledPdf(template, tune);
      downloadPdf(bytes, `${tune.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-setup-sheet.pdf`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pdfPreviewPanel">
      <div className="previewActions">
        {allowDownload ? (
          <button className="primaryAction" type="button" onClick={exportPdf} disabled={busy}>
            <Download size={19} />
            {busy ? "Generating..." : "Export filled PDF"}
          </button>
        ) : null}
        <button type="button" onClick={() => navigator.clipboard?.writeText(shareUrl ?? `${location.origin}/t/${tune.shareId ?? tune.id}`)}>
          <Share2 size={18} />
          Share link
        </button>
      </div>
      <div className="pdfPreviewCanvas">
        <img src={template.previewImageAsset} alt={`${template.name} filled PDF preview`} />
        <div className="pdfPreviewOverlay">
          {textMarkers.map((item) =>
            item ? (
              <span key={item.fieldId} style={pdfPreviewPosition(template, item.pdfX, item.pdfY)}>
                {item.value}
              </span>
            ) : null
          )}
          {template.checkboxes.map((box) => {
            const value = tune.values[box.fieldId];
            const checked = value === box.value || value === true;
            return checked ? (
              <b key={box.id} className="pdfCheck" style={pdfPreviewPosition(template, box.pdfX, box.pdfY)}>
                ✓
              </b>
            ) : null;
          })}
          {template.holeGroups.flatMap((group) => {
            const selected = String(tune.values[group.fieldId] ?? tune.selections[group.fieldId] ?? "");
            return group.holes
              .filter((hole) => hole.id === selected)
              .map((hole) => <i key={`${group.id}-${hole.id}`} style={pdfPreviewPosition(template, hole.pdfX, hole.pdfY)} />);
          })}
        </div>
      </div>
    </div>
  );
}
