const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

// Import controller functions (we'll create these next)
const {
  getAllSpecialties,
  getSpecialtyById,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty
} = require('../controllers/specialtyController');

// Routes
// GET /specialties - Get all specialties
router.get('/', getAllSpecialties);

// GET /specialties/:id - Get specialty by ID
router.get('/:id', getSpecialtyById);

// POST /specialties - Create new specialty (admin only)
router.post('/', protect, createSpecialty);

// PUT /specialties/:id - Update specialty (admin only)
router.put('/:id', protect, updateSpecialty);

// DELETE /specialties/:id - Delete specialty (admin only)
router.delete('/:id', protect, deleteSpecialty);

module.exports = router; 