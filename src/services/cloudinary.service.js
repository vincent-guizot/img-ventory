import { isCancel } from "axios";
import { httpClient } from "@/lib/axios";
import {
  FAVORITE_TAG,
  folderToPath,
  validateFolderSelector,
} from "@/lib/folderRules";
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
 *
 * `options.folder` is the img-ventory folder name ("" = root folder), sent
 * as Cloudinary's `folder` param (the only folder param unsigned presets
 * accept). Because an upload preset can override that param, the response
 * is checked and an UploadFolderMismatchError is thrown if Cloudinary stored
 * the asset somewhere else. `options.signal` (AbortSignal) cancels the upload.
 */
export async function uploadToCloudinary(file, onProgress, options = {}) {
  const { folder = "", signal } = options;
  const folderCheck = validateFolderSelector(folder);
  if (!folderCheck.ok) throw new Error(folderCheck.error);
  const targetPath = folderToPath(UPLOAD_FOLDER, folderCheck.value);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", targetPath);
  let data;
  try {
    ({ data } = await httpClient.post(UPLOAD_URL, formData, {
      signal,
      // Uploads of large files can take longer than the default timeout.
      timeout: 0,
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    }));
  } catch (error) {
    if (isCancel(error)) throw new UploadCancelledError();
    throw new Error(extractCloudinaryUploadError(error));
  }
  const image = mapCloudinaryResponse(data);
  const storedPath = resolveStoredFolder(data);
  if (storedPath !== null && storedPath !== targetPath) {
    throw new UploadFolderMismatchError(targetPath, storedPath, image);
  }
  return image;
}

export class UploadCancelledError extends Error {
  constructor() {
    super("Upload cancelled");
    this.name = "UploadCancelledError";
  }
}

/** The file WAS uploaded, but not into the requested folder. */
export class UploadFolderMismatchError extends Error {
  constructor(expected, actual, image) {
    super(
      `Uploaded to "${actual || "(root)"}" instead of "${expected}". ` +
        "Check that the upload preset doesn't force its own folder.",
    );
    this.name = "UploadFolderMismatchError";
    this.expected = expected;
    this.actual = actual;
    this.image = image;
  }
}

/** Folder Cloudinary actually stored the asset in, or null if unknown. */
export function resolveStoredFolder(data) {
  if (typeof data.asset_folder === "string") return data.asset_folder;
  if (typeof data.folder === "string") return data.folder;
  if (typeof data.public_id === "string" && data.asset_folder === undefined) {
    return data.public_id.split("/").slice(0, -1).join("/");
  }
  return null;
}

function extractCloudinaryUploadError(error) {
  const message = error?.response?.data?.error?.message;
  if (typeof message === "string" && message) return message;
  if (error?.code === "ECONNABORTED") return "Upload timed out";
  if (error?.message === "Network Error") {
    return "Network error — check your connection and try again";
  }
  return error instanceof Error ? error.message : "Upload failed";
}

function mapCloudinaryResponse(data) {
  return {
    id: data.asset_id ?? data.public_id,
    publicId: data.public_id,
    fileName: data.display_name ?? data.original_filename ?? data.public_id,
    format: data.format ?? "jpg",
    mimeType: `image/${data.format}`,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
    secureUrl: data.secure_url,
    thumbnailUrl: data.secure_url,
    folder: data.asset_folder || data.folder || null,
    tags: (data.tags ?? []).filter((tag) => tag !== FAVORITE_TAG),
    favorite: (data.tags ?? []).includes(FAVORITE_TAG),
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
    // Root folder, first 100 images (the original contract of this function).
    const { data } = await httpClient.get("/api/images", {
      params: { limit: 100 },
    });
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
/**
 * Lists one page of images in a folder ("" = root) via /api/images.
 * Returns { images, nextCursor, totalCount, folder }.
 */
export async function fetchImagesPage(params = {}) {
  try {
    const { data } = await httpClient.get("/api/images", {
      params: cleanParams(params),
    });
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, "Failed to load images"));
  }
}

export async function fetchImageById(assetId) {
  try {
    const { data } = await httpClient.get("/api/images", {
      params: { assetId },
    });
    return data.image;
  } catch (error) {
    const wrapped = new Error(
      extractApiErrorMessage(error, "Failed to load image"),
    );
    wrapped.status = error?.response?.status;
    throw wrapped;
  }
}

/** PATCH /api/images — action: "rename" | "move" | "tags" | "favorite". */
export async function updateCloudinaryImage(publicId, action, payload = {}) {
  try {
    const { data } = await httpClient.patch("/api/images", {
      publicId,
      action,
      ...payload,
    });
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, "Failed to update image"));
  }
}

/** POST /api/images/bulk — action: "delete" | "move". Resolves on partial failure too. */
export async function bulkImageAction(action, publicIds, payload = {}) {
  try {
    const { data } = await httpClient.post(
      "/api/images/bulk",
      { action, publicIds, ...payload },
      { validateStatus: (status) => status === 200 || status === 207 },
    );
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, "Bulk action failed"));
  }
}

export async function fetchFolders() {
  try {
    const { data } = await httpClient.get("/api/folders");
    return data.folders;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, "Failed to load folders"));
  }
}

export async function createFolder(name) {
  try {
    const { data } = await httpClient.post("/api/folders", { name });
    return data.folder;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, "Failed to create folder"));
  }
}

export async function fetchStorageStats() {
  try {
    const { data } = await httpClient.get("/api/stats");
    return data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, "Failed to load storage stats"));
  }
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "" && value !== false,
    ),
  );
}

export const cloudinaryConfig = {
  cloudName: CLOUD_NAME,
  uploadPreset: UPLOAD_PRESET,
  folder: UPLOAD_FOLDER,
};
