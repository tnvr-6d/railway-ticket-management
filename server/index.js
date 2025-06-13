const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const trainRoutes = require('./routes/train');
const ticketRoutes = require('./routes/tickets'); 
const scheduleRoutes = require('./routes/schedules');
app.use('/schedules', scheduleRoutes);
const fareRoutes = require('./routes/fares');
app.use('/fares', fareRoutes);
const seatRoutes = require('./routes/seats');
app.use('/seats', seatRoutes);


// ✅ Add this

app.use('/api/trains', trainRoutes);
app.use('/tickets', ticketRoutes); // ✅ Add this

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
