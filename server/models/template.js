const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const templateSchema = new Schema({
    generalStyles: {
        fontSizeMetric: String,
        backgroundColor: String,
    },
    articleStyles: {
        shortBody: {
            length: String,
            fontSize: String 
        },
        body: {
            length: String,
            fontSize: String 
        },
        title: { 
            length: String,
            fontSize: String 
        },
    },
    article: { type: Schema.Types.ObjectId, ref: 'article' }
}, { versionKey: false });

const Template = mongoose.model('template', templateSchema);
module.exports = Template;