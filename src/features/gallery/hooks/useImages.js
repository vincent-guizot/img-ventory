import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  bulkImageAction,
  deleteCloudinaryImage,
  fetchCloudinaryImages,
  fetchImageById,
  fetchImagesPage,
  updateCloudinaryImage,
} from "@/services/cloudinary.service";
import { STATS_QUERY_KEY } from "@/features/storage/hooks/useStorageStats";

export const IMAGES_QUERY_KEY = ["images"];

export function folderImagesKey(folder, params = {}) {
  return ["images", "folder", folder ?? "", params];
}

export function imageDetailKey(id) {
  return ["images", "detail", id];
}

/** First page of the root folder (original behaviour, kept for compatibility). */
export function useImages() {
  return useQuery({
    queryKey: IMAGES_QUERY_KEY,
    queryFn: fetchCloudinaryImages,
    staleTime: 30_000,
  });
}

/**
 * Images of one folder ("" = root) with server-side search/filter/sort and
 * cursor pagination (Cloudinary next_cursor), for infinite scroll.
 */
export function useFolderImages(folder, params = {}, options = {}) {
  return useInfiniteQuery({
    queryKey: folderImagesKey(folder, params),
    queryFn: ({ pageParam }) =>
      fetchImagesPage({ ...params, folder, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
    enabled: options.enabled ?? true,
  });
}

export function useImageDetails(id) {
  return useQuery({
    queryKey: imageDetailKey(id),
    queryFn: () => fetchImageById(id),
    enabled: Boolean(id),
    retry: (count, error) => error?.status !== 404 && count < 1,
  });
}

export function useImageById(id) {
  const { data } = useImageDetails(id);
  return data;
}

/** Refetch everything that can show an image or a total. */
export function invalidateImageQueries(queryClient) {
  void queryClient.invalidateQueries({ queryKey: IMAGES_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
}

/**
 * Prepend freshly uploaded images to the cached root list so they show
 * up instantly, then refetch folder lists and stats.
 */
export function usePrependImages() {
  const queryClient = useQueryClient();
  return (images) => {
    queryClient.setQueryData(IMAGES_QUERY_KEY, (current) =>
      current ? [...images, ...current] : current,
    );
    invalidateImageQueries(queryClient);
  };
}

/**
 * Deletes an image from Cloudinary (via our own /api/images endpoint) and
 * keeps caches in sync: the image is removed from the cache immediately,
 * then the lists are invalidated so they stay consistent with the server.
 */
export function useDeleteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (image) => deleteCloudinaryImage(image.publicId),
    onSuccess: (_result, deletedImage) => {
      queryClient.setQueryData(IMAGES_QUERY_KEY, (current) =>
        current?.filter((image) => image.id !== deletedImage.id),
      );
      queryClient.removeQueries({ queryKey: imageDetailKey(deletedImage.id) });
      invalidateImageQueries(queryClient);
    },
  });
}

/** rename / move / tags / favorite for a single image. */
export function useUpdateImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ image, action, payload }) =>
      updateCloudinaryImage(image.publicId, action, payload),
    onSuccess: (result) => {
      if (result?.image) {
        queryClient.setQueryData(imageDetailKey(result.image.id), result.image);
      }
      invalidateImageQueries(queryClient);
    },
  });
}

/** Bulk delete / move. Resolves with per-item results (partial failures included). */
export function useBulkImageAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ action, publicIds, payload }) =>
      bulkImageAction(action, publicIds, payload),
    onSettled: () => invalidateImageQueries(queryClient),
  });
}
