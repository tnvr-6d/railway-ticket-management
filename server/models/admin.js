const pool = require("../db");
const bcrypt = require("bcrypt");

const loginAdmin = async (email, password) => {
  const adminRes = await pool.query(
    "SELECT admin_id, username, email, password_hash FROM admin WHERE email = $1 AND is_active = TRUE",
    [email]
  );

  if (adminRes.rows.length === 0) {
    throw new Error("Admin with this email not found or account is inactive");
  }

  const admin = adminRes.rows[0];

  // Plain text comparison (for demo)
  const isMatch = password === admin.password_hash;

  if (!isMatch) {
    throw new Error("Invalid admin credentials.");
  }

  return {
    success: true,
    user: {
      admin_id: admin.admin_id,
      username: admin.username,
      email: admin.email,
    },
  };
};

// Schedule Management Functions
const getAllSchedules = async () => {
  const result = await pool.query(`
    SELECT 
      s.schedule_id,
      s.train_id,
      s.route_id,
      s.departure_time,
      s.arrival_time,
      s.departure_date,
      s.status,
      s.created_at,
      t.train_name,
      t.coach_number,
      t.class_type,
      r.distance,
      r.duration,
      src.station_name AS source,
      dest.station_name AS destination
    FROM schedule s
    LEFT JOIN train t ON s.train_id = t.train_id
    LEFT JOIN route r ON s.route_id = r.route_id
    LEFT JOIN station src ON r.source_station_id = src.station_id
    LEFT JOIN station dest ON r.destination_station_id = dest.station_id
    ORDER BY s.departure_date, s.departure_time;
  `);
  return result.rows;
};

const getScheduleById = async (scheduleId) => {
  const result = await pool.query(`
    SELECT 
      s.schedule_id,
      s.train_id,
      s.route_id,
      s.departure_time,
      s.arrival_time,
      s.departure_date,
      s.status,
      t.train_name,
      t.coach_number,
      t.class_type,
      r.distance,
      r.duration,
      src.station_name AS source,
      dest.station_name AS destination
    FROM schedule s
    LEFT JOIN train t ON s.train_id = t.train_id
    LEFT JOIN route r ON s.route_id = r.route_id
    LEFT JOIN station src ON r.source_station_id = src.station_id
    LEFT JOIN station dest ON r.destination_station_id = dest.station_id
    WHERE s.schedule_id = $1
  `, [scheduleId]);
  return result.rows[0];
};

const updateSchedule = async (scheduleId, scheduleData) => {
  const { train_id, route_id, departure_time, arrival_time, departure_date, status } = scheduleData;
  
  const result = await pool.query(`
    UPDATE schedule 
    SET train_id = $1, route_id = $2, departure_time = $3, arrival_time = $4, departure_date = $5, status = $6
    WHERE schedule_id = $7
    RETURNING *
  `, [train_id, route_id, departure_time, arrival_time, departure_date, status, scheduleId]);
  
  return result.rows[0];
};

