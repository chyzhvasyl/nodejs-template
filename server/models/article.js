const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  title: {
    type: String,
    required: true,
    // maxlength: 100,
    trim: true
  },
  body: {
    type: String,
    required: true,
    // maxlength: 250,
    trim: true
  },
  timeOfCreation: {
    type: Date,
    // required: true,
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
    enum: ['created', 'modified', 'published']
  },
  likes: {
    type: Number,
    default: 0
  },
  category: { type: Schema.Types.ObjectId, ref: 'category' },
  image: { type: Schema.Types.ObjectId, ref: 'image' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'comment' }],
  user: { type: Schema.Types.ObjectId, ref: 'user' }
});


const Article  = mongoose.model('article', articleSchema);
module.exports = Article;