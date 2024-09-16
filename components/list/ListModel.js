const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const menulist = new Schema({
  id: { type: ObjectId },
});

module.exports = mongoose.models.menulist || mongoose.model('menulist', menulist);