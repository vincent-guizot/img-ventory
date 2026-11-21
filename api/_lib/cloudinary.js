import crypto from "node:crypto";
import https from "node:https";
import {
  FAVORITE_TAG,
  folderToPath,
  pathToFolder,
} from "../../src/lib/folderRules.js";
export function getCloudinaryConfig() {
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.VITE_CLOUDINARY_FOLDER ?? "img-ventory";
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary server credentials. Set VITE_CLOUDINARY_CLOUD_NAME (public), " +
        "and CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET (server-only, NO VITE_ prefix) " +
        "in your deployment's environment variables.",
    );
  }
  return { cloudName, apiKey, apiSecret, folder };
}
/** Basic Auth header value for the Cloudinary Admin API (search, etc.). */
export function cloudinaryBasicAuth(apiKey, apiSecret) {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
}
/**
 * Signs a set of params for Cloudinary's signed Admin API calls (e.g. destroy).
 * Cloudinary's algorithm: sort params by key, join as `key=value&key=value`,
 * append the API secret, then SHA-1 hash the result.
 * https://cloudinary.com/documentation/authentication_signatures
 */
export function signCloudinaryParams(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto
    .createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");
}
/**
 * A minimal fetch()-shaped wrapper around node:https.
 *
 * Node's native fetch() on Windows (Node 22+) has a known libuv race
 * condition (nodejs/node#56645 / #58091) that crashes the process on
 * teardown: "Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)".
 * It surfaces reliably in short-lived serverless-style processes like
 * `vercel dev` on Windows. Using node:https directly avoids it entirely,
 * since it never goes through the fetch()/undici code path.
 *
 * Mimics just enough of the Response shape (ok, status, json(), text())
 * so call sites barely change.
 */
