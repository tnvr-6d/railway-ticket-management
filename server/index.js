const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', true); 

// Mount ALL routes under /api
const trainRoutes = require('./routes/train');
const ticketRoutes = require('./routes/tickets');
const scheduleRoutes = require('./routes/schedules');
const fareRoutes = require('./routes/fares');
const seatRoutes = require('./routes/seats');
const passengerRoutes = require('./routes/passenger');
const adminRoutes = require('./routes/admin');
const classRoutes = require('./routes/classes');
const stationRoutes = require('./routes/station'); 
const notificationRoutes = require('./routes/notification');
const feedbackRoutes = require('./routes/feedback');
const chatRoutes = require('./routes/chat');

// Unified API route prefix
app.use('/api/trains', trainRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/fares', fareRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/passenger', passengerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/classes', classRoutes);  
app.use('/api/stations', stationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/train', trainRoutes);

// Default 404 for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});