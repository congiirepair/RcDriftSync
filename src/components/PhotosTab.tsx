import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { isCloudinaryConfigured, uploadTunePhoto } from "../services/cloudinary";
import { isFirebaseConfigured, uploadFirebasePhoto } from "../services/firebaseData";
import type { Tune, TunePhoto } from "../types";

interface PhotosTabProps {
  tune: Tune;
  onPhotos: (photos: TunePhoto[]) => void;
}

const labels = ["Full car", "Front suspension", "Rear suspension", "Electronics layout", "Body shell", "Tires"];

export function PhotosTab({ tune, onPhotos }: PhotosTabProps) {
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const firebaseStorageEnabled = import.meta.env.VITE_USE_FIREBASE_STORAGE === "true";

  function readLocalPreview(file: File) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const canUseFirebaseStorage = firebaseStorageEnabled && isFirebaseConfigured && tune.ownerId && tune.ownerId !== "local-user";
    setUploadStatus(isCloudinaryConfigured ? "Uploading photos to Cloudinary..." : canUseFirebaseStorage ? "Uploading photos to Firebase Storage..." : "Saving photos locally...");
    const newPhotos = await Promise.all(
      Array.from(files).map(async (file, index) => {
        const dataUrl = await readLocalPreview(file);
        const basePhoto: TunePhoto = {
          id: `photo-${Date.now()}-${index}`,
          label: labels[(tune.photos.length + index) % labels.length],
          dataUrl,
          provider: "local",
          createdAt: new Date().toISOString()
        };

        if (isCloudinaryConfigured) {
          try {
            const uploaded = await uploadTunePhoto(file);
            return {
              ...basePhoto,
              cloudUrl: uploaded.secure_url,
              publicId: uploaded.public_id,
              provider: "cloudinary" as const
            };
          } catch (error) {
            console.warn(error);
          }
        }

        if (canUseFirebaseStorage) {
          try {
            const path = `tunePhotos/${tune.ownerId}/${tune.id}/${Date.now()}-${file.name}`;
            const cloudUrl = await uploadFirebasePhoto(file, path);
            return { ...basePhoto, cloudUrl, publicId: path, provider: "firebase" as const };
          } catch (error) {
            console.warn(error);
          }
        }

        return basePhoto;
      })
    );
    onPhotos([...newPhotos, ...tune.photos]);
    const cloudCount = newPhotos.filter((photo) => photo.provider === "cloudinary").length;
    setUploadStatus(
      isCloudinaryConfigured
        ? `${cloudCount}/${newPhotos.length} uploaded to Cloudinary. Local previews kept for offline use.`
        : canUseFirebaseStorage
        ? `${newPhotos.filter((photo) => photo.provider === "firebase").length}/${newPhotos.length} uploaded to Firebase Storage. Local previews kept for offline use.`
        : "Photos are saved locally on this device until Cloudinary is configured."
    );
  }

  return (
    <div className="tabPanel">
      <label className="photoUploader">
        <ImagePlus size={24} />
        <span>Add setup photos</span>
        <small>{isCloudinaryConfigured ? "Camera or gallery, backed up to Cloudinary" : "Camera or gallery, local-only until Cloudinary is configured"}</small>
        <input type="file" accept="image/*" capture="environment" multiple onChange={(event) => addPhotos(event.target.files)} />
      </label>
      {uploadStatus ? <p className="photoStatus">{uploadStatus}</p> : null}
      <div className="photoGrid">
        {tune.photos.map((photo) => (
          <figure className="photoCard" key={photo.id}>
            <img src={photo.cloudUrl || photo.dataUrl} alt={photo.label} />
            <figcaption>
              <Camera size={16} />
              <input value={photo.label} onChange={(event) => onPhotos(tune.photos.map((item) => (item.id === photo.id ? { ...item, label: event.target.value } : item)))} />
              <button type="button" aria-label={`Delete ${photo.label}`} onClick={() => onPhotos(tune.photos.filter((item) => item.id !== photo.id))}>
                <Trash2 size={18} />
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
