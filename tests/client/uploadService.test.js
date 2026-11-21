import { afterEach, describe, expect, it, vi } from "vitest";
import { httpClient } from "@/lib/axios";
import {
  UploadCancelledError,
  UploadFolderMismatchError,
  uploadToCloudinary,
} from "@/services/cloudinary.service";

const file = new File(["x"], "photo.png", { type: "image/png" });

function cloudinaryResponse(overrides = {}) {
  return {
    data: {
      asset_id: "abc",
      public_id: "img-ventory/Aplikasi A/photo_x1",
      asset_folder: "img-ventory/Aplikasi A",
      display_name: "photo",
      format: "png",
      bytes: 1,
      width: 1,
      height: 1,
      secure_url: "https://res.cloudinary.com/x/image/upload/v1/photo.png",
      created_at: "2026-01-01T00:00:00Z",
      ...overrides,
    },
  };
}

afterEach(() => vi.restoreAllMocks());

describe("uploadToCloudinary", () => {
  it("sends the selected folder under the root with the unsigned preset", async () => {
    const post = vi.spyOn(httpClient, "post").mockResolvedValue(cloudinaryResponse());
    const image = await uploadToCloudinary(file, undefined, { folder: "Aplikasi A" });
    const [url, form] = post.mock.calls[0];
    expect(url).toBe("https://api.cloudinary.com/v1_1/test-cloud/image/upload");
    expect(form.get("folder")).toBe("img-ventory/Aplikasi A");
    expect(form.get("upload_preset")).toBe("test_preset");
    // No credentials ever leave the browser.
    expect(form.has("api_key")).toBe(false);
    expect(form.has("signature")).toBe(false);
    expect(image.folder).toBe("img-ventory/Aplikasi A");
  });

  it("keeps the original behaviour (root folder) when no folder is given", async () => {
    const post = vi.spyOn(httpClient, "post").mockResolvedValue(
      cloudinaryResponse({ public_id: "img-ventory/p", asset_folder: "img-ventory" }),
    );
    await uploadToCloudinary(file, () => {});
    expect(post.mock.calls[0][1].get("folder")).toBe("img-ventory");
  });

  it("rejects invalid folder names before uploading", async () => {
    const post = vi.spyOn(httpClient, "post");
    await expect(uploadToCloudinary(file, undefined, { folder: "../x" })).rejects.toThrow();
    expect(post).not.toHaveBeenCalled();
  });

  it("fails loudly when the preset stored the asset in another folder", async () => {
    vi.spyOn(httpClient, "post").mockResolvedValue(
      cloudinaryResponse({ asset_folder: "preset-folder" }),
    );
    await expect(
      uploadToCloudinary(file, undefined, { folder: "Aplikasi A" }),
    ).rejects.toBeInstanceOf(UploadFolderMismatchError);
  });

  it("verifies fixed-mode uploads by public ID prefix", async () => {
    vi.spyOn(httpClient, "post").mockResolvedValue(
      cloudinaryResponse({ asset_folder: undefined, public_id: "img-ventory/Aplikasi A/p" }),
    );
    await expect(
      uploadToCloudinary(file, undefined, { folder: "Aplikasi A" }),
    ).resolves.toMatchObject({ publicId: "img-ventory/Aplikasi A/p" });
  });

  it("maps cancellation and Cloudinary error messages", async () => {
    const controller = new AbortController();
    vi.spyOn(httpClient, "post").mockImplementation((_url, _form, config) => {
      expect(config.signal).toBe(controller.signal);
      const error = new Error("canceled");
      error.__CANCEL__ = true;
      return Promise.reject(error);
    });
    await expect(
      uploadToCloudinary(file, undefined, { signal: controller.signal }),
    ).rejects.toBeInstanceOf(UploadCancelledError);

    vi.spyOn(httpClient, "post").mockRejectedValue({
      response: { data: { error: { message: "Upload preset not found" } } },
    });
    await expect(uploadToCloudinary(file)).rejects.toThrow("Upload preset not found");
  });
});
