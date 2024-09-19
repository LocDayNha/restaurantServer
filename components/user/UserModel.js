const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const user = new Schema({
  id: { type: ObjectId },
  email: { type: String },
  password: { type: String },
  name: { type: String },
  address: { type: String },
  phoneNumber: { type: String },
  gender: { type: String },
  birth: { type: String },
  role: { type: Number, default: 1 },
  image: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verifyCode: { type: Number },
  createAt: { type: Date, default: Date.now },
  //1:user,2:system,3:admin
});

module.exports = mongoose.models.user || mongoose.model('user', user);