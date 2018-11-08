const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	token: {
		type: String,
		required: true,
		trim: true
	},
	tokenRefreshTime: {
		type: Date,
		default: Date.now
	},
	login: {
		type: String,
		required: true,
		trim: true,
		index: true,
		lowercase: true
	},
	firstName: {
		type: String,
		trim: true
	},
	lastName: {
		type: String,
		trim: true
	},
	secondaryName: {
		type: String,
		trim: true
	},
	roles: [String]
}, { versionKey: false });

const User = mongoose.model('user', userSchema);
module.exports = User;