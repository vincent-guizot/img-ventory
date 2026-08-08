import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home, Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useImages } from "@/features/gallery/hooks/useImages";
import { ImagePreview } from "../components/ImagePreview";
import { Thumbnails } from "../components/Thumbnails";
import { MetadataCard } from "../components/MetadataCard";
export function ImageDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: images = [], isLoading } = useImages();
    const index = images.findIndex((image) => image.id === id);
    const image = index >= 0 ? images[index] : undefined;
    const prev = images[index - 1];
    const next = images[index + 1];
    if (isLoading) {
        return (<div className="grid grid-cols-1 gap-6 pt-1 lg:grid-cols-[1fr_360px]">
        <Skeleton className="aspect-[16/10] rounded-2xl"/>
        <Skeleton className="h-80 rounded-2xl"/>
      </div>);
    }
    if (!image) {
        return (<EmptyState icon={ImageIcon} title="Image not found" description="This image may have been removed or the link is incorrect." action={<Button asChild>
            <Link to="/gallery">Back to Gallery</Link>
          </Button>}/>);
    }
    return (<div className="space-y-6 pt-1">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500">
          <Link to="/gallery" className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-400">
            <Home className="h-3.5 w-3.5"/>
          </Link>
          <ChevronRight className="h-3.5 w-3.5"/>
          <Link to="/gallery" className="hover:text-slate-600 dark:hover:text-slate-400">
            Gallery
          </Link>
          <ChevronRight className="h-3.5 w-3.5"/>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Image Details</span>
        </nav>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled={!prev} onClick={() => prev && navigate(`/gallery/${prev.id}`)}>
            <ChevronLeft className="h-3.5 w-3.5"/>
            Previous
          </Button>
          <Button variant="secondary" size="sm" disabled={!next} onClick={() => next && navigate(`/gallery/${next.id}`)}>
            Next
            <ChevronRight className="h-3.5 w-3.5"/>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <ImagePreview image={image}/>
          <Thumbnails images={images.slice(0, 10)} activeId={image.id}/>
        </div>
        <MetadataCard image={image}/>
      </div>
    </div>);
}
