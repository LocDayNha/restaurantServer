const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const menu = new Schema({
  id: { type: ObjectId },
  image: { type: String, default: '' },
  name: { type: String },
  price: { type: String },
  category: { type: ObjectId, ref: "category" },
  quantity: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.models.menu || mongoose.model('menu', menu);