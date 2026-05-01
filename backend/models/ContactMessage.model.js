const mongoose = require("mongoose");

const ContactMessageSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true, maxlength: 100 },
  email:     { type: String, required: true, trim: true, lowercase: true },
  subject:   { type: String, required: true, trim: true, maxlength: 200 },
  message:   { type: String, required: true, trim: true, maxlength: 2000 },
  status:    { type: String, enum: ["new", "read", "replied"], default: "new", index: true },
  replyText: { type: String, default: null },
  repliedAt: { type: Date,   default: null },
}, { timestamps: true });

ContactMessageSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.ContactMessage || mongoose.model("ContactMessage", ContactMessageSchema);
