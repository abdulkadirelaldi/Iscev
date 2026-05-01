/**
 * product.service — Birim Testleri
 * getAllProducts, getProductById (ID & slug), createProduct, updateProduct, deleteProduct
 */

require("./helpers/db");

// Disk I/O yok — dosya silme işlemlerini mockla
jest.mock("../src/utils/fileHelper", () => ({
  deleteFile: jest.fn().mockResolvedValue(undefined),
  toRelativePath: jest.fn((p) => p),
}));

const mongoose       = require("mongoose");
const productService = require("../src/services/product.service");
const Product        = require("../models/Product.model");
const Category       = require("../models/Category.model");

let categoryId;

beforeEach(async () => {
  const cat = await Category.create({ name: "Su Arıtma" });
  categoryId = cat._id;
});

const makeProduct = (overrides = {}) => ({
  name:           "Reverse Osmoz RO-5000",
  description:    "Endüstriyel ters osmoz sistemi.",
  category:       categoryId,
  coverImagePath: "uploads/images/cover.jpg",
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
describe("productService.createProduct", () => {
  test("TC-PS-01 | Geçerli veri ile ürün oluşturulmalı", async () => {
    const p = await productService.createProduct(makeProduct());
    expect(p._id).toBeDefined();
    expect(p.name).toBe("Reverse Osmoz RO-5000");
    expect(p.isActive).toBe(true);
  });

  test("TC-PS-02 | Slug otomatik üretilmeli", async () => {
    const p = await productService.createProduct(makeProduct({ name: "Aktif Karbon Filtre" }));
    expect(p.slug).toBe("aktif-karbon-filtre");
  });

  test("TC-PS-03 | Türkçe karakter slug'a dönüştürülmeli", async () => {
    const p = await productService.createProduct(makeProduct({ name: "Şebeke Filtresi" }));
    expect(p.slug).toBe("sebeke-filtresi");
  });

  test("TC-PS-04 | technicalSpecs JSON string olarak parse edilmeli", async () => {
    const specs = JSON.stringify({ kapasite: "5000 L/gün", basınç: "6 bar" });
    const p = await productService.createProduct(makeProduct({ technicalSpecs: specs }));
    expect(p.technicalSpecs.get("kapasite")).toBe("5000 L/gün");
  });

  test("TC-PS-05 | Geçersiz technicalSpecs JSON → VALIDATION_ERROR fırlatmalı", async () => {
    await expect(
      productService.createProduct(makeProduct({ technicalSpecs: "{bozuk_json" }))
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR", statusCode: 400 });
  });

  test("TC-PS-06 | isActive string 'false' → false kaydedilmeli", async () => {
    const p = await productService.createProduct(makeProduct({ isActive: "false" }));
    expect(p.isActive).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("productService.getAllProducts", () => {
  beforeEach(async () => {
    await Product.create([
      makeProduct({ name: "Ürün A", isActive: true,  order: 1 }),
      makeProduct({ name: "Ürün B", isActive: false, order: 2, slug: "urun-b" }),
      makeProduct({ name: "Ürün C", isActive: true,  order: 3, slug: "urun-c" }),
    ]);
  });

  test("TC-PS-07 | Tüm ürünler listelenmeli", async () => {
    const { products, total } = await productService.getAllProducts();
    expect(total).toBe(3);
    expect(products).toHaveLength(3);
  });

  test("TC-PS-08 | isActive filtresi çalışmalı", async () => {
    const { products, total } = await productService.getAllProducts({ isActive: "true" });
    expect(total).toBe(2);
    products.forEach((p) => expect(p.isActive).toBe(true));
  });

  test("TC-PS-09 | Sayfalama çalışmalı (limit=2, page=2)", async () => {
    const { products, total, page } = await productService.getAllProducts({ limit: 2, page: 2 });
    expect(total).toBe(3);
    expect(products).toHaveLength(1);
    expect(page).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("productService.getProductById", () => {
  let productId, productSlug;

  beforeEach(async () => {
    const p = await productService.createProduct(makeProduct({ name: "Test Ürünü" }));
    productId   = p._id.toString();
    productSlug = p.slug;
  });

  test("TC-PS-10 | MongoDB ObjectId ile getirme", async () => {
    const p = await productService.getProductById(productId);
    expect(p._id.toString()).toBe(productId);
  });

  test("TC-PS-11 | Slug ile getirme", async () => {
    const p = await productService.getProductById(productSlug);
    expect(p.slug).toBe(productSlug);
  });

  test("TC-PS-12 | Var olmayan ID → 404 NOT_FOUND", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(productService.getProductById(fakeId))
      .rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });

  test("TC-PS-13 | Var olmayan slug → 404 NOT_FOUND", async () => {
    await expect(productService.getProductById("yok-olan-slug"))
      .rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("productService.updateProduct", () => {
  let productId;

  beforeEach(async () => {
    const p = await productService.createProduct(makeProduct());
    productId = p._id.toString();
  });

  test("TC-PS-14 | Ad güncellenmeli", async () => {
    const updated = await productService.updateProduct(productId, { name: "Yeni Ad" }, null);
    expect(updated.name).toBe("Yeni Ad");
  });

  test("TC-PS-15 | isActive false'a çekilmeli", async () => {
    const updated = await productService.updateProduct(productId, { isActive: false }, null);
    expect(updated.isActive).toBe(false);
  });

  test("TC-PS-16 | Yeni kapak görseli — eski dosya silinmeli, yeni path kaydedilmeli", async () => {
    const { deleteFile } = require("../src/utils/fileHelper");
    const updated = await productService.updateProduct(
      productId,
      {},
      "uploads/images/new-cover.jpg"
    );
    expect(updated.coverImagePath).toBe("uploads/images/new-cover.jpg");
    expect(deleteFile).toHaveBeenCalledWith("uploads/images/cover.jpg");
  });

  test("TC-PS-17 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(productService.updateProduct(fakeId, {}, null))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("productService.deleteProduct", () => {
  test("TC-PS-18 | Ürün silinmeli, dosyalar temizlenmeli", async () => {
    const { deleteFile } = require("../src/utils/fileHelper");
    deleteFile.mockClear();

    const p = await productService.createProduct(makeProduct());
    await productService.deleteProduct(p._id.toString());

    const found = await Product.findById(p._id);
    expect(found).toBeNull();
    expect(deleteFile).toHaveBeenCalledWith("uploads/images/cover.jpg");
  });

  test("TC-PS-19 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(productService.deleteProduct(fakeId))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
