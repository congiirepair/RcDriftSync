import { X, ZoomIn } from "lucide-react";
import type { TunePhoto } from "../types";
import { displayPhotoUrl } from "../utils/photoStorage";

export function PhotoLightbox({ photo, onClose }: { photo: TunePhoto | null; onClose: () => void }) {
  if (!photo) return null;
  return (
    <div className="photoLightboxShade" role="presentation" onClick={onClose}>
      <section className="photoLightbox" role="dialog" aria-modal="true" aria-label={photo.label} onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <strong>{photo.label}</strong>
            <span>Pinch to zoom or drag the image around.</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close photo">
            <X size={20} />
          </button>
        </header>
        <div className="photoLightboxScroller">
          <img src={displayPhotoUrl(photo)} alt={photo.label} />
        </div>
        <p><ZoomIn size={16} /> Tip: rotate your phone if small values are hard to read.</p>
      </section>
    </div>
  );
}
