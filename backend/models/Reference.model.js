const mongoose = require("mongoose");

const ReferenceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Firma/proje adı zorunludur."],
      trim: true,
      maxlength: [200, "Ad 200 karakteri geçemez."],
    },
    logoPath: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return v.startsWith("uploads/");
        },
        message: "Logo yolu 'uploads/' ile başlamalıdır.",
      },
    },
    sector: {
      type: String,
      trim: true,
      maxlength: [100, "Sektör 100 karakteri geçemez."],
      default: "",
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Konum 100 karakteri geçemez."],
      default: "",
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

ReferenceSchema.index({ sector: 1, isActive: 1 });

module.exports =
  mongoose.models.Reference || mongoose.model("Reference", ReferenceSchema);
