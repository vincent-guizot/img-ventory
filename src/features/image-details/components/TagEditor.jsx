import { useState } from "react";
import { Loader2, Plus, Tag, X } from "lucide-react";
import toast from "react-hot-toast";
import { MAX_TAGS, validateTag } from "@/lib/folderRules";
import { useUpdateImage } from "@/features/gallery/hooks/useImages";

/** Edits the image's Cloudinary tags (persisted via /api/images PATCH). */
export function TagEditor({ image }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(null);
  const updateImage = useUpdateImage();

  const save = (tags, successMessage) => {
    updateImage.mutate(
      { image, action: "tags", payload: { tags } },
      {
        onSuccess: () => toast.success(successMessage),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const addTag = (event) => {
    event.preventDefault();
    const check = validateTag(draft);
    if (!check.ok) return setError(check.error);
    if (image.tags.includes(check.value)) return setError("Tag already added");
    if (image.tags.length >= MAX_TAGS) return setError(`At most ${MAX_TAGS} tags`);
    setError(null);
    setDraft("");
    save([...image.tags, check.value], `Tag "${check.value}" added`);
  };

  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        <Tag className="h-3.5 w-3.5" />
        Tags
        {updateImage.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {image.tags.length === 0 && (
          <span className="text-xs text-slate-400">No tags yet</span>
        )}
        {image.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-600 dark:bg-primary-500/10"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              disabled={updateImage.isPending}
              onClick={() =>
                save(image.tags.filter((t) => t !== tag), `Tag "${tag}" removed`)
              }
              className="rounded hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={addTag} className="mt-2 flex gap-2">
        <input
          aria-label="New tag"
          value={draft}
          maxLength={40}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
          placeholder="Add a tag"
          className="h-8 min-w-0 flex-1 rounded-xl border border-border bg-white px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        />
        <button
          type="submit"
          disabled={!draft.trim() || updateImage.isPending}
          className="flex h-8 items-center gap-1 rounded-xl border border-border px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </form>
      {error && (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
