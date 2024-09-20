const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const menulist = new Schema({
  id: { type: ObjectId },
  menu: { type: ObjectId, ref: "menu" },
  user: { type: ObjectId, ref: "user" },
  quantity: { type: Number, default: '1' },
});

module.exports = mongoose.models.menulist || mongoose.model('menulist', menulist);