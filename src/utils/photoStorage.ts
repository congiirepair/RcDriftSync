import { deleteCloudinaryPhoto, isCloudinaryConfigured, uploadTunePhoto } from "../services/cloudinary";
import { isFirebaseConfigured, uploadFirebasePhoto } from "../services/firebaseData";
import type { AppData, Tune, TunePhoto } from "../types";

const MAX_UPLOAD_EDGE = 1280;
const MAX_PREVIEW_EDGE = 720;
const UPLOAD_TARGET_BYTES = 360 * 1024;
const PREVIEW_TARGET_BYTES = 160 * 1024;
const UPLOAD_QUALITIES = [0.74, 0.66, 0.58, 0.5];
const PREVIEW_QUALITIES = [0.66, 0.58, 0.5, 0.44];

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((item) => resolve(item ?? new Blob()), "image/jpeg", quality);
  });
}

export async function compressPhotoForStorage(file: File, maxEdge: number, targetBytes: number, qualities: number[]) {
  if (!file.type.startsWith("image/")) {
    return { dataUrl: await fileToDataUrl(file), blob: file, fileName: file.name };
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read image."));
      img.src = objectUrl;
    });
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return { dataUrl: await fileToDataUrl(file), blob: file, fileName: file.name };
    context.drawImage(image, 0, 0, width, height);
    let blob = await canvasToJpeg(canvas, qualities[0] ?? 0.66);
    for (const quality of qualities.slice(1)) {
      if (blob.size <= targetBytes) break;
      blob = await canvasToJpeg(canvas, quality);
    }
    if (!blob.size) blob = file;
    const dataUrl = await blobToDataUrl(blob);
    const fileName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return { dataUrl, blob, fileName };
  } catch {
    return { dataUrl: await fileToDataUrl(file), blob: file, fileName: file.name };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function isTunePhoto(photo: unknown): photo is TunePhoto {
  return Boolean(photo && typeof photo === "object" && ("cloudUrl" in photo || "dataUrl" in photo));
}

export function displayPhotoUrl(photo?: TunePhoto | null) {
  if (!isTunePhoto(photo)) return "";
  return photo.cloudUrl || photo.dataUrl || "";
}

export async function photoFromFile(
  file: File,
  options: {
    id: string;
    label: string;
    ownerId?: string;
    entityId?: string;
    folder?: string;
    firebaseFolder?: string;
  }
): Promise<TunePhoto> {
  const preview = await compressPhotoForStorage(file, MAX_PREVIEW_EDGE, PREVIEW_TARGET_BYTES, PREVIEW_QUALITIES);
  const upload = await compressPhotoForStorage(file, MAX_UPLOAD_EDGE, UPLOAD_TARGET_BYTES, UPLOAD_QUALITIES);
  const basePhoto: TunePhoto = {
    id: options.id,
    label: options.label,
    dataUrl: preview.dataUrl,
    provider: "local",
    createdAt: new Date().toISOString()
  };

  if (isCloudinaryConfigured) {
    try {
      const uploaded = await uploadTunePhoto(upload.blob, upload.fileName);
      return {
        ...basePhoto,
        dataUrl: uploaded.secure_url,
        cloudUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        provider: "cloudinary"
      };
    } catch (error) {
      console.warn("Cloudinary photo upload failed", error);
    }
  }

  const firebaseStorageEnabled = import.meta.env.VITE_USE_FIREBASE_STORAGE === "true";
  const canUseFirebaseStorage = firebaseStorageEnabled && isFirebaseConfigured && options.ownerId && options.ownerId !== "local-user";
  if (canUseFirebaseStorage) {
    try {
      const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "-");
      const path = `${options.firebaseFolder || "photos"}/${options.ownerId}/${options.entityId || "general"}/${Date.now()}-${safeName}`;
      const cloudUrl = await uploadFirebasePhoto(file, path);
      return { ...basePhoto, dataUrl: cloudUrl, cloudUrl, publicId: path, provider: "firebase" };
    } catch (error) {
      console.warn("Firebase photo upload failed", error);
    }
  }

  return basePhoto;
}

export function photoStorageStatusLabel() {
  const firebaseStorageEnabled = import.meta.env.VITE_USE_FIREBASE_STORAGE === "true";
  if (isCloudinaryConfigured) return "Photos are resized before Cloudinary upload to keep storage and bandwidth low.";
  if (firebaseStorageEnabled && isFirebaseConfigured) return "Photos upload to Firebase Storage and stay with your account.";
  return "Photo cloud storage is not configured yet. Small compressed previews are saved as a fallback.";
}

function tunePhotos(tune: Tune): TunePhoto[] {
  const electronicsPhotos = Object.values(tune.electronics ?? {}).flatMap((item) => {
    if (!item || typeof item !== "object" || !("tunePhotos" in item)) return [];
    return Array.isArray(item.tunePhotos) ? item.tunePhotos.filter(isTunePhoto) : [];
  });
  return [...(tune.photos ?? []), ...electronicsPhotos].filter(isTunePhoto);
}

export function appPhotos(data: AppData): TunePhoto[] {
  return [
    ...data.tunes.flatMap(tunePhotos),
    ...data.cars.flatMap((car) => car.photos ?? [])
  ].filter(isTunePhoto);
}

export async function deleteOrphanedCloudinaryPhotos(before: AppData, after: AppData) {
  const remainingPublicIds = new Set(
    appPhotos(after)
      .filter((photo) => photo.provider === "cloudinary" && photo.publicId)
      .map((photo) => photo.publicId as string)
  );
  const orphanPublicIds = Array.from(
    new Set(
      appPhotos(before)
        .filter((photo) => photo.provider === "cloudinary" && photo.publicId && !remainingPublicIds.has(photo.publicId))
        .map((photo) => photo.publicId as string)
    )
  );

  await Promise.allSettled(orphanPublicIds.map((publicId) => deleteCloudinaryPhoto(publicId)));
}
