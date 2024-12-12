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
  quantity: { type: Number, default: '' },
  totalMoney: { type: Number, default: '' },
  isPayment: { type: Boolean, default: false },
  paymentActive: { type: Number, default: 1 }, // 1 chua thanh toan, 2 da thanh toan, 3 qua han thanh toan
  notification: { type: Boolean, default: false },
  confirm:{ type: Number, default: 1 }, // 1 cho xac nhan, 2 thanh cong, 3 da huy
  user_id: { type: ObjectId, ref: "user" },
  table_id: { type: ObjectId, ref: "table" },
});

module.exports = mongoose.models.booking || mongoose.model('booking', booking);