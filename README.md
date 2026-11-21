# img-ventory

![img-ventory banner](docs/banner.png)

**Store. Upload. Manage.**

A lightweight Cloudinary image manager built with React 19, JavaScript, and Tailwind CSS. Not Google Drive, not Dropbox — just a beautiful, focused UI for uploading images into per-application folders (e.g. `img-ventory/Aplikasi A`) and browsing, organizing, and managing them.

Uploads go straight from the browser to Cloudinary with an unsigned upload preset. Everything that needs the API Secret (listing, folders, delete, rename, move, tags, stats) runs in small Vercel serverless functions in `api/`.

## Features

- **Home**: upload area with a destination-folder dropdown and an **Add Folder** button, plus the folder list (empty folders included). No all-images gallery.
- **Folders**: one level below the root folder, stored as real Cloudinary folders.
- **Folder gallery**: breadcrumb, upload into the active folder, search, filters (format, tag, favorites), sorting (date, name, size, format), grid/compact view, infinite scroll with cursor pagination.
- **Upload queue**: type/size validation with clear errors, per-file progress, 3 parallel uploads, cancel and retry, check that the file landed in the requested folder.
- **Bulk actions**: download, copy URLs / public IDs, move and delete (with confirmation).
- **Image details**: metadata, copy URL / public ID, download, favorite, tags, rename, move, Cloudinary transformation preview.
- **Storage stats**: real totals per folder from Cloudinary.
- Dark mode.

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
- Vercel serverless functions (`api/`, Node) for the Cloudinary Admin API
- Vitest + Testing Library + jsdom for tests

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
# optional: dynamic | fixed (auto-detected when unset)
CLOUDINARY_FOLDER_MODE=dynamic
```

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_CLOUDINARY_CLOUD_NAME` | browser + server | Cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | browser | Unsigned upload preset |
| `VITE_CLOUDINARY_FOLDER` | browser + server | Root folder (default `img-ventory`); every folder lives one level below it |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | **server only** | Admin API (list, folders, delete, rename, move, tags) |
| `CLOUDINARY_FOLDER_MODE` | server only, optional | `dynamic` or `fixed`; otherwise read from the Admin API `GET /config?settings=true` |

> Create an unsigned upload preset from your Cloudinary dashboard under
> **Settings → Upload → Upload presets → Add upload preset**, and set
> **Signing Mode** to `Unsigned`. This preset (plus the cloud name) is safe
> to expose to the browser — it's used for uploads only.
>
> `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` come from **Settings →
> Access Keys**. These are server-only secrets (no `VITE_` prefix) used by
> the serverless functions in `api/` for every administrative operation
> (list, folders, delete, rename, move, tags, stats) — never expose them to
> the browser.

### Upload preset checklist

Uploads stay **unsigned and go straight from the browser to Cloudinary**. The
app sends the destination as the `folder` parameter (e.g.
`img-ventory/Aplikasi A`) — the only folder parameter an unsigned preset
accepts. For that to work:

