const ContactMessage = require('../../models/ContactMessage.model');
const transporter    = require('../config/mailer');

const createError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const createMessage = async (data) => {
  const { name, email, subject, message } = data;
  return ContactMessage.create({ name, email, subject, message, status: 'new' });
};

const getAllMessages = async ({ status, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [messages, total] = await Promise.all([
    ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    ContactMessage.countDocuments(filter),
  ]);

  return {
    messages,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  };
};

const markAsRead = async (id) => {
  const msg = await ContactMessage.findById(id);
  if (!msg) throw createError('Mesaj bulunamadı.', 404, 'NOT_FOUND');

  if (msg.status === 'new') {
    msg.status = 'read';
    await msg.save();
  }
  return msg;
};

const getUnreadCount = async () => {
  return ContactMessage.countDocuments({ status: 'new' });
};

const replyMessage = async (id, replyText) => {
  const msg = await ContactMessage.findById(id);
  if (!msg) throw createError('Mesaj bulunamadı.', 404, 'NOT_FOUND');

  // Veritabanını güncelle
  msg.status    = 'replied';
  msg.replyText = replyText;
  msg.repliedAt = new Date();
  await msg.save();

  // E-posta gönder
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to:   msg.email,
    subject: `Re: ${msg.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>${replyText}</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
        <p style="color: #888; font-size: 13px;">
          <strong>İSÇEV Arıtma ve Çevre Teknolojileri</strong><br/>
          Bu e-posta <em>${msg.name}</em> adına gönderilen mesajınıza yanıt olarak iletilmiştir.
        </p>
      </div>
    `,
  });

  return msg;
};

const deleteMessage = async (id) => {
  const msg = await ContactMessage.findById(id);
  if (!msg) throw createError('Mesaj bulunamadı.', 404, 'NOT_FOUND');
  await msg.deleteOne();
};

module.exports = {
  createMessage,
  getAllMessages,
  markAsRead,
  getUnreadCount,
  replyMessage,
  deleteMessage,
};
