import { useState } from "react";
import { Check, Copy, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TRANSFORMATION_PRESETS, withTransformation } from "@/lib/cloudinaryUrl";
import { copyText } from "@/lib/browser";

/** Preview Cloudinary on-the-fly transformations and copy their URLs. */
export function TransformationCard({ image }) {
  const [presetId, setPresetId] = useState("auto");
  const [copied, setCopied] = useState(false);
  const preset =
    TRANSFORMATION_PRESETS.find((p) => p.id === presetId) ??
    TRANSFORMATION_PRESETS[0];
  const url = withTransformation(image.secureUrl, preset.transformation);

  const handleCopy = async () => {
    try {
      await copyText(url);
      setCopied(true);
      toast.success("Transformation URL copied");
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          <Wand2 className="h-3.5 w-3.5" />
          Transformation preview
        </p>
        <select
          aria-label="Transformation"
          value={presetId}
          onChange={(e) => setPresetId(e.target.value)}
          className="h-8 rounded-xl border border-border bg-white px-2.5 text-xs font-semibold text-slate-700 focus:border-primary focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          {TRANSFORMATION_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
        <img
          key={url}
          src={url}
          alt={`${image.fileName} (${preset.label})`}
          loading="lazy"
          className="max-h-64 object-contain"
        />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-800">
        <input
          readOnly
          aria-label="Transformation URL"
          value={url}
          className="min-w-0 flex-1 truncate bg-transparent px-2.5 text-xs text-slate-500 focus:outline-none dark:text-slate-400"
        />
        <Button size="sm" onClick={handleCopy} className="shrink-0">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </Card>
  );
}
