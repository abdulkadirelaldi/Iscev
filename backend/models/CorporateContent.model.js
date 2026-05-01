const mongoose = require("mongoose");

const statItemSchema  = new mongoose.Schema({ val: String, label: String }, { _id: true });
const valueItemSchema = new mongoose.Schema({ title: { type: String, required: true }, desc: String, icon: { type: String, default: "💧" }, order: { type: Number, default: 0 } }, { _id: true });
const milestoneSchema = new mongoose.Schema({ year: { type: String, required: true }, title: { type: String, required: true }, desc: String, icon: { type: String, default: "📌" }, order: { type: Number, default: 0 } }, { _id: true });
const regionSchema    = new mongoose.Schema({ region: { type: String, required: true }, flag: { type: String, default: "🌍" }, projects: { type: Number, default: 0 }, countries: [String], order: { type: Number, default: 0 } }, { _id: true });
const certSchema      = new mongoose.Schema({ code: { type: String, required: true }, label: String, desc: String, color: { type: String, default: "#1B3F84" }, order: { type: Number, default: 0 } }, { _id: true });

const CorporateContentSchema = new mongoose.Schema({
  instanceKey: { type: String, default: "main", unique: true, immutable: true },
  heroStats:   { type: [statItemSchema],  default: [] },
  values:      { type: [valueItemSchema], default: [] },
  milestones:  { type: [milestoneSchema], default: [] },
  globalStats: { type: [statItemSchema],  default: [] },
  regions:     { type: [regionSchema],    default: [] },
  certs:       { type: [certSchema],      default: [] },
}, { timestamps: true });

CorporateContentSchema.statics.getInstance = async function () {
  let doc = await this.findOne({ instanceKey: "main" });
  if (!doc) doc = await this.create({ instanceKey: "main" });
  return doc;
};

module.exports =
  mongoose.models.CorporateContent || mongoose.model("CorporateContent", CorporateContentSchema);
