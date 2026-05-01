/**
 * service.service — Birim Testleri
 * Product service ile aynı yapı — CRUD + slug + 404 hataları
 */

require("./helpers/db");

jest.mock("../src/utils/fileHelper", () => ({
  deleteFile:     jest.fn().mockResolvedValue(undefined),
  toRelativePath: jest.fn((p) => p),
}));

const mongoose       = require("mongoose");
const serviceService = require("../src/services/service.service");
const Service        = require("../models/Service.model");
const Category       = require("../models/Category.model");

let categoryId;

beforeEach(async () => {
  const cat = await Category.create({ name: "Proses Hizmetleri" });
  categoryId = cat._id;
});

const makeSvc = (o = {}) => ({
  name:           "Reverse Osmoz Bakımı",
  description:    "RO sistemi periyodik bakım hizmeti.",
  category:       categoryId,
  coverImagePath: "uploads/images/svc.jpg",
  ...o,
});

// ─────────────────────────────────────────────────────────────────────────────
describe("serviceService.createService", () => {
  test("TC-SVC-01 | Hizmet oluşturulmalı", async () => {
    const s = await serviceService.createService(makeSvc());
    expect(s._id).toBeDefined();
    expect(s.isActive).toBe(true);
  });

  test("TC-SVC-02 | Slug otomatik üretilmeli", async () => {
    const s = await serviceService.createService(makeSvc({ name: "Arıtma Danışmanlığı" }));
    expect(s.slug).toBe("aritma-danismanligi");
  });
});

describe("serviceService.getAllServices", () => {
  beforeEach(async () => {
    await Service.create([
      makeSvc({ name: "Hizmet A", isActive: true  }),
      makeSvc({ name: "Hizmet B", isActive: false, slug: "hizmet-b" }),
    ]);
  });

  test("TC-SVC-03 | Tüm hizmetler listelenmeli", async () => {
    const { total } = await serviceService.getAllServices();
    expect(total).toBe(2);
  });

  test("TC-SVC-04 | isActive filtresi çalışmalı", async () => {
    const { total } = await serviceService.getAllServices({ isActive: "true" });
    expect(total).toBe(1);
  });
});

describe("serviceService.getServiceById", () => {
  test("TC-SVC-05 | ObjectId ile getirme", async () => {
    const s = await serviceService.createService(makeSvc());
    const found = await serviceService.getServiceById(s._id.toString());
    expect(found._id.toString()).toBe(s._id.toString());
  });

  test("TC-SVC-06 | Slug ile getirme", async () => {
    const s = await serviceService.createService(makeSvc({ name: "UV Sterilizasyon" }));
    const found = await serviceService.getServiceById(s.slug);
    expect(found.slug).toBe(s.slug);
  });

  test("TC-SVC-07 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(serviceService.getServiceById(fakeId))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("serviceService.updateService", () => {
  test("TC-SVC-08 | Ad güncellenebilmeli", async () => {
    const s = await serviceService.createService(makeSvc());
    const updated = await serviceService.updateService(s._id.toString(), { name: "Yeni Hizmet" }, null);
    expect(updated.name).toBe("Yeni Hizmet");
  });

  test("TC-SVC-09 | Yeni görsel — eski silinmeli", async () => {
    const { deleteFile } = require("../src/utils/fileHelper");
    deleteFile.mockClear();
    const s = await serviceService.createService(makeSvc());
    await serviceService.updateService(s._id.toString(), {}, "uploads/images/new-svc.jpg");
    expect(deleteFile).toHaveBeenCalledWith("uploads/images/svc.jpg");
  });

  test("TC-SVC-10 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(serviceService.updateService(fakeId, {}, null))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("serviceService.deleteService", () => {
  test("TC-SVC-11 | Hizmet silinmeli", async () => {
    const s = await serviceService.createService(makeSvc());
    await serviceService.deleteService(s._id.toString());
    expect(await Service.findById(s._id)).toBeNull();
  });

  test("TC-SVC-12 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(serviceService.deleteService(fakeId))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
