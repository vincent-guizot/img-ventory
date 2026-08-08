import axios from "axios";
/**
 * Base axios instance used for all outbound HTTP requests.
 *
 * - Cloudinary's *unsigned upload* endpoint is called directly from the
 *   browser (see services/cloudinary.service.ts) — that's safe, it never
 *   needs the API Secret.
 * - Listing and deleting images go through our own `/api/*` serverless
 *   endpoints instead, since those require the Cloudinary Admin API
 *   (and therefore the API Secret), which must stay server-side only.
 */
export const httpClient = axios.create({
    timeout: 30_000,
});
