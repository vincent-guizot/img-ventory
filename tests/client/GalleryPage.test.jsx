import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./renderWithProviders";

vi.mock("react-hot-toast", () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() });
  return { default: toast };
});

vi.mock("@/services/cloudinary.service", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchFolders: vi.fn(),
    fetchImagesPage: vi.fn(),
    bulkImageAction: vi.fn(),
    fetchStorageStats: vi.fn(),
  };
});

const service = await import("@/services/cloudinary.service");
const { GalleryPage } = await import("@/features/gallery/pages/GalleryPage");

function image(i, folderName = "Aplikasi A") {
  return {
    id: `asset-${i}`,
    publicId: `img-ventory/${folderName}/img-${i}`,
    fileName: `img-${i}.png`,
    format: "png",
    bytes: 1000 + i,
    width: 10,
    height: 10,
    secureUrl: `https://res.cloudinary.com/x/image/upload/v1/img-${i}.png`,
    thumbnailUrl: `https://res.cloudinary.com/x/image/upload/t/img-${i}.png`,
    folderName,
    tags: [],
    favorite: false,
    createdAt: "2026-01-01T00:00:00Z",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  service.fetchFolders.mockResolvedValue([
    { name: "Aplikasi A", path: "img-ventory/Aplikasi A" },
    { name: "Kosong", path: "img-ventory/Kosong" },
  ]);
  service.fetchStorageStats.mockResolvedValue({ folders: {} });
  service.fetchImagesPage.mockImplementation(async (params) => {
    if (params.folder === "Kosong") {
      return { images: [], nextCursor: null, totalCount: 0 };
    }
    if (!params.cursor) {
      return {
        images: Array.from({ length: 2 }, (_, i) => image(i)),
        nextCursor: "CURSOR-2",
        totalCount: 3,
      };
    }
    return { images: [image(2)], nextCursor: null, totalCount: 3 };
  });
});

const renderFolder = (route, opts) =>
  renderWithProviders(<GalleryPage />, { path: "/folders/:folderName", route, ...opts });

describe("Folder gallery", () => {
  it("lists only the active folder and loads further pages by cursor", async () => {
    const user = userEvent.setup();
    renderFolder("/folders/Aplikasi%20A");
    expect(await screen.findByRole("heading", { name: "Aplikasi A" })).toBeInTheDocument();
    expect(await screen.findAllByTestId("image-card")).toHaveLength(2);
    expect(service.fetchImagesPage).toHaveBeenCalledWith(
      expect.objectContaining({ folder: "Aplikasi A", cursor: undefined, sort: "date", order: "desc" }),
    );

    await user.click(screen.getByRole("button", { name: "Load more" }));
    await waitFor(() => expect(screen.getAllByTestId("image-card")).toHaveLength(3));
    expect(service.fetchImagesPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ folder: "Aplikasi A", cursor: "CURSOR-2" }),
    );
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
    // Breadcrumb back to Home
    expect(screen.getByRole("link", { name: /Home/ })).toHaveAttribute("href", "/");
  });

  it("sends search, filter and sort params to the API", async () => {
    const user = userEvent.setup();
    renderFolder("/folders/Aplikasi%20A", { search: "hero" });
    await screen.findAllByTestId("image-card");
    await user.selectOptions(screen.getByRole("combobox", { name: "Filter by format" }), "png");
    await user.selectOptions(screen.getByRole("combobox", { name: "Sort by" }), "size");
    await user.click(screen.getByRole("button", { name: "Favorites" }));
    await waitFor(() =>
      expect(service.fetchImagesPage).toHaveBeenLastCalledWith(
        expect.objectContaining({
          folder: "Aplikasi A",
          q: "hero",
          format: "png",
          sort: "size",
          order: "asc",
          favorite: "1",
        }),
      ),
    );
  });

  it("shows empty folders and unknown folders distinctly", async () => {
    renderFolder("/folders/Kosong");
    expect(await screen.findByText("This folder is empty")).toBeInTheDocument();
  });

  it("shows not found for folders that don't exist", async () => {
    renderFolder("/folders/Nope");
    expect(await screen.findByText("Folder not found")).toBeInTheDocument();
    expect(service.fetchImagesPage).not.toHaveBeenCalled();
  });

  it("bulk-deletes the selection only after confirmation", async () => {
    const user = userEvent.setup();
    service.bulkImageAction.mockResolvedValue({
      results: [
        { publicId: "img-ventory/Aplikasi A/img-0", ok: true },
        { publicId: "img-ventory/Aplikasi A/img-1", ok: false, error: "boom" },
      ],
      succeeded: 1,
      failed: 1,
    });
    renderFolder("/folders/Aplikasi%20A");
    await screen.findAllByTestId("image-card");
    await user.click(screen.getByRole("checkbox", { name: "Select img-0.png" }));
    await user.click(screen.getByRole("checkbox", { name: "Select img-1.png" }));
    const toolbar = screen.getByRole("toolbar", { name: "Bulk actions" });
    expect(toolbar).toHaveTextContent("2 selected");

    await user.click(within(toolbar).getByRole("button", { name: "Delete" }));
    expect(service.bulkImageAction).not.toHaveBeenCalled();
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    await waitFor(() =>
      expect(service.bulkImageAction).toHaveBeenCalledWith(
        "delete",
        ["img-ventory/Aplikasi A/img-0", "img-ventory/Aplikasi A/img-1"],
        undefined,
      ),
    );
    // The failed item stays selected so it can be retried.
    await waitFor(() =>
      expect(screen.getByRole("toolbar", { name: "Bulk actions" })).toHaveTextContent("1 selected"),
    );
  });
});
