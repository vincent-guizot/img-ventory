// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../../api/images/index.js";
import bulkHandler from "../../api/images/bulk.js";
import {
  createRes,
  jsonResponse,
  lookedUpIds,
  mockCloudinary,
  resource,
  setServerEnv,
} from "./helpers.js";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  setServerEnv({ mode: "dynamic" });
});

async function call(h, req) {
  const res = createRes();
  await h({ query: {}, ...req }, res);
  return res;
}

/** Router for an account holding the given resources. */
function accountWith(resources, extra = () => null) {
  return async (req) => {
    const custom = await extra(req);
    if (custom) return custom;
    if (req.path === "resources/search") {
      const ids = lookedUpIds(req.body.expression);
      return jsonResponse({
        resources: resources.filter((r) => ids.includes(r.public_id)),
      });
    }
    if (req.path === "folders/img-ventory") {
      return jsonResponse({
        folders: [
          { name: "Aplikasi A", path: "img-ventory/Aplikasi A" },
          { name: "Aplikasi B", path: "img-ventory/Aplikasi B" },
        ],
      });
    }
    return null;
  };
}

describe("GET /api/images (list per folder)", () => {
  it("filters by folder and returns the Cloudinary cursor", async () => {
    const fetch = mockCloudinary(async (req) => {
      expect(req.path).toBe("resources/search");
      return jsonResponse({
        resources: [resource()],
        next_cursor: "NEXT",
        total_count: 140,
      });
    });
    const res = await call(handler, {
      method: "GET",
      query: { folder: "Aplikasi A", cursor: "CUR1" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.nextCursor).toBe("NEXT");
    expect(res.body.totalCount).toBe(140);
    expect(res.body.folder).toBe("Aplikasi A");
    expect(res.body.images[0]).toMatchObject({
      publicId: "img-ventory/Aplikasi A/photo",
      folderName: "Aplikasi A",
      favorite: false,
    });
    const body = fetch.mock.calls[0][1].body;
    const parsed = JSON.parse(body);
    expect(parsed.expression).toContain('asset_folder="img-ventory/Aplikasi A"');
    expect(parsed.next_cursor).toBe("CUR1");
  });

  it("can walk past 100 images with the cursor", async () => {
    const pages = {
      first: { ids: 100, next: "P2" },
      P2: { ids: 100, next: "P3" },
      P3: { ids: 20, next: undefined },
    };
    mockCloudinary(async (req) => {
      const page = pages[req.body.next_cursor ?? "first"];
      return jsonResponse({
        resources: Array.from({ length: page.ids }, (_, i) =>
          resource({ asset_id: `${req.body.next_cursor ?? "p1"}-${i}`, public_id: `img-ventory/Aplikasi A/${req.body.next_cursor ?? "p1"}-${i}` }),
        ),
        next_cursor: page.next,
      });
    });
    let cursor;
    let total = 0;
    do {
      const res = await call(handler, {
        method: "GET",
        query: { folder: "Aplikasi A", limit: "100", ...(cursor ? { cursor } : {}) },
      });
      expect(res.statusCode).toBe(200);
      total += res.body.images.length;
      cursor = res.body.nextCursor;
    } while (cursor);
    expect(total).toBe(220);
  });

  it("rejects folders outside the root without calling Cloudinary", async () => {
    const fetch = mockCloudinary(async () => null);
    for (const folder of ["../other", "a/b", "img-ventory/../x"]) {
      const res = await call(handler, { method: "GET", query: { folder } });
      expect(res.statusCode).toBe(400);
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports Cloudinary failures as 502", async () => {
    mockCloudinary(async () => jsonResponse({ error: { message: "nope" } }, 500));
    const res = await call(handler, { method: "GET", query: {} });
    expect(res.statusCode).toBe(502);
    expect(res.body.error).toMatch(/Cloudinary/);
  });

  it("detects the folder mode via the Admin config API when not configured", async () => {
    setServerEnv({ mode: null });
    const fetch = mockCloudinary(async (req) => {
      if (req.path === "config") {
        expect(req.query.settings).toBe("true");
        return jsonResponse({ settings: { folder_mode: "fixed" } });
      }
      return jsonResponse({ resources: [] });
    });
    await call(handler, { method: "GET", query: { folder: "Aplikasi A" } });
    const search = JSON.parse(fetch.mock.calls[1][1].body);
    expect(search.expression).toContain('folder="img-ventory/Aplikasi A"');
  });

  it("returns a single image by assetId only when it is inside the root", async () => {
    mockCloudinary(async () =>
      jsonResponse({ resources: [resource({ asset_folder: "elsewhere" })] }),
    );
    let res = await call(handler, { method: "GET", query: { assetId: "a".repeat(32) } });
    expect(res.statusCode).toBe(404);
    mockCloudinary(async () => jsonResponse({ resources: [resource()] }));
    res = await call(handler, { method: "GET", query: { assetId: "a".repeat(32) } });
    expect(res.statusCode).toBe(200);
    expect(res.body.image.folderName).toBe("Aplikasi A");
    res = await call(handler, { method: "GET", query: { assetId: 'x" OR 1' } });
    expect(res.statusCode).toBe(400);
  });
});

describe("DELETE /api/images", () => {
  it("refuses to delete assets outside the root", async () => {
    const outside = resource({ public_id: "other/photo", asset_folder: "other" });
    const fetch = mockCloudinary(accountWith([outside]));
    const res = await call(handler, {
      method: "DELETE",
      query: { publicId: "other/photo" },
    });
    expect(res.statusCode).toBe(404);
    expect(fetch.mock.calls.some(([url]) => url.includes("destroy"))).toBe(false);
  });

  it("rejects invalid public IDs", async () => {
    const fetch = mockCloudinary(async () => null);
    const res = await call(handler, {
      method: "DELETE",
      query: { publicId: 'x" OR public_id:*' },
    });
    expect(res.statusCode).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("deletes assets inside the root with a signed destroy", async () => {
    const fetch = mockCloudinary(
      accountWith([resource()], (req) =>
        req.path === "image/destroy" ? jsonResponse({ result: "ok" }) : null,
      ),
    );
    const res = await call(handler, {
      method: "DELETE",
      query: { publicId: "img-ventory/Aplikasi A/photo" },
    });
    expect(res.statusCode).toBe(200);
    const destroy = fetch.mock.calls.find(([url]) => url.includes("destroy"));
    const body = Object.fromEntries(destroy[1].body.entries());
    expect(body.public_id).toBe("img-ventory/Aplikasi A/photo");
    expect(body.signature).toMatch(/^[a-f0-9]{40}$/);
  });

  it("does not report success when Cloudinary fails", async () => {
    mockCloudinary(
      accountWith([resource()], (req) =>
        req.path === "image/destroy" ? jsonResponse({ result: "error" }) : null,
      ),
    );
    const res = await call(handler, {
      method: "DELETE",
      query: { publicId: "img-ventory/Aplikasi A/photo" },
    });
    expect(res.statusCode).toBe(502);
  });
});

describe("PATCH /api/images", () => {
  it("moves in dynamic mode by updating asset_folder (URL unchanged)", async () => {
    let current = resource();
    const fetch = mockCloudinary(
      accountWith([], (req) => {
        if (req.path === "resources/search") {
          return jsonResponse({ resources: [current] });
        }
        if (req.path.startsWith("resources/image/upload/")) {
          expect(req.path).toBe("resources/image/upload/img-ventory/Aplikasi%20A/photo");
          expect(req.body).toEqual({ asset_folder: "img-ventory/Aplikasi B" });
          current = { ...current, asset_folder: "img-ventory/Aplikasi B" };
          return jsonResponse(current);
        }
        return null;
      }),
    );
    const res = await call(handler, {
      method: "PATCH",
      body: { publicId: current.public_id, action: "move", folder: "Aplikasi B" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.urlChanged).toBe(false);
    expect(res.body.image.folderName).toBe("Aplikasi B");
    expect(fetch.mock.calls.some(([url]) => url.includes("rename"))).toBe(false);
  });

  it("moves in fixed mode by renaming the public ID (URL changes)", async () => {
    setServerEnv({ mode: "fixed" });
    const original = resource({
      asset_folder: undefined,
      folder: "img-ventory/Aplikasi A",
      display_name: undefined,
    });
    let current = original;
    const fetch = mockCloudinary(
      accountWith([], (req) => {
        if (req.path === "resources/search") return jsonResponse({ resources: [current] });
        if (req.path === "image/rename") {
          expect(req.body.from_public_id).toBe("img-ventory/Aplikasi A/photo");
          expect(req.body.to_public_id).toBe("img-ventory/Aplikasi B/photo");
          current = {
            ...original,
            public_id: "img-ventory/Aplikasi B/photo",
            folder: "img-ventory/Aplikasi B",
            secure_url: original.secure_url.replace("Aplikasi%20A", "Aplikasi%20B"),
          };
          return jsonResponse(current);
        }
        return null;
      }),
    );
    const res = await call(handler, {
      method: "PATCH",
      body: { publicId: original.public_id, action: "move", folder: "Aplikasi B" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      urlChanged: true,
      previousPublicId: "img-ventory/Aplikasi A/photo",
      image: { publicId: "img-ventory/Aplikasi B/photo", folderName: "Aplikasi B" },
    });
    expect(fetch).toHaveBeenCalled();
  });

  it("rejects a move to a folder that doesn't exist or is outside the root", async () => {
    mockCloudinary(accountWith([resource()]));
    for (const folder of ["Missing", "../other", "a/b"]) {
      const res = await call(handler, {
        method: "PATCH",
        body: { publicId: "img-ventory/Aplikasi A/photo", action: "move", folder },
      });
      expect([400, 404]).toContain(res.statusCode);
    }
  });

  it("surfaces a failed rename instead of reporting success", async () => {
    setServerEnv({ mode: "fixed" });
    mockCloudinary(
      accountWith([resource({ asset_folder: undefined, folder: "img-ventory/Aplikasi A" })], (req) =>
        req.path === "image/rename"
          ? jsonResponse({ error: { message: "Resource already exists" } }, 409)
          : null,
      ),
    );
    const res = await call(handler, {
      method: "PATCH",
      body: { publicId: "img-ventory/Aplikasi A/photo", action: "rename", name: "taken" },
    });
    expect(res.statusCode).toBe(502);
    expect(res.body.error).toBe("Resource already exists");
  });

  it("renames via display_name in dynamic mode", async () => {
    let current = resource();
    mockCloudinary(
      accountWith([], (req) => {
        if (req.path === "resources/search") return jsonResponse({ resources: [current] });
        if (req.path.startsWith("resources/image/upload/")) {
          expect(req.body).toEqual({ display_name: "Hero banner" });
          current = { ...current, display_name: "Hero banner" };
          return jsonResponse(current);
        }
        return null;
      }),
    );
    const res = await call(handler, {
      method: "PATCH",
      body: { publicId: current.public_id, action: "rename", name: "Hero banner" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.image.fileName).toBe("Hero banner");
    expect(res.body.urlChanged).toBe(false);
  });

  it("persists tags and favorites as Cloudinary tags", async () => {
    let current = resource({ tags: ["old"] });
    const updates = [];
    mockCloudinary(
      accountWith([], (req) => {
        if (req.path === "resources/search") return jsonResponse({ resources: [current] });
        if (req.path.startsWith("resources/image/upload/")) {
          updates.push(req.body.tags);
          current = { ...current, tags: req.body.tags.split(",") };
          return jsonResponse(current);
        }
        return null;
      }),
    );
    let res = await call(handler, {
      method: "PATCH",
      body: { publicId: current.public_id, action: "favorite", favorite: true },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.image).toMatchObject({ favorite: true, tags: ["old"] });
    res = await call(handler, {
      method: "PATCH",
      body: { publicId: current.public_id, action: "tags", tags: ["promo", "q4"] },
    });
    expect(res.body.image).toMatchObject({ favorite: true, tags: ["promo", "q4"] });
    expect(updates).toEqual(["old,iv_favorite", "promo,q4,iv_favorite"]);

    res = await call(handler, {
      method: "PATCH",
      body: { publicId: current.public_id, action: "tags", tags: ["bad,tag"] },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects unknown actions", async () => {
    mockCloudinary(async () => null);
    const res = await call(handler, {
      method: "PATCH",
      body: { publicId: "img-ventory/x", action: "chmod" },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("POST /api/images/bulk", () => {
  it("deletes only images inside the root and reports partial failure", async () => {
    const inside = resource();
    const outside = resource({ public_id: "other/x", asset_folder: "other" });
    const destroyed = [];
    mockCloudinary(
      accountWith([inside, outside], (req) => {
        if (req.path === "image/destroy") {
          destroyed.push(req.body.public_id);
          return jsonResponse({ result: "ok" });
        }
        return null;
      }),
    );
    const res = await call(bulkHandler, {
      method: "POST",
      body: { action: "delete", publicIds: [inside.public_id, "other/x"] },
    });
    expect(res.statusCode).toBe(207);
    expect(res.body).toMatchObject({ succeeded: 1, failed: 1 });
    expect(destroyed).toEqual([inside.public_id]);
    expect(res.body.results[1]).toMatchObject({ publicId: "other/x", ok: false });
  });

  it("validates the bulk payload", async () => {
    mockCloudinary(async () => null);
    for (const body of [
      { action: "delete", publicIds: [] },
      { action: "delete", publicIds: Array.from({ length: 101 }, (_, i) => `img-ventory/${i}`) },
      { action: "delete", publicIds: ["../x"] },
      { action: "nuke", publicIds: ["img-ventory/x"] },
      { action: "move", publicIds: ["img-ventory/x"], folder: "a/b" },
    ]) {
      const res = await call(bulkHandler, { method: "POST", body });
      expect(res.statusCode).toBe(400);
    }
  });

  it("moves several images to another folder", async () => {
    const a = resource({ public_id: "img-ventory/Aplikasi A/a" });
    const b = resource({ public_id: "img-ventory/Aplikasi A/b" });
    const state = { [a.public_id]: a, [b.public_id]: b };
    mockCloudinary(
      accountWith([], (req) => {
        if (req.path === "resources/search") {
          const ids = lookedUpIds(req.body.expression);
          return jsonResponse({ resources: ids.map((id) => state[id]).filter(Boolean) });
        }
        if (req.path.startsWith("resources/image/upload/")) {
          const id = decodeURIComponent(req.path.replace("resources/image/upload/", ""));
          state[id] = { ...state[id], asset_folder: req.body.asset_folder };
          return jsonResponse(state[id]);
        }
        return null;
      }),
    );
    const res = await call(bulkHandler, {
      method: "POST",
      body: { action: "move", publicIds: [a.public_id, b.public_id], folder: "" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.succeeded).toBe(2);
    expect(state[a.public_id].asset_folder).toBe("img-ventory");
  });
});
