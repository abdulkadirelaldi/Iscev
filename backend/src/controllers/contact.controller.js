const asyncHandler     = require('../utils/asyncHandler');
const contactService   = require('../services/contact.service');

// ─── Basit e-posta format kontrolü (Zod olmadan) ─────────────────────────────
const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

/**
 * @route   POST /api/v1/contact
 * @desc    Ziyaretçi iletişim formu gönderimi.
 * @access  Public
 */
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Ad, e-posta, konu ve mesaj alanları zorunludur.',
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Geçerli bir e-posta adresi giriniz.',
    });
  }

  const msg = await contactService.createMessage({ name, email, subject, message });
  res.status(201).json({
    success: true,
    message: 'Mesajınız alındı. En kısa sürede dönüş yapılacaktır.',
    data: { id: msg._id },
  });
});

/**
 * @route   GET /api/v1/contact
 * @desc    Tüm mesajları listele (status filtresi + sayfalama).
 * @access  Private (Admin)
 */
const getMessages = asyncHandler(async (req, res) => {
  const data = await contactService.getAllMessages(req.query);
  res.status(200).json({ success: true, message: 'Mesajlar getirildi.', data });
});

/**
 * @route   GET /api/v1/contact/unread-count
 * @access  Private (Admin)
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await contactService.getUnreadCount();
  res.status(200).json({ success: true, message: 'Okunmamış mesaj sayısı.', data: { count } });
});

/**
 * @route   PATCH /api/v1/contact/:id/read
 * @access  Private (Admin)
 */
const markAsRead = asyncHandler(async (req, res) => {
  const msg = await contactService.markAsRead(req.params.id);
  res.status(200).json({ success: true, message: 'Mesaj okundu olarak işaretlendi.', data: { message: msg } });
});

/**
 * @route   POST /api/v1/contact/:id/reply
 * @access  Private (Admin)
 */
const replyMessage = asyncHandler(async (req, res) => {
  const { replyText } = req.body;

  if (!replyText?.trim()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Cevap metni zorunludur.',
    });
  }

  const msg = await contactService.replyMessage(req.params.id, replyText.trim());
  res.status(200).json({ success: true, message: 'Cevap gönderildi.', data: { message: msg } });
});

/**
 * @route   DELETE /api/v1/contact/:id
 * @access  Private (Admin)
 */
const deleteMessage = asyncHandler(async (req, res) => {
  await contactService.deleteMessage(req.params.id);
  res.status(200).json({ success: true, message: 'Mesaj silindi.', data: null });
});

module.exports = {
  submitContact,
  getMessages,
  getUnreadCount,
  markAsRead,
  replyMessage,
  deleteMessage,
};
