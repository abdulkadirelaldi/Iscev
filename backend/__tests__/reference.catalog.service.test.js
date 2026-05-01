/**
 * reference.service + catalog.service — Birim Testleri
 * Tek dosyada; iki servis de CRUD açısından benzer yapıya sahip.
 */

require("./helpers/db");

jest.mock("../src/utils/fileHelper", () => ({
  deleteFile:     jest.fn().mockResolvedValue(undefined),
  toRelativePath: jest.fn((p) => p),
}));

const mongoose         = require("mongoose");
const referenceService = require("../src/services/reference.service");
const catalogService   = require("../src/services/catalog.service");
const Reference        = require("../models/Reference.model");
const Catalog          = require("../models/Catalog.model");

// ═══════════════════════════════════════════════════════════════════════════
// REFERENCE SERVICE
// ═══════════════════════════════════════════════════════════════════════════

const makeRef = (o = {}) => ({
  name: "İSÇEV OSB Tesisi",
  sector: "Endüstri",
  location: "Ankara, TR",
  isActive: true,
  ...o,
});

describe("referenceService.createReference", () => {
  test("TC-RS-01 | Referans oluşturulmalı", async () => {
    const r = await referenceService.createReference(makeRef());
    expect(r._id).toBeDefined();
    expect(r.name).toBe("İSÇEV OSB Tesisi");
    expect(r.isActive).toBe(true);
  });

  test("TC-RS-02 | isActive string 'false' → false", async () => {
    const r = await referenceService.createReference(makeRef({ isActive: "false" }));
    expect(r.isActive).toBe(false);
  });
});

describe("referenceService.getAllReferences", () => {
  beforeEach(async () => {
    await Reference.create([
      makeRef({ name: "Firma A", sector: "Endüstri", isActive: true }),
      makeRef({ name: "Firma B", sector: "Belediye", isActive: false }),
      makeRef({ name: "Firma C", sector: "Endüstri", isActive: true }),
    ]);
  });

  test("TC-RS-03 | Tüm referanslar listelenmeli", async () => {
    const { total } = await referenceService.getAllReferences();
    expect(total).toBe(3);
  });

  test("TC-RS-04 | isActive filtresi çalışmalı", async () => {
    const { references, total } = await referenceService.getAllReferences({ isActive: "true" });
    expect(total).toBe(2);
    references.forEach((r) => expect(r.isActive).toBe(true));
  });

  test("TC-RS-05 | sector filtresi çalışmalı", async () => {
    const { total } = await referenceService.getAllReferences({ sector: "Belediye" });
    expect(total).toBe(1);
  });
});

describe("referenceService.getReferenceById", () => {
  test("TC-RS-06 | ID ile getirme", async () => {
    const r = await referenceService.createReference(makeRef());
    const found = await referenceService.getReferenceById(r._id.toString());
    expect(found._id.toString()).toBe(r._id.toString());
  });

  test("TC-RS-07 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(referenceService.getReferenceById(fakeId))
      .rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });
});

describe("referenceService.updateReference", () => {
  test("TC-RS-08 | Ad güncellenebilmeli", async () => {
    const r = await referenceService.createReference(makeRef());
    const updated = await referenceService.updateReference(r._id.toString(), { name: "Yeni Firma" }, null);
    expect(updated.name).toBe("Yeni Firma");
  });

  test("TC-RS-09 | Yeni logo — eski silinmeli", async () => {
    const { deleteFile } = require("../src/utils/fileHelper");
    deleteFile.mockClear();
    const r = await referenceService.createReference(makeRef({ logoPath: "uploads/images/old.jpg" }));
    await referenceService.updateReference(r._id.toString(), {}, "uploads/images/new.jpg");
    expect(deleteFile).toHaveBeenCalledWith("uploads/images/old.jpg");
  });

  test("TC-RS-10 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(referenceService.updateReference(fakeId, {}, null))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("referenceService.deleteReference", () => {
  test("TC-RS-11 | Referans silinmeli", async () => {
    const r = await referenceService.createReference(makeRef());
    await referenceService.deleteReference(r._id.toString());
    expect(await Reference.findById(r._id)).toBeNull();
  });

  test("TC-RS-12 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(referenceService.deleteReference(fakeId))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CATALOG SERVICE
// ═══════════════════════════════════════════════════════════════════════════

const makeCatalog = (o = {}) => ({
  name:         "Ürün Kataloğu 2024",
  pdfFilePath:  "uploads/pdfs/katalog.pdf",
  language:     "tr",
  isActive:     true,
  ...o,
});

describe("catalogService.createCatalog", () => {
  test("TC-CAT-01 | Katalog oluşturulmalı", async () => {
    const c = await catalogService.createCatalog(makeCatalog());
    expect(c._id).toBeDefined();
    expect(c.language).toBe("tr");
    expect(c.isActive).toBe(true);
  });

  test("TC-CAT-02 | isActive string 'false' → false", async () => {
    const c = await catalogService.createCatalog(makeCatalog({ isActive: "false" }));
    expect(c.isActive).toBe(false);
  });
});

describe("catalogService.getAllCatalogs", () => {
  beforeEach(async () => {
    await Catalog.create([
      makeCatalog({ name: "Katalog TR", language: "tr", isActive: true }),
      makeCatalog({ name: "Katalog EN", language: "en", isActive: true,
                    pdfFilePath: "uploads/pdfs/en.pdf"  }),
      makeCatalog({ name: "Katalog TR Pasif", language: "tr", isActive: false,
                    pdfFilePath: "uploads/pdfs/pasif.pdf" }),
    ]);
  });

  test("TC-CAT-03 | Tüm kataloglar listelenmeli", async () => {
    const catalogs = await catalogService.getAllCatalogs();
    expect(catalogs).toHaveLength(3);
  });

  test("TC-CAT-04 | language filtresi çalışmalı", async () => {
    const catalogs = await catalogService.getAllCatalogs({ language: "en" });
    expect(catalogs).toHaveLength(1);
    expect(catalogs[0].language).toBe("en");
  });

  test("TC-CAT-05 | isActive filtresi çalışmalı", async () => {
    const catalogs = await catalogService.getAllCatalogs({ isActive: "true" });
    expect(catalogs).toHaveLength(2);
  });
});

describe("catalogService.deleteCatalog", () => {
  test("TC-CAT-06 | Katalog + PDF silinmeli", async () => {
    const { deleteFile } = require("../src/utils/fileHelper");
    deleteFile.mockClear();
    const c = await catalogService.createCatalog(makeCatalog());
    await catalogService.deleteCatalog(c._id.toString());
    expect(await Catalog.findById(c._id)).toBeNull();
    expect(deleteFile).toHaveBeenCalledWith("uploads/pdfs/katalog.pdf");
  });

  test("TC-CAT-07 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(catalogService.deleteCatalog(fakeId))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("catalogService.incrementDownload", () => {
  test("TC-CAT-08 | İndirme sayacı artmalı", async () => {
    const c = await catalogService.createCatalog(makeCatalog());
    const result = await catalogService.incrementDownload(c._id.toString());
    expect(result.downloadCount).toBe(1);
  });

  test("TC-CAT-09 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(catalogService.incrementDownload(fakeId))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
