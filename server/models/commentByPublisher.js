const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentByPublisherSchema = new Schema({
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
	time: {
		type: Date,
		required: true,
		default: Date.now
	},
	article: { type: Schema.Types.ObjectId, ref: 'article' },
	user: { type: Schema.Types.ObjectId, ref: 'user'}
}, { versionKey: false });

const CommentByPublisher = mongoose.model('commentByPublisher', commentByPublisherSchema);
module.exports = CommentByPublisher;