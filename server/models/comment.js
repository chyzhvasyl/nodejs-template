const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	body: {
		type: String,
		required: true,
		trim: true
	},
	confirmation: {
		type: Boolean,
		required: true,
		default: false
	},
	timeOfCreation: {
		type: Date,
		required: true,
		default: Date.now
	},
	timeOfPublication: {
		type: Date,
		default: Date.now 
	},
	article: { type: Schema.Types.ObjectId, ref: 'article' },
	user: { type: Schema.Types.ObjectId, ref: 'user'}
}, { versionKey: false });

const Comment = mongoose.model('comment', commentSchema);
module.exports = Comment;