/** Route helpers. The root folder ("") lives at /folders, sub-folders at /folders/<name>. */
export function folderRoute(folderName) {
  return folderName ? `/folders/${encodeURIComponent(folderName)}` : "/folders";
}

export function imageRoute(imageId, folderName) {
  const base = `/gallery/${encodeURIComponent(imageId)}`;
  return typeof folderName === "string"
    ? `${base}?folder=${encodeURIComponent(folderName)}`
    : base;
}
