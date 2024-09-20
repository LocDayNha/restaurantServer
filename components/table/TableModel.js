const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const table = new Schema({
  id: { type: ObjectId },
  dayTime: { type: String },
  number: { type: Number },
  userNumber: { type: String },
  timeline: { type: ObjectId, ref: "timeline" },
});

module.exports = mongoose.models.table || mongoose.model('table', table);