- Leave the preset's **Folder / Asset folder** field **empty**. If the preset
  forces a folder, Cloudinary can ignore the requested one. The app checks the
  folder in Cloudinary's upload response and marks the file as **failed** with
  an explanation instead of claiming success (the file exists in Cloudinary in
  that case, so it can't be retried from the queue).
- In **dynamic folder mode**, `folder` is Cloudinary's legacy parameter; it
  places the asset in that asset folder. Enable *Use asset folder as public ID
  prefix* on the preset if you also want the public ID to carry the folder path.
- Restrict **Allowed formats** to `jpg, png, webp, gif` and set a max file
  size of 20 MB on the preset. The browser validates both before uploading,
  but only the preset enforces them on Cloudinary's side.
- Unsigned presets can't restrict *which* folder a caller uploads to: anyone
  holding the cloud name + preset can upload anywhere the preset allows.
  Administrative operations (list, delete, rename, move, tags, folders) are
  restricted server-side to `VITE_CLOUDINARY_FOLDER` and its direct
  sub-folders.

Then run the dev server:

```bash
npm run dev
```

To also exercise the `api/` serverless functions locally (folders, gallery
listing, delete, rename/move, tags, stats), run through the Vercel CLI instead:

```bash
npm run dev:vercel
```

Run the checks:

```bash
npm run lint
npm test
```

Build for production:

```bash
npm run build
npm run preview
```

### Deploying to Vercel

Set the variables from the table above in **Project → Settings → Environment
Variables**. Keep `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` and
`CLOUDINARY_FOLDER_MODE` **without** a `VITE_` prefix so they never reach the
client bundle. `vercel.json` rewrites every non-API route to `index.html` for
client-side routing.

## Tests

`npm test` runs Vitest (`tests/`):

| File | Covers |
| --- | --- |
| `tests/api/folderRules.test.js` | Folder/public ID/tag/name/upload-file validation, root path mapping |
| `tests/api/listQuery.test.js` | Per-folder search expression, filters, sorting, cursor, rejection of injection attempts |
| `tests/api/images.test.js` | List per folder + pagination past 100 images, folder-mode detection, detail, delete / rename / move / tags / favorite, bulk delete & move, root-folder enforcement, Cloudinary failures → 502 |
| `tests/api/folders.test.js` | Folder list (incl. missing root), create, duplicates, invalid names, stats |
| `tests/client/uploadService.test.js` | Upload sends the selected folder with the unsigned preset, no credentials, folder-mismatch detection, cancel, error messages |
| `tests/client/UploadPanel.test.jsx` | Choosing a folder before upload, creating a folder from Home and uploading into it, locked folder, invalid files, cancel/retry, Home has no gallery |
| `tests/client/GalleryPage.test.jsx` | Folder gallery listing, "Load more" by cursor, filter/sort params, empty / unknown folders, bulk delete confirmation |

Cloudinary is never called by the tests: the API tests replace the HTTP
transport (`transport.fetch` in `api/_lib/cloudinary.js`) and the client tests
mock the service module.

## API reference

All endpoints answer JSON errors as `{ "error": "..." }` with `400` (invalid
input), `404` (not found / outside the root), `409` (duplicate folder), `502`
(Cloudinary refused the operation) or `500`.

| Method & path | Body / query | Response |
| --- | --- | --- |
| `GET /api/folders` | — | `{ root, folders: [{ name, path }] }` |
| `POST /api/folders` | `{ name }` | `201 { folder }` |
| `GET /api/images` | `folder` (`""` = root), `q`, `format`, `tag`, `favorite=1`, `sort=date\|name\|size\|format`, `order=asc\|desc`, `limit` (1–100, default 30), `cursor` | `{ images, nextCursor, totalCount, folder }` |
| `GET /api/images?assetId=…` | — | `{ image }` |
| `DELETE /api/images?publicId=…` | — | `{ result, publicId }` |
| `PATCH /api/images` | `{ publicId, action: "rename", name }` / `{ …, action: "move", folder }` / `{ …, action: "tags", tags: [] }` / `{ …, action: "favorite", favorite }` | `{ image, previousPublicId?, previousUrl?, urlChanged?, warning? }` |
| `POST /api/images/bulk` | `{ action: "delete" \| "move", publicIds: [...≤100], folder? }` | `200`/`207` `{ results: [{ publicId, ok, error? }], succeeded, failed }` |
| `GET /api/stats` | — | `{ totalImages, totalBytes, formatCounts, folders: { [name]: { count, bytes } }, truncated }` |

## Project Structure

```
api/
  _lib/             # Server-only helpers: Cloudinary auth/signing, root-folder checks, list query builder, operations
  images/index.js   # GET list (per folder, cursor) / detail, DELETE, PATCH rename|move|tags|favorite
  images/bulk.js    # POST bulk delete / move
  folders/index.js  # GET sub-folders (Cloudinary Folders API), POST create
  stats.js          # GET storage totals per folder
tests/              # Vitest: API handlers (mocked Cloudinary HTTP) + React components
src/
  components/       # Shared UI primitives (Button, Card, Input...) and layout (Sidebar, Navbar)
  features/         # Feature-based modules
    home/            # Home: upload area (folder dropdown + Add Folder) and folder list
    folders/         # Folder hooks, FolderSelect, CreateFolderDialog, FolderList
    gallery/         # Per-folder gallery: search/filter/sort, infinite scroll, bulk actions
    upload/          # Dropzone, upload queue UI, UploadPanel, and the useUpload hook
    image-details/
    storage/
    settings/
  hooks/            # Cross-cutting hooks (useTheme, useDebounce)
  lib/              # Utilities (cn, axios instance, formatters, folderRules shared with api/)
  providers/        # App-level providers (TanStack Query)
  router/           # React Router v7 route tree
  services/         # Cloudinary API integration
```

## Folders and upload flow

- **Home (`/`)** shows the upload area and the folder list only — no image
  gallery. Next to the upload area there's a **destination folder** dropdown
  and an **Add Folder** button; a new folder is created in Cloudinary
  (`POST /api/folders` → Admin API `POST /folders/img-ventory/<name>`) and is
  selected immediately.
- Folders are one level deep: `img-ventory/Aplikasi A`, `img-ventory/Aplikasi B`.
  The list comes from Cloudinary's Folders API, so empty folders are shown.
  Images still sitting directly in `img-ventory` (e.g. uploaded before folders
  existed) appear as an `img-ventory (root)` entry, which is also the default
  upload destination.
- **Folder gallery (`/folders/<name>`, root at `/folders`)**: breadcrumb,
  "Upload here" (locked to the active folder), search (navbar), filters
  (format, tag, favorites), sorting (date, name, size, format), grid/compact
  view, and infinite scroll / "Load more" using Cloudinary's `next_cursor`
  (no 100-image cap). `/gallery` redirects to Home.
- Files are added to a queue as **pending**; nothing is sent until you press
  **Upload N files to <folder>**. The queue validates type/size (invalid files
  are listed with the reason), uploads 3 files at a time with per-file
  progress, and supports cancel (aborts the request) and retry.
- **Bulk selection**: download (up to 20 at a time), copy URLs / public IDs,
  move (with confirmation) and delete (with confirmation). Partial failures are
  reported per item and failed items stay selected.
- **Image details (`/gallery/<assetId>`)**: metadata (folder, public ID…),
  copy URL / public ID, download, favorite, tags, rename, move, and a
  Cloudinary transformation preview with copyable URLs.

### Rename / move and URLs

| Folder mode | Rename | Move |
| --- | --- | --- |
| dynamic | updates `display_name`; public ID and URL unchanged | updates `asset_folder`; public ID and URL unchanged |
| fixed | renames the public ID to `<folder>/<slug>` (URL changes; old URL stops working) and stores the readable name in context `iv_name` | renames the public ID to `<target>/<basename>` (URL changes) |

Both actions ask for confirmation, and the result reports whether the public
ID/URL changed. A Cloudinary error is shown as an error — the UI never reports
success for a failed operation.

### Tags and favorites

Stored on the asset in Cloudinary as tags (favorite = reserved tag
`iv_favorite`, hidden from the tag list), so they persist across devices.

## Real data, not mocks

There's no client-safe way to list Cloudinary assets directly from the browser — the Admin
Search API requires the API Secret, which must never ship to client JS. Instead, `api/images`
is a serverless function that holds the secret server-side and proxies the search request to
Cloudinary on the app's behalf (see `src/features/gallery/hooks/useImages.js` and
`src/services/cloudinary.service.js`). So the folder galleries, Storage stats (`api/stats`), and
sidebar widget all reflect the actual contents of your Cloudinary folders — nothing is hardcoded,
seeded, or read from `localStorage` (only the theme and grid/compact view preference are kept
there).

