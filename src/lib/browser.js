import { downloadUrl } from "./cloudinaryUrl";

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!ok) throw new Error("Clipboard is not available");
}

/** Starts a browser download of a Cloudinary image (via fl_attachment). */
export function triggerDownload(image) {
  const anchor = document.createElement("a");
  anchor.href = downloadUrl(image.secureUrl);
  anchor.rel = "noreferrer";
  anchor.download = image.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/** Per-viewer UI preference; never throws (private mode, blocked storage). */
export function readPreference(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writePreference(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}
