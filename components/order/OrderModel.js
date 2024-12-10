const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const order = new Schema({
    id: { type: ObjectId },
    numberTable: { type: Number },
    dishes: { type: Array },
    quantity: { type: Number },
    totalMoney: { type: Number },
    isPayment: { type: Boolean, default: false },
    timeOrder: { type: String },
    dayOrder: { type: String },
});

module.exports = mongoose.models.order || mongoose.model('order', order);