const createSchedule = async (scheduleData) => {
  const { train_id, route_id, departure_time, arrival_time, departure_date, status = 'On Time' } = scheduleData;
  
  const result = await pool.query(`
    INSERT INTO schedule (train_id, route_id, departure_time, arrival_time, departure_date, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [train_id, route_id, departure_time, arrival_time, departure_date, status]);
  
  return result.rows[0];
};

const deleteSchedule = async (scheduleId) => {
  // First check if there are any tickets booked for this schedule
  const ticketsResult = await pool.query(`
    SELECT COUNT(*) as ticket_count FROM ticket WHERE schedule_id = $1 AND status = 'Booked'
  `, [scheduleId]);
  
  if (parseInt(ticketsResult.rows[0].ticket_count) > 0) {
    throw new Error("Cannot delete schedule with booked tickets");
  }
  
  // Delete seat inventory first
  await pool.query(`DELETE FROM seat_inventory WHERE schedule_id = $1`, [scheduleId]);
  
  // Then delete the schedule
  const result = await pool.query(`DELETE FROM schedule WHERE schedule_id = $1 RETURNING *`, [scheduleId]);
  return result.rows[0];
};

// Train Management Functions
const getAllTrains = async () => {
  const result = await pool.query(`
    SELECT 
      t.train_id,
      t.train_name,
      t.coach_number,
      t.class_type,
      t.total_seats,
      t.description,
      t.created_at,
      c.class_type as class_name
    FROM train t
    LEFT JOIN class c ON t.class_type = c.class_type
    ORDER BY t.train_id
  `);
  return result.rows;
};

const getTrainById = async (trainId) => {
  const result = await pool.query(`
    SELECT 
      t.train_id,
      t.train_name,
      t.coach_number,
      t.class_type,
      t.total_seats,
      t.description,
      t.created_at,
      c.class_type as class_name
    FROM train t
    LEFT JOIN class c ON t.class_type = c.class_type
    WHERE t.train_id = $1
  `, [trainId]);
  return result.rows[0];
};

const createTrain = async (trainData) => {
  const { train_name, coach_number, class_type, total_seats, description } = trainData;
  
  const result = await pool.query(`
    INSERT INTO train (train_name, coach_number, class_type, total_seats, description)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [train_name, coach_number, class_type, total_seats, description]);
  
  return result.rows[0];
};

const updateTrain = async (trainId, trainData) => {
  const { train_name, coach_number, class_type, total_seats, description } = trainData;
  
  const result = await pool.query(`
    UPDATE train 
    SET train_name = $1, coach_number = $2, class_type = $3, total_seats = $4, description = $5
    WHERE train_id = $6
    RETURNING *
  `, [train_name, coach_number, class_type, total_seats, description, trainId]);
  
  return result.rows[0];
};

const deleteTrain = async (trainId) => {
  // Check if train has any schedules
  const schedulesResult = await pool.query(`
    SELECT COUNT(*) as schedule_count FROM schedule WHERE train_id = $1
  `, [trainId]);
  
  if (parseInt(schedulesResult.rows[0].schedule_count) > 0) {
    throw new Error("Cannot delete train with existing schedules");
  }
  
  const result = await pool.query(`DELETE FROM train WHERE train_id = $1 RETURNING *`, [trainId]);
  return result.rows[0];
};

// Route and Station Management Functions
const getAllRoutes = async () => {
  const result = await pool.query(`
    SELECT 
      r.route_id,
      r.distance,
      r.duration,
      src.station_name AS source,
      dest.station_name AS destination,
      src.station_id AS source_id,
      dest.station_id AS destination_id
    FROM route r
    LEFT JOIN station src ON r.source_station_id = src.station_id
    LEFT JOIN station dest ON r.destination_station_id = dest.station_id
    ORDER BY r.route_id
  `);
  return result.rows;
};

const getAllStations = async () => {
  const result = await pool.query(`
    SELECT station_id, station_name, location, contact_info
    FROM station
    ORDER BY station_name
  `);
  return result.rows;
};

const getAllClasses = async () => {
  const result = await pool.query(`
    SELECT class_id, class_type
    FROM class
    ORDER BY class_type
  `);
  return result.rows;
};

const getAllCoaches = async () => {
  const result = await pool.query(`
    SELECT coach_id, coach_number
    FROM coach
    ORDER BY coach_number
  `);
  return result.rows;
};

