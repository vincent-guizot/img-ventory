import {
  ApiError,
  findResourcesInRoot,
  getCloudinaryConfig,
  readJsonBody,
  sendError,
} from "../_lib/cloudinary.js";
import {
  deleteImage,
  mapWithConcurrency,
  moveResource,
  requireFolderMode,
  resolveTargetFolder,
  validatePublicIdList,
} from "../_lib/operations.js";

/**
 * POST /api/images/bulk
 *   { action: "delete", publicIds: [...] }
 *   { action: "move", publicIds: [...], folder: "<name>" | "" }
 *
 * Every public ID is validated and looked up first; IDs that don't exist or
 * live outside the root folder are reported as failed and never touched.
 * Response: { results: [{ publicId, ok, error?, ... }], succeeded, failed }.
 * The status is 200 only when every item succeeded, otherwise 207.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const body = readJsonBody(req);
    if (body.action !== "delete" && body.action !== "move") {
      throw new ApiError(400, "Invalid action");
    }
    const publicIds = validatePublicIdList(body.publicIds);
    const config = getCloudinaryConfig();

    let task;
    if (body.action === "move") {
      const mode = await requireFolderMode(config);
      const target = await resolveTargetFolder(config, body.folder);
      task = (resource) => moveResource(config, mode, resource, target);
    } else {
      task = (resource) => deleteImage(config, resource);
    }

    const found = await findResourcesInRoot(config, publicIds);
    const results = await mapWithConcurrency(publicIds, 4, async (publicId) => {
      const resource = found.get(publicId);
      if (!resource) throw new ApiError(404, `Image not found in ${config.folder}`);
      return task(resource);
    });
    const withIds = results.map((result, i) => ({
      publicId: publicIds[i],
      ...result,
    }));
    const failed = withIds.filter((r) => !r.ok).length;
    return res.status(failed ? 207 : 200).json({
      results: withIds,
      succeeded: withIds.length - failed,
      failed,
    });
  } catch (error) {
    return sendError(res, error, "api/images/bulk");
  }
}
