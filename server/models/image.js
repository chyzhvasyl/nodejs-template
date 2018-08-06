const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    filename: String,
    contentType: String,
    created: {type: Date, default: Date.now()},
}, { versionKey: false });

const Img = mongoose.model('image', imageSchema);
module.exports = Img;