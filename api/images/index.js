import {
  ApiError,
  getCloudinaryConfig,
  getFolderMode,
  mapResource,
  readJsonBody,
  searchResources,
  sendError,
} from "../_lib/cloudinary.js";
import { buildListRequest } from "../_lib/listQuery.js";
import {
  deleteImage,
  loadResourceInRoot,
  moveResource,
  renameImage,
  requireFolderMode,
  resolveTargetFolder,
  setTags,
} from "../_lib/operations.js";

const ASSET_ID_RE = /^[a-f0-9]{32}$/;

/**
 * /api/images
 *   GET    ?folder=&q=&format=&tag=&favorite=&sort=&order=&limit=&cursor=
 *            Lists one folder (root when `folder` is empty) with cursor
 *            pagination. Response: { images, nextCursor, totalCount, folder }.
 *   GET    ?assetId=<id>   Single image details (must be inside the root).
 *   DELETE ?publicId=<id>  Deletes one image (must be inside the root).
 *   PATCH  { publicId, action: "rename"|"move"|"tags"|"favorite", ... }
 */
export default async function handler(req, res) {
  try {
    switch (req.method) {
      case "GET":
        return await handleGet(req, res);
      case "DELETE":
        return await handleDelete(req, res);
      case "PATCH":
        return await handlePatch(req, res);
      default:
        res.setHeader("Allow", "GET, DELETE, PATCH");
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    return sendError(res, error, "api/images");
  }
}

async function handleGet(req, res) {
  const config = getCloudinaryConfig();
  const query = req.query ?? {};

  if (query.assetId !== undefined) {
    const assetId = query.assetId;
    if (typeof assetId !== "string" || !ASSET_ID_RE.test(assetId)) {
      throw new ApiError(400, "Invalid assetId");
    }
    const data = await searchResources(config, {
      expression: `resource_type:image AND asset_id=${assetId}`,
      max_results: 1,
    });
    const image = (data.resources ?? [])
      .map((resource) => mapResource(resource, config.folder))
      .find((mapped) => mapped.folderName !== null);
    if (!image) throw new ApiError(404, "Image not found");
    res.setHeader("Cache-Control", "private, max-age=10");
    return res.status(200).json({ image });
  }

  const mode = await getFolderMode(config);
  const { folder, body } = buildListRequest(query, {
    root: config.folder,
    mode,
  });
  const data = await searchResources(config, body);
  const images = (data.resources ?? []).map((resource) =>
    mapResource(resource, config.folder),
  );
  // Images rarely change; let clients/CDN cache briefly.
  res.setHeader("Cache-Control", "private, max-age=10");
  return res.status(200).json({
    images,
    nextCursor: data.next_cursor ?? null,
    totalCount: data.total_count ?? images.length,
    folder,
  });
}

/**
 * Deletes a single image from Cloudinary by public_id, passed as
 * `?publicId=...` (see cloudinary.service.js for why it's a query param
 * rather than a dynamic /api/images/:publicId path segment).
 */
async function handleDelete(req, res) {
  const { publicId } = req.query ?? {};
  if (!publicId || Array.isArray(publicId)) {
    return res.status(400).json({ error: "Missing or invalid publicId" });
  }
  const config = getCloudinaryConfig();
  const resource = await loadResourceInRoot(config, publicId);
  const { result } = await deleteImage(config, resource);
  return res.status(200).json({ result, publicId });
}

async function handlePatch(req, res) {
  const body = readJsonBody(req);
  const { publicId, action } = body;
  const config = getCloudinaryConfig();

  if (!["rename", "move", "tags", "favorite"].includes(action)) {
    throw new ApiError(400, "Invalid action");
  }
  const resource = await loadResourceInRoot(config, publicId);

  if (action === "rename") {
    const mode = await requireFolderMode(config);
    return res.status(200).json(await renameImage(config, mode, resource, body.name));
  }
  if (action === "move") {
    const mode = await requireFolderMode(config);
    const target = await resolveTargetFolder(config, body.folder);
    return res
      .status(200)
      .json(await moveResource(config, mode, resource, target));
  }
  if (action === "tags") {
    if (!Array.isArray(body.tags)) throw new ApiError(400, "tags must be an array");
    return res.status(200).json(await setTags(config, resource, { tags: body.tags }));
  }
  if (typeof body.favorite !== "boolean") {
    throw new ApiError(400, "favorite must be a boolean");
  }
  return res
    .status(200)
    .json(await setTags(config, resource, { favorite: body.favorite }));
}
