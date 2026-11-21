/**
 * Helpers for Cloudinary delivery URLs. Transformations are inserted right
 * after "/upload/", e.g. .../image/upload/w_800,q_auto/v123/img-ventory/x.jpg
 */
export function withTransformation(secureUrl, transformation) {
  if (!transformation || typeof secureUrl !== "string") return secureUrl;
  return secureUrl.replace("/upload/", `/upload/${transformation}/`);
}

/** URL that makes Cloudinary answer with Content-Disposition: attachment. */
export function downloadUrl(secureUrl) {
  return withTransformation(secureUrl, "fl_attachment");
}

export const TRANSFORMATION_PRESETS = [
  { id: "original", label: "Original", transformation: "" },
  { id: "auto", label: "Optimized (auto format/quality)", transformation: "f_auto,q_auto" },
  { id: "w800", label: "Width 800px", transformation: "c_limit,w_800,f_auto,q_auto" },
  { id: "thumb", label: "Square thumbnail 400px", transformation: "c_fill,w_400,h_400,g_auto,f_auto,q_auto" },
  { id: "webp", label: "WebP", transformation: "f_webp,q_auto" },
  { id: "gray", label: "Grayscale", transformation: "e_grayscale,f_auto,q_auto" },
];