// Seat Inventory Management
const createSeatInventory = async (scheduleId, trainData) => {
  const { coach_number, class_type, total_seats } = trainData;
  
  // Generate seat numbers based on total seats
  const seats = [];
  const rows = Math.ceil(total_seats / 4); // Assuming 4 seats per row
  
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= 4; col++) {
      if (seats.length < total_seats) {
        const seatNumber = `${String.fromCharCode(64 + row)}${col}`; // A1, A2, A3, A4, B1, etc.
        seats.push({
          schedule_id: scheduleId,
          seat_number: seatNumber,
          coach_number: coach_number,
          class_type: class_type,
          is_available: true,
          row_number: row,
          column_number: col
        });
      }
    }
  }
  
  // Insert all seats
  for (const seat of seats) {
    await pool.query(`
      INSERT INTO seat_inventory (schedule_id, seat_number, coach_number, class_type, is_available, row_number, column_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [seat.schedule_id, seat.seat_number, seat.coach_number, seat.class_type, seat.is_available, seat.row_number, seat.column_number]);
  }
  
  return seats.length;
};

// New seat inventory management functions
const getSeatInventoryBySchedule = async (scheduleId) => {
  const result = await pool.query(`
    SELECT 
      inventory_id,
      schedule_id,
      seat_number,
      coach_number,
      class_type,
      is_available,
      row_number,
      column_number
    FROM seat_inventory 
    WHERE schedule_id = $1
    ORDER BY row_number, column_number
  `, [scheduleId]);
  return result.rows;
};

const getSeatInventoryByTrain = async (trainId) => {
  const result = await pool.query(`
    SELECT 
      si.inventory_id,
      si.schedule_id,
      si.seat_number,
      si.coach_number,
      si.class_type,
      si.is_available,
      si.row_number,
      si.column_number,
      s.departure_date,
      s.departure_time,
      t.train_name
    FROM seat_inventory si
    JOIN schedule s ON si.schedule_id = s.schedule_id
    JOIN train t ON s.train_id = t.train_id
    WHERE s.train_id = $1
    ORDER BY s.departure_date, s.departure_time, si.row_number, si.column_number
  `, [trainId]);
  return result.rows;
};

const addSeatToSchedule = async (scheduleId, seatData) => {
  const { seat_number, coach_number, class_type, row_number, column_number } = seatData;
  
  const result = await pool.query(`
    INSERT INTO seat_inventory (schedule_id, seat_number, coach_number, class_type, is_available, row_number, column_number)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [scheduleId, seat_number, coach_number, class_type, true, row_number, column_number]);
  
  return result.rows[0];
};

const updateSeatAvailability = async (inventoryId, isAvailable) => {
  const result = await pool.query(`
    UPDATE seat_inventory 
    SET is_available = $1
    WHERE inventory_id = $2
    RETURNING *
  `, [isAvailable, inventoryId]);
  
  return result.rows[0];
};

const deleteSeat = async (inventoryId) => {
  // Check if seat is booked
  const bookingCheck = await pool.query(`
    SELECT COUNT(*) as booking_count 
    FROM ticket 
    WHERE schedule_id = (SELECT schedule_id FROM seat_inventory WHERE inventory_id = $1)
    AND seat_number = (SELECT seat_number FROM seat_inventory WHERE inventory_id = $1)
    AND status = 'Booked'
  `, [inventoryId]);
  
  if (parseInt(bookingCheck.rows[0].booking_count) > 0) {
    throw new Error("Cannot delete seat that is currently booked");
  }
  
  const result = await pool.query(`
    DELETE FROM seat_inventory 
    WHERE inventory_id = $1
    RETURNING *
  `, [inventoryId]);
  
  return result.rows[0];
};

const getScheduleByTrain = async (trainId) => {
  const result = await pool.query(`
    SELECT 
      s.schedule_id,
      s.departure_date,
      s.departure_time,
      s.arrival_time,
      s.status,
      t.train_name,
      src.station_name AS source,
      dest.station_name AS destination
    FROM schedule s
    JOIN train t ON s.train_id = t.train_id
    JOIN route r ON s.route_id = r.route_id
    JOIN station src ON r.source_station_id = src.station_id
    JOIN station dest ON r.destination_station_id = dest.station_id
    WHERE s.train_id = $1
    ORDER BY s.departure_date, s.departure_time
  `, [trainId]);
  return result.rows;
};

module.exports = {
  loginAdmin,
  // Schedule Management
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  createSchedule,
  deleteSchedule,
  // Train Management
  getAllTrains,
  getTrainById,
  createTrain,
  updateTrain,
  deleteTrain,
  // Route and Station Management
  getAllRoutes,
  getAllStations,
  getAllClasses,
  getAllCoaches,
  // Seat Inventory Management
  createSeatInventory,
  getSeatInventoryBySchedule,
  getSeatInventoryByTrain,
  addSeatToSchedule,
  updateSeatAvailability,
  deleteSeat,
  getScheduleByTrain,
};