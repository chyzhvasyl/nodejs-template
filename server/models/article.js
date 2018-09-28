const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	shortBody: {
		type: String,
		trim: true,
		required: true
	},
	body: {
		type: String,
		required: true,
		trim: true
	},
	timeOfCreation: {
		type: Date,
		default: Date.now 
	},
	timeOfPublication: {
		type: Date,
		default: Date.now 
	},
	confirmation: {
		type: Boolean,
		required: true,
		default: false
	},
	status: {
		type: String,
		required: true,
		enum: ['created', 'modified', 'not approved by editor', 'not approved by publisher', 'published']
	},
	likes: {
		type: Number,
		default: 0
	},
	category: { type: Schema.Types.ObjectId, ref: 'category' },
	file: { type: Schema.Types.ObjectId, ref: 'file' },
	user: { type: Schema.Types.ObjectId, ref: 'user' },
	template: { type: Schema.Types.ObjectId, ref: 'template' },
	comments: [{ type: Schema.Types.ObjectId, ref: 'comment' }],
	commentsByEditor: [{ type: Schema.Types.ObjectId, ref: 'commentByEditor' }],
	commentsByPublisher: [{ type: Schema.Types.ObjectId, ref: 'commentByPublisher' }]
}, { versionKey: false });

articleSchema.methods.toJSONObject = function () {
	return this.toObject();
};

const Article  = mongoose.model('article', articleSchema);
module.exports = Article;