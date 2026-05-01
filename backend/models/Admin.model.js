const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ad alanı zorunludur."],
      trim: true,
      maxlength: [100, "Ad 100 karakteri geçemez."],
    },
    email: {
      type: String,
      required: [true, "Email alanı zorunludur."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Geçerli bir email adresi giriniz."],
    },
    password: {
      type: String,
      required: [true, "Şifre alanı zorunludur."],
      minlength: [8, "Şifre en az 8 karakter olmalıdır."],
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

AdminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

AdminSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtIssuedAt < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
