/**
 * Pure validation rules shared by the browser (forms, upload target) and the
 * serverless functions in api/ (which are the real security boundary).
 *
 * This file must stay free of browser/Node-only globals so both sides can
 * import it.
 *
 * Model: every asset managed by img-ventory lives in the root folder
 * (VITE_CLOUDINARY_FOLDER, default "img-ventory") or in exactly ONE level of
 * sub-folder below it, e.g. "img-ventory/Aplikasi A". Nested folders are
 * intentionally not supported.
 */

export const DEFAULT_ROOT_FOLDER = "img-ventory";
export const MAX_FOLDER_NAME_LENGTH = 64;
export const MAX_TAG_LENGTH = 40;
export const MAX_TAGS = 20;
export const MAX_PUBLIC_ID_LENGTH = 255;
export const MAX_DISPLAY_NAME_LENGTH = 120;

/** Tag used to persist "favorite" state on the Cloudinary asset itself. */
export const FAVORITE_TAG = "iv_favorite";

/** Starts with a letter/digit; then letters, digits, space, "_", "-", "."; no trailing space/dot. */
const FOLDER_NAME_RE = /^[\p{L}\p{N}](?:[\p{L}\p{N} _.-]*[\p{L}\p{N}_-])?$/u;
const TAG_RE = /^[\p{L}\p{N}][\p{L}\p{N} _.-]*$/u;
// Control characters, quotes and backslashes are never valid in a public ID we
// accept: they would break Cloudinary search expressions.
// eslint-disable-next-line no-control-regex
const UNSAFE_PUBLIC_ID_RE = /[\u0000-\u001f\u007f"\\<>?#%&]/;
// eslint-disable-next-line no-control-regex
const UNSAFE_NAME_RE = /[\u0000-\u001f\u007f"\\/<>?#%&]/;

/**
 * Validates a single folder name (not a path). Returns
 * `{ ok: true, value }` with the trimmed name, or `{ ok: false, error }`.
 */
export function validateFolderName(input) {
  if (typeof input !== "string") {
    return { ok: false, error: "Folder name is required" };
  }
  const value = input.trim();
  if (!value) return { ok: false, error: "Folder name is required" };
  if (value.length > MAX_FOLDER_NAME_LENGTH) {
    return {
      ok: false,
      error: `Folder name must be at most ${MAX_FOLDER_NAME_LENGTH} characters`,
    };
  }
  if (value.includes("/") || value.includes("\\")) {
    return { ok: false, error: "Nested folders are not supported" };
  }
  if (value.includes("..") || !FOLDER_NAME_RE.test(value)) {
    return {
      ok: false,
      error:
        "Use letters, numbers, spaces, '-', '_' or '.', starting with a letter or number",
    };
  }
  return { ok: true, value };
}

/**
 * Validates the `folder` selector used by the API and UI.
 * An empty string / null / undefined means the root folder itself.
 */
export function validateFolderSelector(input) {
  if (input === undefined || input === null || input === "") {
    return { ok: true, value: "" };
  }
  return validateFolderName(input);
}

/** "" -> "img-ventory"; "Aplikasi A" -> "img-ventory/Aplikasi A". */
export function folderToPath(root, folderName) {
  return folderName ? `${root}/${folderName}` : root;
}

/**
 * Inverse of folderToPath. Returns the folder name ("" for the root) when the
 * path is the root or a direct child of it, otherwise null (outside root, or
 * nested deeper than one level).
 */
export function pathToFolder(root, path) {
  if (typeof path !== "string") return null;
  if (path === root) return "";
  const prefix = `${root}/`;
  if (!path.startsWith(prefix)) return null;
  const name = path.slice(prefix.length);
  return validateFolderName(name).ok && name === name.trim() ? name : null;
}

export function validatePublicId(input) {
  if (typeof input !== "string" || !input.trim()) {
    return { ok: false, error: "Missing or invalid publicId" };
  }
  if (input.length > MAX_PUBLIC_ID_LENGTH) {
    return { ok: false, error: "publicId is too long" };
  }
  if (
    UNSAFE_PUBLIC_ID_RE.test(input) ||
    input.startsWith("/") ||
    input.endsWith("/") ||
    input.split("/").some((part) => part === ".." || part === "." || !part)
  ) {
    return { ok: false, error: "publicId contains invalid characters" };
  }
  return { ok: true, value: input };
}

/** Validates a human-facing display name used for rename. */
export function validateDisplayName(input) {
  if (typeof input !== "string" || !input.trim()) {
    return { ok: false, error: "Name is required" };
  }
  const value = input.trim();
  if (value.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      ok: false,
      error: `Name must be at most ${MAX_DISPLAY_NAME_LENGTH} characters`,
    };
  }
  if (UNSAFE_NAME_RE.test(value) || value === "." || value === "..") {
    return {
      ok: false,
      error: "Name can't contain / \\ \" < > ? # % & or control characters",
    };
  }
  return { ok: true, value };
}

/**
 * Turns a display name into a safe public-ID segment, e.g.
 * "Hero Banner (v2).png" -> "Hero-Banner-v2".
 */
export function slugifyPublicIdSegment(name) {
  return name
    .trim()
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export function validateTag(input) {
  if (typeof input !== "string") return { ok: false, error: "Invalid tag" };
  const value = input.trim();
  if (!value) return { ok: false, error: "Tag can't be empty" };
  if (value.length > MAX_TAG_LENGTH) {
    return {
      ok: false,
      error: `Tags must be at most ${MAX_TAG_LENGTH} characters`,
    };
  }
  if (!TAG_RE.test(value)) {
    return {
      ok: false,
      error: "Tags may contain letters, numbers, spaces, '-', '_' or '.'",
    };
  }
  if (value === FAVORITE_TAG) {
    return { ok: false, error: "This tag name is reserved" };
  }
  return { ok: true, value };
}

export function validateTags(input) {
  if (!Array.isArray(input)) return { ok: false, error: "tags must be an array" };
  const unique = [];
  for (const raw of input) {
    const result = validateTag(raw);
    if (!result.ok) return result;
    if (!unique.includes(result.value)) unique.push(result.value);
  }
  if (unique.length > MAX_TAGS) {
    return { ok: false, error: `At most ${MAX_TAGS} tags per image` };
  }
  return { ok: true, value: unique };
}

/** Upload constraints enforced in the browser before anything is sent. */
export const UPLOAD_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};
export const UPLOAD_MAX_BYTES = 20 * 1024 * 1024;

export function validateUploadFile(file) {
  if (!file || typeof file.name !== "string") {
    return { ok: false, error: "Invalid file" };
  }
  if (!Object.keys(UPLOAD_ACCEPT).includes(file.type)) {
    return {
      ok: false,
      error: `Unsupported type${file.type ? ` (${file.type})` : ""}. Use JPG, PNG, WEBP or GIF.`,
    };
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    return { ok: false, error: "File is larger than 20 MB" };
  }
  if (file.size === 0) return { ok: false, error: "File is empty" };
  return { ok: true };
}
