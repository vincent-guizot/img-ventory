import {
  ApiError,
  createRootSubfolder,
  getCloudinaryConfig,
  listRootFolders,
  readJsonBody,
  sendError,
} from "../_lib/cloudinary.js";
import { validateFolderName } from "../../src/lib/folderRules.js";

/**
 * /api/folders
 *   GET  -> { root, folders: [{ name, path }] }  direct sub-folders of the
 *           root, read from Cloudinary's Folders API (so empty folders are
 *           listed too; Cloudinary itself is the source of truth).
 *   POST { name } -> 201 { folder }  creates "<root>/<name>" in Cloudinary.
 */
export default async function handler(req, res) {
  try {
    const config = getCloudinaryConfig();
    if (req.method === "GET") {
      const folders = await listRootFolders(config);
      res.setHeader("Cache-Control", "private, max-age=5");
      return res.status(200).json({ root: config.folder, folders });
    }
    if (req.method === "POST") {
      const body = readJsonBody(req);
      const check = validateFolderName(body.name);
      if (!check.ok) throw new ApiError(400, check.error);
      const existing = await listRootFolders(config);
      if (
        existing.some(
          (folder) => folder.name.toLowerCase() === check.value.toLowerCase(),
        )
      ) {
        throw new ApiError(409, `Folder "${check.value}" already exists`);
      }
      const folder = await createRootSubfolder(config, check.value);
      return res.status(201).json({ folder });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return sendError(res, error, "api/folders");
  }
}
