const express = require('express');
const {
  userLogin,
  doctorLogin,
  registerUser,
  registerDoctor,
  forgotPassword,
  verifyOtp,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

// User routes
router.post('/users/login', userLogin);
router.post('/users/register', registerUser);

// Doctor routes
router.post('/doctors/login', doctorLogin);
router.post('/doctors/register', registerDoctor);

// Password reset routes
router.post('/users/forgot-password', forgotPassword);
router.post('/users/verify-otp', verifyOtp);
router.post('/users/reset-password', resetPassword);

module.exports = router; 