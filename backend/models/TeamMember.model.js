const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  title:     { type: String, required: true, trim: true },
  bio:       { type: String, default: "" },
  linkedin:  { type: String, default: "" },
  photoPath: { type: String, default: null },
  order:     { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true, index: true },
}, { timestamps: true });

TeamMemberSchema.index({ order: 1 });

module.exports =
  mongoose.models.TeamMember || mongoose.model("TeamMember", TeamMemberSchema);
