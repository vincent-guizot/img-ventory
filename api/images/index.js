import {
  cloudinaryBasicAuth,
  getCloudinaryConfig,
  httpsFetch,
  signCloudinaryParams,
} from "../_lib/cloudinary.js";
/** Adds an f_auto,q_auto thumbnail transformation to a Cloudinary secure_url. */
function toThumbnailUrl(secureUrl) {
  return secureUrl.replace(
    "/upload/",
    "/upload/c_fill,w_400,h_400,q_auto,f_auto/",
  );
}
function mapResource(resource) {
  return {
    id: resource.asset_id ?? resource.public_id,
    publicId: resource.public_id,
    // Prefer display_name: this is what updates when you rename an asset
    // in the Cloudinary console. `filename` stays frozen to the name the
    // file had at upload time, so it never reflects a console rename.
    fileName:
      resource.display_name ??
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
    folder: resource.folder ?? null,
    tags: resource.tags ?? [],
    // Cloudinary doesn't track "uploaded by" out of the box; placeholder to
    // match the shape the UI expects.
    uploadedBy: "vincent",
    createdAt: resource.created_at,
  };
}
export default async function handler(req, res) {
  if (req.method === "DELETE") {
    return handleDelete(req, res);
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();
    const searchResponse = await httpsFetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
      {
        method: "POST",
        headers: {
          Authorization: cloudinaryBasicAuth(apiKey, apiSecret),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expression: `folder:"${folder}"`,
          sort_by: [{ created_at: "desc" }],
          max_results: 100,
          with_field: ["tags"],
        }),
      },
    );
    if (!searchResponse.ok) {
      const detail = await searchResponse.text();
      console.error(
        "[api/images] Cloudinary search failed:",
        searchResponse.status,
        detail,
      );
      return res
        .status(502)
        .json({ error: "Failed to list images from Cloudinary" });
    }
    const data = await searchResponse.json();
    const images = (data.resources ?? []).map(mapResource);
    // Images rarely change; let clients/CDN cache briefly.
    res.setHeader("Cache-Control", "private, max-age=10");
    return res.status(200).json({ images });
  } catch (error) {
    console.error("[api/images] Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * Deletes a single image from Cloudinary by public_id, passed as
 * `?publicId=...` (see cloudinary.service.js for why it's a query param
 * rather than a dynamic /api/images/:publicId path segment).
 */
async function handleDelete(req, res) {
  const { publicId } = req.query;
  if (!publicId || Array.isArray(publicId)) {
    return res.status(400).json({ error: "Missing or invalid publicId" });
  }
  try {
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signCloudinaryParams(
      { public_id: publicId, timestamp },
      apiSecret,
    );
    const body = new URLSearchParams({
      public_id: publicId,
      timestamp: String(timestamp),
      api_key: apiKey,
      signature,
    });
    const destroyResponse = await httpsFetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    if (!destroyResponse.ok) {
      const detail = await destroyResponse.text();
      console.error(
        "[api/images DELETE] Cloudinary destroy failed:",
        destroyResponse.status,
        detail,
      );
      return res
        .status(502)
        .json({ error: "Failed to delete image from Cloudinary" });
    }
    const data = await destroyResponse.json();
    if (data.result !== "ok" && data.result !== "not found") {
      return res
        .status(502)
        .json({ error: `Cloudinary destroy returned: ${data.result}` });
    }
    return res.status(200).json({ result: data.result, publicId });
  } catch (error) {
    console.error("[api/images DELETE] Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
