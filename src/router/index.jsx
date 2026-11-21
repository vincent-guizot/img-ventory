import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { HomePage } from "@/features/home/pages/HomePage";
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
            { index: true, element: <HomePage /> },
            // Home lists folders; the old all-images gallery URL now lands there.
            { path: "gallery", element: <Navigate to="/" replace/> },
            { path: "folders", element: <GalleryPage /> },
            { path: "folders/:folderName", element: <GalleryPage /> },
            { path: "gallery/:id", element: <ImageDetailsPage /> },
            { path: "upload", element: <UploadPage /> },
            { path: "storage", element: <StoragePage /> },
            { path: "settings", element: <SettingsPage /> },
            { path: "*", element: <Navigate to="/" replace/> },
        ],
    },
]);
