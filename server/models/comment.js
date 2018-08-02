const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    emailOrTelephone: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    confirmation: {
        type: Boolean,
        required: true
    },
    time: {
        type: Date,
        required: true,
        default: Date.now
    },
    article: { type: Schema.Types.ObjectId, ref: 'article' },
    user: { type: Schema.Types.ObjectId, ref: 'user'}
}, { versionKey: false });

const Comment = mongoose.model('comment', commentSchema);
module.exports = Comment;