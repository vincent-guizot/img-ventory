import crypto from "node:crypto";
import https from "node:https";
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
