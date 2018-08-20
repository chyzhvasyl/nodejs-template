const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    fileType: {
        type: String,
        required: true
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
}, { versionKey: false });

const File = mongoose.model('file', fileSchema);
module.exports = File;