const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const user = new Schema({
  id: { type: ObjectId },
  name: { type: String },
  email: { type: String },
  password: { type: String },
  address: { type: String },
  phoneNumber: { type: String },
  gender: { type: String },
  role: { type: Number, default: 1 },
  image: { type: String, default: '' },
  //1:user,2:system,3:admin
});

module.exports = mongoose.models.user || mongoose.model('user', user);