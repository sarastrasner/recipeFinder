const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const possibleNames = {
  blueberry: 'blueberry',
  strawberry: ['strawberry', 'strawberries'],
};

const performerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    enum: ['blueberry', 'strawberry'],
    required: true,
  },
  photo: { type: String, required: true },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Performer', performerSchema);
