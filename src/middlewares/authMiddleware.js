const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');

      // Check if user is a doctor
      if (decoded.isDoctor) {
        // Find doctor by id
        const doctor = await Doctor.findById(decoded.id).select('-Password');
        if (!doctor) {
          return res.status(401).json({
            success: false,
            message: 'Not authorized, doctor not found'
          });
        }
        req.user = doctor;
        req.isDoctor = true;
      } else {
        // Find user by id
        const user = await User.findById(decoded.id).select('-Password');
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Not authorized, user not found'
          });
        }
        req.user = user;
        req.isDoctor = false;
      }

      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Middleware to ensure user is a doctor
const doctorOnly = (req, res, next) => {
  if (req.isDoctor) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Doctors only.'
    });
  }
};

// Middleware to ensure user is a patient
const patientOnly = (req, res, next) => {
  if (!req.isDoctor) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Patients only.'
    });
  }
};

module.exports = { protect, doctorOnly, patientOnly }; 