const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Kategori adı zorunludur."],
      trim: true,
      unique: true,
      maxlength: [100, "Kategori adı 100 karakteri geçemez."],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

CategorySchema.pre("save", function (next) {
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
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
