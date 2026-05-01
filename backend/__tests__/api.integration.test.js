/**
 * API Entegrasyon Testleri — Products, Blogs, Categories, Sitemap
 * HTTP katmanından uçtan uca doğrulama.
 */

require("./helpers/db");

jest.mock("../src/config/mailer", () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: "test" }),
}));
jest.mock("../src/utils/fileHelper", () => ({
  deleteFile:     jest.fn().mockResolvedValue(undefined),
  toRelativePath: jest.fn((p) => p),
}));

const request  = require("supertest");
const bcrypt   = require("bcrypt");
const app      = require("../app");
const Admin    = require("../models/Admin.model");
const Category = require("../models/Category.model");
const Product  = require("../models/Product.model");
const Blog     = require("../models/Blog.model");

let authCookie;
let categoryId;

// Her testten önce admin + kategori oluştur, auth cookie al
beforeEach(async () => {
  await Admin.create({ name: "Test Admin", email: "admin@test.com", password: "Sifre123!", isActive: true });
  const cat = await Category.create({ name: "Arıtma" });
  categoryId = cat._id.toString();

  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: "admin@test.com", password: "Sifre123!" });
  authCookie = login.headers["set-cookie"];
});

// ─────────────────────────────────────────────────────────────────────────────
// Categories API
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/categories", () => {
  test("TC-API-01 | Kategoriler herkese açık listelenmeli", async () => {
    const res = await request(app).get("/api/v1/categories");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.categories ?? res.body.data)).toBe(true);
  });
});

describe("POST /api/v1/categories", () => {
  test("TC-API-02 | Admin kategori oluşturabilmeli → 201", async () => {
    const res = await request(app)
      .post("/api/v1/categories")
      .set("Cookie", authCookie)
      .send({ name: "Yeni Kategori" });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("category");
  });

  test("TC-API-03 | Token olmadan → 401", async () => {
    const res = await request(app)
      .post("/api/v1/categories")
      .send({ name: "Kategori" });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Products API
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/products", () => {
  beforeEach(async () => {
    await Product.create({
      name: "Test Ürün", description: "Açıklama", category: categoryId,
      coverImagePath: "uploads/images/p.jpg", isActive: true,
    });
  });

  test("TC-API-04 | Ürünler herkese açık listelenmeli", async () => {
    const res = await request(app).get("/api/v1/products");
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBeGreaterThan(0);
  });

  test("TC-API-05 | isActive query filtresi çalışmalı", async () => {
    await Product.create({
      name: "Pasif Ürün", description: "Açıklama", category: categoryId,
      coverImagePath: "uploads/images/p2.jpg", isActive: false, slug: "pasif-urun",
    });
    const res = await request(app).get("/api/v1/products?isActive=true");
    expect(res.status).toBe(200);
    res.body.data.products.forEach((p) => expect(p.isActive).toBe(true));
  });
});

describe("GET /api/v1/products/:id", () => {
  test("TC-API-06 | Var olmayan ID → 404", async () => {
    const res = await request(app).get("/api/v1/products/nonexistent-slug");
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/v1/products/:id", () => {
  test("TC-API-07 | Admin ürün silebilmeli → 200", async () => {
    const p = await Product.create({
      name: "Silinecek", description: "Açık", category: categoryId,
      coverImagePath: "uploads/images/del.jpg",
    });
    const res = await request(app)
      .delete(`/api/v1/products/${p._id}`)
      .set("Cookie", authCookie);
    expect(res.status).toBe(200);
  });

  test("TC-API-08 | Token olmadan → 401", async () => {
    const p = await Product.create({
      name: "Silinecek2", description: "Açık", category: categoryId,
      coverImagePath: "uploads/images/del2.jpg", slug: "silinecek2",
    });
    const res = await request(app).delete(`/api/v1/products/${p._id}`);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Blogs API
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/blogs", () => {
  beforeEach(async () => {
    await Blog.create([
      { title: "Yayımlı Blog",  content: "İçerik", author: "Yazar", status: "published",
        coverImagePath: "uploads/images/b1.jpg" },
      { title: "Taslak Blog",   content: "İçerik", author: "Yazar", status: "draft",
        coverImagePath: "uploads/images/b2.jpg", slug: "taslak-blog" },
    ]);
  });

  test("TC-API-09 | Blog listesi herkese açık", async () => {
    const res = await request(app).get("/api/v1/blogs");
    expect(res.status).toBe(200);
    expect(res.body.data.blogs.length).toBeGreaterThanOrEqual(1);
  });

  test("TC-API-10 | status=published filtresi çalışmalı", async () => {
    const res = await request(app).get("/api/v1/blogs?status=published");
    expect(res.status).toBe(200);
    res.body.data.blogs.forEach((b) => expect(b.status).toBe("published"));
  });
});

describe("GET /api/v1/blogs/:identifier", () => {
  test("TC-API-11 | Var olmayan slug → 404", async () => {
    const res = await request(app).get("/api/v1/blogs/yok-olan");
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sitemap
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /sitemap.xml", () => {
  beforeEach(async () => {
    await Product.create({
      name: "Sitemap Ürünü", description: "Açıklama", category: categoryId,
      coverImagePath: "uploads/images/sm.jpg", isActive: true,
    });
    await Blog.create({
      title: "Sitemap Blog", content: "İçerik", author: "Yazar",
      status: "published", coverImagePath: "uploads/images/sm-b.jpg",
    });
  });

  test("TC-API-12 | Sitemap XML döndürülmeli", async () => {
    const res = await request(app).get("/sitemap.xml");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/xml/);
    expect(res.text).toContain('<?xml');
    expect(res.text).toContain('<urlset');
  });

  test("TC-API-13 | Sitemap ürün slug'ını içermeli", async () => {
    const res = await request(app).get("/sitemap.xml");
    expect(res.text).toContain("/urunler/sitemap-urunu");
  });

  test("TC-API-14 | Sitemap blog slug'ını içermeli", async () => {
    const res = await request(app).get("/sitemap.xml");
    expect(res.text).toContain("/blog/sitemap-blog");
  });

  test("TC-API-15 | Sitemap statik sayfaları içermeli", async () => {
    const res = await request(app).get("/sitemap.xml");
    expect(res.text).toContain("/iletisim");
    expect(res.text).toContain("/urunler");
    expect(res.text).toContain("/blog");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Stats (dashboard)
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/stats", () => {
  test("TC-API-16 | Token olmadan → 401", async () => {
    const res = await request(app).get("/api/v1/stats");
    expect(res.status).toBe(401);
  });

  test("TC-API-17 | Admin token ile stats döndürülmeli", async () => {
    // authCookie module-level değişkenine güvenmek yerine inline login yap
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.com", password: "Sifre123!" });
    const cookie = login.headers["set-cookie"];

    const res = await request(app)
      .get("/api/v1/stats")
      .set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("products");
    expect(res.body.data).toHaveProperty("blogs");
  });
});
