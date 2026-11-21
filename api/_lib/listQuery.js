import {
  FAVORITE_TAG,
  folderToPath,
  validateFolderSelector,
  validateTag,
} from "../../src/lib/folderRules.js";
import { ApiError, folderClause } from "./cloudinary.js";

export const DEFAULT_PAGE_SIZE = 30;
export const MAX_PAGE_SIZE = 100;

const SORT_FIELDS = {
  date: "created_at",
  name: "filename",
  size: "bytes",
  format: "format",
};
const FORMATS = ["jpg", "jpeg", "png", "webp", "gif", "avif", "svg", "bmp", "tiff"];
const CURSOR_RE = /^[A-Za-z0-9+/=_-]{1,512}$/;

function single(value, name) {
  if (Array.isArray(value)) throw new ApiError(400, `Invalid ${name}`);
  return value === undefined ? undefined : String(value);
}

/** Splits a free-text search into safe tokens for a Cloudinary expression. */
export function searchTokens(q) {
  if (!q) return [];
  return q
    .slice(0, 100)
    .split(/[^\p{L}\p{N}_-]+/u)
    .map((token) => token.replace(/^-+/, ""))
    .filter(Boolean)
    .slice(0, 5);
}

/**
 * Translates validated query-string params into a Cloudinary Search API body.
 * The expression always pins the search to exactly one folder inside the root.
 */
export function buildListRequest(query, { root, mode }) {
  const folderCheck = validateFolderSelector(single(query.folder, "folder"));
  if (!folderCheck.ok) throw new ApiError(400, folderCheck.error);
  const path = folderToPath(root, folderCheck.value);

  const clauses = ["resource_type:image", "type:upload", folderClause(mode, path)];

  for (const token of searchTokens(single(query.q, "q"))) {
    const fields =
      mode === "dynamic"
        ? [`filename:${token}*`, `display_name:${token}*`]
        : [`filename:${token}*`];
    clauses.push(`(${fields.join(" OR ")})`);
  }

  const format = single(query.format, "format")?.toLowerCase();
  if (format) {
    if (!FORMATS.includes(format)) throw new ApiError(400, "Invalid format");
    clauses.push(`format=${format}`);
  }

  const tag = single(query.tag, "tag");
  if (tag) {
    const check = validateTag(tag);
    if (!check.ok) throw new ApiError(400, check.error);
    clauses.push(`tags="${check.value}"`);
  }

  const favorite = single(query.favorite, "favorite");
  if (favorite === "1" || favorite === "true") {
    clauses.push(`tags="${FAVORITE_TAG}"`);
  }

  const sort = single(query.sort, "sort") ?? "date";
  if (!SORT_FIELDS[sort]) throw new ApiError(400, "Invalid sort");
  const order = single(query.order, "order") ?? (sort === "date" ? "desc" : "asc");
  if (order !== "asc" && order !== "desc") throw new ApiError(400, "Invalid order");

  const limitRaw = single(query.limit, "limit");
  const limit = limitRaw === undefined ? DEFAULT_PAGE_SIZE : Number(limitRaw);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
    throw new ApiError(400, `limit must be between 1 and ${MAX_PAGE_SIZE}`);
  }

  const cursor = single(query.cursor, "cursor");
  if (cursor !== undefined && !CURSOR_RE.test(cursor)) {
    throw new ApiError(400, "Invalid cursor");
  }

  const sortBy = [{ [SORT_FIELDS[sort]]: order }];
  // Stable tie-breaker so pages don't shuffle between requests.
  if (sort !== "date") sortBy.push({ created_at: "desc" });

  return {
    folder: folderCheck.value,
    body: {
      expression: clauses.join(" AND "),
      sort_by: sortBy,
      max_results: limit,
      ...(cursor ? { next_cursor: cursor } : {}),
    },
  };
}
