const mongoose = require("mongoose");

const CatalogSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Katalog adı zorunludur."],
      trim: true,
      maxlength: [200, "Katalog adı 200 karakteri geçemez."],
    },
    pdfFilePath: {
      type: String,
      required: [true, "PDF dosya yolu zorunludur."],
      validate: {
        validator: (v) => v.startsWith("uploads/") && v.endsWith(".pdf"),
        message: "PDF yolu 'uploads/' ile başlamalı ve '.pdf' ile bitmelidir.",
      },
    },
    coverImagePath: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return v.startsWith("uploads/");
        },
        message: "Kapak görseli yolu 'uploads/' ile başlamalıdır.",
      },
    },
    language: {
      type: String,
      default: "tr",
      enum: {
        values: ["tr", "en", "de", "fr", "ar", "ru"],
        message: "Desteklenmeyen dil kodu.",
      },
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
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
  },
  { timestamps: true }
);

CatalogSchema.index({ language: 1, isActive: 1 });
CatalogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Catalog", CatalogSchema);
