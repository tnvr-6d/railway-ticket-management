const adminModel = require('../models/admin');

const login = async (req, res) => {
    // Now expects 'email' instead of 'username'
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const result = await adminModel.loginAdmin(email, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};

// Schedule Management Controllers
const getAllSchedules = async (req, res) => {
    try {
        const schedules = await adminModel.getAllSchedules();
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getScheduleById = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await adminModel.getScheduleById(id);
        
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }
        
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createSchedule = async (req, res) => {
    try {
        const { train_id, route_id, departure_time, arrival_time, departure_date, status, coach_id } = req.body;
        
        if (!train_id || !route_id || !departure_time || !arrival_time || !departure_date || !coach_id) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }
        
        // Get train data for seat inventory creation
        const train = await adminModel.getTrainById(train_id);
        if (!train) {
            return res.status(404).json({ success: false, message: "Train not found" });
        }
        
        const schedule = await adminModel.createSchedule({
            train_id, route_id, departure_time, arrival_time, departure_date, status
        });
        
        // Create seat inventory for the new schedule with coach_id
        await adminModel.createSeatInventory(schedule.schedule_id, { total_seats: train.total_seats, coach_id });
        
        res.status(201).json({ success: true, schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { train_id, route_id, departure_time, arrival_time, departure_date, status } = req.body;
        
        if (!train_id || !route_id || !departure_time || !arrival_time || !departure_date) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }
        
        const schedule = await adminModel.updateSchedule(id, {
            train_id, route_id, departure_time, arrival_time, departure_date, status
        });
        
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }
        
        res.json({ success: true, schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await adminModel.deleteSchedule(id);
        
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }
        
        res.json({ success: true, message: "Schedule deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Train Management Controllers
const getAllTrains = async (req, res) => {
    try {
        const trains = await adminModel.getAllTrains();
        res.json(trains);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getTrainById = async (req, res) => {
    try {
        const { id } = req.params;
        const train = await adminModel.getTrainById(id);
        
        if (!train) {
            return res.status(404).json({ success: false, message: "Train not found" });
        }
        
        res.json(train);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createTrain = async (req, res) => {
    try {
        const { train_name, total_seats, description } = req.body;
        
        if (!train_name || !total_seats) {
            return res.status(400).json({ success: false, message: "Train name and total seats are required" });
        }
        
        const train = await adminModel.createTrain({
            train_name, total_seats, description
        });
        
        res.status(201).json({ success: true, train });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTrain = async (req, res) => {
    try {
        const { id } = req.params;
        const { train_name, total_seats, description } = req.body;
        
        if (!train_name || !total_seats) {
            return res.status(400).json({ success: false, message: "Train name and total seats are required" });
        }
        
        const train = await adminModel.updateTrain(id, {
            train_name, total_seats, description
        });
        
        if (!train) {
            return res.status(404).json({ success: false, message: "Train not found" });
        }
        
        res.json({ success: true, train });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTrain = async (req, res) => {
    try {
        const { id } = req.params;
        const train = await adminModel.deleteTrain(id);
        
        if (!train) {
            return res.status(404).json({ success: false, message: "Train not found" });
        }
        
        res.json({ success: true, message: "Train deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Route and Station Management Controllers
const getAllRoutes = async (req, res) => {
    try {
        const routes = await adminModel.getAllRoutes();
        res.json(routes);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllStations = async (req, res) => {
    try {
        const stations = await adminModel.getAllStations();
        res.json(stations);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllClasses = async (req, res) => {
    try {
        const classes = await adminModel.getAllClasses();
        res.json(classes);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllCoaches = async (req, res) => {
    try {
        const coaches = await adminModel.getAllCoaches();
        res.json(coaches);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Seat Inventory Management Controllers
const getSeatInventoryByTrain = async (req, res) => {
    try {
        const { trainId } = req.params;
        const seats = await adminModel.getSeatInventoryByTrain(trainId);
        res.json(seats);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSeatInventoryBySchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const seats = await adminModel.getSeatInventoryBySchedule(scheduleId);
        res.json(seats);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addSeatToSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { seat_number, coach_id, row_number, column_number } = req.body;
        
        if (!seat_number || !coach_id || !row_number || !column_number) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }
        
        const seat = await adminModel.addSeatToSchedule(scheduleId, {
            seat_number, coach_id, row_number, column_number
        });
        
        res.status(201).json({ success: true, seat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const bulkAddSeatsToSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { coach_id, total_seats, seats_per_row } = req.body;
        
        if (!coach_id || !total_seats || !seats_per_row) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }
        
        if (total_seats > 100) {
            return res.status(400).json({ success: false, message: "Maximum 100 seats allowed per bulk operation" });
        }
        
        const seats = await adminModel.bulkAddSeatsToSchedule(scheduleId, {
            coach_id, total_seats, seats_per_row
        });
        
        res.status(201).json({ success: true, seats, count: seats.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSeatAvailability = async (req, res) => {
    try {
        const { inventoryId } = req.params;
        const { is_available } = req.body;
        
        const seat = await adminModel.updateSeatAvailability(inventoryId, is_available);
        
        if (!seat) {
            return res.status(404).json({ success: false, message: "Seat not found" });
        }
        
        res.json({ success: true, seat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteSeat = async (req, res) => {
    try {
        const { inventoryId } = req.params;
        const seat = await adminModel.deleteSeat(inventoryId);
        
        if (!seat) {
            return res.status(404).json({ success: false, message: "Seat not found" });
        }
        
        res.json({ success: true, message: "Seat deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getScheduleByTrain = async (req, res) => {
    try {
        const { trainId } = req.params;
        const schedules = await adminModel.getScheduleByTrain(trainId);
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    login,
    // Schedule Management
    getAllSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
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
    getSeatInventoryByTrain,
    getSeatInventoryBySchedule,
    addSeatToSchedule,
    bulkAddSeatsToSchedule,
    updateSeatAvailability,
    deleteSeat,
    getScheduleByTrain,
};