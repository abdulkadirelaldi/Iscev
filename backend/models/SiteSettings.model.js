const mongoose = require("mongoose");

const CarouselItemSchema = new mongoose.Schema(
  {
    imagePath: {
      type: String,
      required: [true, "Carousel görseli zorunludur."],
      validate: {
        validator: (v) => v.startsWith("uploads/"),
        message: "Dosya yolu 'uploads/' ile başlamalıdır.",
      },
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Carousel başlığı 200 karakteri geçemez."],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, "Carousel alt başlığı 300 karakteri geçemez."],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const ContactInfoSchema = new mongoose.Schema(
  {
    address: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      validate: {
        validator: (v) => !v || /^\S+@\S+\.\S+$/.test(v),
        message: "Geçerli bir email adresi giriniz.",
      },
    },
    whatsappNumber: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (v) => !v || /^\+?[0-9\s\-().]{7,20}$/.test(v),
        message: "Geçerli bir WhatsApp numarası giriniz.",
      },
    },
    linkedinUrl: { type: String, trim: true, default: "" },
    instagramUrl: { type: String, trim: true, default: "" },
    mapEmbedUrl: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const SiteSettingsSchema = new mongoose.Schema(
  {
    instanceKey: {
      type: String,
      default: "main",
      unique: true,
      immutable: true,
    },
    carousel: {
      type: [CarouselItemSchema],
      default: [],
    },
    introVideoPath: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return v.startsWith("uploads/");
        },
        message: "Video yolu 'uploads/' ile başlamalıdır.",
      },
    },
    contactInfo: {
      type: ContactInfoSchema,
      default: () => ({}),
    },
    corporateSection: {
      subtitle: { type: String, trim: true, default: "Kurumsal Vizyonumuz" },
      title:    { type: String, trim: true, default: "Su Kaynaklarını Geleceğe Taşıyan Teknoloji" },
      bodyText: { type: String, trim: true, default: "" },
      stats: {
        type: [{
          value: { type: String, trim: true, default: "" },
          label: { type: String, trim: true, default: "" },
          _id: false,
        }],
        default: [
          { value: "50+", label: "Tamamlanan Proje" },
          { value: "18+", label: "Ülkede Varlık" },
          { value: "25+", label: "Yıllık Deneyim" },
          { value: "%99", label: "Müşteri Memnuniyeti" },
        ],
      },
    },
  },
  { timestamps: true }
);

SiteSettingsSchema.statics.getInstance = async function () {
  let settings = await this.findOne({ instanceKey: "main" });
  if (!settings) {
    settings = await this.create({ instanceKey: "main" });
  }
  return settings;
};

module.exports = mongoose.model("SiteSettings", SiteSettingsSchema);
