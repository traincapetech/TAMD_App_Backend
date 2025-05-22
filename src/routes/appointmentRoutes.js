const express = require('express');
const router = express.Router();
const { protect, doctorOnly, patientOnly } = require('../middlewares/authMiddleware');

// Import controller functions (we'll create these next)
const {
  createAppointment,
  getAppointmentById,
  updateAppointmentStatus,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  cancelAppointment,
  rescheduleAppointment,
  addAppointmentFeedback
} = require('../controllers/appointmentController');

// Routes
// POST /appointments - Create new appointment
router.post('/', protect, patientOnly, createAppointment);

// GET /appointments - Get all appointments (admin)
router.get('/', protect, getAllAppointments);

// GET /appointments/patient - Get current patient's appointments
router.get('/patient', protect, patientOnly, getPatientAppointments);

// GET /appointments/doctor - Get current doctor's appointments
router.get('/doctor', protect, doctorOnly, getDoctorAppointments);

// GET /appointments/:id - Get appointment by ID
router.get('/:id', protect, getAppointmentById);

// PUT /appointments/:id/status - Update appointment status
router.put('/:id/status', protect, updateAppointmentStatus);

// PUT /appointments/:id/cancel - Cancel appointment
router.put('/:id/cancel', protect, cancelAppointment);

// PUT /appointments/:id/reschedule - Reschedule appointment
router.put('/:id/reschedule', protect, rescheduleAppointment);

// POST /appointments/:id/feedback - Add feedback to completed appointment
router.post('/:id/feedback', protect, patientOnly, addAppointmentFeedback);

module.exports = router; 