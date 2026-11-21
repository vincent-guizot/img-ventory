import { useQuery } from "@tanstack/react-query";
import { fetchStorageStats } from "@/services/cloudinary.service";

export const STATS_QUERY_KEY = ["stats"];

/** Real totals for the root folder and every sub-folder (from /api/stats). */
export function useStorageStats() {
  return useQuery({
    queryKey: STATS_QUERY_KEY,
    queryFn: fetchStorageStats,
    staleTime: 30_000,
  });
}
