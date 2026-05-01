const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Başlık zorunludur."],
      trim: true,
      maxlength: [300, "Başlık 300 karakteri geçemez."],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "İçerik zorunludur."],
    },
    excerpt: {
      type: String,
      maxlength: [500, "Özet 500 karakteri geçemez."],
    },
    author: {
      type: String,
      required: [true, "Yazar alanı zorunludur."],
      trim: true,
      maxlength: [100, "Yazar adı 100 karakteri geçemez."],
    },
    coverImagePath: {
      type: String,
      required: [true, "Kapak görseli zorunludur."],
      validate: {
        validator: (v) => v.startsWith("uploads/"),
        message: "Dosya yolu 'uploads/' ile başlamalıdır.",
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ["draft", "published"],
        message: "Durum 'draft' veya 'published' olmalıdır.",
      },
      default: "draft",
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    metaTitle: {
      type: String,
      maxlength: [70, "Meta başlık 70 karakteri geçemez."],
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta açıklama 160 karakteri geçemez."],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ isDeleted: 1, status: 1 });
BlogSchema.index({ tags: 1 });

BlogSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Blog", BlogSchema);
