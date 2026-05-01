const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ürün adı zorunludur."],
      trim: true,
      maxlength: [200, "Ürün adı 200 karakteri geçemez."],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Kısa açıklama zorunludur."],
      maxlength: [500, "Kısa açıklama 500 karakteri geçemez."],
    },
    content: {
      type: String,
      default: "",
    },
    // Dinamik kategori — Category koleksiyonuna ObjectId referansı
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Kategori zorunludur."],
      index: true,
    },
    coverImagePath: {
      type: String,
      required: [true, "Kapak görseli zorunludur."],
      validate: {
        validator: (v) => v.startsWith("uploads/"),
        message: "Dosya yolu 'uploads/' ile başlamalıdır.",
      },
    },
    galleryImagePaths: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((v) => v.startsWith("uploads/")),
        message: "Tüm galeri yolları 'uploads/' ile başlamalıdır.",
      },
    },
    technicalSpecs: {
      type: Map,
      of: String,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
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

ProductSchema.index({ category: 1, isActive: 1 });

ProductSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  next();
});

module.exports =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
