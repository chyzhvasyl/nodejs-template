const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    article: { type: Schema.Types.ObjectId, ref: 'article' }
}, { versionKey: false });

const Category = mongoose.model('category', categorySchema);
module.exports = Category;