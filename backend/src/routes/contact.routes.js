const express    = require("express");
const rateLimit  = require("express-rate-limit");
const c = require("../controllers/contact.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// İletişim formu spam koruması: 15 dakikada 5 gönderim / IP
// Test ortamında devre dışı — tekrarlı test çalıştırmaları limiti tetikler
const contactLimiter = process.env.NODE_ENV === 'test'
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: "TOO_MANY_REQUESTS",
        message: "Çok fazla mesaj gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.",
      },
    });

router.post("/",               contactLimiter, c.submitContact);   // public
router.get("/",        protect, c.getMessages);           // admin
router.get("/unread-count", protect, c.getUnreadCount);   // admin
router.patch("/:id/read",  protect, c.markAsRead);        // admin
router.post("/:id/reply",  protect, c.replyMessage);      // admin
router.delete("/:id",      protect, c.deleteMessage);     // admin

module.exports = router;
