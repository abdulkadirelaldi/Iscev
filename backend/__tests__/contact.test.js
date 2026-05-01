/**
 * Contact API — Entegrasyon Testleri
 * POST /api/v1/contact → rate limit, validasyon, başarılı kayıt
 * GET  /api/v1/contact → admin koruması
 */

require("./helpers/db");

// Nodemailer'i mockla — gerçek SMTP bağlantısına gerek yok
jest.mock("../src/config/mailer", () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: "test-id" }),
}));

const request = require("supertest");
const app     = require("../app");

const VALID_PAYLOAD = {
  name:    "Ahmet Yılmaz",
  email:   "ahmet@example.com",
  subject: "Ürün Fiyatı Sorgusu",
  message: "Reverse osmoz sistemi hakkında bilgi almak istiyorum.",
};

describe("POST /api/v1/contact", () => {
  test("TC-CONTACT-01 | Geçerli mesaj kaydedilmeli → 201", async () => {
    const res = await request(app).post("/api/v1/contact").send(VALID_PAYLOAD);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
  });

  test("TC-CONTACT-02 | Zorunlu alan eksik → 400 VALIDATION_ERROR", async () => {
    const res = await request(app)
      .post("/api/v1/contact")
      .send({ name: "Ali", email: "ali@example.com" }); // subject ve message eksik
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  test("TC-CONTACT-03 | Geçersiz e-posta formatı → 400", async () => {
    const res = await request(app)
      .post("/api/v1/contact")
      .send({ ...VALID_PAYLOAD, email: "gecersiz-email" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  test("TC-CONTACT-04 | Boş string alanlar → 400", async () => {
    const res = await request(app)
      .post("/api/v1/contact")
      .send({ name: "  ", email: "test@test.com", subject: "Konu", message: "Mesaj" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/contact", () => {
  test("TC-CONTACT-05 | Token olmadan → 401", async () => {
    const res = await request(app).get("/api/v1/contact");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/contact/unread-count", () => {
  test("TC-CONTACT-06 | Token olmadan → 401", async () => {
    const res = await request(app).get("/api/v1/contact/unread-count");
    expect(res.status).toBe(401);
  });
});
