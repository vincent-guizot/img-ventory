// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../../api/folders/index.js";
import statsHandler from "../../api/stats.js";
import { createRes, jsonResponse, mockCloudinary, setServerEnv } from "./helpers.js";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  setServerEnv({ mode: "dynamic" });
});

async function call(h, req) {
  const res = createRes();
  await h({ query: {}, ...req }, res);
  return res;
}

const FOLDERS = {
  folders: [
    { name: "Aplikasi B", path: "img-ventory/Aplikasi B" },
    { name: "Aplikasi A", path: "img-ventory/Aplikasi A" },
  ],
};

describe("/api/folders", () => {
  it("lists sub-folders of the root, including empty ones", async () => {
    mockCloudinary(async (req) => {
      expect(req.path).toBe("folders/img-ventory");
      return jsonResponse(FOLDERS);
    });
    const res = await call(handler, { method: "GET" });
    expect(res.statusCode).toBe(200);
    expect(res.body.folders.map((f) => f.name)).toEqual(["Aplikasi A", "Aplikasi B"]);
  });

  it("returns an empty list when the root folder doesn't exist yet", async () => {
    mockCloudinary(async () => jsonResponse({ error: { message: "not found" } }, 404));
    const res = await call(handler, { method: "GET" });
    expect(res.body.folders).toEqual([]);
  });

  it("creates the folder in Cloudinary under the root", async () => {
    const fetch = mockCloudinary(async (req) => {
      if (req.method === "GET") return jsonResponse(FOLDERS);
      expect(req.method).toBe("POST");
      expect(req.path).toBe("folders/img-ventory/Aplikasi%20C");
      return jsonResponse({ success: true });
    });
    const res = await call(handler, { method: "POST", body: { name: " Aplikasi C " } });
    expect(res.statusCode).toBe(201);
    expect(res.body.folder).toEqual({ name: "Aplikasi C", path: "img-ventory/Aplikasi C" });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("rejects duplicates and invalid names", async () => {
    const fetch = mockCloudinary(async (req) =>
      req.method === "GET" ? jsonResponse(FOLDERS) : null,
    );
    let res = await call(handler, { method: "POST", body: { name: "aplikasi a" } });
    expect(res.statusCode).toBe(409);
    for (const name of ["", "../x", "a/b", ".env", null]) {
      res = await call(handler, { method: "POST", body: { name } });
      expect(res.statusCode).toBe(400);
    }
    expect(fetch.mock.calls.every(([, init]) => init.method === "GET")).toBe(true);
  });
});

describe("/api/stats", () => {
  it("totals every folder using cursor pagination", async () => {
    mockCloudinary(async (req) => {
      if (req.path === "folders/img-ventory") return jsonResponse(FOLDERS);
      const expr = req.body.expression;
      if (expr.includes('"img-ventory/Aplikasi A"')) {
        return req.body.next_cursor
          ? jsonResponse({ resources: [{ bytes: 5, format: "png" }] })
          : jsonResponse({ resources: [{ bytes: 10, format: "png" }], next_cursor: "C2" });
      }
      if (expr.includes('asset_folder="img-ventory"')) {
        return jsonResponse({ resources: [{ bytes: 1, format: "jpg" }] });
      }
      return jsonResponse({ resources: [] });
    });
    const res = await call(statsHandler, { method: "GET" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      totalImages: 3,
      totalBytes: 16,
      formatCounts: { png: 2, jpg: 1 },
      folders: {
        "": { count: 1, bytes: 1 },
        "Aplikasi A": { count: 2, bytes: 15 },
        "Aplikasi B": { count: 0, bytes: 0 },
      },
      truncated: false,
    });
  });
});
