import {
  Cloud,
  Folder,
  UploadCloud,
  FileImage,
  HardDrive,
  Image as ImageIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InfoRow } from "@/components/shared/InfoRow";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cloudinaryConfig } from "@/services/cloudinary.service";
import { formatBytes } from "@/lib/utils";
import { useStorageStats } from "../hooks/useStorageStats";
import { useFolders } from "@/features/folders/hooks/useFolders";
import { StorageStatCard } from "../components/StorageStatCard";
export function StoragePage() {
  const { data: stats, isLoading, error } = useStorageStats();
  const { data: folders = [] } = useFolders();
  const imageCount = stats?.totalImages ?? 0;
  const totalBytes = stats?.totalBytes ?? 0;
  const formatCounts = stats?.formatCounts ?? {};
  const topFormat = Object.entries(formatCounts).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];
  return (
    <div className="space-y-6 pt-1">
      <PageHeader
        title="Storage"
        description="Overview of images you've uploaded through this app."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StorageStatCard
          icon={ImageIcon}
          label="Total Images"
          value={isLoading ? "…" : String(imageCount)}
          hint="uploaded so far"
        />
        <StorageStatCard
          icon={HardDrive}
          label="Total Size"
          value={isLoading ? "…" : formatBytes(totalBytes)}
          hint="across all uploads"
        />
        <StorageStatCard
          icon={FileImage}
          label="Most Common Format"
          value={topFormat ? topFormat.toUpperCase() : "—"}
          hint={
            topFormat
              ? `${formatCounts[topFormat]} image${formatCounts[topFormat] === 1 ? "" : "s"}`
              : "No uploads yet"
          }
        />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border dark:border-slate-800 px-6 py-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Cloudinary Configuration
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Your Cloudinary account details.
          </p>
        </div>
        <div>
          <InfoRow
            icon={Cloud}
            title="Cloud Name"
            description="Your Cloudinary cloud name."
            action={
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {cloudinaryConfig.cloudName}
              </Badge>
            }
          />
          <InfoRow
            icon={Folder}
            title="Folder"
            description={`Root folder for all uploads (${folders.length} sub-folder${folders.length === 1 ? "" : "s"}).`}
            action={
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {cloudinaryConfig.folder}/
              </Badge>
            }
          />
          <InfoRow
            icon={UploadCloud}
            title="Upload Preset"
            description="Your unsigned upload preset."
            action={
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {cloudinaryConfig.uploadPreset}
              </Badge>
            }
          />
          <InfoRow
            icon={FileImage}
            title="Supported Formats"
            description="Accepted image formats for upload."
            action={<Badge>JPG · PNG · WEBP · GIF</Badge>}
          />
        </div>
      </Card>

      {error && (
        <p className="text-xs text-red-500" role="alert">
          Couldn't load storage stats: {error.message}
        </p>
      )}
      {stats?.truncated && (
        <p className="text-xs text-amber-600" role="status">
          Totals are partial: the folder or page limit for statistics was reached.
        </p>
      )}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Note: these stats cover every image in the {cloudinaryConfig.folder}{" "}
        folder and its sub-folders, read server-side from Cloudinary. Account-wide
        storage quota isn't shown here.
      </p>
    </div>
  );
}
