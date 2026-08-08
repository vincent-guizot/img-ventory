import { cloudinaryBasicAuth, getCloudinaryConfig } from "../_lib/cloudinary.js";
/** Adds an f_auto,q_auto thumbnail transformation to a Cloudinary secure_url. */
function toThumbnailUrl(secureUrl) {
    return secureUrl.replace("/upload/", "/upload/c_fill,w_400,h_400,q_auto,f_auto/");
}
function mapResource(resource) {
    return {
        id: resource.asset_id ?? resource.public_id,
        publicId: resource.public_id,
        // Prefer display_name: this is what updates when you rename an asset
        // in the Cloudinary console. `filename` stays frozen to the name the
        // file had at upload time, so it never reflects a console rename.
        fileName: resource.display_name ??
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
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }
    try {
        const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();
        const searchResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
            method: "POST",
            headers: {
                Authorization: cloudinaryBasicAuth(apiKey, apiSecret),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                expression: `folder:"${folder}"`,
                sort_by: [{ created_at: "desc" }],
                max_results: 100,
                with_field: ["tags", "display_name"],
            }),
        });
        if (!searchResponse.ok) {
            const detail = await searchResponse.text();
            console.error("[api/images] Cloudinary search failed:", searchResponse.status, detail);
            return res.status(502).json({ error: "Failed to list images from Cloudinary" });
        }
        const data = (await searchResponse.json());
        const images = (data.resources ?? []).map(mapResource);
        // Images rarely change; let clients/CDN cache briefly.
        res.setHeader("Cache-Control", "private, max-age=10");
        return res.status(200).json({ images });
    }
    catch (error) {
        console.error("[api/images] Unexpected error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
