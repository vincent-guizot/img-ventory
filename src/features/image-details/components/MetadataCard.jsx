import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Ruler,
  HardDrive,
  CalendarDays,
  User,
  Copy,
  Check,
  Download,
  Trash2,
  Loader2,
  Folder,
  Hash,
  Pencil,
  FolderInput,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  useDeleteImage,
  useUpdateImage,
} from "@/features/gallery/hooks/useImages";
import { MoveDialog } from "@/features/gallery/components/MoveDialog";
import { rootFolderLabel } from "@/features/folders/components/FolderSelect";
import { formatBytes, formatDate, cn } from "@/lib/utils";
import { copyText } from "@/lib/browser";
import { downloadUrl } from "@/lib/cloudinaryUrl";
import { folderRoute } from "@/lib/routes";
import { RenameDialog } from "./RenameDialog";
import { TagEditor } from "./TagEditor";
const INFO_ROWS = (image) => [
  { icon: FileText, label: "File Name", value: image.fileName },
  {
    icon: FileText,
    label: "File Type",
    value: image.mimeType,
    badge: image.format.toUpperCase(),
  },
  {
    icon: HardDrive,
    label: "File Size",
    value: `${formatBytes(image.bytes)} (${image.bytes.toLocaleString()} bytes)`,
  },
  {
    icon: Ruler,
    label: "Dimensions",
    value: `${image.width} × ${image.height} px`,
  },
  {
    icon: Folder,
    label: "Folder",
    value:
      image.folderName === "" ? rootFolderLabel() : (image.folderName ?? image.folder ?? "—"),
  },
  { icon: Hash, label: "Public ID", value: image.publicId },
  { icon: User, label: "Uploaded By", value: image.uploadedBy },
];
export function MetadataCard({ image, onMoved }) {
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const navigate = useNavigate();
  const deleteImage = useDeleteImage();
  const updateImage = useUpdateImage();
  const handleCopy = async () => {
    try {
      await copyText(image.secureUrl);
      setCopied(true);
      toast.success("Secure URL copied");
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleCopyPublicId = async () => {
    try {
      await copyText(image.publicId);
      toast.success("Public ID copied");
    } catch (error) {
      toast.error(error.message);
    }
  };
  const reportUrlChange = (result) => {
    if (result.urlChanged) {
      toast.success(
        `Public ID changed to "${result.image.publicId}". The old URL no longer works.`,
        { duration: 6000 },
      );
    }
    if (result.warning) toast.error(result.warning);
  };
  const handleRename = (name) => {
    updateImage.mutate(
      { image, action: "rename", payload: { name } },
      {
        onSuccess: (result) => {
          toast.success(`Renamed to "${result.image.fileName}"`);
          reportUrlChange(result);
          setRenameOpen(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };
  const handleMove = (folder) => {
    updateImage.mutate(
      { image, action: "move", payload: { folder } },
      {
        onSuccess: (result) => {
          toast.success(`Moved to ${folder || rootFolderLabel()}`);
          reportUrlChange(result);
          setMoveOpen(false);
          onMoved?.(result.image);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };
  const toggleFavorite = () => {
    updateImage.mutate(
      { image, action: "favorite", payload: { favorite: !image.favorite } },
      { onError: (error) => toast.error(error.message) },
    );
  };
  const handleConfirmDelete = () => {
    deleteImage.mutate(image, {
      onSuccess: () => {
        toast.success(`${image.fileName} deleted`);
        navigate(
          typeof image.folderName === "string"
            ? folderRoute(image.folderName)
            : "/",
        );
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to delete ${image.fileName}`,
        );
      },
    });
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-lg break-words">
            {image.fileName}
          </CardTitle>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            Uploaded {formatDate(image.createdAt)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9"
          onClick={toggleFavorite}
          disabled={updateImage.isPending}
          aria-pressed={image.favorite}
          aria-label={image.favorite ? "Remove from favorites" : "Add to favorites"}
          title={image.favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={cn("h-4 w-4", image.favorite && "fill-amber-400 text-amber-400")}
          />
        </Button>
      </CardHeader>

      <div className="flex gap-2 px-6 pb-4">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => setRenameOpen(true)}
          disabled={updateImage.isPending}
        >
          <Pencil className="h-3.5 w-3.5" />
          Rename
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => setMoveOpen(true)}
          disabled={updateImage.isPending}
        >
          <FolderInput className="h-3.5 w-3.5" />
          Move
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleCopyPublicId}
        >
          <Hash className="h-3.5 w-3.5" />
          Copy ID
        </Button>
      </div>

      <div className="px-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          File Information
        </p>
        <dl className="divide-y divide-border dark:divide-slate-800 rounded-xl border border-border dark:border-slate-800">
          {INFO_ROWS(image).map(({ icon: Icon, label, value, badge }) => (
            <div
              key={label}
              className="flex items-start justify-between gap-3 px-4 py-3"
            >
              <dt className="flex shrink-0 items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                {label}
              </dt>
              <dd className="flex min-w-0 items-center gap-2 text-right text-sm font-semibold text-slate-800 dark:text-slate-200">
                <span className="min-w-0 break-words">{value}</span>
                {badge && <Badge>{badge}</Badge>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="px-6 pt-5">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Cloudinary
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-1.5">
          <input
            readOnly
            value={image.secureUrl}
            className="min-w-0 flex-1 truncate bg-transparent px-2.5 text-xs text-slate-500 dark:text-slate-400 focus:outline-none"
          />
          <Button size="sm" onClick={handleCopy} className="shrink-0">
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="px-6 pt-5">
        <TagEditor image={image} />
      </div>

      <div className="flex gap-3 px-6 py-6">
        <Button asChild className="flex-1">
          <a
            href={downloadUrl(image.secureUrl)}
            download={image.fileName}
            rel="noreferrer"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          disabled={deleteImage.isPending}
          onClick={() => setConfirmOpen(true)}
        >
          {deleteImage.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Delete
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this image?"
        description={`"${image.fileName}" will be permanently removed from Cloudinary. This can't be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        image={image}
        isPending={updateImage.isPending}
        onConfirm={handleRename}
      />
      <MoveDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        count={1}
        currentFolder={image.folderName}
        isPending={updateImage.isPending}
        onConfirm={handleMove}
      />
    </Card>
  );
}
