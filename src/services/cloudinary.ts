import { auth } from "./firebase";

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const folder = import.meta.env.VITE_CLOUDINARY_FOLDER || "rc-drift-sync/tune-photos";
const deleteEndpoint = import.meta.env.VITE_CLOUDINARY_DELETE_ENDPOINT;

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

export async function uploadTunePhoto(file: Blob, fileName = "rc-drift-sync-photo.jpg"): Promise<CloudinaryUploadResponse> {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file, fileName);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);
  formData.append("tags", "rc-drift-sync,tune-photo");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Cloudinary upload failed: ${message}`);
  }

  return response.json();
}

export async function deleteCloudinaryPhoto(publicId: string): Promise<boolean> {
  if (!publicId) return false;
  if (!deleteEndpoint) return false;
  const token = auth?.currentUser ? await auth.currentUser.getIdToken() : "";

  const response = await fetch(deleteEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ publicId })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Cloudinary delete failed: ${message}`);
  }

  return true;
}
