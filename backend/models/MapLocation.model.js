const mongoose = require("mongoose");

const MapLocationSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Proje/santral adı zorunludur."],
      trim: true,
      maxlength: [200, "Proje adı 200 karakteri geçemez."],
    },
    description: {
      type: String,
      default: "",
      maxlength: [1000, "Açıklama 1000 karakteri geçemez."],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: [true, "Koordinatlar zorunludur."],
        validate: {
          validator: function (coords) {
            if (!Array.isArray(coords) || coords.length !== 2) return false;
            const [lng, lat] = coords;
            return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
          },
          message: "Koordinatlar [longitude, latitude] formatında ve geçerli aralıkta olmalıdır.",
        },
      },
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, "Ülke adı 100 karakteri geçemez."],
    },
    imageFilePath: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return v.startsWith("uploads/");
        },
        message: "Görsel yolu 'uploads/' ile başlamalıdır.",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

MapLocationSchema.index({ location: "2dsphere" });

MapLocationSchema.virtual("latitude").get(function () {
  return this.location?.coordinates?.[1];
});

MapLocationSchema.virtual("longitude").get(function () {
  return this.location?.coordinates?.[0];
});

MapLocationSchema.statics.createFromLatLng = function (data, lat, lng) {
  return this.create({
    ...data,
    location: { type: "Point", coordinates: [lng, lat] },
  });
};

module.exports = mongoose.model("MapLocation", MapLocationSchema);
