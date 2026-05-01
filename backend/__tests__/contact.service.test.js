/**
 * contact.service — Birim Testleri
 * createMessage, getAllMessages (filtre + sayfalama),
 * markAsRead, getUnreadCount, deleteMessage
 *
 * replyMessage e-posta gönderdiği için ayrı mock gerektirir — burada test dışı.
 */

require("./helpers/db");

jest.mock("../src/config/mailer", () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: "test" }),
}));

const mongoose       = require("mongoose");
const contactService = require("../src/services/contact.service");
const ContactMessage = require("../models/ContactMessage.model");

const makeMsg = (overrides = {}) => ({
  name:    "Ali Veli",
  email:   "ali@example.com",
  subject: "Bilgi Talebi",
  message: "Ürünleriniz hakkında bilgi almak istiyorum.",
  status:  "new",
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
describe("contactService.createMessage", () => {
  test("TC-CS-01 | Mesaj oluşturulmalı ve varsayılan status 'new' olmalı", async () => {
    const msg = await contactService.createMessage(makeMsg());
    expect(msg._id).toBeDefined();
    expect(msg.status).toBe("new");
  });

  test("TC-CS-02 | E-posta küçük harfe normalize edilmeli", async () => {
    const msg = await contactService.createMessage(makeMsg({ email: "ALI@EXAMPLE.COM" }));
    expect(msg.email).toBe("ali@example.com");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("contactService.getAllMessages", () => {
  beforeEach(async () => {
    await ContactMessage.create([
      makeMsg({ status: "new"     }),
      makeMsg({ status: "new"     }),
      makeMsg({ status: "read"    }),
      makeMsg({ status: "replied" }),
    ]);
  });

  test("TC-CS-03 | Tüm mesajlar döndürülmeli", async () => {
    const { total } = await contactService.getAllMessages();
    expect(total).toBe(4);
  });

  test("TC-CS-04 | status filtresi çalışmalı", async () => {
    const { messages, total } = await contactService.getAllMessages({ status: "new" });
    expect(total).toBe(2);
    messages.forEach((m) => expect(m.status).toBe("new"));
  });

  test("TC-CS-05 | Sayfalama çalışmalı", async () => {
    const { messages, total, totalPages } =
      await contactService.getAllMessages({ limit: 2, page: 1 });
    expect(total).toBe(4);
    expect(messages).toHaveLength(2);
    expect(totalPages).toBe(2);
  });

  test("TC-CS-06 | Mesajlar createdAt azalan sırada gelmeli", async () => {
    const { messages } = await contactService.getAllMessages();
    for (let i = 1; i < messages.length; i++) {
      expect(new Date(messages[i - 1].createdAt).getTime())
        .toBeGreaterThanOrEqual(new Date(messages[i].createdAt).getTime());
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("contactService.getUnreadCount", () => {
  test("TC-CS-07 | Okunmamış mesaj sayısı doğru dönmeli", async () => {
    await ContactMessage.create([
      makeMsg({ status: "new"  }),
      makeMsg({ status: "new"  }),
      makeMsg({ status: "read" }),
    ]);
    const count = await contactService.getUnreadCount();
    expect(count).toBe(2);
  });

  test("TC-CS-08 | Hiç mesaj yoksa 0 dönmeli", async () => {
    const count = await contactService.getUnreadCount();
    expect(count).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("contactService.markAsRead", () => {
  test("TC-CS-09 | new → read: status güncellenmeli", async () => {
    const msg = await ContactMessage.create(makeMsg({ status: "new" }));
    const updated = await contactService.markAsRead(msg._id.toString());
    expect(updated.status).toBe("read");
  });

  test("TC-CS-10 | Zaten read olan mesaj değişmemeli", async () => {
    const msg = await ContactMessage.create(makeMsg({ status: "read" }));
    const updated = await contactService.markAsRead(msg._id.toString());
    expect(updated.status).toBe("read");
  });

  test("TC-CS-11 | Var olmayan ID → 404 NOT_FOUND", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(contactService.markAsRead(fakeId))
      .rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("contactService.deleteMessage", () => {
  test("TC-CS-12 | Mesaj silinmeli", async () => {
    const msg = await ContactMessage.create(makeMsg());
    await contactService.deleteMessage(msg._id.toString());
    expect(await ContactMessage.findById(msg._id)).toBeNull();
  });

  test("TC-CS-13 | Var olmayan ID → 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(contactService.deleteMessage(fakeId))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
