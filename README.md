# HMS (Hospital Management System) Backend

This is the backend server for the HMS application. It provides APIs for patient and doctor management, appointments, specialties, and authentication.

## Prerequisites

- Node.js (>=18.0.0)
- MongoDB (local or Atlas)

## Setup

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your MongoDB connection string and other settings

## Running the Server

### Development Mode

```
npm run dev
```

This will start the server with nodemon for automatic reloading on file changes.

### Production Mode

```
npm start
```

## API Endpoints

### Authentication

- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `POST /api/doctors/login` - Doctor login
- `POST /api/doctors/register` - Doctor registration
- `POST /api/users/forgot-password` - Send OTP for password reset
- `POST /api/users/verify-otp` - Verify OTP and get reset token
- `POST /api/users/reset-password` - Reset password using token

### Users

- `GET /users/me` - Get current user profile
- `PUT /users/profile` - Update user profile
- `GET /users/:id` - Get user by ID
- `GET /users` - Get all users (admin)
- `DELETE /users/:id` - Delete user (deactivate)

### Doctors

- `GET /doctors` - Get all doctors
- `GET /doctors/me` - Get current doctor profile
- `GET /doctors/top-rated` - Get top rated doctors
- `GET /doctors/specialty/:specialty` - Get doctors by specialty
- `PUT /doctors/profile` - Update doctor profile
- `GET /doctors/:id` - Get doctor by ID

### Appointments

- `POST /appointments` - Create new appointment
- `GET /appointments` - Get all appointments (admin)
- `GET /appointments/patient` - Get patient's appointments
- `GET /appointments/doctor` - Get doctor's appointments
- `GET /appointments/:id` - Get appointment by ID
- `PUT /appointments/:id/status` - Update appointment status
- `PUT /appointments/:id/cancel` - Cancel appointment
- `PUT /appointments/:id/reschedule` - Reschedule appointment
- `POST /appointments/:id/feedback` - Add feedback to appointment

### Specialties

- `GET /specialties` - Get all specialties
- `GET /specialties/:id` - Get specialty by ID
- `POST /specialties` - Create new specialty (admin)
- `PUT /specialties/:id` - Update specialty (admin)
- `DELETE /specialties/:id` - Delete specialty (admin) 