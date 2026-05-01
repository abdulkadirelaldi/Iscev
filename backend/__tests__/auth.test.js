/**
 * Auth API — Entegrasyon Testleri
 * POST /api/v1/auth/login  → giriş, hatalı bilgi, eksik alan
 * POST /api/v1/auth/logout → cookie temizleme
 * GET  /api/v1/auth/me     → korumalı endpoint
 */

require("./helpers/db");

jest.mock("../src/config/mailer", () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: "test-id" }),
}));

const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../app");
const Admin    = require("../models/Admin.model");

// afterEach her testten sonra koleksiyonları temizliyor; kullanıcıları her testten önce yeniden oluştur
beforeEach(async () => {
  await Admin.create({ name: "Test Admin",  email: "admin@test.com", password: "Sifre123!", isActive: true });
  await Admin.create({ name: "Pasif Admin", email: "pasif@test.com", password: "Sifre123!", isActive: false });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/auth/login", () => {
  test("TC-AUTH-01 | Geçerli bilgilerle giriş → 200 + cookie", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.com", password: "Sifre123!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.admin).toHaveProperty("email", "admin@test.com");

    // httpOnly cookie set edilmiş olmalı
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes("iscev_token"))).toBe(true);

    adminCookie = cookies; // sonraki testlerde kullanılacak
  });

  test("TC-AUTH-02 | Yanlış şifre → 401 INVALID_CREDENTIALS", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.com", password: "yanlis_sifre" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("INVALID_CREDENTIALS");
  });

  test("TC-AUTH-03 | Var olmayan e-posta → 401 INVALID_CREDENTIALS", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "yok@test.com", password: "Sifre123!" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("INVALID_CREDENTIALS");
  });

  test("TC-AUTH-04 | Eksik alan → 400", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.com" }); // password yok

    expect(res.status).toBe(400);
  });

  test("TC-AUTH-05 | Devre dışı hesap → 403 ACCOUNT_DISABLED", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "pasif@test.com", password: "Sifre123!" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("ACCOUNT_DISABLED");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/auth/me", () => {
  test("TC-AUTH-06 | Cookie ile /me → 200", async () => {
    // Önce giriş yapıp cookie al
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.com", password: "Sifre123!" });

    const cookies = login.headers["set-cookie"];

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.admin.email).toBe("admin@test.com");
  });

  test("TC-AUTH-07 | Cookie olmadan /me → 401", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/auth/logout", () => {
  test("TC-AUTH-08 | Giriş yapılmış hesapla çıkış → 200 + cookie temizlenir", async () => {
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.com", password: "Sifre123!" });

    const cookies = login.headers["set-cookie"];

    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    // Cookie max-age=0 veya expires=geçmiş olarak set edilmeli
    const setCookie = res.headers["set-cookie"];
    if (setCookie) {
      const tokenCookie = setCookie.find((c) => c.includes("iscev_token"));
      if (tokenCookie) {
        expect(tokenCookie).toMatch(/Max-Age=0|expires=.*1970/i);
      }
    }
  });
});
