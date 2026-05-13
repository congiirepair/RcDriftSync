import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Tune, TunePhoto } from "../types";
import { displayPhotoUrl, photoFromFile, photoStorageStatusLabel } from "../utils/photoStorage";
import { PhotoLightbox } from "./PhotoLightbox";

interface PhotosTabProps {
  tune: Tune;
  onPhotos: (photos: TunePhoto[]) => void;
}

const labels = ["Full car", "Front suspension", "Rear suspension", "Electronics layout", "Body shell", "Tires"];

export function PhotosTab({ tune, onPhotos }: PhotosTabProps) {
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [viewerPhoto, setViewerPhoto] = useState<TunePhoto | null>(null);
  const [deletePhotoTarget, setDeletePhotoTarget] = useState<TunePhoto | null>(null);

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploadStatus("Saving photos...");
    const newPhotos = await Promise.all(
      Array.from(files).map(async (file, index) => {
        return photoFromFile(file, {
          id: `photo-${Date.now()}-${index}`,
          label: labels[(tune.photos.length + index) % labels.length],
          ownerId: tune.ownerId,
          entityId: tune.id,
          firebaseFolder: "tunePhotos"
        });
      })
    );
    onPhotos([...newPhotos, ...tune.photos]);
    const backedUpCount = newPhotos.filter((photo) => photo.provider === "cloudinary" || photo.provider === "firebase").length;
    setUploadStatus(backedUpCount ? `${backedUpCount}/${newPhotos.length} uploaded. ${photoStorageStatusLabel()}` : photoStorageStatusLabel());
  }

  function removePhoto(photoId: string) {
    onPhotos(tune.photos.filter((item) => item.id !== photoId));
    setDeletePhotoTarget(null);
  }

  return (
    <div className="tabPanel">
      <label className="photoUploader">
        <ImagePlus size={24} />
        <span>Add setup photos</span>
        <small>{photoStorageStatusLabel()}</small>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            void addPhotos(event.target.files);
            event.currentTarget.value = "";
          }}
        />
      </label>
      {uploadStatus ? <p className="photoStatus">{uploadStatus}</p> : null}
      <div className="photoGrid">
        {tune.photos.map((photo) => (
          <figure className="photoCard" key={photo.id}>
            <button className="photoPreviewButton" type="button" onClick={() => setViewerPhoto(photo)} aria-label={`Open ${photo.label}`}>
              <img src={displayPhotoUrl(photo)} alt={photo.label} />
            </button>
            <button className="photoDeleteX" type="button" aria-label={`Remove ${photo.label}`} title="Remove photo" onClick={() => setDeletePhotoTarget(photo)}>
              <Trash2 size={15} />
            </button>
            <figcaption>
              <Camera size={16} />
              <input value={photo.label} onChange={(event) => onPhotos(tune.photos.map((item) => (item.id === photo.id ? { ...item, label: event.target.value } : item)))} />
            </figcaption>
          </figure>
        ))}
      </div>
      {deletePhotoTarget ? (
        <div className="modalShade" role="presentation">
          <section className="confirmModal" role="dialog" aria-modal="true" aria-labelledby="delete-tune-photo-title">
            <h2 id="delete-tune-photo-title">Remove photo?</h2>
            <p>This removes "{deletePhotoTarget.label}" from this tune. This cannot be undone.</p>
            <div className="buttonRow">
              <button className="smallPill" type="button" onClick={() => setDeletePhotoTarget(null)}>Cancel</button>
              <button className="primaryAction destructive" type="button" onClick={() => removePhoto(deletePhotoTarget.id)}>
                <Trash2 size={17} />
                Remove photo
              </button>
            </div>
          </section>
        </div>
      ) : null}
      <PhotoLightbox photo={viewerPhoto} onClose={() => setViewerPhoto(null)} />
    </div>
  );
}
