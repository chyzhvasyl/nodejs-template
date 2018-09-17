const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const templateSchema = new Schema({
	// TODO: required : true
	generalStyles: {
		fontSizeMetric: String,
		backgroundColor: String,
	},
	articleStyles: {
		shortBody: {
			length: Number,
			fontSize: Number
		},
		body: {
			length: Number,
			fontSize: Number
		},
		title: { 
			length: Number,
			fontSize: Number 
		},
	},
	cookieLifeTime : {
		type: Number
	},
	article: { type: Schema.Types.ObjectId, ref: 'article' }
}, { versionKey: false });

const Template = mongoose.model('template', templateSchema);
module.exports = Template;