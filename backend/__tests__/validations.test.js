/**
 * Zod Validasyon Şemaları — Birim Testleri
 * adminLoginSchema, productSchema, mapLocationSchema
 */

const {
  adminLoginSchema,
  productSchema,
  productUpdateSchema,
  mapLocationSchema,
  mapLocationUpdateSchema,
} = require("../src/utils/validations");

// ─────────────────────────────────────────────────────────────────────────────
// adminLoginSchema
// ─────────────────────────────────────────────────────────────────────────────
describe("adminLoginSchema", () => {
  test("TC-VAL-01 | Geçerli giriş verisi kabul edilmeli", () => {
    const result = adminLoginSchema.safeParse({ email: "admin@iscev.com", password: "Sifre123" });
    expect(result.success).toBe(true);
  });

  test("TC-VAL-02 | E-posta küçük harfe dönüştürülmeli", () => {
    const result = adminLoginSchema.safeParse({ email: "ADMIN@ISCEV.COM", password: "Sifre123" });
    expect(result.success).toBe(true);
    expect(result.data.email).toBe("admin@iscev.com");
  });

  test("TC-VAL-03 | Geçersiz e-posta formatı reddedilmeli", () => {
    const result = adminLoginSchema.safeParse({ email: "gecersiz", password: "Sifre123" });
    expect(result.success).toBe(false);
  });

  test("TC-VAL-04 | Şifre < 6 karakter reddedilmeli", () => {
    const result = adminLoginSchema.safeParse({ email: "admin@iscev.com", password: "abc" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/6 karakter/);
  });

  test("TC-VAL-05 | Eksik alan reddedilmeli", () => {
    const result = adminLoginSchema.safeParse({ email: "admin@iscev.com" });
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// productSchema
// ─────────────────────────────────────────────────────────────────────────────
describe("productSchema", () => {
  const VALID_PRODUCT = {
    name:        "Reverse Osmoz Sistemi RO-5000",
    description: "Endüstriyel ters osmoz arıtma sistemi.",
    category:    "64a3f0b1c1234567890abcde",
  };

  test("TC-VAL-06 | Geçerli ürün verisi kabul edilmeli", () => {
    const result = productSchema.safeParse(VALID_PRODUCT);
    expect(result.success).toBe(true);
  });

  test("TC-VAL-07 | İsim > 200 karakter reddedilmeli", () => {
    const result = productSchema.safeParse({ ...VALID_PRODUCT, name: "A".repeat(201) });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/200 karakter/);
  });

  test("TC-VAL-08 | Açıklama > 500 karakter reddedilmeli", () => {
    const result = productSchema.safeParse({ ...VALID_PRODUCT, description: "B".repeat(501) });
    expect(result.success).toBe(false);
  });

  test("TC-VAL-09 | Negatif order değeri reddedilmeli", () => {
    const result = productSchema.safeParse({ ...VALID_PRODUCT, order: -1 });
    expect(result.success).toBe(false);
  });

  test("TC-VAL-10 | productUpdateSchema — tüm alanlar opsiyonel (partial) olmalı", () => {
    const result = productUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  test("TC-VAL-11 | productUpdateSchema — geçersiz alan hâlâ reddedilmeli", () => {
    const result = productUpdateSchema.safeParse({ name: "A".repeat(201) });
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// mapLocationSchema
// ─────────────────────────────────────────────────────────────────────────────
describe("mapLocationSchema", () => {
  const VALID_LOCATION = {
    projectName: "İstanbul OSB Arıtma Tesisi",
    latitude:    41.0082,
    longitude:   28.9784,
  };

  test("TC-VAL-12 | Geçerli lokasyon verisi kabul edilmeli", () => {
    const result = mapLocationSchema.safeParse(VALID_LOCATION);
    expect(result.success).toBe(true);
  });

  test("TC-VAL-13 | Enlem sınır dışı (> 90) reddedilmeli", () => {
    const result = mapLocationSchema.safeParse({ ...VALID_LOCATION, latitude: 91 });
    expect(result.success).toBe(false);
  });

  test("TC-VAL-14 | Boylam sınır dışı (< -180) reddedilmeli", () => {
    const result = mapLocationSchema.safeParse({ ...VALID_LOCATION, longitude: -181 });
    expect(result.success).toBe(false);
  });

  test("TC-VAL-15 | String koordinat coerce ile kabul edilmeli", () => {
    const result = mapLocationSchema.safeParse({ ...VALID_LOCATION, latitude: "41.5", longitude: "28.9" });
    expect(result.success).toBe(true);
    expect(typeof result.data.latitude).toBe("number");
  });

  test("TC-VAL-16 | mapLocationUpdateSchema — sadece boylam girilmesi reddedilmeli", () => {
    const result = mapLocationUpdateSchema.safeParse({ longitude: 28.9 });
    expect(result.success).toBe(false); // refine: lat & lon birlikte zorunlu
  });

  test("TC-VAL-17 | mapLocationUpdateSchema — ikisi birlikte girilince kabul edilmeli", () => {
    const result = mapLocationUpdateSchema.safeParse({ latitude: 41.0, longitude: 28.9 });
    expect(result.success).toBe(true);
  });
});
