const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    telephone: {
        type: String,
        required:true,
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
    article: { type: Schema.Types.ObjectId, ref: 'Article' },
    user: { type: Schema.Types.ObjectId, ref: 'User'}
});

const Comment = mongoose.model('comment', commentSchema);
module.exports = Comment;