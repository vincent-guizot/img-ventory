// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildListRequest, searchTokens } from "../../api/_lib/listQuery.js";

const ctx = { root: "img-ventory", mode: "dynamic" };

describe("buildListRequest", () => {
  it("pins the search to exactly the requested folder (dynamic mode)", () => {
    const { folder, body } = buildListRequest({ folder: "Aplikasi A" }, ctx);
    expect(folder).toBe("Aplikasi A");
    expect(body.expression).toBe(
      'resource_type:image AND type:upload AND asset_folder="img-ventory/Aplikasi A"',
    );
    expect(body.sort_by).toEqual([{ created_at: "desc" }]);
    expect(body.max_results).toBe(30);
    expect(body.next_cursor).toBeUndefined();
  });

  it("uses the folder field in fixed mode and the root by default", () => {
    const { body } = buildListRequest({}, { root: "img-ventory", mode: "fixed" });
    expect(body.expression).toContain('folder="img-ventory"');
    expect(body.expression).not.toContain("asset_folder");
  });

  it("passes the cursor and maps filters and sorting", () => {
    const { body } = buildListRequest(
      {
        folder: "Aplikasi B",
        cursor: "abc123==",
        q: "hero banner",
        format: "PNG",
        tag: "promo",
        favorite: "1",
        sort: "size",
        order: "desc",
        limit: "50",
      },
      ctx,
    );
    expect(body.next_cursor).toBe("abc123==");
    expect(body.max_results).toBe(50);
    expect(body.expression).toContain("(filename:hero* OR display_name:hero*)");
    expect(body.expression).toContain("(filename:banner* OR display_name:banner*)");
    expect(body.expression).toContain("format=png");
    expect(body.expression).toContain('tags="promo"');
    expect(body.expression).toContain('tags="iv_favorite"');
    expect(body.sort_by).toEqual([{ bytes: "desc" }, { created_at: "desc" }]);
  });

  it("sorts by name/format ascending by default", () => {
    expect(buildListRequest({ sort: "name" }, ctx).body.sort_by[0]).toEqual({ filename: "asc" });
    expect(buildListRequest({ sort: "format" }, ctx).body.sort_by[0]).toEqual({ format: "asc" });
  });

  it.each([
    [{ folder: "../secret" }],
    [{ folder: "a/b" }],
    [{ folder: ["a", "b"] }],
    [{ sort: "random" }],
    [{ order: "up" }],
    [{ limit: "0" }],
    [{ limit: "101" }],
    [{ cursor: 'x" OR folder:*' }],
    [{ format: "exe" }],
    [{ tag: 'x" OR tags:*' }],
  ])("rejects invalid input %j", (query) => {
    expect(() => buildListRequest(query, ctx)).toThrow(
      expect.objectContaining({ status: 400 }),
    );
  });

  it("strips expression syntax from search text", () => {
    expect(searchTokens('a" OR folder:* AND (x)')).toEqual(["a", "OR", "folder", "AND", "x"]);
    const { body } = buildListRequest({ q: '"; folder:other' }, ctx);
    expect(body.expression).not.toContain('"; ');
    expect(body.expression).not.toContain("folder:other");
  });
});
