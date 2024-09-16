const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const timeline = new Schema({
  id: { type: ObjectId },
  name: { type: String },
});

module.exports = mongoose.models.timeline || mongoose.model('timeline', timeline);