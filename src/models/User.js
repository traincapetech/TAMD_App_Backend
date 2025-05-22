const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    required: true,
    trim: true
  },
  LastName: {
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
    trim: true
  },
  DateOfBirth: {
    type: Date
  },
  Gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  Address: {
    Street: String,
    City: String,
    State: String,
    ZipCode: String,
    Country: String
  },
  MedicalHistory: [{
    Condition: String,
    Diagnosis: String,
    Treatment: String,
    DiagnosisDate: Date
  }],
  Allergies: [String],
  Medications: [{
    Name: String,
    Dosage: String,
    Frequency: String,
    StartDate: Date,
    EndDate: Date
  }],
  InsuranceInfo: {
    Provider: String,
    PolicyNumber: String,
    GroupNumber: String,
    ExpiryDate: Date
  },
  EmergencyContact: {
    Name: String,
    Relationship: String,
    PhoneNumber: String
  },
  ProfileImage: String,
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  otpCode: String,
  otpExpires: Date
}, { 
  timestamps: true 
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
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
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.Password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 