import {
  folderClause,
  getCloudinaryConfig,
  getFolderMode,
  listRootFolders,
  searchResources,
  sendError,
} from "./_lib/cloudinary.js";
import { folderToPath } from "../src/lib/folderRules.js";

const PAGE_SIZE = 500;
const MAX_PAGES_PER_FOLDER = 20;
const MAX_FOLDERS = 100;

/**
 * GET /api/stats
 * Storage totals for the root folder and each direct sub-folder, computed
 * from real Cloudinary search results (paginated with next_cursor).
 * Response: { totalImages, totalBytes, formatCounts, folders: { [name]: { count, bytes } }, truncated }
 * The root folder is reported under the "" key.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const config = getCloudinaryConfig();
    const mode = await getFolderMode(config);
    const subfolders = await listRootFolders(config);
    let truncated = subfolders.length > MAX_FOLDERS;
    const names = ["", ...subfolders.slice(0, MAX_FOLDERS).map((f) => f.name)];

    const folders = {};
    const formatCounts = {};
    let totalImages = 0;
    let totalBytes = 0;

    for (const name of names) {
      const stats = { count: 0, bytes: 0 };
      let cursor;
      let pages = 0;
      do {
        const data = await searchResources(config, {
          expression: `resource_type:image AND type:upload AND ${folderClause(mode, folderToPath(config.folder, name))}`,
          max_results: PAGE_SIZE,
          with_field: [],
          ...(cursor ? { next_cursor: cursor } : {}),
        });
        for (const resource of data.resources ?? []) {
          stats.count += 1;
          stats.bytes += resource.bytes ?? 0;
          const format = resource.format ?? "unknown";
          formatCounts[format] = (formatCounts[format] ?? 0) + 1;
        }
        cursor = data.next_cursor;
        pages += 1;
      } while (cursor && pages < MAX_PAGES_PER_FOLDER);
      if (cursor) truncated = true;
      folders[name] = stats;
      totalImages += stats.count;
      totalBytes += stats.bytes;
    }

    res.setHeader("Cache-Control", "private, max-age=10");
    return res.status(200).json({
      totalImages,
      totalBytes,
      formatCounts,
      folders,
      truncated,
    });
  } catch (error) {
    return sendError(res, error, "api/stats");
  }
}
