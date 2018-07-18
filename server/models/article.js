const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  body: {
    type: String,
    required: true,
    maxlength: 250,
    trim: true
  },
  img: { 
    name: String,
    data: Buffer,
    contentType: String 
  },
  timeOfCreation: {
    type: Date,
    // required: true,
    default: Date.now 
  },
  timeOfPublication: {
    type: Date
  },
  category: {
    type: String,
    required: true,
    enum: ['social', 'politics', 'sports']
  },
  confirmation: {
    type: Boolean,
    required: false,
    default: false
  },
  status: {
    type: String,
    required: true,
    enum: ['created', 'modified', 'published']
  },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});


const Article  = mongoose.model('article', articleSchema);
module.exports = Article;