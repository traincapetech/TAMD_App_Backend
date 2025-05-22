const Specialty = require('../models/Specialty');

// Get all specialties
const getAllSpecialties = async (req, res) => {
  try {
    // Get only active specialties if not specified otherwise
    const query = req.query.includeInactive === 'true' 
      ? {} 
      : { isActive: true };
    
    const specialties = await Specialty.find(query)
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: specialties.length,
      specialties
    });
  } catch (error) {
    console.error('Get all specialties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get specialty by ID
const getSpecialtyById = async (req, res) => {
  try {
    const specialty = await Specialty.findById(req.params.id);

    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'Specialty not found'
      });
    }

    res.status(200).json({
      success: true,
      specialty
    });
  } catch (error) {
    console.error('Get specialty by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new specialty
const createSpecialty = async (req, res) => {
  try {
    const { name, description, iconUrl, imageUrl, commonConditions } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and description'
      });
    }

    // Check if specialty already exists
    const existingSpecialty = await Specialty.findOne({ name });
    if (existingSpecialty) {
      return res.status(400).json({
        success: false,
        message: 'Specialty with this name already exists'
      });
    }

    // Create new specialty
    const specialty = await Specialty.create({
      name,
      description,
      iconUrl,
      imageUrl,
      commonConditions: commonConditions || []
    });

    res.status(201).json({
      success: true,
      specialty
    });
  } catch (error) {
    console.error('Create specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update specialty
const updateSpecialty = async (req, res) => {
  try {
    const {
      name,
      description,
      iconUrl,
      imageUrl,
      commonConditions,
      isActive
    } = req.body;

    // Find specialty
    const specialty = await Specialty.findById(req.params.id);

    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'Specialty not found'
      });
    }

    // Update fields if provided
    if (name) specialty.name = name;
    if (description) specialty.description = description;
    if (iconUrl !== undefined) specialty.iconUrl = iconUrl;
    if (imageUrl !== undefined) specialty.imageUrl = imageUrl;
    if (commonConditions) specialty.commonConditions = commonConditions;
    if (isActive !== undefined) specialty.isActive = isActive;

    // Save updated specialty
    const updatedSpecialty = await specialty.save();

    res.status(200).json({
      success: true,
      specialty: updatedSpecialty
    });
  } catch (error) {
    console.error('Update specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete specialty
const deleteSpecialty = async (req, res) => {
  try {
    const specialty = await Specialty.findById(req.params.id);

    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'Specialty not found'
      });
    }

    // Instead of actual deletion, mark as inactive
    specialty.isActive = false;
    await specialty.save();

    res.status(200).json({
      success: true,
      message: 'Specialty deactivated successfully'
    });
  } catch (error) {
    console.error('Delete specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllSpecialties,
  getSpecialtyById,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty
}; 