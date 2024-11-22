const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const rating = new Schema({
    id: { type: ObjectId },
    user_id: { type: ObjectId, ref: "user" },
    content: { type: String },
    star: { type: Number },
    image: { type: String },
    daytimeCreate: { type: String },
});

module.exports = mongoose.models.rating || mongoose.model('rating', rating);