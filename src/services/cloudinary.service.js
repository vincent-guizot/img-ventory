import { httpClient } from "@/lib/axios";
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "demo";
const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "img_ventory_upload";
const UPLOAD_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER ?? "img-ventory";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
/**
 * Uploads a single file to Cloudinary using an unsigned upload preset.
 * This call is safe to make directly from the browser: unsigned uploads
 * only need the public cloud name + upload preset, never the API Secret.
 * Reports fine-grained progress via onProgress (0-100).
 */
export async function uploadToCloudinary(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", UPLOAD_FOLDER);
  const { data } = await httpClient.post(UPLOAD_URL, formData, {
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return mapCloudinaryResponse(data);
}
function mapCloudinaryResponse(data) {
  return {
    id: data.asset_id ?? data.public_id,
    publicId: data.public_id,
    fileName: data.original_filename ?? data.public_id,
    format: data.format ?? "jpg",
    mimeType: `image/${data.format}`,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
    secureUrl: data.secure_url,
    thumbnailUrl: data.secure_url,
    folder: data.folder || null,
    tags: [],
    uploadedBy: "vincent",
    createdAt: data.created_at,
  };
}
/**
 * Lists every image in the gallery folder.
 *
 * IMPORTANT: this deliberately does NOT call api.cloudinary.com directly.
 * Cloudinary's Admin Search API requires the API Secret, which must never
 * be shipped to the browser. Instead this hits our own serverless endpoint
 * (`api/images.ts`), which holds the secret server-side and proxies the
 * request to Cloudinary on our behalf.
 */
export async function fetchCloudinaryImages() {
  try {
    const { data } = await httpClient.get("/api/images");
    return data.images;
  } catch (error) {
    const message = extractApiErrorMessage(error, "Failed to load images");
    throw new Error(message);
  }
}
/**
 * Deletes a single image from Cloudinary by its public_id.
 * Like the list endpoint, this goes through our own `/api/images/:publicId`
 * serverless function (signed server-side) instead of calling Cloudinary's
 * Admin `destroy` endpoint from the browser.
 */
export async function deleteCloudinaryImage(publicId) {
  try {
    await httpClient.delete("/api/images", { params: { publicId } });
  } catch (error) {
    const message = extractApiErrorMessage(error, "Failed to delete image");
    throw new Error(message);
  }
}
function extractApiErrorMessage(error, fallback) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response?.data?.error === "string"
  ) {
    return error.response.data.error;
  }
  return error instanceof Error ? error.message : fallback;
}
export const cloudinaryConfig = {
  cloudName: CLOUD_NAME,
  uploadPreset: UPLOAD_PRESET,
  folder: UPLOAD_FOLDER,
};
