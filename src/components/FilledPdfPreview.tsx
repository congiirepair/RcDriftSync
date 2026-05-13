import { Download, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Car, Tune } from "../types";
import { downloadPdf } from "../utils/pdfExport";
import { generateUniversalTunePdf } from "../utils/universalPdfExport";

interface FilledPdfPreviewProps {
  tune: Tune;
  car?: Car;
  onSave: () => void;
  allowDownload?: boolean;
  shareUrl?: string;
}

function fallbackCar(tune: Tune): Car {
  return {
    id: tune.carId || "shared-car",
    name: "Shared car",
    chassis: [tune.chassisBrand, tune.chassisModel].filter(Boolean).join(" ") || String(tune.values.chassis ?? "RC drift chassis"),
    chassisBrand: tune.chassisBrand,
    chassisBrandSlug: tune.chassisBrandSlug,
    chassisModel: tune.chassisModel,
    chassisModelSlug: tune.chassisModelSlug,
    chassisVariant: tune.chassisVariant,
    customChassisBrand: tune.customChassisBrand,
    customChassisModel: tune.customChassisModel,
    sheetId: "universal-template",
    templateMode: "universal",
    officialTemplateEligible: false,
    createdAt: tune.createdAt,
    updatedAt: tune.updatedAt
  };
}

export function FilledPdfPreview({ tune, car, onSave, allowDownload = true, shareUrl }: FilledPdfPreviewProps) {
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const pdfCar = useMemo(() => car ?? fallbackCar(tune), [car, tune]);

  useEffect(() => {
    let cancelled = false;
    generateUniversalTunePdf(tune, pdfCar, { shareUrl })
      .then((bytes) => {
        if (cancelled) return;
        const blob = new Blob([bytes.slice().buffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return url;
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
    };
  }, [pdfCar, shareUrl, tune]);

  async function exportPdf() {
    setBusy(true);
    try {
      await onSave();
      const bytes = await generateUniversalTunePdf(tune, pdfCar, { shareUrl });
      downloadPdf(bytes, `${tune.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-rc-drift-sync-setup.pdf`);
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
            {busy ? "Generating..." : "Export PDF"}
          </button>
        ) : null}
        <button type="button" onClick={() => navigator.clipboard?.writeText(shareUrl ?? `${location.origin}/t/${tune.shareId ?? tune.id}`)}>
          <Share2 size={18} />
          Share link
        </button>
      </div>
      <div className="pdfPreviewCanvas readablePdfPreview">
        {previewUrl ? <iframe title="RC Drift Sync setup PDF preview" src={previewUrl} /> : <p className="mutedText">Building readable setup PDF preview...</p>}
      </div>
    </div>
  );
}
