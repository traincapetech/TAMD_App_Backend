const Doctor = require('../models/Doctor');

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    // Basic pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query with filters if provided
    let query = { isActive: true };
    
    if (req.query.name) {
      query.Name = { $regex: req.query.name, $options: 'i' };
    }
    
    if (req.query.specialty) {
      query.Specialty = { $regex: req.query.specialty, $options: 'i' };
    }
    
    if (req.query.location) {
      query['PracticeLocations.Address.City'] = { $regex: req.query.location, $options: 'i' };
    }
    
    if (req.query.minRating) {
      query.Rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Count total doctors for pagination
    const total = await Doctor.countDocuments(query);
    
    // Get doctors with pagination
    const doctors = await Doctor.find(query)
      .select('-Password')
      .skip(skip)
      .limit(limit)
      .sort({ Rating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      doctors
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-Password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current doctor profile
const getCurrentDoctor = async (req, res) => {
  try {
    // Doctor is already attached to req from auth middleware
    res.status(200).json({
      success: true,
      doctor: req.user
    });
  } catch (error) {
    console.error('Get current doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user._id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'Name', 'PhoneNumber', 'Specialty', 'Qualifications', 
      'Experience', 'PracticeLocations', 'AboutMe', 
      'Services', 'Languages', 'ConsultationFee', 'ProfileImage'
    ];

    // Update only allowed fields
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    }

    // Save updated doctor
    const updatedDoctor = await doctor.save();
    
    // Remove sensitive information
    const doctorResponse = updatedDoctor.toObject();
    delete doctorResponse.Password;

    res.status(200).json({
      success: true,
      doctor: doctorResponse
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get doctors by specialty
const getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    
    // Build query
    let query = { 
      isActive: true,
      Specialty: { $regex: specialty, $options: 'i' }
    };
    
    // Basic pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Count total doctors for pagination
    const total = await Doctor.countDocuments(query);
    
    // Get doctors with pagination
    const doctors = await Doctor.find(query)
      .select('-Password')
      .skip(skip)
      .limit(limit)
      .sort({ Rating: -1, Experience: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      doctors
    });
  } catch (error) {
    console.error('Get doctors by specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get top rated doctors
const getTopRatedDoctors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const doctors = await Doctor.find({ isActive: true })
      .select('-Password')
      .sort({ Rating: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Get top rated doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorsBySpecialty,
  getTopRatedDoctors,
  getCurrentDoctor
}; 