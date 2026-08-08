# img-ventory

**Store. Upload. Manage.**

A lightweight, frontend-only Cloudinary image upload manager built with React 19, JavaScript, and Tailwind CSS. Not Google Drive, not Dropbox — just a beautiful, focused UI for uploading and browsing images via Cloudinary's unsigned upload API.

## Tech Stack

- React 19 + JavaScript (JSX) + Vite
- Tailwind CSS + Shadcn/UI-style primitives
- React Router v7
- TanStack Query
- Axios
- Framer Motion
- React Dropzone
- Lucide React
- React Hot Toast

## Getting Started

```bash
npm install
cp .env.example .env
```

Edit `.env` with your own Cloudinary cloud name and **unsigned** upload preset:

```
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
```

> Create an unsigned upload preset from your Cloudinary dashboard under
> **Settings → Upload → Upload presets → Add upload preset**, and set
> **Signing Mode** to `Unsigned`.

Then run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/       # Shared UI primitives (Button, Card, Input...) and layout (Sidebar, Navbar)
  features/         # Feature-based modules
    gallery/         # Gallery page — also hosts the drag & drop upload area and queue
    upload/          # Dropzone, upload queue UI, and the useUpload hook
    image-details/
    storage/
    settings/
  hooks/            # Cross-cutting hooks (useTheme, useDebounce)
  lib/              # Utilities (cn, axios instance, formatters)
  providers/        # App-level providers (TanStack Query)
  router/           # React Router v7 route tree
  services/         # Cloudinary API integration
```

## Upload flow

There is no separate Upload page — dragging/dropping or browsing for files happens directly at
the top of the Gallery page. Files are added to a queue in a **"pending"** state; nothing is
sent to Cloudinary until you press **"Upload N files."** Successful uploads are prepended to
the gallery grid immediately below.

## Real data, not mocks

Cloudinary's unsigned upload flow has no client-safe "list all images" endpoint, so there's no
way to fetch a full gallery from Cloudinary directly in the browser. Instead, every image
actually uploaded through this app is persisted to `localStorage` (see
`src/features/gallery/hooks/useImages.js`), so the Gallery, Storage stats, and sidebar widget
all reflect real uploads from this browser — nothing is hardcoded or seeded with sample data.

## Dark mode

Toggle via the sun/moon icon in the top-right of the navbar (or Settings → Appearance). The
preference is stored in `localStorage` and applied via a `dark` class on `<html>`, with `dark:`
variants throughout the component tree.

## Notes

- Uploads call Cloudinary's unsigned upload endpoint directly from the browser — no backend required.
- Deliberately excluded per product scope: authentication, analytics/charts, favorites, trash, delete/rename, folders, sharing, and permissions.

