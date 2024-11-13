const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ratingfood = new Schema({
    id: { type: ObjectId },
    user_id: { type: ObjectId, ref: "user" },
    menu_id: { type: ObjectId, ref: "menu" },
    content: { type: String },
    star: { type: Number },
    image: { type: String },
    daytimeCreate: { type: String },
});

module.exports = mongoose.models.ratingfood || mongoose.model('ratingfood', ratingfood);