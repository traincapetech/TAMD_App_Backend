const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  iconUrl: String,
  imageUrl: String,
  commonConditions: [{
    name: String,
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

const Specialty = mongoose.model('Specialty', specialtySchema);

module.exports = Specialty; 