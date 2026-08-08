import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCloudinaryImage, fetchCloudinaryImages } from "@/services/cloudinary.service";
export const IMAGES_QUERY_KEY = ["images"];
export function useImages() {
    return useQuery({
        queryKey: IMAGES_QUERY_KEY,
        queryFn: fetchCloudinaryImages,
        staleTime: 30_000,
    });
}
export function useImageById(id) {
    const { data } = useImages();
    return data?.find((image) => image.id === id);
}
/**
 * Prepend freshly uploaded images to the cached gallery list so they show
 * up instantly, without waiting for a full refetch of /api/images.
 */
export function usePrependImages() {
    const queryClient = useQueryClient();
    return (images) => {
        queryClient.setQueryData(IMAGES_QUERY_KEY, (current) => [
            ...images,
            ...(current ?? []),
        ]);
    };
}
/**
 * Deletes an image from Cloudinary (via our own /api/images/:publicId
 * endpoint) and keeps the gallery cache in sync: the image is removed
 * from the cache immediately, then the list is invalidated so it stays
 * consistent with the server.
 */
export function useDeleteImage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (image) => deleteCloudinaryImage(image.publicId),
        onSuccess: (_result, deletedImage) => {
            queryClient.setQueryData(IMAGES_QUERY_KEY, (current) => current?.filter((image) => image.id !== deletedImage.id));
            void queryClient.invalidateQueries({ queryKey: IMAGES_QUERY_KEY });
        },
    });
}
