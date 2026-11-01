const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Built-in Middleware for CORS and JSON parsing
app.use(cors());
app.use(express.json());

// CUSTOM MIDDLEWARE 1: Request Logger (Module 4 Requirement)
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} request to ${req.url}`);
  next();
});

// In-Memory Data Store for Appointments
let appointments = [
  { id: 1, student: 'Maria Santos', department: 'College of Informatics', date: '2026-11-05', status: 'Confirmed' },
  { id: 2, student: 'Juan Dela Cruz', department: 'Registrar Office', date: '2026-11-06', status: 'Pending' }
];

// CUSTOM MIDDLEWARE 2: Server-Side Input Validation (Module 4 Requirement)
function validateAppointment(req, res, next) {
  const { student, department, date } = req.body;

  if (!student || !student.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Server Validation Error: Student Name is required.'
    });
  }

  if (student.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Server Validation Error: Student Name must be at least 3 characters long.'
    });
  }

  if (!department || !date) {
    return res.status(400).json({
      success: false,
      error: 'Server Validation Error: Department and Appointment Date are required.'
    });
  }

  next(); // Input is valid, proceed to the route handler
}

// ENDPOINT 1: GET /api/appointments - Retrieve all appointments
app.get('/api/appointments', (req, res) => {
  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// ENDPOINT 2: GET /api/appointments/:id - Retrieve a single appointment
app.get('/api/appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const appointment = appointments.find(a => a.id === id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      error: 'Appointment record not found.'
    });
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// ENDPOINT 3: POST /api/appointments - Create a new appointment (Uses validation middleware)
app.post('/api/appointments', validateAppointment, (req, res) => {
  const { student, department, date } = req.body;

  const newAppointment = {
    id: Date.now(),
    student: student.trim(),
    department,
    date,
    status: 'Pending'
  };

  appointments.push(newAppointment);

  res.status(201).json({
    success: true,
    message: 'Appointment successfully created on the server!',
    data: newAppointment
  });
});

// ENDPOINT 4: PATCH /api/appointments/:id/status - Toggle Pending/Confirmed status
app.patch('/api/appointments/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const appointment = appointments.find(a => a.id === id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      error: 'Appointment record not found.'
    });
  }

  appointment.status = appointment.status === 'Pending' ? 'Confirmed' : 'Pending';

  res.status(200).json({
    success: true,
    message: `Status updated to ${appointment.status}`,
    data: appointment
  });
});

// ENDPOINT 5: DELETE /api/appointments/:id - Delete an appointment
app.delete('/api/appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = appointments.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Appointment record not found.'
    });
  }

  const deleted = appointments.splice(index, 1);

  res.status(200).json({
    success: true,
    message: 'Appointment deleted from server.',
    data: deleted[0]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});