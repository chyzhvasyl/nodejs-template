let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let noteSchema = new Schema({
  title: {
      type: String,
      default: "Note one",
      required: true
  },
  body: {
    type: String,
    default: "Thi's note",
    required: true
  },
});


let Note = module.exports = mongoose.model('Note', noteSchema);