export function httpsFetch(url, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const { hostname, pathname, search } = new URL(url);
    const payload =
      body === undefined
        ? undefined
        : typeof body === "string"
          ? body
          : body.toString();
    const req = https.request(
      {
        hostname,
        path: pathname + search,
        method,
        headers: {
          ...headers,
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          resolve({
            ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
            status: res.statusCode ?? 0,
            text: async () => text,
            json: async () => JSON.parse(text),
          });
        });
      },
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ───────────────────────────────────────────────────────────────────────────
// Higher-level helpers used by the api/ handlers. Everything below runs
// server-side only and is the security boundary for every administrative
// operation: callers must go through these helpers so assets outside the
// configured root folder can never be listed, changed or deleted.
// ───────────────────────────────────────────────────────────────────────────


const API_BASE = "https://api.cloudinary.com/v1_1";

/** HTTP transport used by the helpers below (replaceable in tests). */
export const transport = { fetch: (...args) => httpsFetch(...args) };

/** Error carrying an HTTP status for the handler to forward. */
export class ApiError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

/** Encodes each segment of a slash-separated path for use in a URL path. */
export function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

/**
 * Calls a Cloudinary Admin API endpoint (Basic auth). Throws ApiError(502)
 * when Cloudinary answers with an error, so callers never report success for
 * a failed operation.
 */
export async function adminRequest(
  config,
  path,
  { method = "GET", query, json, form, allow404 = false } = {},
) {
  const url = new URL(`${API_BASE}/${config.cloudName}/${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  const headers = {
    Authorization: cloudinaryBasicAuth(config.apiKey, config.apiSecret),
  };
  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form !== undefined) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(form);
  }
  const response = await transport.fetch(url.toString(), { method, headers, body });
  if (allow404 && response.status === 404) return null;
  if (!response.ok) {
    const detail = await response.text();
    console.error(
      `[api] Cloudinary ${method} ${path} failed:`,
      response.status,
      detail,
    );
    throw new ApiError(
      502,
      `Cloudinary request failed (${response.status})`,
      detail,
    );
  }
  return response.json();
}

/** Calls a signed Upload API endpoint such as image/rename or image/destroy. */
export async function signedUploadApiRequest(
  config,
  path,
  params,
  arrayParams = {},
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = { ...params, timestamp };
  // Array params are signed as comma-joined values and sent as `key[]`.
  for (const [key, values] of Object.entries(arrayParams)) {
    toSign[key] = values.join(",");
  }
  const signature = signCloudinaryParams(toSign, config.apiSecret);
  const body = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ),
    timestamp: String(timestamp),
    api_key: config.apiKey,
    signature,
  });
  for (const [key, values] of Object.entries(arrayParams)) {
    for (const value of values) body.append(`${key}[]`, value);
  }
  const response = await transport.fetch(
    `${API_BASE}/${config.cloudName}/${path}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
  );
  if (!response.ok) {
    const detail = await response.text();
    console.error(`[api] Cloudinary ${path} failed:`, response.status, detail);
    let message = `Cloudinary request failed (${response.status})`;
    try {
      const parsed = JSON.parse(detail);
      if (parsed?.error?.message) message = parsed.error.message;
    } catch {
      // keep generic message
    }
    throw new ApiError(502, message, detail);
  }
  return response.json();
}

let cachedFolderMode;

/** For tests only. */
export function resetFolderModeCache() {
  cachedFolderMode = undefined;
}

/**
 * Returns "dynamic" or "fixed", or null when it can't be determined.
 * CLOUDINARY_FOLDER_MODE (server env) wins; otherwise the Admin API config
 * endpoint is asked once per warm function instance.
 */
export async function getFolderMode(config) {
  const fromEnv = process.env.CLOUDINARY_FOLDER_MODE?.trim().toLowerCase();
  if (fromEnv === "dynamic" || fromEnv === "fixed") return fromEnv;
  if (cachedFolderMode !== undefined) return cachedFolderMode;
  try {
    const data = await adminRequest(config, "config", {
      query: { settings: "true" },
    });
    const mode = data?.settings?.folder_mode;
    cachedFolderMode = mode === "dynamic" || mode === "fixed" ? mode : null;
  } catch (error) {
    console.error("[api] Could not detect Cloudinary folder mode:", error);
    cachedFolderMode = null;
  }
  return cachedFolderMode;
}

/** Mode-specific operations (move/rename) refuse to guess. */
export async function requireFolderMode(config) {
  const mode = await getFolderMode(config);
  if (!mode) {
    throw new ApiError(
      500,
      "Could not determine the Cloudinary folder mode. Set CLOUDINARY_FOLDER_MODE to 'dynamic' or 'fixed'.",
    );
  }
  return mode;
}

/** Search-expression clause matching assets directly inside `path`. */
export function folderClause(mode, path) {
  if (mode === "dynamic") return `asset_folder="${path}"`;
  if (mode === "fixed") return `folder="${path}"`;
  // Unknown mode: same clause the original implementation used.
  return `folder:"${path}"`;
}

/** Adds an f_auto,q_auto thumbnail transformation to a Cloudinary secure_url. */
export function toThumbnailUrl(secureUrl) {
  return secureUrl.replace(
    "/upload/",
    "/upload/c_fill,w_400,h_400,q_auto,f_auto/",
  );
}

function readContext(resource) {
  const context = resource.context;
  if (!context || typeof context !== "object") return {};
  return context.custom && typeof context.custom === "object"
    ? context.custom
    : context;
}

/** Shape returned to the browser for a Cloudinary resource. */
export function mapResource(resource, root) {
  const folderPath = resource.asset_folder ?? resource.folder ?? null;
  const rawTags = Array.isArray(resource.tags) ? resource.tags : [];
  const context = readContext(resource);
  return {
    id: resource.asset_id ?? resource.public_id,
    publicId: resource.public_id,
    // Prefer display_name: this is what updates when you rename an asset
    // in the Cloudinary console. `filename` stays frozen to the name the
    // file had at upload time, so it never reflects a console rename.
    // `iv_name` is the context key img-ventory writes on rename in fixed
    // folder mode (where display_name doesn't exist).
    fileName:
      resource.display_name ??
      context.iv_name ??
      resource.filename ??
      resource.public_id.split("/").pop() ??
      resource.public_id,
    format: resource.format ?? "jpg",
    mimeType: `image/${resource.format}`,
    bytes: resource.bytes,
    width: resource.width,
    height: resource.height,
    secureUrl: resource.secure_url,
    thumbnailUrl: toThumbnailUrl(resource.secure_url),
    folder: folderPath,
    folderName: root ? pathToFolder(root, folderPath ?? "") : null,
    tags: rawTags.filter((tag) => tag !== FAVORITE_TAG),
    favorite: rawTags.includes(FAVORITE_TAG),
    // Cloudinary doesn't track "uploaded by" out of the box; placeholder to
    // match the shape the UI expects.
    uploadedBy: "vincent",
    createdAt: resource.created_at,
  };
}

export async function searchResources(config, body) {
  return adminRequest(config, "resources/search", {
    method: "POST",
    json: {
      with_field: ["tags", "context"],
      ...body,
    },
  });
}

/**
 * Looks assets up by public ID and verifies each one lives in the root folder
 * or a direct sub-folder of it. Returns a Map(publicId -> resource) containing
 * only assets that exist AND are inside the root. Cloudinary is the source of
 * truth for the asset's folder (in dynamic folder mode the public ID prefix
 * does not have to match the folder).
 */
export async function findResourcesInRoot(config, publicIds) {
  const found = new Map();
  if (publicIds.length === 0) return found;
  const expression = publicIds.map((id) => `public_id="${id}"`).join(" OR ");
  const data = await searchResources(config, {
    expression: `resource_type:image AND type:upload AND (${expression})`,
    max_results: Math.min(500, publicIds.length),
  });
  for (const resource of data.resources ?? []) {
    const folderPath = resource.asset_folder ?? resource.folder ?? "";
    const inRoot = pathToFolder(config.folder, folderPath) !== null;
    // Fixed folder mode encodes the folder in the public ID; double-check it.
    const idInRoot =
      resource.asset_folder !== undefined ||
      pathToFolder(
        config.folder,
        resource.public_id.split("/").slice(0, -1).join("/"),
      ) !== null;
    if (inRoot && idInRoot && publicIds.includes(resource.public_id)) {
      found.set(resource.public_id, resource);
    }
  }
  return found;
}

export async function updateResource(config, publicId, params) {
  return adminRequest(
    config,
    `resources/image/upload/${encodePath(publicId)}`,
    { method: "POST", form: params },
  );
}

export async function renameResource(config, fromPublicId, toPublicId) {
  return signedUploadApiRequest(config, "image/rename", {
    from_public_id: fromPublicId,
    to_public_id: toPublicId,
    invalidate: "true",
  });
}

export async function destroyResource(config, publicId) {
  const data = await signedUploadApiRequest(config, "image/destroy", {
    public_id: publicId,
  });
  if (data.result !== "ok" && data.result !== "not found") {
    throw new ApiError(502, `Cloudinary destroy returned: ${data.result}`);
  }
  return data.result;
}

/** Lists the direct sub-folders of the root folder (empty folders included). */
export async function listRootFolders(config) {
  const folders = [];
  let cursor;
  do {
    const data = await adminRequest(
      config,
      `folders/${encodePath(config.folder)}`,
      { query: { max_results: 500, next_cursor: cursor }, allow404: true },
    );
    if (!data) break; // root folder doesn't exist yet
    for (const folder of data.folders ?? []) {
      if (pathToFolder(config.folder, folder.path) === folder.name) {
        folders.push({ name: folder.name, path: folder.path });
      }
    }
    cursor = data.next_cursor;
  } while (cursor);
  return folders.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createRootSubfolder(config, name) {
  const path = folderToPath(config.folder, name);
  await adminRequest(config, `folders/${encodePath(path)}`, {
    method: "POST",
  });
  return { name, path };
}

/** Sends a JSON error response for ApiError or unexpected errors. */
export function sendError(res, error, label) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error(`[${label}] Unexpected error:`, error);
  return res.status(500).json({ error: "Internal server error" });
}

/** Vercel parses JSON bodies, but be tolerant of string bodies too. */
export function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body) {
    try {
      return JSON.parse(req.body);
    } catch {
      throw new ApiError(400, "Invalid JSON body");
    }
  }
  return {};
}
