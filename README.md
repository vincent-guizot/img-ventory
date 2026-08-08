# img-ventory

![img-ventory banner](docs/banner.png)

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

Edit `.env` with your own Cloudinary credentials:

```
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
VITE_CLOUDINARY_FOLDER=img-ventory
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> Create an unsigned upload preset from your Cloudinary dashboard under
> **Settings → Upload → Upload presets → Add upload preset**, and set
> **Signing Mode** to `Unsigned`. This preset (plus the cloud name) is safe
> to expose to the browser — it's used for uploads only.
>
> `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` come from **Settings →
> Access Keys**. These are server-only secrets (no `VITE_` prefix) used by
> the serverless functions in `api/` to list and delete images — never
> expose them to the browser.

Then run the dev server:

```bash
npm run dev
```

To also exercise the `api/` serverless functions locally (gallery listing
and delete), run through the Vercel CLI instead:

```bash
npm run dev:vercel
```

Build for production:

```bash
npm run build
npm run preview
```

## Project Structure

```
api/
  _lib/             # Shared Cloudinary auth/signing helpers (server-only)
  images/           # Serverless functions: list (GET) and delete (DELETE) via Cloudinary Admin API
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

There's no client-safe way to list Cloudinary assets directly from the browser — the Admin
Search API requires the API Secret, which must never ship to client JS. Instead, `api/images`
is a serverless function that holds the secret server-side and proxies the search request to
Cloudinary on the app's behalf (see `src/features/gallery/hooks/useImages.js` and
`src/services/cloudinary.service.js`). So the Gallery, Storage stats, and sidebar widget all
reflect the actual contents of your Cloudinary folder — nothing is hardcoded, seeded, or read
from `localStorage`.

## Dark mode

Toggle via the sun/moon icon in the top-right of the navbar (or Settings → Appearance). The
preference is stored in `localStorage` and applied via a `dark` class on `<html>`, with `dark:`
variants throughout the component tree.

## Notes

- Uploads call Cloudinary's unsigned upload endpoint directly from the browser — no backend required for uploading.
- Listing and deleting images go through the serverless functions in `api/`, which hold the API Secret server-side.
- Deliberately excluded per product scope: authentication, analytics/charts, favorites, trash, rename, folders, sharing, and permissions. (Renaming an asset's display name in the Cloudinary console _is_ reflected in the gallery, since the app reads Cloudinary's `display_name` field.)
