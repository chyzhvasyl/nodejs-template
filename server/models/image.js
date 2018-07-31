const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    filename: String,
    originalname: String,
    contentType: String,
    created: {type: Date, default: Date.now()},
});

const Img = mongoose.model('image', imageSchema);
module.exports = Img;