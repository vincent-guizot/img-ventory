import { getCloudinaryConfig, signCloudinaryParams } from "../_lib/cloudinary.js";
export default async function handler(req, res) {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", "DELETE");
        return res.status(405).json({ error: "Method not allowed" });
    }
    // Catch-all route ([...publicId].ts) so public IDs containing "/"
    // (e.g. "img-ventory/abc123") map correctly instead of 404-ing.
    const segments = req.query.publicId;
    const publicId = Array.isArray(segments) ? segments.join("/") : segments;
    if (!publicId) {
        return res.status(400).json({ error: "Missing publicId" });
    }
    try {
        const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = signCloudinaryParams({ public_id: publicId, timestamp }, apiSecret);
        const body = new URLSearchParams({
            public_id: publicId,
            timestamp: String(timestamp),
            api_key: apiKey,
            signature,
        });
        const destroyResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });
        if (!destroyResponse.ok) {
            const detail = await destroyResponse.text();
            console.error("[api/images/:publicId] Cloudinary destroy failed:", destroyResponse.status, detail);
            return res.status(502).json({ error: "Failed to delete image from Cloudinary" });
        }
        const data = (await destroyResponse.json());
        if (data.result !== "ok" && data.result !== "not found") {
            return res.status(502).json({ error: `Cloudinary destroy returned: ${data.result}` });
        }
        return res.status(200).json({ result: data.result, publicId });
    }
    catch (error) {
        console.error("[api/images/:publicId] Unexpected error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
