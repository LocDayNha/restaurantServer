const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const category = new Schema({
  id: { type: ObjectId },
  name: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.models.category || mongoose.model('category', category);