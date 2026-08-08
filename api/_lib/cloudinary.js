import crypto from "node:crypto";
export function getCloudinaryConfig() {
    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const folder = process.env.VITE_CLOUDINARY_FOLDER ?? "img-ventory";
    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Missing Cloudinary server credentials. Set VITE_CLOUDINARY_CLOUD_NAME (public), " +
            "and CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET (server-only, NO VITE_ prefix) " +
            "in your deployment's environment variables.");
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
