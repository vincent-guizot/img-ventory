// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  folderToPath,
  pathToFolder,
  slugifyPublicIdSegment,
  validateDisplayName,
  validateFolderName,
  validateFolderSelector,
  validatePublicId,
  validateTags,
  validateUploadFile,
} from "../../src/lib/folderRules.js";

describe("folder name validation", () => {
  it.each(["Aplikasi A", "Aplikasi-B", "app_2", "Promo 2026.v1", "Gambar Ünïcode"])(
    "accepts %s",
    (name) => expect(validateFolderName(name)).toEqual({ ok: true, value: name }),
  );

  it("trims surrounding whitespace", () => {
    expect(validateFolderName("  Aplikasi A  ")).toEqual({ ok: true, value: "Aplikasi A" });
  });

  it.each([
    ["", "required"],
    ["a/b", "Nested"],
    ["..", ""],
    ["../etc", ""],
    ["x\\y", "Nested"],
    [".hidden", ""],
    ["trailing.", ""],
    ['quo"te', ""],
    ["a".repeat(65), "at most"],
    [123, "required"],
  ])("rejects %j", (name, message) => {
    const result = validateFolderName(name);
    expect(result.ok).toBe(false);
    expect(result.error).toContain(message);
  });

  it("treats empty selector as the root folder", () => {
    expect(validateFolderSelector("")).toEqual({ ok: true, value: "" });
    expect(validateFolderSelector(undefined)).toEqual({ ok: true, value: "" });
    expect(validateFolderSelector("a/b").ok).toBe(false);
  });
});

describe("path mapping", () => {
  it("maps folder names to Cloudinary paths and back", () => {
    expect(folderToPath("img-ventory", "")).toBe("img-ventory");
    expect(folderToPath("img-ventory", "Aplikasi A")).toBe("img-ventory/Aplikasi A");
    expect(pathToFolder("img-ventory", "img-ventory")).toBe("");
    expect(pathToFolder("img-ventory", "img-ventory/Aplikasi A")).toBe("Aplikasi A");
  });

  it("returns null outside the root or for nested paths", () => {
    expect(pathToFolder("img-ventory", "other")).toBeNull();
    expect(pathToFolder("img-ventory", "img-ventory-evil/x")).toBeNull();
    expect(pathToFolder("img-ventory", "img-ventory/a/b")).toBeNull();
    expect(pathToFolder("img-ventory", "")).toBeNull();
  });
});

describe("public ID / names / tags", () => {
  it("validates public IDs", () => {
    expect(validatePublicId("img-ventory/Aplikasi A/x").ok).toBe(true);
    for (const bad of ["", "../x", "a//b", "/a", 'a"b', "a\\b", "a\nb", "x/", 42]) {
      expect(validatePublicId(bad).ok).toBe(false);
    }
  });

  it("validates display names and slugs", () => {
    expect(validateDisplayName(" Hero banner ").value).toBe("Hero banner");
    expect(validateDisplayName("a/b").ok).toBe(false);
    expect(slugifyPublicIdSegment("Hero Banner (v2).png")).toBe("Hero-Banner-v2");
  });

  it("validates tags, dedupes and reserves the favorite tag", () => {
    expect(validateTags(["a", "a", "b"])).toEqual({ ok: true, value: ["a", "b"] });
    expect(validateTags(["iv_favorite"]).ok).toBe(false);
    expect(validateTags(["a,b"]).ok).toBe(false);
    expect(validateTags("a").ok).toBe(false);
    expect(validateTags(Array.from({ length: 21 }, (_, i) => `t${i}`)).ok).toBe(false);
  });

  it("validates upload files by type and size", () => {
    expect(validateUploadFile({ name: "a.png", type: "image/png", size: 10 }).ok).toBe(true);
    expect(validateUploadFile({ name: "a.pdf", type: "application/pdf", size: 10 }).error).toMatch(/Unsupported/);
    expect(validateUploadFile({ name: "a.png", type: "image/png", size: 21 * 1024 * 1024 }).error).toMatch(/20 MB/);
    expect(validateUploadFile({ name: "a.png", type: "image/png", size: 0 }).ok).toBe(false);
  });
});
