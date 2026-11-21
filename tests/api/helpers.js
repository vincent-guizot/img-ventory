import { vi } from "vitest";
import { resetFolderModeCache, transport } from "../../api/_lib/cloudinary.js";

export function setServerEnv({ mode = "dynamic" } = {}) {
  process.env.VITE_CLOUDINARY_CLOUD_NAME = "test-cloud";
  process.env.VITE_CLOUDINARY_FOLDER = "img-ventory";
  process.env.CLOUDINARY_API_KEY = "key";
  process.env.CLOUDINARY_API_SECRET = "secret";
  if (mode) process.env.CLOUDINARY_FOLDER_MODE = mode;
  else delete process.env.CLOUDINARY_FOLDER_MODE;
  resetFolderModeCache();
}

export function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

/**
 * Replaces the Cloudinary HTTP transport with a router function
 * (url, init) => response. Returns the mock to inspect calls.
 */
export function mockCloudinary(router) {
  const fn = vi.fn(async (url, init = {}) => {
    const parsed = new URL(url);
    let body = init.body;
    if (typeof body === "string" && init.headers?.["Content-Type"] === "application/json") {
      body = JSON.parse(body);
    } else if (body instanceof URLSearchParams) {
      body = Object.fromEntries(body.entries());
    }
    const response = await router({
      method: init.method ?? "GET",
      path: parsed.pathname.replace("/v1_1/test-cloud/", ""),
      query: Object.fromEntries(parsed.searchParams.entries()),
      body,
      rawBody: init.body,
    });
    if (!response) throw new Error(`Unexpected Cloudinary call: ${init.method} ${url}`);
    return response;
  });
  transport.fetch = fn;
  return fn;
}

export function createRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

export function resource(overrides = {}) {
  return {
    asset_id: "a".repeat(32),
    public_id: "img-ventory/Aplikasi A/photo",
    asset_folder: "img-ventory/Aplikasi A",
    display_name: "photo",
    filename: "photo",
    format: "png",
    bytes: 1000,
    width: 10,
    height: 10,
    secure_url:
      "https://res.cloudinary.com/test-cloud/image/upload/v1/img-ventory/Aplikasi%20A/photo.png",
    created_at: "2026-01-01T00:00:00Z",
    tags: [],
    ...overrides,
  };
}

/** Parses `public_id="x" OR public_id="y"` lookups from a search expression. */
export function lookedUpIds(expression) {
  return [...expression.matchAll(/public_id="([^"]+)"/g)].map((m) => m[1]);
}
