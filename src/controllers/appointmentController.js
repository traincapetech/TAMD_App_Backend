const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      reasonForVisit,
      symptoms
    } = req.body;

    // Validate required fields
    if (!doctorId || !appointmentDate || !appointmentTime || !appointmentType || !reasonForVisit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Create new appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      reasonForVisit,
      symptoms: symptoms || [],
      paymentAmount: doctor.ConsultationFee || 0,
      status: 'scheduled'
    });

    res.status(201).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', '-Password')
      .populate('doctorId', '-Password');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized to view this appointment
    // Doctor can see their appointments, patient can see their appointments
    const isDoctor = req.isDoctor;
    const userId = req.user._id.toString();
    const appointmentDoctorId = appointment.doctorId._id.toString();
    const appointmentPatientId = appointment.patientId._id.toString();

    if ((isDoctor && userId !== appointmentDoctorId) || 
        (!isDoctor && userId !== appointmentPatientId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all appointments (admin)
const getAllAppointments = async (req, res) => {
  try {
    // Basic pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query with filters if provided
    let query = {};
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(req.query.date);
      endDate.setHours(23, 59, 59, 999);
      
      query.appointmentDate = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // Count total appointments for pagination
    const total = await Appointment.countDocuments(query);
    
    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .populate('patientId', 'FirstName LastName Email')
      .populate('doctorId', 'Name Email Specialty')
      .sort({ appointmentDate: -1, appointmentTime: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      appointments
    });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get patient appointments
const getPatientAppointments = async (req, res) => {
  try {
    // Basic pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { patientId: req.user._id };
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Count total appointments for pagination
    const total = await Appointment.countDocuments(query);
    
    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .populate('doctorId', 'Name Specialty ProfileImage ConsultationFee')
      .sort({ appointmentDate: -1, appointmentTime: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      appointments
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get doctor appointments
const getDoctorAppointments = async (req, res) => {
  try {
    // Basic pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { doctorId: req.user._id };
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(req.query.date);
      endDate.setHours(23, 59, 59, 999);
      
      query.appointmentDate = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // Count total appointments for pagination
    const total = await Appointment.countDocuments(query);
    
    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .populate('patientId', 'FirstName LastName Email PhoneNumber Gender DateOfBirth ProfileImage')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      appointments
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }
    
    // Validate status
    const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is authorized to update this appointment
    // Doctor can update their appointments, patient can update their appointments
    const isDoctor = req.isDoctor;
    const userId = req.user._id.toString();
    const appointmentDoctorId = appointment.doctorId.toString();
    const appointmentPatientId = appointment.patientId.toString();
    
    if ((isDoctor && userId !== appointmentDoctorId) || 
        (!isDoctor && userId !== appointmentPatientId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }
    
    // Update status
    appointment.status = status;
    
    // If cancelled, add cancellation reason and who cancelled
    if (status === 'cancelled' && req.body.cancellationReason) {
      appointment.isCancelled = true;
      appointment.cancellationReason = req.body.cancellationReason;
      appointment.cancelledBy = isDoctor ? 'doctor' : 'patient';
    }
    
    // Save updated appointment
    const updatedAppointment = await appointment.save();
    
    res.status(200).json({
      success: true,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    
    if (!cancellationReason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a cancellation reason'
      });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is authorized to cancel this appointment
    const isDoctor = req.isDoctor;
    const userId = req.user._id.toString();
    const appointmentDoctorId = appointment.doctorId.toString();
    const appointmentPatientId = appointment.patientId.toString();
    
    if ((isDoctor && userId !== appointmentDoctorId) || 
        (!isDoctor && userId !== appointmentPatientId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }
    
    // Update appointment
    appointment.status = 'cancelled';
    appointment.isCancelled = true;
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledBy = isDoctor ? 'doctor' : 'patient';
    
    // Save updated appointment
    const updatedAppointment = await appointment.save();
    
    res.status(200).json({
      success: true,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reschedule appointment
const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    
    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new date and time'
      });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is authorized to reschedule this appointment
    const isDoctor = req.isDoctor;
    const userId = req.user._id.toString();
    const appointmentDoctorId = appointment.doctorId.toString();
    const appointmentPatientId = appointment.patientId.toString();
    
    if ((isDoctor && userId !== appointmentDoctorId) || 
        (!isDoctor && userId !== appointmentPatientId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this appointment'
      });
    }
    
    // Update appointment
    appointment.previousAppointmentDate = appointment.appointmentDate;
    appointment.appointmentDate = appointmentDate;
    appointment.appointmentTime = appointmentTime;
    appointment.isRescheduled = true;
    appointment.status = 'scheduled';
    
    // Save updated appointment
    const updatedAppointment = await appointment.save();
    
    res.status(200).json({
      success: true,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add feedback to completed appointment
const addAppointmentFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating'
      });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is the patient for this appointment
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add feedback to this appointment'
      });
    }
    
    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only add feedback to completed appointments'
      });
    }
    
    // Add feedback
    appointment.feedback = {
      rating,
      comment: comment || '',
      submittedAt: Date.now()
    };
    
    // Save updated appointment
    const updatedAppointment = await appointment.save();
    
    // Update doctor's rating
    if (rating) {
      const doctor = await Doctor.findById(appointment.doctorId);
      
      if (doctor) {
        // Add review to doctor
        doctor.Reviews.push({
          PatientId: req.user._id,
          Rating: rating,
          Comment: comment || '',
          Date: Date.now()
        });
        
        // Calculate new average rating
        const totalRatings = doctor.Reviews.reduce((sum, review) => sum + review.Rating, 0);
        doctor.Rating = totalRatings / doctor.Reviews.length;
        
        await doctor.save();
      }
    }
    
    res.status(200).json({
      success: true,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Add appointment feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createAppointment,
  getAppointmentById,
  updateAppointmentStatus,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  cancelAppointment,
  rescheduleAppointment,
  addAppointmentFeedback
}; 