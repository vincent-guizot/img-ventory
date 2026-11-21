import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFolder, fetchFolders } from "@/services/cloudinary.service";

export const FOLDERS_QUERY_KEY = ["folders"];

/** Direct sub-folders of the root folder, read from Cloudinary. */
export function useFolders() {
  return useQuery({
    queryKey: FOLDERS_QUERY_KEY,
    queryFn: fetchFolders,
    staleTime: 30_000,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name) => createFolder(name),
    onSuccess: (folder) => {
      queryClient.setQueryData(FOLDERS_QUERY_KEY, (current) =>
        [...(current ?? []).filter((f) => f.name !== folder.name), folder].sort(
          (a, b) => a.name.localeCompare(b.name),
        ),
      );
      void queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
