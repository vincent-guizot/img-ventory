import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
export function Thumbnails({ images, activeId }) {
  return (
    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
      {images.map((image) => (
        <Link
          key={image.id}
          to={`/gallery/${image.id}`}
          className={cn(
            "h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-transparent",
            image.id === activeId && "border-primary",
          )}
        >
          <img
            src={image.thumbnailUrl}
            alt={image.fileName}
            className="h-full w-full object-cover"
          />
        </Link>
      ))}
    </div>
  );
}
