const express = require('express');
const router = express.Router();
const { protect, patientOnly } = require('../middlewares/authMiddleware');

// Import controller functions (we'll create these next)
const {
  getCurrentUser,
  updateUserProfile,
  getUserById,
  getAllUsers,
  deleteUser
} = require('../controllers/userController');

// Routes
// GET /users/me - Get current user
router.get('/me', protect, getCurrentUser);

// PUT /users/profile - Update user profile
router.put('/profile', protect, patientOnly, updateUserProfile);

// GET /users/:id - Get user by ID (protected)
router.get('/:id', protect, getUserById);

// GET /users - Get all users (admin route, we would add admin middleware later)
router.get('/', protect, getAllUsers);

// DELETE /users/:id - Delete user
router.delete('/:id', protect, deleteUser);

// POST /login and /register are in authRoutes.js

module.exports = router; 