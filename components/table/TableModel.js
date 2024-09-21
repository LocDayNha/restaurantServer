const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const table = new Schema({
  id: { type: ObjectId },
  isOrder: { type: Boolean, default: false },
  number: { type: Number },
  userNumber: { type: String },
  timeline_id: { type: ObjectId, ref: "timeline" },
});

module.exports = mongoose.models.table || mongoose.model('table', table);