## Dark mode

Toggle via the sun/moon icon in the top-right of the navbar (or Settings → Appearance). The
preference is stored in `localStorage` and applied via a `dark` class on `<html>`, with `dark:`
variants throughout the component tree.

## Notes

- Uploads call Cloudinary's unsigned upload endpoint directly from the browser — no backend required for uploading.
- Listing, folders, delete, rename, move, tags and stats go through the serverless functions in `api/`, which hold the API Secret server-side.
- Every administrative API validates its input and only touches assets whose folder (as reported by Cloudinary) is `VITE_CLOUDINARY_FOLDER` or a direct sub-folder of it.
- Deliberately excluded per product scope: authentication, analytics/charts, trash/restore, sharing, nested folders, and permissions. Delete is permanent (with confirmation). (Renaming an asset's display name in the Cloudinary console _is_ reflected in the gallery, since the app reads Cloudinary's `display_name` field.)
- Search uses Cloudinary search-expression prefix matching on file/display names (e.g. `hero` matches `hero-banner`), not arbitrary substrings.
- Storage stats page through every folder (up to 100 folders × 10,000 images each); beyond that the page says the totals are partial.
- Bulk download starts up to 20 downloads at a time; browsers may ask for permission to download multiple files.
- Folder rename/delete is not implemented in the app; manage folders that way in the Cloudinary Console.
