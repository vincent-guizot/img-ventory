import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { GalleryPage } from "@/features/gallery/pages/GalleryPage";
import { UploadPage } from "@/features/upload/pages/UploadPage";
import { ImageDetailsPage } from "@/features/image-details/pages/ImageDetailsPage";
import { StoragePage } from "@/features/storage/pages/StoragePage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
export const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { index: true, element: <Navigate to="/gallery" replace/> },
            { path: "gallery", element: <GalleryPage /> },
            { path: "gallery/:id", element: <ImageDetailsPage /> },
            { path: "upload", element: <UploadPage /> },
            { path: "storage", element: <StoragePage /> },
            { path: "settings", element: <SettingsPage /> },
            { path: "*", element: <Navigate to="/gallery" replace/> },
        ],
    },
]);
