const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const templateSchema = new Schema({
    styles: [
        {
            name: "generalStyles",
            values: {
                "fontSizeMetric": string,
                "backgroundColor": string,
            }
        },
        {
            name: "articleStyles",
            values: {
                "body": {
                    "fontSize": string,
                    "bgColor" : string 
                },
                "title": {
                    "fontSize": string,
                    "bgColor" : string 
                },
            }
        }
    ],
    article: { type: Schema.Types.ObjectId, ref: 'article' }
});

const Template = mongoose.model('template', templateSchema);
module.exports = Template;