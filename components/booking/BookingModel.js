const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const booking = new Schema({
  id: { type: ObjectId },
  dayBooking: { type: String },
  timeCreate: { type: String },
  dayCreate: { type: String },
  notification: { type: Boolean, default: false },
  user_id: { type: ObjectId, ref: "user" },
  table_id: { type: ObjectId, ref: "table" },
});

module.exports = mongoose.models.booking || mongoose.model('booking', booking);