const User = require('../models/User');

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req from auth middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-Password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    // Basic pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total users for pagination
    const total = await User.countDocuments();
    
    // Query with filters if provided
    let query = {};
    
    if (req.query.name) {
      const nameRegex = new RegExp(req.query.name, 'i');
      query.$or = [
        { FirstName: nameRegex },
        { LastName: nameRegex }
      ];
    }
    
    if (req.query.email) {
      query.Email = new RegExp(req.query.email, 'i');
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-Password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Return users with pagination info
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'FirstName', 'LastName', 'PhoneNumber', 'DateOfBirth', 
      'Gender', 'Address', 'MedicalHistory', 'Allergies', 
      'Medications', 'InsuranceInfo', 'EmergencyContact', 
      'ProfileImage'
    ];

    // Update only allowed fields
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    }

    // Save updated user
    const updatedUser = await user.save();
    
    // Remove sensitive information
    const userResponse = updatedUser.toObject();
    delete userResponse.Password;

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete user (account deactivation)
const deleteUser = async (req, res) => {
  try {
    // Check if user is authorized to delete
    // Only allow users to delete their own account or admin
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Instead of actual deletion, mark as inactive
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getCurrentUser,
  getUserById,
  getAllUsers,
  updateUserProfile,
  deleteUser
}; 