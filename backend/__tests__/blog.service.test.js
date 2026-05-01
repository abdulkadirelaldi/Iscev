/**
 * blog.service — Birim Testleri
 * getAllBlogs, getBlogBySlugOrId, createBlog (tags parsing, publishedAt hook),
 * updateBlog, deleteBlog
 */

require("./helpers/db");

jest.mock("../src/utils/fileHelper", () => ({
  deleteFile:     jest.fn().mockResolvedValue(undefined),
  toRelativePath: jest.fn((p) => p),
}));

const mongoose   = require("mongoose");
const blogService = require("../src/services/blog.service");
const Blog        = require("../models/Blog.model");

const makeBlog = (overrides = {}) => ({
  title:          "Su Arıtma Teknolojileri",
  content:        "<p>İçerik buraya gelecek.</p>",
  author:         "Ahmet Yılmaz",
  coverImagePath: "uploads/images/blog-cover.jpg",
  status:         "draft",
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
describe("blogService.createBlog", () => {
  test("TC-BS-01 | Draft blog oluşturulmalı", async () => {
    const b = await blogService.createBlog(makeBlog());
    expect(b._id).toBeDefined();
    expect(b.status).toBe("draft");
    expect(b.publishedAt).toBeNull();
  });

  test("TC-BS-02 | Published blog → publishedAt otomatik set edilmeli", async () => {
    const b = await blogService.createBlog(makeBlog({ status: "published" }));
    expect(b.status).toBe("published");
    expect(b.publishedAt).not.toBeNull();
  });

  test("TC-BS-03 | Slug Türkçe karakterlerden temizlenmeli", async () => {
    const b = await blogService.createBlog(makeBlog({ title: "Şebeke Suyu Filtrasyonu" }));
    expect(b.slug).toBe("sebeke-suyu-filtrasyonu");
  });

  test("TC-BS-04 | Tags — virgüllü string ayrıştırılmalı", async () => {
    const b = await blogService.createBlog(makeBlog({ tags: "arıtma, filtre, su" }));
    expect(b.tags).toEqual(["arıtma", "filtre", "su"]);
  });

  test("TC-BS-05 | Tags — JSON dizisi string olarak parse edilmeli", async () => {
    const b = await blogService.createBlog(makeBlog({ tags: '["arıtma","filtre"]' }));
    expect(b.tags).toEqual(["arıtma", "filtre"]);
  });

  test("TC-BS-06 | Tags — array olarak direkt geçilmeli", async () => {
    const b = await blogService.createBlog(makeBlog({ tags: ["su", "çevre"] }));
    expect(b.tags).toEqual(["su", "çevre"]);
  });

  test("TC-BS-07 | Tags yok → boş dizi kaydedilmeli", async () => {
    const b = await blogService.createBlog(makeBlog({ tags: undefined }));
    expect(b.tags).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("blogService.getAllBlogs", () => {
  beforeEach(async () => {
    await Blog.create([
      makeBlog({ title: "Blog A", status: "published", tags: ["su"]      }),
      makeBlog({ title: "Blog B", status: "draft",     tags: ["filtre"], slug: "blog-b" }),
      makeBlog({ title: "Blog C", status: "published", tags: ["su"],     slug: "blog-c" }),
    ]);
  });

  test("TC-BS-08 | Tüm bloglar listelenmeli", async () => {
    const { total } = await blogService.getAllBlogs();
    expect(total).toBe(3);
  });

  test("TC-BS-09 | status filtresi çalışmalı", async () => {
    const { blogs, total } = await blogService.getAllBlogs({ status: "published" });
    expect(total).toBe(2);
    blogs.forEach((b) => expect(b.status).toBe("published"));
  });

  test("TC-BS-10 | tag filtresi çalışmalı", async () => {
    const { total } = await blogService.getAllBlogs({ tag: "su" });
    expect(total).toBe(2);
  });

  test("TC-BS-11 | Sayfalama çalışmalı", async () => {
    const { blogs, total } = await blogService.getAllBlogs({ limit: 2, page: 1 });
    expect(total).toBe(3);
    expect(blogs).toHaveLength(2);
  });

  test("TC-BS-12 | Liste yanıtı content alanı içermemeli", async () => {
    const { blogs } = await blogService.getAllBlogs();
    blogs.forEach((b) => expect(b.content).toBeUndefined());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("blogService.getBlogBySlugOrId", () => {
  let blogId, blogSlug;

  beforeEach(async () => {
    const b = await blogService.createBlog(makeBlog({ title: "Test Blog Yazısı" }));
    blogId   = b._id.toString();
    blogSlug = b.slug;
  });

  test("TC-BS-13 | ObjectId ile getirme", async () => {
    const b = await blogService.getBlogBySlugOrId(blogId);
    expect(b._id.toString()).toBe(blogId);
  });

  test("TC-BS-14 | Slug ile getirme", async () => {
    const b = await blogService.getBlogBySlugOrId(blogSlug);
    expect(b.slug).toBe(blogSlug);
  });

  test("TC-BS-15 | viewCount artmalı (arka planda)", async () => {
    await blogService.getBlogBySlugOrId(blogId);
    // exec() non-blocking olduğu için kısa bekleme
    await new Promise((r) => setTimeout(r, 100));
    const b = await Blog.findById(blogId);
    expect(b.viewCount).toBe(1);
  });

  test("TC-BS-16 | Var olmayan slug → 404 NOT_FOUND", async () => {
    await expect(blogService.getBlogBySlugOrId("yok-olan-slug"))
      .rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });

  test("TC-BS-17 | Var olmayan ObjectId → 404 NOT_FOUND", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(blogService.getBlogBySlugOrId(fakeId))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("blogService.updateBlog", () => {
  let blogId;

  beforeEach(async () => {
    const b = await blogService.createBlog(makeBlog());
    blogId = b._id.toString();
  });

  test("TC-BS-18 | Başlık güncellenmeli", async () => {
    const b = await blogService.updateBlog(blogId, { title: "Yeni Başlık" }, null);
    expect(b.title).toBe("Yeni Başlık");
  });

  test("TC-BS-19 | Draft → published: publishedAt set edilmeli", async () => {
    const b = await blogService.updateBlog(blogId, { status: "published" }, null);
    expect(b.publishedAt).not.toBeNull();
  });

  test("TC-BS-20 | Tags güncellenmeli", async () => {
    const b = await blogService.updateBlog(blogId, { tags: "yeni, etiket" }, null);
    expect(b.tags).toEqual(["yeni", "etiket"]);
  });

  test("TC-BS-21 | Yeni kapak görseli — eski dosya silinmeli", async () => {
    const { deleteFile } = require("../src/utils/fileHelper");
    deleteFile.mockClear();

    const b = await blogService.updateBlog(blogId, {}, "uploads/images/new.jpg");
    expect(b.coverImagePath).toBe("uploads/images/new.jpg");
    expect(deleteFile).toHaveBeenCalledWith("uploads/images/blog-cover.jpg");
  });

  test("TC-BS-22 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(blogService.updateBlog(fakeId, {}, null))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("blogService.deleteBlog", () => {
  test("TC-BS-23 | Blog silinmeli, kapak görseli temizlenmeli", async () => {
    const { deleteFile } = require("../src/utils/fileHelper");
    deleteFile.mockClear();

    const b = await blogService.createBlog(makeBlog());
    await blogService.deleteBlog(b._id.toString());

    expect(await Blog.findById(b._id)).toBeNull();
    expect(deleteFile).toHaveBeenCalledWith("uploads/images/blog-cover.jpg");
  });

  test("TC-BS-24 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(blogService.deleteBlog(fakeId))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
