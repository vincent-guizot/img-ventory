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
    createFolder: vi.fn(),
    uploadToCloudinary: vi.fn(),
    fetchStorageStats: vi.fn(),
  };
});

const service = await import("@/services/cloudinary.service");
const { UploadPanel } = await import("@/features/upload/components/UploadPanel");
const { HomePage } = await import("@/features/home/pages/HomePage");

const png = (name) => new File(["data"], name, { type: "image/png" });

beforeEach(() => {
  vi.clearAllMocks();
  service.fetchFolders.mockResolvedValue([
    { name: "Aplikasi A", path: "img-ventory/Aplikasi A" },
    { name: "Aplikasi B", path: "img-ventory/Aplikasi B" },
  ]);
  service.fetchStorageStats.mockResolvedValue({
    totalImages: 0,
    totalBytes: 0,
    formatCounts: {},
    folders: { "": { count: 0, bytes: 0 } },
    truncated: false,
  });
  service.uploadToCloudinary.mockImplementation(async (file, _p, { folder }) => ({
    id: file.name,
    publicId: `img-ventory/${folder}/${file.name}`,
    fileName: file.name,
  }));
});

describe("UploadPanel folder selection", () => {
  it("uploads into the folder chosen in the dropdown", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UploadPanel />);
    const select = await screen.findByRole("combobox", { name: "Destination folder" });
    await screen.findByRole("option", { name: "Aplikasi B" });
    await user.selectOptions(select, "Aplikasi B");

    await user.upload(screen.getByTestId("upload-input"), png("a.png"));
    await user.click(await screen.findByRole("button", { name: /Upload 1 file to Aplikasi B/ }));

    await waitFor(() => expect(service.uploadToCloudinary).toHaveBeenCalledTimes(1));
    const [file, , options] = service.uploadToCloudinary.mock.calls[0];
    expect(file.name).toBe("a.png");
    expect(options.folder).toBe("Aplikasi B");
    expect(options.signal).toBeInstanceOf(AbortSignal);
    await waitFor(() =>
      expect(screen.getByTestId("upload-queue-item")).toHaveAttribute("data-status", "success"),
    );
  });

  it("creates a folder without leaving the page and selects it as destination", async () => {
    const user = userEvent.setup();
    service.createFolder.mockImplementation(async (name) => ({
      name,
      path: `img-ventory/${name}`,
    }));
    renderWithProviders(<UploadPanel />);
    await screen.findByRole("option", { name: "Aplikasi A" });

    await user.click(screen.getByRole("button", { name: "Add Folder" }));
    const dialog = await screen.findByRole("dialog");
    const input = within(dialog).getByLabelText("Folder name");
    await user.type(input, "a/b");
    await user.click(within(dialog).getByRole("button", { name: "Create folder" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent(/Nested folders/);
    expect(service.createFolder).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, "Aplikasi C");
    await user.click(within(dialog).getByRole("button", { name: "Create folder" }));
    await waitFor(() => expect(service.createFolder).toHaveBeenCalledWith("Aplikasi C"));
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Destination folder" })).toHaveValue("Aplikasi C"),
    );

    await user.upload(screen.getByTestId("upload-input"), png("b.png"));
    await user.click(screen.getByRole("button", { name: /Upload 1 file to Aplikasi C/ }));
    await waitFor(() =>
      expect(service.uploadToCloudinary.mock.calls[0][2].folder).toBe("Aplikasi C"),
    );
  });

  it("locks uploads to the active folder on folder pages", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UploadPanel lockedFolder="Aplikasi A" />);
    expect(screen.queryByRole("combobox", { name: "Destination folder" })).toBeNull();
    await user.upload(screen.getByTestId("upload-input"), png("c.png"));
    await user.click(screen.getByRole("button", { name: /Upload 1 file to Aplikasi A/ }));
    await waitFor(() =>
      expect(service.uploadToCloudinary.mock.calls[0][2].folder).toBe("Aplikasi A"),
    );
  });

  it("shows invalid files with a reason and never uploads them", async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderWithProviders(<UploadPanel />);
    await user.upload(
      screen.getByTestId("upload-input"),
      new File(["%PDF"], "doc.pdf", { type: "application/pdf" }),
    );
    const item = await screen.findByTestId("upload-queue-item");
    expect(item).toHaveAttribute("data-status", "invalid");
    expect(within(item).getByRole("alert")).toHaveTextContent(/Unsupported type/);
    expect(screen.queryByRole("button", { name: /Upload \d+ file/ })).toBeNull();
  });

  it("cancels an in-flight upload and allows retry", async () => {
    const user = userEvent.setup();
    service.uploadToCloudinary.mockImplementationOnce(
      (_file, _p, { signal }) =>
        new Promise((_, reject) =>
          signal.addEventListener("abort", () =>
            reject(new service.UploadCancelledError()),
          ),
        ),
    );
    renderWithProviders(<UploadPanel lockedFolder="Aplikasi A" />);
    await user.upload(screen.getByTestId("upload-input"), png("d.png"));
    await user.click(screen.getByRole("button", { name: /Upload 1 file/ }));
    await user.click(await screen.findByRole("button", { name: "Cancel upload of d.png" }));
    const item = screen.getByTestId("upload-queue-item");
    await waitFor(() => expect(item).toHaveAttribute("data-status", "cancelled"));

    await user.click(screen.getByRole("button", { name: "Retry upload" }));
    await waitFor(() => expect(item).toHaveAttribute("data-status", "success"));
    expect(service.uploadToCloudinary).toHaveBeenCalledTimes(2);
  });
});

describe("HomePage", () => {
  it("shows the upload area and folders (including empty ones) but no image gallery", async () => {
    renderWithProviders(<HomePage />);
    expect(await screen.findByRole("link", { name: /Aplikasi A/ })).toHaveAttribute(
      "href",
      "/folders/Aplikasi%20A",
    );
    expect(screen.getByRole("link", { name: /Aplikasi B/ })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Destination folder" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add Folder" })).toBeTruthy();
    expect(screen.queryByTestId("image-card")).toBeNull();
  });
});
