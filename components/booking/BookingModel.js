const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const booking = new Schema({
  id: { type: ObjectId },
  dayBooking: { type: String, default: '' },
  timeCreate: { type: String, default: '' },
  dayCreate: { type: String, default: '' },
  seat: { type: Number, default: '' },
  dishes: { type: Array, default: [] },
  isPayment: { type: Boolean, default: false },
  notification: { type: Boolean, default: false },
  user_id: { type: ObjectId, ref: "user" },
  table_id: { type: ObjectId, ref: "table" },
});

module.exports = mongoose.models.booking || mongoose.model('booking', booking);