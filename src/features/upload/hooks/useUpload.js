import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  UploadCancelledError,
  UploadFolderMismatchError,
  uploadToCloudinary,
} from "@/services/cloudinary.service";
import { usePrependImages } from "@/features/gallery/hooks/useImages";
import { validateUploadFile } from "@/lib/folderRules";

/** How many files are sent to Cloudinary at the same time. */
export const MAX_CONCURRENT_UPLOADS = 3;

function createUploadItem(file) {
  const validation = validateUploadFile(file);
  return {
    id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    progress: 0,
    status: validation.ok ? "pending" : "invalid",
    errorMessage: validation.ok ? undefined : validation.error,
    retryable: validation.ok,
    folder: null,
  };
}

/**
 * Upload queue.
 * Statuses: pending (waiting for "Upload"), queued (waiting for a free slot),
 * uploading, success, error, cancelled, invalid (failed validation; never sent).
 *
 * `folder` is the destination folder name ("" = root). It is captured per
 * item when the upload starts, so changing the selection afterwards doesn't
 * move files that are already queued.
 */
export function useUpload({ folder = "" } = {}) {
  const [queue, setQueue] = useState([]);
  const prependImages = usePrependImages();
  const controllers = useRef(new Map());
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const updateItem = useCallback((id, patch) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const uploadFile = useCallback(
    async (item) => {
      const controller = new AbortController();
      controllers.current.set(item.id, controller);
      updateItem(item.id, {
        status: "uploading",
        progress: 0,
        errorMessage: undefined,
      });
      try {
        const image = await uploadToCloudinary(
          item.file,
          (progress) => updateItem(item.id, { progress }),
          { folder: item.folder ?? "", signal: controller.signal },
        );
        updateItem(item.id, { status: "success", progress: 100 });
        prependImages([image]);
        toast.success(`${item.file.name} uploaded`);
      } catch (error) {
        if (error instanceof UploadCancelledError) {
          updateItem(item.id, {
            status: "cancelled",
            progress: 0,
            errorMessage: "Upload cancelled",
          });
          return;
        }
        const message =
          error instanceof Error ? error.message : "Upload failed";
        const mismatch = error instanceof UploadFolderMismatchError;
        updateItem(item.id, {
          status: "error",
          errorMessage: message,
          // The file already exists in Cloudinary; retrying would duplicate it.
          retryable: !mismatch,
        });
        // The asset landed in another folder: refresh lists/stats anyway.
        if (mismatch) prependImages([]);
        toast.error(`Failed to upload ${item.file.name}: ${message}`);
      } finally {
        controllers.current.delete(item.id);
      }
    },
    [prependImages, updateItem],
  );

  // Scheduler: start queued items while there are free slots.
  useEffect(() => {
    const uploading = queue.filter((item) => item.status === "uploading").length;
    const free = MAX_CONCURRENT_UPLOADS - uploading;
    if (free <= 0) return;
    queue
      .filter(
        (item) => item.status === "queued" && !controllers.current.has(item.id),
      )
      .slice(0, free)
      .forEach((item) => void uploadFile(item));
  }, [queue, uploadFile]);

  // Abort in-flight uploads and release previews when unmounting.
  useEffect(() => {
    const active = controllers.current;
    return () => {
      active.forEach((controller) => controller.abort());
      queueRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  /** Add files to the queue as "pending" — they are not uploaded until uploadAll() is called. */
  const addFiles = useCallback((files) => {
    const items = files.map(createUploadItem);
    setQueue((prev) => [...items, ...prev]);
    const invalid = items.filter((item) => item.status === "invalid");
    if (invalid.length) {
      toast.error(
        invalid.length === 1
          ? `${invalid[0].file.name}: ${invalid[0].errorMessage}`
          : `${invalid.length} files can't be uploaded (see queue)`,
      );
    }
  }, []);

  /** Files rejected by the dropzone (wrong type/size) are shown with the reason. */
  const addRejectedFiles = useCallback(
    (rejections) => addFiles(rejections.map((rejection) => rejection.file)),
    [addFiles],
  );

  const cancelItem = useCallback((id) => {
    controllers.current.get(id)?.abort();
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id && item.status === "queued"
          ? { ...item, status: "cancelled", errorMessage: "Upload cancelled" }
          : item,
      ),
    );
  }, []);

  const removeItem = useCallback((id) => {
    controllers.current.get(id)?.abort();
    setQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((q) => q.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    controllers.current.forEach((controller) => controller.abort());
    setQueue((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }, []);

  const clearFinished = useCallback(() => {
    setQueue((prev) =>
      prev.filter((item) => {
        if (item.status !== "success") return true;
        URL.revokeObjectURL(item.previewUrl);
        return false;
      }),
    );
  }, []);

  const retryItem = useCallback((id) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id &&
        item.retryable &&
        (item.status === "error" || item.status === "cancelled")
          ? { ...item, status: "queued", progress: 0, errorMessage: undefined }
          : item,
      ),
    );
  }, []);

  /** Queue every "pending" item for upload into `targetFolder` (defaults to the hook's folder). */
  const uploadAll = useCallback(
    (targetFolder) => {
      const destination =
        typeof targetFolder === "string" ? targetFolder : folder;
      setQueue((prev) =>
        prev.map((item) =>
          item.status === "pending"
            ? { ...item, status: "queued", folder: destination }
            : item,
        ),
      );
    },
    [folder],
  );

  const pendingCount = queue.filter((item) => item.status === "pending").length;
  const activeCount = queue.filter(
    (item) => item.status === "uploading" || item.status === "queued",
  ).length;
  return {
    queue,
    addFiles,
    addRejectedFiles,
    removeItem,
    cancelItem,
    clearAll,
    clearFinished,
    retryItem,
    uploadAll,
    pendingCount,
    activeCount,
  };
}
