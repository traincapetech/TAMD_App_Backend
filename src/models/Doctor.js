const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    trim: true
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  Password: {
    type: String,
    required: true
  },
  PhoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  Specialty: {
    type: String,
    required: true
  },
  Qualifications: [{
    Degree: String,
    Institution: String,
    Year: Number
  }],
  Experience: {
    type: Number, // Years of experience
    default: 0
  },
  PracticeLocations: [{
    Hospital: String,
    Address: {
      Street: String,
      City: String,
      State: String,
      ZipCode: String,
      Country: String
    },
    AvailabilitySchedule: {
      Monday: [{ start: String, end: String }],
      Tuesday: [{ start: String, end: String }],
      Wednesday: [{ start: String, end: String }],
      Thursday: [{ start: String, end: String }],
      Friday: [{ start: String, end: String }],
      Saturday: [{ start: String, end: String }],
      Sunday: [{ start: String, end: String }]
    }
  }],
  LicenseNumber: {
    type: String,
    required: true
  },
  AboutMe: {
    type: String
  },
  Services: [String],
  Languages: [String],
  ConsultationFee: {
    type: Number,
    default: 0
  },
  Rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  Reviews: [{
    PatientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    Rating: Number,
    Comment: String,
    Date: {
      type: Date,
      default: Date.now
    }
  }],
  ProfileImage: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { 
  timestamps: true 
});

// Pre-save hook to hash password
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('Password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
doctorSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.Password);
};

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor; 