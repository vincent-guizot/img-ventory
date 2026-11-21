import {
  FAVORITE_TAG,
  folderToPath,
  slugifyPublicIdSegment,
  validateDisplayName,
  validateFolderSelector,
  validatePublicId,
  validateTags,
} from "../../src/lib/folderRules.js";
import {
  ApiError,
  destroyResource,
  findResourcesInRoot,
  listRootFolders,
  mapResource,
  renameResource,
  requireFolderMode,
  signedUploadApiRequest,
  updateResource,
} from "./cloudinary.js";

export const MAX_BULK_ITEMS = 100;

/** Validates a publicId and returns the Cloudinary resource if it's inside the root. */
export async function loadResourceInRoot(config, publicId) {
  const check = validatePublicId(publicId);
  if (!check.ok) throw new ApiError(400, check.error);
  const found = await findResourcesInRoot(config, [check.value]);
  const resource = found.get(check.value);
  if (!resource) {
    throw new ApiError(404, `Image not found in ${config.folder}`);
  }
  return resource;
}

export function validatePublicIdList(publicIds) {
  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    throw new ApiError(400, "publicIds must be a non-empty array");
  }
  if (publicIds.length > MAX_BULK_ITEMS) {
    throw new ApiError(400, `At most ${MAX_BULK_ITEMS} images per request`);
  }
  const unique = [];
  for (const id of publicIds) {
    const check = validatePublicId(id);
    if (!check.ok) throw new ApiError(400, check.error);
    if (!unique.includes(check.value)) unique.push(check.value);
  }
  return unique;
}

/** Validates the target folder and checks that it exists in Cloudinary. */
export async function resolveTargetFolder(config, folder) {
  const check = validateFolderSelector(folder);
  if (!check.ok) throw new ApiError(400, check.error);
  if (check.value) {
    const folders = await listRootFolders(config);
    if (!folders.some((f) => f.name === check.value)) {
      throw new ApiError(404, `Folder "${check.value}" does not exist`);
    }
  }
  return { name: check.value, path: folderToPath(config.folder, check.value) };
}

async function reloadMapped(config, publicId) {
  const found = await findResourcesInRoot(config, [publicId]);
  const resource = found.get(publicId);
  if (!resource) {
    throw new ApiError(
      502,
      "Cloudinary reported success but the image could not be re-read",
    );
  }
  return mapResource(resource, config.folder);
}

function currentFolderPath(resource) {
  return resource.asset_folder ?? resource.folder ?? "";
}

function escapeContextValue(value) {
  return value.replace(/([=|\\])/g, "\\$1");
}

/**
 * Moves one asset into `target` (a resolved folder from resolveTargetFolder).
 * - dynamic folder mode: only asset_folder changes; public ID and URL stay.
 * - fixed folder mode: the public ID is renamed to "<target>/<basename>",
 *   so the delivery URL changes.
 */
export async function moveResource(config, mode, resource, target) {
  if (currentFolderPath(resource) === target.path) {
    throw new ApiError(400, "Image is already in that folder");
  }
  const previous = { publicId: resource.public_id, url: resource.secure_url };
  let publicId = resource.public_id;
  if (mode === "dynamic") {
    await updateResource(config, publicId, { asset_folder: target.path });
  } else {
    const basename = resource.public_id.split("/").pop();
    publicId = `${target.path}/${basename}`;
    await renameResource(config, resource.public_id, publicId);
  }
  const image = await reloadMapped(config, publicId);
  return {
    image,
    previousPublicId: previous.publicId,
    previousUrl: previous.url,
    urlChanged: image.secureUrl !== previous.url,
  };
}

/**
 * Renames one asset.
 * - dynamic: updates display_name (public ID/URL unchanged).
 * - fixed: renames the public ID to "<folder>/<slug>" (URL changes) and keeps
 *   the human readable name in the `iv_name` context key.
 */
export async function renameImage(config, mode, resource, name) {
  const check = validateDisplayName(name);
  if (!check.ok) throw new ApiError(400, check.error);
  const previous = { publicId: resource.public_id, url: resource.secure_url };
  let publicId = resource.public_id;
  let warning;
  if (mode === "dynamic") {
    await updateResource(config, publicId, { display_name: check.value });
  } else {
    const slug = slugifyPublicIdSegment(check.value);
    if (!slug) {
      throw new ApiError(400, "Name must contain at least one letter or number");
    }
    const folderPath = resource.public_id.split("/").slice(0, -1).join("/");
    const target = folderPath ? `${folderPath}/${slug}` : slug;
    if (target !== resource.public_id) {
      await renameResource(config, resource.public_id, target);
      publicId = target;
    }
    try {
      await updateResource(config, publicId, {
        context: `iv_name=${escapeContextValue(check.value)}`,
      });
    } catch {
      warning =
        "Public ID was renamed, but the display name could not be saved.";
    }
  }
  const image = await reloadMapped(config, publicId);
  return {
    image,
    previousPublicId: previous.publicId,
    previousUrl: previous.url,
    urlChanged: image.secureUrl !== previous.url,
    ...(warning ? { warning } : {}),
  };
}

/** Replaces the user tags of an asset, keeping/setting the favorite flag. */
export async function setTags(config, resource, { tags, favorite }) {
  const currentTags = Array.isArray(resource.tags) ? resource.tags : [];
  let userTags = currentTags.filter((tag) => tag !== FAVORITE_TAG);
  if (tags !== undefined) {
    const check = validateTags(tags);
    if (!check.ok) throw new ApiError(400, check.error);
    userTags = check.value;
  }
  const isFavorite =
    favorite === undefined ? currentTags.includes(FAVORITE_TAG) : favorite;
  if (favorite !== undefined && typeof favorite !== "boolean") {
    throw new ApiError(400, "favorite must be a boolean");
  }
  const finalTags = isFavorite ? [...userTags, FAVORITE_TAG] : userTags;
  if (finalTags.length > 0) {
    await updateResource(config, resource.public_id, {
      tags: finalTags.join(","),
    });
  } else {
    await signedUploadApiRequest(
      config,
      "image/tags",
      { command: "remove_all" },
      { public_ids: [resource.public_id] },
    );
  }
  return { image: await reloadMapped(config, resource.public_id) };
}

export async function deleteImage(config, resource) {
  const result = await destroyResource(config, resource.public_id);
  return { result, publicId: resource.public_id };
}

/** Runs `task` over items with limited concurrency, collecting per-item results. */
export async function mapWithConcurrency(items, limit, task) {
  const results = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      try {
        results[current] = { ok: true, ...(await task(items[current])) };
      } catch (error) {
        results[current] = {
          ok: false,
          error:
            error instanceof ApiError ? error.message : "Internal server error",
        };
        if (!(error instanceof ApiError)) {
          console.error("[api bulk] Unexpected error:", error);
        }
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

export { requireFolderMode };
