const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const table = new Schema({
  id: { type: ObjectId },
  number: { type: Number },
  userNumber: { type: String },
  timeline_id: { type: ObjectId, ref: "timeline" },
  isActive: { type: Boolean, default: true },
  createAt: { type: String },
});

module.exports = mongoose.models.table || mongoose.model('table', table);