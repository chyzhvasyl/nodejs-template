const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
	fileType: {
		type: String
	},
	filename: {
		type: String,
		required: true
	},
	contentType: {
		type: String,
		required: true
	},
	timeOfCreation: {
		type: Date, 
		default: Date.now()
	},
	article: { type: Schema.Types.ObjectId, ref: 'article' }
}, { versionKey: false });

const File = mongoose.model('file', fileSchema);
module.exports = File;