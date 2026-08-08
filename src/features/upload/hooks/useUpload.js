import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "@/services/cloudinary.service";
import { usePrependImages } from "@/features/gallery/hooks/useImages";
function createUploadItem(file) {
    return {
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: "pending",
    };
}
export function useUpload() {
    const [queue, setQueue] = useState([]);
    const prependImages = usePrependImages();
    const updateItem = useCallback((id, patch) => {
        setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }, []);
    const uploadFile = useCallback(async (item) => {
        updateItem(item.id, { status: "uploading", progress: 0 });
        try {
            const image = await uploadToCloudinary(item.file, (progress) => {
                updateItem(item.id, { progress });
            });
            updateItem(item.id, { status: "success", progress: 100 });
            prependImages([image]);
            toast.success(`${item.file.name} uploaded`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Upload failed";
            updateItem(item.id, { status: "error", errorMessage: message });
            toast.error(`Failed to upload ${item.file.name}`);
        }
    }, [prependImages, updateItem]);
    /** Add files to the queue as "pending" — they are not uploaded until uploadAll() is called. */
    const addFiles = useCallback((files) => {
        const items = files.map(createUploadItem);
        setQueue((prev) => [...items, ...prev]);
    }, []);
    const removeItem = useCallback((id) => {
        setQueue((prev) => prev.filter((item) => item.id !== id));
    }, []);
    const clearAll = useCallback(() => setQueue([]), []);
    const retryItem = useCallback((id) => {
        const item = queue.find((q) => q.id === id);
        if (item)
            void uploadFile(item);
    }, [queue, uploadFile]);
    /** Upload every item currently in "pending" status. */
    const uploadAll = useCallback(() => {
        queue.filter((item) => item.status === "pending").forEach((item) => void uploadFile(item));
    }, [queue, uploadFile]);
    const pendingCount = queue.filter((item) => item.status === "pending").length;
    return { queue, addFiles, removeItem, clearAll, retryItem, uploadAll, pendingCount };
}
