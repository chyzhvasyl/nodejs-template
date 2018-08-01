const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const templateSchema = new Schema({
    generalStyles: {
        fontSizeMetric: String,
        backgroundColor: String,
    },
    articleStyles: {
        body: {
            fontSize: String,
            bgColor: String 
        },
        title: { 
            fontSize: String,
            bgColor: String 
        },
    },
    article: { type: Schema.Types.ObjectId, ref: 'article' }
}, { versionKey: false });

const Template = mongoose.model('template', templateSchema);
module.exports = Template;