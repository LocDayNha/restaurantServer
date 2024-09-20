const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const booking = new Schema({
  id: { type: ObjectId },
  user: { type: ObjectId, ref: "user" },
  table: { type: ObjectId, ref: "table" },
});

module.exports = mongoose.models.booking || mongoose.model('booking', booking);