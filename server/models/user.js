const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    // TODO: required : true
    token: {
        type: String,
        required: true,
        trim: true
    },
    login: {
        type: String,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        // required: true,
        trim: true
    },
    lastName: {
        type: String,
        // required: true,
        trim: true
    },
    secondaryName: {
        type: String,
        // required: true,
        trim: true
    },
    roles: [String]

}, { versionKey: false });

const User = mongoose.model('user', userSchema);
module.exports = User;