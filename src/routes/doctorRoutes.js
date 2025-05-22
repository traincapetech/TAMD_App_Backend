const express = require('express');
const router = express.Router();
const { protect, doctorOnly } = require('../middlewares/authMiddleware');

// Import controller functions (we'll create these next)
const {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorsBySpecialty,
  getTopRatedDoctors,
  getCurrentDoctor
} = require('../controllers/doctorController');

// Routes
// GET /doctors - Get all doctors (public)
router.get('/', getAllDoctors);

// GET /doctors/me - Get current doctor profile
router.get('/me', protect, doctorOnly, getCurrentDoctor);

// GET /doctors/top-rated - Get top rated doctors
router.get('/top-rated', getTopRatedDoctors);

// GET /doctors/specialty/:specialty - Get doctors by specialty
router.get('/specialty/:specialty', getDoctorsBySpecialty);

// PUT /doctors/profile - Update doctor profile
router.put('/profile', protect, doctorOnly, updateDoctorProfile);

// GET /doctors/:id - Get doctor by ID
router.get('/:id', getDoctorById);

module.exports = router; 